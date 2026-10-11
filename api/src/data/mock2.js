const Q = (qid, section, type, prompt, extra = {}) => ({ qid, section, type, prompt, ...extra });

const LISTENING_SCRIPT = `Lecturer: Section 1. You will hear a conversation between a student and a receptionist at a language school. First, you have some time to look at questions 1 to 10.
Woman: Good morning. I'd like some information about your Spanish courses, please.
Man: Certainly. Are you a complete beginner, or have you studied Spanish before?
Woman: I learned some at school, and I can manage simple conversations, but my grammar is quite weak.
Man: Then I'd suggest the intermediate level. The beginners' class would be too slow for you, and the advanced group is for people who have lived in a Spanish-speaking country.
Woman: Intermediate sounds right. When do the classes meet?
Man: The intermediate group meets twice a week, on Tuesday and Thursday evenings.
Woman: What time?
Man: The class starts at half past six and finishes at eight. Most of our students come straight from work.
Woman: That's perfect. And how long does the course run?
Man: It's a ten-week course, and the new term begins on the fourteenth of October.
Woman: So if I join this term, I'd finish before Christmas. How much does it cost?
Man: The full course is two hundred and forty pounds. That includes the textbook, which normally costs twenty-five pounds on its own.
Woman: That seems reasonable. How can I pay? Do you take cash?
Man: We accept cash and cards here at the desk, but most students find it easier to pay by bank transfer.
Woman: I'll do that, then. I'll pay by bank transfer next week, if that's acceptable.
Man: That's fine, as long as we receive it before your first class. Now, let me take your details. What's your full name?
Woman: Anna Kowalski. That's K-O-W-A-L-S-K-I.
Man: Thank you. And a contact number?
Woman: My mobile is oh seven seven zero zero, nine zero zero, four six one.
Man: Let me check I've got that right: 07700 900 461.
Woman: That's correct.
Man: Wonderful. I'll reserve your place, and I'll email you the bank details this afternoon.
Lecturer: Section 2. You will hear a guide talking to visitors at a local recycling centre. First, you have some time to look at questions 11 to 20.
Woman: Good morning, everyone, and welcome to the Green Valley Recycling Centre. Before we start the tour, let me tell you a little about how the centre works, because it will help you sort your waste correctly when you visit us with your own rubbish. First, our opening hours. The centre is open six days a week, from eight in the morning until six in the evening. We are closed on Mondays, because that's when the heavy machinery is serviced, so please don't come then; you'll find the gates locked. Now, what can you bring here? We accept most household waste: paper, cardboard, glass bottles and jars, metal cans, garden waste and electrical items. One thing we cannot accept, unfortunately, is plastic bags. They get tangled in the sorting machines, so please empty your recyclables into the containers loose, and take your bags home with you. Car batteries, by the way, are fine; there is a special sealed container for them next to the oil bank. For clothing and shoes, please use the textile bank by the main gate. Don't put clothes in the green bin, which is for garden waste only, or in the brown caddy, which is for food waste. If you have furniture that is still in good condition, don't throw it away. Take it to the Reuse Corner, the building on your left as you come in. Volunteers clean and repair the items, and they are sold cheaply to local families. Anything we can't sell is broken up for recycling. We also run activities here. On Wednesdays, we welcome school groups for guided tours; teachers should book at least two weeks ahead. And on the first Saturday of every month, our repair café opens in the education room, where volunteers will try to fix your broken lamps, toasters and bicycles free of charge. If you have something too big to bring yourself, like a sofa or a fridge, the council offers a home collection service. It costs fifteen pounds per visit, and you can book by phone or on our website. The centre itself is not very old. It opened in two thousand and thirteen, on the site of the old gasworks, and last year we welcomed over ninety thousand visitors. Oh, one last thing. In the spring we give away free compost made from the garden waste you bring us. If you'd like some, just bring your own bag or bucket; we don't provide containers. Right, let's begin the tour.
Lecturer: Section 3. You will hear two students, Sara and Tom, discussing their group project with their tutor. First, you have some time to look at questions 21 to 30.
Woman: So, Tom, our presentation is on the twenty-second of November; that's less than three weeks away. We really need to be organised.
Man: Agreed. Remind me of the exact title again?
Woman: We're proposing solar panels for the library roof: how much electricity they would generate, what they would cost, and how long they would take to pay for themselves.
Man: Right. At one point I thought we were going to do the wind farm on the coast.
Woman: We dropped that idea; the data was too hard to get. The library plan is much more practical. Now, the first task is the student survey, to find out whether students support the idea.
Man: Who's writing the questionnaire?
Woman: I will. I'll design the questionnaire this weekend, and you can check it on Monday. We should aim to survey one hundred and fifty students; that's what Dr Patel suggested.
Man: Fine. Have we spoken to the facilities manager yet? He knows the roof better than anyone.
Woman: Not yet, no. I've emailed him twice, but he hasn't replied. We still haven't managed to interview him, and we need his figures for the size of the roof.
Man: Annoying. What's the main technical problem we have to deal with?
Woman: The big one is that the main roof faces north, so the panels would get less direct sun in winter. We have to be honest about that in the report, and suggest the sports hall's south-facing roof as a possible second phase.
Woman2: Hello, you two. How is the project going?
Man: Not bad, Dr Patel. We're a bit worried about the budget, actually. Our estimate came to just under twelve thousand pounds.
Woman2: Let me reassure you. I've looked at your figures, and your cost estimate is realistic. Suppliers' prices have come down a lot in the last two years. So, what are your next steps?
Woman: On Friday we're going up onto the library roof with the caretaker, to take measurements and photographs.
Woman2: Excellent. And remember, in the presentation each of you should speak for about eight minutes, no more. If you want to practise, book the seminar room, Room 204; it's free most afternoons.
Man: Thanks, Dr Patel, we will.
Lecturer: Section 4. You will hear a lecture about the history of maps. First, you have some time to look at questions 31 to 40.
Lecturer: Good afternoon. Today's lecture traces the history of map-making, and I'd like to begin with the earliest surviving world map. It was made in Babylon, in what is now Iraq, over two and a half thousand years ago, and it wasn't drawn on paper or skin, but carved into a clay tablet, small enough to hold in one hand. The world it shows is a flat circle surrounded by ocean, with Babylon at its centre; a reminder that map-makers have always placed their own home at the centre of things. The first truly scientific approach came with the Greeks. In the second century AD, the astronomer Ptolemy, working in the great library at Alexandria in Egypt, produced a guide to drawing maps of the known world, complete with a grid of latitude and longitude. His work was lost to Europe for over a thousand years, and when it was rediscovered in the fifteenth century, it transformed European map-making. Medieval European maps, by contrast, were not really about geography at all. They were religious pictures: on these maps, Jerusalem was placed at the exact centre of the world, the top of the map pointed east, towards paradise, and accuracy mattered far less than the message. Everything changed in the age of exploration. In 1569, the Flemish map-maker Gerardus Mercator published the projection that still bears his name. Mercator's great achievement was practical: on his map, a straight line is a line of constant compass direction, so it let sailors plot a course across an ocean and follow it with a compass. The price of this convenience was distortion: countries near the poles appear far larger than they really are, but for navigation, the projection was revolutionary. Knowing where you were, however, remained a problem. Latitude could be worked out from the sun and the stars, but longitude, how far east or west you were, defeated sailors for centuries. Ships were lost because captains simply did not know their position. The answer, when it finally came in the eighteenth century, was a reliable clock that could keep accurate time at sea: the marine chronometer. With such a clock, a sailor could compare local time with the time at a known port and calculate his longitude exactly. Meanwhile, governments began to map their own countries in serious detail. Britain's national mapping agency, the Ordnance Survey, was founded in 1791, largely for military reasons: after a rebellion in Scotland, the army wanted reliable maps of the whole country. I should also mention the mapping of the Pacific. It is sometimes said that the first European charts of that ocean were based purely on guesswork. In fact, they were far from it: the best charts drew on the detailed logs kept by Dutch and Spanish sailors, who recorded winds, currents and coastlines with great care. In the twentieth century, aeroplane photography and then satellite images gave map-makers a view from above for the first time. And today, of course, we carry digital maps in our pockets. What can these do that paper maps cannot? Above all, they can update themselves and show the user's exact position in real time, something no printed sheet could ever do. I'd like to finish with a thought. The technology changes, but the oldest question in map-making is still with us. Every map-maker, from the Babylonian with his clay tablet to the designers of today's apps, must decide what to leave out. A map that showed everything would be useless. Choosing what to omit: that is the real art of map-making.`;

