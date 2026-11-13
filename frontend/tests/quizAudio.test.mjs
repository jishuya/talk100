import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuizAudioPlayer, getQuizAudioError } from '../src/utils/quizAudio.js';

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const fixture = () => {
  const results = [];
  const audio = { error: null, loads: 0, load() { this.loads++; }, play: () => Promise.resolve() };
  const callbacks = { isCurrent: () => true, onReady: () => results.push('ready'), onError: message => results.push(message) };
  return { audio, callbacks, results, player: createQuizAudioPlayer() };
};
test('interruption and autoplay blocking are distinct from media load failure', () => {
  assert.equal(getQuizAudioError({ name: 'AbortError' }), null);
  assert.equal(getQuizAudioError(null, { code: 1 }), null);
  assert.match(getQuizAudioError({ name: 'NotAllowedError' }), /자동재생/);
  assert.match(getQuizAudioError(null, { code: 2 }), /연결/);
  assert.match(getQuizAudioError(null, { code: 3 }), /읽을/);
  assert.match(getQuizAudioError(null, { code: 4 }), /형식/);
});
test('normal playback preserves preloading and requested speed', async () => {
  const { player, audio, callbacks, results } = fixture();
  await player.play(audio, 0.8, callbacks);
  assert.equal(audio.loads, 0);
  assert.equal(audio.playbackRate, 0.8);
  assert.equal(audio.currentTime, 0);
  assert.deepEqual(results, ['ready']);
});
test('retry reloads a media error and clears it on successful playback', async () => {
  const { player, audio, callbacks, results } = fixture();
  audio.error = { code: 2 };
  await player.play(audio, 1, callbacks);
  assert.equal(audio.loads, 1);
  assert.deepEqual(results, ['ready']);
});
test('late failure after problem change or cancellation cannot set an error', async () => {
  for (const mode of ['cancel', 'source']) {
    const { player, audio, callbacks, results } = fixture();
    const pending = deferred();
    audio.play = () => pending.promise;
    let current = true;
    callbacks.isCurrent = () => current;
    const playing = player.play(audio, 1, callbacks);
    if (mode === 'cancel') player.cancel();
    else current = false;
    pending.reject(new Error('old playback failed'));
    await playing;
    assert.deepEqual(results, []);
  }
});
test('rapid replay ignores the older request failure', async () => {
  const { player, audio, callbacks, results } = fixture();
  const first = deferred();
  audio.play = () => first.promise;
  const old = player.play(audio, 1, callbacks);
  audio.play = () => Promise.resolve();
  await player.play(audio, 0.8, callbacks);
  first.reject(new Error('stale'));
  await old;
  assert.deepEqual(results, ['ready']);
});
test('intentional interruption is silent while autoplay failure gets actionable feedback', async () => {
  const { player, audio, callbacks, results } = fixture();
  audio.play = () => Promise.reject({ name: 'AbortError' });
  await player.play(audio, 1, callbacks);
  assert.deepEqual(results, []);
  audio.play = () => Promise.reject({ name: 'NotAllowedError' });
  await player.play(audio, 1, callbacks);
  assert.match(results[0], /다시 듣기/);
});
