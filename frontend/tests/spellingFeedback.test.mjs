import test from 'node:test';
import assert from 'node:assert/strict';
import { compareSpelling } from '../src/utils/spellingFeedback.js';
import { validateKeywordRealtime } from '../src/utils/grading.js';

test('one substitution highlights only the incorrect input letter', () => {
  const result = compareSpelling('destinatioh', 'destination');
  assert.equal(result.message, '정답과 1글자 달라요.');
  assert.deepEqual(result.parts.filter(part => part.type !== 'correct'), [{ text: 'h', type: 'different' }]);
});
test('a missing middle letter keeps the remaining suffix aligned without revealing the answer', () => {
  const result = compareSpelling('destnation', 'destination');
  assert.equal(result.message, '1글자가 부족해요.');
  assert.equal(result.parts.filter(part => part.type === 'different').length, 0);
  assert.deepEqual(result.parts.filter(part => part.type === 'missing'), [{ text: '＿', type: 'missing' }]);
});
test('extra letters, mixed errors and empty input receive accurate messages', () => {
  assert.equal(compareSpelling('destinationn', 'destination').message, '1글자가 더 있어요.');
  assert.equal(compareSpelling('cotx', 'cat').distance, 2);
  assert.equal(compareSpelling('', 'cat').message, '빈칸에 답을 입력해주세요.');
});
test('feedback agrees with grading normalization', () => {
  for (const [input, expected] of [[' TwentyFive ', 'twenty-five'], ['CAT', 'cat'], ['ca', 'cat'], ['-', '-']]) {
    assert.equal(compareSpelling(input, expected).isCorrect, validateKeywordRealtime(input, expected));
  }
});
