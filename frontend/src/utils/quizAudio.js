export const getQuizAudioError = (error, mediaError) => {
  if (error?.name === 'AbortError' || mediaError?.code === 1) return null;
  if (error?.name === 'NotAllowedError') return '자동재생이 차단됐어요. 다시 듣기를 눌러주세요.';
  if (mediaError?.code === 2) return '음원 연결이 끊겼어요. 다시 시도해주세요.';
  if (mediaError?.code === 3) return '음원을 읽을 수 없어요.';
  if (mediaError?.code === 4 || error?.name === 'NotSupportedError') return '음원이 없거나 지원하지 않는 형식이에요.';
  return '음원을 재생하지 못했어요. 다시 시도해주세요.';
};

// Only the latest request may update the UI. pause/load/source changes can reject
// an older play() promise long after a new question or playback has started.
export const createQuizAudioPlayer = () => {
  let request = 0;
  return {
    cancel() { request++; },
    async play(audio, rate, { isCurrent, onReady, onError }) {
      const current = ++request;
      const valid = () => current === request && isCurrent();
      try {
        // Reload only to recover an actual media error, preserving preloaded data.
        if (audio.error) audio.load();
        audio.playbackRate = rate;
        audio.currentTime = 0;
        await audio.play();
        if (valid()) onReady();
      } catch (error) {
        if (!valid()) return;
        const message = getQuizAudioError(error, audio.error);
        if (message) onError(message);
      }
    }
  };
};
