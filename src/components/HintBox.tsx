import { useStrings } from '../i18n';

export function HintBox({ hints, shown, onReveal }: { hints: string[]; shown: number; onReveal: () => void }) {
  const t = useStrings();
  if (hints.length === 0) return null;
  return (
    <div className="hints">
      {hints.slice(0, shown).map((h, k) => (
        <p key={k} className="hint">
          <strong>{t.hint(k + 1)}</strong> {h}
        </p>
      ))}
      {shown < hints.length && (
        <button type="button" className="btn small ghost" onClick={onReveal}>
          {t.showHint(shown + 1, hints.length)}
        </button>
      )}
    </div>
  );
}