const P1 = `Few inventions have changed everyday life as much as the bicycle, yet its earliest form would hardly be recognised today. In 1817, a German forestry official named Karl Drais presented a machine made almost entirely of wood: two wheels joined by a frame, a seat, and a handlebar for steering — but no pedals. The rider sat astride it and pushed himself along with his feet. Known as the draisine, it could travel considerably faster than a person on foot, and for a year or two it was a fashionable amusement in the cities of Europe and America.

Pedals arrived in the 1860s, when a Paris company owned by the Michaux family began selling a machine with pedals fixed directly to the front wheel. Riders called it the velocipede, but a less polite nickname stuck: with its solid iron tyres bumping over cobbled streets, it was known as the 'boneshaker'. Cycling was becoming popular, but it was still neither comfortable nor safe.

In the 1870s, manufacturers reasoned that if the pedals drove the front wheel directly, a bigger wheel would travel further with every turn. The result was the penny-farthing, whose front wheel could be one and a half metres across. It was fast, but the rider sat high above the ground, and if the wheel struck a stone, or the rider braked suddenly, he could be thrown headfirst over the handlebars — an accident grimly known as a 'header'.

The breakthrough came in 1885, when John Kemp Starley of Coventry, England, produced the Rover Safety Bicycle. A chain drove the rear wheel, the two wheels were of nearly equal size, and the rider sat low enough to put both feet on the ground. It was called the 'safety' bicycle by contrast with what had gone before, and its basic design has never been abandoned since.

Three years later, in 1888, John Boyd Dunlop, a Scottish veterinary surgeon living in Belfast, invented the pneumatic, or air-filled, tyre. He did not make it for a bicycle of his own: his young son suffered from headaches, and cycling had been recommended for the boy — so Dunlop fitted the child's tricycle with rubber tubes filled with air to soften the ride. The pneumatic tyre made cycling both more comfortable and considerably faster.

During the 1890s, factories began producing bicycles in large numbers, and prices fell sharply. A machine that had once cost a skilled worker a year's wages could now be bought by ordinary working people. Cycling clubs appeared everywhere, and for women in particular the bicycle brought something new: the freedom to travel independently, without a companion or a horse. It even influenced fashion, as campaigners promoted 'rational dress' — looser clothing that made cycling practical.

The modern bicycle keeps the diamond-shaped frame of the 1890s, although steel has largely given way to aluminium and carbon fibre, which are far lighter. The newest development is the electric bicycle, whose small motor assists the rider. By making hills and longer journeys easier, e-bikes have brought cycling back to many older riders and commuters who had given it up — proof that, after two hundred years, the bicycle is still evolving.`;

