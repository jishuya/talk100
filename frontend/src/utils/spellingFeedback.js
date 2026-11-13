import { normalizeGradingText } from './grading.js';

// Align insertions/deletions so one missing letter does not mark the suffix wrong.
export const compareSpelling = (input, answer) => {
  const actual = [...normalizeGradingText(input)];
  const expected = [...normalizeGradingText(answer)];
  const costs = Array.from({ length: actual.length + 1 }, () => Array(expected.length + 1).fill(0));
  for (let i = 0; i <= actual.length; i++) costs[i][0] = i;
  for (let j = 0; j <= expected.length; j++) costs[0][j] = j;
  for (let i = 1; i <= actual.length; i++) {
    for (let j = 1; j <= expected.length; j++) {
      costs[i][j] = Math.min(costs[i - 1][j] + 1, costs[i][j - 1] + 1,
        costs[i - 1][j - 1] + (actual[i - 1] === expected[j - 1] ? 0 : 1));
    }
  }
  const parts = [];
  let missing = 0, extra = 0, replaced = 0;
  let i = actual.length, j = expected.length;
  while (i || j) {
    if (i && j && costs[i][j] === costs[i - 1][j - 1] + (actual[i - 1] === expected[j - 1] ? 0 : 1)) {
      const correct = actual[i - 1] === expected[j - 1];
      parts.unshift({ text: actual[i - 1], type: correct ? 'correct' : 'different' });
      if (!correct) replaced++;
      i--; j--;
    } else if (i && costs[i][j] === costs[i - 1][j] + 1) {
      parts.unshift({ text: actual[i - 1], type: 'different' });
      extra++; i--;
    } else {
      parts.unshift({ text: '＿', type: 'missing' });
      missing++; j--;
    }
  }
  const distance = costs[actual.length][expected.length];
  const isCorrect = expected.length > 0 && distance === 0;
  const message = !actual.length ? '빈칸에 답을 입력해주세요.'
    : isCorrect ? '정확해요!'
    : missing && !extra && !replaced ? `${missing}글자가 부족해요.`
    : extra && !missing && !replaced ? `${extra}글자가 더 있어요.`
    : `정답과 ${distance}글자 달라요.`;
  return { parts, distance, missing, extra, replaced, isCorrect, message };
};
