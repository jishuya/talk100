import { useState, useEffect, useCallback, useRef } from 'react';
import { setEffectRecording } from '../utils/soundEffects';
import { createVoiceRecognition } from '../utils/voiceRecognition';
import { createMicrophoneWarmup } from '../utils/microphoneWarmup';

export const useVoiceInput = ({ enabled = false } = {}) => {
  const [state, setState] = useState({
    status: 'idle', transcript: '', interimTranscript: '', error: null
  });
  const [isSupported, setIsSupported] = useState(false);
  const controllerRef = useRef(null);
  const microphoneRef = useRef(null);

  useEffect(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(Boolean(Recognition));
    if (!Recognition) return;
    const controller = createVoiceRecognition(Recognition, setState, setEffectRecording);
    controllerRef.current = controller;
    const microphone = navigator.mediaDevices?.getUserMedia
      ? createMicrophoneWarmup(options => navigator.mediaDevices.getUserMedia(options)) : null;
    microphoneRef.current = microphone;
    return () => {
      controllerRef.current = null;
      microphoneRef.current = null;
      microphone?.release();
      controller.dispose();
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      microphoneRef.current?.release();
      controllerRef.current?.reset();
      return;
    }
    const syncVisibility = () => {
      if (document.visibilityState === 'hidden') {
        controllerRef.current?.reset();
        microphoneRef.current?.release();
      } else {
        microphoneRef.current?.prepare();
      }
    };
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility);
      microphoneRef.current?.release();
    };
  }, [enabled]);

  const startListening = useCallback(() => controllerRef.current?.start(), []);
  const stopListening = useCallback(() => controllerRef.current?.stop(), []);
  const resetTranscript = useCallback(() => controllerRef.current?.reset(), []);

  return {
    ...state,
    isListening: state.status !== 'idle',
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
};
