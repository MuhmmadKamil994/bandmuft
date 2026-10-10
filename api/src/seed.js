// Seed: aik mukammal original mock test. Sab content original hai —
// Cambridge/British Council/IDP ka material kabhi use nahi karna.
// Run: node src/seed.js   (MONGODB_URI .env mein hona chahiye)
require('dotenv').config();
const { connectDB } = require('./db');
const mongoose = require('mongoose');
const MockTest = require('./models/MockTest');

const Q = (qid, section, type, prompt, extra = {}) => ({ qid, section, type, prompt, ...extra });

const listening = [
  // Section 1 — Library membership (conversation)
  Q('L1', 'listening', 'completion', 'Full name: ____', { group: 'Section 1', answers: ['sara ahmed'] }),
  Q('L2', 'listening', 'completion', 'Phone number: ____', { group: 'Section 1', answers: ['03214567890'] }),
  Q('L3', 'listening', 'completion', 'Membership type: ____', { group: 'Section 1', answers: ['student'] }),
  Q('L4', 'listening', 'completion', 'Monthly fee: ____ rupees', { group: 'Section 1', answers: ['500'] }),
  Q('L5', 'listening', 'mcq', 'Which day is the library closed?', { group: 'Section 1', options: ['Monday', 'Friday', 'Sunday'], answers: ['Friday'] }),
  Q('L6', 'listening', 'mcq', 'How many books can a student borrow at once?', { group: 'Section 1', options: ['2', '4', '6'], answers: ['4'] }),
  Q('L7', 'listening', 'tfng', 'The library opens at 9 am on weekdays.', { group: 'Section 1', answers: ['True'] }),
  Q('L8', 'listening', 'tfng', 'New members must bring a photograph.', { group: 'Section 1', answers: ['False'] }),
  Q('L9', 'listening', 'short', 'What should members bring to collect their card?', { group: 'Section 1', answers: ['id card', 'identity card', 'cnic'] }),
  Q('L10', 'listening', 'completion', 'The library is on ____ Road.', { group: 'Section 1', answers: ['university'] }),
  // Section 2 — Museum tour (monologue)
  Q('L11', 'listening', 'mcq', 'The museum was founded in which year?', { group: 'Section 2', options: ['1962', '1975', '1981'], answers: ['1975'] }),
  Q('L12', 'listening', 'short', 'How many galleries are on the ground floor?', { group: 'Section 2', answers: ['three', '3'] }),
  Q('L13', 'listening', 'completion', "This month's special exhibition is about ____.", { group: 'Section 2', answers: ['trains', 'railways'] }),
  Q('L14', 'listening', 'tfng', 'Photography is allowed in all galleries.', { group: 'Section 2', answers: ['False'] }),
  Q('L15', 'listening', 'mcq', 'Where is the café located?', { group: 'Section 2', options: ['Ground floor', 'First floor', 'Basement'], answers: ['First floor'] }),
  Q('L16', 'listening', 'completion', 'Guided tours start at ____ am.', { group: 'Section 2', answers: ['10'] }),
  Q('L17', 'listening', 'short', 'What discount do students get on tickets?', { group: 'Section 2', answers: ['half price', '50 percent', '50%'] }),
  Q('L18', 'listening', 'tfng', 'The museum shop sells postcards.', { group: 'Section 2', answers: ['True'] }),
  Q('L19', 'listening', 'mcq', 'The tour ends at the…', { group: 'Section 2', options: ['gift shop', 'main entrance', 'café'], answers: ['main entrance'] }),
  Q('L20', 'listening', 'completion', "Next month's exhibition theme: ____.", { group: 'Section 2', answers: ['oceans', 'the ocean'] }),
  // Section 3 — Students planning a presentation (discussion)
  Q('L21', 'listening', 'tfng', 'Ali suggests starting with statistics.', { group: 'Section 3', answers: ['True'] }),
  Q('L22', 'listening', 'tfng', 'Maria has finished her slides.', { group: 'Section 3', answers: ['False'] }),
  Q('L23', 'listening', 'matching', 'Who will prepare the introduction?', { group: 'Section 3', options: ['Ali', 'Maria', 'Both'], answers: ['Both'] }),
  Q('L24', 'listening', 'matching', 'Who will present the case study?', { group: 'Section 3', options: ['Ali', 'Maria', 'Both'], answers: ['Maria'] }),
  Q('L25', 'listening', 'matching', 'Who will handle questions at the end?', { group: 'Section 3', options: ['Ali', 'Maria', 'Both'], answers: ['Ali'] }),
  Q('L26', 'listening', 'mcq', 'How long is their presentation slot?', { group: 'Section 3', options: ['10 minutes', '15 minutes', '20 minutes'], answers: ['15 minutes'] }),
  Q('L27', 'listening', 'completion', 'They will meet again on ____.', { group: 'Section 3', answers: ['thursday'] }),
  Q('L28', 'listening', 'short', 'What will they bring to the next meeting?', { group: 'Section 3', answers: ['laptop', 'their laptops'] }),
  Q('L29', 'listening', 'tfng', 'Their teacher approved the topic.', { group: 'Section 3', answers: ['True'] }),
  Q('L30', 'listening', 'tfng', 'They must submit notes before Friday.', { group: 'Section 3', answers: ['Not Given'] }),
  // Section 4 — Urban gardening lecture
  Q('L31', 'listening', 'completion', 'Rooftop plants can reduce building ____.', { group: 'Section 4', answers: ['heat', 'temperature'] }),
  Q('L32', 'listening', 'mcq', 'Which vegetable is recommended for beginners?', { group: 'Section 4', options: ['Tomatoes', 'Carrots', 'Lettuce'], answers: ['Lettuce'] }),
  Q('L33', 'listening', 'short', 'How much sunlight do most vegetables need daily?', { group: 'Section 4', answers: ['six hours', '6 hours'] }),
  Q('L34', 'listening', 'completion', 'The best soil mixture contains ____.', { group: 'Section 4', answers: ['compost'] }),
  Q('L35', 'listening', 'tfng', 'Hydroponics uses more water than soil gardening.', { group: 'Section 4', answers: ['False'] }),
  Q('L36', 'listening', 'mcq', "The speaker's first rooftop garden was in…", { group: 'Section 4', options: ['Lahore', 'Karachi', 'Islamabad'], answers: ['Karachi'] }),
  Q('L37', 'listening', 'completion', 'Water plants early in the ____.', { group: 'Section 4', answers: ['morning'] }),
  Q('L38', 'listening', 'short', 'What attracts bees to a garden?', { group: 'Section 4', answers: ['flowers', 'flowering plants'] }),
  Q('L39', 'listening', 'tfng', 'The lecture mentions a community garden project.', { group: 'Section 4', answers: ['True'] }),
  Q('L40', 'listening', 'mcq', 'The main benefit discussed is…', { group: 'Section 4', options: ['saving money', 'fresh food', 'exercise'], answers: ['fresh food'] }),
];

