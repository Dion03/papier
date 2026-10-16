import { useLabels } from '../lib/labels';
import { Spinner as SpinnerIcon } from './icons';

/** A standalone loading indicator with an announced label. Inside a Button, use `loading`. */
export function Spinner({ label, size = 22 }: { label?: string; size?: number }) {
  const labels = useLabels();
  return (
    <span className="pp-spinner-wrap" role="status">
      <SpinnerIcon width={size} height={size} />
      <span className="pp-visually-hidden">{label ?? labels.loading}</span>
    </span>
  );
}
