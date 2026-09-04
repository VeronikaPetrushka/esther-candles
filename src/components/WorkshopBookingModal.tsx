import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CalendarDays, Check, Clock3, MapPin, Users, X } from 'lucide-react'
import { gsap } from '../lib/gsap'
import { useWorkshops, type Workshop } from '../store/WorkshopProvider'
import { money } from '../lib/format'

export default function WorkshopBookingModal({ workshop, onClose }: { workshop: Workshop | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const { createBooking, bookings } = useWorkshops()
  const [form, setForm] = useState({ name: '', phone: '', email: '', guests: 1, note: '' })
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!workshop || !ref.current) return
    const card = ref.current.querySelector('.booking-card-v2')
    gsap.fromTo(ref.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25 })
    gsap.fromTo(card, { y: 42, rotate: .8, scale: .975 }, { y: 0, rotate: 0, scale: 1, duration: .58, ease: 'power4.out' })
  }, [workshop])

  if (!workshop) return null

  const reserved = bookings.filter((item) => item.workshopId === workshop.id && item.status !== 'cancelled').reduce((sum, item) => sum + item.guests, 0)
  const seatsLeft = Math.max(0, workshop.capacity - reserved)
  const prettyDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${workshop.date}T12:00:00`))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next: Record<string,string> = {}
    if (form.name.trim().length < 2) next.name = 'Вкажи імʼя'
    if (!/^\+?380\d{9}$/.test(form.phone.replace(/[\s()-]/g, ''))) next.phone = 'Формат +380…'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Перевір email'
    if (form.guests < 1 || form.guests > Math.max(1, seatsLeft)) next.guests = 'Перевір кількість місць'
    setErrors(next)
    if (Object.keys(next).length) return
    createBooking(workshop, form)
    setSuccess(true)
  }

  return <div ref={ref} className="inquiry-backdrop-v2" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="booking-card-v2">
      <button type="button" className="modal-close-v2" onClick={onClose} aria-label="Закрити"><X/></button>
      {!success ? <>
        <span className="micro-v2">RESERVE / ESTHER WORKSHOP</span>
        <h2>Зарезервувати<br/><em>місце.</em></h2>
        <div className="booking-workshop-summary-v2">
          <span><CalendarDays/> {prettyDate}</span>
          <span><Clock3/> {workshop.time} · {workshop.duration}</span>
          <span><MapPin/> {workshop.city}</span>
          <span><Users/> {seatsLeft > 0 ? `залишилось ${seatsLeft} з ${workshop.capacity}` : 'місць немає'}</span>
        </div>
        <p>{workshop.description}</p>
        <form className="booking-form-v2" onSubmit={submit}>
          <label className={`field-v2 ${errors.name ? 'error' : ''}`}><span>Імʼя</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>{errors.name && <em>{errors.name}</em>}</label>
          <label className={`field-v2 ${errors.phone ? 'error' : ''}`}><span>Телефон</span><input placeholder="+380 00 000 00 00" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/>{errors.phone && <em>{errors.phone}</em>}</label>
          <label className={`field-v2 ${errors.email ? 'error' : ''}`}><span>Email</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>{errors.email && <em>{errors.email}</em>}</label>
          <label className={`field-v2 ${errors.guests ? 'error' : ''}`}><span>Кількість місць</span><input type="number" min="1" max={Math.max(1,seatsLeft)} value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}/>{errors.guests && <em>{errors.guests}</em>}</label>
          <label className="field-v2 span"><span>Коментар</span><textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Наприклад: хочу прийти з подругою"/></label>
          <div className="booking-submit-v2"><span>{money(workshop.price)} / людина</span><button className="button-v2 dark" disabled={seatsLeft <= 0}>{seatsLeft > 0 ? 'Підтвердити запис' : 'Немає місць'} <span>↗</span></button></div>
        </form>
      </> : <div className="booking-success-v2"><span><Check/></span><div className="micro-v2">BOOKING RECEIVED</div><h2>Місце<br/><em>збережено.</em></h2><p>Ми отримали заявку на {prettyDate} о {workshop.time}. ESTHER звʼяжеться з тобою для підтвердження.</p><button className="button-v2 dark" onClick={onClose}>Готово</button></div>}
    </div>
  </div>
}
