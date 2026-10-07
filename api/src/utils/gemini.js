// Gemini AI feedback — key paste nahi hui to null (feedback "pending" rahega)
async function gradeWriting(taskType, promptText, essay) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes('PASTE_YOUR')) return null;

  const criteria = `You are an IELTS examiner. Grade this ${taskType === 'task1' ? 'Writing Task 1' : 'Writing Task 2'} response on the 4 official criteria, each 0-9 in 0.5 steps:
1. Task Achievement (Task 1) / Task Response (Task 2)
2. Coherence and Cohesion
3. Lexical Resource
4. Grammatical Range and Accuracy
Overall = average rounded to nearest 0.5. Reply ONLY with valid JSON:
{"taskResponse": 6.5, "coherence": 6.0, "lexical": 7.0, "grammar": 6.5, "overall": 6.5, "comments": "2-3 sentence actionable feedback"}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${criteria}\n\nPROMPT:\n${promptText}\n\nRESPONSE:\n${essay}` }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const json = text.replace(/```json|```/g, '').trim();
  try {
    const f = JSON.parse(json);
    if (typeof f.overall !== 'number') return null;
    return f;
  } catch { return null; }
}

module.exports = { gradeWriting };
