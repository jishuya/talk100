import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Web Speech API를 사용한 음성인식 커스텀 훅
 *
 * @returns {Object} 음성인식 관련 상태 및 함수들
 * - isListening: 녹음 중 여부
 * - transcript: 인식된 텍스트
 * - isSupported: 브라우저 지원 여부
 * - error: 에러 메시지
 * - startListening: 녹음 시작 함수
 * - stopListening: 녹음 중지 함수
 * - resetTranscript: 인식 결과 초기화 함수
 */
export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null); // 침묵 감지 타이머
  const lastTranscriptRef = useRef(''); // 마지막 인식 결과 저장
  const SILENCE_DURATION = 1000; // 1초 침묵 후 자동 중지

  // 브라우저 지원 체크 및 초기화
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('이 브라우저는 음성인식을 지원하지 않습니다. Chrome이나 Safari를 사용해주세요.');
      return;
    }

    setIsSupported(true);

    const recognitionInstance = new SpeechRecognition();

    // 설정
    recognitionInstance.lang = 'en-US'; // 영어 음성인식
    recognitionInstance.continuous = true; // 계속 인식 (긴 문장 지원)
    recognitionInstance.interimResults = true; // 중간 결과 표시 (실시간 피드백)
    recognitionInstance.maxAlternatives = 1; // 최대 대안 개수

    // 음성인식 결과 처리
    recognitionInstance.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // 모든 결과 처리 (중간 결과 + 최종 결과)
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // 최종 결과가 있으면 사용, 없으면 중간 결과 사용
      const recognizedText = (finalTranscript || interimTranscript).trim();

      if (recognizedText) {
        console.log('🎤 음성인식 결과:', recognizedText, event.results[event.results.length - 1].isFinal ? '(최종)' : '(중간)');

        // 마지막 결과 저장
        lastTranscriptRef.current = recognizedText;
        setTranscript(recognizedText);
        setError(null);

        // 🎯 침묵 감지: 음성이 인식될 때마다 타이머 리셋
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // 새로운 타이머 시작 (1초 후 자동 중지)
        silenceTimerRef.current = setTimeout(() => {
          console.log('⏱️ 침묵 감지 (1초) - 자동 녹음 중지');
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (err) {
              console.error('자동 중지 실패:', err);
            }
          }
        }, SILENCE_DURATION);
      }
    };

    // 음성인식 에러 처리
    recognitionInstance.onerror = (event) => {
      console.error('🚨 음성인식 에러:', event.error);

      let errorMessage = '음성 인식에 실패했습니다.';

      switch (event.error) {
        case 'no-speech':
          errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
          break;
        case 'audio-capture':
          errorMessage = '마이크를 찾을 수 없습니다.';
          break;
        case 'not-allowed':
          errorMessage = '마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.';
          break;
        case 'network':
          errorMessage = '인터넷 연결을 확인해주세요.';
          break;
        case 'aborted':
          errorMessage = '음성 인식이 중단되었습니다.';
          break;
        default:
          errorMessage = `음성 인식 오류: ${event.error}`;
      }

      setError(errorMessage);
      setIsListening(false);
    };

    // 음성인식 종료 처리
    recognitionInstance.onend = () => {
      console.log('🎤 음성인식 종료');
      setIsListening(false);

      // 🎯 중요: 자동 중지된 경우, 마지막 transcript를 다시 설정하여 useEffect 트리거
      if (lastTranscriptRef.current) {
        console.log('📝 최종 결과 재설정:', lastTranscriptRef.current);
        // transcript를 다시 설정하여 QuizPage의 useEffect가 트리거되도록
        setTranscript(lastTranscriptRef.current);
      }
    };

    // 음성인식 시작 처리
    recognitionInstance.onstart = () => {
      console.log('🎤 음성인식 시작');
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current = recognitionInstance;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  // 녹음 시작
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('음성인식을 초기화할 수 없습니다.');
      return;
    }

    if (isListening) {
      console.warn('⚠️ 이미 녹음 중입니다.');
      return;
    }

    try {
      // 기존 타이머 정리
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // 이전 결과 초기화
      lastTranscriptRef.current = '';
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      console.error('❌ 녹음 시작 실패:', err);
      setError('음성 인식을 시작할 수 없습니다. 다시 시도해주세요.');
    }
  }, [isListening]);

  // 녹음 중지
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    if (!isListening) {
      console.warn('⚠️ 녹음 중이 아닙니다.');
      return;
    }

    try {
      // 타이머 정리
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      recognitionRef.current.stop();
    } catch (err) {
      console.error('❌ 녹음 중지 실패:', err);
    }
  }, [isListening]);

  // 인식 결과 초기화
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  };
};
