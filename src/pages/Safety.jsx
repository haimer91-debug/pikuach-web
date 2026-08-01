import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle2, XCircle, ClipboardList, Plus, X } from 'lucide-react'
import { useLocalStorage } from '../lib/useLocalStorage'

const INIT_CHECKLIST = [
  { id: '1', item: 'ציוד מגן אישי (קסדה, נעלי בטיחות, אפוד)', status: 'ok' },
  { id: '2', item: 'גידור אתר ושילוט ביטחוני', status: 'ok' },
  { id: '3', item: 'גישה מאובטחת לגג ועבודה בגובה', status: 'warning' },
  { id: '4', item: 'עמדת כיבוי אש', status: 'ok' },
  { id: '5', item: 'רופא / חובש באתר', status: 'fail' },
  { id: '6', item: 'תיק עזרה ראשונה מעודכן', status: 'ok' },
  { id: '7', item: 'בדיקת ציוד הרמה (מנוף, פיגומים)', status: 'ok' },
  { id: '8', item: 'פרוטוקול חירום ופינוי', status: 'warning' },
  { id: '9', item: 'הדרכת עובדים חדשים (Induction)', status: 'ok' },
  { id: '10', item: 'שילוט אזהרה באזורי סיכון', status: 'ok' },
]

const INIT_INCIDENTS = [
  {
    id: '1',
    date: '2025-07-20',
    type: 'כמעט ואירע',
    description: 'פועל החליק על רצפה רטובה בקומה 2 — ללא פציעה',
    action: 'הוצב שלט אזהרה ונוסף מחצלת',
    status: 'closed',
  },
  {
    id: '2',
    date: '2025-07-15',
    type: 'אירוע בטיחותי',
    description: 'חומר כימי (דבק) שפוך ליד אזור שינה — נקה מיד',
    action: 'הסרת החומר, תדרוך עובדים על אחסון חומרים',
    status: 'closed',
  },
]

const STATUS_ORDER = ['ok', 'warning', 'fail']
const STATUS_ICON  = { ok: CheckCircle2, warning: AlertTriangle, fail: XCircle }
const STATUS_COLOR = { ok: 'text-green-400', warning: 'text-yellow-400', fail: 'text-red-400' }
const STATUS_LABEL = { ok: 'תקין', warning: 'דרוש טיפול', fail: 'דחוף' }

const STATUS_BG = {
  ok:      'bg-green-500/10 border-green-500/20',
  warning: 'bg-yellow-500/10 border-yellow-500/20',
  fail:    'bg-red-500/10 border-red-500/20',
}

const inc_inp = 'w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-green-600'

function NewIncidentModal({ onClose, onSave }) {
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], type: 'כמעט ואירע', description: '', action: '' })
  function save() {
    if (!form.description.trim()) return
    onSave({ id: Date.now().toString(), ...form, status: 'open' })
    onClose()
  }
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#13161f] border border-[#1e2130] rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-bold">דיווח אירוע בטיחות</h2>
          <button onClick={onClose}><X size={20} className="text-slate-500 hover:text-white"/></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-400 mb-1 block">תאריך</label>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className={inc_inp}/></div>
            <div><label className="text-xs text-slate-400 mb-1 block">סוג</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className={inc_inp}>
                <option>כמעט ואירע</option><option>אירוע בטיחותי</option><option>תאונת עבודה</option><option>נזק לרכוש</option>
              </select></div>
          </div>
          <div><label className="text-xs text-slate-400 mb-1 block">תיאור האירוע</label>
            <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className={inc_inp+' resize-none'} placeholder="תאר מה קרה, מי היה מעורב, והיכן..."/></div>
          <div><label className="text-xs text-slate-400 mb-1 block">פעולה שננקטה</label>
            <input value={form.action} onChange={e=>setForm(f=>({...f,action:e.target.value}))} className={inc_inp} placeholder="מה עשית בעקבות האירוע?"/></div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={save} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg font-medium">שמור דיווח</button>
          <button onClick={onClose} className="px-4 bg-[#1e2130] text-slate-300 text-sm py-2.5 rounded-lg">ביטול</button>
        </div>
      </div>
    </div>
  )
}

