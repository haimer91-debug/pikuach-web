import { useState } from 'react'
import { Plus, X, Download, Users, Check, Clock, ChevronLeft, Trash2 } from 'lucide-react'

// ─── demo data ────────────────────────────────────────────────────────────────
const DEMO_MEETINGS = [
  {
    id: '1',
    title: 'פגישה שבועית',
    project: 'סוקולוב 35',
    date: '2026-07-30',
    participants: [
      { name: 'חיים עזרא',      role: 'מפקח',             company: 'חברת פיקוח',   email: 'haimezra.pm@gmail.com' },
      { name: "סארי ג'לג'ולה", role: 'מהנדס ביצוע',      company: 'חברה קבלנית', email: 'Sari91j@gmail.com' },
      { name: 'אחסן',            role: 'קבלן ראשי',        company: '',              email: 'jtb.ahsan@gmail.com' },
      { name: 'אוראל בן אור',   role: 'מנהל',             company: 'חברת ביתא',   email: 'orel@mybeita.com' },
      { name: 'תום שנדור',       role: 'מנהל פרויקטים',   company: 'חברת ביתא',   email: 'tom@mybeita.com' },
    ],
    cc: [
      { name: 'אופק מאיר', role: 'מנהל', company: 'חברת ביתא', email: 'ofek@mybeita.com' },
    ],
    status_notes: [
      'נתיבים קריטיים: הטמנת קו חשמל, קידום אישורים ובדיקות לטופס 4',
      'סטטוס עבודות הגמר — הכנת דירות למסירות, השלמות מטבחים, עבודות פיתוח',
    ],
    items: [
      { id:'i1',  number:'1',   topic:'לוז הפרויקט',             description:'מועד מסירה חוזי 04/01/26. הפרויקט בעיכוב של 7 חודשים (5 עיכוב + 2 גרייס). יש לפעול בדחיפות לצמצום הלוז.', responsible:"סארי ג'לג'ולה", deadline:'מיידי',    status:'open', section:false },
      { id:'i2',  number:'2',   topic:'נתיבים קריטיים למעקב יומי', description:'',                                              responsible:'',                                                 deadline:'',         status:'open', section:true  },
      { id:'i3',  number:'2.1', topic:'הטמנת קו חשמל',            description:"עבר לאישור משטרה. צפי קבלת היתר בימים הקרובים.", responsible:"חיים עזרא, תום שנדור, סארי ג'לג'ולה",             deadline:'03/08/26',  status:'open', section:false },
      { id:'i4',  number:'2.2', topic:'חניון פרקומט',              description:'הוזמן שער כניסה, צפי 28/08/26.',                 responsible:"סארי ג'לג'ולה",                                   deadline:'28/08/26',  status:'open', section:false },
      { id:'i5',  number:'2.3', topic:'התקנת אלומיניום',           description:"ויטרינה כניסה לובי — טרם בוצע. תנאי לחתימת יועץ בטיחות על א'2 ולקביעת מועד ביקורת כיבוי אש.", responsible:"סארי ג'לג'ולה",                                   deadline:'10/08/26',  status:'open', section:false },
      { id:'i6',  number:'3',   topic:'ביצוע',                     description:'',                                              responsible:'',                                                 deadline:'',          status:'open', section:true  },
      { id:'i7',  number:'3.1', topic:'ניקוז חצר אנגלי',          description:'מפרט אושר ע"י יועץ אינסטלציה וקונסטרוקטור. יש להתקדם בעבודות.', responsible:"סארי ג'לג'ולה",                  deadline:'06/08/26',  status:'open', section:false },
      { id:'i8',  number:'3.2', topic:'הכנות למסירה סופית',        description:'נגרר לאוגוסט. יש למלא אחר דוח הליקויים שצורף. תיבות דואר טרם נבחרו.', responsible:"סארי ג'לג'ולה",            deadline:'שוטף',     status:'open', section:false },
      { id:'i9',  number:'3.9', topic:'השלמת מטבחים וחיפויים',    description:'דירות 8,9 מטבח יותקן סוף אוגוסט. יתר הדירות — נותר לבצע חיפויים.', responsible:"סארי ג'לג'ולה",               deadline:'לידיעה',   status:'open', section:false },
      { id:'i10', number:'4',   topic:'טופס 4',                    description:'',                                              responsible:'',                                                 deadline:'',          status:'open', section:true  },
      { id:'i11', number:'4.1', topic:'כיבוי אש',                  description:'אינטגרציה ממתינה לתעודה. גלגולנים 2206 — בדיקה חוזרת 29/07 ללא אישור. גז — חייבים להקדים ל-10/08. גנרטור — אישור צפוי 30/08.', responsible:"סארי ג'לג'ולה", deadline:'מיידי',    status:'open', section:false },
      { id:'i12', number:'4.2', topic:'מי אביבים',                  description:"שלב א' אושר, ממתינים לבדיקת שלב ב'. להשלים הצהרת יזם.", responsible:"סארי ג'לג'ולה, תום שנדור",          deadline:'מיידי',    status:'open', section:false },
      { id:'i13', number:'4.5', topic:'עירייה',                    description:'הושלמו 6/33 משימות. אין התקדמות — חייבים להתחיל לקדם.', responsible:"סארי ג'לג'ולה, תום שנדור, חיים עזרא",  deadline:'שוטף',     status:'open', section:false },
    ],
  },
]

