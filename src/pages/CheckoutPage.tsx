import { useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, Check, CreditCard, PackageCheck, Truck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { money } from '../lib/format'
import { useShop, type Customer } from '../store/ShopProvider'

const blank: Customer = { name: '', phone: '', email: '', city: '', warehouse: '', delivery: 'branch', payment: 'card', note: '' }

export default function CheckoutPage() {
  const { cartLines, cartTotal, createOrder } = useShop()
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const update = <K extends keyof Customer>(key: K, value: Customer[K]) => setForm((f) => ({ ...f, [key]: value }))

  if (!cartLines.length) return <div className="shell-v2 empty-v2"><h1>Немає що оформлювати.</h1><Link to="/catalog">До каталогу ↗</Link></div>

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const next: Record<string,string> = {}
    if (form.name.trim().length < 2) next.name = 'Вкажи імʼя'
    if (!/^\+?380\d{9}$/.test(form.phone.replace(/[\s()-]/g, ''))) next.phone = 'Формат +380…'
    if (!form.city.trim()) next.city = 'Вкажи місто'
    if (!form.warehouse.trim()) next.warehouse = form.delivery === 'branch' ? 'Вкажи відділення / поштомат' : 'Вкажи адресу'
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    try {
      const order = await createOrder(form)
      navigate(`/success/${order.id}`)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Не вдалося створити замовлення' })
    } finally { setLoading(false) }
  }

  return <div className="checkout-page-v2 shell-v2">
    <header className="commerce-head-v2"><span className="micro-v2">CHECKOUT / ESTHER</span><h1>Оформлення<span>.</span></h1><p>Контакти, доставка Новою поштою та спосіб оплати.</p></header>
    <form className="checkout-layout-v2" onSubmit={submit}>
      <div className="checkout-form-v2">
        <CheckoutSection n="01" title="Контакти"><div className="form-grid-v2"><Field label="Імʼя" value={form.name} onChange={(v) => update('name', v)} error={errors.name}/><Field label="Телефон" value={form.phone} onChange={(v) => update('phone', v)} error={errors.phone} placeholder="+380 00 000 00 00"/><Field label="Email" value={form.email} onChange={(v) => update('email', v)} span/></div></CheckoutSection>
        <CheckoutSection n="02" title="Доставка"><div className="choice-v2"><button type="button" className={form.delivery === 'branch' ? 'active' : ''} onClick={() => update('delivery','branch')}><PackageCheck/><span><b>Відділення / поштомат</b><small>Нова пошта</small></span><Check/></button><button type="button" className={form.delivery === 'courier' ? 'active' : ''} onClick={() => update('delivery','courier')}><Truck/><span><b>Курʼєром</b><small>до дверей</small></span><Check/></button></div><div className="form-grid-v2"><Field label="Місто" value={form.city} onChange={(v) => update('city', v)} error={errors.city}/><Field label={form.delivery === 'branch' ? 'Відділення / поштомат' : 'Адреса'} value={form.warehouse} onChange={(v) => update('warehouse', v)} error={errors.warehouse}/></div></CheckoutSection>
        <CheckoutSection n="03" title="Оплата"><div className="choice-v2"><button type="button" className={form.payment === 'card' ? 'active' : ''} onClick={() => update('payment','card')}><CreditCard/><span><b>Карткою онлайн</b><small>готово під WayForPay / LiqPay</small></span><Check/></button><button type="button" className={form.payment === 'cod' ? 'active' : ''} onClick={() => update('payment','cod')}><PackageCheck/><span><b>При отриманні</b><small>післяплата</small></span><Check/></button></div></CheckoutSection>
        <CheckoutSection n="04" title="Коментар"><label className="field-v2"><span>Побажання до замовлення</span><textarea value={form.note} onChange={(e) => update('note', e.target.value)} placeholder="Наприклад: хочу максимально фактурний край"/></label></CheckoutSection>
      </div>
      <aside className="checkout-summary-v2"><span className="micro-v2">ORDER</span>{cartLines.map(({product,qty}) => <div className="checkout-item-v2" key={product.id}><img src={product.image} alt=""/><span>{product.name}<small>{qty} шт.</small></span><b>{money(product.price * qty)}</b></div>)}<hr/><div className="total-v2"><span>До сплати</span><b>{money(cartTotal)}</b></div><button className="button-v2 light full" disabled={loading}>{loading ? 'Створюємо…' : form.payment === 'card' ? 'Оплатити й замовити' : 'Підтвердити замовлення'} {!loading && <ArrowRight/>}</button>{errors.submit && <p className="form-error-v2">{errors.submit}</p>}<small>У демо-режимі реальні платіжні дані не збираються.</small></aside>
    </form>
  </div>
}

function CheckoutSection({ n, title, children }: { n: string; title: string; children: ReactNode }) { return <section className="checkout-section-v2"><div className="checkout-section-title-v2"><span>{n}</span><h2>{title}</h2></div>{children}</section> }
function Field({ label, value, onChange, placeholder, error, span }: { label: string; value: string; onChange: (v:string)=>void; placeholder?: string; error?: string; span?: boolean }) { return <label className={`field-v2 ${span ? 'span' : ''} ${error ? 'error' : ''}`}><span>{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}/>{error && <em>{error}</em>}</label> }
