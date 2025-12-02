import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIcon } from '../utils/iconMap';
import Button from '../components/ui/Button';
import Modal, { ModalHeader, ModalBody } from '../components/ui/Modal';
import AlertModal from '../components/ui/AlertModal';
import { api } from '../services/apiService';
import { ENV } from '../config/environment';

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

const PowerMemoryPage = () => {
  const navigate = useNavigate();

  // 설정 상태 (DB에서 불러온 값으로 초기화)
  const [koreanVoice, setKoreanVoice] = useState('female');
  const [answerTime, setAnswerTime] = useState(3);
  const [englishVoices, setEnglishVoices] = useState(['male']); // 최대 3개
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // 설정 모달 상태
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
          setSettingsLoaded(true);
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
      timerRef.current = setTimeout(resolve, seconds * 1000);
    });
  }, []);

  // 한 문제 재생 시퀀스
  const playQuestionSequence = useCallback(async (questionIndex) => {
    if (isStoppedRef.current) return false;

    const question = questions[questionIndex];
    if (!question) return false;

    try {
      // 1. 한글 음성 재생
      setPlayPhase('korean');
      const koreanUrl = getAudioPath(question, 'korean', koreanVoice);
      if (koreanUrl) {
        await playAudio(koreanUrl);
      }

      if (isStoppedRef.current) return false;

      // 2. 정답 말하기 시간 대기
      setPlayPhase('waiting');
      await wait(answerTime);

      if (isStoppedRef.current) return false;

      // 3. 영어 음성 재생 (설정된 횟수만큼)
      for (let i = 0; i < englishVoices.length; i++) {
        if (isStoppedRef.current) return false;

        setPlayPhase('english');
        setCurrentEnglishIndex(i);
        const englishUrl = getAudioPath(question, 'english', englishVoices[i]);
        if (englishUrl) {
          await playAudio(englishUrl);
        }
      }

      return true;
    } catch (error) {
      console.error('Audio playback error:', error);
      // 에러 발생해도 다음 문제로 넘어감
      return true;
    }
  }, [questions, koreanVoice, answerTime, englishVoices, playAudio, wait]);

  // 전체 재생 시퀀스
  const startPlayback = useCallback(async (startIndex = 0) => {
    isStoppedRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);

    for (let i = startIndex; i < questions.length; i++) {
      if (isStoppedRef.current) break;

      setCurrentIndex(i);

      // 현재 재생 중인 문제로 스크롤
      if (questionRefs.current[i]) {
        questionRefs.current[i].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      const success = await playQuestionSequence(i);

      if (!success || isStoppedRef.current) break;
    }

    // 재생 완료 또는 중단
    if (!isStoppedRef.current) {
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
      setIsPaused(false);
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play();
      }
    } else {
      // 처음부터 재생
      startPlayback(currentIndex);
    }
  }, [questions, isPaused, currentIndex, startPlayback]);

  // 일시 정지
  const handlePause = useCallback(() => {
    setIsPaused(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  // 정지 (처음으로)
  const handleStop = useCallback(() => {
    isStoppedRef.current = true;
    setIsPlaying(false);
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
    <div className="min-h-screen bg-background pb-20">
      {/* 미디어 플레이어 */}
      <div className="mx-4 mt-2 mb-4">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 shadow-lg text-white relative">
          {/* 우측 상단 설정 버튼 */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
          >
            {getIcon('lucide:settings', { size: 'md', className: 'text-white' })}
          </button>

          {/* 상단: 현재 재생 정보 */}
          <div className="mb-4 pr-10">
            <p className="text-white/70 text-xs font-medium mb-1">
              {isPlaying
                ? playPhase === 'korean' ? '🇰🇷 한글 재생 중'
                : playPhase === 'waiting' ? `⏱️ ${answerTime}초 대기 중`
                : playPhase === 'english' ? `🇺🇸 영어${englishVoices.length > 1 ? ` ${currentEnglishIndex + 1}` : ''} 재생 중`
                : '재생 중'
                : isPaused ? '일시정지' : '대기 중'}
            </p>
            <p className="text-lg font-bold truncate">
              {(isPlaying || isPaused) && questions[currentIndex]
                ? (questions[currentIndex].korean || questions[currentIndex].korean_a || questions[currentIndex].korean_b)
                : '재생 버튼을 눌러 시작하세요'}
            </p>
          </div>

          {/* 재생 컨트롤 */}
          <div className="flex items-center justify-center gap-6">
            {/* 재생/일시정지 버튼 */}
            <button
              onClick={isPlaying && !isPaused ? handlePause : handlePlay}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-all"
            >
              {isPlaying && !isPaused
                ? getIcon('lucide:pause', { size: 'xl', className: 'text-primary' })
                : getIcon('lucide:play', { size: 'xl', className: 'text-primary ml-0.5' })
              }
            </button>

            {/* 정지 버튼 */}
            <button
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isPlaying || isPaused
                  ? 'bg-white hover:bg-white/90 shadow-md'
                  : 'bg-white/50'
              }`}
            >
              {getIcon('lucide:square', { size: 'xl', className: isPlaying || isPaused ? 'text-primary' : 'text-primary/50' })}
            </button>
          </div>

          {/* 재생 순서 태그 */}
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <span className="inline-flex items-center px-2 py-0.5 bg-white/20 rounded-full text-sm font-medium">
                🇰🇷 한글({koreanVoice === 'male' ? '남' : '여'})
              </span>
              <span className="text-white/50 text-sm">→</span>
              <span className="inline-flex items-center px-2 py-0.5 bg-white/20 rounded-full text-sm font-medium">
                ⏱️ {answerTime}초
              </span>
              <span className="text-white/50 text-sm">→</span>
              {englishVoices.map((voice, index) => (
                <span key={index} className="inline-flex items-center">
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm font-medium">
                    🇺🇸 영어{englishVoices.length > 1 ? index + 1 : ''}({voice === 'male' ? '남' : '여'})
                  </span>
                  {index < englishVoices.length - 1 && <span className="text-white/50 text-sm mx-1">→</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">

        {/* 즐겨찾기 문제 목록 */}
        <div className="card">
          <div className="p-4 border-b border-gray-border">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              {getIcon('fluent:heart-24-filled', { size: 'md', className: 'text-red-400' })}
              즐겨찾기 문제
              <span className="text-xs font-normal text-text-secondary">
                ({questions.length}개)
              </span>
            </h2>
          </div>

          {questions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-text-secondary">즐겨찾기한 문제가 없습니다.</p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => navigate('/')}
              >
                문제 풀러 가기
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-border">
              {questions.map((question, index) => {
                const isCurrentPlaying = isPlaying && currentIndex === index;
                const isExpanded = expandedIndex === index;

                // 한글/영어 텍스트 추출
                let korean, english;
                if (question.question_type === 'dialogue') {
                  if (question.korean_a) {
                    korean = question.korean_a;
                    english = question.english_a;
                  } else {
                    korean = question.korean_b;
                    english = question.english_b;
                  }
                } else {
                  korean = question.korean;
                  english = question.english;
                }

                return (
                  <div
                    key={question.question_id}
                    ref={(el) => (questionRefs.current[index] = el)}
                    onClick={() => handleCardClick(index)}
                    className={`p-4 cursor-pointer transition-all ${
                      isCurrentPlaying
                        ? 'bg-primary/10'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* 한글 문장 */}
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-text-secondary w-6 pt-0.5 font-medium">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-medium leading-relaxed ${isCurrentPlaying ? 'text-primary' : 'text-text-primary'}`}>
                          {korean}
                        </p>

                        {/* 영어 문장 (펼쳐진 경우) */}
                        {isExpanded && (
                          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                            {english}
                          </p>
                        )}
                      </div>

                      {/* 재생 중 표시 */}
                      {isCurrentPlaying && (
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-3 bg-primary rounded-full animate-pulse"></span>
                          <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                          <span className="w-1 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                      )}

                      {/* 펼침 아이콘 */}
                      {!isCurrentPlaying && (
                        <span className="text-text-secondary">
                          {getIcon(isExpanded ? 'tabler:chevron-up' : 'tabler:chevron-down', { size: 'md' })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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
                <span className="text-sm font-bold text-primary">{answerTime}초</span>
              </div>
              <div className="px-1">
                <input
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
                    setAnswerTime(5);
                    setEnglishVoices(['female']);
                  }}
                  className="p-1.5 text-text-secondary hover:text-primary hover:bg-white/50 rounded-lg transition-colors"
                >
                  {getIcon('lucide:rotate-ccw', { size: 'md' })}
                </button>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 bg-white rounded-full text-sm font-medium text-text-primary">
                  🇰🇷 한글({koreanVoice === 'male' ? '남' : '여'})
                </span>
                <span className="text-text-secondary text-sm">→</span>
                <span className="inline-flex items-center px-2 py-0.5 bg-white rounded-full text-sm font-medium text-text-primary">
                  ⏱️ {answerTime}초
                </span>
                <span className="text-text-secondary text-sm">→</span>
                {englishVoices.map((voice, index) => (
                  <span key={index} className="inline-flex items-center">
                    <span className="px-2 py-0.5 bg-white rounded-full text-sm font-medium text-text-primary">
                      🇺🇸 영어{englishVoices.length > 1 ? index + 1 : ''}({voice === 'male' ? '남' : '여'})
                    </span>
                    {index < englishVoices.length - 1 && <span className="text-text-secondary text-sm mx-1">→</span>}
                  </span>
                ))}
              </div>
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
                    englishVoices
                  });
                } catch (error) {
                  console.error('설정 저장 실패:', error);
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
