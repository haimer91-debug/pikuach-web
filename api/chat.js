export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).end()

    const { messages } = req.body
    if (!messages?.length) return res.status(400).json({ error: 'no messages' })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })

    const claudeMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => {
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: `אתה "מוח הבנייה" — עוזר AI מומחה לפיקוח בנייה וביקורת שטח בישראל.
התמחותך:
• תקנות ישראל: ת"י 466 (ברזל), ת"י 118 (בטון), ת"י 1555 (ריצוף), תקנות הבנייה, חוק התכנון והבנייה
• זיהוי ממצאים קריטיים בשטח: חריגות ברזל, בעיות ריצוף, פגמי בטון, ליקויי צנרת
• ניסוח ממצאים לדוחות פיקוח מקצועיים
• המלצות תיקון ועדיפות ביצוע
• בטיחות באתר בנייה

עקרונות תשובה:
- ענה תמיד בעברית
- היה ספציפי: ציין ת"י, סעיף, מידות מדויקות
- סווג ממצאים: קריטי / ממשי / מינורי
- המלץ על פעולה: עצור עבודה / תקן לפני המשך / תיעד בדוח
- אם חסרה לך מידע — שאל שאלה ממוקדת`,
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
