import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FolderOpen, Camera, BookOpen,
  CheckSquare, DollarSign, FileText, Shield,
  ChevronLeft, ChevronRight, MessageSquare, Bell,
  HardHat, ClipboardCheck, Users
} from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'לוח בקרה' },
  { to: '/projects', icon: FolderOpen, label: 'פרויקטים' },
  { to: '/findings', icon: Camera, label: 'ממצאים' },
  { to: '/qc', icon: ClipboardCheck, label: 'בקרת איכות' },
  { to: '/worklog', icon: BookOpen, label: 'יומן עבודה' },
  { to: '/meetings', icon: Users, label: 'פגישות' },
  { to: '/tasks', icon: CheckSquare, label: 'משימות' },
  { to: '/documents', icon: FileText, label: 'תוכניות ומסמכים' },
  { to: '/budget', icon: DollarSign, label: 'תקציב' },
  { to: '/safety', icon: Shield, label: 'בטיחות' },
  { to: '/ai', icon: MessageSquare, label: 'מוח הבנייה' },
]

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-l border-[#1e2130] bg-[#13161f] transition-all duration-200 ${
          collapsed ? 'w-[60px]' : 'w-[220px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-[#1e2130] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
            <HardHat size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-sm text-white whitespace-nowrap">פיקוח בנייה</div>
              <div className="text-xs text-slate-500 whitespace-nowrap">חיים עזרא</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-0.5 text-sm transition-colors ${
                  active
                    ? 'bg-green-600/20 text-green-400'
                    : 'text-slate-400 hover:bg-[#1e2130] hover:text-white'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center justify-center h-10 border-t border-[#1e2130] text-slate-500 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-[#1e2130] bg-[#13161f] flex items-center justify-between px-5 shrink-0">
          <div className="text-slate-400 text-sm">
            {NAV.find(n => n.to === location.pathname)?.label ?? 'פיקוח בנייה'}
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-full bg-[#1e2130] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Bell size={15} />
            </button>
            <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-bold">
              ח
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
