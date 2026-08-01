export default function handler(req, res) {
  res.json({ ok: true, method: req.method, hasBody: !!req.body, key: process.env.ANTHROPIC_API_KEY ? 'set' : 'missing' })
}
