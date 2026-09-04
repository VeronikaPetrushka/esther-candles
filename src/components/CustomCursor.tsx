import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

export default function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cursor.current || matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = cursor.current
    const xTo = gsap.quickTo(el, 'x', { duration: .35, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: .35, ease: 'power3' })
    const move = (event: MouseEvent) => { xTo(event.clientX); yTo(event.clientY) }
    const over = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-cursor]')
      el.dataset.label = target?.dataset.cursor || ''
      gsap.to(el, { scale: target ? 2.35 : 1, duration: .25, ease: 'power2.out' })
    }
    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
    }
  }, [])

  return <div ref={cursor} className="custom-cursor" aria-hidden="true"><span /></div>
}
