import { useState } from 'react'
import { MOCK_PROJECTS } from '../lib/mock'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Download } from 'lucide-react'

const PROJECT_ITEMS = {
  '1': [
    { category: 'עפר ויסודות',    budget: 420000,  spent: 418000,  status: 'done' },
    { category: 'שלד בטון',       budget: 1800000, spent: 1200000, status: 'active' },
    { category: 'קירות חוץ',      budget: 380000,  spent: 146000,  status: 'active' },
    { category: 'גג ואיטום',      budget: 210000,  spent: 0,       status: 'pending' },
    { category: 'טיח וריצוף',     budget: 650000,  spent: 0,       status: 'pending' },
    { category: 'אינסטלציה',      budget: 280000,  spent: 0,       status: 'pending' },
    { category: 'חשמל',           budget: 220000,  spent: 0,       status: 'pending' },
    { category: 'גמר ונגרות',     budget: 240000,  spent: 0,       status: 'pending' },
  ],
  '2': [
    { category: 'עפר ויסודות',    budget: 180000,  spent: 180000,  status: 'done' },
    { category: 'שלד',             budget: 420000,  spent: 420000,  status: 'done' },
    { category: 'גמר פנים',       budget: 680000,  spent: 520000,  status: 'active' },
    { category: 'מטבח ואמבטיה',   budget: 320000,  spent: 210000,  status: 'active' },
    { category: 'חשמל ואינסטלציה', budget: 200000, spent: 74000,   status: 'active' },
  ],
  '3': [
    { category: 'תכנון ורישוי',   budget: 350000,  spent: 350000,  status: 'done' },
    { category: 'עפר ויסודות',    budget: 1200000, spent: 980000,  status: 'active' },
    { category: 'שלד בטון',       budget: 3500000, spent: 855000,  status: 'active' },
    { category: 'קירות ועטיפה',   budget: 1800000, spent: 0,       status: 'pending' },
    { category: 'מערכות (MEP)',   budget: 1200000, spent: 0,       status: 'pending' },
    { category: 'גמר',             budget: 1450000, spent: 0,       status: 'pending' },
  ],
}

const STATUS_COLOR = { done: 'text-green-400', active: 'text-blue-400', pending: 'text-slate-500' }
const STATUS_LABEL = { done: 'הושלם', active: 'בביצוע', pending: 'טרם החל' }

function exportBudget(project, items, total, spent) {
  const rows = [['קטגוריה','תקציב','הוצאה','יתרה','% ניצול','סטטוס']]
  items.forEach(i => rows.push([i.category, `₪${i.budget.toLocaleString()}`, `₪${i.spent.toLocaleString()}`,
    `₪${(i.budget-i.spent).toLocaleString()}`, `${Math.round((i.spent/i.budget)*100||0)}%`, STATUS_LABEL[i.status]]))
  rows.push(['סה"כ', `₪${total.toLocaleString()}`, `₪${spent.toLocaleString()}`, `₪${(total-spent).toLocaleString()}`,
    `${Math.round((spent/total)*100)}%`, ''])
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿'+csv], {type:'text/csv;charset=utf-8'})
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = `תקציב_${project.name.replace(/[^א-ת\w]/g,'_')}.csv`; a.click()
}

export default function Budget() {
  const [projectId, setProjectId] = useState('1')
  const project = MOCK_PROJECTS.find(p => p.id === projectId) ?? MOCK_PROJECTS[0]
  const items = PROJECT_ITEMS[projectId] ?? []

  const totalBudget = items.reduce((s, i) => s + i.budget, 0)
  const totalSpent  = items.reduce((s, i) => s + i.spent, 0)
  const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">תקציב</h1>
          <p className="text-slate-400 text-sm mt-0.5">מעקב הוצאות לפי קטגוריה</p>
        </div>
        <div className="flex gap-2 items-center">
          <select value={projectId} onChange={e => setProjectId(e.target.value)}
            className="bg-[#1e2130] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white outline-none">
            {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={() => exportBudget(project, items, totalBudget, totalSpent)}
            className="flex items-center gap-1.5 bg-[#1e2130] hover:bg-[#252840] border border-[#374151] text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg transition-colors">
            <Download size={14}/> ייצא
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'תקציב כולל',  value: `₪${totalBudget.toLocaleString()}`,         icon: DollarSign,  color: 'text-blue-400' },
          { label: 'הוצאה בפועל', value: `₪${totalSpent.toLocaleString()}`,           icon: TrendingUp,  color: 'text-orange-400' },
          { label: 'יתרה',        value: `₪${(totalBudget-totalSpent).toLocaleString()}`, icon: TrendingDown, color: (totalBudget-totalSpent) < 0 ? 'text-red-400' : 'text-green-400' },
          { label: 'ניצול',       value: `${pct}%`,                                   icon: AlertCircle, color: pct > 80 ? 'text-red-400' : 'text-slate-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} className={color} />
              <span className="text-slate-400 text-xs">{label}</span>
            </div>
            <div className={`text-lg font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Overall bar */}
      <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white font-medium">{project.name} — ניצול תקציב</span>
          <span className={`font-bold ${pct > 90 ? 'text-red-400' : pct > 70 ? 'text-yellow-400' : 'text-green-400'}`}>{pct}%</span>
        </div>
        <div className="h-3 bg-[#1e2130] rounded-full overflow-hidden">
          <div className={`h-3 rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>₪0</span>
          <span>₪{totalBudget.toLocaleString()}</span>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-[#13161f] border border-[#1e2130] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2130]">
              {['קטגוריה','תקציב','הוצאה','יתרה','% ניצול','סטטוס'].map(h => (
                <th key={h} className="text-right text-slate-500 font-medium px-4 py-3 text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const itemPct = item.budget > 0 ? Math.round((item.spent / item.budget) * 100) : 0
              const remainder = item.budget - item.spent
              const overBudget = remainder < 0
              return (
                <tr key={i} className="border-b border-[#1e2130]/50 hover:bg-[#1a1d27] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{item.category}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono tabular-nums">₪{item.budget.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono tabular-nums">₪{item.spent.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-mono tabular-nums ${overBudget ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                    {overBudget ? '-' : ''}₪{Math.abs(remainder).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-[#1e2130] rounded-full overflow-hidden">
                        <div className={`h-1.5 rounded-full ${itemPct > 90 ? 'bg-red-500' : itemPct > 0 ? 'bg-green-500' : 'bg-transparent'}`}
                          style={{ width: `${Math.min(itemPct, 100)}%` }} />
                      </div>
                      <span className="text-slate-500 text-xs">{itemPct}%</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-xs ${STATUS_COLOR[item.status]}`}>{STATUS_LABEL[item.status]}</td>
                </tr>
              )
            })}
            <tr className="bg-[#1a1d27]">
              <td className="px-4 py-3 text-white font-bold">סה"כ</td>
              <td className="px-4 py-3 text-blue-400 font-bold font-mono tabular-nums">₪{totalBudget.toLocaleString()}</td>
              <td className="px-4 py-3 text-orange-400 font-bold font-mono tabular-nums">₪{totalSpent.toLocaleString()}</td>
              <td className={`px-4 py-3 font-bold font-mono tabular-nums ${(totalBudget-totalSpent) < 0 ? 'text-red-400' : 'text-green-400'}`}>₪{(totalBudget-totalSpent).toLocaleString()}</td>
              <td className="px-4 py-3"><span className="text-white font-bold">{pct}%</span></td>
              <td className="px-4 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
