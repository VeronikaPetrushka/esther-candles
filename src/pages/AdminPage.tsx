import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import {
  CalendarDays, ChevronDown, ChevronRight, ChevronUp, ClipboardList, ImagePlus,
  Layers3, LogOut, Package, Plus, Tags, Trash2, Users, X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { money } from '../lib/format'
import { ORDER_KEY, type Order, type OrderStatus } from '../store/ShopProvider'
import { useProducts, type ManagedProduct } from '../store/ProductProvider'
import { useWorkshops, type BookingStatus, type Workshop } from '../store/WorkshopProvider'

type AdminTab = 'overview'|'products'|'categories'|'workshops'|'bookings'|'orders'

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
  const { products, categories, saveProduct, deleteProduct, replaceProducts, addCategory, renameCategory, deleteCategory } = useProducts()
  const [tab, setTab] = useState<AdminTab>('overview')
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null)
  const [editingProduct, setEditingProduct] = useState<ManagedProduct | null>(null)
  const [orders, setOrders] = useState<Order[]>(() => loadOrders())
  const upcoming = workshops.filter((item) => item.date >= new Date().toISOString().slice(0,10) && item.status === 'published')
  const reservedSeats = bookings.filter((item) => item.status !== 'cancelled').reduce((sum,item)=>sum+item.guests,0)

  const navigate = (next: AdminTab) => {
    setTab(next)
    if (next === 'orders') setOrders(loadOrders())
  }

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const next = orders.map((order) => order.id === id ? { ...order, status } : order)
    setOrders(next)
    localStorage.setItem(ORDER_KEY, JSON.stringify(next))
  }

  const moveProduct = (id: string, direction: -1|1) => {
    const index = products.findIndex((item) => item.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= products.length) return
    const next = [...products]
    ;[next[index], next[target]] = [next[target], next[index]]
    replaceProducts(next)
  }

  return <div className="esther-admin-v2">
    <aside className="admin-side-v2">
      <Link to="/" className="admin-logo-v2"><img src="/assets/esther-logo.png" alt=""/><b>ESTHER</b></Link>
      <nav aria-label="Адмін навігація">
        <AdminNavButton active={tab==='overview'} onClick={()=>navigate('overview')} icon={<ChevronRight/>}>Огляд</AdminNavButton>
        <AdminNavButton active={tab==='products'} onClick={()=>navigate('products')} icon={<Package/>} count={products.length}>Товари</AdminNavButton>
        <AdminNavButton active={tab==='categories'} onClick={()=>navigate('categories')} icon={<Tags/>} count={categories.length}>Категорії</AdminNavButton>
        <AdminNavButton active={tab==='workshops'} onClick={()=>navigate('workshops')} icon={<CalendarDays/>}>Майстер-класи</AdminNavButton>
        <AdminNavButton active={tab==='bookings'} onClick={()=>navigate('bookings')} icon={<Users/>} count={bookings.length}>Записи</AdminNavButton>
        <AdminNavButton active={tab==='orders'} onClick={()=>navigate('orders')} icon={<ClipboardList/>} count={orders.length}>Замовлення</AdminNavButton>
      </nav>
      <button className="admin-logout-v2" onClick={onLogout}><LogOut/>Вийти</button>
    </aside>

    <main className="admin-content-v2">
      {tab==='overview' && <>
        <header className="admin-title-v2"><span className="micro-v2">DASHBOARD</span><h1>ESTHER<br/><em>today.</em></h1></header>
        <div className="admin-stat-grid-v2">
          <Stat label="Товарів" value={products.length}/><Stat label="Категорій" value={categories.length}/><Stat label="Майбутні майстер-класи" value={upcoming.length}/><Stat label="Замовлення" value={orders.length}/>
        </div>
        <section className="admin-panel-v2"><h2>Найближчі дати</h2>{upcoming.slice(0,4).map(w=><div className="admin-upcoming-v2" key={w.id}><b>{formatDate(w.date)}</b><span>{w.time}</span><strong>{w.title}</strong><small>{bookings.filter(b=>b.workshopId===w.id&&b.status!=='cancelled').reduce((s,b)=>s+b.guests,0)} / {w.capacity} місць</small></div>)}</section>
      </>}

      {tab==='products' && <>
        <header className="admin-row-title-v2"><div><span className="micro-v2">CATALOG / CMS</span><h1>Товари.</h1></div><button className="button-v2 dark" onClick={()=>setEditingProduct(emptyProduct(categories))}><Plus/> Додати товар</button></header>
        <p className="admin-help-v2">Перший файл у галереї — обкладинка. Фото можна завантажувати групою, видаляти та переставляти. Зміни одразу відображаються в каталозі й на головній.</p>
        <div className="admin-product-list-v2">
          {products.map((product,index)=><article className="admin-product-card-v2" key={product.id}>
            <div className="admin-product-thumb-v2"><img src={product.images?.[0] || product.image} alt=""/><span>{product.images?.length || 1} фото</span></div>
            <div className="admin-product-copy-v2"><small>{product.category} · {product.active === false ? 'приховано' : 'активний'}</small><h3>{product.name}</h3><p>{product.note}</p><b>{money(product.price)}</b></div>
            <div className="admin-product-controls-v2">
              <button disabled={index===0} onClick={()=>moveProduct(product.id,-1)} aria-label="Підняти"><ChevronUp/></button>
              <button disabled={index===products.length-1} onClick={()=>moveProduct(product.id,1)} aria-label="Опустити"><ChevronDown/></button>
              <button onClick={()=>setEditingProduct(product)}>Редагувати</button>
              <button className="danger" onClick={()=>confirm(`Видалити «${product.name}»?`)&&deleteProduct(product.id)} aria-label="Видалити"><Trash2/></button>
            </div>
          </article>)}
        </div>
        {editingProduct && <ProductEditor product={editingProduct} categories={categories} onClose={()=>setEditingProduct(null)} onSave={(product)=>{saveProduct(product);setEditingProduct(null)}}/>}
      </>}

      {tab==='categories' && <CategoriesPanel categories={categories} addCategory={addCategory} renameCategory={renameCategory} deleteCategory={deleteCategory}/>} 

      {tab==='workshops' && <>
        <header className="admin-row-title-v2"><div><span className="micro-v2">CALENDAR / CMS</span><h1>Майстер-класи.</h1></div><button className="button-v2 dark" onClick={()=>setEditingWorkshop(emptyWorkshop())}><Plus/> Додати</button></header>
        <AdminWorkshopCalendar workshops={workshops} onEdit={setEditingWorkshop} onCreate={(date)=>setEditingWorkshop({...emptyWorkshop(),date})}/>
        <div className="admin-table-v2"><div className="admin-table-head-v2"><span>Дата</span><span>Майстер-клас</span><span>Місця</span><span>Статус</span><span/></div>{workshops.map(w=>{const seats=bookings.filter(b=>b.workshopId===w.id&&b.status!=='cancelled').reduce((s,b)=>s+b.guests,0);return <div className="admin-table-row-v2" key={w.id}><span><b>{formatDate(w.date)}</b><small>{w.time}</small></span><span><b>{w.title}</b><small>{w.city} · {money(w.price)}</small></span><span>{seats} / {w.capacity}</span><span><i className={`admin-status-dot-v2 ${w.status}`}/>{w.status==='published'?'Опубліковано':'Чернетка'}</span><span className="admin-actions-v2"><button onClick={()=>setEditingWorkshop(w)}>Редагувати</button><button aria-label="Видалити" onClick={()=>confirm('Видалити майстер-клас?')&&deleteWorkshop(w.id)}><Trash2/></button></span></div>})}</div>
        {editingWorkshop&&<WorkshopEditor workshop={editingWorkshop} onClose={()=>setEditingWorkshop(null)} onSave={(w)=>{saveWorkshop(w);setEditingWorkshop(null)}}/>}
      </>}

      {tab==='bookings' && <><header className="admin-title-v2"><span className="micro-v2">WORKSHOP CRM</span><h1>Записи.</h1></header><div className="admin-table-v2 bookings"><div className="admin-table-head-v2"><span>Коли</span><span>Гість</span><span>Майстер-клас</span><span>Статус</span><span/></div>{bookings.length?bookings.map(b=><div className="admin-table-row-v2" key={b.id}><span><b>{formatDate(b.workshopDate)}</b><small>{b.workshopTime} · {b.guests} місц.</small></span><span><b>{b.name}</b><small>{b.phone}<br/>{b.email}</small></span><span><b>{b.workshopTitle}</b><small>заявка {new Date(b.createdAt).toLocaleString('uk-UA')}</small></span><span><BookingStatusPill status={b.status}/></span><span><select value={b.status} onChange={(e)=>updateBookingStatus(b.id,e.target.value as BookingStatus)}><option value="new">Нова</option><option value="confirmed">Підтверджено</option><option value="cancelled">Скасовано</option></select></span></div>):<p className="admin-empty-v2">Ще немає записів на майстер-класи.</p>}</div></>}

      {tab==='orders' && <OrdersPanel orders={orders} updateStatus={updateOrderStatus}/>} 
    </main>
  </div>
}