const reading = [
  // Passage 1 — The Rise of Urban Farming
  Q('R1', 'reading', 'tfng', 'Urban farming began in the 21st century.', { group: 'Passage 1', answers: ['False'] }),
  Q('R2', 'reading', 'tfng', 'Rooftop gardens exist only in rich countries.', { group: 'Passage 1', answers: ['False'] }),
  Q('R3', 'reading', 'tfng', 'The passage mentions vertical farms using LED lights.', { group: 'Passage 1', answers: ['True'] }),
  Q('R4', 'reading', 'tfng', 'All urban farms are profitable.', { group: 'Passage 1', answers: ['Not Given'] }),
  Q('R5', 'reading', 'completion', 'Singapore imports over ____ of its food.', { group: 'Passage 1', answers: ['90 percent', '90%'] }),
  Q('R6', 'reading', 'completion', 'Vertical farms can use ____ less water than fields.', { group: 'Passage 1', answers: ['95 percent', '95%'] }),
  Q('R7', 'reading', 'short', 'What do some farms raise alongside vegetables?', { group: 'Passage 1', answers: ['fish'] }),
  Q('R8', 'reading', 'mcq', 'The main challenge for urban farms is…', { group: 'Passage 1', options: ['high rent', 'lack of sunlight', 'water shortage'], answers: ['high rent'] }),
  Q('R9', 'reading', 'completion', 'Community gardens also improve ____ health.', { group: 'Passage 1', answers: ['mental'] }),
  Q('R10', 'reading', 'short', 'In which city did the writer visit a rooftop farm?', { group: 'Passage 1', answers: ['karachi'] }),
  Q('R11', 'reading', 'mcq', "The writer's attitude to urban farming is…", { group: 'Passage 1', options: ['doubtful', 'positive', 'neutral'], answers: ['positive'] }),
  Q('R12', 'reading', 'tfng', 'The passage says urban farms will replace rural farms.', { group: 'Passage 1', answers: ['False'] }),
  Q('R13', 'reading', 'completion', 'The passage predicts ____ growth for the sector.', { group: 'Passage 1', answers: ['rapid', 'fast'] }),
  // Passage 2 — How Coffee Changed Mornings
  Q('R14', 'reading', 'ynng', 'The writer claims coffee was discovered by a goat herder.', { group: 'Passage 2', answers: ['Yes'] }),
  Q('R15', 'reading', 'ynng', "Coffee houses were once called 'penny universities'.", { group: 'Passage 2', answers: ['Yes'] }),
  Q('R16', 'reading', 'ynng', 'The passage states coffee is unhealthy in all amounts.', { group: 'Passage 2', answers: ['No'] }),
  Q('R17', 'reading', 'ynng', 'Brazil is mentioned as the largest producer.', { group: 'Passage 2', answers: ['Not Given'] }),
  Q('R18', 'reading', 'mcq', 'Coffee first became popular in…', { group: 'Passage 2', options: ['Ethiopia', 'Yemen', 'Italy'], answers: ['Yemen'] }),
  Q('R19', 'reading', 'mcq', "The word 'cappuccino' comes from…", { group: 'Passage 2', options: ['Italian monks', 'a coffee bean', 'a Viennese café'], answers: ['Italian monks'] }),
  Q('R20', 'reading', 'matching', 'Which drink is one-third espresso, two-thirds steamed milk?', { group: 'Passage 2', options: ['Espresso', 'Latte', 'Cappuccino'], answers: ['Latte'] }),
  Q('R21', 'reading', 'matching', 'Which drink has a thick layer of foam?', { group: 'Passage 2', options: ['Espresso', 'Latte', 'Cappuccino'], answers: ['Cappuccino'] }),
  Q('R22', 'reading', 'matching', 'Which is a small, strong black coffee?', { group: 'Passage 2', options: ['Espresso', 'Latte', 'Cappuccino'], answers: ['Espresso'] }),
  Q('R23', 'reading', 'completion', 'The global coffee trade is worth over ____ dollars yearly.', { group: 'Passage 2', answers: ['100 billion', '$100 billion'] }),
  Q('R24', 'reading', 'short', 'What chemical makes coffee a stimulant?', { group: 'Passage 2', answers: ['caffeine'] }),
  Q('R25', 'reading', 'tfng', 'Decaf coffee contains no caffeine at all.', { group: 'Passage 2', answers: ['False'] }),
  Q('R26', 'reading', 'mcq', 'The passage suggests future coffee farming faces…', { group: 'Passage 2', options: ['low demand', 'climate threats', 'labor surplus'], answers: ['climate threats'] }),
  // Passage 3 — The Science of Sleep
  Q('R27', 'reading', 'mcq', 'Adults need about ____ hours of sleep.', { group: 'Passage 3', options: ['6', '7 to 9', '10'], answers: ['7 to 9'] }),
  Q('R28', 'reading', 'tfng', 'Teenagers need less sleep than adults.', { group: 'Passage 3', answers: ['False'] }),
  Q('R29', 'reading', 'tfng', 'The passage links poor sleep to weaker immunity.', { group: 'Passage 3', answers: ['True'] }),
  Q('R30', 'reading', 'completion', 'Deep sleep mostly happens in the ____ half of the night.', { group: 'Passage 3', answers: ['first'] }),
  Q('R31', 'reading', 'completion', 'Blue light from screens reduces ____ production.', { group: 'Passage 3', answers: ['melatonin'] }),
  Q('R32', 'reading', 'short', 'What should you avoid drinking after noon?', { group: 'Passage 3', answers: ['coffee', 'caffeine'] }),
  Q('R33', 'reading', 'ynng', 'The writer believes naps are always harmful.', { group: 'Passage 3', answers: ['No'] }),
  Q('R34', 'reading', 'ynng', 'Shift workers are mentioned as an at-risk group.', { group: 'Passage 3', answers: ['Yes'] }),
  Q('R35', 'reading', 'mcq', "The 'sleep debt' idea means…", { group: 'Passage 3', options: ['lost sleep must be repaid', 'sleep is unimportant', 'dreams predict health'], answers: ['lost sleep must be repaid'] }),
  Q('R36', 'reading', 'completion', 'A short nap of ____ minutes can boost alertness.', { group: 'Passage 3', answers: ['20'] }),
  Q('R37', 'reading', 'short', 'What should bedrooms be kept free of?', { group: 'Passage 3', answers: ['screens', 'electronic devices'] }),
  Q('R38', 'reading', 'tfng', 'The passage recommends sleeping pills for everyone.', { group: 'Passage 3', answers: ['False'] }),
  Q('R39', 'reading', 'mcq', "The writer's main advice is to…", { group: 'Passage 3', options: ['keep a regular schedule', 'buy a new mattress', 'drink warm milk'], answers: ['keep a regular schedule'] }),
  Q('R40', 'reading', 'completion', 'Good sleep improves memory and ____.', { group: 'Passage 3', answers: ['focus', 'concentration'] }),
];

