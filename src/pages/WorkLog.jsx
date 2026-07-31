import { useState } from 'react'
import { MOCK_WORKLOG } from '../lib/mock'
import { Plus, Sun, Cloud, CloudRain, Users, X, Download, FileText } from 'lucide-react'

const WEATHER_ICON  = { sunny: Sun, cloudy: Cloud, rainy: CloudRain }
const WEATHER_LABEL = { sunny: 'שמשי', cloudy: 'מעונן', rainy: 'גשום' }
const WEATHER_COLOR = { sunny: 'text-yellow-400', cloudy: 'text-slate-400', rainy: 'text-blue-400' }

const inp = 'w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-green-600'

function NewEntryModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weather: 'sunny',
    temp: '',
    workers: '',
    foremen: '',
    work_done: '',
    materials: '',
    issues: 'ללא',
  })

  function save() {
    if (!form.work_done.trim()) return
    onSave({
      id: Date.now().toString(),
      project_id: '1',
      inspector: 'חיים עזרא',
      created_at: new Date().toISOString(),
      ...form,
      temp: Number(form.temp) || 0,
      workers: Number(form.workers) || 0,
      foremen: Number(form.foremen) || 0,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#13161f] border border-[#1e2130] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-bold">רשומת יומן חדשה</h2>
          <button onClick={onClose}><X size={20} className="text-slate-500 hover:text-white" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-slate-400 mb-1 block">תאריך</label>
              <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} className={inp}/></div>
            <div><label className="text-xs text-slate-400 mb-1 block">מזג אוויר</label>
              <select value={form.weather} onChange={e => setForm(f=>({...f,weather:e.target.value}))} className={inp}>
                <option value="sunny">שמשי</option><option value="cloudy">מעונן</option><option value="rainy">גשום</option>
              </select></div>
            <div><label className="text-xs text-slate-400 mb-1 block">טמפ' (°C)</label>
              <input type="number" value={form.temp} onChange={e => setForm(f=>({...f,temp:e.target.value}))} placeholder="32" className={inp}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-400 mb-1 block">מספר פועלים</label>
              <input type="number" value={form.workers} onChange={e => setForm(f=>({...f,workers:e.target.value}))} placeholder="18" className={inp}/></div>
            <div><label className="text-xs text-slate-400 mb-1 block">מנהלי עבודה</label>
              <input type="number" value={form.foremen} onChange={e => setForm(f=>({...f,foremen:e.target.value}))} placeholder="2" className={inp}/></div>
          </div>
          <div><label className="text-xs text-slate-400 mb-1 block">עבודות שבוצעו</label>
            <textarea rows={4} value={form.work_done} onChange={e => setForm(f=>({...f,work_done:e.target.value}))}
              placeholder="פרט את העבודות שבוצעו היום..." className={inp+' resize-none'}/></div>
          <div><label className="text-xs text-slate-400 mb-1 block">חומרים שסופקו</label>
            <input value={form.materials} onChange={e => setForm(f=>({...f,materials:e.target.value}))}
              placeholder='בטון B30 — 48 מ"ק, ברזל ∅12 — 800 ק"ג' className={inp}/></div>
          <div><label className="text-xs text-slate-400 mb-1 block">הערות / חריגות</label>
            <textarea rows={2} value={form.issues} onChange={e => setForm(f=>({...f,issues:e.target.value}))} className={inp+' resize-none'}/></div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={save} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg transition-colors font-medium">שמור רשומה</button>
          <button onClick={onClose} className="px-4 bg-[#1e2130] hover:bg-[#252840] text-slate-300 text-sm py-2.5 rounded-lg transition-colors">ביטול</button>
        </div>
      </div>
    </div>
  )
}

