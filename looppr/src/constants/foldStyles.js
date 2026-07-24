// Single source of truth for the fold style options — imported by the
// FoldStylePicker component and by anywhere that needs to look up a chosen
// value's label (Book.jsx's checkout summary, etc).
export const FOLD_STYLE_OPTIONS = [
  { value: 'standard', label: 'Standard fold', description: 'Folded flat & stacked' },
  { value: 'konmari', label: 'KonMari fold', description: 'Vertical, space-saving fold' },
  { value: 'hangers', label: 'On hangers', description: 'Hung to prevent wrinkles' },
]
