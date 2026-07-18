import { stageMeta } from './driverUi'

export default function StageBadge({ delivery }) {
  const meta = stageMeta(delivery)
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.style}`}>
      {meta.label}
    </span>
  )
}
