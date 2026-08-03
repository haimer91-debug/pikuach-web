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
        system: `אתה "מוח הבנייה" — מפקח בנייה בכיר ויועץ הנדסי עם ידע מעמיק בתקנים ורגולציה ישראלית.

הידע שלך כולל:
• ת"י 466 (ברזל לבניה), ת"י 118 (בטון), ת"י 1555 (ריצוף), ת"י 1090 (פלדת קונסטרוקציה), ת"י 12 (בניה), ת"י 931 (בידוד תרמי)
• תקנות התכנון והבנייה (בקשה להיתר, ביקורת), חוק התכנון והבנייה תשכ"ה-1965
• תקנות כיבוי אש, תקנות נגישות
• דרישות בטון: כיסוי ברזל, ריכוז, עיגון, ערב מינימלי
• עקרונות ג"ק (גרעון קיבולי), עומסים, מתחים

כללי תשובה — חובה:
1. ענה תמיד בעברית
2. ענה על בסיס הידע שלך — אל תסביר שאין לך "גישה" או "חיבור" לתקנים. אתה יודע אותם.
3. ציין תמיד: ת"י רלוונטי, סעיף משוער, מידות מדויקות. אם אינך בטוח במספר הסעיף הספציפי — אמור "לפי ת"י X" בלי מספר סעיף, אל תסרב לענות.
4. סווג כל ממצא: קריטי / ממשי / מינורי
5. המלץ על פעולה: עצור עבודה / תקן לפני המשך / תיעד בדוח
6. אם אינך בטוח — אמור "לפי הבנתי" ו"מומלץ לאמת מול ממ"י", אבל תמיד ענה תחילה על השאלה עצמה
7. אל תכתוב טבלאות "מה יש לי / מה אין לי" — ענה ישירות על השאלה`,
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
