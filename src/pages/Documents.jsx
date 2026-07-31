import { useState } from 'react'
import { FileText, Upload, Search, File, Eye, Download, Folder, ChevronDown, ChevronRight, Plus, X } from 'lucide-react'

const PROFESSIONS = [
  { id: 'arch',   label: 'אדריכלות',         color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/30' },
  { id: 'struct', label: 'קונסטרוקציה',       color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'elec',   label: 'חשמל',              color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/30' },
  { id: 'plumb',  label: 'אינסטלציה',         color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/30' },
  { id: 'hvac',   label: 'מיזוג אוויר',        color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/30' },
  { id: 'fire',   label: 'כבאות ובטיחות אש',  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30' },
  { id: 'survey', label: 'מדידות',             color: 'text-green-400',   bg: 'bg-green-500/10 border-green-500/30' },
  { id: 'spec',   label: 'מפרטים',             color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30' },
  { id: 'contract','label': 'חוזים',           color: 'text-slate-300',   bg: 'bg-slate-500/10 border-slate-500/30' },
  { id: 'report', label: 'דוחות',              color: 'text-pink-400',    bg: 'bg-pink-500/10 border-pink-500/30' },
  { id: 'schedule','label': 'לוחות זמנים',     color: 'text-teal-400',    bg: 'bg-teal-500/10 border-teal-500/30' },
]

const INIT_DOCS = [
  { id:'1', name:'תוכנית קומה 3 — שלד.pdf',           type:'pdf', size:'2.4 MB', date:'2025-07-15', profession:'struct', version:'B', revision:'3' },
  { id:'2', name:'תוכנית אדריכלות קומה 1-3.pdf',      type:'pdf', size:'5.8 MB', date:'2025-07-10', profession:'arch',   version:'C', revision:'1' },
  { id:'3', name:'מפרט בטון — ת"י 118.pdf',           type:'pdf', size:'890 KB', date:'2025-07-10', profession:'spec',   version:'A', revision:'0' },
  { id:'4', name:'חוזה קבלן ראשי.pdf',                type:'pdf', size:'145 KB', date:'2025-06-01', profession:'contract',version:'A',revision:'0' },
  { id:'5', name:'תוכנית חשמל קומות 1-4.pdf',         type:'pdf', size:'3.1 MB', date:'2025-06-28', profession:'elec',   version:'B', revision:'2' },
  { id:'6', name:'תוכנית אינסטלציה — ביוב.pdf',       type:'pdf', size:'2.2 MB', date:'2025-07-01', profession:'plumb',  version:'A', revision:'1' },
  { id:'7', name:'תוכנית מיזוג מרכזי.pdf',             type:'pdf', size:'1.9 MB', date:'2025-06-15', profession:'hvac',   version:'A', revision:'0' },
  { id:'8', name:'תוכנית ספרינקלרים.pdf',              type:'pdf', size:'1.4 MB', date:'2025-06-20', profession:'fire',   version:'A', revision:'0' },
  { id:'9', name:'תוכנית מדידה — סימוני יסודות.pdf',  type:'pdf', size:'800 KB', date:'2025-05-12', profession:'survey', version:'A', revision:'0' },
  { id:'10',name:'דוח בדיקת קרקע.pdf',                type:'pdf', size:'3.2 MB', date:'2025-05-12', profession:'report', version:'A', revision:'0' },
  { id:'11',name:'לוח זמנים ראשי.xlsx',               type:'xlsx',size:'220 KB', date:'2025-07-01', profession:'schedule',version:'D',revision:'5' },
  { id:'12',name:'תוכנית אינסטלציה — מים.pdf',        type:'pdf', size:'1.8 MB', date:'2025-07-05', profession:'plumb',  version:'B', revision:'1' },
]

function FileRow({ doc, prof }) {
  const typeColor = { pdf: 'text-red-400', xlsx: 'text-green-400', doc: 'text-blue-400', dwg: 'text-orange-400' }
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-[#1e2130]/50 hover:bg-[#1a1d27] transition-colors group">
      <File size={18} className={typeColor[doc.type] ?? 'text-slate-400'} />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white font-medium truncate">{doc.name}</div>
        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
          <span>גרסה {doc.version}{doc.revision > 0 ? `.${doc.revision}` : ''}</span>
          <span>·</span>
          <span>{doc.size}</span>
          <span>·</span>
          <span>{new Date(doc.date).toLocaleDateString('he-IL')}</span>
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded border ${prof?.bg ?? ''} ${prof?.color ?? ''} shrink-0`}>
        {prof?.label}
      </span>
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button className="w-7 h-7 bg-[#252840] rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="תצוגה מקדימה">
          <Eye size={13} />
        </button>
        <button className="w-7 h-7 bg-[#252840] rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="הורד">
          <Download size={13} />
        </button>
      </div>
    </div>
  )
}

function ProfessionGroup({ prof, docs, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  if (docs.length === 0) return null

  return (
    <div className="bg-[#13161f] border border-[#1e2130] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a1d27] transition-colors"
      >
        {open ? <ChevronDown size={15} className="text-slate-500"/> : <ChevronRight size={15} className="text-slate-500"/>}
        <Folder size={16} className={prof.color} />
        <span className="flex-1 text-white font-semibold text-sm text-right">{prof.label}</span>
        <span className="text-xs text-slate-500 bg-[#1e2130] px-2 py-0.5 rounded-full">{docs.length} קבצים</span>
      </button>
      {open && (
        <div className="border-t border-[#1e2130]">
          {docs.map(doc => (
            <FileRow key={doc.id} doc={doc} prof={prof} />
          ))}
        </div>
      )}
    </div>
  )
}

function UploadModal({ onClose }) {
  const [prof, setProf] = useState('arch')
  const [version, setVersion] = useState('A')
  const [fileName, setFileName] = useState('')

  const inp = 'w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-green-600'

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#13161f] border border-[#1e2130] rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">העלאת תוכנית / מסמך</h2>
          <button onClick={onClose}><X size={20} className="text-slate-500 hover:text-white"/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">מקצוע / קטגוריה</label>
            <select value={prof} onChange={e => setProf(e.target.value)} className={inp}>
              {PROFESSIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">גרסה</label>
              <input value={version} onChange={e => setVersion(e.target.value)} placeholder="A, B, C..." className={inp} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">מהדורה</label>
              <input type="number" defaultValue="0" min="0" className={inp} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-2 block">קובץ</label>
            <div className="border-2 border-dashed border-[#374151] rounded-xl p-8 text-center hover:border-green-500/50 transition-colors cursor-pointer">
              <Upload size={28} className="text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">גרור קובץ לכאן או לחץ לבחירה</p>
              <p className="text-slate-600 text-xs mt-1">PDF, DWG, XLSX, DOCX עד 50MB</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg font-medium transition-colors">העלה</button>
          <button onClick={onClose} className="px-5 bg-[#1e2130] hover:bg-[#252840] text-slate-300 text-sm py-2.5 rounded-lg transition-colors">ביטול</button>
        </div>
      </div>
    </div>
  )
}

export default function Documents() {
  const [docs] = useState(INIT_DOCS)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grouped') // grouped | flat
  const [showUpload, setShowUpload] = useState(false)

  const filtered = docs.filter(d => !search || d.name.includes(search))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">תוכניות ומסמכים</h1>
          <p className="text-slate-400 text-sm mt-0.5">{docs.length} קבצים · {PROFESSIONS.filter(p => docs.some(d => d.profession === p.id)).length} מקצועות</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-[#1e2130] overflow-hidden">
            <button onClick={() => setView('grouped')} className={`px-3 py-2 text-xs transition-colors ${view==='grouped' ? 'bg-green-600/20 text-green-400' : 'text-slate-400 hover:text-white'}`}>לפי מקצוע</button>
            <button onClick={() => setView('flat')} className={`px-3 py-2 text-xs transition-colors ${view==='flat' ? 'bg-green-600/20 text-green-400' : 'text-slate-400 hover:text-white'}`}>רשימה</button>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16}/>
            העלה מסמך
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#13161f] border border-[#1e2130] rounded-lg px-3 py-2 mb-4">
        <Search size={14} className="text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש תוכנית או מסמך..."
          className="bg-transparent text-sm text-white placeholder-slate-500 outline-none flex-1"
        />
      </div>

      {/* Profession summary chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PROFESSIONS.map(prof => {
          const count = docs.filter(d => d.profession === prof.id).length
          if (count === 0) return null
          return (
            <button
              key={prof.id}
              onClick={() => setSearch(prof.label)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105 ${prof.bg} ${prof.color}`}
            >
              {prof.label} ({count})
            </button>
          )
        })}
        {search && (
          <button onClick={() => setSearch('')} className="text-xs px-3 py-1.5 rounded-full border border-[#374151] text-slate-400 hover:text-white">
            × נקה
          </button>
        )}
      </div>

      {/* Content */}
      {view === 'grouped' ? (
        <div className="space-y-3">
          {PROFESSIONS.map((prof, i) => (
            <ProfessionGroup
              key={prof.id}
              prof={prof}
              docs={filtered.filter(d => d.profession === prof.id)}
              defaultOpen={i < 3}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#13161f] border border-[#1e2130] rounded-xl overflow-hidden">
          {filtered.map(doc => {
            const prof = PROFESSIONS.find(p => p.id === doc.profession)
            return <FileRow key={doc.id} doc={doc} prof={prof} />
          })}
          {filtered.length === 0 && <div className="text-center py-12 text-slate-500">אין מסמכים תואמים</div>}
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}
