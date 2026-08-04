import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, HardHat, User, Loader, X, FileText, Trash2, Plus, Clock } from 'lucide-react'

const WELCOME_MSG = { role: 'assistant', content: `שלום! אני מוח הבנייה 🏗️

אני עוזר לך בכל שאלה הנדסית ומקצועית:
• ניתוח ממצאים לפי ת"י ישראלי
• בדיקת דרישות תקנות ורגולציה
• חישובי קונסטרוקציה ובטון
• ייעוץ בנושאי פיקוח בנייה
• ניסוח ממצאים לדוחות

בכל שאלה — אני מחפש אוטומטית בספריית התקנים הישראלית ומצטט מקור ועמוד.
ניתן גם לצרף תמונות או קבצי PDF לניתוח.` }

const SESSIONS_KEY = 'pikuach_sessions'
const CURRENT_KEY  = 'pikuach_current_id'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

function sessionTitle(messages) {
  const first = messages.find(m => m.role === 'user')
  if (!first?.content) return 'שיחה חדשה'
  return first.content.slice(0, 45) + (first.content.length > 45 ? '…' : '')
}

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]') } catch { return [] }
}
function saveSessions(list) { localStorage.setItem(SESSIONS_KEY, JSON.stringify(list)) }
function loadCurrentId() { return localStorage.getItem(CURRENT_KEY) || null }
function saveCurrentId(id) { localStorage.setItem(CURRENT_KEY, id) }

