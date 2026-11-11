import { useSyncExternalStore } from 'react';
import { getSoundSettings, subscribeSoundSettings, updateSoundSettings, playEffectSound } from '../../utils/soundEffects';
import Button from '../ui/Button';

export default function SoundSettings() {
  const { enabled, volume } = useSyncExternalStore(subscribeSoundSettings, getSoundSettings);
  return (
    <section className="bg-white rounded-2xl p-4 mb-4 shadow-lg" aria-labelledby="sound-settings-title">
      <h2 id="sound-settings-title" className="font-semibold text-text-primary mb-3">효과음</h2>
      <label className="flex items-center justify-between text-sm text-text-primary">
        효과음 켜기
        <input type="checkbox" checked={enabled} onChange={event => updateSoundSettings({ enabled: event.target.checked })} className="w-5 h-5 accent-primary" />
      </label>
      <label className="block text-sm text-text-primary mt-4">
        효과음 볼륨 · {Math.round(volume * 100)}%
        <input type="range" min="0" max="100" step="5" value={Math.round(volume * 100)} disabled={!enabled}
          onChange={event => updateSoundSettings({ volume: Number(event.target.value) / 100 })}
          className="w-full mt-2 accent-primary" />
      </label>
      <p className="text-xs text-text-secondary mt-2">이 기기에 저장되며, 학습 음성 볼륨은 따로 유지돼요.</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {[['quizStart', '퀴즈 시작음'], ['click', '클릭음'], ['select', '선택음'], ['favorite', '즐겨찾기음'], ['streak3', '3연속'], ['streak5', '5연속'], ['streak10', '10연속'], ['dayComplete', 'Day 완료']].map(([type, label]) => (
          <Button key={type} size="sm" variant="secondary" sound={false} disabled={!enabled || volume === 0}
            onClick={() => playEffectSound(type)}>{label} 듣기</Button>
        ))}
      </div>
    </section>
  );
}
