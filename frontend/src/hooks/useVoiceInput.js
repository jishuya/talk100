import { useState, useEffect, useCallback, useRef } from 'react';
import { setEffectRecording } from '../utils/soundEffects';
import { createVoiceRecognition } from '../utils/voiceRecognition';

export const useVoiceInput = () => {
  const [state, setState] = useState({
    status: 'idle', transcript: '', interimTranscript: '', error: null
  });
  const [isSupported, setIsSupported] = useState(false);
  const controllerRef = useRef(null);

  useEffect(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(Boolean(Recognition));
    if (!Recognition) return;
    const controller = createVoiceRecognition(Recognition, setState, setEffectRecording);
    controllerRef.current = controller;
    return () => {
      controllerRef.current = null;
      controller.dispose();
    };
  }, []);

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