function initSession() {
  const sessions = loadSessions()
  const currentId = loadCurrentId()
  const existing = sessions.find(s => s.id === currentId)
  if (existing) return { sessions, activeId: currentId, messages: existing.messages }
  const id = genId()
  const newSession = { id, messages: [WELCOME_MSG], updatedAt: Date.now() }
  const updated = [newSession, ...sessions]
  saveSessions(updated)
  saveCurrentId(id)
  return { sessions: updated, activeId: id, messages: [WELCOME_MSG] }
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-green-700' : 'bg-[#252840]'
      }`}>
        {isUser ? <User size={15} className="text-white" /> : <HardHat size={15} className="text-green-400" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'bg-green-600 text-white rounded-tr-sm'
          : 'bg-[#1a1d27] text-slate-200 rounded-tl-sm border border-[#252840]'
      }`}>
        {msg.content}
        {msg.image && <img src={msg.image} className="mt-2 rounded-lg max-h-48 w-auto" />}
        {msg.pdfName && (
          <div className="mt-2 flex items-center gap-1.5 text-xs opacity-75">
            <FileText size={12} /><span>{msg.pdfName}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'אתמול'
  if (diffDays < 7) return `לפני ${diffDays} ימים`
  return d.toLocaleDateString('he-IL')
}

export default function AiPage() {
  const init = initSession()
  const [sessions, setSessions] = useState(init.sessions)
  const [activeId, setActiveId] = useState(init.activeId)
  const [messages, setMessages] = useState(init.messages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [imgPreview, setImgPreview] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const fileRef = useRef()
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function persistMessages(id, msgs) {
    const updated = sessions.map(s =>
      s.id === id ? { ...s, messages: msgs, updatedAt: Date.now() } : s
    )
    setSessions(updated)
    saveSessions(updated)
  }

  function updateMessages(msgs) {
    setMessages(msgs)
    persistMessages(activeId, msgs)
  }

  function newChat() {
    const id = genId()
    const session = { id, messages: [WELCOME_MSG], updatedAt: Date.now() }
    const updated = [session, ...sessions]
    setSessions(updated)
    saveSessions(updated)
    saveCurrentId(id)
    setActiveId(id)
    setMessages([WELCOME_MSG])
    setShowHistory(false)
  }

  function switchSession(id) {
    const s = sessions.find(s => s.id === id)
    if (!s) return
    saveCurrentId(id)
    setActiveId(id)
    setMessages(s.messages)
    setShowHistory(false)
  }

  function deleteSession(id, e) {
    e.stopPropagation()
    const updated = sessions.filter(s => s.id !== id)
    saveSessions(updated)
    setSessions(updated)
    setConfirmDelete(null)
    if (id === activeId) {
      if (updated.length > 0) {
        switchSession(updated[0].id)
      } else {
        newChat()
      }
    }
  }

  async function send() {
    if (!input.trim() && !imgPreview && !pdfFile) return

    let imageBase64 = null
    if (imgPreview) {
      const res = await fetch(imgPreview)
      const blob = await res.blob()
      imageBase64 = await new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    }

    let pdfBase64 = null, pdfName = null
    if (pdfFile) {
      pdfName = pdfFile.name
      pdfBase64 = await new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(pdfFile)
      })
    }

    const userMsg = { role: 'user', content: input, image: imageBase64, pdf: pdfBase64, pdfName }
    const newMessages = [...messages, userMsg]
    updateMessages(newMessages)
    setInput('')
    setImgPreview(null)
    setPdfFile(null)
    setLoading(true)

    try {
      const history = newMessages
        .filter(m => m.role && m.content && m.content !== WELCOME_MSG.content)
        .map(m => ({ role: m.role, content: m.content, image: m.image || null, pdf: m.pdf || null, pdfName: m.pdfName || null }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאת שרת')
      const final = [...newMessages, { role: 'assistant', content: data.content }]
      updateMessages(final)
    } catch (err) {
      const final = [...newMessages, { role: 'assistant', content: `שגיאה: ${err.message}` }]
      updateMessages(final)
    } finally {
      setLoading(false)
    }
  }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    if (file.type === 'application/pdf') { setPdfFile(file); setImgPreview(null) }
    else { setImgPreview(URL.createObjectURL(file)); setPdfFile(null) }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const hasHistory = messages.length > 1
  const otherSessions = sessions.filter(s => s.id !== activeId)

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px - 40px)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-white">מוח הבנייה</h1>
          <p className="text-slate-400 text-sm mt-0.5">AI מתמחה בבנייה ופיקוח — שאל כל שאלה הנדסית</p>
        </div>
        <div className="flex items-center gap-2">
          {/* New Chat */}
          <button onClick={newChat}
            title="שיחה חדשה"
            className="flex items-center gap-1.5 text-slate-400 hover:text-green-400 transition-colors text-sm px-2 py-1 rounded-lg hover:bg-[#1e2130]">
            <Plus size={14} />
            חדשה
          </button>
          {/* History */}
          {sessions.length > 1 && (
            <div className="relative">
              <button onClick={() => setShowHistory(h => !h)}
                className={`flex items-center gap-1.5 transition-colors text-sm px-2 py-1 rounded-lg ${
                  showHistory ? 'text-green-400 bg-[#1e2130]' : 'text-slate-400 hover:text-white hover:bg-[#1e2130]'
                }`}>
                <Clock size={14} />
                היסטוריה
              </button>
              {showHistory && (
                <div className="absolute left-0 top-9 w-72 bg-[#13161f] border border-[#252840] rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-[#252840] text-xs text-slate-500">
                    {sessions.length} שיחות שמורות
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {sessions.map(s => (
                      <div key={s.id}
                        onClick={() => switchSession(s.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors group ${
                          s.id === activeId
                            ? 'bg-[#1e2130] text-white'
                            : 'text-slate-300 hover:bg-[#1a1d27]'
                        }`}>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs truncate">{sessionTitle(s.messages)}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{formatDate(s.updatedAt)}</div>
                        </div>
                        {s.id === activeId && (
                          <span className="text-[10px] text-green-500 shrink-0">פעיל</span>
                        )}
                        {confirmDelete === s.id ? (
                          <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button onClick={e => deleteSession(s.id, e)}
                              className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded">מחק</button>
                            <button onClick={e => { e.stopPropagation(); setConfirmDelete(null) }}
                              className="text-[10px] text-slate-400 px-1 py-0.5">ביטול</button>
                          </div>
                        ) : (
                          <button onClick={e => { e.stopPropagation(); setConfirmDelete(s.id) }}
                            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all shrink-0">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1" onClick={() => setShowHistory(false)}>
        {messages.map((m, i) => <Bubble key={i} msg={m} />)}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#252840] flex items-center justify-center shrink-0">
              <HardHat size={15} className="text-green-400" />
            </div>
            <div className="bg-[#1a1d27] border border-[#252840] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5">
              <Loader size={14} className="text-green-400 animate-spin shrink-0" />
              <span className="text-xs text-slate-500 animate-pulse">מחפש בתקנים וחושב...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {imgPreview && (
        <div className="relative mb-2 inline-block">
          <img src={imgPreview} className="h-20 w-auto rounded-lg border border-[#252840]" />
          <button onClick={() => setImgPreview(null)} className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full p-0.5">
            <X size={12} className="text-white" />
          </button>
        </div>
      )}

      {pdfFile && (
        <div className="relative mb-2 inline-flex items-center gap-2 bg-[#1a1d27] border border-blue-500/40 rounded-lg px-3 py-2">
          <FileText size={16} className="text-blue-400 shrink-0" />
          <span className="text-blue-300 text-xs max-w-[200px] truncate">{pdfFile.name}</span>
          <button onClick={() => setPdfFile(null)} className="text-slate-500 hover:text-red-400 transition-colors">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="bg-[#13161f] border border-[#1e2130] rounded-xl flex items-end gap-2 p-2">
        <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current.click()}
          title="צרף תמונה או PDF תקן"
          className="w-9 h-9 rounded-lg bg-[#1e2130] flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0">
          <Paperclip size={16} />
        </button>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="שאל שאלה הנדסית... (Enter לשליחה)"
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none leading-relaxed py-1.5"
          style={{ maxHeight: '120px' }}
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
        />
        <button onClick={send}
          disabled={!input.trim() && !imgPreview && !pdfFile}
          className="w-9 h-9 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-[#1e2130] disabled:text-slate-600 flex items-center justify-center text-white transition-colors shrink-0">
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
