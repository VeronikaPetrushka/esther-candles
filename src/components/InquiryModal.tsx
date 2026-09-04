import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

export default function InquiryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open || !ref.current) return
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: .3 })
    gsap.fromTo(ref.current.querySelector('.inquiry-card-v2'), { y: 40, scale: .97 }, { y: 0, scale: 1, duration: .55, ease: 'power4.out' })
  }, [open])
  if (!open) return null
  return <div ref={ref} className="inquiry-backdrop-v2" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="inquiry-card-v2">
      <button type="button" className="modal-close-v2" onClick={onClose}><X/></button>
      <span className="micro-v2">ESTHER WORKSHOP</span>
      <h2>Зробити<br/>свою <em>форму.</em></h2>
      <p>Напиши нам в Instagram — надішлемо актуальні дати, формат, тривалість і вартість майстер-класу.</p>
      <a className="button-v2 light" href="https://www.instagram.com/now.esther" target="_blank" rel="noreferrer">Написати @now.esther <span>↗</span></a>
    </div>
  </div>
}
