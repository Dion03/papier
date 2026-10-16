import { forwardRef, useState } from 'react';
import { cx } from '../lib/cx';

export interface AvatarProps {
  /** The person's or artist's name: used as alt text and for the initials fallback. */
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  /** Set when the name is already written next to the avatar, to avoid saying it twice. */
  decorative?: boolean;
  className?: string;
}

const initials = (name: string) => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');

/** An image of a person, artist or cover, falling back to initials if it fails. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({ name, src, size = 'md', shape = 'circle', decorative, className }, ref) {
  const [failed, setFailed] = useState(false);
  const label = decorative ? undefined : name;
  return (
    <span ref={ref} className={cx('pp-avatar', className)} data-size={size} data-shape={shape} role={!src || failed ? (decorative ? undefined : 'img') : undefined}
      aria-label={!src || failed ? label : undefined} aria-hidden={decorative || undefined}>
      {src && !failed
        ? <img src={src} alt={decorative ? '' : name} onError={() => setFailed(true)} />
        : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  );
});
