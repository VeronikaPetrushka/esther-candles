import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import { gsap, ScrollTrigger } from '../lib/gsap'

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    const cleanup: Array<() => void> = []
    const ctx = gsap.context(() => {
      gsap.fromTo('main', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .55, ease: 'power2.out', onComplete: () => gsap.set('main', { clearProps: 'transform' }) })

      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
        const move = (event: MouseEvent) => {
          const rect = el.getBoundingClientRect()
          const x = (event.clientX - rect.left - rect.width / 2) * .15
          const y = (event.clientY - rect.top - rect.height / 2) * .15
          gsap.to(el, { x, y, duration: .35, ease: 'power3.out', overwrite: true })
        }
        const leave = () => gsap.to(el, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1,.45)', overwrite: true })
        el.addEventListener('mousemove', move)
        el.addEventListener('mouseleave', leave)
        cleanup.push(() => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave) })
      })

      document.querySelectorAll<HTMLElement>('.product-image-v2').forEach((el) => {
        const activeImage = () => el.querySelector('img.active') || el.querySelector('img')
        const enter = () => {
          gsap.to(activeImage(), { scale: 1.055, duration: .7, ease: 'power3.out' })
          gsap.to(el.querySelector('.product-view-v2'), { backgroundColor: '#151411', color: '#f7f3ec', duration: .25 })
        }
        const leave = () => {
          gsap.to(el.querySelectorAll('img'), { scale: 1, duration: .75, ease: 'power3.out' })
          gsap.to(el.querySelector('.product-view-v2'), { backgroundColor: '#f7f3ec', color: '#151411', duration: .25 })
        }
        el.addEventListener('mouseenter', enter)
        el.addEventListener('mouseleave', leave)
        cleanup.push(() => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave) })
      })

      document.querySelectorAll<HTMLElement>('.button-v2, .product-price-v2 button, .nav-icon, .cart-pill').forEach((el) => {
        const enter = () => gsap.to(el, { backgroundColor: '#8d593b', color: '#ffffff', borderColor: '#8d593b', duration: .22, ease: 'power2.out' })
        const leave = () => gsap.to(el, { clearProps: 'backgroundColor,color,borderColor', duration: .3, ease: 'power2.out' })
        const tap = () => {
          if (matchMedia('(hover:hover) and (pointer:fine)').matches) return
          gsap.timeline().to(el, { scale: .96, backgroundColor: '#8d593b', color: '#fff', borderColor: '#8d593b', duration: .12 }).to(el, { scale: 1, clearProps: 'backgroundColor,color,borderColor', duration: .32, ease: 'back.out(1.8)' })
        }
        el.addEventListener('mouseenter', enter)
        el.addEventListener('mouseleave', leave)
        el.addEventListener('pointerdown', tap)
        cleanup.push(() => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave); el.removeEventListener('pointerdown', tap) })
      })

      document.querySelectorAll<HTMLElement>('.product-image-shell-v2').forEach((el) => {
        const tap = () => {
          if (matchMedia('(hover:hover) and (pointer:fine)').matches) return
          gsap.fromTo(el, { scale: .985 }, { scale: 1, duration: .45, ease: 'back.out(1.7)', overwrite: true })
        }
        el.addEventListener('pointerdown', tap)
        cleanup.push(() => el.removeEventListener('pointerdown', tap))
      })

      gsap.to('.footer-marquee div', { xPercent: -35, duration: 24, ease: 'none', repeat: -1 })
    })
    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => { cleanup.forEach((fn) => fn()); ctx.revert() }
  }, [location.pathname])

  return <>
    <CustomCursor />
    <Header />
    <main><Outlet /></main>
    <Footer />
  </>
}
