import FoldStyleIcon from './FoldStyleIcon'
import { FOLD_STYLE_OPTIONS } from '../constants/foldStyles'

// Visual radio-card group for choosing a fold style, with an illustration per
// option so the choice is clear without relying on the name alone. Calls
// `onChange` with a synthetic {target:{name,value}} event so it drops
// straight into the same handleChange(e) handlers used by the rest of these
// forms' plain <input>/<select> fields.
export default function FoldStylePicker({ name, value, onChange, error }) {
  return (
    <div>
      <p className="block text-base font-medium text-ink/80">Fold style</p>
      <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {FOLD_STYLE_OPTIONS.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange({ target: { name, value: opt.value } })}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-4 text-center transition-colors ${
                selected
                  ? 'border-periwinkle bg-periwinkle-soft text-periwinkle-text'
                  : 'border-line bg-white text-ink/70 hover:border-periwinkle-muted'
              }`}
            >
              <FoldStyleIcon type={opt.value} className={`h-10 w-10 ${selected ? 'text-periwinkle-text' : 'text-ink/50'}`} />
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-xs opacity-75">{opt.description}</span>
            </button>
          )
        })}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
