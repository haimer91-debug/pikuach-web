import { useState } from 'react'
import { MOCK_PROJECTS } from '../lib/mock'
import { Plus, MapPin, Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react'

const STATUS_LABEL = { active: 'פעיל', paused: 'מושהה', completed: 'הושלם' }
const STATUS_COLOR = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

function ProjectCard({ project, onClick }) {
  const budgetPct = Math.round((project.spent / project.budget) * 100)
  return (
    <div
      onClick={() => onClick(project)}
      className="bg-[#13161f] border border-[#1e2130] rounded-xl p-5 cursor-pointer hover:border-green-600/40 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-base leading-snug">{project.name}</h3>
          <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
            <MapPin size={11} />
            <span>{project.address}</span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded border ${STATUS_COLOR[project.status]}`}>
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">התקדמות</span>
          <span className="text-green-400 font-semibold">{project.progress}%</span>
        </div>
        <div className="h-2 bg-[#1e2130] rounded-full">
          <div className="h-2 rounded-full bg-green-500" style={{ width: `${project.progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#1e2130] rounded-lg p-2">
          <div className="text-slate-500 mb-0.5">שלב</div>
          <div className="text-white font-medium">{project.stage}</div>
        </div>
        <div className="bg-[#1e2130] rounded-lg p-2">
          <div className="text-slate-500 mb-0.5">קבלן</div>
          <div className="text-white font-medium truncate">{project.contractor}</div>
        </div>
        <div className="bg-[#1e2130] rounded-lg p-2">
          <div className="text-slate-500 mb-0.5">ממצאים פתוחים</div>
          <div className={`font-bold ${project.open_findings > 0 ? 'text-orange-400' : 'text-green-400'}`}>
            {project.open_findings}
          </div>
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
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? MOCK_PROJECTS : MOCK_PROJECTS.filter(p => p.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">פרויקטים</h1>
          <p className="text-slate-400 text-sm mt-0.5">{MOCK_PROJECTS.length} פרויקטים</p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} />
          פרויקט חדש
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[['all', 'הכל'], ['active', 'פעילים'], ['paused', 'מושהים'], ['completed', 'הושלמו']].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              filter === val
                ? 'bg-green-600/20 text-green-400 border-green-500/30'
                : 'bg-[#13161f] text-slate-400 border-[#1e2130] hover:border-[#374151]'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(p => (
          <ProjectCard key={p.id} project={p} onClick={setSelected} />
        ))}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#13161f] border border-[#1e2130] rounded-2xl p-6 max-w-lg w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white text-lg font-bold">{selected.name}</h2>
                <p className="text-slate-400 text-sm mt-0.5">{selected.address}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                ['קבלן', selected.contractor],
                ['שלב', selected.stage],
                ['התחלה', new Date(selected.start_date).toLocaleDateString('he-IL')],
                ['סיום מתוכנן', new Date(selected.end_date).toLocaleDateString('he-IL')],
              ].map(([k, v]) => (
                <div key={k} className="bg-[#1e2130] rounded-lg p-3">
                  <div className="text-slate-500 text-xs mb-0.5">{k}</div>
                  <div className="text-white text-sm font-medium">{v}</div>
                </div>
              ))}
            </div>

            <div className="bg-[#1e2130] rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">תקציב</span>
                <span className="text-white">
                  ₪{selected.spent.toLocaleString()} / ₪{selected.budget.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-[#0f1117] rounded-full">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${Math.round((selected.spent / selected.budget) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg transition-colors">
                פתח פרויקט
              </button>
              <button className="flex-1 bg-[#1e2130] hover:bg-[#252840] text-white text-sm py-2 rounded-lg transition-colors">
                הוסף ממצא
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
