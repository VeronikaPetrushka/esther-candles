import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProducts } from '../store/ProductProvider'
import { money } from '../lib/format'
import { gsap } from '../lib/gsap'
import { useShop } from '../store/ShopProvider'
import ProductCard from '../components/ProductCard'

export default function ProductPage() {
  const { id } = useParams()
  const { activeProducts } = useProducts()
  const product = activeProducts.find((p) => p.id === id)
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)
  const { addToCart } = useShop()
  const navigate = useNavigate()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => { setActive(0); setQty(1) }, [id])

  useLayoutEffect(() => {
    if (!root.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('.product-detail-media-v2', { clipPath: 'inset(0 100% 0 0)', duration: 1, ease: 'power4.inOut' })
      gsap.from('.product-detail-copy-v2 > *', { y: 25, opacity: 0, stagger: .07, duration: .65, delay: .25, ease: 'power3.out' })
    }, root)
    return () => ctx.revert()
  }, [id])

  if (!product) return <div className="shell-v2 empty-v2"><h1>Обʼєкт не знайдено.</h1><Link to="/catalog">До каталогу ↗</Link></div>
  const related = activeProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3)

  const choose = (index: number) => {
    gsap.to('.product-detail-media-v2 img', { opacity: 0, scale: 1.025, duration: .18, onComplete: () => {
      setActive(index)
      requestAnimationFrame(() => gsap.fromTo('.product-detail-media-v2 img', { opacity: 0, scale: .98 }, { opacity: 1, scale: 1, duration: .45, ease: 'power3.out' }))
    } })
  }

  return <div ref={root} className="product-page-v2 shell-v2">
    <Link to="/catalog" className="back-v2"><ArrowLeft/> назад до каталогу</Link>
    <section className="product-detail-v2">
      <div className="product-gallery-v2">
        <figure className="product-detail-media-v2"><img src={(product.images?.length ? product.images : [product.image])[active]} alt={product.name}/><span>{String(active + 1).padStart(2, '0')} / {String((product.images?.length ? product.images : [product.image]).length).padStart(2, '0')}</span></figure>
        <div className="product-thumbs-v2">{(product.images?.length ? product.images : [product.image]).map((image, index) => <button type="button" className={active === index ? 'active' : ''} onClick={() => choose(index)} key={image}><img src={image} alt=""/></button>)}</div>
      </div>
      <div className="product-detail-copy-v2">
        <span className="micro-v2">{product.category} / {product.tag || 'ESTHER'}</span>
        <h1>{product.name}</h1>
        <p className="product-lead-v2">{product.description}</p>
        <div className="detail-specs-v2"><div><span>MATERIAL</span><b>{product.material}</b></div><div><span>BURN</span><b>{product.burn}</b></div><div><span>SCENT</span><b>{product.scent}</b></div></div>
        <div className="detail-buy-v2"><b>{money(product.price)}</b><div className="qty-v2"><button type="button" onClick={() => setQty(Math.max(1, qty - 1))}><Minus/></button><span>{qty}</span><button type="button" onClick={() => setQty(qty + 1)}><Plus/></button></div></div>
        <button type="button" className="button-v2 dark full" onClick={() => { addToCart(product.id, qty); navigate('/cart') }}>Додати в кошик <ShoppingBag/></button>
        <p className="natural-note-v2">Через природне походження дерева фактура, край та відтінок конкретного виробу можуть трохи відрізнятися від фото.</p>
      </div>
    </section>
    {related.length > 0 && <section className="related-v2"><span className="micro-v2">SAME MATERIAL / DIFFERENT CHARACTER</span><h2>Ще кілька<br/><em>відбитків.</em></h2><div className="related-grid-v2">{related.map((p, i) => <ProductCard product={p} index={i} key={p.id}/>)}</div></section>}
  </div>
}
