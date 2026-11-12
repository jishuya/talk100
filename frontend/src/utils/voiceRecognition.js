// Keep browser lifecycle logic separate so mobile event ordering can be tested.
export const createVoiceRecognition = (Recognition, onChange, onRecording) => {
  let recognition = null;
  let disposed = false;
  let acceptingResults = false;
  let state = { status: 'idle', transcript: '', interimTranscript: '', error: null };
  const update = patch => {
    state = { ...state, ...patch };
    if (!disposed) onChange(state);
  };
  const errors = {
    'no-speech': '음성이 감지되지 않았습니다. 다시 시도해주세요.',
    'audio-capture': '마이크를 사용할 수 없습니다. 다른 앱의 마이크 사용 여부를 확인해주세요.',
    'not-allowed': '마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.',
    'service-not-allowed': '이 환경에서는 음성인식 서비스를 사용할 수 없습니다. 다른 브라우저에서 시도해주세요.',
    network: '음성인식 서비스에 연결하지 못했습니다. 인터넷 연결을 확인해주세요.',
    'language-not-supported': '이 환경에서는 영어 음성인식을 지원하지 않습니다.'
  };
  return {
    start() {
      if (disposed || state.status !== 'idle') return;
      acceptingResults = true;
      update({ status: 'starting', transcript: '', interimTranscript: '', error: null });
      onRecording(true);
      try {
        const current = new Recognition();
        recognition = current;
        current.lang = 'en-US';
        current.continuous = true;
        current.interimResults = true;
        current.maxAlternatives = 1;
        // Service startup alone does not confirm that microphone capture began.
        current.onstart = () => {};
        const markCapturing = () => {
          if (recognition !== current || disposed || !acceptingResults) return;
          if (state.status === 'starting') update({ status: 'listening' });
        };
        current.onaudiostart = markCapturing;
        // These also prove capture started if a browser omits audiostart.
        current.onsoundstart = markCapturing;
        current.onspeechstart = markCapturing;
        current.onresult = event => {
          if (recognition !== current || disposed || !acceptingResults) return;
          markCapturing();
          const final = [];
          const interim = [];
          // results contains the whole session; resultIndex is only the changed index.
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            (result.isFinal ? final : interim).push(result[0].transcript.trim());
          }
          update({ transcript: final.join(' '), interimTranscript: interim.join(' '), error: null });
        };
        current.onerror = event => {
          if (recognition !== current || disposed) return;
          acceptingResults = false;
          update({ interimTranscript: '', error: event.error === 'aborted' ? null :
            errors[event.error] || `음성 인식 오류: ${event.error}` });
          // Keep the session locked until onend releases the microphone.
        };
        current.onend = () => {
          if (recognition !== current || disposed) return;
          recognition = null;
          acceptingResults = false;
          onRecording(false);
          update({ status: 'idle', interimTranscript: '' });
        };
        // Called directly from the user's click; no extra microphone open/close.
        current.start();
      } catch {
        recognition = null;
        acceptingResults = false;
        onRecording(false);
        update({ status: 'idle', error: '음성 인식을 시작할 수 없습니다. 다시 시도해주세요.' });
      }
    },
    stop() {
      if (!recognition || state.status === 'stopping') return;
      update({ status: 'stopping' });
      // stop() can still deliver a final result before onend.
      recognition.stop();
    },
    reset() {
      acceptingResults = false;
      update({ transcript: '', interimTranscript: '', error: null });
      if (recognition && state.status !== 'stopping') {
        update({ status: 'stopping' });
        recognition.abort();
      }
    },
    dispose() {
      disposed = true;
      acceptingResults = false;
      const current = recognition;
      recognition = null;
      if (current) current.abort();
      onRecording(false);
    }
  };
};
