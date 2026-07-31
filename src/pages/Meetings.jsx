import { useState } from 'react'
import { Plus, X, Download, Users, Calendar, MapPin, CheckSquare, Clock, ChevronDown, ChevronRight, Printer } from 'lucide-react'

const INIT_MEETINGS = [
  {
    id: '1',
    date: '2025-07-29',
    time: '10:00',
    project: 'פרויקט רמות - בניין A',
    subject: 'סיכום שבועי — שלב שלד קומה 3',
    location: 'משרד הקבלן באתר',
    participants: ['חיים עזרא (מפקח)', 'אבי כהן (מנהל עבודה)', 'שלמה לוי (בעל בית)', 'יוסי גולן (מהנדס קונסטרוקציה)'],
    summary: 'נסקרה התקדמות יציקת התקרה קומה 3. הסתיימה ב-100% לפי לוח הזמנים. נדגמו 3 קוביות בטון ונשלחו למעבדה.',
    decisions: [
      'יציקת עמודים קומה 4 תחל ב-5.8.25',
      'ממצא #13 (סדקי טיח) יטופל עד 8.8.25 ע"י קבלן הטיח',
      'בדיקת תוצאות קוביות בטון — עד 7.8.25',
    ],
    action_items: [
      { task: 'קבלת תוצאות קוביות בטון מהמעבדה', responsible: 'חיים עזרא', deadline: '2025-08-07', done: false },
      { task: 'תיאום קבלן טיח לתיקון ממצא #13', responsible: 'אבי כהן', deadline: '2025-08-05', done: false },
      { task: 'הזמנת ברזל לקומה 4', responsible: 'אבי כהן', deadline: '2025-08-02', done: true },
    ],
    next_meeting: '2025-08-05',
  },
]

function badge(text, color) {
  const map = {
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }
  return <span className={`text-xs px-2 py-0.5 rounded border ${map[color]}`}>{text}</span>
}

function NewMeetingModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    project: 'פרויקט רמות - בניין A',
    subject: '',
    location: '',
    participantsRaw: '',
    summary: '',
    decisionsRaw: '',
    next_meeting: '',
  })
  const [actionItems, setActionItems] = useState([{ task: '', responsible: '', deadline: '', done: false }])

  function addAction() { setActionItems(a => [...a, { task: '', responsible: '', deadline: '', done: false }]) }
  function updateAction(i, field, val) {
    setActionItems(a => a.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }

  function save() {
    if (!form.subject.trim()) return
    onSave({
      id: Date.now().toString(),
      ...form,
      participants: form.participantsRaw.split('\n').map(s => s.trim()).filter(Boolean),
      decisions: form.decisionsRaw.split('\n').map(s => s.trim()).filter(Boolean),
      action_items: actionItems.filter(a => a.task.trim()),
    })
    onClose()
  }

  const inp = 'w-full bg-[#1e2130] border border-[#252840] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-green-600'
  const lbl = 'text-xs text-slate-400 mb-1 block'

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#13161f] border border-[#1e2130] rounded-2xl p-6 max-w-2xl w-full my-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-bold">פגישה חדשה</h2>
          <button onClick={onClose}><X size={20} className="text-slate-500 hover:text-white" /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><label className={lbl}>תאריך</label><input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} className={inp} /></div>
            <div><label className={lbl}>שעה</label><input type="time" value={form.time} onChange={e => setForm(f=>({...f,time:e.target.value}))} className={inp} /></div>
            <div><label className={lbl}>פגישה הבאה</label><input type="date" value={form.next_meeting} onChange={e => setForm(f=>({...f,next_meeting:e.target.value}))} className={inp} /></div>
          </div>
          <div><label className={lbl}>נושא הפגישה</label><input value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))} placeholder="סיכום שבועי — שלב ריצוף..." className={inp} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>פרויקט</label><input value={form.project} onChange={e => setForm(f=>({...f,project:e.target.value}))} className={inp} /></div>
            <div><label className={lbl}>מיקום</label><input value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} placeholder="משרד הקבלן / אתר" className={inp} /></div>
          </div>
          <div><label className={lbl}>משתתפים (שורה לכל אחד)</label><textarea rows={3} value={form.participantsRaw} onChange={e => setForm(f=>({...f,participantsRaw:e.target.value}))} placeholder={"חיים עזרא (מפקח)\nאבי כהן (מנהל עבודה)\nשלמה לוי (בעל בית)"} className={inp+' resize-none'} /></div>
          <div><label className={lbl}>סיכום הפגישה</label><textarea rows={4} value={form.summary} onChange={e => setForm(f=>({...f,summary:e.target.value}))} placeholder="תיאור מה הוחלט ומה נדון..." className={inp+' resize-none'} /></div>
          <div><label className={lbl}>החלטות (שורה לכל אחת)</label><textarea rows={3} value={form.decisionsRaw} onChange={e => setForm(f=>({...f,decisionsRaw:e.target.value}))} placeholder={"יציקה תחל ב-5.8\nממצא #13 יטופל עד 8.8"} className={inp+' resize-none'} /></div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={lbl.replace('mb-1','')}>משימות לביצוע</label>
              <button onClick={addAction} className="text-xs text-green-400 hover:text-green-300">+ הוסף</button>
            </div>
            <div className="space-y-2">
              {actionItems.map((a, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <input value={a.task} onChange={e => updateAction(i,'task',e.target.value)} placeholder="משימה" className={inp} />
                  <input value={a.responsible} onChange={e => updateAction(i,'responsible',e.target.value)} placeholder="אחראי" className={inp} />
                  <input type="date" value={a.deadline} onChange={e => updateAction(i,'deadline',e.target.value)} className={inp} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={save} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg font-medium transition-colors">שמור פגישה</button>
          <button onClick={onClose} className="px-5 bg-[#1e2130] hover:bg-[#252840] text-slate-300 text-sm py-2.5 rounded-lg transition-colors">ביטול</button>
        </div>
      </div>
    </div>
  )
}

function MeetingCard({ meeting, onExport }) {
  const [open, setOpen] = useState(false)
  const pending = meeting.action_items.filter(a => !a.done).length
  const done = meeting.action_items.filter(a => a.done).length

  return (
    <div className="bg-[#13161f] border border-[#1e2130] rounded-xl overflow-hidden">
      {/* Header */}
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#1a1d27] transition-colors text-right">
        <div className="bg-[#1e2130] rounded-xl px-3 py-2 text-center min-w-[56px] shrink-0">
          <div className="text-xs text-slate-500">{new Date(meeting.date).toLocaleDateString('he-IL',{weekday:'short'})}</div>
          <div className="text-white font-bold text-lg leading-tight">{new Date(meeting.date).getDate()}</div>
          <div className="text-xs text-slate-500">{new Date(meeting.date).toLocaleDateString('he-IL',{month:'short'})}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm">{meeting.subject}</div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><MapPin size={11}/>{meeting.location}</span>
            <span className="flex items-center gap-1"><Users size={11}/>{meeting.participants.length} משתתפים</span>
            <span className="flex items-center gap-1"><Clock size={11}/>{meeting.time}</span>
          </div>
          <div className="text-xs text-slate-600 mt-0.5">{meeting.project}</div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {pending > 0 && badge(`${pending} ממתינות`, 'yellow')}
          {done > 0 && badge(`${done} הושלמו`, 'green')}
          {open ? <ChevronDown size={16} className="text-slate-500"/> : <ChevronRight size={16} className="text-slate-500"/>}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="border-t border-[#1e2130] px-5 py-4 space-y-5">
          {/* Participants */}
          <div>
            <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-2">משתתפים</h4>
            <div className="flex flex-wrap gap-2">
              {meeting.participants.map((p,i) => (
                <span key={i} className="text-xs bg-[#1e2130] text-slate-300 px-2.5 py-1 rounded-full border border-[#252840]">{p}</span>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-2">סיכום</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{meeting.summary}</p>
          </div>

          {/* Decisions */}
          {meeting.decisions.length > 0 && (
            <div>
              <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-2">החלטות</h4>
              <ul className="space-y-1.5">
                {meeting.decisions.map((d,i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action items */}
          {meeting.action_items.length > 0 && (
            <div>
              <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-2">משימות לביצוע</h4>
              <div className="space-y-2">
                {meeting.action_items.map((a,i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${a.done ? 'bg-green-950/20 border-green-900/30' : 'bg-[#1a1d27] border-[#252840]'}`}>
                    <CheckSquare size={15} className={a.done ? 'text-green-400' : 'text-slate-500'} />
                    <span className={`flex-1 text-sm ${a.done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{a.task}</span>
                    <span className="text-xs text-blue-400">{a.responsible}</span>
                    <span className="text-xs text-slate-500">{a.deadline ? new Date(a.deadline).toLocaleDateString('he-IL') : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next meeting + export */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1e2130]">
            <div className="text-sm text-slate-400">
              {meeting.next_meeting && (
                <span>פגישה הבאה: <span className="text-white font-medium">{new Date(meeting.next_meeting).toLocaleDateString('he-IL')}</span></span>
              )}
            </div>
            <button
              onClick={() => onExport(meeting)}
              className="flex items-center gap-2 text-sm bg-[#1e2130] hover:bg-[#252840] text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-[#374151] transition-colors"
            >
              <Download size={14}/>
              ייצא סיכום
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function exportMeeting(meeting) {
  const lines = [
    `סיכום פגישה — ${meeting.subject}`,
    `${'='.repeat(50)}`,
    ``,
    `תאריך: ${new Date(meeting.date).toLocaleDateString('he-IL')}   שעה: ${meeting.time}`,
    `פרויקט: ${meeting.project}`,
    `מיקום: ${meeting.location}`,
    ``,
    `משתתפים:`,
    ...meeting.participants.map(p => `  • ${p}`),
    ``,
    `סיכום הפגישה:`,
    meeting.summary,
    ``,
    `החלטות:`,
    ...meeting.decisions.map((d,i) => `  ${i+1}. ${d}`),
    ``,
    `משימות לביצוע:`,
    ...meeting.action_items.map(a => `  [ ] ${a.task} — אחראי: ${a.responsible}   עד: ${a.deadline ? new Date(a.deadline).toLocaleDateString('he-IL') : '-'}`),
    ``,
    meeting.next_meeting ? `פגישה הבאה: ${new Date(meeting.next_meeting).toLocaleDateString('he-IL')}` : '',
    ``,
    `נערך ע"י: חיים עזרא, מפקח בנייה`,
    `תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}`,
  ]

  const content = lines.join('\n')
  const blob = new Blob(['﻿' + content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const dateStr = meeting.date.replace(/-/g,'')
  a.href = url
  a.download = `פגישה_${dateStr}_${meeting.subject.slice(0,20)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Meetings() {
  const [meetings, setMeetings] = useState(INIT_MEETINGS)
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState('all')

  function addMeeting(m) { setMeetings(prev => [m, ...prev]) }

  const today = new Date().toISOString().split('T')[0]
  const filtered = meetings.filter(m => {
    if (filter === 'upcoming') return m.date >= today
    if (filter === 'past') return m.date < today
    return true
  })

  const totalPending = meetings.reduce((s, m) => s + m.action_items.filter(a => !a.done).length, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">פגישות וסיכומים</h1>
          <p className="text-slate-400 text-sm mt-0.5">{meetings.length} פגישות · {totalPending} משימות פתוחות</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16}/>
          פגישה חדשה
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {[['all','הכל'],['upcoming','הבאות'],['past','עבר']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${filter===v ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-[#13161f] text-slate-400 border-[#1e2130] hover:border-[#374151]'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(m => (
          <MeetingCard key={m.id} meeting={m} onExport={exportMeeting} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">אין פגישות להצגה</div>
        )}
      </div>

      {showNew && <NewMeetingModal onClose={() => setShowNew(false)} onSave={addMeeting} />}
    </div>
  )
}
