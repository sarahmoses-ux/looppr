import Button from './Button'

// Shared by PartnerVerifyEmail.jsx and DriverVerifyEmail.jsx — rendered as
// the sole content of a dedicated route (/partners/application-submitted,
// /drive/application-submitted) rather than an in-page overlay, so the
// confirmation survives a refresh and "Return Home"/"Sign In" are real
// navigations. Styled as a modern floating card (glassmorphism + rounded
// corners) even though it isn't a true dialog — there's no underlying page
// to dismiss back to.
export default function ApplicationSubmittedModal({ homeHref = '/', signInHref }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linen px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl animate-application-submitted-in sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft animate-success-check-pop">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-success-dark" fill="none" aria-hidden="true">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <h1 className="mt-6 font-display text-2xl font-semibold text-ink">
          Application Submitted Successfully
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65 sm:text-base">
          Thank you for applying to join Looppr! We've successfully received your application,
          and our team has been notified. We'll carefully review your information and get back
          to you via email as soon as a decision has been made. We appreciate your interest in
          becoming part of the Looppr network.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button to={homeHref} variant="primary" className="flex-1 py-2.5!">
            Return Home
          </Button>
          {signInHref && (
            <Button to={signInHref} variant="ghost" className="flex-1 py-2.5!">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