const P2 = `When a honeybee finds a patch of flowers rich in nectar, she does not keep the news to herself. Back inside the dark hive, she performs a remarkable dance on the vertical surface of the honeycomb, and from this dance her nestmates learn exactly where to fly. The man who first decoded this behaviour was the Austrian zoologist Karl von Frisch, whose patient experiments began in the 1920s; in 1973 he shared a Nobel Prize for his discoveries about how animals communicate.

For food that is not close to the hive, the bee performs what von Frisch called the waggle dance. She runs in a figure of eight, and in the middle of the pattern she makes a straight run, waggling her body from side to side. The straight run contains the message. Its angle, measured against the vertical, matches the angle between the sun and the direction of the flowers, so the watching bees learn which way to fly. Just as importantly, the length of the waggling run indicates the distance of the food: the longer the run, the further away the flowers are. In this way, a dance lasting a few seconds can communicate both direction and distance with surprising accuracy.

When the food is close to home — within about fifty metres — the bee uses a simpler signal, the round dance. She simply runs in a small circle. This tells her nestmates that food is nearby, though it gives no information about direction; the searching bees must find the flowers by scent once they leave the hive.

Dances are only part of the bees' language. Bees also communicate through chemicals called pheromones, which they release and detect by smell. The queen produces a special pheromone which keeps the colony calm and assures the workers that their queen is present and healthy. When the hive is attacked, guard bees release an alarm pheromone — which, strangely, smells of bananas — warning the colony to defend itself. A third chemical, the Nasonov pheromone, is released by workers at the entrance of the hive, and its scent guides returning bees safely home.

There is also communication by taste. A returning forager shares drops of the nectar she has collected with her nestmates, a behaviour known as trophallaxis. By tasting the sample, the other bees learn the flavour and scent of the new food source, so they know exactly what to search for when they reach the flowers.

For decades, scientists assumed that the dance was purely instinctive: that bees were born knowing it. Recent research, however, has shown that this is only partly true. Young bees that grow up without experienced dancers to watch make more errors in their own dances, sending followers in the wrong direction or over the wrong distance. By observing experienced dancers, their performances steadily improve. The dance, it turns out, is partly learned — a kind of culture passed between generations of bees.

Finally, the dance also reports on quality. A bee that has found an especially rich source dances more energetically and repeats the pattern many more times, while a poor source earns only a brief performance. Her audience, it seems, understands the review.`;

