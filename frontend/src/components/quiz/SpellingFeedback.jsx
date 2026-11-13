import { compareSpelling } from '../../utils/spellingFeedback';

export default function SpellingFeedback({ value, answer, hidden, id }) {
  if (hidden) return null;
  const result = compareSpelling(value, answer);
  if (result.isCorrect) return null;
  return (
    <span id={id} role="status" aria-live="polite" className="absolute bottom-full left-1/2 z-30 mb-3 block w-max max-w-[min(240px,75vw)] -translate-x-1/2 cursor-default rounded-2xl border border-rose-200 bg-gradient-to-br from-white to-rose-50 px-4 py-3 text-xs font-medium text-rose-700 shadow-[0_6px_20px_rgba(225,100,125,0.16)]">
      {value && <span className="mb-1.5 block break-all text-base tracking-wide" aria-hidden="true">
        {result.parts.map((part, index) => <span key={index} className={part.type === 'correct' ? 'text-slate-600' : 'rounded bg-rose-100 px-0.5 font-bold text-rose-600 underline decoration-rose-300 underline-offset-4'}>{part.text}</span>)}
      </span>}
      <span className="flex items-center gap-1.5 font-semibold">
        <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-500">!</span>
        {result.message}
      </span>
      <span aria-hidden="true" className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-rose-200 bg-rose-50" />
    </span>
  );
}
