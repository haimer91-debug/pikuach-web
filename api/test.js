export default async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY || ''
  const hasBom = apiKey.charCodeAt(0) === 0xFEFF
  const keyLen = apiKey.length

  if (req.method === 'GET') {
    return res.json({ ok: true, keySet: !!apiKey, keyLen, hasBom })
  }
  // Test actual Anthropic call
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 20, messages: [{ role: 'user', content: 'say ok' }] }),
    })
    const d = await r.json()
    res.json({ status: r.status, reply: d.content?.[0]?.text, hasBom, keyLen })
  } catch (e) {
    res.json({ error: e.message, hasBom, keyLen })
  }
}
