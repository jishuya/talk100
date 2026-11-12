const express = require('express');
const multer = require('multer');
const { AUDIO_TYPES, createTranscriber } = require('../services/voiceTranscription');

function createVoiceRouter({ authenticate, transcribe = createTranscriber(), now = Date.now } = {}) {
  const router = express.Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
    fileFilter(req, file, done) {
      const type = file.mimetype.split(';')[0].toLowerCase();
      done(AUDIO_TYPES[type] ? null : Object.assign(new Error('지원하지 않는 녹음 형식입니다.'), { status: 415 }), Boolean(AUDIO_TYPES[type]));
    }
  }).single('audio');
  // Bound costs and memory per authenticated account. Limits are per server process.
  const attempts = new Map();
  router.post('/transcribe', authenticate, (req, res, next) => {
    const time = now();
    for (const [id, entry] of attempts) {
      if (entry.expires <= time) attempts.delete(id);
    }
    const id = req.user.uid;
    const entry = attempts.get(id) || { count: 0, expires: time + 60000, busy: false };
    if (entry.busy || entry.count >= 20) {
      return res.status(429).json({ message: '잠시 후 다시 녹음해주세요.' });
    }
    entry.count++;
    entry.busy = true;
    attempts.set(id, entry);
    res.once('close', () => { entry.busy = false; });
    next();
  }, (req, res, next) => {
    upload(req, res, error => {
      if (!error) return next();
      res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : error.status || 400)
        .json({ message: error.code === 'LIMIT_FILE_SIZE' ? '녹음 파일이 너무 큽니다. 짧게 다시 녹음해주세요.' : '녹음 파일 형식을 확인해주세요.' });
    });
  }, async (req, res) => {
    if (!req.file) return res.status(400).json({ message: '녹음 파일이 필요합니다.' });
    const controller = new AbortController();
    const disconnect = () => { if (!res.writableEnded) controller.abort(); };
    res.once('close', disconnect);
    res.set('Cache-Control', 'no-store');
    try {
      const text = await transcribe(req.file, { signal: controller.signal });
      if (!res.destroyed) res.json({ text });
    } catch (error) {
      if (!res.destroyed) res.status(error.status || 502).json({ message: error.status ? error.message : '음성인식에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      res.off('close', disconnect);
      // multer uses memory storage; audio is never written to disk or the database.
      req.file.buffer = null;
    }
  });
  return router;
}

module.exports = { createVoiceRouter };
