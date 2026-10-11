// Gemini AI feedback — writing + speaking grading.
// FIX (2026-10-11): purana model gemini-2.0-flash Google ne 2026-06-01 ko
// SHUT DOWN kar diya tha — har request fail, feedback hamesha "pending".
// Ab current model + har error LOG hota hai (khamoshi se nahi nigla jata),
// aur callers pending ko dobara try kar sakte hain (retry pattern).
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

async function callGemini(promptText) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes('PASTE_YOUR')) {
    console.error('[gemini] GEMINI_API_KEY missing or placeholder — grading skipped');
    return null;
  }
  let res;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 900 },
        }),
      }
    );
  } catch (err) {
    console.error('[gemini] network error:', err.message);
    return null;
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`[gemini] API error ${res.status}: ${body.slice(0, 300)}`);
    return null;
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const json = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(json);
  } catch {
    console.error('[gemini] reply was not valid JSON:', json.slice(0, 200));
    return null;
  }
}

async function gradeWriting(taskType, promptText, essay) {
  const criteria = `You are an IELTS examiner. Grade this ${taskType === 'task1' ? 'Writing Task 1' : 'Writing Task 2'} response on the 4 official criteria, each 0-9 in 0.5 steps:
1. Task Achievement (Task 1) / Task Response (Task 2)
2. Coherence and Cohesion
3. Lexical Resource
4. Grammatical Range and Accuracy
Overall = average rounded to nearest 0.5. Reply ONLY with valid JSON:
{"taskResponse": 6.5, "coherence": 6.0, "lexical": 7.0, "grammar": 6.5, "overall": 6.5, "comments": "2-3 sentence actionable feedback"}`;
  const f = await callGemini(`${criteria}\n\nPROMPT:\n${promptText}\n\nRESPONSE:\n${essay}`);
  if (!f || typeof f.overall !== 'number') {
    if (f) console.error('[gemini] writing reply missing numeric overall');
    return null;
  }
  return f;
}

// Speaking grading transcript par hota hai. Pronunciation transcript se
// judge nahi ho sakti — sirf 3 criteria + overall, comments mein wazahat.
async function gradeSpeaking(parts) {
  const transcript = parts
    .map((p) => `--- Part ${p.part} ---\n${p.transcript || ''}`)
    .join('\n\n');
  if (transcript.replace(/[^a-zA-Z]/g, '').length < 40) return null;
  const criteria = `You are an IELTS examiner. Below is the TRANSCRIPT of a candidate's IELTS Speaking test (Parts 1, 2 and 3). Grade the candidate on these criteria, each 0-9 in 0.5 steps:
1. Fluency and Coherence (judge from the transcript: length of answers, development of ideas, linking)
2. Lexical Resource (vocabulary range and precision visible in the transcript)
3. Grammatical Range and Accuracy (sentence variety and errors visible in the transcript)
Pronunciation CANNOT be judged from a transcript — do not invent a pronunciation score. Overall = average of the 3 criteria rounded to nearest 0.5. Reply ONLY with valid JSON:
{"fluency": 6.5, "lexical": 7.0, "grammar": 6.0, "overall": 6.5, "comments": "2-3 sentence actionable feedback. Mention that pronunciation was not assessed because this grading is transcript-based."}`;
  const f = await callGemini(`${criteria}\n\nTRANSCRIPT:\n${transcript}`);
  if (!f || typeof f.overall !== 'number') {
    if (f) console.error('[gemini] speaking reply missing numeric overall');
    return null;
  }
  return f;
}

module.exports = { gradeWriting, gradeSpeaking };
