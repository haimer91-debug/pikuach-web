import { MOCK_PROJECTS, MOCK_FINDINGS, MOCK_TASKS } from '../lib/mock'
import { AlertCircle, CheckCircle2, Clock, TrendingUp, FolderOpen, Camera, CheckSquare } from 'lucide-react'

const SEV_COLOR = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}
const SEV_LABEL = { critical: 'קריטי', high: 'גבוה', medium: 'בינוני', low: 'נמוך' }

const STATUS_COLOR = {
  open: 'text-red-400',
  in_review: 'text-yellow-400',
  fixed: 'text-green-400',
}
const STATUS_LABEL = { open: 'פתוח', in_review: 'בבדיקה', fixed: 'תוקן' }

function Stat({ icon: Icon, label, value, sub, color = 'text-green-400' }) {
  return (
    <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg bg-[#1e2130] flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const totalProjects = MOCK_PROJECTS.length
  const activeProjects = MOCK_PROJECTS.filter(p => p.status === 'active').length
  const openFindings = MOCK_FINDINGS.filter(f => f.status === 'open').length
  const criticalFindings = MOCK_FINDINGS.filter(f => f.severity === 'critical').length
  const pendingTasks = MOCK_TASKS.filter(t => t.status !== 'done').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">שלום, חיים 👋</h1>
        <p className="text-slate-400 text-sm mt-1">יום חמישי, 31 יולי 2025 — להלן סיכום הפרויקטים הפעילים</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat icon={FolderOpen} label="פרויקטים פעילים" value={activeProjects} sub={`מתוך ${totalProjects} סה"כ`} color="text-blue-400" />
        <Stat icon={Camera} label="ממצאים פתוחים" value={openFindings} sub={`${criticalFindings} קריטיים`} color="text-orange-400" />
        <Stat icon={CheckSquare} label="משימות ממתינות" value={pendingTasks} sub="לטיפול השבוע" color="text-purple-400" />
        <Stat icon={TrendingUp} label="ביצוע ממוצע" value="48%" sub="על כלל הפרויקטים" color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Findings */}
        <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">ממצאים אחרונים</h2>
            <a href="/findings" className="text-green-400 text-sm hover:text-green-300">הצג הכל</a>
          </div>
          <div className="space-y-3">
            {MOCK_FINDINGS.map(f => (
              <div key={f.id} className="flex items-start gap-3">
                <span className={`text-xs px-2 py-0.5 rounded border mt-0.5 ${SEV_COLOR[f.severity]}`}>
                  {SEV_LABEL[f.severity]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">#{f.number} {f.title}</div>
                  <div className="text-xs text-slate-500">{f.location}</div>
                </div>
                <span className={`text-xs ${STATUS_COLOR[f.status]}`}>{STATUS_LABEL[f.status]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">מצב פרויקטים</h2>
            <a href="/projects" className="text-green-400 text-sm hover:text-green-300">הצג הכל</a>
          </div>
          <div className="space-y-4">
            {MOCK_PROJECTS.map(p => (
              <div key={p.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white font-medium">{p.name}</span>
                  <span className="text-green-400 font-semibold">{p.progress}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#1e2130] rounded-full">
                    <div
                      className="h-1.5 rounded-full bg-green-500"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{p.stage}</span>
                  <span>{p.open_findings} ממצאים פתוחים</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">משימות קרובות</h2>
            <a href="/tasks" className="text-green-400 text-sm hover:text-green-300">הצג הכל</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MOCK_TASKS.map(t => (
              <div key={t.id} className="bg-[#1a1d27] rounded-lg p-3 border border-[#252840]">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm text-white font-medium leading-snug">{t.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${
                    t.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    t.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  }`}>
                    {t.priority === 'high' ? 'דחוף' : t.priority === 'medium' ? 'בינוני' : 'נמוך'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={11} />
                  <span>עד {new Date(t.due_date).toLocaleDateString('he-IL')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
