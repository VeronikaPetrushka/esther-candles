import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { products } from '../data/products'
import ProductCard from '../components/ProductCard'
import WorkshopBookingModal from '../components/WorkshopBookingModal'
import { useShop } from '../store/ShopProvider'
import { useWorkshops, type Workshop } from '../store/WorkshopProvider'

export default function HomePage() {
  const root = useRef<HTMLDivElement>(null)
  const [bookingWorkshop, setBookingWorkshop] = useState<Workshop | null>(null)
  const [previewWorkshop, setPreviewWorkshop] = useState<Workshop | null>(null)
  const { addToCart } = useShop()
  const { publishedWorkshops, bookings } = useWorkshops()
  const upcomingWorkshops = publishedWorkshops.filter((item) => item.date >= new Date().toISOString().slice(0,10))
  const calendarWorkshop = upcomingWorkshops[0] || publishedWorkshops[0] || null
  const calendarDate = calendarWorkshop ? new Date(`${calendarWorkshop.date}T12:00:00`) : new Date()
  const calendarYear = calendarDate.getFullYear()
  const calendarMonth = calendarDate.getMonth()
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
  const firstDayOffset = (new Date(calendarYear, calendarMonth, 1).getDay() + 6) % 7
  const monthWorkshops = publishedWorkshops.filter((item) => { const d = new Date(`${item.date}T12:00:00`); return d.getFullYear() === calendarYear && d.getMonth() === calendarMonth })
  const monthLabel = new Intl.DateTimeFormat('en-US',{month:'short'}).format(calendarDate).toUpperCase()

  useLayoutEffect(() => {
    if (!root.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let mouseHandler: ((event: MouseEvent) => void) | null = null
    const interactionCleanups: Array<() => void> = []
    const ctx = gsap.context(() => {
      // The hero frame itself never starts hidden. Only the image/content animate,
      // so StrictMode or a killed timeline cannot leave the central product invisible.
      gsap.set('.hero-stage-v2', { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0, clearProps: 'clipPath' })
      gsap.set('.hero-stage-v2 img', { autoAlpha: 1 })
      const intro = gsap.timeline({ defaults: { ease: 'power4.out' } })
      intro.from('.hero-v2 .hero-word span', { yPercent: 115, rotate: 3, duration: 1.05, stagger: .08 })
        .fromTo('.hero-stage-v2 img',
          { autoAlpha: 0, scale: 1.13 },
          { autoAlpha: 1, scale: 1, duration: 1.15 },
          '-=.72'
        )
        .from('.hero-stage-v2 figcaption', { y: 16, autoAlpha: 0, duration: .55 }, '-=.58')
        .from('.hero-copy-v2 > *', { y: 18, opacity: 0, duration: .65, stagger: .075 }, '-=.48')
        .from('.material-node-v2', { scale: 0, opacity: 0, stagger: .06, duration: .55, ease: 'back.out(1.6)' }, '-=.45')

      gsap.to('.hero-stage-v2 img', { scale: 1.09, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero-v2', start: 'top top', end: 'bottom top', scrub: 1 } })
      gsap.to('.hero-word.top', { xPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero-v2', start: 'top top', end: 'bottom top', scrub: 1.1 } })
      gsap.to('.hero-word.bottom', { xPercent: 7, ease: 'none', scrollTrigger: { trigger: '.hero-v2', start: 'top top', end: 'bottom top', scrub: 1.1 } })

      const hero = root.current?.querySelector<HTMLElement>('.hero-stage-v2')
      mouseHandler = (e: MouseEvent) => {
        if (!hero || innerWidth < 900) return
        const x = (e.clientX / innerWidth - .5) * 15
        const y = (e.clientY / innerHeight - .5) * 11
        gsap.to(hero, { x, y, rotate: x * .025, duration: 1.2, ease: 'power3.out', overwrite: true })
        gsap.to('.material-node-v2', { x: (i) => x * (.18 + i * .04), y: (i) => y * (.14 + i * .035), duration: 1.4, ease: 'power3.out', overwrite: true })
      }
      window.addEventListener('mousemove', mouseHandler)

      const track = root.current?.querySelector<HTMLElement>('.selected-track-v2')
      const pin = root.current?.querySelector<HTMLElement>('.selected-stage-v2')
      const selectedCards = root.current?.querySelectorAll<HTMLElement>('.selected-track-v2 .product-card-v2')

      // Reveal the horizontal cards BEFORE the section becomes pinned.
      // Using the generic vertical [data-reveal] trigger here can leave the cards
      // invisible for the whole pinned portion because their vertical position stops moving.
      if (pin && selectedCards?.length) {
        gsap.fromTo(selectedCards,
          { y: 34, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: .72,
            stagger: .065,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: pin,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      if (track && pin && innerWidth > 860) {
        const viewportWidth = () => document.documentElement.clientWidth
        const distance = () => Math.max(0, track.scrollWidth - viewportWidth() + 40)

        gsap.to(track, {
          x: () => -distance(),
          force3D: true,
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${distance() + innerHeight * .55}`,
            scrub: .85,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
      }

      // Reversible reveals: they reset after scrolling back above the section,
      // so every new pass through the page feels alive instead of being one-shot.
      root.current?.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(el,
          { y: 55, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: .9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
      root.current?.querySelectorAll<HTMLElement>('[data-image-reveal]').forEach((el) => {
        gsap.fromTo(el,
          { clipPath: 'inset(0 0 100% 0)', autoAlpha: .72 },
          {
            clipPath: 'inset(0 0 0% 0)',
            autoAlpha: 1,
            duration: 1.05,
            ease: 'power4.inOut',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      gsap.to('.pulse-strip-v2 div', { xPercent: -45, duration: 20, ease: 'none', repeat: -1 })
      gsap.to('.wood-orbit-v2', { rotate: 360, duration: 34, ease: 'none', repeat: -1 })
      gsap.to('.texture-strip-v2 .texture-a', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.texture-strip-v2', start: 'top bottom', end: 'bottom top', scrub: 1.2 } })
      gsap.to('.texture-strip-v2 .texture-b', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.texture-strip-v2', start: 'top bottom', end: 'bottom top', scrub: 1.25 } })

      // More depth: let the editorial layers drift at slightly different speeds.
      gsap.to('.selected-head-v2 h2', { xPercent: 4, ease: 'none', scrollTrigger: { trigger: '.selected-head-v2', start: 'top bottom', end: 'bottom top', scrub: 1.25 } })
      gsap.to('.manifesto-image-v2.large', { yPercent: -8, rotate: -1.4, ease: 'none', scrollTrigger: { trigger: '.manifesto-v2', start: 'top bottom', end: 'bottom top', scrub: 1.2 } })
      gsap.to('.manifesto-image-v2.small', { yPercent: 10, rotate: 2.2, ease: 'none', scrollTrigger: { trigger: '.manifesto-v2', start: 'top bottom', end: 'bottom top', scrub: 1.35 } })
      gsap.fromTo('.process-line-v2',
        { x: -72, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: .8,
          stagger: .11,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.process-v2', start: 'top 72%', toggleActions: 'play none none reverse' },
        }
      )
      // One stable workshop image. Overscan + scale only prevents visible seams/slivers.
      gsap.fromTo('.workshop-bg-v2 img', { scale: 1.08 }, { scale: 1.01, ease: 'none', scrollTrigger: { trigger: '.workshops-v2', start: 'top bottom', end: 'bottom top', scrub: 1.15 } })
      gsap.to('.workshop-overlay-v2 h2', { xPercent: 3.5, ease: 'none', scrollTrigger: { trigger: '.workshops-v2', start: 'top 75%', end: 'bottom top', scrub: 1.1 } })
      gsap.fromTo('.workshop-calendar-v2',
        { y: 70, rotate: 2.5, autoAlpha: 0 },
        {
          y: 0,
          rotate: 0,
          autoAlpha: 1,
          duration: .95,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.workshop-calendar-v2', start: 'top 86%', toggleActions: 'play none none reverse' },
        }
      )

      // Process rows reveal a real bark texture on hover/focus.
      root.current?.querySelectorAll<HTMLElement>('.process-line-v2').forEach((row) => {
        const wash = row.querySelector<HTMLElement>('.process-wash-v2')
        const title = row.querySelector<HTMLElement>('h3')
        const copy = row.querySelector<HTMLElement>('p')
        const arrow = row.querySelector<HTMLElement>('.process-arrow-v2')
        const chip = row.querySelector<HTMLElement>('.process-chip-v2')
        const activate = () => {
          gsap.to(wash, { scaleX: 1, backgroundPosition: '54% 50%', duration: .58, ease: 'power3.out' })
          gsap.to(row, { color: '#f7f3ec', duration: .3 })
          gsap.to(title, { x: 18, duration: .48, ease: 'power3.out' })
          gsap.to(copy, { x: -8, duration: .48, ease: 'power3.out' })
          gsap.to(arrow, { rotate: -45, scale: 1.16, duration: .45, ease: 'back.out(1.7)' })
          gsap.to(chip, { y: 0, autoAlpha: 1, duration: .36, ease: 'power2.out' })
        }
        const deactivate = () => {
          gsap.to(wash, { scaleX: 0, backgroundPosition: '44% 50%', duration: .45, ease: 'power3.inOut' })
          gsap.to(row, { color: '#151411', duration: .25 })
          gsap.to([title, copy], { x: 0, duration: .42, ease: 'power3.out' })
          gsap.to(arrow, { rotate: 0, scale: 1, duration: .38, ease: 'power3.out' })
          gsap.to(chip, { y: 8, autoAlpha: 0, duration: .25 })
        }
        row.addEventListener('mouseenter', activate)
        row.addEventListener('mouseleave', deactivate)
        row.addEventListener('focusin', activate)
        row.addEventListener('focusout', deactivate)
        interactionCleanups.push(() => {
          row.removeEventListener('mouseenter', activate)
          row.removeEventListener('mouseleave', deactivate)
          row.removeEventListener('focusin', activate)
          row.removeEventListener('focusout', deactivate)
        })
      })


      // Font metrics can change the section height after first paint. Refresh once
      // they are ready so the pin start/end positions don't jump.
      if ('fonts' in document) {
        document.fonts.ready.then(() => ScrollTrigger.refresh())
      }

    }, root)
    return () => {
      if (mouseHandler) window.removeEventListener('mousemove', mouseHandler)
      interactionCleanups.forEach((cleanup) => cleanup())
      ctx.revert()
    }
  }, [])

  return <div ref={root}>
    <section className="hero-v2">
      <div className="hero-grid-v2 shell-v2">
        <div className="hero-word top"><span>ESTHER</span></div>
        <div className="hero-word bottom"><span>WOOD</span></div>

        <div className="hero-copy-v2">
          <span className="micro-v2">HANDMADE / KYIV / 2026</span>
          <p>Свічки зі справжнього дерева. Кожен зріз має неповторний відбиток, характер і запах.</p>
          <div className="hero-actions-v2">
            <Link className="button-v2 light" data-magnetic to="/catalog">Дивитися каталог <ArrowUpRight size={17}/></Link>
            <button className="round-buy-v2" data-magnetic type="button" onClick={() => addToCart(products[0].id)} aria-label="Додати вибрану свічку у кошик"><ShoppingBag/></button>
          </div>
        </div>

        <figure className="hero-stage-v2" data-cursor="OPEN">
          <img src="/assets/products/esther-02.webp" alt="ESTHER — handmade свічки у природних зрізах дерева" />
          <figcaption><span>01 / UNIQUE OBJECT</span><b>Природний зріз · ручна обробка</b></figcaption>
        </figure>

        <div className="hero-nodes-v2" aria-hidden="true">
          <div className="material-node-v2 node-one"><i>01</i><span>REAL<br/>WOOD</span></div>
          <div className="material-node-v2 node-two"><i>02</i><span>ONE<br/>OF ONE</span></div>
          <div className="material-node-v2 node-three"><i>03</i><span>HAND<br/>MADE</span></div>
        </div>
        <a className="scroll-note-v2" href="#selected"><ArrowDown/> SCROLL TO FEEL THE GRAIN</a>
      </div>
    </section>

    <section className="pulse-strip-v2" aria-hidden="true"><div>NO TWO PIECES ARE THE SAME · REAL WOOD · HAND FINISHED · ESTHER · NO TWO PIECES ARE THE SAME · REAL WOOD · HAND FINISHED · ESTHER · </div></section>

    <section id="selected" className="selected-pin-v2">
      <div className="selected-head-v2 shell-v2">
        <span className="micro-v2">SELECTED OBJECTS / 01—06</span>
        <h2>Не каталог речей.<br/><em>Архів характерів.</em></h2>
        <p>Дерево вже має рисунок, тріщини, край і колір. ESTHER не приховує їх — ми будуємо виріб навколо них.</p>
      </div>

      <div className="selected-stage-v2">
        <div className="selected-track-v2">
          {products.map((product, index) => <ProductCard key={product.id} product={product} index={index} reveal={false} />)}
          <Link to="/catalog" className="archive-card-v2" data-cursor="ALL"><span>ALL OBJECTS</span><h3>Обрати<br/>свій відбиток.</h3><b>Каталог ↗</b></Link>
        </div>
      </div>
    </section>

    <section id="about" className="manifesto-v2 shell-v2">
      <div className="manifesto-label-v2" data-reveal><span className="micro-v2">ESTHER / MANIFESTO</span><span>Справжнє старіє красиво.</span></div>
      <div className="manifesto-title-v2" data-reveal><h2>Ми не робимо дерево<br/><em>ідеальним.</em></h2></div>
      <div className="manifesto-copy-v2" data-reveal>
        <p className="lead-v2">Ми про справжність, яка ніколи не вийде з моди.</p>
        <p>Кожна свічка як особистість — має неповторний відбиток, характер і запах. Наше завдання не просто зберегти унікальну структуру дерева, а підкреслити її за допомогою правильної обробки.</p>
      </div>
      <figure className="manifesto-image-v2 large" data-image-reveal><img src="/assets/products/esther-12.webp" alt="Фактура натурального дерева ESTHER" loading="lazy" /></figure>
      <figure className="manifesto-image-v2 small" data-image-reveal><img src="/assets/products/esther-05.webp" alt="Свічки ESTHER" loading="lazy" /></figure>
      <div className="wood-orbit-v2" aria-hidden="true"><span>REAL MATERIAL · REAL MATERIAL ·</span></div>
    </section>

    <section className="texture-strip-v2">
      <figure className="texture-a"><img src="/assets/products/esther-02.webp" alt="" loading="lazy"/></figure>
      <div data-reveal><span className="micro-v2">HOW IT'S MADE</span><h2>Обробити —<br/>не означає<br/><em>стерти.</em></h2></div>
      <figure className="texture-b"><img src="/assets/products/esther-03.webp" alt="" loading="lazy"/></figure>
    </section>

    <section className="process-v2 shell-v2">
      {[
        { n:'01', title:'ЗНАЙТИ', text:'Спочатку форма. Шукаємо зріз, який уже має характер.', chip:'RAW CUT' },
        { n:'02', title:'ПРОЧИТАТИ', text:'Розуміємо, де залишити кору, де відкрити волокно, а де підкреслити обпаленням.', chip:'GRAIN' },
        { n:'03', title:'ЗБЕРЕГТИ', text:'Обробка не маскує матеріал. Вона робить його структуру ще виразнішою.', chip:'KEEP' },
        { n:'04', title:'ЗАПАЛИТИ', text:'Віск і деревʼяний гніт завершують обʼєкт, але не забирають увагу в дерева.', chip:'FIRE' },
      ].map(({n,title,text,chip}) => (
        <article key={n} className="process-line-v2" tabIndex={0}>
          <i className="process-wash-v2" aria-hidden="true"/>
          <span>{n}</span>
          <h3>{title}</h3>
          <p>{text}</p>
          <span className="process-chip-v2">{chip}</span>
          <b className="process-arrow-v2">↘</b>
        </article>
      ))}
    </section>

    <section id="workshops" className="workshops-v2">
      <div className="workshop-bg-v2"><img src="/assets/workshop-bg.webp" alt="Майстер-клас ESTHER — робота з деревом і воском" loading="lazy" /></div>
      <div className="workshop-overlay-v2 shell-v2">
        <span className="micro-v2">WORKSHOPS / ESTHER</span>
        <h2>Зробити<br/>своє.<br/><em>Руками.</em></h2>
        <div className="workshop-bottom-v2">
          <div className="workshop-copy-v2">
            <p>{calendarWorkshop?.description || 'Від вибору деревини до готової свічки. Повільний процес, фактура в руках і жодної потреби робити дві речі однаковими.'}</p>
            <button className="button-v2 light" data-magnetic type="button" disabled={!calendarWorkshop} onClick={() => calendarWorkshop && setBookingWorkshop(calendarWorkshop)}>Зарезервувати місце <ArrowUpRight/></button>
          </div>

          <div className="workshop-calendar-v2" aria-label="Календар майстер-класів ESTHER">
            <div className="calendar-head-v2"><span>{monthLabel} / {calendarYear}</span><b>{monthWorkshops.length ? `${monthWorkshops.length} UPCOMING` : 'NO EVENTS'}</b></div>
            <div className="calendar-week-v2">{['ПН','ВТ','СР','ЧТ','ПТ','СБ','НД'].map(day => <span key={day}>{day}</span>)}</div>
            <div className="calendar-grid-v2">
              {Array.from({length:firstDayOffset},(_,i)=><span key={`empty-${i}`} className="calendar-empty-v2"/>)}
              {Array.from({length:daysInMonth},(_,i)=>i+1).map(day => {
                const event = monthWorkshops.find((item) => Number(item.date.slice(-2)) === day)
                return event ? <button key={day} type="button" className="calendar-date-v2 has-event" onMouseEnter={() => setPreviewWorkshop(event)} onMouseLeave={() => setPreviewWorkshop(null)} onFocus={() => setPreviewWorkshop(event)} onBlur={() => setPreviewWorkshop(null)} onClick={() => setBookingWorkshop(event)} aria-label={`${day} — ${event.title}`}>{day}<i/></button> : <span key={day} className="calendar-date-v2">{day}</span>
              })}
            </div>
            {(previewWorkshop || calendarWorkshop) && (() => { const event = previewWorkshop || calendarWorkshop!; const reserved = bookings.filter((item) => item.workshopId === event.id && item.status !== 'cancelled').reduce((sum,item)=>sum+item.guests,0); return <div className={`calendar-event-v2 ${previewWorkshop ? 'is-visible' : ''}`} role="status">
              <span>{event.date.slice(8,10)} {monthLabel} · {event.time}</span>
              <b>{event.title}</b>
              <p>{event.city} · {event.duration} · {Math.max(0,event.capacity-reserved)} місць вільно</p>
              <small>Наведи на дату або натисни, щоб забронювати</small>
            </div> })()}
          </div>
        </div>
      </div>
    </section>

    <section className="final-v2 shell-v2" data-reveal>
      <span className="micro-v2">YOUR OBJECT / YOUR GRAIN</span>
      <h2>Двох однакових<br/><em>не буде.</em></h2>
      <div><p>Обирай не тільки аромат. Обирай форму, край, тріщину й характер.</p><Link to="/catalog" className="button-v2 dark" data-magnetic>До каталогу <ArrowUpRight/></Link></div>
    </section>

    <WorkshopBookingModal workshop={bookingWorkshop} onClose={() => setBookingWorkshop(null)} />
  </div>
}
