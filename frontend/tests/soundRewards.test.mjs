import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('rewards respect priority, settings and recording suppression', async () => {
  globalThis.localStorage = { getItem: () => null, setItem() {} };
  const audios = [];
  globalThis.Audio = class {
    constructor(src) { this.src = src; this.dataset = {}; this.paused = true; this.plays = 0; audios.push(this); }
    play() { this.paused = false; this.plays++; return Promise.resolve(); }
    pause() { this.paused = true; }
  };
  const source = fs.readFileSync(new URL('../src/utils/soundEffects.js', import.meta.url), 'utf8')
    .replace("import quizStartUrl from '../assets/sounds/quiz-start.mp3';", "const quizStartUrl = 'https://ui.example.test/assets/quiz-start.mp3';")
    .replace("import { ENV } from '../config/environment';", "const ENV = { API_BASE_URL: 'https://example.test' };");
  const effects = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  effects.preloadEffectSounds();
  for (const audio of audios) {
    const path = new URL(audio.src).pathname;
    const location = path.startsWith('/assets/')
      ? new URL('../src/assets/sounds/quiz-start.mp3', import.meta.url)
      : new URL(`../../backend/public${path}`, import.meta.url);
    assert.ok(fs.existsSync(location), path);
  }
  const audioFor = name => audios.find(a => a.src.endsWith(name));
  effects.playEffectSound('quizStart');
  const start = audioFor('quiz-start.mp3');
  assert.equal(new URL(start.src).host, 'ui.example.test');
  assert.equal(start.plays, 1);
  effects.playEffectSound('click');
  assert.equal(start.paused, false);
  effects.playEffectSound('streak3');
  assert.equal(audioFor('streak-3.wav').plays, 1);
  effects.playEffectSound('dayComplete');
  assert.equal(audioFor('streak-3.wav').paused, true);
  assert.equal(audioFor('day-complete.wav').plays, 1);
  effects.playEffectSound('celebrate');
  assert.equal(audioFor('day-complete.wav').paused, true);
  effects.playEffectSound('dayComplete');
  assert.equal(audioFor('day-complete.wav').plays, 1);
  effects.setEffectRecording(true);
  assert.equal(audioFor('celebrate.mp3').paused, true);
  effects.playEffectSound('celebrate');
  assert.equal(audioFor('celebrate.mp3').plays, 1);
  effects.playEffectSound('recordingStop');
  assert.equal(audioFor('click_001.wav').plays, 1);
  effects.setEffectRecording(false);
  effects.playEffectSound('recordingStart');
  effects.setEffectRecording(true);
  assert.equal(audioFor('pluck_001.wav').plays, 1);
  assert.equal(audioFor('pluck_001.wav').paused, false);
  effects.setEffectRecording(false);
  effects.updateSoundSettings({ enabled: false });
  effects.playEffectSound('celebrate');
  effects.playEffectSound('recordingStart');
  effects.playEffectSound('recordingStop');
  assert.equal(audioFor('pluck_001.wav').plays, 1);
  assert.equal(audioFor('click_001.wav').plays, 1);
  assert.equal(audioFor('celebrate.mp3').plays, 1);
  effects.updateSoundSettings({ enabled: true, volume: 0.2 });
  effects.playEffectSound('celebrate');
  assert.equal(audioFor('celebrate.mp3').volume, 0.2);
});
