// Seed v2: 3 Full IELTS Mock Tests (charon skills) + unhi se bane hue
// per-skill practice tests + writing prompts + admin.
// Sab content original hai — Cambridge/British Council/IDP ka material nahi.
// Run: node src/seed.js   (MONGODB_URI .env mein hona chahiye)
require('dotenv').config();
const { connectDB } = require('./db');
const mongoose = require('mongoose');
const MockTest = require('./models/MockTest');

function loadData(name) {
  try {
    return require(`./data/${name}`);
  } catch (err) {
    console.error(`Skipping data/${name}: ${err.message}`);
    return null;
  }
}

// Full mock se per-skill practice tests banao (wahi content, aik skill)
function practiceTests(full, n) {
  const out = [];
  const lsec = full.sections.find((s) => s.key === 'listening');
  const rsec = full.sections.find((s) => s.key === 'reading');
  const ssec = full.sections.find((s) => s.key === 'speaking');
  if (lsec) {
    out.push({
      slug: `listening-practice-${n}`,
      title: `Listening Practice ${n}`,
      kind: 'listening', published: full.published, durationMin: 35,
      sections: [lsec],
      questions: full.questions.filter((q) => q.section === 'listening'),
    });
  }
  if (rsec) {
    out.push({
      slug: `reading-practice-${n}`,
      title: `Reading Practice ${n}`,
      kind: 'reading', published: full.published, durationMin: 60,
      sections: [rsec],
      questions: full.questions.filter((q) => q.section === 'reading'),
    });
  }
  if (ssec) {
    out.push({
      slug: `speaking-practice-${n}`,
      title: `Speaking Practice ${n}`,
      kind: 'speaking', published: full.published, durationMin: 15,
      sections: [ssec],
      questions: [],
    });
  }
  return out;
}

async function upsertTest(t) {
  await MockTest.findOneAndUpdate({ slug: t.slug }, t, { upsert: true, new: true });
  console.log(`Seeded "${t.title}" (${(t.questions || []).length} questions, kind=${t.kind || 'full'})`);
}

async function main() {
  await connectDB();

  const fullMocks = ['mock1', 'mock2', 'mock3'].map(loadData).filter(Boolean);
  let n = 0;
  for (const full of fullMocks) {
    n += 1;
    await upsertTest(full);
    for (const p of practiceTests(full, n)) {
      await upsertTest(p);
    }
  }

  // Writing prompts (original — Cambridge material nahi)
  const WritingPrompt = require('./models/WritingPrompt');
  const prompts = [
    {
      taskType: 'task1',
      title: 'Task 1 — Bar chart',
      text: 'The chart shows the percentage of households in three Pakistani cities with internet access from 2015 to 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    },
    {
      taskType: 'task1',
      title: 'Task 1 — Process diagram',
      text: 'The diagram shows how tea is produced from picking leaves to packaging. Summarise the information by selecting and reporting the main features. Write at least 150 words.',
    },
    {
      taskType: 'task2',
      title: 'Task 2 — Opinion essay',
      text: 'Some people believe that university education should be free for all students, while others think students should pay for their own tuition. Discuss both views and give your own opinion. Write at least 250 words.',
    },
    {
      taskType: 'task2',
      title: 'Task 2 — Problem/solution',
      text: 'Traffic congestion is a growing problem in many large cities. What are the causes of this problem, and what measures can be taken to solve it? Write at least 250 words.',
    },
  ];
  for (const p of prompts) {
    await WritingPrompt.findOneAndUpdate({ title: p.title }, p, { upsert: true });
  }
  console.log(`Seeded ${prompts.length} writing prompts`);

  // Admin user — ADMIN_EMAIL + ADMIN_PASSWORD env vars se (optional).
  // Pehle se maujood user ho to sirf role=admin kar dega, password NAHI badlega.
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const User = require('./models/User');
    const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
    let admin = await User.findOne({ email });
    if (!admin) {
      admin = new User({ name: 'Admin', email, isVerified: true, role: 'admin' });
      await admin.setPassword(process.env.ADMIN_PASSWORD);
      console.log(`Admin created: ${email}`);
    } else if (admin.role !== 'admin') {
      admin.role = 'admin';
      admin.isVerified = true;
      console.log(`Admin role granted: ${email}`);
    } else {
      console.log(`Admin already exists: ${email}`);
    }
    await admin.save();
  } else {
    console.log('ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed');
  }

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
