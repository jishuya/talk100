import { useState, useCallback } from 'react';
import {
  validateKeywordRealtime,
  gradeKeyboardAnswer,
  gradeVoiceAnswer,
  areAllKeywordsCorrect
} from '../utils/grading';

/**
 * 퀴즈 채점 커스텀 훅
 *
 * 두 가지 채점 방식 제공:
 * 1. 실시간 채점: checkKeyword()
 * 2. 제출 버튼 채점: submitAnswer()
 */
export const useQuizGrading = (question, inputMode) => {
  const [gradingResult, setGradingResult] = useState(null);

  /**
   * 1️⃣ 실시간 채점: 개별 키워드 검증
   * @param {string} userInput - 사용자 입력값
   * @param {string} keyword - 정답 키워드
   * @returns {boolean} 정답 여부
   */
  const checkKeyword = useCallback((userInput, keyword) => {
    return validateKeywordRealtime(userInput, keyword);
  }, []);

  /**
   * 실시간 채점: 모든 키워드 정답 확인
   * @param {Object} keywordInputs - { "keyword": "user input", ... }
   * @returns {boolean} 모든 키워드 정답 여부
   */
  const checkAllKeywords = useCallback((keywordInputs) => {
    if (!question?.keywords) return false;
    return areAllKeywordsCorrect(keywordInputs, question.keywords);
  }, [question?.keywords]);

  /**
   * 2️⃣ 제출 버튼 채점: 전체 답안 검증
   * @param {Object} keywordInputs - 키보드 모드용 입력값
   * @param {string} userAnswer - 음성 모드용 입력값
   * @returns {Object} 채점 결과
   */
  const submitAnswer = useCallback((keywordInputs, userAnswer) => {
    if (!question?.keywords) {
      return {
        isAllCorrect: false,
        correctCount: 0,
        totalCount: 0,
        percentage: 0
      };
    }

    let result;

    if (inputMode === 'keyboard') {
      result = gradeKeyboardAnswer(keywordInputs, question.keywords);
    } else {
      result = gradeVoiceAnswer(userAnswer, question.keywords);
    }

    setGradingResult(result);
    return result;
  }, [question?.keywords, inputMode]);

  /**
   * 채점 결과 초기화
   */
  const resetGrading = useCallback(() => {
    setGradingResult(null);
  }, []);

  return {
    gradingResult,
    checkKeyword,        // 실시간 개별 키워드 검증
    checkAllKeywords,    // 실시간 전체 키워드 검증
    submitAnswer,        // 제출 버튼 채점
    resetGrading         // 채점 결과 초기화
  };
};
