import { cn } from '../../utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  name: string;
  /** Hex color for the chip background; falls back to a stable palette pick from the name. */
  color?: string;
  size?: AvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-[11px]',
  md: 'h-11 w-11 text-[13px]',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

const PALETTE = [
  '#2563EB',
  '#16A34A',
  '#DC2626',
  '#F59E0B',
  '#0EA5E9',
  '#7C3AED',
  '#DB2777',
  '#059669',
];

function pickColor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

/** Initials from the first letters of the first two words (works for Persian names). */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '؟';
  const first = words[0][0] ?? '';
  const second = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${second}`;
}

function withAlpha(hex: string, alpha: string): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  return `#${normalized}${alpha}`;
}

export function Avatar({ name, color, size = 'md', className }: AvatarProps) {
  const background = color ?? pickColor(name);

  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-sans font-bold text-white ring-2 ring-white',
        SIZE_CLASSES[size],
        className,
      )}
      style={{ backgroundColor: background, boxShadow: `inset 0 0 0 1px ${withAlpha(background, '55')}` }}
    >
      {getInitials(name)}
    </span>
  );
}
