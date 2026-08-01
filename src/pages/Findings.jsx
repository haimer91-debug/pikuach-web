import { useState, useRef } from 'react'
import { MOCK_FINDINGS, MOCK_PROJECTS } from '../lib/mock'
import { useLocalStorage } from '../lib/useLocalStorage'
import { Plus, Camera, Search, X, Download, AlertCircle, CheckCircle2, Clock, Eye, ChevronLeft } from 'lucide-react'

const SEV_COLOR = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
}
const SEV_LABEL = { critical: 'קריטי', high: 'גבוה', medium: 'בינוני', low: 'נמוך' }
const STATUS_COLOR = {
  open:      'bg-red-500/15 text-red-400 border-red-500/25',
  in_review: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  fixed:     'bg-green-500/15 text-green-400 border-green-500/25',
}
const STATUS_LABEL = { open: 'פתוח', in_review: 'בבדיקה', fixed: 'תוקן' }

const inp = 'w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-green-600'

function NewFindingModal({ onClose, onSave, nextNumber }) {
  const [form, setForm] = useState({ title:'', location:'', description:'', severity:'high', responsible:'', deadline:'', standard:'', project_id:'1' })
  const [images, setImages] = useState([])
  const fileRef = useRef()

  function handleImg(e) {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => setImages(prev => [...prev, reader.result])
      reader.readAsDataURL(file)
    })
  }

  function save() {
    if (!form.title.trim()) return
    onSave({ id: Date.now().toString(), number: nextNumber, status: 'open', created_at: new Date().toISOString(), image_url: images[0] || null, ...form })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#13161f] border border-[#1e2130] rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-bold">ממצא חדש #{nextNumber}</h2>
          <button onClick={onClose}><X size={20} className="text-slate-500 hover:text-white" /></button>
        </div>
        <div className="space-y-3">
          <div><label className="text-xs text-slate-400 mb-1 block">כותרת הממצא</label>
            <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="תיאור קצר וברור" className={inp} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-400 mb-1 block">מיקום</label>
              <input value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} placeholder="קומה 3, דירה 8" className={inp} /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">חומרה</label>
              <select value={form.severity} onChange={e => setForm(f=>({...f,severity:e.target.value}))} className={inp}>
                <option value="critical">קריטי — עצור עבודה</option>
                <option value="high">גבוה</option>
                <option value="medium">בינוני</option>
                <option value="low">נמוך</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-400 mb-1 block">אחראי לתיקון</label>
              <input value={form.responsible} onChange={e => setForm(f=>({...f,responsible:e.target.value}))} placeholder="קבלן / מנהל" className={inp} /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">תקן / סעיף</label>
              <input value={form.standard} onChange={e => setForm(f=>({...f,standard:e.target.value}))} placeholder='ת"י 466, סעיף 7.3' className={inp} /></div>
          </div>
          <div><label className="text-xs text-slate-400 mb-1 block">דד-ליין לתיקון</label>
            <input type="date" value={form.deadline} onChange={e => setForm(f=>({...f,deadline:e.target.value}))} className={inp} /></div>
          <div><label className="text-xs text-slate-400 mb-1 block">תיאור מפורט</label>
            <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={3} placeholder="פרט את הממצא: מה נמצא, מה הסטייה, ומה הסיכון" className={inp+' resize-none'} /></div>
          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400">תמונות ({images.length})</label>
              <button onClick={() => fileRef.current.click()} className="text-xs text-green-400 hover:text-green-300">+ הוסף תמונה</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImg} className="hidden" />
            {images.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} className="h-20 w-20 object-cover rounded-lg border border-[#252840]" />
                    <button onClick={() => setImages(imgs => imgs.filter((_,j) => j !== i))}
                      className="absolute -top-1 -left-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white">
                      <X size={10}/>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <button onClick={() => fileRef.current.click()}
                className="w-full h-24 border-2 border-dashed border-[#1e2130] rounded-lg flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-green-600/50 transition-colors">
                <Camera size={22}/><span className="text-xs">לחץ לצרף תמונה</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={save} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg font-medium transition-colors">שמור ממצא</button>
          <button onClick={onClose} className="px-4 bg-[#1e2130] text-slate-300 text-sm py-2.5 rounded-lg">ביטול</button>
        </div>
      </div>
    </div>
  )
}