function AdminNavButton({active,onClick,icon,count,children}:{active:boolean;onClick:()=>void;icon:ReactNode;count?:number;children:ReactNode}){
  return <button className={active?'active':''} onClick={onClick}>{icon}<span>{children}</span>{typeof count==='number'&&<i>{count}</i>}</button>
}

function OrdersPanel({orders,updateStatus}:{orders:Order[];updateStatus:(id:string,status:OrderStatus)=>void}){
  return <><header className="admin-title-v2"><span className="micro-v2">SHOP / ORDERS</span><h1>Замовлення.</h1></header>
    <div className="admin-orders-v2">{orders.length?orders.map(order=><article className="admin-order-card-v2" key={order.id}>
      <header><div><span className="micro-v2">{order.id}</span><b>{new Date(order.createdAt).toLocaleString('uk-UA')}</b></div><strong>{money(order.total)}</strong></header>
      <div className="admin-order-customer-v2"><div><span>КЛІЄНТ</span><b>{order.customer.name}</b><small>{order.customer.phone}<br/>{order.customer.email}</small></div><div><span>ДОСТАВКА</span><b>{order.customer.city}</b><small>{order.customer.delivery==='courier'?'Курʼєр':order.customer.warehouse || 'Відділення'}</small></div><div><span>ОПЛАТА</span><b>{order.paymentStatus==='paid'?'Оплачено':'Очікує'}</b><small>{order.customer.payment==='card'?'Картка':'Післяплата'}</small></div></div>
      <div className="admin-order-items-v2">{order.items.map((item)=><div key={`${order.id}-${item.id}`}><img src={item.image} alt=""/><span><b>{item.name}</b><small>{item.qty} × {money(item.price)}</small></span></div>)}</div>
      <footer><label><span>СТАТУС</span><select value={order.status || 'new'} onChange={(e)=>updateStatus(order.id,e.target.value as OrderStatus)}><option value="new">Нове</option><option value="seen">Переглянуто</option><option value="processing">В роботі</option><option value="shipped">Відправлено</option></select></label>{order.customer.note&&<p>{order.customer.note}</p>}</footer>
    </article>):<p className="admin-empty-v2">Ще немає замовлень.</p>}</div>
  </>
}

