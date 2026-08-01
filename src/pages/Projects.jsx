import { useState } from 'react'
import { MOCK_PROJECTS } from '../lib/mock'
import { useLocalStorage } from '../lib/useLocalStorage'
import { Plus, MapPin, X, Building2, ChevronLeft } from 'lucide-react'

const STATUS_LABEL = { active: 'פעיל', paused: 'מושהה', completed: 'הושלם' }
const STATUS_COLOR = {
  active:    'bg-green-500/20 text-green-400 border-green-500/30',
  paused:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}
const inp = 'w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-green-600'

function NewProjectModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', address: '', contractor: '', stage: 'יסודות',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '', budget: '', progress: 0, status: 'active',
  })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function save() {
    if (!form.name.trim()) return
    onSave({
      id: Date.now().toString(),
      open_findings: 0,
      spent: 0,
      budget: Number(form.budget) || 0,
      progress: Number(form.progress) || 0,
      ...form,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#13161f] border border-[#1e2130] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-bold">פרויקט חדש</h2>
          <button onClick={onClose}><X size={20} className="text-slate-500 hover:text-white"/></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">שם הפרויקט</label>
            <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="רמות 12, בניין ב׳" className={inp}/>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">כתובת</label>
            <input value={form.address} onChange={e => f('address', e.target.value)} placeholder="רחוב, עיר" className={inp}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">קבלן מבצע</label>
              <input value={form.contractor} onChange={e => f('contractor', e.target.value)} placeholder="שם חברה" className={inp}/>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">שלב נוכחי</label>
              <select value={form.stage} onChange={e => f('stage', e.target.value)} className={inp}>
                <option>יסודות</option>
                <option>שלד</option>
                <option>גמר</option>
                <option>פיתוח</option>
                <option>מסירות</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">תאריך התחלה</label>
              <input type="date" value={form.start_date} onChange={e => f('start_date', e.target.value)} className={inp}/>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">תאריך סיום מתוכנן</label>
              <input type="date" value={form.end_date} onChange={e => f('end_date', e.target.value)} className={inp}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">תקציב (₪)</label>
              <input type="number" value={form.budget} onChange={e => f('budget', e.target.value)} placeholder="2500000" className={inp}/>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">התקדמות (%)</label>
              <input type="number" min="0" max="100" value={form.progress} onChange={e => f('progress', e.target.value)} placeholder="0" className={inp}/>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">סטטוס</label>
            <select value={form.status} onChange={e => f('status', e.target.value)} className={inp}>
              <option value="active">פעיל</option>
              <option value="paused">מושהה</option>
              <option value="completed">הושלם</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={save} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg font-medium">שמור פרויקט</button>
          <button onClick={onClose} className="px-4 bg-[#1e2130] text-slate-300 text-sm py-2.5 rounded-lg">ביטול</button>
        </div>
      </div>
    </div>
  )
}

function EditProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState({ ...project, budget: String(project.budget), progress: String(project.progress) })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function save() {
    if (!form.name.trim()) return
    onSave({ ...form, budget: Number(form.budget) || 0, progress: Number(form.progress) || 0 })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#13161f] border border-[#1e2130] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-bold">עריכת פרויקט</h2>
          <button onClick={onClose}><X size={20} className="text-slate-500 hover:text-white"/></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">שם הפרויקט</label>
            <input value={form.name} onChange={e => f('name', e.target.value)} className={inp}/>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">כתובת</label>
            <input value={form.address} onChange={e => f('address', e.target.value)} className={inp}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">קבלן מבצע</label>
              <input value={form.contractor} onChange={e => f('contractor', e.target.value)} className={inp}/>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">שלב נוכחי</label>
              <select value={form.stage} onChange={e => f('stage', e.target.value)} className={inp}>
                <option>יסודות</option><option>שלד</option><option>גמר</option><option>פיתוח</option><option>מסירות</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">התקדמות (%)</label>
              <input type="number" min="0" max="100" value={form.progress} onChange={e => f('progress', e.target.value)} className={inp}/>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">סטטוס</label>
              <select value={form.status} onChange={e => f('status', e.target.value)} className={inp}>
                <option value="active">פעיל</option>
                <option value="paused">מושהה</option>
                <option value="completed">הושלם</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">תקציב (₪)</label>
            <input type="number" value={form.budget} onChange={e => f('budget', e.target.value)} className={inp}/>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={save} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg font-medium">שמור שינויים</button>
          <button onClick={onClose} className="px-4 bg-[#1e2130] text-slate-300 text-sm py-2.5 rounded-lg">ביטול</button>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project, onClick }) {
  const budgetPct = project.budget ? Math.round((project.spent / project.budget) * 100) : 0
  return (
    <div onClick={() => onClick(project)} className="bg-[#13161f] border border-[#1e2130] rounded-xl p-5 cursor-pointer hover:border-green-600/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base leading-snug truncate">{project.name}</h3>
          <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
            <MapPin size={11}/><span className="truncate">{project.address}</span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded border shrink-0 mr-2 ${STATUS_COLOR[project.status]}`}>{STATUS_LABEL[project.status]}</span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">התקדמות</span>
          <span className="text-green-400 font-semibold">{project.progress}%</span>
        </div>
        <div className="h-2 bg-[#1e2130] rounded-full">
          <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${project.progress}%` }}/>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#1e2130] rounded-lg p-2">
          <div className="text-slate-500 mb-0.5">שלב</div>
          <div className="text-white font-medium">{project.stage}</div>
        </div>
        <div className="bg-[#1e2130] rounded-lg p-2">
          <div className="text-slate-500 mb-0.5">קבלן</div>
          <div className="text-white font-medium truncate">{project.contractor || '—'}</div>
        </div>
        <div className="bg-[#1e2130] rounded-lg p-2">
          <div className="text-slate-500 mb-0.5">ממצאים פתוחים</div>
          <div className={`font-bold ${project.open_findings > 0 ? 'text-orange-400' : 'text-green-400'}`}>{project.open_findings ?? 0}</div>
        </div>
        <div className="bg-[#1e2130] rounded-lg p-2">
          <div className="text-slate-500 mb-0.5">תקציב מנוצל</div>
          <div className={`font-bold ${budgetPct > 80 ? 'text-red-400' : 'text-white'}`}>{budgetPct}%</div>
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const [projects, setProjects] = useLocalStorage('pikuach_projects', MOCK_PROJECTS)
  const [selected, setSelected]     = useState(null)
  const [showNew, setShowNew]       = useState(false)
  const [editing, setEditing]       = useState(null)
  const [filter, setFilter]         = useState('all')

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  function addProject(p) { setProjects(prev => [p, ...prev]) }

  function saveEdit(updated) {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
    setSelected(updated)
  }

  function deleteProject(id) {
    if (!window.confirm('למחוק את הפרויקט?')) return
    setProjects(prev => prev.filter(p => p.id !== id))
    setSelected(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">פרויקטים</h1>
          <p className="text-slate-400 text-sm mt-0.5">{projects.length} פרויקטים · {projects.filter(p=>p.status==='active').length} פעילים</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus size={16}/> פרויקט חדש
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {[['all','הכל'],['active','פעילים'],['paused','מושהים'],['completed','הושלמו']].map(([val,lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${filter===val ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-[#13161f] text-slate-400 border-[#1e2130] hover:border-[#374151]'}`}>
            {lbl}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Building2 size={48} className="mx-auto mb-4 text-slate-700"/>
          <p className="text-slate-500 text-sm">אין פרויקטים</p>
          <button onClick={() => setShowNew(true)} className="mt-3 text-green-400 text-sm hover:text-green-300">+ הוסף פרויקט ראשון</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => <ProjectCard key={p.id} project={p} onClick={setSelected}/>)}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-40 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md bg-[#0f1117] border-r border-[#1e2130] h-full flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#13161f] border-b border-[#1e2130] px-5 py-3 flex items-center gap-3 shrink-0">
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white"><ChevronLeft size={20}/></button>
              <span className="text-white font-bold flex-1 truncate">{selected.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLOR[selected.status]}`}>{STATUS_LABEL[selected.status]}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center gap-1 text-slate-400 text-sm">
                <MapPin size={14}/><span>{selected.address}</span>
              </div>

              <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">התקדמות כללית</span>
                  <span className="text-green-400 font-bold">{selected.progress}%</span>
                </div>
                <div className="h-2.5 bg-[#1e2130] rounded-full">
                  <div className="h-2.5 rounded-full bg-green-500" style={{ width: `${selected.progress}%` }}/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ['קבלן', selected.contractor || '—'],
                  ['שלב', selected.stage],
                  ['התחלה', selected.start_date ? new Date(selected.start_date).toLocaleDateString('he-IL') : '—'],
                  ['סיום מתוכנן', selected.end_date ? new Date(selected.end_date).toLocaleDateString('he-IL') : '—'],
                  ['ממצאים פתוחים', selected.open_findings ?? 0],
                  ['תקציב', selected.budget ? '₪'+Number(selected.budget).toLocaleString() : '—'],
                ].map(([k,v]) => (
                  <div key={k} className="bg-[#1e2130] rounded-lg p-3">
                    <div className="text-slate-500 text-xs mb-0.5">{k}</div>
                    <div className="text-white text-sm font-medium">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-[#1e2130] p-4 flex gap-2 shrink-0">
              <button onClick={() => setEditing(selected)} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg transition-colors">עריכה</button>
              <button onClick={() => deleteProject(selected.id)} className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm py-2 rounded-lg transition-colors">מחק</button>
            </div>
          </div>
        </div>
      )}

      {showNew  && <NewProjectModal onClose={() => setShowNew(false)} onSave={addProject}/>}
      {editing  && <EditProjectModal project={editing} onClose={() => setEditing(null)} onSave={saveEdit}/>}
    </div>
  )
}