// ─── utils ────────────────────────────────────────────────────────────────────
const inp = 'w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-green-600'
const sm  = 'bg-[#1e2130] border border-[#252840] rounded px-2 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-green-600'

function fmtDate(d) {
  try { return new Date(d).toLocaleDateString('he-IL',{day:'2-digit',month:'2-digit',year:'numeric'}) } catch { return d }
}

function exportMeeting(m) {
  const L = []
  L.push(`סיכום פגישה שבועית — ${m.project}`)
  L.push(`תאריך: ${fmtDate(m.date)}`)
  L.push('')
  L.push('משתתפים:')
  m.participants.forEach(p => L.push(`  ${p.name} — ${p.role}${p.company?', '+p.company:''} | ${p.email}`))
  if (m.cc?.length) { L.push('מכותבים:'); m.cc.forEach(p => L.push(`  ${p.name} — ${p.role}, ${p.company}`)) }
  L.push('')
  L.push('סטטוס:')
  m.status_notes?.forEach(n => L.push(`  • ${n}`))
  L.push('')
  L.push('='.repeat(80))
  L.push(`#       נושא                    תיאור                              לטיפול          עד תאריך`)
  L.push('='.repeat(80))
  m.items.forEach(item => {
    if (item.section) { L.push(''); L.push(`${item.number}  ${item.topic}`); return }
    L.push(`${item.number.padEnd(8)}${item.topic.padEnd(24)}${(item.description||'').substring(0,35).padEnd(35)} ${item.responsible.padEnd(16)} ${item.deadline}`)
    if ((item.description||'').length > 35) L.push(`${''.padEnd(33)}${item.description.substring(35)}`)
  })
  L.push('='.repeat(80))
  L.push(`\nהופק: חיים עזרא · ${new Date().toLocaleString('he-IL')}`)
  const blob = new Blob([L.join('\n')],{type:'text/plain;charset=utf-8'})
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = `סיכום_${m.project}_${m.date}.txt`; a.click()
}

