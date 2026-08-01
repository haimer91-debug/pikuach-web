import { useState } from 'react'
import { MOCK_PROJECTS, MOCK_FINDINGS, MOCK_WORKLOG, MOCK_TASKS } from '../lib/mock'
import { FileText, Download, Eye, CheckCircle2, AlertCircle, Calendar } from 'lucide-react'

const SEV_LABEL   = { critical: 'קריטי', high: 'גבוה', medium: 'בינוני', low: 'נמוך' }
const STATUS_LABEL = { open: 'פתוח', in_review: 'בבדיקה', fixed: 'תוקן' }

const REPORT_TYPES = [
  { id: 'visit',    label: 'דוח ביקור',        icon: Calendar,      desc: 'דוח ביקור שטח יומי' },
  { id: 'findings', label: 'דוח ממצאים',        icon: AlertCircle,   desc: 'כל הממצאים הפתוחים' },
  { id: 'monthly',  label: 'דוח חודשי',         icon: CheckCircle2,  desc: 'סיכום חודש מלא' },
]

function buildVisitReport(project, worklog, findings) {
  const last = worklog[0]
  const dateStr = last ? new Date(last.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('he-IL')
  const projectFindings = findings.filter(f => f.project_id === project.id && f.status !== 'fixed')

  const lines = []
  lines.push('='  .repeat(56))
  lines.push(`דוח ביקור שטח`)
  lines.push('='  .repeat(56))
  lines.push('')
  lines.push(`פרויקט:   ${project.name}`)
  lines.push(`כתובת:    ${project.address}`)
  lines.push(`קבלן:     ${project.contractor}`)
  lines.push(`תאריך:    ${dateStr}`)
  lines.push(`מפקח:     חיים עזרא`)
  lines.push('-'  .repeat(56))

  if (last) {
    lines.push('')
    lines.push('א. ביצועים ביום הביקור')
    lines.push('-'  .repeat(40))
    lines.push(`מזג אוויר: ${last.weather === 'sunny' ? 'שמשי' : last.weather === 'cloudy' ? 'מעונן' : 'גשום'}, ${last.temp}°C`)
    lines.push(`כוח אדם:   ${last.workers} פועלים, ${last.foremen} מנהלי עבודה`)
    lines.push('')
    lines.push('עבודות שבוצעו:')
    lines.push(last.work_done)
    lines.push('')
    lines.push(`חומרים:    ${last.materials}`)
    if (last.issues && last.issues !== 'ללא') {
      lines.push(`חריגות:    ${last.issues}`)
    }
  }

  if (projectFindings.length > 0) {
    lines.push('')
    lines.push('ב. ממצאים פתוחים')
    lines.push('-'  .repeat(40))
    projectFindings.forEach((f, i) => {
      lines.push(`${i + 1}. [${SEV_LABEL[f.severity]}] #${f.number} — ${f.title}`)
      lines.push(`   מיקום: ${f.location}`)
      if (f.standard) lines.push(`   תקן: ${f.standard}`)
      lines.push(`   אחראי: ${f.responsible} · עד: ${f.deadline ? new Date(f.deadline).toLocaleDateString('he-IL') : '—'}`)
    })
  }

  lines.push('')
  lines.push('-'  .repeat(56))
  lines.push(`חתימה: חיים עזרא, מהנדס פיקוח`)
  lines.push(`הופק: ${new Date().toLocaleString('he-IL')}`)
  return lines.join('\n')
}

function buildFindingsReport(project, findings) {
  const pf = findings.filter(f => f.project_id === project.id)
  const open = pf.filter(f => f.status === 'open')
  const inReview = pf.filter(f => f.status === 'in_review')
  const fixed = pf.filter(f => f.status === 'fixed')
  const critical = open.filter(f => f.severity === 'critical')

  const lines = []
  lines.push('='  .repeat(56))
  lines.push('דוח ממצאים — פיקוח בנייה')
  lines.push('='  .repeat(56))
  lines.push('')
  lines.push(`פרויקט: ${project.name}`)
  lines.push(`תאריך:  ${new Date().toLocaleDateString('he-IL')}`)
  lines.push(`מפקח:   חיים עזרא`)
  lines.push('')
  lines.push(`סה"כ ממצאים: ${pf.length}`)
  lines.push(`  פתוחים:    ${open.length} (${critical.length} קריטיים)`)
  lines.push(`  בבדיקה:    ${inReview.length}`)
  lines.push(`  תוקנו:     ${fixed.length}`)

  if (critical.length > 0) {
    lines.push('')
    lines.push('⚠️  ממצאים קריטיים — דרוש טיפול מיידי')
    lines.push('-'  .repeat(40))
    critical.forEach((f, i) => {
      lines.push(`${i + 1}. #${f.number} — ${f.title}`)
      lines.push(`   מיקום: ${f.location}`)
      lines.push(`   ${f.description}`)
      if (f.standard) lines.push(`   תקן: ${f.standard}`)
      lines.push(`   אחראי: ${f.responsible}`)
      lines.push(`   דד-ליין: ${f.deadline ? new Date(f.deadline).toLocaleDateString('he-IL') : '—'}`)
      lines.push('')
    })
  }

  const nonCriticalOpen = open.filter(f => f.severity !== 'critical')
  if (nonCriticalOpen.length > 0) {
    lines.push('ממצאים פתוחים נוספים')
    lines.push('-'  .repeat(40))
    nonCriticalOpen.forEach((f, i) => {
      lines.push(`${i + 1}. [${SEV_LABEL[f.severity]}] #${f.number} — ${f.title} (${f.location})`)
    })
  }

  if (fixed.length > 0) {
    lines.push('')
    lines.push('ממצאים שתוקנו')
    lines.push('-'  .repeat(40))
    fixed.forEach(f => lines.push(`✓ #${f.number} — ${f.title}`))
  }

  lines.push('')
  lines.push('-'  .repeat(56))
  lines.push(`חתימה: חיים עזרא · ${new Date().toLocaleString('he-IL')}`)
  return lines.join('\n')
}

function buildMonthlyReport(project, findings, worklog, tasks) {
  const pf = findings.filter(f => f.project_id === project.id)
  const pw = worklog.filter(w => w.project_id === project.id)
  const pt = tasks.filter(t => t.project_id === project.id)
  const totalWorkers = pw.reduce((s, e) => s + e.workers, 0)

  const lines = []
  lines.push('='  .repeat(56))
  lines.push('דוח חודשי — פיקוח בנייה')
  lines.push(`${new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}`)
  lines.push('='  .repeat(56))
  lines.push('')
  lines.push(`פרויקט:    ${project.name}`)
  lines.push(`כתובת:     ${project.address}`)
  lines.push(`קבלן:      ${project.contractor}`)
  lines.push(`שלב נוכחי: ${project.stage}`)
  lines.push(`התקדמות:   ${project.progress}%`)
  lines.push('')
  lines.push('א. סיכום ביצוע')
  lines.push('-'  .repeat(40))
  lines.push(`ביקורים שטח:     ${pw.length}`)
  lines.push(`ימי עבודה:       ${pw.length}`)
  lines.push(`פועלים מצטבר:   ${totalWorkers}`)
  lines.push('')

  pw.forEach(e => {
    lines.push(`${new Date(e.date).toLocaleDateString('he-IL')}: ${e.work_done.substring(0, 60)}${e.work_done.length > 60 ? '...' : ''}`)
  })

  lines.push('')
  lines.push('ב. ממצאים בתקופה')
  lines.push('-'  .repeat(40))
  lines.push(`ממצאים שנפתחו:   ${pf.length}`)
  lines.push(`קריטיים:         ${pf.filter(f => f.severity === 'critical').length}`)
  lines.push(`תוקנו:           ${pf.filter(f => f.status === 'fixed').length}`)
  lines.push(`פתוחים:          ${pf.filter(f => f.status === 'open').length}`)

  lines.push('')
  lines.push('ג. משימות ומעקב')
  lines.push('-'  .repeat(40))
  lines.push(`משימות שהושלמו:  ${pt.filter(t => t.status === 'done').length}`)
  lines.push(`ממתינות:         ${pt.filter(t => t.status !== 'done').length}`)

  lines.push('')
  lines.push('ד. תקציב')
  lines.push('-'  .repeat(40))
  lines.push(`תקציב כולל:      ₪${project.budget.toLocaleString()}`)
  lines.push(`הוצאה בפועל:     ₪${project.spent.toLocaleString()}`)
  lines.push(`ניצול:           ${Math.round((project.spent / project.budget) * 100)}%`)

  lines.push('')
  lines.push('-'  .repeat(56))
  lines.push('המסמך הופק ע"י מערכת פיקוח בנייה — חיים עזרא הנדסה ניהול ופיקוח')
  lines.push(`${new Date().toLocaleString('he-IL')}`)
  return lines.join('\n')
}

function exportTxt(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = filename; a.click()
}

export default function Reports() {
  const [projectId, setProjectId] = useState('1')
  const [reportType, setReportType] = useState('visit')
  const [preview, setPreview] = useState(null)

  const project = MOCK_PROJECTS.find(p => p.id === projectId) ?? MOCK_PROJECTS[0]

  function generate() {
    let text = ''
    if (reportType === 'visit')     text = buildVisitReport(project, MOCK_WORKLOG, MOCK_FINDINGS)
    if (reportType === 'findings')  text = buildFindingsReport(project, MOCK_FINDINGS)
    if (reportType === 'monthly')   text = buildMonthlyReport(project, MOCK_FINDINGS, MOCK_WORKLOG, MOCK_TASKS)
    setPreview(text)
  }

  function download() {
    if (!preview) return
    const type = REPORT_TYPES.find(r => r.id === reportType)
    const filename = `${type?.label}_${project.name.replace(/[^א-תa-z0-9]/gi, '_')}_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.txt`
    exportTxt(preview, filename)
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">דוחות</h1>
        <p className="text-slate-400 text-sm mt-0.5">הפקת דוחות מקצועיים לייצוא</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Controls */}
        <div className="space-y-4">
          {/* Project */}
          <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
            <label className="text-xs text-slate-400 mb-2 block">פרויקט</label>
            <select value={projectId} onChange={e => { setProjectId(e.target.value); setPreview(null) }}
              className="w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white outline-none">
              {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Report type */}
          <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
            <label className="text-xs text-slate-400 mb-3 block">סוג דוח</label>
            <div className="space-y-2">
              {REPORT_TYPES.map(rt => {
                const Icon = rt.icon
                return (
                  <button key={rt.id} onClick={() => { setReportType(rt.id); setPreview(null) }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-right transition-colors ${
                      reportType === rt.id
                        ? 'bg-green-600/15 border-green-500/40 text-green-400'
                        : 'bg-[#1a1d27] border-[#252840] text-slate-300 hover:border-[#374151]'
                    }`}>
                    <Icon size={16} className="shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{rt.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{rt.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <button onClick={generate}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg font-medium transition-colors">
              <Eye size={15}/> צור תצוגה מקדימה
            </button>
            <button onClick={download} disabled={!preview}
              className="w-full flex items-center justify-center gap-2 bg-[#1e2130] hover:bg-[#252840] disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-sm py-2.5 rounded-lg transition-colors border border-[#374151]">
              <Download size={15}/> הורד TXT
            </button>
          </div>

          {/* Project info */}
          <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">שלב</span><span className="text-white">{project.stage}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">התקדמות</span><span className="text-green-400 font-bold">{project.progress}%</span></div>
            <div className="flex justify-between"><span className="text-slate-500">ממצאים פתוחים</span><span className="text-orange-400">{project.open_findings}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">קבלן</span><span className="text-slate-300">{project.contractor}</span></div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-[#13161f] border border-[#1e2130] rounded-xl h-full min-h-[500px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2130]">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-slate-400"/>
                <span className="text-sm text-white font-medium">
                  {preview ? REPORT_TYPES.find(r => r.id === reportType)?.label : 'תצוגה מקדימה'}
                </span>
              </div>
              {preview && (
                <button onClick={download} className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
                  <Download size={12}/> הורד
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {preview ? (
                <pre className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{preview}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-slate-600">
                  <FileText size={48} className="opacity-30"/>
                  <div>
                    <p className="text-sm text-slate-500">בחר פרויקט וסוג דוח</p>
                    <p className="text-xs text-slate-600 mt-1">לחץ "צור תצוגה מקדימה" להפקת הדוח</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