function CategoriesPanel({categories,addCategory,renameCategory,deleteCategory}:{categories:string[];addCategory:(n:string)=>void;renameCategory:(a:string,b:string)=>void;deleteCategory:(n:string)=>void}){
  const [newName,setNewName]=useState('')
  const [editing,setEditing]=useState<string|null>(null)
  const [editName,setEditName]=useState('')
  const add=(e:FormEvent)=>{e.preventDefault();if(newName.trim()){addCategory(newName);setNewName('')}}
  return <><header className="admin-title-v2"><span className="micro-v2">CATALOG / TAXONOMY</span><h1>Категорії.</h1></header>
    <form className="admin-category-add-v2" onSubmit={add}><input value={newName} onChange={(e)=>setNewName(e.target.value)} placeholder="Нова категорія"/><button className="button-v2 dark"><Plus/> Додати</button></form>
    <div className="admin-category-list-v2">{categories.map((category,index)=><div key={category}>
      <span className="micro-v2">{String(index+1).padStart(2,'0')}</span>
      {editing===category?<input autoFocus value={editName} onChange={(e)=>setEditName(e.target.value)}/>:<b>{category}</b>}
      <div>{editing===category?<><button onClick={()=>{renameCategory(category,editName);setEditing(null)}}>Зберегти</button><button onClick={()=>setEditing(null)}>Скасувати</button></>:<button onClick={()=>{setEditing(category);setEditName(category)}}>Перейменувати</button>}<button className="danger" onClick={()=>confirm(`Видалити категорію «${category}»? Товари буде перенесено в іншу категорію.`)&&deleteCategory(category)}><Trash2/></button></div>
    </div>)}</div>
  </>
}

