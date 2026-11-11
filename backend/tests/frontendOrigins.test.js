const test = require('node:test');
const assert = require('node:assert/strict');
const cors = require('cors');
const { getAllowedFrontendOrigins } = require('../config/frontendOrigins');

const preflightHeaders = (origin, env) => {
  const headers = {};
  cors({ origin: getAllowedFrontendOrigins(env), credentials: true })(
    { method: 'OPTIONS', headers: { origin, 'access-control-request-method': 'GET', 'access-control-request-headers': 'authorization' } },
    { setHeader: (key, value) => { headers[key.toLowerCase()] = value; }, getHeader: key => headers[key.toLowerCase()], end() {} },
    () => {}
  );
  return headers;
};

test('published app remains allowed with local development settings', () => {
  const env = { NODE_ENV: 'development', FRONTEND_URL: 'http://localhost:5173' };
  for (const origin of ['https://talk100.work', 'http://localhost:5173']) {
    const headers = preflightHeaders(origin, env);
    assert.equal(headers['access-control-allow-origin'], origin);
    assert.equal(headers['access-control-allow-credentials'], 'true');
  }
});

test('production permits the published app, but not arbitrary origins or localhost by default', () => {
  const env = { NODE_ENV: 'production' };
  assert.equal(preflightHeaders('https://talk100.work', env)['access-control-allow-origin'], 'https://talk100.work');
  for (const origin of ['https://untrusted.example', 'http://localhost:5173']) {
    assert.equal(preflightHeaders(origin, env)['access-control-allow-origin'], undefined);
  }
});
