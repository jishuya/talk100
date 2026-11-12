import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoiceRecognition } from '../src/utils/voiceRecognition.js';

const result = (text, isFinal) => Object.assign([{ transcript: text }], { isFinal });
const setup = () => {
  const instances = [];
  const snapshots = [];
  const recording = [];
  class Recognition {
    constructor() { instances.push(this); }
    start() { this.starts = (this.starts || 0) + 1; }
    stop() { this.stopped = true; }
    abort() { this.aborted = true; }
  }
  const controller = createVoiceRecognition(Recognition, state => snapshots.push(state), value => recording.push(value));
  return { controller, instances, recording, latest: () => snapshots.at(-1), snapshots };
};

test('start locks synchronously and stop retains final results until microphone ends', () => {
  const { controller, instances, latest, recording } = setup();
  controller.start();
  controller.start();
  assert.equal(instances.length, 1);
  assert.equal(latest().status, 'starting');
  const recognition = instances[0];
  recognition.onstart();
  controller.stop();
  controller.start();
  assert.equal(instances.length, 1);
  assert.equal(latest().status, 'stopping');
  recognition.onresult({ results: [result('hello', true)] });
  assert.equal(latest().transcript, 'hello');
  assert.equal(recording.at(-1), true);
  recognition.onend();
  assert.equal(latest().status, 'idle');
  assert.equal(recording.at(-1), false);
});

test('whole session survives changed resultIndex and interim revisions never count as final', () => {
  const { controller, instances, latest } = setup();
  controller.start();
  const recognition = instances[0];
  recognition.onresult({ resultIndex: 0, results: [result('I want', true), result('two go', false)] });
  assert.equal(latest().transcript, 'I want');
  assert.equal(latest().interimTranscript, 'two go');
  recognition.onresult({ resultIndex: 1, results: [result('I want', true), result('to go shopping', true)] });
  assert.equal(latest().transcript, 'I want to go shopping');
  assert.equal(latest().interimTranscript, '');
  assert.equal(recognition.stopped, undefined);
});

test('reset ignores late results and an old session cannot change a new session', () => {
  const { controller, instances, latest } = setup();
  controller.start();
  const old = instances[0];
  controller.reset();
  assert.equal(old.aborted, true);
  old.onresult({ results: [result('old answer', true)] });
  assert.equal(latest().transcript, '');
  old.onend();
  controller.start();
  old.onend();
  assert.equal(latest().status, 'starting');
  controller.dispose();
  assert.equal(instances[1].aborted, true);
});

test('recognition errors wait for end before allowing retry', () => {
  const { controller, instances, latest } = setup();
  controller.start();
  instances[0].onerror({ error: 'not-allowed' });
  assert.match(latest().error, /권한/);
  controller.start();
  assert.equal(instances.length, 1);
  instances[0].onend();
  controller.start();
  assert.equal(instances.length, 2);
  assert.equal(latest().error, null);
});

test('service start stays preparing until microphone capture actually starts', () => {
  const { controller, instances, latest } = setup();
  controller.start();
  const recognition = instances[0];
  recognition.onstart();
  assert.equal(latest().status, 'starting');
  recognition.onaudiostart();
  assert.equal(latest().status, 'listening');
  // Event order varies: delayed service start must not undo capture readiness.
  recognition.onstart();
  assert.equal(latest().status, 'listening');
});

test('audio evidence handles omitted audiostart and late capture cannot undo cancellation', () => {
  const { controller, instances, latest } = setup();
  controller.start();
  instances[0].onsoundstart();
  assert.equal(latest().status, 'listening');
  controller.reset();
  instances[0].onaudiostart();
  instances[0].onspeechstart();
  assert.equal(latest().status, 'stopping');
  assert.equal(latest().transcript, '');
});