export default function Safety() {
  const [checklist, setChecklist] = useLocalStorage('pikuach_safety_checklist', INIT_CHECKLIST)
  const [incidents, setIncidents] = useLocalStorage('pikuach_safety_incidents', INIT_INCIDENTS)
  const [showNew, setShowNew] = useState(false)

  function cycleStatus(id) {
    setChecklist(prev => prev.map(c => {
      if (c.id !== id) return c
      const idx = STATUS_ORDER.indexOf(c.status)
      return { ...c, status: STATUS_ORDER[(idx + 1) % STATUS_ORDER.length] }
    }))
  }

  const counts = { ok: checklist.filter(c=>c.status==='ok').length, warning: checklist.filter(c=>c.status==='warning').length, fail: checklist.filter(c=>c.status==='fail').length }
  const score = Math.round((counts.ok / checklist.length) * 100)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">בטיחות</h1>
          <p className="text-slate-400 text-sm mt-0.5">ציון בטיחות: <span className={`font-bold ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{score}%</span></p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[['ok','תקין'], ['warning','דרוש טיפול'], ['fail','דחוף']].map(([s, l]) => {
          const Icon = STATUS_ICON[s]
          return (
            <div key={s} className={`border rounded-xl p-4 text-center ${STATUS_BG[s]}`}>
              <Icon size={22} className={`${STATUS_COLOR[s]} mx-auto mb-2`} />
              <div className={`text-2xl font-bold ${STATUS_COLOR[s]}`}>{counts[s]}</div>
              <div className="text-slate-500 text-xs mt-0.5">{l}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Checklist */}
        <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={16} className="text-slate-400" />
            <h2 className="text-white font-semibold">רשימת בטיחות</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">לחץ על הסטטוס לשינוי</p>
          <div className="space-y-1">
            {checklist.map(item => {
              const Icon = STATUS_ICON[item.status]
              return (
                <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-[#1e2130]/50 last:border-0 group">
                  <button onClick={() => cycleStatus(item.id)} className={`shrink-0 rounded-full p-0.5 transition-transform hover:scale-110 ${STATUS_COLOR[item.status]}`} title="לחץ לשינוי">
                    <Icon size={16} />
                  </button>
                  <span className="flex-1 text-sm text-slate-300">{item.item}</span>
                  <button onClick={() => cycleStatus(item.id)} className={`text-xs shrink-0 px-2 py-0.5 rounded border ${STATUS_BG[item.status]} ${STATUS_COLOR[item.status]} hover:opacity-80 transition-opacity`}>
                    {STATUS_LABEL[item.status]}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Incidents */}
        <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-slate-400" />
              <h2 className="text-white font-semibold">אירועי בטיחות</h2>
            </div>
            <button onClick={() => setShowNew(true)} className="flex items-center gap-1 text-green-400 text-sm hover:text-green-300">
              <Plus size={14}/> דיווח חדש
            </button>
          </div>
          <div className="space-y-3">
            {incidents.map(inc => (
              <div key={inc.id} className="bg-[#1e2130] rounded-xl p-4 border border-[#252840]">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${inc.type === 'תאונת עבודה' ? 'text-red-400' : 'text-orange-400'}`}>{inc.type}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${inc.status === 'closed' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                      {inc.status === 'closed' ? 'סגור' : 'פתוח'}
                    </span>
                    <span className="text-slate-500 text-xs">{new Date(inc.date).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-2 leading-relaxed">{inc.description}</p>
                {inc.action && <div className="text-xs text-green-400">פעולה: {inc.action}</div>}
              </div>
            ))}
            {incidents.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">לא דווחו אירועי בטיחות</div>
            )}
          </div>
        </div>
      </div>

      {showNew && <NewIncidentModal onClose={() => setShowNew(false)} onSave={inc => setIncidents(prev => [inc, ...prev])} />}
    </div>
  )
}
