/**
 * 퀴즈 채점 유틸리티
 *
 * 두 가지 채점 방식:
 * 1. 실시간 채점: 개별 키워드 즉시 검증
 * 2. 제출 버튼 채점: 전체 답안 검증
 */

/**
 * 1️⃣ 실시간 채점: 개별 키워드 검증
 * @param {string} userInput - 사용자 입력값
 * @param {string} keyword - 정답 키워드
 * @returns {boolean} 정답 여부
 */
export const validateKeywordRealtime = (userInput, keyword) => {
  if (!userInput || !keyword) return false;

  return userInput.toLowerCase().trim() === keyword.toLowerCase().trim();
};

/**
 * 2️⃣ 제출 버튼 채점: 전체 답안 검증 (키보드 모드)
 * @param {Object} keywordInputs - { "keyword": "user input", ... }
 * @param {Array<string>} keywords - 정답 키워드 배열
 * @returns {Object} 채점 결과
 */
export const gradeKeyboardAnswer = (keywordInputs, keywords) => {
  if (!keywords || keywords.length === 0) {
    return {
      isAllCorrect: false,
      correctCount: 0,
      totalCount: 0,
      percentage: 0,
      details: {}
    };
  }

  const details = {};
  let correctCount = 0;

  keywords.forEach(keyword => {
    const normalizedKeyword = keyword.toLowerCase().trim();
    const userInput = keywordInputs[normalizedKeyword] || '';
    const isCorrect = validateKeywordRealtime(userInput, keyword);

    details[keyword] = {
      userInput: userInput,
      expectedAnswer: keyword,
      isCorrect
    };

    if (isCorrect) correctCount++;
  });

  const totalCount = keywords.length;
  const percentage = Math.round((correctCount / totalCount) * 100);

  return {
    isAllCorrect: correctCount === totalCount,
    correctCount,
    totalCount,
    percentage,
    details
  };
};

/**
 * 2️⃣ 제출 버튼 채점: 전체 답안 검증 (음성 모드)
 * @param {string} userAnswer - 사용자 음성 입력 전체 문장
 * @param {Array<string>} keywords - 정답 키워드 배열
 * @returns {Object} 채점 결과
 */
export const gradeVoiceAnswer = (userAnswer, keywords) => {
  if (!userAnswer || !keywords || keywords.length === 0) {
    return {
      isAllCorrect: false,
      correctCount: 0,
      totalCount: 0,
      percentage: 0,
      matchedKeywords: [],
      missedKeywords: keywords || []
    };
  }

  const normalizedAnswer = userAnswer.toLowerCase().trim();
  const matchedKeywords = [];
  const missedKeywords = [];

  keywords.forEach(keyword => {
    const normalizedKeyword = keyword.toLowerCase().trim();

    if (normalizedAnswer.includes(normalizedKeyword)) {
      matchedKeywords.push(keyword);
    } else {
      missedKeywords.push(keyword);
    }
  });

  const correctCount = matchedKeywords.length;
  const totalCount = keywords.length;
  const percentage = Math.round((correctCount / totalCount) * 100);

  return {
    isAllCorrect: correctCount === totalCount,
    correctCount,
    totalCount,
    percentage,
    matchedKeywords,
    missedKeywords
  };
};

/**
 * 모든 키워드가 입력되었는지 확인 (실시간 채점용)
 * @param {Object} keywordInputs - { "keyword": "user input", ... }
 * @param {Array<string>} keywords - 정답 키워드 배열
 * @returns {boolean} 모든 키워드 입력 완료 여부
 */
export const areAllKeywordsFilled = (keywordInputs, keywords) => {
  if (!keywords || keywords.length === 0) return false;

  return keywords.every(keyword => {
    const normalizedKeyword = keyword.toLowerCase().trim();
    const userInput = keywordInputs[normalizedKeyword];
    return userInput && userInput.trim() !== '';
  });
};

/**
 * 모든 키워드가 정답인지 확인 (실시간 채점용)
 * @param {Object} keywordInputs - { "keyword": "user input", ... }
 * @param {Array<string>} keywords - 정답 키워드 배열
 * @returns {boolean} 모든 키워드 정답 여부
 */
export const areAllKeywordsCorrect = (keywordInputs, keywords) => {
  if (!keywords || keywords.length === 0) return false;

  return keywords.every(keyword => {
    const normalizedKeyword = keyword.toLowerCase().trim();
    const userInput = keywordInputs[normalizedKeyword];
    return validateKeywordRealtime(userInput, keyword);
  });
};
