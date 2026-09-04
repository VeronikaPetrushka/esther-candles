import { Check, ArrowUpRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

export default function SuccessPage() {
  const { orderId } = useParams()
  return <div className="success-page-v2 shell-v2"><div className="success-mark-v2"><Check/></div><span className="micro-v2">ORDER CREATED</span><h1>Дякуємо.<br/><em>Обʼєкт твій.</em></h1><p>Номер замовлення <b>{orderId}</b>. Ми звʼяжемося для підтвердження деталей і відправки.</p><div><Link className="button-v2 dark" to="/catalog">Ще до каталогу <ArrowUpRight/></Link><Link className="text-link-v2" to="/">На головну ↗</Link></div></div>
}
