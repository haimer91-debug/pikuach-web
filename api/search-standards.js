import fs from 'fs'
import path from 'path'

let cachedChunks = null

function isGoodChunk(c) {
  const t = c.text || ''
  const heCount = [...t].filter(ch => ch >= 'א' && ch <= 'ת').length
  return heCount / Math.max(t.length, 1) > 0.15
}

function loadChunks() {
  if (cachedChunks) return cachedChunks
  const p = path.join(process.cwd(), 'public', 'standards', 'chunks.json')
  if (!fs.existsSync(p)) return []
  const all = JSON.parse(fs.readFileSync(p, 'utf-8'))
  cachedChunks = all.filter(isGoodChunk)
  return cachedChunks
}

const HE_STOPWORDS = new Set([
  'של','על','את','עם','אל','לא','הוא','היא','הם','הן','זה','זו','אם','כן',
  'עד','רק','גם','לפי','בין','אבל','או','כי','כך','שם','עוד','כן','לו','לה',
  'לי','לנו','להם','כל','אחד','יש','אין','היה','הייה','יהיה','כבר','עם',
  'ב','ל','מ','ה','ו','כ','ש','בו','בה','בם','כן'
])

function extractKeywords(text) {
  return text
    .split(/[\s,.\-:()/\[\]]+/)
    .map(w => w.replace(/[״"'`]/g, '').trim())
    .filter(w => w.length >= 2 && !HE_STOPWORDS.has(w))
}

function scoreChunk(chunk, keywords) {
  const text = (chunk.text + ' ' + chunk.file).toLowerCase()
  return keywords.reduce((score, kw) => {
    const lk = kw.toLowerCase()
    // exact match in text: 2 pts, starts-with: 1 pt
    if (text.includes(lk)) score += 2
    else if ([...text.matchAll(/\S+/g)].some(m => m[0].startsWith(lk))) score += 1
    return score
  }, 0)
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'GET') return res.status(405).end()

  const q = (req.query.q || '').trim()
  if (!q) return res.json({ chunks: [] })

  const chunks   = loadChunks()
  const keywords = extractKeywords(q)
  if (!keywords.length) return res.json({ chunks: [] })

  const scored = chunks
    .map(c => ({ ...c, score: scoreChunk(c, keywords) }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  res.json({ chunks: scored, keywords })
}