function ProductEditor({product,categories,onClose,onSave}:{product:ManagedProduct;categories:string[];onClose:()=>void;onSave:(p:ManagedProduct)=>void}){
  const [form,setForm]=useState<ManagedProduct>({...product,images:product.images?.length?[...product.images]:product.image?[product.image]:[]})
  const [uploading,setUploading]=useState(false)
  const [error,setError]=useState('')
  const upd=<K extends keyof ManagedProduct>(key:K,value:ManagedProduct[K])=>setForm((current)=>({...current,[key]:value}))
  const gallery=form.images || []

  const filesChanged=async(e:ChangeEvent<HTMLInputElement>)=>{
    const files=Array.from(e.target.files||[]).slice(0,Math.max(0,8-gallery.length))
    if(!files.length)return
    setUploading(true);setError('')
    try{
      const images=await Promise.all(files.map(fileToOptimizedDataUrl))
      upd('images',[...gallery,...images])
    }catch{setError('Не вдалося обробити одне з фото.')}
    finally{setUploading(false);e.target.value=''}
  }
  const removeImage=(index:number)=>upd('images',gallery.filter((_,i)=>i!==index))
  const moveImage=(index:number,direction:-1|1)=>{const target=index+direction;if(target<0||target>=gallery.length)return;const next=[...gallery];[next[index],next[target]]=[next[target],next[index]];upd('images',next)}
  const cover=(index:number)=>{if(index===0)return;const next=[gallery[index],...gallery.filter((_,i)=>i!==index)];upd('images',next)}
  const submit=(e:FormEvent)=>{e.preventDefault();const name=form.name.trim();if(!name){setError('Додайте назву товару.');return}if(!gallery.length){setError('Додайте хоча б одне фото.');return}const id=form.id||slugify(name)||`product-${Date.now()}`;onSave({...form,id,name,image:gallery[0],images:gallery,category:form.category||categories[0]||'Без категорії'})}

  return <div className="admin-modal-v2" onMouseDown={(e)=>e.target===e.currentTarget&&onClose()}><form className="admin-editor-v2 product-editor-v2" onSubmit={submit}>
    <header><div><span className="micro-v2">PRODUCT EDITOR</span><h2>{form.name || 'Новий товар'}</h2></div><button type="button" onClick={onClose}><X/></button></header>
    <section className="admin-upload-v2">
      <div className="admin-upload-head-v2"><div><span className="micro-v2">GALLERY / {gallery.length}/8</span><h3>Фото товару</h3><p>Перше фото використовується як обкладинка в каталозі. Завантажуйте JPG, PNG або WebP.</p></div><label className={`button-v2 dark ${gallery.length>=8||uploading?'disabled':''}`}><ImagePlus/> {uploading?'Обробка…':'Додати фото'}<input type="file" multiple accept="image/*" disabled={gallery.length>=8||uploading} onChange={filesChanged}/></label></div>
      <div className="admin-gallery-grid-v2">{gallery.map((src,index)=><figure key={`${src.slice(0,24)}-${index}`} className={index===0?'cover':''}><img src={src} alt=""/><figcaption><b>{index===0?'ОБКЛАДИНКА':`PHOTO ${index+1}`}</b><div><button type="button" disabled={index===0} onClick={()=>moveImage(index,-1)}><ChevronUp/></button><button type="button" disabled={index===gallery.length-1} onClick={()=>moveImage(index,1)}><ChevronDown/></button>{index!==0&&<button type="button" onClick={()=>cover(index)}>Cover</button>}<button type="button" onClick={()=>removeImage(index)}><Trash2/></button></div></figcaption></figure>)}</div>
    </section>
    <div className="admin-editor-grid-v2">
      <label className="field-v2 span"><span>Назва</span><input value={form.name} onChange={(e)=>upd('name',e.target.value)}/></label>
      <label className="field-v2"><span>Категорія</span><select value={form.category} onChange={(e)=>upd('category',e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
      <label className="field-v2"><span>Ціна, ₴</span><input type="number" min="0" value={form.price} onChange={(e)=>upd('price',Number(e.target.value))}/></label>
      <label className="field-v2"><span>Матеріал</span><input value={form.material} onChange={(e)=>upd('material',e.target.value)}/></label>
      <label className="field-v2"><span>Час горіння</span><input value={form.burn} onChange={(e)=>upd('burn',e.target.value)}/></label>
      <label className="field-v2"><span>Аромат</span><input value={form.scent} onChange={(e)=>upd('scent',e.target.value)}/></label>
      <label className="field-v2"><span>Тег</span><input value={form.tag||''} onChange={(e)=>upd('tag',e.target.value)}/></label>
      <label className="field-v2 span"><span>Короткий підпис</span><input value={form.note} onChange={(e)=>upd('note',e.target.value)}/></label>
      <label className="field-v2 span"><span>Опис</span><textarea value={form.description} onChange={(e)=>upd('description',e.target.value)}/></label>
      <label className="admin-switch-v2 span"><input type="checkbox" checked={form.active!==false} onChange={(e)=>upd('active',e.target.checked)}/><span>Показувати товар на сайті</span></label>
    </div>
    {error&&<p className="admin-error-v2">{error}</p>}
    <footer><button type="button" className="button-v2" onClick={onClose}>Скасувати</button><button className="button-v2 dark">Зберегти товар</button></footer>
  </form></div>
}

async function fileToOptimizedDataUrl(file:File):Promise<string>{
  return new Promise((resolve,reject)=>{
    const reader=new FileReader()
    reader.onerror=()=>reject(reader.error)
    reader.onload=()=>{
      const image=new Image()
      image.onerror=()=>reject(new Error('image'))
      image.onload=()=>{
        const max=1400
        const scale=Math.min(1,max/Math.max(image.width,image.height))
        const width=Math.max(1,Math.round(image.width*scale)),height=Math.max(1,Math.round(image.height*scale))
        const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height
        const ctx=canvas.getContext('2d');if(!ctx){reject(new Error('canvas'));return}
        ctx.drawImage(image,0,0,width,height)
        resolve(canvas.toDataURL('image/webp',.82))
      }
      image.src=String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

function slugify(value:string){return value.toLowerCase().trim().replace(/[ʼ’']/g,'').replace(/[^a-z0-9а-яіїєґ]+/giu,'-').replace(/^-|-$/g,'')}
function emptyProduct(categories:string[]):ManagedProduct{return{id:'',name:'',category:categories[0]||'Без категорії',material:'натуральне дерево · віск',note:'',description:'',image:'',images:[],price:0,burn:'',scent:'',tag:'',active:true}}
function loadOrders():Order[]{try{return (JSON.parse(localStorage.getItem(ORDER_KEY)||'[]') as Order[]).map(o=>({...o,status:o.status||'new'}))}catch{return[]}}

function AdminWorkshopCalendar({workshops,onEdit,onCreate}:{workshops:Workshop[];onEdit:(w:Workshop)=>void;onCreate:(date:string)=>void}){
  const base=workshops.find(w=>w.date>=new Date().toISOString().slice(0,10))||workshops[0]
  const date=base?new Date(`${base.date}T12:00:00`):new Date()
  const year=date.getFullYear(),month=date.getMonth(),days=new Date(year,month+1,0).getDate(),offset=(new Date(year,month,1).getDay()+6)%7
  const label=new Intl.DateTimeFormat('uk-UA',{month:'long',year:'numeric'}).format(date)
  const iso=(day:number)=>`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  return <section className="admin-calendar-v2"><header><span className="micro-v2">MONTH VIEW</span><h2>{label}</h2><small>Натисни на порожню дату, щоб створити майстер-клас.</small></header><div className="admin-calendar-week-v2">{['ПН','ВТ','СР','ЧТ','ПТ','СБ','НД'].map(x=><span key={x}>{x}</span>)}</div><div className="admin-calendar-grid-v2">{Array.from({length:offset},(_,i)=><i key={`e-${i}`}/>)}{Array.from({length:days},(_,i)=>i+1).map(day=>{const dateIso=iso(day);const events=workshops.filter(w=>w.date===dateIso);return <button type="button" key={day} className={events.length?'has-event':''} onClick={()=>events[0]?onEdit(events[0]):onCreate(dateIso)}><b>{day}</b>{events.slice(0,2).map(w=><span key={w.id}>{w.time} {w.title}</span>)}{events.length>2&&<small>+{events.length-2}</small>}</button>})}</div></section>
}

function Stat({label,value}:{label:string;value:number}){return <div className="admin-stat-v2"><span>{label}</span><b>{value}</b></div>}
function BookingStatusPill({status}:{status:BookingStatus}){return <span className={`booking-status-v2 ${status}`}>{status==='new'?'Нова':status==='confirmed'?'Підтверджено':'Скасовано'}</span>}
function formatDate(date:string){return new Intl.DateTimeFormat('uk-UA',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${date}T12:00:00`))}
function emptyWorkshop():Workshop{return{id:`workshop-${Date.now()}`,title:'WOOD CANDLE / INTRO',date:new Date().toISOString().slice(0,10),time:'15:00',city:'Київ',duration:'≈ 2,5 години',capacity:6,price:1800,description:'Від вибору зрізу дерева до готової свічки ESTHER.',status:'published'}}
function WorkshopEditor({workshop,onClose,onSave}:{workshop:Workshop;onClose:()=>void;onSave:(w:Workshop)=>void}){
  const [f,setF]=useState(workshop);const upd=<K extends keyof Workshop>(k:K,v:Workshop[K])=>setF(x=>({...x,[k]:v}))
  return <div className="admin-modal-v2" onMouseDown={(e)=>e.target===e.currentTarget&&onClose()}><form className="admin-editor-v2" onSubmit={(e)=>{e.preventDefault();onSave(f)}}><header><div><span className="micro-v2">WORKSHOP EDITOR</span><h2>{workshop.title}</h2></div><button type="button" onClick={onClose}>×</button></header><div className="admin-editor-grid-v2"><label className="field-v2 span"><span>Назва</span><input value={f.title} onChange={(e)=>upd('title',e.target.value)}/></label><label className="field-v2"><span>Дата</span><input type="date" value={f.date} onChange={(e)=>upd('date',e.target.value)}/></label><label className="field-v2"><span>Час</span><input type="time" value={f.time} onChange={(e)=>upd('time',e.target.value)}/></label><label className="field-v2"><span>Місто</span><input value={f.city} onChange={(e)=>upd('city',e.target.value)}/></label><label className="field-v2"><span>Тривалість</span><input value={f.duration} onChange={(e)=>upd('duration',e.target.value)}/></label><label className="field-v2"><span>Місць</span><input type="number" min="1" value={f.capacity} onChange={(e)=>upd('capacity',Number(e.target.value))}/></label><label className="field-v2"><span>Ціна / людина</span><input type="number" min="0" value={f.price} onChange={(e)=>upd('price',Number(e.target.value))}/></label><label className="field-v2"><span>Статус</span><select value={f.status} onChange={(e)=>upd('status',e.target.value as Workshop['status'])}><option value="published">Опубліковано</option><option value="draft">Чернетка</option></select></label><label className="field-v2 span"><span>Опис</span><textarea value={f.description} onChange={(e)=>upd('description',e.target.value)}/></label></div><footer><button type="button" className="button-v2" onClick={onClose}>Скасувати</button><button className="button-v2 dark">Зберегти</button></footer></form></div>
}
