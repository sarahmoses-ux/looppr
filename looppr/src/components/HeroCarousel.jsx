import { useEffect, useState } from 'react'

export default function HeroCarousel({ images, intervalMs = 4500 }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || images.length < 2) return undefined
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [paused, images.length, intervalMs])

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
      <div className="absolute inset-6 rounded-[2.5rem] bg-periwinkle-soft" aria-hidden="true" />

      <div
        className="absolute inset-x-8 top-2 bottom-16 overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-25px_rgba(30,27,75,0.45)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {images.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="absolute -right-4 top-8 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-[0_20px_40px_-15px_rgba(30,27,75,0.3)] sm:-right-6">
        <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
        <span className="text-xs font-semibold text-ink">Ready for pickup</span>
      </div>
    </div>
  )
}