function DetailPanel({ finding, onClose, onStatusChange }) {
  if (!finding) return null
  const isOverdue = finding.deadline && new Date(finding.deadline) < new Date() && finding.status !== 'fixed'
  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex justify-start" onClick={onClose}>
      <div className="w-full max-w-md bg-[#13161f] border-l border-[#1e2130] h-full overflow-y-auto ml-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#13161f] border-b border-[#1e2130] px-5 py-4 flex items-center gap-3 z-10">
          <button onClick={onClose} className="text-slate-400 hover:text-white"><ChevronLeft size={20}/></button>
          <span className="text-white font-bold">ממצא #{finding.number}</span>
          <span className={`text-xs px-2 py-0.5 rounded border mr-auto ${SEV_COLOR[finding.severity]}`}>{SEV_LABEL[finding.severity]}</span>
        </div>
        <div className="p-5 space-y-5">
          {finding.image_url && <img src={finding.image_url} className="w-full rounded-xl border border-[#1e2130]" />}
          <div>
            <h2 className="text-white font-bold text-base mb-1">{finding.title}</h2>
            <div className="text-slate-400 text-sm">{finding.location}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['אחראי', finding.responsible],
              ['תקן', finding.standard || '—'],
              ['דד-ליין', finding.deadline ? new Date(finding.deadline).toLocaleDateString('he-IL') : '—'],
              ['נפתח', new Date(finding.created_at).toLocaleDateString('he-IL')],
            ].map(([k,v]) => (
              <div key={k} className="bg-[#1e2130] rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                <div className={`text-sm font-medium ${k==='דד-ליין' && isOverdue ? 'text-red-400' : 'text-white'}`}>{v}</div>
              </div>
            ))}
          </div>
          {finding.description && (
            <div>
              <div className="text-xs text-slate-500 mb-2">תיאור</div>
              <p className="text-sm text-slate-300 leading-relaxed bg-[#1a1d27] rounded-lg p-3 border border-[#252840]">{finding.description}</p>
            </div>
          )}
          {/* Status update */}
          <div>
            <div className="text-xs text-slate-500 mb-2">עדכון סטטוס</div>
            <div className="flex gap-2">
              {[['open','פתוח'],['in_review','בבדיקה'],['fixed','תוקן']].map(([s,l]) => (
                <button key={s} onClick={() => onStatusChange(finding.id, s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${finding.status===s ? STATUS_COLOR[s] : 'bg-[#1e2130] text-slate-400 border-[#252840] hover:border-slate-500'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function exportFindings(findings) {
  const rows = [['#','כותרת','מיקום','חומרה','סטטוס','אחראי','תקן','דד-ליין','תיאור']]
  findings.forEach(f => rows.push([
    f.number, f.title, f.location,
    SEV_LABEL[f.severity], STATUS_LABEL[f.status],
    f.responsible, f.standard||'', f.deadline||'', f.description||''
  ]))
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿'+csv], {type:'text/csv;charset=utf-8'})
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = `ממצאים_${new Date().toLocaleDateString('he-IL').replace(/\//g,'-')}.csv`; a.click()
}

export default function Findings() {
  const [findings, setFindings] = useLocalStorage('pikuach_findings', MOCK_FINDINGS)
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [sevFilter, setSevFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  function addFinding(f) { setFindings(prev => [f, ...prev]) }
  function updateStatus(id, status) {
    setFindings(prev => prev.map(f => f.id===id ? {...f, status} : f))
    setSelected(prev => prev?.id===id ? {...prev, status} : prev)
  }

  const filtered = findings.filter(f => {
    const q = search.toLowerCase()
    const matchSearch = !search || f.title.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) || String(f.number).includes(q)
    return matchSearch && (sevFilter==='all'||f.severity===sevFilter) && (statusFilter==='all'||f.status===statusFilter)
  })

  const stats = { open: findings.filter(f=>f.status==='open').length, critical: findings.filter(f=>f.severity==='critical'&&f.status!=='fixed').length, fixed: findings.filter(f=>f.status==='fixed').length }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">ממצאים</h1>
          <p className="text-slate-400 text-sm mt-0.5">{findings.length} ממצאים סה"כ · {stats.open} פתוחים · {stats.critical} קריטיים</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportFindings(filtered)} className="flex items-center gap-1.5 bg-[#1e2130] hover:bg-[#252840] border border-[#374151] text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg transition-colors">
            <Download size={14}/> ייצא
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus size={16}/> ממצא חדש
          </button>
        </div>
      </div>

      {/* Stat chips */}
      <div className="flex gap-3 mb-4">
        {[
          {label:'פתוחים',val:stats.open,color:'text-red-400',bg:'bg-red-500/10',icon:AlertCircle},
          {label:'בבדיקה',val:findings.filter(f=>f.status==='in_review').length,color:'text-yellow-400',bg:'bg-yellow-500/10',icon:Clock},
          {label:'תוקנו',val:stats.fixed,color:'text-green-400',bg:'bg-green-500/10',icon:CheckCircle2},
        ].map(({label,val,color,bg,icon:Icon}) => (
          <div key={label} className={`flex items-center gap-2 ${bg} rounded-xl px-3 py-2 border border-white/5`}>
            <Icon size={14} className={color}/>
            <span className={`text-sm font-bold ${color}`}>{val}</span>
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 bg-[#13161f] border border-[#1e2130] rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search size={14} className="text-slate-500"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי כותרת, מיקום, מספר..." className="bg-transparent text-sm text-white placeholder-slate-500 outline-none flex-1"/>
        </div>
        <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className="bg-[#13161f] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-slate-300 outline-none">
          <option value="all">כל החומרות</option>
          <option value="critical">קריטי</option><option value="high">גבוה</option>
          <option value="medium">בינוני</option><option value="low">נמוך</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#13161f] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-slate-300 outline-none">
          <option value="all">כל הסטטוסים</option>
          <option value="open">פתוח</option><option value="in_review">בבדיקה</option><option value="fixed">תוקן</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#13161f] border border-[#1e2130] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2130]">
              {['#','כותרת','מיקום','חומרה','סטטוס','אחראי','דד-ליין',''].map(h => (
                <th key={h} className="text-right text-slate-500 font-medium px-4 py-3 text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => {
              const isOverdue = f.deadline && new Date(f.deadline) < new Date() && f.status !== 'fixed'
              return (
                <tr key={f.id} onClick={() => setSelected(f)} className="border-b border-[#1e2130]/50 hover:bg-[#1e2130]/50 cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-mono">#{f.number}</td>
                  <td className="px-4 py-3 text-white font-medium max-w-[180px] truncate">{f.title}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{f.location}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded border ${SEV_COLOR[f.severity]}`}>{SEV_LABEL[f.severity]}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLOR[f.status]}`}>{STATUS_LABEL[f.status]}</span></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{f.responsible}</td>
                  <td className={`px-4 py-3 text-xs ${isOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                    {f.deadline ? new Date(f.deadline).toLocaleDateString('he-IL') : '—'}
                    {isOverdue && ' ⚠'}
                  </td>
                  <td className="px-4 py-3"><Eye size={14} className="text-slate-500"/></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">אין ממצאים תואמים</div>}
      </div>

      {showNew && <NewFindingModal onClose={() => setShowNew(false)} onSave={addFinding} nextNumber={findings.length + 1} />}
      {selected && <DetailPanel finding={selected} onClose={() => setSelected(null)} onStatusChange={updateStatus} />}
    </div>
  )
}
