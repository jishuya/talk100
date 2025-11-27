/**
 * 음원 관련 유틸리티 함수들
 */

import { ENV } from '../config/environment';

/**
 * 음원 파일명으로부터 전체 URL 생성
 * @param {string} audioFilename - questions.audio 컬럼 값 (예: '001_01.mp3')
 * @returns {string|null} 전체 음원 URL 또는 null
 */
export const getAudioUrl = (audioFilename) => {
  if (!audioFilename) return null;

  return `${ENV.API_BASE_URL}/audio/${audioFilename}`;
};

/**
 * 음원 프리로드 (다음 문제 미리 로딩용)
 * @param {string} audioFilename - 음원 파일명
 * @returns {HTMLAudioElement} Audio 엘리먼트
 */
export const preloadAudio = (audioFilename) => {
  if (!audioFilename) return null;

  const audioUrl = getAudioUrl(audioFilename);
  const audio = new Audio(audioUrl);
  audio.preload = 'auto';
  return audio;
};

/**
 * 음원 재생 가능 여부 체크
 * @param {string} audioFilename - 음원 파일명
 * @returns {Promise<boolean>} 재생 가능 여부
 */
export const checkAudioAvailable = async (audioFilename) => {
  if (!audioFilename) return false;

  try {
    const audioUrl = getAudioUrl(audioFilename);
    const response = await fetch(audioUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Audio availability check failed:', error);
    return false;
  }
};
