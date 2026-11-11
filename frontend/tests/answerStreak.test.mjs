import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnswerStreak } from '../src/utils/answerStreak.js';

test('3, 5 and 10 unique correct answers replace ordinary success sounds', () => {
  const streak = createAnswerStreak();
  for (let id = 1; id <= 11; id++) {
    const expected = [3, 5, 10].includes(id) ? `streak${id}` : 'success';
    assert.deepEqual(streak.correct(id), { count: id, sound: expected });
    assert.equal(streak.correct(id), null);
  }
});

test('wrong answers and revealed answers break the streak; retries do not count', () => {
  const streak = createAnswerStreak();
  streak.correct(1);
  streak.correct(2);
  streak.fail(3);
  assert.deepEqual(streak.correct(3), { count: 0, sound: 'success' });
  assert.deepEqual(streak.correct(4), { count: 1, sound: 'success' });
  assert.equal(streak.correct(null), null);
  assert.deepEqual(createAnswerStreak().correct(4), { count: 1, sound: 'success' });
});
