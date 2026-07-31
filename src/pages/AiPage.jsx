import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, HardHat, User, Loader, X } from 'lucide-react'

const WELCOME = `שלום! אני מוח הבנייה 🏗️

אני עוזר לך בכל שאלה הנדסית ומקצועית:
• ניתוח ממצאים לפי ת"י ישראלי
• בדיקת דרישות תקנות ורגולציה
• חישובי קונסטרוקציה ובטון
• ייעוץ בנושאי פיקוח בנייה
• ניסוח ממצאים לדוחות

ניתן לצרף תמונות של ממצאים לניתוח!`

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
        {msg.image && (
          <img src={msg.image} className="mt-2 rounded-lg max-h-48 w-auto" />
        )}
      </div>
    </div>
  )
}


export default function AiPage() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [imgPreview, setImgPreview] = useState(null)
  const fileRef = useRef()
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    if (!input.trim() && !imgPreview) return

    // Convert image blob URL → base64 before sending to server
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

    const userMsg = { role: 'user', content: input, image: imageBase64 }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setImgPreview(null)
    setLoading(true)

    try {
      // Send only role+content+image to server (skip welcome message which has no role pair)
      const history = newMessages
        .filter(m => m.content && m.content !== WELCOME)
        .map(m => ({ role: m.role, content: m.content, image: m.image || null }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאת שרת')
      setMessages(m => [...m, { role: 'assistant', content: data.content }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: `שגיאה: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  function handleImg(e) {
    const file = e.target.files[0]
    if (file) setImgPreview(URL.createObjectURL(file))
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px - 40px)' }}>
      <div className="mb-3">
        <h1 className="text-xl font-bold text-white">מוח הבנייה</h1>
        <p className="text-slate-400 text-sm mt-0.5">AI מתמחה בבנייה ופיקוח — שאל כל שאלה הנדסית</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1">
        {messages.map((m, i) => <Bubble key={i} msg={m} />)}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#252840] flex items-center justify-center">
              <HardHat size={15} className="text-green-400" />
            </div>
            <div className="bg-[#1a1d27] border border-[#252840] rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader size={16} className="text-green-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {imgPreview && (
        <div className="relative mb-2 inline-block">
          <img src={imgPreview} className="h-20 w-auto rounded-lg border border-[#252840]" />
          <button
            onClick={() => setImgPreview(null)}
            className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full p-0.5"
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="bg-[#13161f] border border-[#1e2130] rounded-xl flex items-end gap-2 p-2">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} className="hidden" />
        <button
          onClick={() => fileRef.current.click()}
          className="w-9 h-9 rounded-lg bg-[#1e2130] flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
        >
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
        <button
          onClick={send}
          disabled={!input.trim() && !imgPreview}
          className="w-9 h-9 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-[#1e2130] disabled:text-slate-600 flex items-center justify-center text-white transition-colors shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
