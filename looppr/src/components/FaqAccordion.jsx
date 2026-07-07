import { useState } from 'react'
import { Link } from 'react-router-dom'

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-5 w-5 shrink-0 text-ink/40 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="divide-y divide-line">
      {items.map((item, i) => {
        const open = openIndex === i
        const panelId = `faq-panel-${i}`

        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? -1 : i)}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-display text-base font-semibold text-ink sm:text-lg">
                  {item.question}
                </span>
                <ChevronIcon open={open} />
              </button>
            </h3>
            {open && (
              <div id={panelId} className="pb-5 text-sm leading-relaxed text-ink/65 sm:text-base">
                <p>{item.answer}</p>
                {item.linkTo && (
                  <Link
                    to={item.linkTo}
                    className="mt-2 inline-block font-semibold text-periwinkle-text hover:underline"
                  >
                    {item.linkLabel} →
                  </Link>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
