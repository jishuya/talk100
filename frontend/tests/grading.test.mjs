import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateKeywordRealtime, areAllKeywordsCorrect, gradeKeyboardAnswer, gradeVoiceAnswer
} from '../src/utils/grading.js';

test('hyphenated answers accept input with or without hyphens in every grading path', () => {
  for (const answer of ['twenty-five', 'twentyfive', ' TwentyFive ']) {
    const inputs = { 'twenty-five': answer };
    assert.equal(validateKeywordRealtime(answer, 'twenty-five'), true);
    assert.equal(areAllKeywordsCorrect(inputs, ['twenty-five']), true);
    assert.equal(gradeKeyboardAnswer(inputs, ['twenty-five']).isAllCorrect, true);
    assert.equal(gradeVoiceAnswer(`I am ${answer} years old`, ['twenty-five']).isAllCorrect, true);
  }
});

test('missing letters and empty answers remain incorrect', () => {
  for (const answer of ['twenty-fiv', '', '-']) {
    assert.equal(validateKeywordRealtime(answer, 'twenty-five'), false);
    assert.equal(gradeKeyboardAnswer({ 'twenty-five': answer }, ['twenty-five']).isAllCorrect, false);
  }
  assert.equal(validateKeywordRealtime('FIRST', 'first'), true);
  assert.equal(validateKeywordRealtime('-', '-'), false);
});
