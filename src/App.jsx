import { useState, useEffect } from 'react'

const API = 'https://fastflow-backend-production.up.railway.app/api/v1'

async function api(endpoint, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  try {
    const res = await fetch(`${API}${endpoint}`, { ...options, headers })
    return res.json()
  } catch(e) {
    return { success: false, error: e.message }
  }
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('ff_token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('ff_user') || 'null'))
  const [page, setPage] = useState('dashboard')

  const logout = () => {
    localStorage.removeItem('ff_token')
    localStorage.removeItem('ff_user')
    setToken(null)
    setUser(null)
  }

  if (!token) return <Login setToken={setToken} setUser={setUser} />

  const nav = [
    { id:'dashboard', icon:'📊', label:'لوحة التحكم' },
    { id:'invoices', icon:'🧾', label:'الفواتير' },
    { id:'customers', icon:'👥', label:'العملاء' },
    { id:'accounts', icon:'🌳', label:'شجرة الحسابات' },
    { id:'journal', icon:'📒', label:'القيود اليومية' },
    { id:'expenses', icon:'💸', label:'المصروفات' },
    { id:'reports', icon:'📈', label:'التقارير' },
    { id:'employees', icon:'👤', label:'الموظفون' },
    { id:'settings', icon:'⚙️', label:'الإعدادات' },
  ]

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#070b18',fontFamily:'Cairo,sans-serif',direction:'rtl',color:'white'}}>
      <div style={{width:220,background:'#0f1629',borderLeft:'1px solid #1e2d4a',display:'flex',flexDirection:'column',position:'fixed',top:0,right:0,height:'100vh',zIndex:100}}>
        <div style={{padding:'16px',borderBottom:'1px solid #1e2d4a',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,background:'linear-gradient(135deg,#f0b429,#3b82f6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>⚡</div>
          <div>
            <div style={{color:'#f0b429',fontWeight:900,fontSize:15}}>FastFlow</div>
            <div style={{color:'#64748b',fontSize:10}}>ERP v2.0</div>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
          {nav.map(item => (
            <div key={item.id} onClick={()=>setPage(item.id)} style={{
              display:'flex',alignItems:'center',gap:8,padding:'9px 10px',borderRadius:8,cursor:'pointer',marginBottom:2,
              background:page===item.id?'rgba(240,180,41,0.1)':'transparent',
              color:page===item.id?'#f0b429':'#94a3b8',
              border:page===item.id?'1px solid rgba(240,180,41,0.2)':'1px solid transparent',
            }}>
              <span style={{fontSize:16}}>{item.icon}</span>
              <span style={{fontSize:13,fontWeight:page===item.id?700:400}}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{padding:'10px',borderTop:'1px solid #1e2d4a'}}>
          <div style={{background:'#0d1425',borderRadius:10,padding:'8px 10px',marginBottom:6}}>
            <div style={{fontSize:12,fontWeight:600}}>{user?.fullName}</div>
            <div style={{fontSize:10,color:'#64748b'}}>{user?.role}</div>
          </div>
          <div onClick={logout} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',cursor:'pointer',color:'#ef4444',fontSize:12,borderRadius:8}}>
            <span>🚪</span><span>خروج</span>
          </div>
        </div>
      </div>
      <div style={{marginRight:220,flex:1,display:'flex',flexDirection:'column'}}>
        <div style={{height:60,background:'rgba(7,11,24,0.95)',borderBottom:'1px solid #1e2d4a',display:'flex',alignItems:'center',padding:'0 20px',position:'sticky',top:0,zIndex:50}}>
          <div style={{flex:1,fontSize:16,fontWeight:700}}>{nav.find(n=>n.id===page)?.label}</div>
          <div style={{fontSize:11,color:'#64748b'}}>{new Date().toLocaleDateString('ar-SA',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        <div style={{flex:1,padding:20,overflowY:'auto'}}>
          {page==='dashboard' && <Dashboard token={token} />}
          {page==='invoices' && <Invoices token={token} />}
          {page==='customers' && <Customers token={token} />}
          {page==='accounts' && <Accounts token={token} />}
          {page==='journal' && <Journal token={token} />}
          {page==='expenses' && <Expenses token={token} />}
          {page==='reports' && <Reports token={token} />}
          {page==='employees' && <Employees token={token} />}
          {page==='settings' && <Settings token={token} user={user} />}
        </div>
      </div>
    </div>
  )
}

function Login({ setToken, setUser }) {
  const [form, setForm] = useState({username:'',password:''})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async () => {
    if (!form.username || !form.password) { setError('يرجى إدخال بيانات الدخول'); return }
    setLoading(true); setError('')
    const data = await api('/auth/login', {method:'POST',body:JSON.stringify(form)})
    if (data.success) {
      localStorage.setItem('ff_token', data.data.token)
      localStorage.setItem('ff_user', JSON.stringify(data.data.user))
      setToken(data.data.token)
      setUser(data.data.user)
    } else {
      setError(data.error || 'بيانات خاطئة')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#070b18',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Cairo,sans-serif',direction:'rtl',padding:20}}>
      <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:20,padding:36,width:'100%',maxWidth:380}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:56,height:56,background:'linear-gradient(135deg,#f0b429,#3b82f6)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,margin:'0 auto 12px'}}>⚡</div>
          <div style={{fontSize:22,fontWeight:900,color:'#f0b429'}}>FastFlow ERP</div>
          <div style={{color:'#64748b',fontSize:12,marginTop:4}}>نظام المحاسبة السحابي المتكامل</div>
        </div>
        {error && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'8px 12px',color:'#ef4444',fontSize:12,marginBottom:14}}>{error}</div>}
        <div style={{marginBottom:14}}>
          <label style={{color:'#94a3b8',fontSize:12,display:'block',marginBottom:4}}>اسم المستخدم</label>
          <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})}
            style={{width:'100%',background:'#0d1425',border:'1.5px solid #1e2d4a',borderRadius:8,padding:'10px 12px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:13,outline:'none',boxSizing:'border-box'}}
            placeholder="admin" />
        </div>
        <div style={{marginBottom:20}}>
          <label style={{color:'#94a3b8',fontSize:12,display:'block',marginBottom:4}}>كلمة المرور</label>
          <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
            onKeyDown={e=>e.key==='Enter'&&login()}
            style={{width:'100%',background:'#0d1425',border:'1.5px solid #1e2d4a',borderRadius:8,padding:'10px 12px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:13,outline:'none',boxSizing:'border-box'}}
            placeholder="••••••••" />
        </div>
        <button onClick={login} disabled={loading}
          style={{width:'100%',background:'linear-gradient(135deg,#f0b429,#e09b1a)',border:'none',borderRadius:8,padding:12,color:'#000',fontFamily:'Cairo,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer'}}>
          {loading ? '⏳ جاري الدخول...' : 'تسجيل الدخول'}
        </button>
      </div>
    </div>
  )
}

function Dashboard({ token }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    api('/dashboard',{},token).then(d => d.success && setData(d.data))
  }, [])
  const kpis = data?.kpis || {}
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:20}}>
        {[
          {icon:'💰',label:'الإيرادات',value:(kpis.revenue||0).toLocaleString('ar-SA'),unit:'ر.س',color:'#f0b429'},
          {icon:'🧾',label:'الفواتير',value:kpis.invoiceCount||0,unit:'',color:'#60a5fa'},
          {icon:'✅',label:'الربح',value:(kpis.profit||0).toLocaleString('ar-SA'),unit:'ر.س',color:'#10b981'},
          {icon:'⏰',label:'المتأخرة',value:kpis.overdueInvoices||0,unit:'',color:'#ef4444'},
        ].map((c,i) => (
          <div key={i} style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,padding:18}}>
            <div style={{fontSize:26,marginBottom:8}}>{c.icon}</div>
            <div style={{fontSize:20,fontWeight:900,color:c.color}}>{c.value} <span style={{fontSize:12}}>{c.unit}</span></div>
            <div style={{fontSize:11,color:'#64748b',marginTop:4}}>{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid #1e2d4a',fontSize:14,fontWeight:700}}>🧾 آخر الفواتير</div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#0d1425'}}>
            {['رقم الفاتورة','العميل','الإجمالي','الحالة'].map(h=>(
              <th key={h} style={{padding:'9px 14px',fontSize:11,color:'#64748b',textAlign:'right',fontWeight:700}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {(data?.recentInvoices||[]).length===0
              ? <tr><td colSpan={4} style={{padding:28,textAlign:'center',color:'#64748b'}}>لا توجد فواتير بعد</td></tr>
              : (data?.recentInvoices||[]).map((inv,i)=>(
                <tr key={i} style={{borderBottom:'1px solid rgba(30,45,74,0.5)'}}>
                  <td style={{padding:'11px 14px',color:'#f0b429',fontWeight:700}}>{inv.invoiceNumber}</td>
                  <td style={{padding:'11px 14px'}}>{inv.clientName}</td>
                  <td style={{padding:'11px 14px',fontWeight:700}}>{Number(inv.total).toLocaleString('ar-SA')} ر.س</td>
                  <td style={{padding:'11px 14px'}}>
                    <span style={{background:inv.status==='PAID'?'rgba(16,185,129,0.15)':'rgba(59,130,246,0.15)',color:inv.status==='PAID'?'#10b981':'#60a5fa',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>
                      {inv.status==='PAID'?'مدفوعة':'مُصدرة'}
                    </span>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Invoices({ token }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({clientName:'',clientVat:'',items:[{name:'',quantity:1,unitPrice:0}]})
  const statusMap = {PAID:{label:'مدفوعة',color:'#10b981'},ISSUED:{label:'مُصدرة',color:'#60a5fa'},OVERDUE:{label:'متأخرة',color:'#ef4444'},DRAFT:{label:'مسودة',color:'#64748b'}}

  useEffect(()=>{
    api('/invoices',{},token).then(d=>{if(d.success)setInvoices(d.data?.invoices||[]);setLoading(false)})
  },[])

  const subtotal = form.items.reduce((s,i)=>s+(i.quantity*i.unitPrice),0)
  const vat = subtotal*0.15
  const total = subtotal+vat

  const save = async () => {
    const data = await api('/invoices',{method:'POST',body:JSON.stringify({...form,subtotal,vatAmount:vat,total,issueDate:new Date(),dueDate:new Date(Date.now()+30*86400000)})},token)
    if(data.success){setInvoices([data.data,...invoices]);setShowForm(false)}
  }

  return (
    <div>
      <div style={{display:'flex',gap:10,marginBottom:14}}>
        <button onClick={()=>setShowForm(!showForm)} style={{background:'linear-gradient(135deg,#f0b429,#e09b1a)',border:'none',borderRadius:8,padding:'9px 18px',color:'#000',fontFamily:'Cairo,sans-serif',fontWeight:700,cursor:'pointer'}}>
          {showForm?'✕ إغلاق':'+ فاتورة جديدة'}
        </button>
      </div>
      {showForm && (
        <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,padding:18,marginBottom:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            {[['clientName','اسم العميل'],['clientVat','الرقم الضريبي']].map(([key,label])=>(
              <div key={key}>
                <label style={{fontSize:11,color:'#94a3b8',display:'block',marginBottom:4}}>{label}</label>
                <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                  style={{width:'100%',background:'#0d1425',border:'1px solid #1e2d4a',borderRadius:7,padding:'9px 11px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
          </div>
          {form.items.map((item,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'3fr 1fr 1fr auto',gap:6,marginBottom:6}}>
              <input placeholder="اسم المنتج/الخدمة" value={item.name} onChange={e=>{const items=[...form.items];items[i].name=e.target.value;setForm({...form,items})}}
                style={{background:'#0d1425',border:'1px solid #1e2d4a',borderRadius:7,padding:'8px 10px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:12,outline:'none'}}/>
              <input type="number" placeholder="الكمية" value={item.quantity} onChange={e=>{const items=[...form.items];items[i].quantity=+e.target.value;setForm({...form,items})}}
                style={{background:'#0d1425',border:'1px solid #1e2d4a',borderRadius:7,padding:'8px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:12,outline:'none'}}/>
              <input type="number" placeholder="السعر" value={item.unitPrice} onChange={e=>{const items=[...form.items];items[i].unitPrice=+e.target.value;setForm({...form,items})}}
                style={{background:'#0d1425',border:'1px solid #1e2d4a',borderRadius:7,padding:'8px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:12,outline:'none'}}/>
              <button onClick={()=>setForm({...form,items:form.items.filter((_,j)=>j!==i)})}
                style={{background:'rgba(239,68,68,0.15)',border:'none',borderRadius:7,padding:'8px',color:'#ef4444',cursor:'pointer'}}>✕</button>
            </div>
          ))}
          <button onClick={()=>setForm({...form,items:[...form.items,{name:'',quantity:1,unitPrice:0}]})}
            style={{background:'#0d1425',border:'1px solid #1e2d4a',borderRadius:7,padding:'7px 14px',color:'#94a3b8',fontFamily:'Cairo,sans-serif',fontSize:12,cursor:'pointer',marginBottom:12}}>+ بند</button>
          <div style={{background:'#0d1425',borderRadius:8,padding:12,marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}><span>قبل الضريبة</span><span>{subtotal.toFixed(2)} ر.س</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#f0b429'}}><span>الضريبة 15%</span><span>{vat.toFixed(2)} ر.س</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:14,fontWeight:700,color:'#f0b429',borderTop:'1px solid #1e2d4a',paddingTop:8,marginTop:8}}><span>الإجمالي</span><span>{total.toFixed(2)} ر.س</span></div>
          </div>
          <button onClick={save} style={{background:'linear-gradient(135deg,#f0b429,#e09b1a)',border:'none',borderRadius:8,padding:'9px 20px',color:'#000',fontFamily:'Cairo,sans-serif',fontWeight:700,cursor:'pointer'}}>✅ إصدار الفاتورة</button>
        </div>
      )}
      <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid #1e2d4a',fontSize:14,fontWeight:700}}>🧾 الفواتير (ZATCA)</div>
        {loading?<div style={{padding:28,textAlign:'center',color:'#64748b'}}>⏳ جاري التحميل...</div>:(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#0d1425'}}>
              {['رقم الفاتورة','العميل','التاريخ','الإجمالي','الحالة'].map(h=>(
                <th key={h} style={{padding:'9px 14px',fontSize:11,color:'#64748b',textAlign:'right',fontWeight:700}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {invoices.length===0
                ?<tr><td colSpan={5} style={{padding:28,textAlign:'center',color:'#64748b'}}>لا توجد فواتير</td></tr>
                :invoices.map((inv,i)=>(
                  <tr key={i} style={{borderBottom:'1px solid rgba(30,45,74,0.5)'}}>
                    <td style={{padding:'11px 14px',color:'#f0b429',fontWeight:700}}>{inv.invoiceNumber}</td>
                    <td style={{padding:'11px 14px'}}>{inv.clientName}</td>
                    <td style={{padding:'11px 14px',color:'#64748b'}}>{new Date(inv.issueDate).toLocaleDateString('ar-SA')}</td>
                    <td style={{padding:'11px 14px',fontWeight:700}}>{Number(inv.total).toLocaleString('ar-SA')} ر.س</td>
                    <td style={{padding:'11px 14px'}}>
                      <span style={{background:`${statusMap[inv.status]?.color}22`,color:statusMap[inv.status]?.color,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>
                        {statusMap[inv.status]?.label}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Customers({ token }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({name:'',phone:'',email:'',vatNumber:''})

  useEffect(()=>{
    api('/customers',{},token).then(d=>{if(d.success)setCustomers(d.data||[]);setLoading(false)})
  },[])

  const save = async () => {
    const data = await api('/customers',{method:'POST',body:JSON.stringify(form)},token)
    if(data.success){setCustomers([data.data,...customers]);setShowForm(false);setForm({name:'',phone:'',email:'',vatNumber:''})}
  }

  return (
    <div>
      <div style={{display:'flex',gap:10,marginBottom:14}}>
        <button onClick={()=>setShowForm(!showForm)} style={{background:'linear-gradient(135deg,#f0b429,#e09b1a)',border:'none',borderRadius:8,padding:'9px 18px',color:'#000',fontFamily:'Cairo,sans-serif',fontWeight:700,cursor:'pointer'}}>
          {showForm?'✕ إغلاق':'+ عميل جديد'}
        </button>
      </div>
      {showForm && (
        <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,padding:18,marginBottom:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            {[['name','الاسم'],['phone','الهاتف'],['email','البريد'],['vatNumber','الرقم الضريبي']].map(([key,label])=>(
              <div key={key}>
                <label style={{fontSize:11,color:'#94a3b8',display:'block',marginBottom:4}}>{label}</label>
                <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                  style={{width:'100%',background:'#0d1425',border:'1px solid #1e2d4a',borderRadius:7,padding:'9px 11px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
          </div>
          <button onClick={save} style={{background:'linear-gradient(135deg,#f0b429,#e09b1a)',border:'none',borderRadius:8,padding:'9px 20px',color:'#000',fontFamily:'Cairo,sans-serif',fontWeight:700,cursor:'pointer'}}>💾 حفظ</button>
        </div>
      )}
      <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid #1e2d4a',fontSize:14,fontWeight:700}}>👥 العملاء</div>
        {loading?<div style={{padding:28,textAlign:'center',color:'#64748b'}}>⏳ جاري التحميل...</div>:(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#0d1425'}}>
              {['الاسم','الهاتف','البريد','الرقم الضريبي'].map(h=>(
                <th key={h} style={{padding:'9px 14px',fontSize:11,color:'#64748b',textAlign:'right',fontWeight:700}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {customers.length===0
                ?<tr><td colSpan={4} style={{padding:28,textAlign:'center',color:'#64748b'}}>لا يوجد عملاء</td></tr>
                :customers.map((c,i)=>(
                  <tr key={i} style={{borderBottom:'1px solid rgba(30,45,74,0.5)'}}>
                    <td style={{padding:'11px 14px',fontWeight:600}}>{c.name}</td>
                    <td style={{padding:'11px 14px',color:'#94a3b8'}}>{c.phone||'-'}</td>
                    <td style={{padding:'11px 14px',color:'#94a3b8'}}>{c.email||'-'}</td>
                    <td style={{padding:'11px 14px',color:'#64748b'}}>{c.vatNumber||'-'}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Accounts({ token }) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    api('/accounts',{},token).then(d=>{if(d.success)setAccounts(d.data||[]);setLoading(false)})
  },[])
  const typeColors={ASSET:'#60a5fa',LIABILITY:'#ef4444',EQUITY:'#8b5cf6',REVENUE:'#10b981',EXPENSE:'#f0b429'}
  const typeNames={ASSET:'أصول',LIABILITY:'خصوم',EQUITY:'حقوق ملكية',REVENUE:'إيرادات',EXPENSE:'مصروفات'}
  return (
    <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid #1e2d4a',fontSize:14,fontWeight:700}}>🌳 شجرة الحسابات</div>
      {loading?<div style={{padding:28,textAlign:'center',color:'#64748b'}}>⏳ جاري التحميل...</div>:(
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#0d1425'}}>
            {['رمز','اسم الحساب','النوع'].map(h=>(
              <th key={h} style={{padding:'9px 14px',fontSize:11,color:'#64748b',textAlign:'right',fontWeight:700}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {accounts.map((a,i)=>(
              <tr key={i} style={{borderBottom:'1px solid rgba(30,45,74,0.5)'}}>
                <td style={{padding:'11px 14px',fontFamily:'monospace',color:'#f0b429'}}>{a.code}</td>
                <td style={{padding:'11px 14px',fontWeight:600}}>{a.nameAr}</td>
                <td style={{padding:'11px 14px'}}>
                  <span style={{background:`${typeColors[a.type]}22`,color:typeColors[a.type],padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>{typeNames[a.type]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function Journal({ token }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    api('/journal',{},token).then(d=>{if(d.success)setEntries(d.data||[]);setLoading(false)})
  },[])
  return (
    <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid #1e2d4a',fontSize:14,fontWeight:700}}>📒 القيود اليومية</div>
      {loading?<div style={{padding:28,textAlign:'center',color:'#64748b'}}>⏳ جاري التحميل...</div>:(
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#0d1425'}}>
            {['رقم القيد','التاريخ','البيان','مدين','دائن'].map(h=>(
              <th key={h} style={{padding:'9px 14px',fontSize:11,color:'#64748b',textAlign:'right',fontWeight:700}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {entries.length===0
              ?<tr><td colSpan={5} style={{padding:28,textAlign:'center',color:'#64748b'}}>لا توجد قيود</td></tr>
              :entries.map((e,i)=>(
                <tr key={i} style={{borderBottom:'1px solid rgba(30,45,74,0.5)'}}>
                  <td style={{padding:'11px 14px',color:'#f0b429',fontWeight:700}}>{e.entryNumber}</td>
                  <td style={{padding:'11px 14px',color:'#64748b'}}>{new Date(e.date).toLocaleDateString('ar-SA')}</td>
                  <td style={{padding:'11px 14px'}}>{e.description}</td>
                  <td style={{padding:'11px 14px',color:'#10b981'}}>{Number(e.totalDebit).toLocaleString('ar-SA')}</td>
                  <td style={{padding:'11px 14px',color:'#ef4444'}}>{Number(e.totalCredit).toLocaleString('ar-SA')}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      )}
    </div>
  )
}

function Expenses({ token }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({title:'',amount:'',category:'RENT',date:new Date().toISOString().split('T')[0]})
  const cats={RENT:'إيجار',UTILITIES:'مرافق',SALARIES:'رواتب',MARKETING:'تسويق',MAINTENANCE:'صيانة',OTHER:'أخرى'}

  useEffect(()=>{
    api('/expenses',{},token).then(d=>{if(d.success)setExpenses(d.data||[]);setLoading(false)})
  },[])

  const save = async () => {
    const data = await api('/expenses',{method:'POST',body:JSON.stringify({...form,amount:+form.amount,vatAmount:+form.amount*0.15})},token)
    if(data.success){setExpenses([data.data,...expenses]);setShowForm(false)}
  }

  return (
    <div>
      <div style={{display:'flex',gap:10,marginBottom:14}}>
        <button onClick={()=>setShowForm(!showForm)} style={{background:'linear-gradient(135deg,#f0b429,#e09b1a)',border:'none',borderRadius:8,padding:'9px 18px',color:'#000',fontFamily:'Cairo,sans-serif',fontWeight:700,cursor:'pointer'}}>
          {showForm?'✕ إغلاق':'+ مصروف جديد'}
        </button>
      </div>
      {showForm && (
        <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,padding:18,marginBottom:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            <div>
              <label style={{fontSize:11,color:'#94a3b8',display:'block',marginBottom:4}}>العنوان</label>
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                style={{width:'100%',background:'#0d1425',border:'1px solid #1e2d4a',borderRadius:7,padding:'9px 11px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div>
              <label style={{fontSize:11,color:'#94a3b8',display:'block',marginBottom:4}}>المبلغ</label>
              <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}
                style={{width:'100%',background:'#0d1425',border:'1px solid #1e2d4a',borderRadius:7,padding:'9px 11px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div>
              <label style={{fontSize:11,color:'#94a3b8',display:'block',marginBottom:4}}>الفئة</label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                style={{width:'100%',background:'#0d1425',border:'1px solid #1e2d4a',borderRadius:7,padding:'9px 11px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:12,outline:'none',boxSizing:'border-box'}}>
                {Object.entries(cats).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:11,color:'#94a3b8',display:'block',marginBottom:4}}>التاريخ</label>
              <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}
                style={{width:'100%',background:'#0d1425',border:'1px solid #1e2d4a',borderRadius:7,padding:'9px 11px',color:'white',fontFamily:'Cairo,sans-serif',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
            </div>
          </div>
          <button onClick={save} style={{background:'linear-gradient(135deg,#f0b429,#e09b1a)',border:'none',borderRadius:8,padding:'9px 20px',color:'#000',fontFamily:'Cairo,sans-serif',fontWeight:700,cursor:'pointer'}}>💾 حفظ</button>
        </div>
      )}
      <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid #1e2d4a',fontSize:14,fontWeight:700}}>💸 المصروفات</div>
        {loading?<div style={{padding:28,textAlign:'center',color:'#64748b'}}>⏳ جاري التحميل...</div>:(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#0d1425'}}>
              {['العنوان','الفئة','المبلغ','التاريخ'].map(h=>(
                <th key={h} style={{padding:'9px 14px',fontSize:11,color:'#64748b',textAlign:'right',fontWeight:700}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {expenses.length===0
                ?<tr><td colSpan={4} style={{padding:28,textAlign:'center',color:'#64748b'}}>لا توجد مصروفات</td></tr>
                :expenses.map((e,i)=>(
                  <tr key={i} style={{borderBottom:'1px solid rgba(30,45,74,0.5)'}}>
                    <td style={{padding:'11px 14px',fontWeight:600}}>{e.title}</td>
                    <td style={{padding:'11px 14px',color:'#94a3b8'}}>{cats[e.category]||e.category}</td>
                    <td style={{padding:'11px 14px',color:'#f0b429'}}>{Number(e.amount).toLocaleString('ar-SA')} ر.س</td>
                    <td style={{padding:'11px 14px',color:'#64748b'}}>{new Date(e.date).toLocaleDateString('ar-SA')}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Reports({ token }) {
  const [report, setReport] = useState(null)
  const [type, setType] = useState(null)
  const [loading, setLoading] = useState(false)
  const load = async (t) => {
    setType(t);setLoading(true)
    const ep={pl:'/reports/profit-loss',tb:'/reports/trial-balance',vat:'/reports/vat'}
    const data = await api(ep[t],{},token)
    if(data.success)setReport(data.data)
    setLoading(false)
  }
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:20}}>
        {[{id:'pl',icon:'📊',title:'قائمة الدخل'},{id:'tb',icon:'📋',title:'ميزان المراجعة'},{id:'vat',icon:'🧮',title:'تقرير الضريبة'}].map(r=>(
          <div key={r.id} onClick={()=>load(r.id)}
            style={{background:type===r.id?'rgba(240,180,41,0.1)':'#0f1629',border:`1px solid ${type===r.id?'#f0b429':'#1e2d4a'}`,borderRadius:14,padding:20,textAlign:'center',cursor:'pointer'}}>
            <div style={{fontSize:32,marginBottom:8}}>{r.icon}</div>
            <div style={{fontSize:13,fontWeight:700}}>{r.title}</div>
          </div>
        ))}
      </div>
      {loading&&<div style={{textAlign:'center',padding:32,color:'#64748b'}}>⏳ جاري التحميل...</div>}
      {report&&!loading&&type==='pl'&&(
        <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,padding:18}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14,color:'#f0b429'}}>📊 قائمة الدخل</div>
          {[
            {label:'إجمالي الإيرادات',value:report.revenue?.gross,color:'#10b981'},
            {label:'إجمالي المصروفات',value:report.expenses?.total,color:'#ef4444'},
            {label:'صافي الربح',value:report.profit?.gross,color:'#f0b429',big:true},
          ].map((row,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid rgba(30,45,74,0.5)',fontSize:row.big?15:13,fontWeight:row.big?700:400}}>
              <span style={{color:'#94a3b8'}}>{row.label}</span>
              <span style={{color:row.color}}>{Number(row.value||0).toLocaleString('ar-SA')} ر.س</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Employees({ token }) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    api('/employees',{},token).then(d=>{if(d.success)setEmployees(d.data||[]);setLoading(false)})
  },[])
  return (
    <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid #1e2d4a',fontSize:14,fontWeight:700}}>👤 الموظفون</div>
      {loading?<div style={{padding:28,textAlign:'center',color:'#64748b'}}>⏳ جاري التحميل...</div>:(
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#0d1425'}}>
            {['الاسم','المنصب','القسم','الراتب'].map(h=>(
              <th key={h} style={{padding:'9px 14px',fontSize:11,color:'#64748b',textAlign:'right',fontWeight:700}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {employees.length===0
              ?<tr><td colSpan={4} style={{padding:28,textAlign:'center',color:'#64748b'}}>لا يوجد موظفون</td></tr>
              :employees.map((e,i)=>(
                <tr key={i} style={{borderBottom:'1px solid rgba(30,45,74,0.5)'}}>
                  <td style={{padding:'11px 14px',fontWeight:600}}>{e.name}</td>
                  <td style={{padding:'11px 14px',color:'#94a3b8'}}>{e.position}</td>
                  <td style={{padding:'11px 14px',color:'#94a3b8'}}>{e.department}</td>
                  <td style={{padding:'11px 14px',color:'#f0b429'}}>{Number(e.salary).toLocaleString('ar-SA')} ر.س</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      )}
    </div>
  )
}

function Settings({ token, user }) {
  return (
    <div style={{background:'#0f1629',border:'1px solid #1e2d4a',borderRadius:14,padding:18}}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:14,color:'#f0b429'}}>⚙️ الإعدادات</div>
      {[['الاسم الكامل',user?.fullName],['اسم المستخدم',user?.username],['البريد',user?.email],['الصلاحية',user?.role]].map(([label,value])=>(
        <div key={label} style={{display:'flex',padding:'10px 0',borderBottom:'1px solid rgba(30,45,74,0.5)',fontSize:13}}>
          <span style={{color:'#64748b',width:160}}>{label}</span>
          <span style={{color:'white',fontWeight:600}}>{value||'-'}</span>
        </div>
      ))}
      <div style={{marginTop:16,display:'flex',alignItems:'center',gap:8}}>
        <span style={{width:10,height:10,background:'#10b981',borderRadius:'50%',display:'inline-block'}}></span>
        <span style={{fontSize:12,color:'#94a3b8'}}>متصل بـ Railway Backend ✅</span>
      </div>
    </div>
  )
}