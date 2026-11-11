import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('rewards respect priority, settings and recording suppression', async () => {
  globalThis.localStorage = { getItem: () => null, setItem() {} };
  const audios = [];
  globalThis.Audio = class {
    constructor(src) { this.src = src; this.dataset = {}; this.paused = true; this.plays = 0; audios.push(this); }
    play() { this.paused = false; this.plays++; return Promise.resolve(); }
    pause() { this.paused = true; }
  };
  const source = fs.readFileSync(new URL('../src/utils/soundEffects.js', import.meta.url), 'utf8')
    .replace("import { ENV } from '../config/environment';", "const ENV = { API_BASE_URL: 'https://example.test' };");
  const effects = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  effects.preloadEffectSounds();
  for (const audio of audios) {
    const relative = new URL(audio.src).pathname.replace('/audio/', '');
    assert.ok(fs.existsSync(new URL(`../../backend/public/audio/${relative}`, import.meta.url)), relative);
  }
  const audioFor = name => audios.find(a => a.src.endsWith(name));
  effects.playEffectSound('streak3');
  assert.equal(audioFor('streak-3.wav').plays, 1);
  effects.playEffectSound('dayComplete');
  assert.equal(audioFor('streak-3.wav').paused, true);
  assert.equal(audioFor('day-complete.wav').plays, 1);
  effects.playEffectSound('celebrate');
  assert.equal(audioFor('day-complete.wav').paused, true);
  effects.playEffectSound('dayComplete');
  assert.equal(audioFor('day-complete.wav').plays, 1);
  effects.setEffectRecording(true);
  assert.equal(audioFor('celebrate.mp3').paused, true);
  effects.playEffectSound('celebrate');
  assert.equal(audioFor('celebrate.mp3').plays, 1);
  effects.setEffectRecording(false);
  effects.updateSoundSettings({ enabled: false });
  effects.playEffectSound('celebrate');
  assert.equal(audioFor('celebrate.mp3').plays, 1);
  effects.updateSoundSettings({ enabled: true, volume: 0.2 });
  effects.playEffectSound('celebrate');
  assert.equal(audioFor('celebrate.mp3').volume, 0.2);
});
