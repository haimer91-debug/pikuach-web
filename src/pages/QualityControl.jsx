import { useState, useMemo } from 'react'
import { QC_CATEGORIES } from '../lib/qc_data'
import { useLocalStorage } from '../lib/useLocalStorage'
import {
  ChevronDown, ChevronRight, CheckCircle2, XCircle,
  Minus, Search, Download, RotateCcw, Plus, X, Building2, Home
} from 'lucide-react'

const INIT_STATE = () => {
  const s = {}
  QC_CATEGORIES.forEach((cat, ci) => {
    cat.items.forEach((_, ii) => { s[`${ci}-${ii}`] = null })
  })
  return s
}

// Default scopes
const DEFAULT_SCOPES = [{ id: 'building', label: 'כלל הבניין', type: 'building' }]

function ScopeBar({ scopes, current, onSelect, onAdd, onRemove }) {
  const [adding, setAdding] = useState(null) // 'apt' | 'zone'
  const [inputVal, setInputVal] = useState('')

  function confirmAdd() {
    const val = inputVal.trim()
    if (!val) return
    const id = `${adding}-${val}`
    const label = adding === 'apt' ? `דירה ${val}` : val
    onAdd({ id, label, type: adding })
    setAdding(null)
    setInputVal('')
  }

  return (
    <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-3 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 shrink-0">מיקום:</span>

        {scopes.map(s => (
          <div key={s.id} className="relative group flex items-center">
            <button
              onClick={() => onSelect(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                current === s.id
                  ? 'bg-green-600/20 text-green-400 border-green-500/40'
                  : 'bg-[#1e2130] text-slate-400 border-[#374151] hover:border-slate-500'
              }`}
            >
              {s.type === 'building' ? <Building2 size={12} /> : <Home size={12} />}
              {s.label}
            </button>
            {s.id !== 'building' && (
              <button
                onClick={() => onRemove(s.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-700 text-slate-400 hover:bg-red-700 hover:text-white hidden group-hover:flex items-center justify-center transition-colors"
              >
                <X size={9} />
              </button>
            )}
          </div>
        ))}

        {/* Add buttons */}
        {!adding && (
          <div className="flex gap-1.5">
            <button
              onClick={() => { setAdding('apt'); setInputVal('') }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 border border-dashed border-[#374151] hover:border-blue-500/50 hover:text-blue-400 transition-colors"
            >
              <Plus size={11} /> דירה
            </button>
            <button
              onClick={() => { setAdding('zone'); setInputVal('') }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 border border-dashed border-[#374151] hover:border-purple-500/50 hover:text-purple-400 transition-colors"
            >
              <Plus size={11} /> אזור
            </button>
          </div>
        )}

        {/* Inline input */}
        {adding && (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setAdding(null) }}
              placeholder={adding === 'apt' ? 'מספר דירה...' : 'שם אזור...'}
              className="bg-[#1e2130] border border-[#374151] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none w-32 focus:border-green-500"
            />
            <button onClick={confirmAdd} className="px-2.5 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">הוסף</button>
            <button onClick={() => setAdding(null)} className="px-2.5 py-1.5 text-slate-400 text-xs hover:text-white">ביטול</button>
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryCard({ cat, catIdx, state, onToggle, open, onOpenToggle }) {
  const total = cat.items.length
  const done  = cat.items.filter((_, ii) => state[`${catIdx}-${ii}`] !== null).length
  const ok    = cat.items.filter((_, ii) => state[`${catIdx}-${ii}`] === 'ok').length
  const fail  = cat.items.filter((_, ii) => state[`${catIdx}-${ii}`] === 'fail').length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  const groups = {}
  cat.items.forEach((item, ii) => {
    const key = item.subStage || '_'
    if (!groups[key]) groups[key] = []
    groups[key].push({ ...item, ii })
  })

  return (
    <div className="bg-[#13161f] border border-[#1e2130] rounded-xl overflow-hidden">
      <button
        onClick={onOpenToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-[#1a1d27] transition-colors"
      >
        {open ? <ChevronDown size={16} className="text-slate-500 shrink-0" /> : <ChevronRight size={16} className="text-slate-500 shrink-0" />}
        <span className="flex-1 text-white font-semibold text-sm">{cat.stage}</span>
        <div className="flex items-center gap-3 text-xs">
          {fail > 0 && <span className="text-red-400">{fail} ❌</span>}
          {ok > 0   && <span className="text-green-400">{ok} ✓</span>}
          <span className="text-slate-500">{done}/{total}</span>
          <div className="w-20 h-1.5 bg-[#1e2130] rounded-full overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all ${fail > 0 ? 'bg-red-500' : pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`font-mono w-8 text-left ${pct === 100 ? 'text-green-400' : 'text-slate-400'}`}>{pct}%</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#1e2130]">
          {Object.entries(groups).map(([subStage, items]) => (
            <div key={subStage}>
              {subStage !== '_' && (
                <div className="px-4 py-1.5 bg-[#1a1d27] text-xs text-blue-400 font-medium border-b border-[#1e2130]">
                  {subStage}
                </div>
              )}
              {items.map(({ question, ii }) => {
                const key = `${catIdx}-${ii}`
                const status = state[key]
                return (
                  <div
                    key={ii}
                    className={`flex items-center gap-3 px-4 py-2.5 border-b border-[#1e2130]/40 hover:bg-[#1a1d27]/50 transition-colors ${
                      status === 'fail' ? 'bg-red-950/10' : status === 'ok' ? 'bg-green-950/10' : ''
                    }`}
                  >
                    <span className="flex-1 text-sm text-slate-300 leading-snug">{question}</span>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => onToggle(key, 'ok')}
                        className={`px-3 py-1 rounded text-xs border transition-all ${
                          status === 'ok'
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-transparent border-[#374151] text-slate-500 hover:border-green-600 hover:text-green-400'
                        }`}
                      >תקין</button>
                      <button
                        onClick={() => onToggle(key, 'fail')}
                        className={`px-3 py-1 rounded text-xs border transition-all ${
                          status === 'fail'
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-transparent border-[#374151] text-slate-500 hover:border-red-600 hover:text-red-400'
                        }`}
                      >לא תקין</button>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function QualityControl() {
  const [scopes, setScopes]           = useLocalStorage('pikuach_qc_scopes', DEFAULT_SCOPES)
  const [currentScopeId, setCurrentScopeId] = useState('building')
  const [allStates, setAllStates]     = useLocalStorage('pikuach_qc_states', { building: INIT_STATE() })
  const [openCats, setOpenCats]       = useState({ 0: true })
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')

  const state = allStates[currentScopeId] || INIT_STATE()

  function toggle(key, val) {
    setAllStates(prev => ({
      ...prev,
      [currentScopeId]: { ...prev[currentScopeId], [key]: prev[currentScopeId][key] === val ? null : val }
    }))
  }

  function addScope(scope) {
    setScopes(prev => [...prev, scope])
    setAllStates(prev => ({ ...prev, [scope.id]: INIT_STATE() }))
    setCurrentScopeId(scope.id)
  }

  function removeScope(id) {
    setScopes(prev => prev.filter(s => s.id !== id))
    setAllStates(prev => { const n = { ...prev }; delete n[id]; return n })
    if (currentScopeId === id) setCurrentScopeId('building')
  }

  function toggleCat(ci) { setOpenCats(o => ({ ...o, [ci]: !o[ci] })) }
  function expandAll()    { const o = {}; QC_CATEGORIES.forEach((_, i) => { o[i] = true  }); setOpenCats(o) }
  function collapseAll()  { const o = {}; QC_CATEGORIES.forEach((_, i) => { o[i] = false }); setOpenCats(o) }

  function reset() {
    const scope = scopes.find(s => s.id === currentScopeId)
    if (!confirm(`לאפס את כל הבדיקות של "${scope?.label}"?`)) return
    setAllStates(prev => ({ ...prev, [currentScopeId]: INIT_STATE() }))
  }

  const totalItems = useMemo(() => QC_CATEGORIES.reduce((s, c) => s + c.items.length, 0), [])
  const doneItems  = Object.values(state).filter(v => v !== null).length
  const failItems  = Object.values(state).filter(v => v === 'fail').length
  const okItems    = Object.values(state).filter(v => v === 'ok').length
  const globalPct  = Math.round((doneItems / totalItems) * 100)

  const visible = QC_CATEGORIES.map((cat, ci) => {
    if (!search && filter === 'all') return { cat, ci, show: true }
    const filteredItems = cat.items.filter((item, ii) => {
      const key = `${ci}-${ii}`
      const matchSearch = !search || item.question.includes(search)
      const matchFilter =
        filter === 'all' ? true :
        filter === 'pending' ? state[key] === null :
        filter === 'fail' ? state[key] === 'fail' : true
      return matchSearch && matchFilter
    })
    return { cat: { ...cat, items: filteredItems }, ci, show: filteredItems.length > 0 }
  })

  function exportCSV() {
    const scope = scopes.find(s => s.id === currentScopeId)
    const rows = [['מיקום', 'קטגוריה', 'שלב משנה', 'שאלה', 'סטטוס']]
    QC_CATEGORIES.forEach((cat, ci) => {
      cat.items.forEach((item, ii) => {
        const status = state[`${ci}-${ii}`]
        rows.push([
          scope?.label,
          cat.stage,
          item.subStage,
          item.question,
          status === 'ok' ? 'תקין' : status === 'fail' ? 'לא תקין' : 'לא נבדק'
        ])
      })
    })
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `בקרת_איכות_${scope?.label || ''}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const currentScope = scopes.find(s => s.id === currentScopeId)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">בקרת איכות</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {QC_CATEGORIES.length} קטגוריות · {totalItems} סעיפי בדיקה
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="flex items-center gap-1.5 bg-[#1e2130] hover:bg-[#252840] border border-[#374151] text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg transition-colors">
            <RotateCcw size={14} /> אפס
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-lg transition-colors">
            <Download size={14} /> ייצא CSV
          </button>
        </div>
      </div>

      {/* Scope selector */}
      <ScopeBar
        scopes={scopes}
        current={currentScopeId}
        onSelect={setCurrentScopeId}
        onAdd={addScope}
        onRemove={removeScope}
      />

      {/* Global progress bar */}
      <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">התקדמות</span>
            <span className="text-xs text-slate-500 bg-[#1e2130] px-2 py-0.5 rounded-full">
              {currentScope?.label}
            </span>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-green-400">{okItems} תקין</span>
            <span className="text-red-400">{failItems} לא תקין</span>
            <span className="text-slate-500">{totalItems - doneItems} טרם נבדק</span>
          </div>
        </div>
        <div className="h-3 bg-[#1e2130] rounded-full overflow-hidden flex">
          <div className="h-3 bg-green-500 transition-all" style={{ width: `${(okItems / totalItems) * 100}%` }} />
          <div className="h-3 bg-red-500 transition-all"   style={{ width: `${(failItems / totalItems) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0%</span>
          <span className={`font-semibold ${globalPct === 100 ? 'text-green-400' : 'text-white'}`}>{globalPct}% הושלם</span>
          <span>100%</span>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-[#13161f] border border-[#1e2130] rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש סעיף..."
            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none flex-1"
          />
        </div>
        {[['all', 'הכל'], ['pending', 'טרם נבדק'], ['fail', 'לא תקין']].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
              filter === val
                ? 'bg-green-600/20 text-green-400 border-green-500/30'
                : 'bg-[#13161f] text-slate-400 border-[#1e2130] hover:border-[#374151]'
            }`}
          >{lbl}</button>
        ))}
        <button onClick={expandAll}   className="text-xs text-slate-500 hover:text-white px-2">פתח הכל</button>
        <button onClick={collapseAll} className="text-xs text-slate-500 hover:text-white px-2">סגור הכל</button>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {visible.filter(v => v.show).map(({ cat, ci }) => (
          <CategoryCard
            key={`${currentScopeId}-${ci}`}
            cat={cat}
            catIdx={ci}
            state={state}
            onToggle={toggle}
            open={!!openCats[ci]}
            onOpenToggle={() => toggleCat(ci)}
          />
        ))}
      </div>
    </div>
  )
}
