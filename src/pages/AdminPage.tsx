import { useMemo, useState, type FormEvent } from 'react'
import { CalendarDays, ChevronRight, ClipboardList, LogOut, Plus, Trash2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { money } from '../lib/format'
import { type Order } from '../store/ShopProvider'
import { useWorkshops, type BookingStatus, type Workshop } from '../store/WorkshopProvider'

const ORDER_KEY = 'esther.orders.v2'

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('esther.admin') === '1')
  if (!authed) return <AdminLogin onLogin={() => { sessionStorage.setItem('esther.admin','1'); setAuthed(true) }}/>
  return <AdminPanel onLogout={() => { sessionStorage.removeItem('esther.admin'); setAuthed(false) }}/>
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (login === 'admin' && password === 'esther2026') onLogin()
    else setError('Невірний логін або пароль')
  }
  return <div className="esther-admin-login-v2"><form onSubmit={submit}>
    <img src="/assets/esther-logo.png" alt="ESTHER"/>
    <span className="micro-v2">ESTHER / ADMIN</span>
    <h1>Back office.</h1>
    <label className="field-v2"><span>Логін</span><input autoComplete="username" value={login} onChange={(e)=>setLogin(e.target.value)} placeholder="admin"/></label>
    <label className="field-v2"><span>Пароль</span><input type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="esther2026"/></label>
    {error && <p className="admin-error-v2">{error}</p>}
    <button className="button-v2 dark full">Увійти</button>
    <small>Demo: admin / esther2026</small>
  </form></div>
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const { workshops, bookings, saveWorkshop, deleteWorkshop, updateBookingStatus } = useWorkshops()
  const [tab, setTab] = useState<'overview'|'workshops'|'bookings'|'orders'>('overview')
  const [editing, setEditing] = useState<Workshop | null>(null)
  const orders = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(ORDER_KEY) || '[]') as Order[] } catch { return [] }
  }, [tab])
  const upcoming = workshops.filter((item) => item.date >= new Date().toISOString().slice(0,10) && item.status === 'published')
  const reservedSeats = bookings.filter((item) => item.status !== 'cancelled').reduce((sum,item)=>sum+item.guests,0)

  return <div className="esther-admin-v2">
    <aside className="admin-side-v2">
      <Link to="/" className="admin-logo-v2"><img src="/assets/esther-logo.png" alt=""/><b>ESTHER</b></Link>
      <nav>
        <button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}><ChevronRight/>Огляд</button>
        <button className={tab==='workshops'?'active':''} onClick={()=>setTab('workshops')}><CalendarDays/>Майстер-класи</button>
        <button className={tab==='bookings'?'active':''} onClick={()=>setTab('bookings')}><Users/>Записи <i>{bookings.length}</i></button>
        <button className={tab==='orders'?'active':''} onClick={()=>setTab('orders')}><ClipboardList/>Замовлення <i>{orders.length}</i></button>
      </nav>
      <button className="admin-logout-v2" onClick={onLogout}><LogOut/>Вийти</button>
    </aside>
    <main className="admin-content-v2">
      {tab==='overview' && <><header className="admin-title-v2"><span className="micro-v2">DASHBOARD</span><h1>ESTHER<br/><em>today.</em></h1></header><div className="admin-stat-grid-v2"><Stat label="Майбутні майстер-класи" value={upcoming.length}/><Stat label="Заброньовано місць" value={reservedSeats}/><Stat label="Нові заявки" value={bookings.filter(x=>x.status==='new').length}/><Stat label="Замовлення" value={orders.length}/></div><section className="admin-panel-v2"><h2>Найближчі дати</h2>{upcoming.slice(0,4).map(w=><div className="admin-upcoming-v2" key={w.id}><b>{formatDate(w.date)}</b><span>{w.time}</span><strong>{w.title}</strong><small>{bookings.filter(b=>b.workshopId===w.id&&b.status!=='cancelled').reduce((s,b)=>s+b.guests,0)} / {w.capacity} місць</small></div>)}</section></>}
      {tab==='workshops' && <><header className="admin-row-title-v2"><div><span className="micro-v2">CALENDAR / CMS</span><h1>Майстер-класи.</h1></div><button className="button-v2 dark" onClick={()=>setEditing(emptyWorkshop())}><Plus/> Додати</button></header><AdminWorkshopCalendar workshops={workshops} onEdit={setEditing} onCreate={(date)=>setEditing({...emptyWorkshop(),date})}/><div className="admin-table-v2"><div className="admin-table-head-v2"><span>Дата</span><span>Майстер-клас</span><span>Місця</span><span>Статус</span><span/></div>{workshops.map(w=>{const seats=bookings.filter(b=>b.workshopId===w.id&&b.status!=='cancelled').reduce((s,b)=>s+b.guests,0);return <div className="admin-table-row-v2" key={w.id}><span><b>{formatDate(w.date)}</b><small>{w.time}</small></span><span><b>{w.title}</b><small>{w.city} · {money(w.price)}</small></span><span>{seats} / {w.capacity}</span><span><i className={`admin-status-dot-v2 ${w.status}`}/>{w.status==='published'?'Опубліковано':'Чернетка'}</span><span className="admin-actions-v2"><button onClick={()=>setEditing(w)}>Редагувати</button><button aria-label="Видалити" onClick={()=>confirm('Видалити майстер-клас?')&&deleteWorkshop(w.id)}><Trash2/></button></span></div>})}</div>{editing&&<WorkshopEditor workshop={editing} onClose={()=>setEditing(null)} onSave={(w)=>{saveWorkshop(w);setEditing(null)}}/>}</>}
      {tab==='bookings' && <><header className="admin-title-v2"><span className="micro-v2">WORKSHOP CRM</span><h1>Записи.</h1></header><div className="admin-table-v2 bookings"><div className="admin-table-head-v2"><span>Коли</span><span>Гість</span><span>Майстер-клас</span><span>Статус</span><span/></div>{bookings.length?bookings.map(b=><div className="admin-table-row-v2" key={b.id}><span><b>{formatDate(b.workshopDate)}</b><small>{b.workshopTime} · {b.guests} місц.</small></span><span><b>{b.name}</b><small>{b.phone}<br/>{b.email}</small></span><span><b>{b.workshopTitle}</b><small>заявка {new Date(b.createdAt).toLocaleString('uk-UA')}</small></span><span><BookingStatus status={b.status}/></span><span><select value={b.status} onChange={(e)=>updateBookingStatus(b.id,e.target.value as BookingStatus)}><option value="new">Нова</option><option value="confirmed">Підтверджено</option><option value="cancelled">Скасовано</option></select></span></div>):<p className="admin-empty-v2">Ще немає записів на майстер-класи.</p>}</div></>}
      {tab==='orders' && <><header className="admin-title-v2"><span className="micro-v2">SHOP / ORDERS</span><h1>Замовлення.</h1></header><div className="admin-table-v2"><div className="admin-table-head-v2"><span>ID</span><span>Клієнт</span><span>Сума</span><span>Оплата</span><span>Дата</span></div>{orders.length?orders.map(o=><div className="admin-table-row-v2" key={o.id}><span><b>{o.id}</b></span><span><b>{o.customer.name}</b><small>{o.customer.phone}</small></span><span>{money(o.total)}</span><span>{o.paymentStatus==='paid'?'Оплачено':'Очікує'}</span><span>{new Date(o.createdAt).toLocaleString('uk-UA')}</span></div>):<p className="admin-empty-v2">Ще немає замовлень.</p>}</div></>}
    </main>
  </div>
}

