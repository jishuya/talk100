import test from 'node:test';
import assert from 'node:assert/strict';
import { getVisibleKeywords } from '../src/utils/quizKeywords.js';
import { areAllKeywordsCorrect, gradeKeyboardAnswer } from '../src/utils/grading.js';

test('a displayed first blank passes both automatic and submitted grading', () => {
  const keywords = getVisibleKeywords(
    "Wait! Is this your first boyfriend? You're 25 years old!",
    ['first', 'twenty-five']
  );
  assert.deepEqual(keywords, ['first']);
  assert.equal(areAllKeywordsCorrect({ first: 'first' }, keywords), true);
  const result = gradeKeyboardAnswer({ first: 'first' }, keywords);
  assert.equal(result.isAllCorrect, true);
  assert.equal(result.totalCount, 1);
  assert.equal(areAllKeywordsCorrect({ first: 'firs' }, keywords), false);
});

test('visible keywords respect punctuation, normalization and whole words', () => {
  assert.deepEqual(getVisibleKeywords('Wait! Your first boyfriend?',
    [' WAIT ', 'first', 'boyfriend', 'boy', 'FIRST']), ['wait', 'first', 'boyfriend']);
  assert.deepEqual(getVisibleKeywords('', ['first']), []);
  assert.equal(areAllKeywordsCorrect({}, []), false);
});
