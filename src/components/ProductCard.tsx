import { ArrowLeft, ArrowRight, ArrowUpRight, Plus } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../data/products'
import { money } from '../lib/format'
import { gsap } from '../lib/gsap'
import { useShop } from '../store/ShopProvider'

export default function ProductCard({ product, index = 0, reveal = true }: { product: Product; index?: number; reveal?: boolean }) {
  const { addToCart } = useShop()
  const root = useRef<HTMLElement>(null)
  const gallery = product.images?.length ? product.images : [product.image]
  const [active, setActive] = useState(0)
  const show = (next: number) => setActive((next + gallery.length) % gallery.length)

  useLayoutEffect(() => {
    if (!root.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const image = root.current.querySelector<HTMLImageElement>('img.active')
    if (!image) return
    gsap.fromTo(image, { autoAlpha: 0, scale: 1.035 }, { autoAlpha: 1, scale: 1, duration: .48, ease: 'power3.out', overwrite: true })
  }, [active])

  return <article ref={root} className="product-card-v2" data-reveal={reveal ? '' : undefined} style={{ '--i': index } as CSSProperties}>
    <div className="product-image-shell-v2">
      <Link to={`/product/${product.id}`} className="product-image-v2" data-cursor="VIEW">
        {gallery.map((src, imageIndex) => <img
          key={`${src}-${imageIndex}`}
          src={src}
          alt={imageIndex === active ? product.name : ''}
          loading="lazy"
          className={imageIndex === active ? 'active' : ''}
          aria-hidden={imageIndex !== active}
        />)}
        <span className="product-index-v2">0{index + 1}</span>
        {product.tag && <span className="product-tag-v2">{product.tag}</span>}
        <span className="product-view-v2">дивитися <ArrowUpRight size={15}/></span>
      </Link>
      {gallery.length > 1 && <>
        <div className="product-card-gallery-controls-v2">
          <button type="button" onClick={() => show(active - 1)} aria-label="Попереднє фото"><ArrowLeft/></button>
          <span>{active + 1} / {gallery.length}</span>
          <button type="button" onClick={() => show(active + 1)} aria-label="Наступне фото"><ArrowRight/></button>
        </div>
        <div className="product-card-dots-v2" aria-label="Фото товару">{gallery.map((_, imageIndex) => <button type="button" aria-label={`Фото ${imageIndex + 1}`} className={imageIndex === active ? 'active' : ''} key={imageIndex} onClick={() => show(imageIndex)}/>)}</div>
      </>}
    </div>
    <div className="product-meta-v2">
      <div><span>{product.category}</span><Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link><p>{product.note}</p></div>
      <div className="product-price-v2"><b>{money(product.price)}</b><button type="button" onClick={() => addToCart(product.id)} aria-label={`Додати ${product.name} у кошик`} data-cursor="ADD"><Plus /></button></div>
    </div>
  </article>
}
