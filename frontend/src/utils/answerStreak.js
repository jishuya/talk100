// A question counts once, including when voice recognition emits repeat results.
export const createAnswerStreak = () => {
  const counted = new Set();
  const failed = new Set();
  let count = 0;
  return {
    fail(questionId) {
      failed.add(questionId);
      count = 0;
    },
    correct(questionId) {
      if (questionId == null || counted.has(questionId)) return null;
      counted.add(questionId);
      if (failed.has(questionId)) return { count: 0, sound: 'success' };
      count += 1;
      return { count, sound: [3, 5, 10].includes(count) ? `streak${count}` : 'success' };
    },
  };
};
