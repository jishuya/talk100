import { ENV } from '../config/environment';

export const transcribeRecording = async (blob, signal) => {
  const form = new FormData();
  const type = blob.type.split(';')[0];
  const extension = type === 'audio/mp4' ? 'mp4' : type === 'audio/ogg' ? 'ogg' : 'webm';
  form.append('audio', blob, `answer.${extension}`);
  const token = localStorage.getItem('jwt_token');
  const response = await fetch(`${ENV.API_BASE_URL}/api/voice/transcribe`, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
    signal: AbortSignal.any([signal, AbortSignal.timeout(35000)])
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || '음성인식에 실패했습니다. 다시 시도해주세요.');
  if (typeof result.text !== 'string') throw new Error('음성인식 결과를 확인할 수 없습니다.');
  return result.text;
};
