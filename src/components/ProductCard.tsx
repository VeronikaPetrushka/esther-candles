import { ArrowUpRight, Plus } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../data/products'
import { money } from '../lib/format'
import { useShop } from '../store/ShopProvider'

export default function ProductCard({ product, index = 0, reveal = true }: { product: Product; index?: number; reveal?: boolean }) {
  const { addToCart } = useShop()
  return <article className="product-card-v2" data-reveal={reveal ? '' : undefined} style={{ '--i': index } as CSSProperties}>
    <Link to={`/product/${product.id}`} className="product-image-v2" data-cursor="VIEW">
      <img src={product.image} alt={product.name} loading="lazy" />
      <span className="product-index-v2">0{index + 1}</span>
      {product.tag && <span className="product-tag-v2">{product.tag}</span>}
      <span className="product-view-v2">дивитися <ArrowUpRight size={15}/></span>
    </Link>
    <div className="product-meta-v2">
      <div><span>{product.category}</span><Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link><p>{product.note}</p></div>
      <div className="product-price-v2"><b>{money(product.price)}</b><button type="button" onClick={() => addToCart(product.id)} aria-label={`Додати ${product.name} у кошик`} data-cursor="ADD"><Plus /></button></div>
    </div>
  </article>
}
