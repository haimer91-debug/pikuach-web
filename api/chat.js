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

function searchStandards(query, topN = 5) {
  const chunks   = getChunks()
  if (!chunks.length) return []
  const keywords = query.split(/[\s,.\-()/\[\]]+/)
    .map(w => w.replace(/[״"'`]/g, '').trim())
    .filter(w => w.length >= 2 && !STOPWORDS.has(w))
  if (!keywords.length) return []

  return chunks
    .map(c => {
      const haystack = (c.text + ' ' + c.file).toLowerCase()
      const score = keywords.reduce((s, kw) => {
        const lk = kw.toLowerCase()
        return s + (haystack.includes(lk) ? 2 : (haystack.split(' ').some(t => t.startsWith(lk)) ? 1 : 0))
      }, 0)
      return { ...c, score }
    })
    .filter(c => c.score > 0)
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

הידע שלך כולל:
• ת"י 466 (ברזל לבניה), ת"י 118 (בטון), ת"י 1555 (ריצוף), ת"י 1090 (פלדת קונסטרוקציה), ת"י 12 (בניה), ת"י 931 (בידוד תרמי)
• תקנות התכנון והבנייה (בקשה להיתר, ביקורת), חוק התכנון והבנייה תשכ"ה-1965
• תקנות כיבוי אש, תקנות נגישות
• דרישות בטון: כיסוי ברזל, ריכוז, עיגון, ערב מינימלי

כללי תשובה — חובה:
1. ענה תמיד בעברית
2. אם יש קטעי תקן בהמשך — השתמש בהם כמקור ראשון. ציין שם קובץ + עמוד.
3. אם אין קטעים רלוונטיים — ענה על בסיס הידע שלך, אבל אמור "לפי ידעי" ולא תציג כציטוט מדויק.
4. אל תסביר שאין לך "גישה" — ענה ישירות.
5. סווג ממצאים: קריטי / ממשי / מינורי. המלץ על פעולה.
6. אל תכתוב טבלאות "מה יש לי / מה אין לי".${standardsContext}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        messages: claudeMessages,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Anthropic error:', JSON.stringify(data))
      return res.status(response.status).json({ error: data.error?.message || 'API error' })
    }

    res.json({ content: data.content[0].text })
  } catch (err) {
    console.error('Handler crash:', err.message, err.stack)
    res.status(500).json({ error: err.message })
  }
}
