import { Link } from 'react-router-dom'
import { MOCK_PROJECTS, MOCK_FINDINGS, MOCK_TASKS, MOCK_WORKLOG } from '../lib/mock'
import { useLocalStorage } from '../lib/useLocalStorage'
import { AlertCircle, CheckCircle2, Clock, TrendingUp, FolderOpen, Camera, CheckSquare, AlertTriangle, Calendar, ArrowLeft } from 'lucide-react'

const SEV_COLOR = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
}
const SEV_LABEL    = { critical: 'קריטי', high: 'גבוה', medium: 'בינוני', low: 'נמוך' }
const STATUS_COLOR = { open: 'text-red-400', in_review: 'text-yellow-400', fixed: 'text-green-400' }
const STATUS_LABEL = { open: 'פתוח', in_review: 'בבדיקה', fixed: 'תוקן' }

function Stat({ icon: Icon, label, value, sub, color = 'text-green-400', alert }) {
  return (
    <div className={`bg-[#13161f] border rounded-xl p-4 ${alert ? 'border-red-500/40' : 'border-[#1e2130]'}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg bg-[#1e2130] flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
        <span className="text-slate-400 text-sm">{label}</span>
        {alert && <AlertTriangle size={12} className="text-red-400 mr-auto" />}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [projects] = useLocalStorage('pikuach_projects', MOCK_PROJECTS)
  const [findings] = useLocalStorage('pikuach_findings', MOCK_FINDINGS)
  const [tasks]    = useLocalStorage('pikuach_tasks',    MOCK_TASKS)
  const [worklog]  = useLocalStorage('pikuach_worklog',  MOCK_WORKLOG)

  const now   = new Date()
  const today = now.toISOString().split('T')[0]

  const activeProjects = projects.filter(p => p.status === 'active').length
  const openFindings   = findings.filter(f => f.status === 'open').length
  const criticalOpen   = findings.filter(f => f.severity === 'critical' && f.status !== 'fixed').length
  const pendingTasks   = tasks.filter(t => t.status !== 'done').length
  const overdueTasks   = tasks.filter(t => t.status !== 'done' && t.due_date && t.due_date < today)
  const avgProgress    = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length)
    : 0

  const recentFindings = [...findings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
  const urgentTasks    = tasks.filter(t => t.status !== 'done').sort((a, b) => {
    const pr = { high: 0, medium: 1, low: 2 }
    return (pr[a.priority] ?? 2) - (pr[b.priority] ?? 2)
  }).slice(0, 4)

  const lastLog = worklog[0]

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">שלום, חיים</h1>
        <p className="text-slate-400 text-sm mt-1">
          {now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {overdueTasks.length > 0 && (
            <span className="mr-2 text-red-400 font-medium">· {overdueTasks.length} משימות באיחור!</span>
          )}
        </p>
      </div>

      {criticalOpen > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <span className="text-red-300 text-sm font-medium">
            {criticalOpen} ממצא קריטי פתוח — נדרש טיפול דחוף
          </span>
          <Link to="/findings" className="mr-auto text-red-400 text-xs hover:text-red-300 flex items-center gap-1">
            צפה <ArrowLeft size={12} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat icon={FolderOpen}  label="פרויקטים פעילים" value={activeProjects}    sub={`מתוך ${projects.length} סה"כ`}          color="text-blue-400" />
        <Stat icon={Camera}      label="ממצאים פתוחים"   value={openFindings}     sub={`${criticalOpen} קריטיים`}                 color="text-orange-400" alert={criticalOpen > 0} />
        <Stat icon={CheckSquare} label="משימות ממתינות"   value={pendingTasks}     sub={overdueTasks.length > 0 ? `${overdueTasks.length} באיחור` : 'הכל בזמן'} color={overdueTasks.length > 0 ? 'text-red-400' : 'text-purple-400'} />
        <Stat icon={TrendingUp}  label="ביצוע ממוצע"     value={`${avgProgress}%`} sub="על כלל הפרויקטים"                         color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">ממצאים אחרונים</h2>
            <Link to="/findings" className="text-green-400 text-xs hover:text-green-300">הצג הכל →</Link>
          </div>
          <div className="space-y-2.5">
            {recentFindings.length === 0 && <p className="text-slate-500 text-sm text-center py-4">אין ממצאים</p>}
            {recentFindings.map(f => (
              <div key={f.id} className="flex items-center gap-3 py-1.5 border-b border-[#1e2130]/50 last:border-0">
                <span className={`text-xs px-2 py-0.5 rounded border shrink-0 ${SEV_COLOR[f.severity]}`}>
                  {SEV_LABEL[f.severity]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">#{f.number} {f.title}</div>
                  <div className="text-xs text-slate-500">{f.location}</div>
                </div>
                <span className={`text-xs shrink-0 ${STATUS_COLOR[f.status]}`}>{STATUS_LABEL[f.status]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-sm">מצב פרויקטים</h2>
              <Link to="/projects" className="text-green-400 text-xs hover:text-green-300">הכל →</Link>
            </div>
            {projects.length === 0
              ? <p className="text-slate-500 text-xs text-center py-2">אין פרויקטים</p>
              : (
                <div className="space-y-3">
                  {projects.slice(0, 4).map(p => (
                    <div key={p.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 truncate max-w-[130px]">{p.name}</span>
                        <span className="text-green-400 font-bold">{p.progress || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1e2130] rounded-full">
                        <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${p.progress || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          {lastLog && (
            <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-white text-sm font-semibold">יומן — אחרון</span>
              </div>
              <div className="text-xs text-slate-400 leading-relaxed line-clamp-3">{lastLog.work_done}</div>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span>{lastLog.workers} פועלים</span>
                <span>·</span>
                <span>{lastLog.temp}°C</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">משימות דחופות</h2>
          <Link to="/tasks" className="text-green-400 text-xs hover:text-green-300">הצג הכל →</Link>
        </div>
        {urgentTasks.length === 0
          ? <p className="text-slate-500 text-sm text-center py-4">אין משימות פתוחות</p>
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {urgentTasks.map(t => {
                const isOverdue = t.due_date && t.due_date < today
                return (
                  <div key={t.id} className={`bg-[#1a1d27] rounded-lg p-3 border ${isOverdue ? 'border-red-500/30' : 'border-[#252840]'}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm text-white font-medium leading-snug line-clamp-2">{t.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${
                        t.priority === 'high'   ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        t.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                   'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }`}>{t.priority === 'high' ? 'דחוף' : t.priority === 'medium' ? 'בינוני' : 'נמוך'}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400 font-semibold' : 'text-slate-600'}`}>
                      <Clock size={11} />
                      <span>{isOverdue ? 'פג! ' : 'עד '}{t.due_date ? new Date(t.due_date).toLocaleDateString('he-IL') : '—'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    </div>
  )
}
