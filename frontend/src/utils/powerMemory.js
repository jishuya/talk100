// Match the Korean text displayed for both sentence and dialogue favorites.
export const getAnswerWaitTime = (question, mode, manualSeconds) => {
  if (mode === 'manual') return manualSeconds;

  const korean = question?.korean || question?.korean_a || question?.korean_b || '';
  const characterCount = (korean.match(/[\p{L}\p{N}]/gu) || []).length;
  return Math.max(2, Math.ceil(1 + characterCount * 0.3));
};
