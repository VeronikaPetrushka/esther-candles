import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { categories, products } from '../data/products'
import ProductCard from '../components/ProductCard'
import { gsap } from '../lib/gsap'

export default function CatalogPage() {
  const root = useRef<HTMLDivElement>(null)
  const [category, setCategory] = useState('Усі')
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => products.filter((p) => (category === 'Усі' || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())), [category, query])

  useLayoutEffect(() => {
    if (!root.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('.catalog-title-v2 span', { yPercent: 110, stagger: .08, duration: .85, ease: 'power4.out' })
      gsap.from('.catalog-controls-v2', { y: 20, opacity: 0, duration: .65, delay: .25 })
    }, root)
    return () => ctx.revert()
  }, [])

  return <div ref={root} className="catalog-page-v2 shell-v2">
    <header className="catalog-intro-v2">
      <span className="micro-v2">ESTHER / OBJECT ARCHIVE</span>
      <h1 className="catalog-title-v2"><span>Каталог</span><span><em>відбитків.</em></span></h1>
      <p>Форма вже існує в дереві. Тут можна знайти ту, яка відгукнеться тобі.</p>
    </header>
    <div className="catalog-controls-v2">
      <div className="category-filter-v2">{categories.map((item, index) => <button type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}><span>0{index}</span>{item}</button>)}</div>
      <label className="search-v2"><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Знайти свічку"/></label>
    </div>
    <div className="catalog-count-v2">{String(filtered.length).padStart(2, '0')} OBJECTS</div>
    <div className="catalog-grid-v2">{filtered.map((product, index) => <ProductCard key={product.id} product={product} index={index}/>)}</div>
    {!filtered.length && <div className="empty-v2"><span>00</span><h2>Нічого не знайшлося.</h2><p>Спробуй іншу категорію або запит.</p></div>}
  </div>
}
