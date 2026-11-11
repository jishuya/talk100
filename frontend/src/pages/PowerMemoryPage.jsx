import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getIcon } from '../utils/iconMap';
import Button from '../components/ui/Button';
import Modal, { ModalHeader, ModalBody } from '../components/ui/Modal';
import AlertModal from '../components/ui/AlertModal';
import { api } from '../services/apiService';
import { ENV } from '../config/environment';
import { getAnswerWaitTime } from '../utils/powerMemory';
import './PowerMemoryPage.css';
import { PowerMemorySettingsContext } from '../contexts/PowerMemorySettingsContext';

// 성우 옵션
const VOICE_OPTIONS = [
  { id: 'male', label: '남성' },
  { id: 'female', label: '여성' }
];

// 오디오 경로 생성 헬퍼
const getAudioPath = (question, language, gender) => {
  // question.audio에서 파일명만 추출 (예: 'US_female/001_01.mp3' -> '001_01.mp3')
  const audioFilename = question.audio?.split('/').pop();
  if (!audioFilename) return null;

  const folderMap = {
    korean: { male: 'KO_male', female: 'KO_female' },
    english: { male: 'US_male', female: 'US_female' }
  };

  const folder = folderMap[language]?.[gender];
  if (!folder) return null;

  return `${ENV.API_BASE_URL}/audio/${folder}/${audioFilename}`;
};

const PlaybackRoute = ({ koreanVoice, englishVoices, playPhase = 'idle', currentEnglishIndex = 0, waitLabel, waitSeconds }) => (
  <div className={`route-steps${englishVoices.length >= 3 ? ' route-steps-long' : ''}`}>
              <span className={playPhase === 'korean' ? 'route-step active' : 'route-step'}><span>🇰🇷{koreanVoice === 'male' ? '👨' : '👩'}</span><span>한글({koreanVoice === 'male' ? '男' : '女'})</span></span>
              <div className="route-part">
                <span className="route-arrow">→</span>
                <span className={playPhase === 'waiting' ? 'route-step active' : 'route-step'} title={waitLabel}>
                  <span>🗣️</span><span>{waitSeconds}초</span>
                </span>
              </div>
              {englishVoices.map((voice, index) => <div className="route-part" key={index}><span className="route-arrow">→</span><span className={playPhase === 'english' && currentEnglishIndex === index ? 'route-step active' : 'route-step'}><span>🇺🇸{voice === 'male' ? '👨' : '👩'}</span><span>영어{englishVoices.length > 1 ? index + 1 : ''}({voice === 'male' ? '男' : '女'})</span></span></div>)}
            </div>
);

const PowerMemoryPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [removedFavorites, setRemovedFavorites] = useState(new Set());
  const [pendingFavorites, setPendingFavorites] = useState(new Set());
  const pendingFavoritesRef = useRef(new Set());

  // 설정 상태 (DB에서 불러온 값으로 초기화)
  const [koreanVoice, setKoreanVoice] = useState('female');
  const [answerTime, setAnswerTime] = useState(3);
  const [answerTimeMode, setAnswerTimeMode] = useState('auto');
  const [englishVoices, setEnglishVoices] = useState(['male']); // 최대 3개

  // 설정 모달 상태
  const [showSettingsModal, setShowSettingsModal] = useContext(PowerMemorySettingsContext);

  // 퀴즈 데이터
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 재생 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [playPhase, setPlayPhase] = useState('idle'); // 'idle' | 'korean' | 'waiting' | 'english'
  const [currentEnglishIndex, setCurrentEnglishIndex] = useState(0);

  // 오디오 ref
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const playbackIdRef = useRef(0);
  const pausedRef = useRef(false);
  const isStoppedRef = useRef(false); // 정지 플래그 (비동기 작업 중단용)
  const questionRefs = useRef([]); // 문제 카드 refs

  // Alert 모달
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', icon: '' });

  // 설정 및 즐겨찾기 문제 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. 파워암기모드 설정 로드
        const settings = await api.getPowerMemoryMode();
        if (settings) {
          setKoreanVoice(settings.koreanVoice || 'female');
          setAnswerTime(settings.answerTime || 3);
          setEnglishVoices(settings.englishVoices || ['male']);
          setAnswerTimeMode(settings.answerTimeMode === 'manual' ? 'manual' : 'auto');
        }

        // 2. 즐겨찾기 문제 로드
        const result = await api.apiCall('/api/quiz/favorites', { method: 'GET' });
        if (result?.questions && result.questions.length > 0) {
          setQuestions(result.questions);
        } else {
          setAlertModal({ isOpen: true, message: '즐겨찾기한 문제가 없습니다.', icon: '📭' });
        }
      } catch {
        setAlertModal({ isOpen: true, message: '문제를 불러오는데 실패했습니다.', icon: '❌' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // 컴포넌트 언마운트 시 정리
    return () => {
      isStoppedRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 영어 성우 추가
  const addEnglishVoice = () => {
    if (englishVoices.length < 3) {
      setEnglishVoices([...englishVoices, 'female']);
    }
  };

  // 영어 성우 제거
  const removeEnglishVoice = (index) => {
    if (englishVoices.length > 1) {
      setEnglishVoices(englishVoices.filter((_, i) => i !== index));
    }
  };

  // 영어 성우 변경
  const updateEnglishVoice = (index, voice) => {
    const newVoices = [...englishVoices];
    newVoices[index] = voice;
    setEnglishVoices(newVoices);
  };

  const handleFavoriteToggle = async (questionId) => {
    if (pendingFavoritesRef.current.has(questionId)) return;
    pendingFavoritesRef.current.add(questionId);
    setPendingFavorites(new Set(pendingFavoritesRef.current));
    const isFavorite = !removedFavorites.has(questionId);
    try {
      const result = await api.toggleFavorite(questionId, isFavorite);
      const nextIsFavorite = result?.isFavorite ?? result?.data?.isFavorite ?? !isFavorite;
      setRemovedFavorites(previous => {
        const next = new Set(previous);
        if (nextIsFavorite) next.delete(questionId);
        else next.add(questionId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['quiz', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'personalQuizzes'] });
    } catch {
      setAlertModal({ isOpen: true, message: '즐겨찾기 변경에 실패했습니다. 다시 시도해 주세요.', icon: '❌' });
    } finally {
      pendingFavoritesRef.current.delete(questionId);
      setPendingFavorites(new Set(pendingFavoritesRef.current));
    }
  };

  // 카드 클릭 (토글)
  const handleCardClick = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // 오디오 재생 Promise wrapper
  const playAudio = useCallback((audioUrl) => {
    return new Promise((resolve, reject) => {
      if (!audioRef.current || !audioUrl) {
        reject(new Error('No audio'));
        return;
      }

      const audio = audioRef.current;

      // 기존 이벤트 리스너 제거를 위한 클린업
      const cleanup = () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };

      const handleEnded = () => {
        cleanup();
        resolve();
      };

      const handleError = () => {
        cleanup();
        reject(new Error('Audio error'));
      };

      // 이전 재생 중지 및 리스너 초기화
      audio.pause();
      audio.currentTime = 0;

      // 새 소스 설정
      audio.src = audioUrl;
      audio.load();

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      audio.play().catch((err) => {
        cleanup();
        reject(err);
      });
    });
  }, []);

  // 대기 시간 Promise wrapper
  const wait = useCallback((seconds) => {
    return new Promise((resolve) => {
      let remaining = seconds * 1000;
      let lastTick = performance.now();
      const tick = () => {
        const now = performance.now();
        if (!pausedRef.current) remaining -= now - lastTick;
        lastTick = now;
        if (remaining <= 0 || isStoppedRef.current) resolve();
        else timerRef.current = setTimeout(tick, 100);
      };
      timerRef.current = setTimeout(tick, 100);
    });
  }, []);

  // 한 문제 재생 시퀀스
  const playQuestionSequence = useCallback(async (questionIndex, playbackId) => {
    if (isStoppedRef.current || playbackId !== playbackIdRef.current) return false;

    const question = questions[questionIndex];
    if (!question) return false;

    try {
      // 1. 한글 음성 재생
      setPlayPhase('korean');
      const koreanUrl = getAudioPath(question, 'korean', koreanVoice);
      if (koreanUrl) {
        await playAudio(koreanUrl);
      }

      if (isStoppedRef.current || playbackId !== playbackIdRef.current) return false;

      // 2. 정답 말하기 시간 대기
      setPlayPhase('waiting');
      await wait(getAnswerWaitTime(question, answerTimeMode, answerTime));

      if (isStoppedRef.current || playbackId !== playbackIdRef.current) return false;

      // 3. 영어 음성 재생 (설정된 횟수만큼)
      for (let i = 0; i < englishVoices.length; i++) {
        if (isStoppedRef.current || playbackId !== playbackIdRef.current) return false;

        setPlayPhase('english');
        setCurrentEnglishIndex(i);
        const englishUrl = getAudioPath(question, 'english', englishVoices[i]);
        if (englishUrl) {
          await playAudio(englishUrl);
        }
      }

      return true;
    } catch {
      // 에러 발생해도 다음 문제로 넘어감
      return true;
    }
  }, [questions, koreanVoice, answerTime, answerTimeMode, englishVoices, playAudio, wait]);

  // 전체 재생 시퀀스
  const startPlayback = useCallback(async (startIndex = 0) => {
    const playbackId = ++playbackIdRef.current;
    isStoppedRef.current = false;
    setIsPlaying(true);
    pausedRef.current = false;
    setIsPaused(false);

    for (let i = startIndex; i < questions.length; i++) {
      if (isStoppedRef.current || playbackId !== playbackIdRef.current) break;

      setCurrentIndex(i);

      // 현재 재생 중인 문제로 스크롤
      if (questionRefs.current[i]) {
        questionRefs.current[i].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      const success = await playQuestionSequence(i, playbackId);

      if (!success || isStoppedRef.current || playbackId !== playbackIdRef.current) break;
    }

    // 재생 완료 또는 중단
    if (!isStoppedRef.current && playbackId === playbackIdRef.current) {
      setIsPlaying(false);
      setPlayPhase('idle');
      setCurrentIndex(0);
      setAlertModal({ isOpen: true, message: '모든 문제 재생이 완료되었습니다!', icon: '🎉' });
    }
  }, [questions, playQuestionSequence]);

  // 재생 시작
  const handlePlay = useCallback(() => {
    if (questions.length === 0) {
      setAlertModal({ isOpen: true, message: '재생할 문제가 없습니다.', icon: '📭' });
      return;
    }

    if (isPaused) {
      // 일시정지 상태에서 재개
      isStoppedRef.current = false;
      pausedRef.current = false;
    setIsPaused(false);
      if (playPhase !== 'waiting' && audioRef.current && audioRef.current.paused) {
        audioRef.current.play();
      }
    } else {
      // 처음부터 재생
      startPlayback(currentIndex);
    }
  }, [questions, isPaused, currentIndex, startPlayback, playPhase]);

  // 일시 정지
  const handlePause = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // 정지 (처음으로)
  const handleStop = useCallback(() => {
    playbackIdRef.current += 1;
    isStoppedRef.current = true;
    setIsPlaying(false);
    pausedRef.current = false;
    setIsPaused(false);
    setCurrentIndex(0);
    setPlayPhase('idle');
    setCurrentEnglishIndex(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);


  const currentWaitTime = getAnswerWaitTime(questions[currentIndex], answerTimeMode, answerTime);
  const waitLabel = answerTimeMode === 'auto' ? `자동(${currentWaitTime}초)` : `${currentWaitTime}초`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="power-memory-page">
      <section className={`memory-deck ${isPlaying && !isPaused ? 'is-running' : ''}`} aria-label="파워암기 카세트 플레이어">
        <div className="deck-status">
          <span><i className={isPlaying && !isPaused ? 'status-light active' : 'status-light'} />
            {isPaused ? 'PAUSED · 일시정지' : !isPlaying ? 'STANDBY · 대기 중' : playPhase === 'waiting' ? `SPEAK · ${waitLabel} 대기` : playPhase === 'korean' ? 'PLAYING · 한글 재생' : `PLAYING · 영어 ${currentEnglishIndex + 1}`}
          </span>
          <button className="deck-settings" onClick={() => setShowSettingsModal(true)} aria-label="재생 설정">
            {getIcon('lucide:sliders-horizontal', { size: 'sm' })}
          </button>
        </div>
        <div className="cassette-label">
          <div className="cassette-heading"><span><b>SIDE A</b> POWER MEMORY</span><span>HQ AUDIO</span></div>
          <div className="cassette-title" aria-live="polite">
            <h1>{(isPlaying || isPaused) && questions[currentIndex]
              ? (questions[currentIndex].korean || questions[currentIndex].korean_a || questions[currentIndex].korean_b)
              : '재생 버튼을 눌러 시작하세요'}</h1>
            {(isPaused || isPlaying) && <p>{isPaused ? '잠시 쉬어가도 괜찮아요' : `${currentIndex + 1}번째 문장을 소리 내어 따라 해보세요`}</p>}
          </div>
          <div className="cassette-window" aria-hidden="true">
            <div className="tape-reel"><i /></div>
            <div className="tape-meter"><div><span>100</span><span>50</span><span>0</span></div><i /></div>
            <div className="tape-reel"><i /></div>
          </div>
          <div className="playback-route">
            <div className="route-heading"><span>PLAYBACK ROUTE</span><span>{answerTimeMode === 'auto' ? '자동간격' : `${currentWaitTime}초 고정`}</span></div>
            <PlaybackRoute koreanVoice={koreanVoice} englishVoices={englishVoices} playPhase={playPhase} currentEnglishIndex={currentEnglishIndex} waitLabel={waitLabel} waitSeconds={currentWaitTime} />
          </div>
        </div>
        <div className="deck-progress">
          <div className="deck-progress-track" role="progressbar" aria-label="문제 재생 진행률" aria-valuemin={0} aria-valuemax={questions.length || 1} aria-valuenow={questions.length ? currentIndex + (isPlaying ? 1 : 0) : 0}><span style={{ width: `${questions.length ? (currentIndex + (isPlaying ? 1 : 0)) / questions.length * 100 : 0}%` }} /></div>
          <div><span>TRACK {String(currentIndex + 1).padStart(2, '0')}</span><span>총 {questions.length}문장</span></div>
        </div>
        <div className="deck-controls">
          <button aria-label="이전 문제" disabled={currentIndex === 0} onClick={() => { const index = currentIndex - 1; handleStop(); setCurrentIndex(index); }}>{getIcon('lucide:skip-back', { size: 'md' })}</button>
          <button aria-label="처음으로 정지" onClick={handleStop}>{getIcon('lucide:rotate-ccw', { size: 'md' })}</button>
          <button className="deck-play" onClick={isPlaying && !isPaused ? handlePause : handlePlay} aria-label={isPlaying && !isPaused ? '일시정지' : '재생'}>{getIcon(isPlaying && !isPaused ? 'lucide:pause' : 'lucide:play', { size: 'md' })}{isPlaying && !isPaused ? 'PAUSE' : 'PLAY'}</button>
          <button aria-label="정지" onClick={handleStop}>{getIcon('lucide:square', { size: 'md' })}</button>
          <button aria-label="다음 문제" disabled={currentIndex >= questions.length - 1} onClick={() => { const index = currentIndex + 1; handleStop(); setCurrentIndex(index); }}>{getIcon('lucide:skip-forward', { size: 'md' })}</button>
        </div>
        <span className="deck-screw top-left" /><span className="deck-screw top-right" /><span className="deck-screw bottom-left" /><span className="deck-screw bottom-right" />
      </section>
      <section className="memory-favorites" aria-label="즐겨찾기 문제">
        <div className="favorites-heading"><h2><span className="favorites-heart text-red-400">{getIcon('fluent:heart-24-filled', { size: 'sm' })}</span>즐겨찾기 문제 <small>({questions.length - removedFavorites.size}개)</small></h2><span>MY TRACKS</span></div>
        {questions.length === 0 ? <div className="memory-empty"><p>즐겨찾기한 문제가 없습니다.</p><Button variant="primary" onClick={() => navigate('/')}>문제 풀러 가기</Button></div> :
          <div className="memory-track-list">{questions.map((question, index) => {
            const isCurrent = currentIndex === index;
            const isExpanded = expandedIndex === index;
            const korean = question.korean || question.korean_a || question.korean_b;
            const english = question.english || question.english_a || question.english_b;
            return <article key={question.question_id} ref={el => (questionRefs.current[index] = el)} className={`memory-track ${isCurrent ? 'current' : ''}`}>
              <span className="track-number">{String(index + 1).padStart(2, '0')}</span>
              <button className="track-copy" onClick={() => handleCardClick(index)} aria-expanded={isExpanded}>
                <strong>{korean}</strong><span className={isExpanded ? 'track-english expanded' : 'track-english'}>{english}</span>
                <span className="track-tags"><small>{isCurrent && isPlaying ? isPaused ? '일시정지' : '재생 중' : '한영 반복'}</small>{isCurrent && <small>1.0× 속도</small>}</span>
              </button>
              <div className="track-actions"><button
                type="button"
                className="track-heart text-red-400"
                aria-label={removedFavorites.has(question.question_id) ? '즐겨찾기 추가' : '즐겨찾기 해제'}
                aria-pressed={!removedFavorites.has(question.question_id)}
                disabled={pendingFavorites.has(question.question_id)}
                onClick={() => handleFavoriteToggle(question.question_id)}
              >{getIcon(removedFavorites.has(question.question_id) ? 'fluent:heart-24-regular' : 'fluent:heart-24-filled', { size: 'sm' })}</button><button aria-label={`${index + 1}번 문제 ${isCurrent && isPlaying && !isPaused ? '일시정지' : '재생'}`} onClick={() => { if (isCurrent && isPlaying) { if (isPaused) handlePlay(); else handlePause(); } else { handleStop(); startPlayback(index); } }}>{getIcon(isCurrent && isPlaying && !isPaused ? 'lucide:pause' : 'lucide:play', { size: 'sm' })}</button></div>
            </article>;
          })}</div>}
      </section>

      {/* 설정 모달 */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        size="md"
      >
        <ModalHeader onClose={() => setShowSettingsModal(false)}>
          <div className="flex items-center gap-2">
            {getIcon('lucide:settings', { size: 'lg' })}
            재생 설정
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-5">
            {/* 한글 문장 성우 */}
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">한글 문장 성우</label>
              <div className="flex gap-2">
                {VOICE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setKoreanVoice(option.id)}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                      koreanVoice === option.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 정답 말하기 시간 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-primary">정답 말하기 시간</label>
                <span className="text-sm font-bold text-primary">{waitLabel}</span>
              </div>
              <div className="flex gap-2 mb-3" role="group" aria-label="정답 말하기 시간 설정 방식">
                {[{ id: 'auto', label: '자동' }, { id: 'manual', label: '수동' }].map((option) => (
                  <button
                    key={option.id}
                    aria-pressed={answerTimeMode === option.id}
                    onClick={() => setAnswerTimeMode(option.id)}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                      answerTimeMode === option.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {answerTimeMode === 'auto' ? (
                <p className="text-xs text-text-secondary leading-relaxed">
                  한글의 공백·문장부호를 제외한 글자 수에 따라 자동으로 기다려요.
                  (1초 + 글자당 0.3초, 올림하여 최소 2초)
                </p>
              ) : (
              <div className="px-1">
                <input
                  aria-label="정답 말하기 시간 (초)"
                  type="range"
                  min="2"
                  max="10"
                  value={answerTime}
                  onChange={(e) => setAnswerTime(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                    [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-primary
                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
                />
                <div className="flex justify-between mt-1 text-xs text-text-secondary">
                  <span>2초</span>
                  <span>4초</span>
                  <span>6초</span>
                  <span>8초</span>
                  <span>10초</span>
                </div>
              </div>
              )}
            </div>

            {/* 영어 문장 성우 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-primary">영어 문장 성우</label>
                {englishVoices.length < 3 && (
                  <button
                    onClick={addEnglishVoice}
                    className="text-sm text-primary font-medium flex items-center gap-1 hover:text-primary-dark"
                  >
                    {getIcon('tabler:plus', { size: 'sm' })}
                    추가
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {englishVoices.map((voice, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary w-6">{index + 1}.</span>
                    <div className="flex-1 flex gap-2">
                      {VOICE_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => updateEnglishVoice(index, option.id)}
                          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                            voice === option.id
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {englishVoices.length > 1 && (
                      <button
                        onClick={() => removeEnglishVoice(index)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {getIcon('lucide:trash-2', { size: 'md' })}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 재생 순서 미리보기 */}
            <div className="p-3 bg-accent-pale rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-text-secondary">재생 순서 미리보기</p>
                <button
                  onClick={() => {
                    setKoreanVoice('female');
                    setAnswerTime(3);
                    setAnswerTimeMode('auto');
                    setEnglishVoices(['female']);
                  }}
                  className="p-1.5 text-text-secondary hover:text-primary hover:bg-white/50 rounded-lg transition-colors"
                >
                  {getIcon('lucide:rotate-ccw', { size: 'md' })}
                </button>
              </div>
              <PlaybackRoute koreanVoice={koreanVoice} englishVoices={englishVoices} waitLabel={waitLabel} waitSeconds={currentWaitTime} />
            </div>

            {/* 확인 버튼 */}
            <Button
              variant="primary"
              className="w-full"
              onClick={async () => {
                // 설정을 DB에 저장
                try {
                  await api.updatePowerMemoryMode({
                    koreanVoice,
                    answerTime,
                    answerTimeMode,
                    englishVoices
                  });
                } catch {
                  // 설정 저장에 실패해도 현재 화면에서는 선택한 설정을 유지합니다.
                }
                handleStop();
                setCurrentIndex(0);
                setShowSettingsModal(false);
              }}
            >
              확인
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* 숨겨진 오디오 엘리먼트 */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Alert 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => {
          setAlertModal({ isOpen: false, message: '', icon: '' });
          if (questions.length === 0) {
            navigate('/');
          }
        }}
        message={alertModal.message}
        icon={alertModal.icon}
      />
    </div>
  );
};

export default PowerMemoryPage;
