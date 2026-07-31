import { MOCK_PROJECTS } from '../lib/mock'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

const ITEMS = [
  { category: 'עפר ויסודות', budget: 420000, spent: 418000, status: 'done' },
  { category: 'שלד בטון', budget: 1800000, spent: 1200000, status: 'active' },
  { category: 'קירות חוץ', budget: 380000, spent: 146000, status: 'active' },
  { category: 'גג ואיטום', budget: 210000, spent: 0, status: 'pending' },
  { category: 'טיח ריצוף', budget: 650000, spent: 0, status: 'pending' },
  { category: 'אינסטלציה', budget: 280000, spent: 0, status: 'pending' },
  { category: 'חשמל', budget: 220000, spent: 0, status: 'pending' },
  { category: 'גמר ונגרות', budget: 240000, spent: 0, status: 'pending' },
]

const STATUS_COLOR = {
  done: 'text-green-400',
  active: 'text-blue-400',
  pending: 'text-slate-500',
}
const STATUS_LABEL = { done: 'הושלם', active: 'בביצוע', pending: 'טרם החל' }

export default function Budget() {
  const project = MOCK_PROJECTS[0]
  const totalBudget = ITEMS.reduce((s, i) => s + i.budget, 0)
  const totalSpent = ITEMS.reduce((s, i) => s + i.spent, 0)
  const pct = Math.round((totalSpent / totalBudget) * 100)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">תקציב — {project.name}</h1>
        <p className="text-slate-400 text-sm mt-0.5">מעקב הוצאות לפי קטגוריה</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'תקציב כולל', value: `₪${totalBudget.toLocaleString()}`, icon: DollarSign, color: 'text-blue-400' },
          { label: 'הוצאה בפועל', value: `₪${totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'text-orange-400' },
          { label: 'יתרה', value: `₪${(totalBudget - totalSpent).toLocaleString()}`, icon: TrendingDown, color: 'text-green-400' },
          { label: 'ניצול', value: `${pct}%`, icon: AlertCircle, color: pct > 80 ? 'text-red-400' : 'text-slate-400' },
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
          <span className="text-white font-medium">ניצול תקציב כולל</span>
          <span className="text-slate-400">{pct}%</span>
        </div>
        <div className="h-3 bg-[#1e2130] rounded-full overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Line items */}
      <div className="bg-[#13161f] border border-[#1e2130] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2130]">
              {['קטגוריה', 'תקציב', 'הוצאה', 'יתרה', '% ניצול', 'סטטוס'].map(h => (
                <th key={h} className="text-right text-slate-500 font-medium px-4 py-3 text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((item, i) => {
              const itemPct = item.budget > 0 ? Math.round((item.spent / item.budget) * 100) : 0
              const remainder = item.budget - item.spent
              return (
                <tr key={i} className="border-b border-[#1e2130]/50">
                  <td className="px-4 py-3 text-white font-medium">{item.category}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">₪{item.budget.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">₪{item.spent.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-mono ${remainder < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    ₪{remainder.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#1e2130] rounded-full">
                        <div
                          className={`h-1.5 rounded-full ${itemPct > 90 ? 'bg-red-500' : itemPct > 0 ? 'bg-green-500' : 'bg-transparent'}`}
                          style={{ width: `${Math.min(itemPct, 100)}%` }}
                        />
                      </div>
                      <span className="text-slate-500 text-xs">{itemPct}%</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-xs ${STATUS_COLOR[item.status]}`}>
                    {STATUS_LABEL[item.status]}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
