// Full IELTS Mock Test 1 — Mock 1 ko upgrade kiya gaya hai: pehle sirf
// Listening + Reading tha, ab charon skills (Writing + Speaking sections),
// listening transcripts (audio in-scripts se banta hai) aur in-project
// audio URL (/audio/mock1-listening.mp3 — Vercel se serve hota hai).
// Slug wahi purana 'mock-1' hai taake maujooda attempts/certificates na tooten.
const Q = (qid, section, type, prompt, extra = {}) => ({ qid, section, type, prompt, ...extra });

const LISTENING_SCRIPT = `SECTION 1
Woman: Good morning, City Central Library. How can I help you?
Woman2: Hello, I would like to become a member, please.
Woman: Of course. I will fill in the form for you. Can I take your full name?
Woman2: Sara Ahmed.
Woman: Thank you. And a contact phone number?
Woman2: Zero three two one, four five six, seven eight nine zero.
Woman: And which membership type would you like? We have standard, student and senior memberships.
Woman2: Student, please. I am at the university here.
Woman: The student membership is five hundred rupees a month.
Woman2: That is fine. And when is the library closed?
Woman: We are open every day except Friday. On weekdays, we open at nine in the morning.
Woman2: How many books can I borrow at one time?
Woman: Students can borrow four books at once, for two weeks.
Woman2: Do I need to bring a photograph for my membership card?
Woman: No, there is no need for a photograph. But when you come to collect your card, please bring your ID card with you.
Woman2: Certainly. And where exactly is the library?
Woman: We are on University Road, just opposite the main gate.

SECTION 2
Woman: Good morning, everyone, and welcome to the City Museum. Before we begin the tour, let me tell you a little about the museum itself. The museum was founded in nineteen seventy-five, and it has grown a lot since then. On the ground floor, you will find three galleries: the history gallery, the science gallery and the children's gallery. This month, our special exhibition is all about trains — the history of the railway in our region. Please remember that photography is not allowed in every gallery. In the history gallery, cameras must stay in your bags, although you may take photos elsewhere. If you get hungry during your visit, the café is on the first floor, next to the lift. Our guided tours start at ten o'clock every morning, so please be here a few minutes early. Students receive a discount of half price on tickets — just show your student card at the desk. Before you leave, do visit the museum shop, which sells postcards, books and small gifts. Our tour today will end back at the main entrance, where we started. And a quick look ahead: next month's exhibition will be about oceans and sea life. Thank you, and enjoy your visit.

SECTION 3
Woman: Hi Ali. Shall we plan our presentation?
Man2: Yes, Maria. I think we should start with statistics — they will get everyone's attention.
Woman: Good idea. I have not finished my slides yet, but I will do them tonight.
Man2: OK. For the introduction — shall we prepare it together, both of us?
Woman: Yes, let us do the introduction together. And I will present the case study in the middle.
Man2: Then I will handle the questions at the end. How long is our presentation slot?
Woman: Fifteen minutes, including questions.
Man2: Let us meet again on Thursday to practise.
Woman: Thursday is good. I will bring my laptop so we can run the slides.
Man2: Did the teacher approve our topic?
Woman: Yes, she approved it yesterday.

SECTION 4
Lecturer: Good afternoon. Today's lecture is about urban gardening — growing food in the city. Let me begin with the benefits. Plants on rooftops can lower the heat inside a building, because the leaves provide shade and cool the air. If you are a beginner, I recommend lettuce: it grows quickly and does not need much space. Most vegetables need about six hours of sunlight every day, so choose a sunny spot. The quality of your soil matters too — the best mixture contains compost, which feeds the plants naturally. Some people grow plants without soil, in water; this method is called hydroponics. Interestingly, hydroponics uses less water than traditional soil gardening, not more. My own first rooftop garden was in Karachi, on top of a small apartment building. Remember to water your plants early in the morning, before the sun gets strong. To attract bees, which we need for pollination, plant plenty of flowers around your vegetables. Finally, I would like to mention our community garden project, where neighbours grow food together on empty land. In my view, the main benefit of urban gardening is simple: fresh food, grown close to home.`;

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

module.exports = {
  slug: 'mock-1',
  title: 'Full IELTS Mock Test 1',
  kind: 'full',
  published: true,
  durationMin: 165,
  sections: [
    {
      key: 'listening', title: 'Listening',
      audioUrl: '/audio/mock1-listening.mp3',
      transcript: LISTENING_SCRIPT,
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
    {
      key: 'writing', title: 'Writing',
      writing: [
        {
          taskType: 'task1', title: 'Task 1 — Bar chart',
          text: 'The chart shows the percentage of households in three Pakistani cities with internet access from 2015 to 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
        },
        {
          taskType: 'task2', title: 'Task 2 — Opinion essay',
          text: 'Some people believe that university education should be free for all students, while others think students should pay for their own tuition. Discuss both views and give your own opinion. Write at least 250 words.',
        },
      ],
    },
    {
      key: 'speaking', title: 'Speaking',
      speaking: {
        part1: {
          topic: 'Home and hometown',
          questions: [
            'Where do you live?',
            'Do you live in a house or an apartment?',
            'What do you like most about your hometown?',
            'How long have you lived there?',
            'Do you know your neighbours well?',
            'Would you like to live in another city in the future? Why?',
          ],
        },
        part2: {
          cue: 'Describe a teacher who helped you a lot.',
          points: [
            'who the teacher was',
            'what subject they taught',
            'how they helped you',
            'and explain why you remember this teacher',
          ],
        },
        part3: {
          topic: 'Education in society',
          questions: [
            'Why do some people prefer to study abroad?',
            'How has technology changed the way teachers teach?',
            'Should school exams be replaced by coursework? Why or why not?',
            'What skills will be most important for jobs in the future?',
            'Do adults learn differently from children?',
          ],
        },
      },
    },
  ],
  questions: [...listening, ...reading],
};
