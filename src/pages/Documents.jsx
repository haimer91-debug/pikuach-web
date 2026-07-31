import { useState } from 'react'
import { FileText, Upload, Search, FolderOpen, File, Eye, Download } from 'lucide-react'

const MOCK_DOCS = [
  { id: '1', name: 'תוכנית קומה 3 — שלד.pdf', type: 'pdf', size: '2.4 MB', date: '2025-07-15', category: 'תוכניות' },
  { id: '2', name: 'מפרט בטון — ת"י 118.pdf', type: 'pdf', size: '890 KB', date: '2025-07-10', category: 'מפרטים' },
  { id: '3', name: 'חוזה קבלן ראשי.docx', type: 'doc', size: '145 KB', date: '2025-06-01', category: 'חוזים' },
  { id: '4', name: 'תוכנית קומה 2 — חשמל.pdf', type: 'pdf', size: '1.8 MB', date: '2025-06-28', category: 'תוכניות' },
  { id: '5', name: 'דוח בדיקת קרקע.pdf', type: 'pdf', size: '3.2 MB', date: '2025-05-12', category: 'דוחות' },
  { id: '6', name: 'לוח זמנים ראשי.xlsx', type: 'xlsx', size: '220 KB', date: '2025-07-01', category: 'לוחות זמנים' },
]

const CATEGORIES = ['הכל', 'תוכניות', 'מפרטים', 'חוזים', 'דוחות', 'לוחות זמנים']

const TYPE_ICON_COLOR = {
  pdf: 'text-red-400',
  doc: 'text-blue-400',
  xlsx: 'text-green-400',
}

export default function Documents() {
  const [category, setCategory] = useState('הכל')
  const [search, setSearch] = useState('')

  const docs = MOCK_DOCS.filter(d => {
    const matchCat = category === 'הכל' || d.category === category
    const matchSearch = !search || d.name.includes(search)
    return matchCat && matchSearch
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">מסמכים</h1>
          <p className="text-slate-400 text-sm mt-0.5">תוכניות, חוזים ומפרטים</p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Upload size={16} />
          העלה מסמך
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 bg-[#13161f] border border-[#1e2130] rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search size={14} className="text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש מסמכים..."
            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none flex-1"
          />
        </div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
              category === cat
                ? 'bg-green-600/20 text-green-400 border-green-500/30'
                : 'bg-[#13161f] text-slate-400 border-[#1e2130] hover:border-[#374151]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-[#13161f] border border-[#1e2130] rounded-xl overflow-hidden">
        {docs.map(doc => (
          <div key={doc.id} className="flex items-center gap-4 px-4 py-3 border-b border-[#1e2130]/50 hover:bg-[#1e2130]/30 transition-colors group">
            <File size={20} className={TYPE_ICON_COLOR[doc.type] ?? 'text-slate-400'} />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate">{doc.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{doc.category} · {doc.size} · {new Date(doc.date).toLocaleDateString('he-IL')}</div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-8 h-8 bg-[#252840] rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <Eye size={14} />
              </button>
              <button className="w-8 h-8 bg-[#252840] rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <Download size={14} />
              </button>
            </div>
          </div>
        ))}
        {docs.length === 0 && (
          <div className="text-center py-12 text-slate-500">אין מסמכים תואמים</div>
        )}
      </div>
    </div>
  )
}
