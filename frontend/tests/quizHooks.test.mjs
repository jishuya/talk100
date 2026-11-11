import test from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';

test('quiz feedback hooks run at component level, never inside an input handler', async () => {
  const eslint = new ESLint({ cwd: fileURLToPath(new URL('..', import.meta.url)) });
  const results = await eslint.lintFiles(['src/pages/QuizPage.jsx']);
  const violations = results.flatMap(result => result.messages)
    .filter(message => message.ruleId === 'react-hooks/rules-of-hooks');
  assert.deepEqual(violations, []);
});
