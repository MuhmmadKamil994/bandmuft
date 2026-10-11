const GUIDES = [
  {
    title: 'Listening — 8.0+ Strategy',
    tag: 'Listening',
    points: [
      'Predict before you listen: underline keywords in the question and guess the answer type (number, name, date).',
      'Section 1 & 2 are the easiest — aim for 19–20/20 here; they carry your score.',
      'Distractors are deliberate: you will hear a wrong answer first, then a correction ("…no, wait, it\'s…"). Always wait for the correction.',
      'Write answers in ALL CAPS on the paper if it helps you read them later — spelling counts.',
      'One word AND/OR a number: "a number" means digits are fine. Hyphenated words count as one word.',
    ],
  },
  {
    title: 'Reading — Time Management',
    tag: 'Reading',
    points: [
      'You have 60 minutes for 40 questions — spend 15 min on Passage 1, 20 on Passage 2, 25 on Passage 3.',
      'Skim first, then scan: read the first and last sentence of each paragraph to map the passage before looking at questions.',
      'True/False/Not Given: if the text doesn\'t say it, it\'s Not Given — don\'t use outside knowledge.',
      'Matching headings: the heading must cover the WHOLE paragraph, not just one detail.',
      'Never leave blanks — there is no negative marking.',
    ],
  },
  {
    title: 'Writing Task 1 — Report Formula',
    tag: 'Writing',
    points: [
      'Structure: paraphrase the question (1 line) → overview with 2–3 key trends (no data) → 2 detail paragraphs with data.',
      'Never give opinions or reasons in Task 1 — just report what you see.',
      'Vary your language: "increased" → rose, climbed, surged; "decreased" → fell, dropped, declined.',
      'Aim for 170–190 words. Under 150 = automatic penalty.',
      'Spend 20 minutes max — Task 2 is worth double.',
    ],
  },
  {
    title: 'Writing Task 2 — Essay Blueprint',
    tag: 'Writing',
    points: [
      'Structure: paraphrase + thesis → idea 1 (explain + example) → idea 2 (explain + example) → restate opinion.',
      'One clear position throughout — sitting on the fence lowers your Task Response score.',
      'Use a range of linkers, not just "Firstly, Secondly": Moreover, Nevertheless, Consequently, In contrast.',
      'Aim for 260–290 words in 40 minutes. Plan for 5 minutes before writing.',
      'Check the 4 criteria: Task Response, Coherence & Cohesion, Lexical Resource, Grammar.',
    ],
  },
  {
    title: 'Speaking — Sound Natural',
    tag: 'Speaking',
    points: [
      'Part 1: give 2–3 sentence answers, not one word. Extend with a reason or example.',
      'Part 2: use the full minute to plan — write 4–5 keywords, not sentences. Speak for the full 2 minutes.',
      'Part 3: discuss ideas in general, not personal stories. Give both sides, then your view.',
      'Fluency beats fancy words: it\'s better to speak smoothly with simple vocabulary than to hesitate over complex words.',
      'Record yourself weekly and count your hesitations — that number should fall every week.',
    ],
  },
  {
    title: 'Band Score — How It Works',
    tag: 'Scoring',
    points: [
      'Listening & Reading: 40 questions each. 30 correct ≈ Band 7, 35 correct ≈ Band 8.',
      'Writing & Speaking: marked on 4 criteria, each 25%. Your band is the average.',
      'Overall band = the average of your 4 section bands, rounded to the nearest half band.',
      'The rounding rule is simple: an average ending in .25 rounds UP to the next half band (6.25 → 6.5), and an average ending in .75 rounds UP to the next whole band (6.75 → 7.0).',
      'Use our Band Calculator to see exactly what you need in each section.',
    ],
  },
];

export default function Guides() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2">IELTS Study Guides</h1>
      <p className="text-gray-600 mb-8">
        Battle-tested strategies for each section — written for Pakistani test takers, free forever.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {GUIDES.map((g) => (
          <div key={g.title} className="card">
            <span className="inline-block text-xs font-bold uppercase tracking-wide text-navy bg-gold/20 rounded-full px-3 py-1 mb-3">
              {g.tag}
            </span>
            <h2 className="font-bold text-lg mb-3">{g.title}</h2>
            <ul className="space-y-2">
              {g.points.map((p, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-gold font-bold">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="card mt-8 text-center">
        <h2 className="font-bold text-lg mb-2">Ready to test yourself?</h2>
        <p className="text-sm text-gray-600 mb-4">Take a full mock test with instant band scores.</p>
        <a href="/mock" className="btn-primary btn-sm inline-flex">Start free mock test</a>
      </div>
    </div>
  );
}