const test = {
  slug: 'mock-1',
  title: 'Mock Test 1 — Listening + Reading',
  published: true,
  durationMin: 60,
  sections: [
    {
      key: 'listening', title: 'Listening',
      // Audio Cloudinary par upload kar ke yahan URL paste karna hai (Jhon)
      audioUrl: '',
      passages: [],
    },
    {
      key: 'reading', title: 'Reading',
      passages: [
        { title: 'Passage 1 — The Rise of Urban Farming', text: 'Cities are growing food in surprising places. On rooftops in Karachi and Singapore, farmers grow vegetables where offices once stood alone. Vertical farms stack crops in layers under LED lights, using 95% less water than open fields. Singapore, which imports over 90% of its food, now aims to produce 30% locally by 2030. Community gardens do more than feed people — studies link them to better mental health and stronger neighbourhoods. The biggest challenge remains high rent: city land is expensive, and not every farm survives. Still, with rapid growth in the sector, the writer is positive that urban farming is here to stay — not to replace rural farms, but to sit beside them.' },
        { title: 'Passage 2 — How Coffee Changed Mornings', text: 'Legend says an Ethiopian goat herder noticed his goats dancing after eating coffee cherries. From Yemen, where coffee first became popular, it spread to the world. In 17th-century London, coffee houses were called "penny universities" — for a penny, anyone could hear the news and debate ideas. The word cappuccino comes from Italian monks, whose brown robes matched the drink\'s colour. A latte is one-third espresso and two-thirds steamed milk; a cappuccino wears a thick layer of foam; an espresso is small, strong and black. Caffeine, the stimulant in coffee, is why decaf still contains a little of it — never zero. Today the global coffee trade is worth over $100 billion a year, but climate threats now endanger the farms of the future.' },
        { title: 'Passage 3 — The Science of Sleep', text: 'Adults need 7 to 9 hours of sleep, yet teenagers need even more — not less. During the first half of the night, deep sleep repairs the body; later, dream sleep organises memory. Blue light from screens reduces melatonin, the hormone that invites sleep, so experts advise no screens before bed and no coffee or caffeine after noon. Poor sleep weakens immunity and harms focus. Shift workers are a known at-risk group. The idea of "sleep debt" means lost sleep must be repaid — you cannot train yourself to need less. A 20-minute nap can boost alertness, but the writer does not believe naps are always harmful, nor does the passage recommend sleeping pills for everyone. The main advice is simple: keep a regular schedule. Good sleep improves memory and concentration.' },
      ],
    },
  ],
  questions: [...listening, ...reading],
};

async function main() {
  await connectDB();
  await MockTest.findOneAndUpdate({ slug: test.slug }, test, { upsert: true, new: true });
  console.log(`Seeded "${test.title}" (${test.questions.length} questions)`);

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
  // Pehle se maujood user ho to sirf role=admin kar dega.
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