// ─── MeetingDetail (slide-in panel) ──────────────────────────────────────────
function MeetingDetail({ meeting, onClose, onUpdate }) {
  const [items, setItems] = useState(meeting.items)

  function toggle(id) {
    const next = items.map(i => i.id===id ? {...i, status: i.status==='open'?'done':'open'} : i)
    setItems(next); onUpdate({...meeting, items: next})
  }

  const nonSection = items.filter(i=>!i.section)
  const done = nonSection.filter(i=>i.status==='done').length
  const pct  = nonSection.length ? Math.round(done/nonSection.length*100) : 0

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-3xl bg-[#0f1117] border-r border-[#1e2130] h-full flex flex-col overflow-hidden" onClick={e=>e.stopPropagation()}>
        {/* header */}
        <div className="sticky top-0 bg-[#13161f] border-b border-[#1e2130] px-5 py-3 flex items-center gap-3 z-10 shrink-0">
          <button onClick={onClose} className="text-slate-400 hover:text-white"><ChevronLeft size={20}/></button>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold truncate">{meeting.title} — {meeting.project}</div>
            <div className="text-slate-500 text-xs">{fmtDate(meeting.date)}</div>
          </div>
          <span className="text-xs text-slate-500">{done}/{nonSection.length} הושלמו</span>
          <button onClick={()=>exportMeeting({...meeting,items})}
            className="flex items-center gap-1 bg-[#1e2130] hover:bg-[#252840] border border-[#374151] text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg">
            <Download size={12}/> ייצא
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Meta */}
          <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4 space-y-3">
            <div>
              <div className="text-xs text-slate-500 mb-2">משתתפים</div>
              <div className="flex flex-wrap gap-2">
                {meeting.participants.map((p,i)=>(
                  <div key={i} className="bg-[#1a1d27] border border-[#252840] rounded-lg px-3 py-1.5 text-xs">
                    <div className="text-white font-medium">{p.name}</div>
                    <div className="text-slate-500">{p.role}{p.company?` · ${p.company}`:''}</div>
                    <div className="text-slate-600 text-[10px]" dir="ltr">{p.email}</div>
                  </div>
                ))}
              </div>
            </div>
            {meeting.cc?.length>0 && (
              <div><div className="text-xs text-slate-500 mb-1">מכותבים</div>
                <div className="text-xs text-slate-400">{meeting.cc.map(p=>p.name).join(' · ')}</div></div>
            )}
            {meeting.status_notes?.length>0 && (
              <div><div className="text-xs text-slate-500 mb-1">סטטוס</div>
                <ul className="space-y-0.5">{meeting.status_notes.map((n,i)=>(
                  <li key={i} className="text-xs text-slate-300 flex gap-2"><span className="text-green-400 shrink-0">•</span>{n}</li>
                ))}</ul>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">השלמת משימות</span>
              <span className={`font-bold ${pct===100?'text-green-400':'text-yellow-400'}`}>{pct}%</span>
            </div>
            <div className="h-2 bg-[#1e2130] rounded-full overflow-hidden">
              <div className={`h-2 rounded-full transition-all ${pct===100?'bg-green-500':'bg-yellow-500'}`} style={{width:`${pct}%`}}/>
            </div>
          </div>

          {/* Items table */}
          <div className="bg-[#13161f] border border-[#1e2130] rounded-xl overflow-x-auto">
            <table className="w-full text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-[#1e2130]">
                  {['#','נושא','תיאור','לטיפול','עד תאריך','סטטוס'].map(h=>(
                    <th key={h} className="text-right text-slate-500 font-medium px-3 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item=>{
                  if (item.section) return (
                    <tr key={item.id} className="bg-[#1a1d27] border-b border-[#1e2130]">
                      <td className="px-3 py-2 text-slate-500 font-mono">{item.number}</td>
                      <td colSpan={5} className="px-3 py-2 text-slate-300 font-semibold">{item.topic}</td>
                    </tr>
                  )
                  const open = item.status==='open'
                  return (
                    <tr key={item.id} className={`border-b border-[#1e2130]/50 transition-colors ${open?'hover:bg-[#1a1d27]':'bg-green-500/5'}`}>
                      <td className="px-3 py-2.5 text-slate-500 font-mono whitespace-nowrap">{item.number}</td>
                      <td className="px-3 py-2.5 text-white font-medium">{item.topic}</td>
                      <td className="px-3 py-2.5 text-slate-400 leading-relaxed">{item.description}</td>
                      <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{item.responsible}</td>
                      <td className={`px-3 py-2.5 whitespace-nowrap font-medium ${item.deadline==='מיידי'?'text-red-400':item.deadline==='שוטף'?'text-blue-400':'text-slate-400'}`}>{item.deadline}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={()=>toggle(item.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded border text-xs transition-all ${
                            open ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30'
                                 : 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/30'
                          }`}>
                          {open ? <Clock size={10}/> : <Check size={10}/>}
                          {open ? 'פתוח' : 'סגור'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── NewMeetingModal ──────────────────────────────────────────────────────────
function NewMeetingModal({ onClose, onSave, prevMeeting }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title:   prevMeeting?.title   ?? 'פגישה שבועית',
    project: prevMeeting?.project ?? '',
    date:    new Date().toISOString().split('T')[0],
    participants: prevMeeting?.participants ?? [{name:'חיים עזרא',role:'מפקח',company:'חברת פיקוח',email:'haimezra.pm@gmail.com'}],
    cc: prevMeeting?.cc ?? [],
    status_notes: [''],
  })

  const [items, setItems] = useState(() => {
    if (!prevMeeting) return [{id:`n1`,number:'1',topic:'',description:'',responsible:'',deadline:'',status:'open',section:false}]
    // carry forward open items
    return prevMeeting.items
      .filter(i => i.section || i.status==='open')
      .map(i => ({...i, id:`c_${i.id}`, status:'open', carried:true}))
  })

  const carriedCount = items.filter(i=>i.carried&&!i.section).length

  const addP  = () => setForm(f=>({...f,participants:[...f.participants,{name:'',role:'',company:'',email:''}]}))
  const remP  = i => setForm(f=>({...f,participants:f.participants.filter((_,j)=>j!==i)}))
  const upP   = (i,k,v) => setForm(f=>({...f,participants:f.participants.map((p,j)=>j===i?{...p,[k]:v}:p)}))
  const addNote = () => setForm(f=>({...f,status_notes:[...f.status_notes,'']}))
  const upNote  = (i,v) => setForm(f=>({...f,status_notes:f.status_notes.map((n,j)=>j===i?v:n)}))

  const addRow  = (sec=false) => setItems(p=>[...p,{id:`n${Date.now()}`,number:'',topic:'',description:'',responsible:'',deadline:'',status:'open',section:sec}])
  const remRow  = id => setItems(p=>p.filter(i=>i.id!==id))
  const upRow   = (id,k,v) => setItems(p=>p.map(i=>i.id===id?{...i,[k]:v}:i))

  function save() {
    onSave({
      id: Date.now().toString(),
      ...form,
      status_notes: form.status_notes.filter(n=>n.trim()),
      items: items.filter(i=>i.topic.trim()||i.section),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#13161f] border border-[#1e2130] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden" onClick={e=>e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e2130] shrink-0">
          <h2 className="text-white font-bold flex-1">סיכום פגישה חדש</h2>
          <div className="flex gap-1 bg-[#1e2130] rounded-lg p-0.5 text-xs">
            {[['1','כותרת'],['2','פריטים']].map(([s,l])=>(
              <button key={s} onClick={()=>setStep(+s)}
                className={`px-3 py-1 rounded-md transition-colors ${step===+s?'bg-green-600/30 text-green-400':'text-slate-500 hover:text-white'}`}>{l}</button>
            ))}
          </div>
          <button onClick={onClose}><X size={18} className="text-slate-500 hover:text-white"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
        {step===1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-slate-400 mb-1 block">שם הפגישה</label>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className={inp}/></div>
              <div><label className="text-xs text-slate-400 mb-1 block">פרויקט</label>
                <input value={form.project} onChange={e=>setForm(f=>({...f,project:e.target.value}))} className={inp} placeholder="שם הפרויקט"/></div>
            </div>
            <div><label className="text-xs text-slate-400 mb-1 block">תאריך</label>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className={inp}/></div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-400">משתתפים</label>
                <button onClick={addP} className="text-xs text-green-400 hover:text-green-300">+ הוסף משתתף</button>
              </div>
              <div className="space-y-2">
                {form.participants.map((p,i)=>(
                  <div key={i} className="grid grid-cols-4 gap-1.5 items-center">
                    <input value={p.name}    onChange={e=>upP(i,'name',e.target.value)}    placeholder="שם"     className={sm}/>
                    <input value={p.role}    onChange={e=>upP(i,'role',e.target.value)}    placeholder="תפקיד"  className={sm}/>
                    <input value={p.company} onChange={e=>upP(i,'company',e.target.value)} placeholder="חברה"   className={sm}/>
                    <div className="flex gap-1">
                      <input value={p.email} onChange={e=>upP(i,'email',e.target.value)} placeholder="אימייל" className={sm+' flex-1'} dir="ltr"/>
                      <button onClick={()=>remP(i)} className="text-slate-600 hover:text-red-400 shrink-0"><X size={12}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-400">נקודות סטטוס</label>
                <button onClick={addNote} className="text-xs text-green-400 hover:text-green-300">+ הוסף</button>
              </div>
              <div className="space-y-1.5">
                {form.status_notes.map((n,i)=>(
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-green-400 text-xs shrink-0">•</span>
                    <input value={n} onChange={e=>upNote(i,e.target.value)} className={inp} placeholder="נושא סטטוס מרכזי..."/>
                  </div>
                ))}
              </div>
            </div>

            {prevMeeting && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs">
                <span className="text-blue-300 font-medium">העברה אוטומטית: </span>
                <span className="text-blue-400">{carriedCount} פריטים פתוחים</span>
                <span className="text-blue-300"> מהפגישה הקודמת ({fmtDate(prevMeeting.date)}) יועברו לשלב הפריטים</span>
              </div>
            )}
          </div>
        )}

        {step===2 && (
          <div>
            {carriedCount > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 mb-3">
                {carriedCount} פריטים הועברו אוטומטית מהפגישה הקודמת — סמן כ"סגור" את אלה שטופלו
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#1e2130]">
                    {['#','נושא','תיאור','לטיפול','עד תאריך',''].map(h=>(
                      <th key={h} className="text-right text-slate-500 font-medium px-2 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item=>(
                    <tr key={item.id} className={`border-b border-[#1e2130]/50 ${item.section?'bg-[#1a1d27]':''} ${item.carried?'opacity-75':''}`}>
                      <td className="px-2 py-1.5 w-14">
                        <input value={item.number} onChange={e=>upRow(item.id,'number',e.target.value)} className={sm+' w-12 text-center'}/></td>
                      <td className="px-2 py-1.5 w-32">
                        <input value={item.topic} onChange={e=>upRow(item.id,'topic',e.target.value)} className={sm+' w-full'} placeholder={item.section?'כותרת':'נושא'}/></td>
                      {!item.section ? <>
                        <td className="px-2 py-1.5"><textarea value={item.description} onChange={e=>upRow(item.id,'description',e.target.value)} rows={2} className={sm+' w-full resize-none min-w-[140px]'}/></td>
                        <td className="px-2 py-1.5 w-28"><input value={item.responsible} onChange={e=>upRow(item.id,'responsible',e.target.value)} className={sm+' w-full'} placeholder="שם"/></td>
                        <td className="px-2 py-1.5 w-24"><input value={item.deadline} onChange={e=>upRow(item.id,'deadline',e.target.value)} className={sm+' w-full'} placeholder="מיידי"/></td>
                      </> : <td colSpan={3}/>}
                      <td className="px-2 py-1.5 w-8">
                        <button onClick={()=>remRow(item.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={11}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={()=>addRow(false)} className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"><Plus size={11}/> שורה</button>
              <button onClick={()=>addRow(true)}  className="text-xs text-slate-500 hover:text-white flex items-center gap-1"><Plus size={11}/> כותרת קטגוריה</button>
            </div>
          </div>
        )}
        </div>

        {/* footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-[#1e2130] shrink-0">
          {step===1
            ? <button onClick={()=>setStep(2)} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg font-medium">המשך לפריטים ←</button>
            : <><button onClick={()=>setStep(1)} className="px-4 bg-[#1e2130] text-slate-300 text-sm py-2.5 rounded-lg">→ חזור</button>
               <button onClick={save} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg font-medium">שמור סיכום</button></>
          }
          <button onClick={onClose} className="px-4 bg-[#1e2130] text-slate-300 text-sm py-2.5 rounded-lg">ביטול</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Meetings() {
  const [meetings, setMeetings] = useState(DEMO_MEETINGS)
  const [selected, setSelected] = useState(null)
  const [showNew,  setShowNew]  = useState(false)

  const lastMeeting = meetings[0] ?? null

  function updateMeeting(m) {
    setMeetings(prev=>prev.map(x=>x.id===m.id?m:x))
    setSelected(m)
  }

  const totalOpen = meetings.reduce((s,m)=>s+m.items.filter(i=>!i.section&&i.status==='open').length, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">סיכומי ישיבות</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {meetings.length} פגישות · <span className={totalOpen>0?'text-yellow-400':'text-green-400'}>{totalOpen} פריטים פתוחים</span>
          </p>
        </div>
        <button onClick={()=>setShowNew(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg">
          <Plus size={16}/> סיכום חדש
        </button>
      </div>

      <div className="bg-[#13161f] border border-[#1e2130] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2130]">
              {['שם הסיכום','תאריך','התקדמות','סטטוס','נוצר ע"י',''].map(h=>(
                <th key={h} className="text-right text-slate-500 font-medium px-4 py-3 text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meetings.map(m=>{
              const ns = m.items.filter(i=>!i.section)
              const dn = ns.filter(i=>i.status==='done').length
              const pct = ns.length ? Math.round(dn/ns.length*100) : 0
              return (
                <tr key={m.id} onClick={()=>setSelected(m)} className="border-b border-[#1e2130]/50 hover:bg-[#1a1d27] cursor-pointer group transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{m.title}</div>
                    <div className="text-slate-500 text-xs">{m.project}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm whitespace-nowrap">{fmtDate(m.date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#1e2130] rounded-full overflow-hidden">
                        <div className={`h-1.5 rounded-full ${pct===100?'bg-green-500':'bg-yellow-500'}`} style={{width:`${pct}%`}}/>
                      </div>
                      <span className="text-xs text-slate-500">{dn}/{ns.length}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${pct===100
                      ?'bg-green-500/15 border-green-500/30 text-green-400'
                      :'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'}`}>
                      {pct===100?'נשלח':'בטיפול'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{m.participants[0]?.name}</td>
                  <td className="px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e=>{e.stopPropagation();exportMeeting(m)}} className="text-slate-500 hover:text-white">
                      <Download size={14}/>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {meetings.length===0 && (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto mb-3 text-slate-700"/>
            <p className="text-slate-500 text-sm">אין סיכומי ישיבות</p>
            <button onClick={()=>setShowNew(true)} className="mt-2 text-green-400 text-sm hover:text-green-300">+ צור סיכום ראשון</button>
          </div>
        )}
      </div>

      {selected && <MeetingDetail meeting={selected} onClose={()=>setSelected(null)} onUpdate={updateMeeting}/>}
      {showNew   && <NewMeetingModal onClose={()=>setShowNew(false)} onSave={m=>{setMeetings(p=>[m,...p])}} prevMeeting={lastMeeting}/>}
    </div>
  )
}