const P3 = `The deep ocean is the largest habitat on Earth, and the least known. Below a depth of about two hundred metres, sunlight can no longer penetrate, and the water becomes completely dark and close to freezing. The pressure is immense — at the bottom of the deepest trenches it is more than a tonne on every square centimetre. Yet, as scientists have discovered, even here there is life.

The serious exploration of this world began with the voyage of HMS Challenger, a British naval ship converted for science, which set sail in 1872 and spent nearly four years travelling the world's oceans. The scientists aboard lowered dredges and nets into the depths and hauled up mud, rocks and animals. By the end of the expedition they had identified around 4,700 species that were completely new to science, and their reports eventually filled fifty volumes. Oceanography, the science of the seas, had begun.

For the next great step, humans had to go down themselves. In January 1960, the bathyscaphe Trieste, a deep-diving vessel designed in Switzerland, carried Jacques Piccard and Don Walsh down through nearly 11,000 metres of water to the bottom of the Challenger Deep in the Mariana Trench — the deepest point in all the oceans. No human being returned to that spot for more than fifty years. Rather more practical was Alvin, a small American submersible launched in 1964, which has made thousands of dives since; in 1986, Alvin carried scientists down to explore the wreck of the Titanic, lying nearly four thousand metres below the surface of the Atlantic.

The greatest surprise came in 1977. Until then, scientists had assumed that every living thing on Earth depended, directly or indirectly, on sunlight. Exploring the seabed near the Galápagos Islands, geologists found cracks in the ocean floor where mineral-rich water, heated far below the seabed, poured out at temperatures above 300 degrees Celsius. Around these hydrothermal vents, in total darkness, lived dense communities of giant tube worms, clams and shrimps. They survived because bacteria associated with them produce energy from the chemicals in the vent water — a process called chemosynthesis, a kind of chemical cousin of photosynthesis.

Today, much of the work is done by robots. Autonomous underwater vehicles can survey the seabed for days at a time without a crew, while crewed submersibles are limited by their life-support systems to dives of only a few hours. Even so, progress is slow: despite modern sonar and satellites, only about a quarter of the seafloor has so far been mapped in detail.

Why go to all this trouble? Partly for knowledge, but there are practical prizes too. Deep-sea organisms survive in extreme conditions, and the unusual compounds they produce are being studied as a possible source of new medicines, including antibiotics that might work where existing drugs fail. The seabed also holds polymetallic nodules — potato-sized lumps of metal, rich in cobalt and nickel, scattered across parts of the Pacific floor. Such metals are needed for batteries and green technology, and some companies are eager to collect the nodules. Many scientists, however, warn that these fragile deep-sea ecosystems, which have taken millions of years to develop, could be damaged before we have even catalogued the species living in them, and that recovery, if it happens at all, would be extremely slow. The deep ocean, it is clear, still guards most of its secrets.`;

