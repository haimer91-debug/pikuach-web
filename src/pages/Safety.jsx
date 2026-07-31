import { Shield, AlertTriangle, CheckCircle2, XCircle, ClipboardList } from 'lucide-react'

const CHECKLIST = [
  { item: 'ציוד מגן אישי (קסדה, נעלי בטיחות)', status: 'ok' },
  { item: 'גידור אתר ושילוט ביטחוני', status: 'ok' },
  { item: 'גישה מאובטחת לגג ועבודה בגובה', status: 'warning' },
  { item: 'עמדת כיבוי אש', status: 'ok' },
  { item: 'רופא / חובש באתר', status: 'fail' },
  { item: 'תיק עזרה ראשונה מעודכן', status: 'ok' },
  { item: 'בדיקת ציוד הרמה', status: 'ok' },
  { item: 'פרוטוקול חירום ופינוי', status: 'warning' },
]

const STATUS_ICON = {
  ok: CheckCircle2,
  warning: AlertTriangle,
  fail: XCircle,
}
const STATUS_COLOR = {
  ok: 'text-green-400',
  warning: 'text-yellow-400',
  fail: 'text-red-400',
}
const STATUS_LABEL = { ok: 'תקין', warning: 'דרוש טיפול', fail: 'דרושה פעולה דחופה' }

const INCIDENTS = [
  {
    id: '1',
    date: '2025-07-20',
    type: 'כמעט ואירע',
    description: 'פועל החליק על רצפה רטובה בקומה 2 — ללא פציעה',
    action: 'הוצב שלט אזהרה ונוסף מחצלת',
    status: 'closed',
  },
]

export default function Safety() {
  const okCount = CHECKLIST.filter(c => c.status === 'ok').length
  const warnCount = CHECKLIST.filter(c => c.status === 'warning').length
  const failCount = CHECKLIST.filter(c => c.status === 'fail').length

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">בטיחות</h1>
        <p className="text-slate-400 text-sm mt-0.5">מעקב בטיחות ורשימת תיוג</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4 text-center">
          <CheckCircle2 size={24} className="text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">{okCount}</div>
          <div className="text-slate-500 text-xs">תקין</div>
        </div>
        <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4 text-center">
          <AlertTriangle size={24} className="text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-400">{warnCount}</div>
          <div className="text-slate-500 text-xs">דרוש טיפול</div>
        </div>
        <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4 text-center">
          <XCircle size={24} className="text-red-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-400">{failCount}</div>
          <div className="text-slate-500 text-xs">דחוף</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Checklist */}
        <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={16} className="text-slate-400" />
            <h2 className="text-white font-semibold">רשימת בטיחות</h2>
          </div>
          <div className="space-y-2">
            {CHECKLIST.map((item, i) => {
              const Icon = STATUS_ICON[item.status]
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1e2130]/50">
                  <Icon size={16} className={STATUS_COLOR[item.status]} />
                  <span className="flex-1 text-sm text-slate-300">{item.item}</span>
                  <span className={`text-xs ${STATUS_COLOR[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Incidents */}
        <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-slate-400" />
              <h2 className="text-white font-semibold">אירועי בטיחות</h2>
            </div>
            <button className="text-green-400 text-sm hover:text-green-300">+ דיווח חדש</button>
          </div>
          {INCIDENTS.map(inc => (
            <div key={inc.id} className="bg-[#1e2130] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-400 text-sm font-medium">{inc.type}</span>
                <span className="text-slate-500 text-xs">{new Date(inc.date).toLocaleDateString('he-IL')}</span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{inc.description}</p>
              <div className="text-xs text-green-400">פעולה: {inc.action}</div>
            </div>
          ))}
          {INCIDENTS.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">לא דווחו אירועי בטיחות</div>
          )}
        </div>
      </div>
    </div>
  )
}
