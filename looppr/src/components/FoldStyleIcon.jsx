// Simple line-art illustrations for each fold style option, shown alongside
// the label/description in FoldStylePicker so customers can see what they're
// choosing rather than guessing from the name alone.
export default function FoldStyleIcon({ type, className = 'h-10 w-10' }) {
  const shared = {
    className,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  if (type === 'konmari') {
    return (
      <svg {...shared}>
        <line x1="6" y1="40" x2="42" y2="40" />
        <rect x="9" y="17" width="8" height="23" rx="2" />
        <line x1="9" y1="27" x2="17" y2="27" />
        <rect x="20" y="10" width="8" height="30" rx="2" />
        <line x1="20" y1="23" x2="28" y2="23" />
        <rect x="31" y="19" width="8" height="21" rx="2" />
        <line x1="31" y1="28" x2="39" y2="28" />
      </svg>
    )
  }

  if (type === 'hangers') {
    return (
      <svg {...shared}>
        <circle cx="24" cy="7" r="1.75" fill="currentColor" stroke="none" />
        <path d="M24 9v4" />
        <path d="M9 23 24 13l15 10" />
        <path d="M13 23 11 37q13 6 26 0l-2-14" />
      </svg>
    )
  }

  // 'standard' — folded flat, sleeves tucked in
  return (
    <svg {...shared}>
      <rect x="10" y="15" width="28" height="23" rx="3" />
      <path d="M18 15 24 21 30 15" />
      <path d="M10 21 16 25 10 29" />
      <path d="M38 21 32 25 38 29" />
    </svg>
  )
}