module.exports = {
  slug: 'mock-2',
  title: 'Full IELTS Mock Test 2',
  kind: 'full',
  durationMin: 165,
  published: true,
  sections: [
    { key: 'listening', title: 'Listening', audioUrl: '/audio/mock2-listening.mp3', transcript: LISTENING_SCRIPT, passages: [] },
    {
      key: 'reading', title: 'Reading', passages: [
        { title: 'The Story of the Bicycle', text: P1 },
        { title: 'The Language of Bees', text: P2 },
        { title: 'Exploring the Deep Ocean', text: P3 },
      ],
    },
    {
      key: 'writing', title: 'Writing', writing: [
        {
          taskType: 'task1',
          title: 'Task 1 — Bar chart',
          text: 'The chart below shows the percentage of households in one town that owned a car, a computer and a washing machine in 1990, 2005 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.',
        },
        {
          taskType: 'task2',
          title: 'Task 2 — Discussion essay',
          text: 'Some people believe that university education should be free for all students. Others argue that students should pay the full cost of their own tuition.\n\nDiscuss both views and give your own opinion.\n\nWrite at least 250 words.',
        },
      ],
    },
    {
      key: 'speaking', title: 'Speaking', speaking: {
        part1: {
          topic: 'Your hometown',
          questions: [
            'Where is your hometown?',
            'Do you like living there? Why or why not?',
            'What is your hometown famous for?',
            'How has your hometown changed in recent years?',
            'Do you know many of the people who live near you?',
            'Would you like to live in your hometown in the future?',
          ],
        },
        part2: {
          cue: 'Describe a journey you have taken that you remember well.',
          points: [
            'where you went',
            'who you went with',
            'what happened during the journey',
            'and explain why you remember this journey so well',
          ],
        },
        part3: {
          topic: 'Travel and tourism',
          questions: [
            'Why do so many people enjoy travelling to other countries?',
            'How has modern technology changed the way people travel?',
            'What are the advantages and disadvantages of tourism for a country?',
            'Do you think people will travel more or less in the future? Why?',
            'Is it better to travel alone or with other people? Why?',
          ],
        },
      },
    },
  ],
  questions: [
    // ===== LISTENING — Section 1: Booking a language course =====
    Q('L1', 'listening', 'completion', 'The student decides to study ______ at the school.', { group: 'Section 1', answers: ['Spanish'] }),
    Q('L2', 'listening', 'completion', 'The receptionist recommends the ______ level for her.', { group: 'Section 1', answers: ['intermediate'] }),
    Q('L3', 'listening', 'completion', 'Classes are held on Tuesday and ______ evenings.', { group: 'Section 1', answers: ['Thursday', 'Thursdays'] }),
    Q('L4', 'listening', 'completion', 'Each class begins at ______.', { group: 'Section 1', answers: ['6.30', '6:30', 'half past six', '6.30 pm', '6:30 pm'] }),
    Q('L5', 'listening', 'completion', 'The course lasts for ______.', { group: 'Section 1', answers: ['10 weeks', 'ten weeks'] }),
    Q('L6', 'listening', 'completion', 'The total cost of the course is ______.', { group: 'Section 1', answers: ['£240', '240 pounds', '240'] }),
    Q('L7', 'listening', 'completion', "The student's surname is ______.", { group: 'Section 1', answers: ['Kowalski'] }),
    Q('L8', 'listening', 'completion', "The student's mobile number is ______.", { group: 'Section 1', answers: ['07700 900 461', '07700900461'] }),
    Q('L9', 'listening', 'mcq', 'How does the student decide to pay for the course?', { group: 'Section 1', options: ['In cash today', 'By card today', 'By bank transfer next week'], answers: ['By bank transfer next week'] }),
    Q('L10', 'listening', 'completion', 'The new course starts on ______.', { group: 'Section 1', answers: ['14 October', 'October 14', 'the 14th of October'] }),
    // ===== LISTENING — Section 2: A recycling centre =====
    Q('L11', 'listening', 'completion', 'The recycling centre is open ______ days a week.', { group: 'Section 2', answers: ['six', '6'] }),
    Q('L12', 'listening', 'completion', 'The centre is closed on ______.', { group: 'Section 2', answers: ['Mondays', 'Monday'] }),
    Q('L13', 'listening', 'mcq', 'Which item can visitors NOT recycle at the centre?', { group: 'Section 2', options: ['Glass bottles', 'Car batteries', 'Plastic bags'], answers: ['Plastic bags'] }),
    Q('L14', 'listening', 'completion', 'Furniture in good condition should be taken to the ______.', { group: 'Section 2', answers: ['Reuse Corner', 'the Reuse Corner'] }),
    Q('L15', 'listening', 'completion', 'Guided tours for school groups take place on ______.', { group: 'Section 2', answers: ['Wednesdays', 'Wednesday'] }),
    Q('L16', 'listening', 'matching', 'Visitors should put old clothing in ______.', { group: 'Section 2', options: ['the green bin', 'the brown caddy', 'the textile bank'], answers: ['the textile bank'] }),
    Q('L17', 'listening', 'completion', 'The repair café is held on ______ of every month.', { group: 'Section 2', answers: ['the first Saturday', 'the first Saturday of the month', 'first Saturday'] }),
    Q('L18', 'listening', 'completion', 'A home collection for a large item costs ______.', { group: 'Section 2', answers: ['£15', '15 pounds', '15'] }),
    Q('L19', 'listening', 'mcq', 'In which year did the recycling centre open?', { group: 'Section 2', options: ['2009', '2013', '2018'], answers: ['2013'] }),
    Q('L20', 'listening', 'short', 'What must visitors bring with them if they want to collect free compost?', { group: 'Section 2', answers: ['a bag or bucket', 'their own bag or bucket', 'a bag', 'a bucket'] }),
    // ===== LISTENING — Section 3: A group project on renewable energy =====
    Q('L21', 'listening', 'mcq', 'What is the subject of the students\' project?', { group: 'Section 3', options: ['Solar panels for the library roof', 'A wind farm on the coast', 'Recycling bins in student halls'], answers: ['Solar panels for the library roof'] }),
    Q('L22', 'listening', 'completion', "The students' presentation will take place on ______.", { group: 'Section 3', answers: ['22 November', 'November 22', 'the 22nd of November'] }),
    Q('L23', 'listening', 'completion', '______ will design the student questionnaire.', { group: 'Section 3', answers: ['Sara'] }),
    Q('L24', 'listening', 'completion', 'The students hope to survey ______ students.', { group: 'Section 3', answers: ['150', 'one hundred and fifty'] }),
    Q('L25', 'listening', 'tfng', 'The students have already interviewed the facilities manager.', { group: 'Section 3', answers: ['False'] }),
    Q('L26', 'listening', 'tfng', "Dr Patel thinks that the students' cost estimate is realistic.", { group: 'Section 3', answers: ['True'] }),
    Q('L27', 'listening', 'completion', 'The main technical problem is that the library roof ______.', { group: 'Section 3', answers: ['faces north'] }),
    Q('L28', 'listening', 'mcq', 'What is the next step the students agree to take?', { group: 'Section 3', options: ['Measure the library roof with the caretaker', 'Book Room 204 for a practice session', 'Write the final report this weekend'], answers: ['Measure the library roof with the caretaker'] }),
    Q('L29', 'listening', 'completion', 'Each student will speak for ______ during the presentation.', { group: 'Section 3', answers: ['eight minutes', '8 minutes'] }),
    Q('L30', 'listening', 'short', 'Where does Dr Patel suggest the students practise their presentation?', { group: 'Section 3', answers: ['Room 204', 'the seminar room', 'Room 204, the seminar room'] }),
    // ===== LISTENING — Section 4: The history of maps =====
    Q('L31', 'listening', 'completion', 'The earliest surviving world map was made on a ______.', { group: 'Section 4', answers: ['clay tablet', 'a clay tablet'] }),
    Q('L32', 'listening', 'completion', 'Ptolemy worked in the Egyptian city of ______.', { group: 'Section 4', answers: ['Alexandria'] }),
    Q('L33', 'listening', 'tfng', 'On medieval European maps, Jerusalem was placed at the centre of the world.', { group: 'Section 4', answers: ['True'] }),
    Q('L34', 'listening', 'completion', 'Mercator published his famous map projection in ______.', { group: 'Section 4', answers: ['1569'] }),
    Q('L35', 'listening', 'mcq', "Why was Mercator's projection so useful for sailors?", { group: 'Section 4', options: ['It showed countries at their true size', 'It let sailors follow a straight compass course', 'It was the first map printed in colour'], answers: ['It let sailors follow a straight compass course'] }),
    Q('L36', 'listening', 'completion', 'Sailors could only calculate longitude accurately after the invention of a reliable ______.', { group: 'Section 4', answers: ['clock', 'chronometer', 'marine chronometer'] }),
    Q('L37', 'listening', 'tfng', 'The lecturer says that the first European charts of the Pacific were based purely on guesswork.', { group: 'Section 4', answers: ['False'] }),
    Q('L38', 'listening', 'completion', "Britain's Ordnance Survey was founded in ______.", { group: 'Section 4', answers: ['1791'] }),
    Q('L39', 'listening', 'mcq', 'According to the lecturer, what can digital maps do that paper maps cannot?', { group: 'Section 4', options: ["They can update and show the user's position in real time", 'They are always cheaper than paper maps', 'They never need electricity'], answers: ["They can update and show the user's position in real time"] }),
    Q('L40', 'listening', 'short', 'According to the lecturer, what is the real art of map-making?', { group: 'Section 4', answers: ['what to leave out', 'choosing what to omit', 'deciding what to leave out'] }),
    // ===== READING — Passage 1: The Story of the Bicycle =====
    Q('R1', 'reading', 'tfng', 'The first bicycle, the draisine, was fitted with pedals.', { group: 'Passage 1', answers: ['False'] }),
    Q('R2', 'reading', 'tfng', 'The draisine was built mainly from wood.', { group: 'Passage 1', answers: ['True'] }),
    Q('R3', 'reading', 'completion', 'The draisine was created in the year ______.', { group: 'Passage 1', answers: ['1817'] }),
    Q('R4', 'reading', 'mcq', 'Why was the penny-farthing bicycle dangerous?', { group: 'Passage 1', options: ['The rider sat high above the ground', 'Its wheels were too small', 'It had no chain'], answers: ['The rider sat high above the ground'] }),
    Q('R5', 'reading', 'completion', 'The Rover Safety Bicycle was introduced in ______.', { group: 'Passage 1', answers: ['1885'] }),
    Q('R6', 'reading', 'matching', 'Who created the pneumatic tyre?', { group: 'Passage 1', options: ['Karl Drais', 'John Kemp Starley', 'John Boyd Dunlop'], answers: ['John Boyd Dunlop'] }),
    Q('R7', 'reading', 'tfng', 'Dunlop invented the pneumatic tyre for a bicycle that he rode himself.', { group: 'Passage 1', answers: ['False'] }),
    Q('R8', 'reading', 'completion', 'By the end of the nineteenth century, bicycles had become affordable for ______.', { group: 'Passage 1', answers: ['working people', 'ordinary working people'] }),
    Q('R9', 'reading', 'mcq', 'According to the passage, the bicycle gave many women ______.', { group: 'Passage 1', options: ['the chance to race professionally', 'greater freedom to travel on their own', 'jobs in bicycle factories'], answers: ['greater freedom to travel on their own'] }),
    Q('R10', 'reading', 'short', 'What nickname was given to the pedal bicycle of the 1860s?', { group: 'Passage 1', answers: ['boneshaker', 'the boneshaker'] }),
    Q('R11', 'reading', 'tfng', 'The two wheels of the safety bicycle were of nearly equal size.', { group: 'Passage 1', answers: ['True'] }),
    Q('R12', 'reading', 'completion', 'Modern bicycle frames are often made of aluminium or ______.', { group: 'Passage 1', answers: ['carbon fibre', 'carbon fiber'] }),
    Q('R13', 'reading', 'mcq', 'The passage says electric bicycles are becoming popular mainly because they ______.', { group: 'Passage 1', options: ['are cheaper than all other forms of transport', 'make hills and longer journeys easier', 'never need to be charged'], answers: ['make hills and longer journeys easier'] }),
    // ===== READING — Passage 2: The Language of Bees =====
    Q('R14', 'reading', 'tfng', 'Karl von Frisch received a Nobel Prize for his research on bees.', { group: 'Passage 2', answers: ['True'] }),
    Q('R15', 'reading', 'completion', 'The waggle dance tells other bees both the direction and the ______ of a food source.', { group: 'Passage 2', answers: ['distance'] }),
    Q('R16', 'reading', 'mcq', 'How does the waggle dance show the direction of food?', { group: 'Passage 2', options: ['By the angle of the straight run compared with the sun', "By the speed of the bee's wingbeats", 'By the number of circles the bee makes'], answers: ['By the angle of the straight run compared with the sun'] }),
    Q('R17', 'reading', 'completion', 'The round dance is used when food is less than about ______ metres from the hive.', { group: 'Passage 2', answers: ['50', 'fifty'] }),
    Q('R18', 'reading', 'ynng', 'Bees are able to perform the waggle dance perfectly as soon as they are born.', { group: 'Passage 2', answers: ['No'] }),
    Q('R19', 'reading', 'ynng', "The queen's pheromone helps to keep the colony calm.", { group: 'Passage 2', answers: ['Yes'] }),
    Q('R20', 'reading', 'ynng', 'Bees can tell each other how high above the ground a food source is.', { group: 'Passage 2', answers: ['Not Given'] }),
    Q('R21', 'reading', 'completion', 'The alarm pheromone produced by bees smells of ______.', { group: 'Passage 2', answers: ['bananas', 'banana'] }),
    Q('R22', 'reading', 'mcq', 'When bees share nectar with their nestmates, the nestmates learn ______.', { group: 'Passage 2', options: ['the taste of the new food source', 'the way back to the hive', 'how to perform the dance'], answers: ['the taste of the new food source'] }),
    Q('R23', 'reading', 'matching', 'Which signal guides returning bees to the entrance of the hive?', { group: 'Passage 2', options: ['the waggle dance', 'the Nasonov pheromone', 'the alarm pheromone'], answers: ['the Nasonov pheromone'] }),
    Q('R24', 'reading', 'completion', 'Young bees improve their dancing by watching ______.', { group: 'Passage 2', answers: ['experienced dancers', 'older bees', 'experienced bees'] }),
    Q('R25', 'reading', 'tfng', 'A bee will repeat its dance more often when the food source is of high quality.', { group: 'Passage 2', answers: ['True'] }),
    Q('R26', 'reading', 'short', 'Karl von Frisch was a scientist from which country?', { group: 'Passage 2', answers: ['Austria'] }),
    // ===== READING — Passage 3: Exploring the Deep Ocean =====
    Q('R27', 'reading', 'tfng', 'Some sunlight can reach the deepest parts of the ocean.', { group: 'Passage 3', answers: ['False'] }),
    Q('R28', 'reading', 'completion', 'The research ship HMS Challenger set sail in ______.', { group: 'Passage 3', answers: ['1872'] }),
    Q('R29', 'reading', 'completion', 'The Challenger scientists identified approximately ______ species that were new to science.', { group: 'Passage 3', answers: ['4,700', '4700'] }),
    Q('R30', 'reading', 'mcq', 'The 1960 dive of the Trieste was important because it ______.', { group: 'Passage 3', options: ['reached the deepest point of the ocean', 'found the wreck of the Titanic', 'discovered hydrothermal vents'], answers: ['reached the deepest point of the ocean'] }),
    Q('R31', 'reading', 'completion', 'The Challenger Deep lies nearly ______ metres below the surface of the sea.', { group: 'Passage 3', answers: ['11,000', '11000'] }),
    Q('R32', 'reading', 'tfng', 'Before 1977, most scientists believed that all life on Earth depended on sunlight.', { group: 'Passage 3', answers: ['True'] }),
    Q('R33', 'reading', 'completion', 'The process by which vent bacteria make energy from chemicals is called ______.', { group: 'Passage 3', answers: ['chemosynthesis'] }),
    Q('R34', 'reading', 'ynng', 'The writer believes that deep-sea mining should be banned completely.', { group: 'Passage 3', answers: ['Not Given'] }),
    Q('R35', 'reading', 'ynng', 'The writer says that exploring the deep ocean costs more than exploring space.', { group: 'Passage 3', answers: ['Not Given'] }),
    Q('R36', 'reading', 'mcq', 'How much of the seafloor has so far been mapped in detail?', { group: 'Passage 3', options: ['About a quarter', 'About half', 'Over ninety per cent'], answers: ['About a quarter'] }),
    Q('R37', 'reading', 'completion', 'Polymetallic nodules are rich in cobalt and ______.', { group: 'Passage 3', answers: ['nickel'] }),
    Q('R38', 'reading', 'matching', 'Which vessel carried people to the wreck of the Titanic?', { group: 'Passage 3', options: ['HMS Challenger', 'Trieste', 'Alvin'], answers: ['Alvin'] }),
    Q('R39', 'reading', 'short', 'Apart from minerals, how might deep-sea organisms benefit human health?', { group: 'Passage 3', answers: ['new medicines', 'they may provide new medicines', 'compounds for new medicines', 'new antibiotics'] }),
    Q('R40', 'reading', 'tfng', 'Autonomous underwater vehicles can stay at sea longer than crewed submersibles.', { group: 'Passage 3', answers: ['True'] }),
  ],
};
