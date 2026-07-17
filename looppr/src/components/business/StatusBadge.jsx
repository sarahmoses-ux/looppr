import { STATUS_STYLES, statusLabel } from './businessUi'

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-ink/5 text-ink/70 ring-ink/10'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {statusLabel(status)}
    </span>
  )
}
