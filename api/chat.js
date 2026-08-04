import fs from 'fs'
import path from 'path'

// ── אינדקס תקנים (נטען פעם אחת בזיכרון) ─────────────────────────
let _chunks = null
function getChunks() {
  if (_chunks) return _chunks
  const p = path.join(process.cwd(), 'public', 'standards', 'chunks.json')
  if (fs.existsSync(p)) _chunks = JSON.parse(fs.readFileSync(p, 'utf-8'))
  else _chunks = []
  return _chunks
}

const STOPWORDS = new Set([
  'של','על','את','עם','אל','לא','הוא','היא','הם','הן','זה','זו','אם','כן',
  'עד','רק','גם','לפי','בין','אבל','או','כי','כך','שם','עוד','לו','לה',
  'לי','לנו','להם','כל','אחד','יש','אין','כבר','ב','ל','מ','ה','ו','כ','ש'
])

function isGoodChunk(c) {
  const t = c.text || ''
  const heCount = [...t].filter(ch => ch >= 'א' && ch <= 'ת').length
  return heCount / Math.max(t.length, 1) > 0.15
}

// MIN_SCORE: chunk must score at least this much to be injected.
// Score=3 means only 1 keyword matched in text — too weak, likely off-topic.
// Score=6 means 2 strong matches or 1 match + proximity bonus — genuinely relevant.
const MIN_SCORE = 6

function searchStandards(query, topN = 6) {
  const chunks   = getChunks().filter(isGoodChunk)
  if (!chunks.length) return []
  const keywords = query.split(/[\s,.\-()/\[\]"״'"'`]+/)
    .map(w => w.trim())
    .filter(w => w.length >= 2 && !STOPWORDS.has(w))
  if (!keywords.length) return []

  return chunks
    .map(c => {
      const text = (c.text || '').toLowerCase()
      const fileCtx = (c.file || '').toLowerCase()
      let score = 0
      for (const kw of keywords) {
        const lk = kw.toLowerCase()
        if (text.includes(lk)) score += 3
        else if (text.split(/\s+/).some(t => t.startsWith(lk))) score += 1
        if (fileCtx.includes(lk)) score += 2
      }
      if (keywords.length >= 2) {
        const positions = keywords
          .map(kw => text.indexOf(kw.toLowerCase()))
          .filter(p => p >= 0)
        if (positions.length >= 2) {
          const span = Math.max(...positions) - Math.min(...positions)
          if (span < 50) score += 3
          else if (span < 150) score += 1
        }
      }
      return { ...c, score }
    })
    .filter(c => c.score >= MIN_SCORE)   // ← סף מינימלי — לא רלוונטי = לא מוזרק
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}

function buildContextBlock(chunks) {
  if (!chunks.length) return ''
  const lines = chunks.map(c =>
    `--- ${c.file}, עמוד ${c.page} ---\n${c.text}`
  )
  return `\n\n=== קטעים רלוונטיים מהתקנים (OCR) ===\n${lines.join('\n\n')}\n===\nהשתמש בקטעים הנ"ל כמקור ראשוני לתשובתך. ציין שם קובץ + עמוד.`
}

// ── handler ───────────────────────────────────────────────────────
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).end()

    const { messages } = req.body
    if (!messages?.length) return res.status(400).json({ error: 'no messages' })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })

    // חיפוש תקנים אוטומטי (רק אם אין PDF מצורף)
    const lastMsg = messages[messages.length - 1]
    let standardsContext = ''
    if (!lastMsg?.pdf && lastMsg?.content) {
      const hits = searchStandards(lastMsg.content)
      standardsContext = buildContextBlock(hits)
    }

    const claudeMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => {
        if (m.pdf) {
          const [, data] = m.pdf.split(',')
          return {
            role: m.role,
            content: [
              { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } },
              { type: 'text', text: m.content || `קרא את התקן "${m.pdfName}" וענה על שאלות לפי התוכן המדויק שבו.` },
            ],
          }
        }
        if (m.image) {
          const [meta, data] = m.image.split(',')
          const mediaType = meta.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
          return {
            role: m.role,
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
              { type: 'text', text: m.content || 'מה אתה רואה בתמונה? נתח מבחינה הנדסית ופיקוח.' },
            ],
          }
        }
        return { role: m.role, content: m.content }
      })

    const systemPrompt = `אתה "מוח הבנייה" — מפקח בנייה בכיר ויועץ הנדסי עם ידע מעמיק בתקנים ורגולציה ישראלית.

כללי תשובה — חובה:
1. ענה תמיד בעברית.
2. אם יש קטעי תקן למטה — השתמש בהם כמקור ראשון. ציין שם קובץ + עמוד.
3. אם אין קטעים רלוונטיים מהתקנים — השתמש בחיפוש רשת כדי למצוא את המידע המדויק (תקנות בנייה, נבו, מכון התקנים). אל תנחש — חפש.
4. לאחר חיפוש — ציין את המקור שמצאת (שם תקנה + סעיף).
5. סווג ממצאים: קריטי / ממשי / מינורי. המלץ על פעולה.
6. אל תכתוב טבלאות "מה יש לי / מה אין לי".${standardsContext}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        messages: claudeMessages,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Anthropic error:', JSON.stringify(data))
      return res.status(response.status).json({ error: data.error?.message || 'API error' })
    }

    // content may include tool_use + tool_result blocks from web search — find the text
    const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text)
    const answer = textBlocks.join('\n').trim() || 'לא התקבלה תשובה'
    res.json({ content: answer })
  } catch (err) {
    console.error('Handler crash:', err.message, err.stack)
    res.status(500).json({ error: err.message })
  }
}
