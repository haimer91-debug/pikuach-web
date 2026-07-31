import { useState } from 'react'
import { MOCK_TASKS } from '../lib/mock'
import { Plus, Clock, X } from 'lucide-react'

const PRIO_COLOR = {
  high: 'border-r-red-500',
  medium: 'border-r-yellow-500',
  low: 'border-r-slate-600',
}
const PRIO_LABEL = { high: 'דחוף', medium: 'בינוני', low: 'נמוך' }

const COLUMNS = [
  { id: 'todo', label: 'לביצוע', color: 'text-slate-400' },
  { id: 'in_progress', label: 'בתהליך', color: 'text-yellow-400' },
  { id: 'done', label: 'הושלם', color: 'text-green-400' },
]

function TaskCard({ task }) {
  return (
    <div className={`bg-[#1a1d27] border border-[#252840] border-r-2 ${PRIO_COLOR[task.priority]} rounded-lg p-3`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm text-white font-medium leading-snug">{task.title}</p>
        <span className={`text-xs shrink-0 ${
          task.priority === 'high' ? 'text-red-400' :
          task.priority === 'medium' ? 'text-yellow-400' : 'text-slate-500'
        }`}>{PRIO_LABEL[task.priority]}</span>
      </div>
      {task.description && (
        <p className="text-xs text-slate-500 mb-2 leading-relaxed line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-1 text-xs text-slate-600">
        <Clock size={11} />
        <span>עד {new Date(task.due_date).toLocaleDateString('he-IL')}</span>
      </div>
    </div>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useState(MOCK_TASKS)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '', description: '' })

  function addTask() {
    if (!form.title.trim()) return
    setTasks(t => [...t, { ...form, id: Date.now().toString(), status: 'todo', assignee: 'חיים עזרא', created_at: new Date().toISOString() }])
    setShowNew(false)
    setForm({ title: '', priority: 'medium', due_date: '', description: '' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">משימות</h1>
          <p className="text-slate-400 text-sm mt-0.5">{tasks.filter(t => t.status !== 'done').length} משימות פתוחות</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          משימה חדשה
        </button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id)
          return (
            <div key={col.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                <span className="bg-[#1e2130] text-slate-400 text-xs px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {colTasks.map(t => <TaskCard key={t.id} task={t} />)}
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
              <button onClick={() => setShowNew(false)}><X size={20} className="text-slate-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">כותרת</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="תיאור המשימה"
                  className="w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-green-600" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">תיאור</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-green-600 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">עדיפות</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-green-600">
                    <option value="high">דחוף</option>
                    <option value="medium">בינוני</option>
                    <option value="low">נמוך</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">דד-ליין</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-green-600" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={addTask} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg transition-colors font-medium">
                שמור
              </button>
              <button onClick={() => setShowNew(false)} className="px-4 bg-[#1e2130] text-slate-300 text-sm py-2.5 rounded-lg transition-colors">
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
