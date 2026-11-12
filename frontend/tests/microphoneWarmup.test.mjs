import test from 'node:test';
import assert from 'node:assert/strict';
import { createMicrophoneWarmup } from '../src/utils/microphoneWarmup.js';

const fakeStream = () => {
  const track = { readyState: 'live', stops: 0, stop() { this.readyState = 'ended'; this.stops++; } };
  return { track, getTracks: () => [track], getAudioTracks: () => [track] };
};

test('warmup holds one live microphone between attempts without creating recordings', async () => {
  const stream = fakeStream();
  let calls = 0;
  const mic = createMicrophoneWarmup(async constraints => {
    assert.deepEqual(constraints, { audio: true });
    calls++;
    return stream;
  });
  await Promise.all([mic.prepare(), mic.prepare()]);
  await mic.prepare();
  assert.equal(calls, 1);
  assert.equal(stream.track.stops, 0);
  mic.release();
  assert.equal(stream.track.stops, 1);
});

test('leaving voice mode while permission is pending releases the eventual stream', async () => {
  let grant;
  const mic = createMicrophoneWarmup(() => new Promise(resolve => { grant = resolve; }));
  const pending = mic.prepare();
  await Promise.resolve();
  mic.release();
  const stream = fakeStream();
  grant(stream);
  assert.equal(await pending, false);
  assert.equal(stream.track.readyState, 'ended');
});

test('an old permission response cannot replace the microphone of a new visit', async () => {
  const grants = [];
  const mic = createMicrophoneWarmup(() => new Promise(resolve => grants.push(resolve)));
  const old = mic.prepare();
  await Promise.resolve();
  mic.release();
  const current = mic.prepare();
  await Promise.resolve();
  const oldStream = fakeStream();
  const currentStream = fakeStream();
  grants[1](currentStream);
  assert.equal(await current, true);
  grants[0](oldStream);
  assert.equal(await old, false);
  assert.equal(oldStream.track.stops, 1);
  assert.equal(currentStream.track.stops, 0);
  mic.release();
  assert.equal(currentStream.track.stops, 1);
});

test('permission failure is retryable and an ended device is reacquired', async () => {
  let calls = 0;
  const streams = [fakeStream(), fakeStream()];
  const mic = createMicrophoneWarmup(async () => {
    calls++;
    if (calls === 1) throw new Error('permission denied');
    return streams[calls - 2];
  });
  assert.equal(await mic.prepare(), false);
  assert.equal(await mic.prepare(), true);
  streams[0].track.readyState = 'ended';
  assert.equal(await mic.prepare(), true);
  assert.equal(calls, 3);
  mic.release();
});
