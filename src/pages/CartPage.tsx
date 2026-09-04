import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { money } from '../lib/format'
import { useShop } from '../store/ShopProvider'

export default function CartPage() {
  const { cartLines, cartTotal, setQty } = useShop()
  return <div className="cart-page-v2 shell-v2">
    <header className="commerce-head-v2"><span className="micro-v2">YOUR OBJECTS</span><h1>Кошик<span>.</span></h1><p>{cartLines.length ? 'Перевір обрані речі перед оформленням.' : 'Тут поки нічого немає.'}</p></header>
    {!cartLines.length ? <div className="empty-v2"><h2>Порожньо.</h2><p>Знайди свій зріз у каталозі.</p><Link className="button-v2 dark" to="/catalog">До каталогу <ArrowRight/></Link></div> : <div className="cart-layout-v2">
      <div className="cart-list-v2">{cartLines.map(({ product, qty }, index) => <article className="cart-row-v2" key={product.id}>
        <span className="cart-index-v2">0{index + 1}</span><img src={product.image} alt={product.name}/><div><span className="micro-v2">{product.category}</span><Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link><p>{product.note}</p></div><div className="cart-qty-price-v2"><b>{money(product.price * qty)}</b><div className="qty-v2"><button type="button" onClick={() => setQty(product.id, qty - 1)}><Minus/></button><span>{qty}</span><button type="button" onClick={() => setQty(product.id, qty + 1)}><Plus/></button></div><button className="trash-v2" type="button" onClick={() => setQty(product.id, 0)} aria-label="Видалити"><Trash2/></button></div>
      </article>)}</div>
      <aside className="cart-summary-v2"><span className="micro-v2">SUMMARY</span><div><span>Товари</span><b>{money(cartTotal)}</b></div><div><span>Доставка</span><b>за тарифами НП</b></div><hr/><div className="total-v2"><span>Разом</span><b>{money(cartTotal)}</b></div><Link to="/checkout" className="button-v2 light full">Оформити замовлення <ArrowRight/></Link><small>Оплата карткою або післяплата. Онлайн-оплата у демо-версії симулюється.</small></aside>
    </div>}
  </div>
}
