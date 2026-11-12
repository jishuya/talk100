// Acquire the microphone in voice mode without recording or sending audio.
// SpeechRecognition still starts directly from the answer button's click.
export const createMicrophoneWarmup = getUserMedia => {
  let stream = null;
  let pending = null;
  let generation = 0;
  const stopTracks = source => source?.getTracks().forEach(track => track.stop());
  return {
    prepare() {
      if (stream?.getAudioTracks().some(track => track.readyState === 'live')) {
        return Promise.resolve(true);
      }
      if (pending) return pending;
      stopTracks(stream);
      stream = null;
      const requestGeneration = generation;
      const request = Promise.resolve().then(() => getUserMedia({ audio: true }))
        .then(source => {
          // A permission dialog may resolve after leaving voice mode or the page.
          if (generation !== requestGeneration) {
            stopTracks(source);
            return false;
          }
          stream = source;
          return true;
        })
        // Permission and device errors are reported by SpeechRecognition on click.
        .catch(() => false)
        .finally(() => { if (pending === request) pending = null; });
      pending = request;
      return request;
    },
    release() {
      generation++;
      pending = null;
      stopTracks(stream);
      stream = null;
    }
  };
};
