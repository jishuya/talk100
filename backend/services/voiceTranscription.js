const AUDIO_TYPES = {
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/mpeg': 'mp3'
};

const fail = (status, message) => Object.assign(new Error(message), { status });

function createTranscriber({ env = process.env, fetchImpl = fetch } = {}) {
  return async (file, { signal } = {}) => {
    if (!env.OPENAI_API_KEY) throw fail(503, '서버 음성인식 설정이 필요합니다. 키보드 입력을 이용해주세요.');
    const type = file?.mimetype?.split(';')[0].toLowerCase();
    if (!file?.buffer?.length || !AUDIO_TYPES[type]) {
      throw fail(400, '지원하는 녹음 파일이 필요합니다.');
    }
    const form = new FormData();
    form.append('file', new Blob([file.buffer], { type }), `answer.${AUDIO_TYPES[type]}`);
    form.append('model', env.VOICE_TRANSCRIPTION_MODEL || 'gpt-4o-mini-transcribe');
    form.append('language', 'en');
    form.append('response_format', 'json');
    // Never send the expected quiz answer as a prompt: it can bias grading.
    let response;
    try {
      response = await fetchImpl('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
        body: form,
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(30000)]) : AbortSignal.timeout(30000)
      });
    } catch {
      throw fail(504, '음성인식 연결이 지연되고 있습니다. 다시 시도해주세요.');
    }
    if (!response.ok) {
      // Do not expose provider responses, configuration or credentials to clients.
      throw fail(response.status === 429 ? 429 : 502, '음성을 텍스트로 바꾸지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
    const result = await response.json();
    if (typeof result.text !== 'string') throw fail(502, '음성인식 결과를 확인할 수 없습니다.');
    return result.text.trim();
  };
}

module.exports = { AUDIO_TYPES, createTranscriber };
