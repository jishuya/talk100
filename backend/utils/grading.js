/**
 * 답변 채점 유틸리티
 * Keywords 기반 부분 점수 채점 시스템
 */

// 난이도별 통과 기준
const PASSING_SCORES = {
  1: 50,  // 초급
  2: 70,  // 중급
  3: 90   // 고급
};

/**
 * 메인 채점 엔진: 사용자 답변을 키워드 기반으로 채점
 * @param {string} userAnswer - 사용자가 입력한 답변
 * @param {Object} question - 문제 객체 (keywords 포함)
 * @param {number} difficulty - 난이도 (1: 초급, 2: 중급, 3: 고급)
 * @returns {Object} 채점 결과
 */
function gradeAnswer(userAnswer, question, difficulty = 2) {
  if (!userAnswer || !question || !question.keywords) {
    return {
      isCorrect: false,
      score: 0,
      matchedCount: 0,
      totalKeywords: 0,
      matchedKeywords: [],
      missedKeywords: [],
      message: 'Invalid input for grading'
    };
  }

  // a. 텍스트 정규화(normalizeText)
  const keywords = question.keywords;
  const normalizedAnswer = normalizeText(userAnswer);

  let matchedKeywords = [];
  let missedKeywords = [];

  // b. 각 키워드가 답변에 포함되어 있는지 확인
  keywords.forEach(keyword => {
    const normalizedKeyword = keyword.toLowerCase().trim();
    if (normalizedAnswer.includes(normalizedKeyword)) {
      matchedKeywords.push(keyword);
    } else {
      missedKeywords.push(keyword);
    }
  });

  // c. 점수 계산: (매칭 키워드 / 전체 키워드) × 100
  const matchedCount = matchedKeywords.length;
  const totalKeywords = keywords.length;
  const score = totalKeywords > 0 ? Math.round((matchedCount / totalKeywords) * 100) : 0;

  // b. 난이도별 통과 여부 판단
  const passingScore = PASSING_SCORES[difficulty] || PASSING_SCORES[2];
  const isCorrect = score >= passingScore;

  return {
    isCorrect,
    score,
    matchedCount,
    totalKeywords,
    matchedKeywords,
    missedKeywords,
    passingScore,
    difficulty,
    message: generateFeedbackMessage(isCorrect, score, matchedCount, totalKeywords)
  };
}

/**
 * 채점을위한 텍스트전처리기 : 소문자 변환, 공백 정리, 구두점 제거, 따옴표 동일
 * @param {string} text - 정규화할 텍스트
 * @returns {string} 정규화된 텍스트
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .trim()
    // 따옴표 통일
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    // 연속된 공백을 하나로
    .replace(/\s+/g, ' ')
    // 구두점 제거 (선택적)
    .replace(/[.,!?;:]/g, ' ')
    // 다시 연속 공백 정리
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 채점 결과에 맞춤형 피드백 제공
 * @param {boolean} isCorrect - 정답 여부
 * @param {number} score - 점수
 * @param {number} matchedCount - 매치된 키워드 수
 * @param {number} totalKeywords - 전체 키워드 수
 * @returns {string} 피드백 메시지
 */
function generateFeedbackMessage(isCorrect, score, matchedCount, totalKeywords) {
  if (isCorrect) {
    if (score === 100) {
      return 'Perfect! All keywords matched correctly.';
    } else {
      return `Great job! You got ${matchedCount} out of ${totalKeywords} key points.`;
    }
  } else {
    if (score === 0) {
      return 'Try again. Make sure to include the key vocabulary words.';
    } else {
      return `Good effort! You included ${matchedCount} key points, but need ${totalKeywords - matchedCount} more.`;
    }
  }
}

/**
 * 대화형 문제의 채점 (전체 대화의 키워드 매칭률로 점수 계산)
 * @param {string} userAnswerA - 사용자가 입력한 A의 답변
 * @param {string} userAnswerB - 사용자가 입력한 B의 답변
 * @param {Object} question - 문제 객체
 * @param {number} difficulty - 난이도
 * @returns {Object} 대화형 채점 결과
 */
function gradeDialogueAnswer(userAnswerA, userAnswerB, question, difficulty = 2) {
  if (!userAnswerA || !userAnswerB || !question || !question.keywords) {
    return {
      isCorrect: false,
      score: 0,
      matchedCount: 0,
      totalKeywords: 0,
      matchedKeywords: [],
      missedKeywords: [],
      message: 'Invalid input for dialogue grading'
    };
  }

  // 전체 대화의 모든 키워드 (A파트 + B파트)
  const allKeywords = question.keywords;

  // 사용자의 전체 답변 (A답변 + B답변 합치기)
  const combinedUserAnswer = `${userAnswerA} ${userAnswerB}`;
  const normalizedCombinedAnswer = normalizeText(combinedUserAnswer);

  let matchedKeywords = [];
  let missedKeywords = [];

  // 전체 답변에서 모든 키워드 매칭 확인
  allKeywords.forEach(keyword => {
    const normalizedKeyword = keyword.toLowerCase().trim();
    if (normalizedCombinedAnswer.includes(normalizedKeyword)) {
      matchedKeywords.push(keyword);
    } else {
      missedKeywords.push(keyword);
    }
  });

  const matchedCount = matchedKeywords.length;
  const totalKeywords = allKeywords.length;
  const score = totalKeywords > 0 ? Math.round((matchedCount / totalKeywords) * 100) : 0;

  // 난이도별 통과 여부 판단
  const passingScore = PASSING_SCORES[difficulty] || PASSING_SCORES[2];
  const isCorrect = score >= passingScore;

  return {
    isCorrect,
    score,
    matchedCount,
    totalKeywords,
    matchedKeywords,
    missedKeywords,
    passingScore,
    difficulty,
    message: generateFeedbackMessage(isCorrect, score, matchedCount, totalKeywords),
    dialogueDetails: {
      userAnswerA,
      userAnswerB,
      combinedAnswer: combinedUserAnswer
    }
  };
}

/**
 * 텍스트에서 키워드를 추출합니다 (간단한 버전)
 * @param {string} text - 키워드를 추출할 텍스트
 * @returns {Array} 추출된 키워드 배열
 */
function extractKeywordsFromText(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // 간단한 키워드 추출: 3글자 이상의 단어들
  return text
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .split(/\s+/)
    .filter(word => word.length >= 3)
    .slice(0, 5); // 최대 5개
}

/**
 * 채점 통계를 계산합니다
 * @param {Array} gradeResults - 채점 결과 배열
 * @returns {Object} 통계 정보
 */
function calculateGradingStats(gradeResults) {
  if (!gradeResults || gradeResults.length === 0) {
    return {
      totalAttempts: 0,
      correctAnswers: 0,
      averageScore: 0,
      accuracyRate: 0
    };
  }

  const totalAttempts = gradeResults.length;
  const correctAnswers = gradeResults.filter(result => result.isCorrect).length;
  const totalScore = gradeResults.reduce((sum, result) => sum + result.score, 0);
  const averageScore = Math.round(totalScore / totalAttempts);
  const accuracyRate = Math.round((correctAnswers / totalAttempts) * 100);

  return {
    totalAttempts,
    correctAnswers,
    averageScore,
    accuracyRate
  };
}

module.exports = {
  gradeAnswer,
  gradeDialogueAnswer,
  normalizeText,
  generateFeedbackMessage,
  extractKeywordsFromText,
  calculateGradingStats,
  PASSING_SCORES
};