import Button from '../components/Button'

export default function ComingSoon({ title }) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
      <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-periwinkle">
        Coming soon
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink/65">
        We’re building this next. Check back shortly.
      </p>
      <Button to="/" variant="ghost" className="mt-8">
        Back home
      </Button>
    </section>
  )
}
