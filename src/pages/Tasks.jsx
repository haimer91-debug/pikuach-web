import { useState } from 'react'
import { MOCK_TASKS } from '../lib/mock'
import { Plus, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react'

const PRIO_BORDER = { high: 'border-r-red-500', medium: 'border-r-yellow-500', low: 'border-r-slate-600' }
const PRIO_LABEL  = { high: 'דחוף', medium: 'בינוני', low: 'נמוך' }
const PRIO_COLOR  = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-slate-500' }

const COLUMNS = [
  { id: 'todo',        label: 'לביצוע',  color: 'text-slate-300', next: 'in_progress', prev: null },
  { id: 'in_progress', label: 'בתהליך',  color: 'text-yellow-400', next: 'done', prev: 'todo' },
  { id: 'done',        label: 'הושלם',   color: 'text-green-400', next: null, prev: 'in_progress' },
]

const inp = 'w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-green-600'

function TaskCard({ task, onMove, today }) {
  const col = COLUMNS.find(c => c.id === task.status)
  const isOverdue = task.due_date && task.due_date < today && task.status !== 'done'

  return (
    <div className={`bg-[#1a1d27] border border-[#252840] border-r-2 ${PRIO_BORDER[task.priority]} rounded-lg p-3 ${isOverdue ? 'ring-1 ring-red-500/30' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm text-white font-medium leading-snug">{task.title}</p>
        <span className={`text-xs shrink-0 ${PRIO_COLOR[task.priority]}`}>{PRIO_LABEL[task.priority]}</span>
      </div>
      {task.description && (
        <p className="text-xs text-slate-500 mb-2 leading-relaxed line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400 font-semibold' : 'text-slate-600'}`}>
          <Clock size={11} />
          <span>{isOverdue && 'פג! '}{task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : '—'}</span>
        </div>
        <div className="flex gap-1">
          {col?.prev && (
            <button onClick={() => onMove(task.id, col.prev)} className="w-5 h-5 flex items-center justify-center rounded bg-[#252840] hover:bg-[#374151] text-slate-400 hover:text-white transition-colors" title="הקודם">
              <ChevronRight size={11}/>
            </button>
          )}
          {col?.next && (
            <button onClick={() => onMove(task.id, col.next)} className="w-5 h-5 flex items-center justify-center rounded bg-[#252840] hover:bg-green-600/30 text-slate-400 hover:text-green-400 transition-colors" title="הבא">
              <ChevronLeft size={11}/>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useState(MOCK_TASKS)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '', description: '', assignee: 'חיים עזרא' })

  const today = new Date().toISOString().split('T')[0]

  function addTask() {
    if (!form.title.trim()) return
    setTasks(t => [...t, { ...form, id: Date.now().toString(), status: 'todo', project_id: '1', created_at: new Date().toISOString() }])
    setShowNew(false)
    setForm({ title: '', priority: 'medium', due_date: '', description: '', assignee: 'חיים עזרא' })
  }

  function moveTask(id, newStatus) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
  }

  const open = tasks.filter(t => t.status !== 'done').length
  const overdue = tasks.filter(t => t.status !== 'done' && t.due_date && t.due_date < today).length

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">משימות</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {open} פתוחות
            {overdue > 0 && <span className="text-red-400 mr-2"> · {overdue} באיחור</span>}
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus size={16}/> משימה חדשה
        </button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id)
          return (
            <div key={col.id}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                <span className="bg-[#1e2130] text-slate-400 text-xs px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <div className="space-y-2 min-h-[80px]">
                {colTasks.length === 0 && (
                  <div className="border-2 border-dashed border-[#1e2130] rounded-lg h-20 flex items-center justify-center text-slate-600 text-xs">ריק</div>
                )}
                {colTasks.map(t => <TaskCard key={t.id} task={t} onMove={moveTask} today={today} />)}
              </div>
            </div>
          )
        })}
      </div>

      {/* New task modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-[#13161f] border border-[#1e2130] rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-lg font-bold">משימה חדשה</h2>
              <button onClick={() => setShowNew(false)}><X size={20} className="text-slate-500 hover:text-white" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs text-slate-400 mb-1 block">כותרת</label>
                <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="תיאור המשימה" className={inp}/></div>
              <div><label className="text-xs text-slate-400 mb-1 block">תיאור</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} className={inp+' resize-none'}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-400 mb-1 block">עדיפות</label>
                  <select value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))} className={inp}>
                    <option value="high">דחוף</option><option value="medium">בינוני</option><option value="low">נמוך</option>
                  </select></div>
                <div><label className="text-xs text-slate-400 mb-1 block">דד-ליין</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f=>({...f,due_date:e.target.value}))} className={inp}/></div>
              </div>
              <div><label className="text-xs text-slate-400 mb-1 block">אחראי</label>
                <input value={form.assignee} onChange={e => setForm(f=>({...f,assignee:e.target.value}))} className={inp}/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={addTask} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg transition-colors font-medium">שמור</button>
              <button onClick={() => setShowNew(false)} className="px-4 bg-[#1e2130] text-slate-300 text-sm py-2.5 rounded-lg transition-colors">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
