export function HintBox({ hints, shown, onReveal }: { hints: string[]; shown: number; onReveal: () => void }) {
  if (hints.length === 0) return null;
  return (
    <div className="hints">
      {hints.slice(0, shown).map((h, k) => (
        <p key={k} className="hint">
          <strong>Hint {k + 1}:</strong> {h}
        </p>
      ))}
      {shown < hints.length && (
        <button type="button" className="btn small ghost" onClick={onReveal}>
          💡 Show hint {shown + 1} of {hints.length}
        </button>
      )}
    </div>
  );
}