function exportLog(entries) {
  const lines = []
  lines.push('יומן עבודה — חיים עזרא הנדסה ניהול ופיקוח')
  lines.push('='.repeat(50))
  entries.forEach(e => {
    lines.push('')
    lines.push(`תאריך: ${new Date(e.date).toLocaleDateString('he-IL', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}`)
    lines.push(`מזג אוויר: ${WEATHER_LABEL[e.weather]}, ${e.temp}°C`)
    lines.push(`כוח אדם: ${e.workers} פועלים, ${e.foremen} מנהלי עבודה`)
    lines.push(`מפקח: ${e.inspector}`)
    lines.push('')
    lines.push('עבודות שבוצעו:')
    lines.push(e.work_done)
    lines.push('')
    lines.push(`חומרים: ${e.materials}`)
    if (e.issues && e.issues !== 'ללא') {
      lines.push(`חריגות: ${e.issues}`)
    }
    lines.push('-'.repeat(40))
  })
  const blob = new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'})
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = `יומן_עבודה_${new Date().toLocaleDateString('he-IL').replace(/\//g,'-')}.txt`; a.click()
}

export default function WorkLog() {
  const [entries, setEntries] = useState(MOCK_WORKLOG)
  const [showNew, setShowNew] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">יומן עבודה</h1>
          <p className="text-slate-400 text-sm mt-0.5">{entries.length} רשומות · {entries.reduce((s,e)=>s+e.workers,0)} פועלים מצטבר</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportLog(entries)} className="flex items-center gap-1.5 bg-[#1e2130] hover:bg-[#252840] border border-[#374151] text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg transition-colors">
            <Download size={14}/> ייצא TXT
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus size={16}/> רשומה חדשה
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {entries.map(entry => {
          const WeatherIcon = WEATHER_ICON[entry.weather]
          const isToday = entry.date === new Date().toISOString().split('T')[0]
          return (
            <div key={entry.id} className={`bg-[#13161f] border rounded-xl p-5 ${isToday ? 'border-green-600/40' : 'border-[#1e2130]'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`bg-[#1e2130] rounded-lg px-3 py-1.5 text-center min-w-[64px] ${isToday ? 'border border-green-600/30' : ''}`}>
                    <div className="text-xs text-slate-500">{new Date(entry.date).toLocaleDateString('he-IL', { weekday: 'short' })}</div>
                    <div className="text-white font-bold text-base">{new Date(entry.date).getDate()}</div>
                    <div className="text-xs text-slate-500">{new Date(entry.date).toLocaleDateString('he-IL', { month: 'short' })}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <WeatherIcon size={16} className={WEATHER_COLOR[entry.weather]} />
                      <span className="text-slate-400 text-sm">{WEATHER_LABEL[entry.weather]}, {entry.temp}°C</span>
                      {isToday && <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">היום</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Users size={14} className="text-slate-500" />
                      <span className="text-slate-400 text-sm">{entry.workers} פועלים · {entry.foremen} מנהלי עבודה</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    const lines = [
                      `יומן עבודה — ${new Date(entry.date).toLocaleDateString('he-IL', {weekday:'long',day:'numeric',month:'long'})}`,
                      '='.repeat(40),
                      `מזג אוויר: ${WEATHER_LABEL[entry.weather]}, ${entry.temp}°C`,
                      `כוח אדם: ${entry.workers} פועלים, ${entry.foremen} מנהלי עבודה`,
                      '',
                      'עבודות שבוצעו:',
                      entry.work_done,
                      '',
                      `חומרים: ${entry.materials}`,
                      `הערות: ${entry.issues}`,
                    ]
                    const blob = new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'})
                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                    a.download = `יומן_${entry.date}.txt`; a.click()
                  }} className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1">
                    <FileText size={13}/> ייצא
                  </button>
                  <span className="text-slate-500 text-xs">{entry.inspector}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <div className="text-xs text-slate-500 mb-1">עבודות שבוצעו</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{entry.work_done}</p>
                </div>
                <div className="space-y-3">
                  {entry.materials && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">חומרים</div>
                      <p className="text-sm text-slate-400">{entry.materials}</p>
                    </div>
                  )}
                  {entry.issues && entry.issues !== 'ללא' && (
                    <div>
                      <div className="text-xs text-orange-400 mb-1">חריגות</div>
                      <p className="text-sm text-orange-300">{entry.issues}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showNew && <NewEntryModal onClose={() => setShowNew(false)} onSave={e => setEntries(prev => [e, ...prev])} />}
    </div>
  )
}
