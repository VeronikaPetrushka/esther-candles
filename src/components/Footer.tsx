import { Link } from 'react-router-dom'
import { InstagramIcon } from './InstagramIcon'

export default function Footer() {
  return <footer className="site-footer-v2">
    <div className="footer-marquee" aria-hidden="true"><div>REAL WOOD · REAL TEXTURE · ESTHER · ONE OF ONE · REAL WOOD · REAL TEXTURE · ESTHER · ONE OF ONE · </div></div>
    <div className="shell-v2 footer-grid-v2">
      <div className="footer-brand-v2"><img src="/assets/esther-logo.png" alt="ESTHER"/><h2>Es.</h2><p>Handmade свічки зі справжнього дерева.<br/>Київ / Україна.</p></div>
      <div><span className="micro-v2">SHOP</span><Link to="/catalog">Каталог</Link><Link to="/cart">Кошик</Link><a href="/#workshops">Майстер-класи</a></div>
      <div><span className="micro-v2">CONTACT</span><a href="https://www.instagram.com/now.esther" target="_blank" rel="noreferrer"><InstagramIcon/> @now.esther</a><a href="mailto:hello@esther.ua">hello@esther.ua</a></div>
    </div>
    <div className="shell-v2 footer-bottom-v2"><span>© {new Date().getFullYear()} ESTHER</span><span>REAL THINGS AGE WELL.</span></div>
  </footer>
}
