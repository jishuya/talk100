import quizStartUrl from '../assets/sounds/quiz-start.mp3';
import { ENV } from '../config/environment';

const STORAGE_KEY = 'talk100-sound-settings';
const defaults = { enabled: true, volume: 0.35 };
const sounds = {
  click: 'kenney/click_003.wav',
  recordingStart: 'kenney/pluck_001.wav',
  recordingStop: 'kenney/click_001.wav',
  quizStart: 'kenney-jingles/quiz-start.mp3',
  select: 'kenney/select_001.wav',
  favorite: 'rewards/favorite.wav',
  success: 'successed.mp3',
  error: 'error.mp3',
  celebrate: 'celebrate.mp3',
  streak3: 'rewards/streak-3.wav',
  streak5: 'rewards/streak-5.wav',
  streak10: 'rewards/streak-10.wav',
  dayComplete: 'rewards/day-complete.wav',
};
let settings = defaults;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved) settings = {
    enabled: typeof saved.enabled === 'boolean' ? saved.enabled : defaults.enabled,
    volume: Number.isFinite(saved.volume) ? Math.max(0, Math.min(1, saved.volume)) : defaults.volume,
  };
} catch { /* Storage may be unavailable. */ }
const listeners = new Set();
const cache = new Map();
let active = null;
let recording = false;
let lastInteraction = -Infinity;
let rewardUntil = -Infinity;
let rewardPriority = 0;
const priorities = { success: 1, error: 1, streak3: 2, streak5: 2, streak10: 2, dayComplete: 3, celebrate: 4 };

export const getSoundSettings = () => settings;
export const subscribeSoundSettings = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const stopEffectSound = () => {
  active?.pause();
  active = null;
};
export const updateSoundSettings = (updates) => {
  settings = { ...settings, ...updates };
  settings.volume = Math.max(0, Math.min(1, settings.volume));
  if (!settings.enabled || settings.volume === 0) stopEffectSound();
  if (active) active.volume = settings.volume;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* In-memory settings still work. */ }
  listeners.forEach(listener => listener());
};
export const setEffectRecording = (value) => {
  recording = value;
  if (value && !active?.dataset.recordingCue) stopEffectSound();
};
const getAudio = (type) => {
  if (!cache.has(type)) {
    // Start feedback ships with the UI, independently of backend deployment.
    const url = type === 'quizStart'
      ? quizStartUrl
      : `${ENV.API_BASE_URL}/audio/effect/${sounds[type]}`;
    const audio = new Audio(url);
    audio.preload = 'auto';
    cache.set(type, audio);
  }
  return cache.get(type);
};
export const preloadEffectSounds = () => {
  Object.keys(sounds).forEach(type => getAudio(type));
};
export const playEffectSound = (type) => {
  const recordingCue = type === 'recordingStart' || type === 'recordingStop';
  if (!sounds[type] || !settings.enabled || settings.volume === 0 || (recording && !recordingCue)) return;
  const interaction = ['click', 'select', 'favorite', 'quizStart'].includes(type);
  const now = performance.now();
  const priority = priorities[type] || 0;
  if (priority > 0 && priority < rewardPriority && now < rewardUntil) return;
  if (interaction && (now - lastInteraction < 80 || (active && !active.paused && active.dataset.reward))) return;
  if (interaction) lastInteraction = now;
  else if (!recordingCue) {
    rewardPriority = priority;
    rewardUntil = now + 1500;
  }
  stopEffectSound();
  const audio = getAudio(type);
  audio.currentTime = 0;
  audio.volume = settings.volume;
  audio.dataset.reward = !recordingCue && (!interaction || type === 'quizStart') ? 'true' : '';
  audio.dataset.recordingCue = recordingCue ? 'true' : '';
  active = audio;
  audio.play().catch(() => { if (active === audio) active = null; });
};
