import { useState, useRef } from 'react'
import { MOCK_FINDINGS, MOCK_PROJECTS } from '../lib/mock'
import { Plus, Camera, Filter, Search, ChevronDown, X } from 'lucide-react'

const SEV_COLOR = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}
const SEV_LABEL = { critical: 'קריטי', high: 'גבוה', medium: 'בינוני', low: 'נמוך' }
const STATUS_COLOR = {
  open: 'bg-red-500/15 text-red-400 border-red-500/25',
  in_review: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  fixed: 'bg-green-500/15 text-green-400 border-green-500/25',
}
const STATUS_LABEL = { open: 'פתוח', in_review: 'בבדיקה', fixed: 'תוקן' }

function NewFindingModal({ onClose }) {
  const [form, setForm] = useState({
    title: '', location: '', description: '', severity: 'high', responsible: '', deadline: '',
  })
  const [imgPreview, setImgPreview] = useState(null)
  const fileRef = useRef()

  function handleImg(e) {
    const file = e.target.files[0]
    if (file) setImgPreview(URL.createObjectURL(file))
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#13161f] border border-[#1e2130] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-bold">ממצא חדש</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">כותרת</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="תיאור קצר של הממצא"
              className="w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-green-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">מיקום</label>
              <input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="קומה / חדר / אזור"
                className="w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-green-600"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">חומרה</label>
              <select
                value={form.severity}
                onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                className="w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-green-600"
              >
                <option value="critical">קריטי</option>
                <option value="high">גבוה</option>
                <option value="medium">בינוני</option>
                <option value="low">נמוך</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">תיאור מפורט</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="פרט את הממצא, מה נמצא ומה הבעיה"
              className="w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-green-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">אחראי לתיקון</label>
              <input
                value={form.responsible}
                onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}
                placeholder="שם קבלן / אחראי"
                className="w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-green-600"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">דד-ליין</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-green-600"
              />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">תמונה</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} className="hidden" />
            {imgPreview ? (
              <div className="relative">
                <img src={imgPreview} className="w-full h-40 object-cover rounded-lg" />
                <button
                  onClick={() => setImgPreview(null)}
                  className="absolute top-2 left-2 bg-black/60 rounded-full p-1 text-white hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current.click()}
                className="w-full h-28 border-2 border-dashed border-[#1e2130] rounded-lg flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-green-600/50 hover:text-green-500 transition-colors"
              >
                <Camera size={24} />
                <span className="text-sm">לחץ לצרף תמונה</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg transition-colors font-medium"
          >
            שמור ממצא
          </button>
          <button onClick={onClose} className="px-4 bg-[#1e2130] hover:bg-[#252840] text-slate-300 text-sm py-2.5 rounded-lg transition-colors">
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Findings() {
  const [showNew, setShowNew] = useState(false)
  const [search, setSearch] = useState('')
  const [sevFilter, setSevFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const findings = MOCK_FINDINGS.filter(f => {
    const matchSearch = !search || f.title.includes(search) || f.location.includes(search)
    const matchSev = sevFilter === 'all' || f.severity === sevFilter
    const matchStatus = statusFilter === 'all' || f.status === statusFilter
    return matchSearch && matchSev && matchStatus
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">ממצאים</h1>
          <p className="text-slate-400 text-sm mt-0.5">{MOCK_FINDINGS.length} ממצאים סה"כ</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          ממצא חדש
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 bg-[#13161f] border border-[#1e2130] rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search size={14} className="text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש ממצאים..."
            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none flex-1"
          />
        </div>
        <select
          value={sevFilter}
          onChange={e => setSevFilter(e.target.value)}
          className="bg-[#13161f] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
        >
          <option value="all">כל החומרות</option>
          <option value="critical">קריטי</option>
          <option value="high">גבוה</option>
          <option value="medium">בינוני</option>
          <option value="low">נמוך</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#13161f] border border-[#1e2130] rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
        >
          <option value="all">כל הסטטוסים</option>
          <option value="open">פתוח</option>
          <option value="in_review">בבדיקה</option>
          <option value="fixed">תוקן</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#13161f] border border-[#1e2130] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2130]">
              {['#', 'כותרת', 'מיקום', 'חומרה', 'סטטוס', 'אחראי', 'דד-ליין'].map(h => (
                <th key={h} className="text-right text-slate-500 font-medium px-4 py-3 text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {findings.map(f => (
              <tr key={f.id} className="border-b border-[#1e2130]/50 hover:bg-[#1e2130]/40 transition-colors cursor-pointer">
                <td className="px-4 py-3 text-slate-500 font-mono">#{f.number}</td>
                <td className="px-4 py-3 text-white font-medium max-w-[200px] truncate">{f.title}</td>
                <td className="px-4 py-3 text-slate-400">{f.location}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border ${SEV_COLOR[f.severity]}`}>
                    {SEV_LABEL[f.severity]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLOR[f.status]}`}>
                    {STATUS_LABEL[f.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{f.responsible}</td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(f.deadline).toLocaleDateString('he-IL')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {findings.length === 0 && (
          <div className="text-center py-12 text-slate-500">אין ממצאים תואמים לסינון</div>
        )}
      </div>

      {showNew && <NewFindingModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