function AdminWorkshopCalendar({workshops,onEdit,onCreate}:{workshops:Workshop[];onEdit:(w:Workshop)=>void;onCreate:(date:string)=>void}){
  const base=workshops.find(w=>w.date>=new Date().toISOString().slice(0,10))||workshops[0]
  const date=base?new Date(`${base.date}T12:00:00`):new Date()
  const year=date.getFullYear(),month=date.getMonth(),days=new Date(year,month+1,0).getDate(),offset=(new Date(year,month,1).getDay()+6)%7
  const label=new Intl.DateTimeFormat('uk-UA',{month:'long',year:'numeric'}).format(date)
  const iso=(day:number)=>`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  return <section className="admin-calendar-v2"><header><span className="micro-v2">MONTH VIEW</span><h2>{label}</h2><small>Натисни на порожню дату, щоб створити майстер-клас.</small></header><div className="admin-calendar-week-v2">{['ПН','ВТ','СР','ЧТ','ПТ','СБ','НД'].map(x=><span key={x}>{x}</span>)}</div><div className="admin-calendar-grid-v2">{Array.from({length:offset},(_,i)=><i key={`e-${i}`}/>)}{Array.from({length:days},(_,i)=>i+1).map(day=>{const dateIso=iso(day);const events=workshops.filter(w=>w.date===dateIso);return <button type="button" key={day} className={events.length?'has-event':''} onClick={()=>events[0]?onEdit(events[0]):onCreate(dateIso)}><b>{day}</b>{events.slice(0,2).map(w=><span key={w.id}>{w.time} {w.title}</span>)}{events.length>2&&<small>+{events.length-2}</small>}</button>})}</div></section>
}

function Stat({label,value}:{label:string;value:number}){return <div className="admin-stat-v2"><span>{label}</span><b>{value}</b></div>}
function BookingStatus({status}:{status:BookingStatus}){return <span className={`booking-status-v2 ${status}`}>{status==='new'?'Нова':status==='confirmed'?'Підтверджено':'Скасовано'}</span>}
function formatDate(date:string){return new Intl.DateTimeFormat('uk-UA',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${date}T12:00:00`))}
function emptyWorkshop():Workshop{return{id:`workshop-${Date.now()}`,title:'WOOD CANDLE / INTRO',date:new Date().toISOString().slice(0,10),time:'15:00',city:'Київ',duration:'≈ 2,5 години',capacity:6,price:1800,description:'Від вибору зрізу дерева до готової свічки ESTHER.',status:'published'}}
function WorkshopEditor({workshop,onClose,onSave}:{workshop:Workshop;onClose:()=>void;onSave:(w:Workshop)=>void}){
  const [f,setF]=useState(workshop);const upd=<K extends keyof Workshop>(k:K,v:Workshop[K])=>setF(x=>({...x,[k]:v}))
  return <div className="admin-modal-v2" onMouseDown={(e)=>e.target===e.currentTarget&&onClose()}><form className="admin-editor-v2" onSubmit={(e)=>{e.preventDefault();onSave(f)}}><header><div><span className="micro-v2">WORKSHOP EDITOR</span><h2>{workshop.title}</h2></div><button type="button" onClick={onClose}>×</button></header><div className="admin-editor-grid-v2"><label className="field-v2 span"><span>Назва</span><input value={f.title} onChange={(e)=>upd('title',e.target.value)}/></label><label className="field-v2"><span>Дата</span><input type="date" value={f.date} onChange={(e)=>upd('date',e.target.value)}/></label><label className="field-v2"><span>Час</span><input type="time" value={f.time} onChange={(e)=>upd('time',e.target.value)}/></label><label className="field-v2"><span>Місто</span><input value={f.city} onChange={(e)=>upd('city',e.target.value)}/></label><label className="field-v2"><span>Тривалість</span><input value={f.duration} onChange={(e)=>upd('duration',e.target.value)}/></label><label className="field-v2"><span>Місць</span><input type="number" min="1" value={f.capacity} onChange={(e)=>upd('capacity',Number(e.target.value))}/></label><label className="field-v2"><span>Ціна / людина</span><input type="number" min="0" value={f.price} onChange={(e)=>upd('price',Number(e.target.value))}/></label><label className="field-v2"><span>Статус</span><select value={f.status} onChange={(e)=>upd('status',e.target.value as Workshop['status'])}><option value="published">Опубліковано</option><option value="draft">Чернетка</option></select></label><label className="field-v2 span"><span>Опис</span><textarea value={f.description} onChange={(e)=>upd('description',e.target.value)}/></label></div><footer><button type="button" className="button-v2" onClick={onClose}>Скасувати</button><button className="button-v2 dark">Зберегти</button></footer></form></div>
}
