import { Menu, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { useShop } from '../store/ShopProvider'
import { InstagramIcon } from './InstagramIcon'

export default function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { cartCount } = useShop()
  const close = () => setOpen(false)
  const toggle = () => {
    const next = !open
    setOpen(next)
    requestAnimationFrame(() => {
      if (next) gsap.fromTo('.mobile-nav-v2 a', { y: 25, opacity: 0 }, { y: 0, opacity: 1, stagger: .055, duration: .5, ease: 'power3.out' })
    })
  }

  return <header className={`site-header-v2 ${location.pathname === '/' ? 'on-home' : ''}`}>
    <div className="nav-shell">
      <Link to="/" className="brand-v2" onClick={close} aria-label="ESTHER — головна">
        <img src="/assets/esther-logo.png" alt="" />
        <span>ESTHER</span>
      </Link>
      <nav className="desktop-nav-v2">
        <NavLink to="/catalog">Каталог</NavLink>
        <a href="/#about">Про бренд</a>
        <a href="/#workshops">Майстер-класи</a>
      </nav>
      <div className="nav-actions-v2">
        <a href="https://www.instagram.com/now.esther" className="nav-icon" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon /></a>
        <Link className="cart-pill" to="/cart" aria-label={`Кошик, товарів: ${cartCount}`}>
          <ShoppingBag size={18}/><span>Кошик</span>{cartCount > 0 && <b>{cartCount}</b>}
        </Link>
        <button className="menu-v2" type="button" onClick={toggle} aria-label="Меню">{open ? <X /> : <Menu />}</button>
      </div>
    </div>
    {open && <nav className="mobile-nav-v2">
      <NavLink to="/catalog" onClick={close}>Каталог</NavLink>
      <a href="/#about" onClick={close}>Про бренд</a>
      <a href="/#workshops" onClick={close}>Майстер-класи</a>
      <Link to="/cart" onClick={close}>Кошик ({cartCount})</Link>
      <a href="https://www.instagram.com/now.esther" target="_blank" rel="noreferrer">Instagram ↗</a>
    </nav>}
  </header>
}
