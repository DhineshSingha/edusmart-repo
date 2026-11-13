/* ============================================================
   MOCK DATA — Texas
   ------------------------------------------------------------
   Everything the prototype displays comes from this one file.
   No database, no server — just JavaScript objects. Your
   engineers replace this file with real API calls and nothing
   else in the app has to change.

   THE STANDARDS BELOW ARE REAL.
   These are the 2021 revised Grade 5 Science TEKS, checked
   against the Texas Education Agency's own published side-by-
   side document, not written from memory. Every knowledge and
   skill statement (5.1 through 5.13) and every student
   expectation is here, with TEA's wording.

   Why that matters more than it sounds: a Texas teacher reads
   "5.6D" the way you read your own phone number. Get a code
   wrong by one letter and the prototype stops being credible
   to the only audience that counts. Curriculum people will
   check this before they look at the layout.

   A note on the codes: written as 5.6D rather than 5.6(D).
   Both are standard in Texas — TEA and lead4ward use the first,
   your current product uses the second. The first is used here
   because it's URL-safe. If you want the parenthesised form on
   screen, that's one formatting function, not a data change.
   ============================================================ */

/* ---------- The teacher using the app ---------- */
export const teacher = {
  name: 'Dhinesh Singha',
  firstName: 'Dhinesh',
  initials: 'DS',
  school: 'Creekside Elementary',
  district: 'Katy ISD',
  course: 'Grade 5 Science',
  state: 'TX',
  assessment: 'STAAR',
}

/* ============================================================
   RESOURCE TYPES
   ------------------------------------------------------------
   The real EduSmart catalogue, taken from the live product's
   own 5E screen. Every type below exists in the product today.

   Three fields carry design decisions worth explaining:

   `phase` — which 5E bucket it belongs to. Note that
   "Teacher Resources" is a SIXTH bucket alongside the five,
   not one of them. The live product gets this right and it
   matters: a Unit Teacher Guide isn't a stage of a lesson,
   it's the thing you read before planning one.

   `scope` — 'teks', 'unit' or 'grade'. This one is new, and
   it's the most useful field here. Six of these resources
   don't vary by student expectation at all: Scope and
   Sequence, Vertical Alignment, Implementation Strategies,
   the Grade Level Material List, the Lab Safety Poster and
   the Student Workbook are grade- or unit-level documents.

   In the live product they appear inside every single TEKS,
   which means the same Lab Safety Poster is listed nineteen
   times and a teacher can't tell which items are actually
   about the standard she opened. Marking the scope lets us
   show them — Dhinesh asked for all of them, and they belong
   here — while saying plainly which ones are shared. Same
   content, honest labelling.

   `forStudents` — whether it costs class time. The tray
   totals "about 40 min of class time", and a Unit Teacher
   Guide shouldn't inflate that number: the teacher reads it
   at her desk on Sunday, not with thirty children waiting.
   ============================================================ */

export const resourceTypes = {
  /* ---- Teacher Resources ---- */
  UNIT_GUIDE: { kind: 'Unit Teacher Guide', blurb: 'Pacing, background science and common misconceptions for the whole unit.', category: 'Teacher Resources', label: 'Unit Teacher Guide', short: 'Guide', media: 'doc', tone: 'good', phase: 'Teacher Resources', scope: 'unit', forStudents: false, mins: 0 },
  WORKBOOK: { kind: 'Student Workbook', blurb: 'The printable student book for this unit, page by page.', category: 'Teacher Resources', label: 'Student Workbook', short: 'Workbook', media: 'doc', tone: 'good', phase: 'Teacher Resources', scope: 'unit', forStudents: false, mins: 0 },
  IMPL: { kind: 'Implementation Strategies', blurb: 'How to run EduSmart in a 45-minute period, with sample weeks.', category: 'Teacher Resources', label: 'Implementation Strategies', short: 'Strategies', media: 'doc', tone: 'good', phase: 'Teacher Resources', scope: 'grade', forStudents: false, mins: 0 },
  SCOPE: { kind: 'Scope and Sequence', blurb: 'The year at a glance, and which TEKS falls in which week.', category: 'Teacher Resources', label: 'Scope and Sequence', short: 'Scope', media: 'doc', tone: 'good', phase: 'Teacher Resources', scope: 'grade', forStudents: false, mins: 0 },
  VERTICAL: { kind: 'Vertical Alignment', blurb: 'What students met in Grade 4 and will meet in Grade 6.', category: 'Teacher Resources', label: 'Vertical Alignment', short: 'Alignment', media: 'doc', tone: 'good', phase: 'Teacher Resources', scope: 'grade', forStudents: false, mins: 0 },

  /* ---- Engage ---- */
  PHENOM: { kind: 'Anchoring Phenomenon', blurb: 'A short, puzzling clip to open the lesson. No explanation yet.', category: 'Instruction', label: 'Anchoring Phenomenon', short: 'Phenom', media: 'video', tone: 'watch', phase: 'Engage', scope: 'teks', forStudents: true, mins: 6 },

  /* ---- Explore ---- */
  INTERACTIVITY: { kind: 'Interactivity', blurb: 'A guided on-screen activity students work through at their own pace.', category: 'Online Activities', label: 'Interactivity', short: 'Interactive', media: 'interactive', tone: 'brand', phase: 'Explore', scope: 'teks', forStudents: true, mins: 12 },
  SIMULATION: { kind: 'Simulation', blurb: 'A model students can manipulate to see what happens when a variable changes.', category: 'Online Activities', label: 'Simulation', short: 'Sim', media: 'interactive', tone: 'brand', phase: 'Explore', scope: 'teks', forStudents: true, mins: 15 },
  LAB: { kind: 'Labs and Activities', blurb: 'A full hands-on investigation with materials list and student sheet.', category: 'Hands-on Activities', label: 'Labs and Activities', short: 'Lab', media: 'doc', tone: 'brand', phase: 'Explore', scope: 'teks', forStudents: true, mins: 35 },
  MATERIALS: { kind: 'Grade Level Material List', blurb: 'Everything to pull from the cupboard, for every lab in this grade.', category: 'Hands-on Activities', label: 'Grade Level Material List', short: 'Materials', media: 'doc', tone: 'neutral', phase: 'Explore', scope: 'grade', forStudents: false, mins: 0 },
  SAFETY: { kind: 'Lab Safety Poster', blurb: 'Printable lab rules for the wall. Required before any investigation.', category: 'Hands-on Activities', label: 'Lab Safety Poster', short: 'Safety', media: 'doc', tone: 'alert', phase: 'Explore', scope: 'grade', forStudents: false, mins: 0 },
  VOCAB: { kind: 'Vocabulary Card', blurb: 'The key terms for this TEKS, with visuals and Spanish equivalents.', category: 'Hands-on Activities', label: 'Vocabulary Card', short: 'Vocab', media: 'doc', tone: 'info', phase: 'Explore', scope: 'teks', forStudents: true, mins: 5 },

  /* ---- Explain ---- */
  IM: { kind: 'Instruction Module & Companion', blurb: 'The core video lesson. Direct instruction with built-in check questions.', category: 'Instruction', label: 'Instruction Module', short: 'IM', media: 'video', tone: 'info', phase: 'Explain', scope: 'teks', forStudents: true, mins: 14 },
  IMC: { kind: 'Instruction Module & Companion', blurb: 'The printable companion students fill in while the module plays.', category: 'Instruction', label: 'IM Companion', short: 'IMC', media: 'doc', tone: 'alert', phase: 'Explain', scope: 'teks', forStudents: true, mins: 10 },
  SR: { kind: 'Student Review & Activities', blurb: 'A short interactive review that reports straight into your gradebook.', category: 'Online Activities', label: 'Student Review', short: 'SR', media: 'interactive', tone: 'brand', phase: 'Explain', scope: 'teks', forStudents: true, mins: 12 },
  ACTIVITIES: { kind: 'Student Review & Activities', blurb: 'Extra practice tasks for students who finish the review early.', category: 'Online Activities', label: 'Student Activities', short: 'Activities', media: 'doc', tone: 'info', phase: 'Explain', scope: 'teks', forStudents: true, mins: 20 },

  /* ---- Elaborate ---- */
  WORDEXPLORER: { kind: 'WordExplorer', blurb: 'A vocabulary practice game built on the key terms for this TEKS.', category: 'Vocabulary & Literacy', label: 'WordExplorer', short: 'WordExplorer', media: 'interactive', tone: 'watch', phase: 'Elaborate', scope: 'teks', forStudents: true, mins: 8 },
  JOURNAL: { kind: 'Journal', blurb: 'A writing prompt that asks students to explain their thinking.', category: 'Vocabulary & Literacy', label: 'Journal', short: 'Journal', media: 'doc', tone: 'good', phase: 'Elaborate', scope: 'teks', forStudents: true, mins: 15 },
  READER: { kind: 'Reader', blurb: 'A short non-fiction text that puts the science in a real context.', category: 'Vocabulary & Literacy', label: 'Reader', short: 'Reader', media: 'doc', tone: 'good', phase: 'Elaborate', scope: 'teks', forStudents: true, mins: 18 },

  /* ---- Evaluate ---- */
  QUIZ: { kind: 'EduSmart Quiz', blurb: 'A quick formative check. Auto-scored, results in your gradebook.', category: 'Assessments', label: 'EduSmart Quiz', short: 'Quiz', media: 'assessment', tone: 'watch', phase: 'Evaluate', scope: 'teks', forStudents: true, mins: 15 },
  ASSESS: { kind: 'Assessment', blurb: 'A STAAR-style assessment using released-item question formats.', category: 'Assessments', label: 'Assessment', short: 'Assessment', media: 'assessment', tone: 'alert', phase: 'Evaluate', scope: 'teks', forStudents: true, mins: 40 },
}

/* ============================================================
   RESOURCE CATEGORIES — the live product's own taxonomy
   ------------------------------------------------------------
   Six categories, taken verbatim from EduSmart's "Resource
   Type" screen. Not invented here.

   I had guessed fifteen categories by reading the 5E screen and
   treating every resource type as its own category. Wrong, and
   worth noting why: I inferred a taxonomy from the wrong screen
   when the product already had one on a screen I hadn't seen.

   Theirs is better, and not just smaller. It groups by HOW a
   resource is delivered — Online Activities vs Hands-on
   Activities — which is a real constraint in a real classroom.
   A teacher with the laptop cart booked picks one; a teacher
   running a lab day picks the other. That's a decision the
   grouping makes for her, which is what a good category does.

   One oddity, kept as-is: "Vocabulary Card" sits under Hands-on
   Activities even though "Vocabulary & Literacy" is its own
   category. That's how the live product groups it. Following
   their model rather than quietly correcting it — but it looks
   like a miscategorisation and is worth asking about.
   ============================================================ */
export const resourceCategories = [
  'Instruction',
  'Online Activities',
  'Hands-on Activities',
  'Vocabulary & Literacy',
  'Assessments',
  /* Last, for the same reason it's last in the 5E chips: it's
     reference material, and putting it first makes a teacher
     walk past five documents she can't assign. */
  'Teacher Resources',
]

/* Six buckets, not five. "Teacher Resources" leads because a
   teacher planning a unit reads it before anything else. */
export const phases = [
  'Teacher Resources',
  'Engage',
  'Explore',
  'Explain',
  'Elaborate',
  'Evaluate',
]

/* Kept as an alias: some screens only want the instructional
   phases, without the teacher-facing bucket. */
export const fiveE = phases.slice(1)

/* ============================================================
   THE TEKS
   ------------------------------------------------------------
   Grouped the way STAAR reports them, which is also the way a
   Texas teacher plans: four content strands that carry the
   tested material, then the process strands that run through
   everything.

   `process: true` marks the two strands that aren't taught as
   units — they're embedded in every lesson. The Library shows
   them separately and collapsed, because a teacher planning
   Tuesday is choosing between content strands, not between
   "analyze data" and "ask questions".
   ============================================================ */

export const units = [
  {
    id: 'u-matter',
    name: 'Matter and Energy',
    statement: '5.6',
    strand: 'Reporting Category 1',
    icon: 'beaker',
    blurb:
      'The student knows that matter has measurable physical properties that determine how matter is identified, classified, changed, and used.',
    standards: [
      {
        id: '5.6A',
        title: 'Physical properties of matter',
        subtopics: ['Classification of Matter', 'Mass', 'Relative Density', 'Thermal Conductors and Insulators', 'Conductors and Insulators of Electricity'],
        text: 'Compare and contrast matter based on measurable, testable, or observable physical properties, including mass, magnetism, relative density (sinking and floating using water as a reference point), physical state (solid, liquid, gas), volume, solubility in water, and the ability to conduct or insulate thermal energy and electric energy.',
        tested: true,
      },
      {
        id: '5.6B',
        title: 'Mixtures keep their properties',
        subtopics: ['Mixtures of Solids', 'Separating a Mixture', 'Properties After Mixing'],
        text: 'Demonstrate and explain that some mixtures maintain physical properties of their substances such as iron filings and sand or sand and water.',
        tested: true,
      },
      {
        id: '5.6C',
        title: 'Solutions and conservation of matter',
        subtopics: ['Forming a Solution', 'Conservation of Matter in Solutions', 'Recovering a Dissolved Substance'],
        text: 'Compare the properties of substances before and after they are combined into a solution and demonstrate that matter is conserved in solutions.',
        tested: true,
      },
      {
        id: '5.6D',
        title: 'Particles too small to be seen',
        subtopics: ['Particles in Solids', 'Particles in Liquids', 'Particles in Gases'],
        text: 'Illustrate how matter is made up of particles that are too small to be seen such as air in a balloon.',
        tested: true,
      },
    ],
  },
  {
    id: 'u-force',
    name: 'Force, Motion, and Energy',
    statement: '5.7 – 5.8',
    strand: 'Reporting Category 2',
    icon: 'zap',
    blurb:
      'The student knows the nature of forces and the patterns of their interactions, and that energy is everywhere and can be observed in cycles, patterns, and systems.',
    standards: [
      {
        id: '5.7A',
        title: 'Equal and unequal forces',
        subtopics: ['Balanced Forces', 'Unbalanced Forces', 'Transfer of Energy in Collisions'],
        text: 'Investigate and explain how equal and unequal forces acting on an object cause patterns of motion and transfer of energy.',
        tested: true,
      },
      {
        id: '5.7B',
        title: 'Designing a force investigation',
        subtopics: ['Planning a Fair Test', 'Car on a Ramp', 'Balloon Rocket on a String'],
        text: 'Design a simple experimental investigation that tests the effect of force on an object in a system such as a car on a ramp or a balloon rocket on a string.',
        tested: true,
      },
      {
        id: '5.8A',
        title: 'Energy transformation',
        subtopics: ['Chemical to Electrical Energy', 'Electrical to Light Energy', 'Energy in a Flashlight'],
        text: 'Investigate and describe the transformation of energy in systems such as energy in a flashlight battery that changes from chemical energy to electrical energy to light energy.',
        tested: true,
      },
      {
        id: '5.8B',
        title: 'Complete circuits',
        subtopics: ['Parts of a Circuit', 'Open and Closed Circuits', 'Circuits that Make Light and Sound'],
        text: 'Demonstrate that electrical energy in complete circuits can be transformed into motion, light, sound, or thermal energy and identify the requirements for a functioning electrical circuit.',
        tested: true,
      },
      {
        id: '5.8C',
        title: 'How light travels',
        subtopics: ['Light Travels in Straight Lines', 'Reflection', 'Refraction and Absorption'],
        text: 'Demonstrate and explain how light travels in a straight line and can be reflected, refracted, or absorbed.',
        tested: true,
      },
    ],
  },
  {
    id: 'u-earth',
    name: 'Earth and Space',
    statement: '5.9 – 5.11',
    strand: 'Reporting Category 3',
    icon: 'orbit',
    blurb:
      'The student recognizes patterns among the Sun, Earth, and Moon system, knows that there are recognizable patterns and processes on Earth, and understands how natural resources can be managed.',
    standards: [
      {
        id: '5.9A',
        title: 'Earth’s rotation and the day/night cycle',
        subtopics: ['The Day and Night Cycle', 'Apparent Movement of the Sun', 'Shadows Through the Day'],
        text: 'Demonstrate that Earth rotates on its axis once approximately every 24 hours and explain how that causes the day/night cycle and the appearance of the Sun moving across the sky, resulting in changes in shadow positions and shapes.',
        tested: true,
      },
      {
        id: '5.10A',
        title: 'The Sun, the ocean and the water cycle',
        subtopics: ['Evaporation and the Sun', 'Condensation and Clouds', 'Precipitation and Runoff'],
        text: 'Explain how the Sun and the ocean interact in the water cycle.',
        tested: true,
      },
      {
        id: '5.10B',
        title: 'Sedimentary rocks and fossil fuels',
        subtopics: ['Layers and Deposition', 'Forming Sedimentary Rock', 'Forming Fossil Fuels'],
        text: 'Model and describe the processes that led to the formation of sedimentary rocks and fossil fuels.',
        tested: true,
      },
      {
        id: '5.10C',
        title: 'Landforms from wind, water and ice',
        subtopics: ['Deltas', 'Canyons', 'Sand Dunes'],
        text: 'Model and identify how changes to Earth’s surface by wind, water, or ice result in the formation of landforms, including deltas, canyons, and sand dunes.',
        tested: true,
      },
      {
        id: '5.11A',
        title: 'Managing natural resources',
        subtopics: ['Conservation', 'Recycling', 'Proper Disposal'],
        text: 'Design and explain solutions such as conservation, recycling, or proper disposal to minimize environmental impact of the use of natural resources.',
        tested: true,
      },
    ],
  },
  {
    id: 'u-organisms',
    name: 'Organisms and Environments',
    statement: '5.12 – 5.13',
    strand: 'Reporting Category 4',
    icon: 'leaf',
    blurb:
      'The student describes patterns, cycles, systems, and relationships within environments, and knows that organisms have structures and behaviors that help them survive.',
    standards: [
      {
        id: '5.12A',
        title: 'Biotic and abiotic factors',
        subtopics: ['Biotic Factors', 'Abiotic Factors', 'Interactions in an Ecosystem'],
        text: 'Observe and describe how a variety of organisms survive by interacting with biotic and abiotic factors in a healthy ecosystem.',
        tested: true,
      },
      {
        id: '5.12B',
        title: 'Changes in a food web',
        subtopics: ['Producers and Consumers', 'Energy Flow in a Food Web', 'Effects of Change'],
        text: 'Predict how changes in the ecosystem affect the cycling of matter and flow of energy in a food web.',
        tested: true,
      },
      {
        id: '5.12C',
        title: 'Human impact on ecosystems',
        subtopics: ['What Makes an Ecosystem Healthy', 'Harmful Human Activity', 'Beneficial Human Activity'],
        text: 'Describe a healthy ecosystem and how human activities can be beneficial or harmful to an ecosystem.',
        tested: true,
      },
      {
        id: '5.13A',
        title: 'Structures and functions for survival',
        subtopics: ['Plant Structures', 'Animal Structures', 'Surviving in the Same Environment'],
        text: 'Analyze the structures and functions of different species to identify how organisms survive in the same environment.',
        tested: true,
      },
      {
        id: '5.13B',
        title: 'Instinctual and learned behaviors',
        subtopics: ['Instinctual Traits', 'Learned Traits', 'Traits and Survival'],
        text: 'Explain how instinctual behavioral traits such as turtle hatchlings returning to the sea and learned behavioral traits such as orcas hunting in packs increase chances of survival.',
        tested: true,
      },
    ],
  },

  /* ---- The process strands ---- */
  {
    id: 'u-sep',
    name: 'Scientific and Engineering Practices',
    statement: '5.1 – 5.4',
    strand: 'Process standards',
    icon: 'flask',
    process: true,
    blurb:
      'Assessed inside content questions rather than on their own. Taught through every unit, not as a unit.',
    standards: [
      {
        id: '5.1A',
        title: 'Ask questions, define problems',
        text: 'Ask questions and define problems based on observations or information from text, phenomena, models, or investigations.',
        tested: false,
      },
      {
        id: '5.1B',
        title: 'Plan and conduct investigations',
        text: 'Use scientific practices to plan and conduct descriptive investigations and use engineering practices to design solutions to problems.',
        tested: false,
      },
      {
        id: '5.1C',
        title: 'Safe practices',
        text: 'Demonstrate safe practices and the use of safety equipment during classroom and field investigations as outlined in Texas Education Agency-approved safety standards.',
        tested: false,
      },
      {
        id: '5.1D',
        title: 'Use scientific tools',
        text: 'Use tools, including calculators, microscopes, hand lenses, metric rulers, Celsius thermometers, prisms, lenses, mirrors, digital scales, balances, spring scales, graduated cylinders, beakers, hot plates, meter sticks, magnets, collecting nets, notebooks, timing devices, and materials for building circuits, to observe, measure, test, and analyze information.',
        tested: false,
      },
      {
        id: '5.1E',
        title: 'Collect evidence',
        text: 'Collect observations and measurements as evidence.',
        tested: false,
      },
      {
        id: '5.1F',
        title: 'Graphic organizers for data',
        text: 'Construct appropriate graphic organizers to collect data, including tables, bar graphs, line graphs, tree maps, concept maps, Venn diagrams, flow charts or sequence maps, and input-output tables that show cause and effect.',
        tested: false,
      },
      {
        id: '5.1G',
        title: 'Develop and use models',
        text: 'Develop and use models to represent phenomena, objects, and processes or design a prototype for a solution to a problem.',
        tested: false,
      },
      {
        id: '5.2A',
        title: 'Advantages and limits of models',
        text: 'Identify advantages and limitations of models such as their size, scale, properties, and materials.',
        tested: false,
      },
      {
        id: '5.2B',
        title: 'Analyze data',
        text: 'Analyze data by identifying any significant features, patterns, or sources of error.',
        tested: false,
      },
      {
        id: '5.2C',
        title: 'Mathematical comparison',
        text: 'Use mathematical calculations to compare patterns and relationships.',
        tested: false,
      },
      {
        id: '5.2D',
        title: 'Evaluate designs',
        text: 'Evaluate experimental and engineering designs.',
        tested: false,
      },
      {
        id: '5.3A',
        title: 'Evidence-based explanations',
        text: 'Develop explanations and propose solutions supported by data and models.',
        tested: false,
      },
      {
        id: '5.3B',
        title: 'Communicate findings',
        text: 'Communicate explanations and solutions individually and collaboratively in a variety of settings and formats.',
        tested: false,
      },
      {
        id: '5.3C',
        title: 'Scientific discussion',
        text: "Listen actively to others' explanations to identify relevant evidence and engage respectfully in scientific discussion.",
        tested: false,
      },
      {
        id: '5.4A',
        title: 'Science and society',
        text: 'Explain how scientific discoveries and innovative solutions to problems impact science and society.',
        tested: false,
      },
      {
        id: '5.4B',
        title: 'STEM careers',
        text: 'Research and explore resources such as museums, libraries, professional organizations, private companies, online platforms, and mentors employed in a STEM field to investigate STEM careers.',
        tested: false,
      },
    ],
  },
  {
    id: 'u-rtc',
    name: 'Recurring Themes and Concepts',
    statement: '5.5',
    strand: 'Process standards',
    icon: 'repeat',
    process: true,
    blurb:
      'The framework that connects the strands. Woven through instruction rather than taught on its own.',
    standards: [
      {
        id: '5.5A',
        title: 'Patterns',
        text: 'Identify and use patterns to explain scientific phenomena or to design solutions.',
        tested: false,
      },
      {
        id: '5.5B',
        title: 'Cause and effect',
        text: 'Identify and investigate cause-and-effect relationships to explain scientific phenomena or analyze problems.',
        tested: false,
      },
      {
        id: '5.5C',
        title: 'Scale, proportion and quantity',
        text: 'Use scale, proportion, and quantity to describe, compare, or model different systems.',
        tested: false,
      },
      {
        id: '5.5D',
        title: 'Systems and system models',
        text: 'Examine and model the parts of a system and their interdependence in the function of the system.',
        tested: false,
      },
      {
        id: '5.5E',
        title: 'Energy and matter in systems',
        text: 'Investigate how energy flows and matter cycles through systems and how matter is conserved.',
        tested: false,
      },
      {
        id: '5.5F',
        title: 'Structure and function',
        text: 'Explain the relationship between the structure and function of objects, organisms, and systems.',
        tested: false,
      },
      {
        id: '5.5G',
        title: 'Stability and change',
        text: 'Explain how factors or conditions impact stability and change in objects, organisms, and systems.',
        tested: false,
      },
    ],
  },
]

export const contentUnits = units.filter((u) => !u.process)
export const processUnits = units.filter((u) => u.process)

export const allStandards = units.flatMap((u) =>
  u.standards.map((s) => ({
    ...s,
    unitId: u.id,
    unitName: u.name,
    process: !!u.process,
  }))
)

export function getStandard(id) {
  return allStandards.find((s) => s.id === id)
}

/* ============================================================
   RESOURCES
   ------------------------------------------------------------
   MULTIPLE MODULES PER TEKS, WHICH I HAD WRONG

   I gave each TEKS exactly one Instruction Module. The live
   product has several — 5.6A alone carries Classification of
   Matter, Mass, Thermal Conductors and Insulators, Conductors
   and Insulators of Electricity, each with its own IM and
   matching Companion.

   That isn't a detail. A student expectation is too big to
   teach in one video; it gets broken into sub-topics, and the
   sub-topic is the actual unit of a lesson. Modelling one
   resource per TEKS quietly made the library look a fifth of
   its real size — and made the whole screen look easy to
   design, because I was designing for 21 items instead of 30+.

   So: IM, IMC and SR are generated per sub-topic. Everything
   else stays one per TEKS (there's one lab, one quiz, one
   reader), and the teacher documents stay grade- or unit-level.
   ============================================================ */

const PER_SUBTOPIC = ['IM', 'IMC', 'SR']

const PROCESS_TYPES = ['UNIT_GUIDE', 'SCOPE', 'VERTICAL', 'IM', 'SR']

const ALL_TYPES = Object.keys(resourceTypes)

function titleFor(type, std, unit, f, subtopic) {
  const meta = resourceTypes[type]

  if (meta.scope === 'grade') return `${meta.label} — Grade 5 Science`
  if (meta.scope === 'unit') return `${meta.label} — ${unit.name}`
  if (subtopic) return subtopic

  switch (type) {
    case 'PHENOM':
      return `Why does ${f.hook}?`
    case 'READER':
      return `Reader: ${f.reader}`
    case 'LAB':
      return `Lab: ${std.title}`
    case 'QUIZ':
      return `Quiz: ${std.title}`
    case 'ASSESS':
      return `Assessment: ${std.title}`
    case 'VOCAB':
      return `Vocabulary: ${std.title}`
    default:
      return `${std.title} — ${meta.label}`
  }
}

/* A hook question and a reader title per content standard, so
   generated names read like a real catalogue rather than
   "Resource 3". */
const flavour = {
  '5.6A': { hook: 'a paperclip float on water', reader: 'Heavier Than It Looks' },
  '5.6B': { hook: 'a magnet pull nails out of sand', reader: 'Sorting the Unsortable' },
  '5.6C': { hook: 'sugar vanish in iced tea', reader: 'Lost and Found in a Glass' },
  '5.6D': { hook: 'a balloon shrink in the freezer', reader: 'A Bridge of Ice' },
  '5.7A': { hook: 'a tug-of-war rope suddenly move', reader: 'The Push and the Pull' },
  '5.7B': { hook: 'a steeper ramp send a car further', reader: 'Testing One Thing' },
  '5.8A': { hook: 'a flashlight get warm in your hand', reader: 'From Chemical to Light' },
  '5.8B': { hook: 'one loose wire stop a whole string of lights', reader: 'The Complete Loop' },
  '5.8C': { hook: 'a straw look bent in a glass of water', reader: 'Bending the Beam' },
  '5.9A': { hook: 'your shadow move across the playground', reader: 'The Turning Earth' },
  '5.10A': { hook: 'a puddle disappear on a hot day', reader: 'The Same Water, Always' },
  '5.10B': { hook: 'a rock hold the shape of a shell', reader: 'Pressed Into Stone' },
  '5.10C': { hook: 'a river build land where it meets the sea', reader: 'Rivers That Build' },
  '5.11A': { hook: 'a plastic bottle outlive everyone who used it', reader: 'Second Lives' },
  '5.12A': { hook: 'a cactus wren nest in something spiky', reader: 'Living Together' },
  '5.12B': { hook: 'removing one animal change a whole pond', reader: 'Pull One Thread' },
  '5.12C': { hook: 'a creek recover after a cleanup', reader: 'Damage and Repair' },
  '5.13A': { hook: 'two very different animals eat the same food', reader: 'Built for the Job' },
  '5.13B': { hook: 'a turtle hatchling head straight for the sea', reader: 'Born Knowing' },
}

export const resources = allStandards.flatMap((std) => {
  const unit = units.find((u) => u.id === std.unitId)
  const f = flavour[std.id] ?? { hook: 'this happen', reader: std.title }
  const types = std.process ? PROCESS_TYPES : ALL_TYPES
  const subtopics = std.subtopics ?? [null]

  const make = (type, subtopic, i) => {
    const meta = resourceTypes[type]
    const title = titleFor(type, std, unit, f, subtopic)
    return {
      id: subtopic ? `${std.id}-${type}-${i}` : `${std.id}-${type}`,
      standardId: std.id,
      unitId: std.unitId,
      type,
      kind: meta.kind,
      category: meta.category,
      phase: meta.phase,
      scope: meta.scope,
      subtopic: subtopic ?? null,
      forStudents: meta.forStudents,
      minutes: meta.mins,
      blurb: meta.blurb,
      title,
      shortTitle: title.replace(`${std.title} — `, ''),
      languages: ['EN', 'ES'],
    }
  }

  /* Order matters on screen. Emitting all the modules and then
     all the companions separates each pair; a teacher looking
     at "Mass" wants its companion next to it, not five cards
     later. So: the one-per-TEKS resources first, then each
     sub-topic's module, companion and review together. */
  const single = types
    .filter((t) => !PER_SUBTOPIC.includes(t) || !std.subtopics)
    .map((t) => make(t, null, 0))

  const perSubtopic = std.subtopics
    ? std.subtopics.flatMap((sub, i) =>
        types.filter((t) => PER_SUBTOPIC.includes(t)).map((t) => make(t, sub, i))
      )
    : []

  return [...single, ...perSubtopic]
})

/* ------------------------------------------------------------
   COLLECTIONS  —  the two things on the live Category screen
   that are not TEKS strands
   ------------------------------------------------------------
   Dhinesh noticed these were missing: Full-Length STAAR
   Practice Tests and Engineering Design. They sit as tiles
   eight-across on the live Category page, identical in weight
   to Matter and Energy.

   They are not the same kind of object, and that mismatch is
   worth preserving rather than smoothing over. A strand is part
   of the curriculum spine — you teach it for three weeks and
   move on. These are standing collections you dip into: the
   practice tests come out twice a year before STAAR, and
   Engineering Design is a set of open-ended challenges that cut
   across every strand.

   So they live here as COLLECTIONS, they browse straight to
   their resources with no standard in between (there is no
   "5.6A" for a full-length practice test), and on the chip row
   they sit after a divider rather than in line with the
   strands. The live screen makes all eight look alike, which
   is why a new teacher can't tell that two of them behave
   completely differently.
   ------------------------------------------------------------ */
export const collections = [
  {
    id: 'col-staar',
    name: 'Full-Length STAAR Practice Tests',
    short: 'STAAR Practice',
    icon: 'clipboard',
    blurb:
      'Complete practice forms built to the STAAR blueprint, with reporting-category breakdowns when they come back.',
    items: [
      ['Practice Test A — Full Length', 'ASSESS', 90, 'Every reporting category, in STAAR proportions.'],
      ['Practice Test B — Full Length', 'ASSESS', 90, 'A second form, for a second sitting later in the year.'],
      ['Practice Test C — Full Length', 'ASSESS', 90, 'Held back for spring, so it stays unseen.'],
      ['Mini Test — Matter and Energy', 'QUIZ', 30, 'One reporting category at a time, for a shorter session.'],
      ['Mini Test — Force, Motion, and Energy', 'QUIZ', 30, 'One reporting category at a time, for a shorter session.'],
      ['Mini Test — Earth and Space', 'QUIZ', 30, 'One reporting category at a time, for a shorter session.'],
      ['Mini Test — Organisms and Environments', 'QUIZ', 30, 'One reporting category at a time, for a shorter session.'],
      ['Blueprint and Scoring Guide', 'SCOPE', 0, 'How many questions come from each category, and what each is worth.'],
    ],
  },
  {
    id: 'col-engineering',
    name: 'Engineering Design',
    short: 'Engineering Design',
    icon: 'wrench',
    blurb:
      'Open-ended design challenges. They cut across strands rather than sitting inside one, which is why they live here.',
    items: [
      ['Design Challenge: Keep It Cold', 'LAB', 60, 'Build an insulator from supplied materials. Ties to 5.6A.'],
      ['Design Challenge: Bridge the Gap', 'LAB', 60, 'Strongest span from paper and tape. Ties to 5.7A.'],
      ['Design Challenge: Light the Room', 'LAB', 60, 'A working circuit with a constraint. Ties to 5.8B.'],
      ['Design Challenge: Clean the Water', 'LAB', 60, 'Filter a sample with what you are given. Ties to 5.10A.'],
      ['Engineering Design Process Poster', 'SAFETY', 0, 'Ask, imagine, plan, create, improve — on the wall.'],
      ['Design Notebook', 'JOURNAL', 20, 'Where students record iterations rather than just results.'],
      ['Rubric and Scoring Guide', 'IMPL', 0, 'How to grade a process that has no single right answer.'],
    ],
  },
].map((c) => ({
  ...c,
  /* Built to exactly the same shape as a TEKS resource, so
     every component that already renders resources — the tile,
     the preview, the playlist bar, assign — works on these with
     no special cases. `standardId: null` is the only
     difference, and the tile already copes with that. */
  resources: c.items.map(([title, type, mins, blurb], i) => {
    const meta = resourceTypes[type]
    return {
      id: `${c.id}-${i}`,
      standardId: null,
      collectionId: c.id,
      unitId: null,
      type,
      kind: meta.kind,
      category: meta.category,
      phase: meta.phase,
      scope: 'grade',
      subtopic: null,
      forStudents: meta.forStudents,
      minutes: mins,
      blurb,
      title,
      shortTitle: title,
      languages: ['EN', 'ES'],
    }
  }),
}))

export const collectionResources = collections.flatMap((c) => c.resources)

export function getCollection(id) {
  return collections.find((c) => c.id === id)
}

export function resourcesForStandard(standardId) {
  return resources.filter((r) => r.standardId === standardId)
}

export function getResource(id) {
  return resources.find((r) => r.id === id) ?? collectionResources.find((r) => r.id === id)
}

/* ---------- Students ----------
   Around 110, because a Texas elementary science teacher
   typically sees five sections of ~22. Scale matters for a
   prototype: a roster of six looks tidy and proves nothing. The
   real question is whether a screen still works when a teacher
   has 110 children and fourteen of them are behind. */
const firstNames = [
  'Amara', 'Ethan', 'Sofia', 'Marcus', 'Leila', 'Noah', 'Camila', 'Jayden',
  'Priya', 'Owen', 'Zuri', 'Mateo', 'Hannah', 'Isaiah', 'Yara', 'Lucas',
  'Naomi', 'Andre', 'Talia', 'Kai', 'Bianca', 'Elijah', 'Nadia', 'Theo',
  'Maya', 'Roman', 'Iris', 'Damien', 'Esme', 'Silas', 'Aaliyah', 'Diego',
  'Freya', 'Omar', 'Vivian', 'Caleb', 'Ines', 'Malik', 'Josephine', 'Rafael',
  'Simone', 'Hugo', 'Delphine', 'Amos', 'Lucia', 'Bennett', 'Anaya', 'Felix',
  'Rosalind', 'Tobias', 'Carmen', 'Dmitri', 'Wren', 'Ibrahim', 'Clementine',
]

const lastNames = [
  'Okafor', 'Brown', 'Restrepo', 'Bell', 'Haddad', 'Whitfield', 'Duarte',
  'Price', 'Nair', 'Castellanos', 'Thompson', 'Vega', 'Kirby', 'Ford',
  'Mansour', 'Ferreira', 'Greenblatt', 'Beaulieu', 'Rosenberg', 'Nakamura',
  'Moreau', 'Sandoval', 'Petrov', 'Lindqvist', 'Chowdhury', 'Kovac',
  'Delacroix', 'Achebe', 'Villanueva', 'Aronsson', 'Guerrero', 'Bianchi',
  'Adeyemi', 'Sorensen', 'Marchetti', 'Osei', 'Takahashi', 'Novak',
]

/* ============================================================
   THE DISTRICT ROSTER  —  482 students, Kindergarten to Grade 12

   WHO IS WHERE
     stu-1   … stu-110   Grade 5, in her five sections
     stu-111 … stu-122   Grade 5, in no class yet
     stu-123 … stu-482   the other twelve grades, 30 each

   The first twelve are the ordinary state of a school in
   September rather than a fault: new enrolments, transfers in,
   and children whose timetable hasn't been settled. They exist
   because a picker that offers "not in a class yet" as a
   heading over empty space is a promise the data never keeps.

   WHY GRADE 5 IS FOUR TIMES THE SIZE OF ANY OTHER GRADE, and
   why that is deliberate rather than sloppy. Grade 5 is the
   grade this prototype actually holds — real TEKS, real
   resources, real assignments — so its cohort is full size and
   behaves correctly under every screen. The other twelve are a
   thin, honest sample: enough for the grade lens to group
   something true, not so much that the prototype pretends to a
   completeness it doesn't have. GradeSelector.jsx takes exactly
   the same stance about content, and for the same reason: a
   prototype that lies gets caught in the demo.

   NAMES ARE UNIQUE ACROSS ALL 482. `i % 55` and `i % 38` — the
   two pool lengths, which share no factors — so by the Chinese
   remainder theorem the pair repeats only after 2,090 students.
   The old formula was fine for 122 and would have started
   minting duplicate children at this size, and two different
   students called Maya Greenblatt is the kind of thing a
   teacher spots in three seconds.
   ============================================================ */
/* Scattered rather than contiguous: two in 1st Period, two in
   3rd, one in 4th, and four among the children who have not been
   timetabled yet. Nine of 482, which is about the right
   proportion for the first month of a school year. */
const MANUAL_STUDENT_INDEXES = new Set([3, 17, 52, 60, 71, 112, 115, 118, 121])

/* ---- WHY THE GRADE 5 COHORT GREW FROM 122 TO 240 ----
   Dhinesh asked to see one assignment going out to ten or
   fifteen classes, because that is what the real product has to
   survive and the prototype was only ever showing three. The
   honest way to do that is more children, not more classes
   sharing the same children: a class list where the same
   twenty-four names appear in six groups would make every
   total on every report wrong, and the dialog he is checking
   is mostly made of totals.

   The first 122 indexes are untouched on purpose. 1st through
   6th Period still hold exactly the students they held before,
   and indexes 110–121 — which include four of the manually
   added children above — are still in no class at all. So every
   roster, report and average that existed before this change
   reads identically after it. Only the new groups are new. */
const GRADE_5_COHORT = 240
const OTHER_GRADES = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12]
const PER_OTHER_GRADE = 30

const studentSeed = Array.from(
  { length: GRADE_5_COHORT + OTHER_GRADES.length * PER_OTHER_GRADE },
  (_, i) => [firstNames[i % firstNames.length], lastNames[i % lastNames.length]]
)

/* Kindergarten first, then 1 … 12. The number is what sorts and
   groups; the label is what a teacher reads, and "Kindergarten"
   is a word, not a zero. */
export function gradeLabel(level) {
  return level === 0 ? 'Kindergarten' : `Grade ${level}`
}

function gradeForIndex(i) {
  if (i < GRADE_5_COHORT) return 5
  return OTHER_GRADES[Math.floor((i - GRADE_5_COHORT) / PER_OTHER_GRADE)]
}

/* A small deterministic hash so the same student always gets
   the same scores. Random data that reshuffles on every refresh
   makes a prototype feel broken. */
function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000
  return h
}

/* ---- NOT EVERY ROOM IS IN TROUBLE ----
   Every class came out between 66% and 76% with seven to
   fourteen children flagged, so the By class grid was twelve red
   cards in a row. Dhinesh is right that this reads as a broken
   product rather than as a school: if everything needs attention
   then nothing does, and a teacher learns to ignore the colour
   before she has used the screen twice. A signal only works
   against a background of things that are fine.

   So two groups are genuinely strong, and for reasons the names
   already imply rather than because the numbers were nicer that
   way:

   · SCIENCE CLUB is enrichment. Children opt in because they
     like the subject, so of course it outperforms a timetabled
     section — that is what a club IS.
   · 7th PERIOD is simply a good class. Teachers have them. A
     product where every section lands within four points of
     every other is not realistic data, it is averaged data.

   The lift is applied to the INDEX BANDS those two classes draw
   from, not to the classes, so the fact stays with the children:
   a child from the Science Club band who also appears in a
   report by TEKS is the same strong child there. A per-class
   fudge would have made the same student score differently
   depending on which screen was asking.

   Tutoring Groups A and B are deliberately left weak for the
   mirror-image reason: a tutoring group full of children who do
   not need tutoring would be the same kind of lie. */
function cohortLift(i) {
  if (i >= 227 && i < 240) return 17 // Science Club
  if (i >= 145 && i < 168) return 14 // 7th Period
  return 0
}

/* ============================================================
   ONE SCALE, NAMED, IN ONE PLACE

   The product used to carry two invented numbers doing the job
   a vocabulary should do: a student "needed attention" below
   70% overall, and below 65% on a single assignment. Two cut
   lines, one word, and no way for a teacher to know which one
   she was reading.

   Neither of the serious products in this market works that
   way. Mastery Connect names three levels — Remediation, Near
   Mastery, Mastery — with published cut scores and a
   configurable calculation behind them. Pear Assessment uses
   mastery bands the same way. The threshold is never the
   interface; the SCALE is, and the band is what the teacher
   acts on.

   ---- WHY THE STAAR NAMES ----
   Dhinesh left the naming to me, so: the four STAAR performance
   levels, because a Texas teacher already thinks in them. She
   says "approaches" and "meets" out loud in planning meetings,
   her admin reports on them, and the district's benchmark
   results come back in them. Inventing a parallel vocabulary —
   "Needs help / Almost there / On track" — would mean every
   teacher holding two scales in her head and translating
   between them, which is exactly the cognitive load this
   redesign exists to remove.

   The objection is that these are TEST performance levels and
   this is a Tuesday quiz. In Texas that objection is already
   settled in practice: districts report local and benchmark
   assessments against STAAR performance standards as a matter
   of routine, which is precisely what Eduphoria Aware does. We
   are following the convention, not stretching it.

   ---- THREE COLOURS, FOUR NAMES ----
   Masters and Meets share the good tone. Four bands do not need
   four colours, because colour here answers "is this a
   problem?" and the answer for both is no. The label carries
   the difference between fine and excellent; the colour carries
   the difference between fine and not. Inventing a fourth hue
   to distinguish two kinds of good would spend the alphabet of
   the palette on a distinction nobody acts on.

   NEEDS ATTENTION IS NOW A DERIVED FACT, not a second rule:
   anything below Meets. One line, defined once, true on every
   screen.
   ============================================================ */
export const LEVELS = [
  { id: 'masters', label: 'Masters', min: 85, tone: 'good' },
  { id: 'meets', label: 'Meets', min: 70, tone: 'good' },
  { id: 'approaches', label: 'Approaches', min: 55, tone: 'watch' },
  { id: 'below', label: 'Did not meet', min: 0, tone: 'alert' },
]

/* Returns null for null, because "no evidence" is not a band.
   Every caller that prints a level has to handle a child who
   has not finished anything, and handing them the bottom band
   would accuse him of failing work he has not sat. */
export function levelFor(score) {
  if (score == null) return null
  return LEVELS.find((l) => score >= l.min) ?? LEVELS[LEVELS.length - 1]
}

/* The one rule. Below Meets is behind — wherever the number
   came from, and whatever screen is asking. */
export function needsAttention(score) {
  if (score == null) return false
  return score < 70
}

export const students = studentSeed.map(([first, last], i) => {
  const id = `stu-${i + 1}`
  const h = hash(first + last)
  const ability = Math.min(98, 42 + (h % 56) + cohortLift(i))
  return {
    id,
    firstName: first,
    lastName: last,
    name: `${first} ${last}`,
    initials: first[0] + last[0],
    /* ---- ABILITY IS THE SEED, MASTERY IS THE READING ----
       `ability` is the invented number, and nothing on screen
       ever shows it. It exists to generate this child's scores,
       the way a real child's understanding generates his. What
       the product DISPLAYS is `mastery`, computed further down
       from the scores he actually produced — see
       recomputeMastery. Keeping them separate is what stops the
       circularity: scores come from ability, mastery comes from
       scores, and the number a teacher reads is therefore a
       summary of real work rather than a second opinion about
       the same fiction. */
    ability,
    /* Filled by recomputeMastery once assignments exist. Seeded
       here so nothing reads undefined during module load. */
    mastery: ability,
    trend: 'flat',
    /* ---- THE DISTRICT'S NUMBER FOR THIS CHILD ----
       Six digits, issued in enrolment order, which is what a
       real SIS does — and the reason the roster needs a column
       for it: two children on one campus can share a name, and
       when a teacher is reconciling her roster against a
       printout or calling the office, the number is the thing
       that settles it. `stu-1` is OUR key and would mean
       nothing to anyone on the phone.

       Sequential with a stride rather than i+1, so the ids look
       issued rather than counted, and unique by construction —
       an id that collides is worse than no id at all. */
    studentId: String(104000 + i * 7),
    /* The year the child is in — the district's fact about
       them, not this teacher's. She teaches Grade 5 Science;
       the roster she can build a group from is the whole
       district, because pull-out and enrichment groups
       routinely cross a year boundary. */
    gradeLevel: gradeForIndex(i),
    /* ============================================================
       WHERE THIS RECORD CAME FROM

       'district' — provisioned by the student information
       system. The name, the id, the grade and the password all
       belong to that system, and anything a teacher changed
       here would be overwritten the next time it synced. So the
       record is read-only to her, and the menu says so rather
       than letting her make an edit that quietly evaporates
       overnight.

       'manual' — a teacher created the account herself, which
       happens every September: a child arrives on Monday and the
       district record lands on Thursday, and she is not going to
       teach three days without one. That account is hers until
       the SIS catches up, so she can edit it, reset its password
       and take it out of a group.

       A few of these sit INSIDE her existing sections rather
       than only among the unplaced, because a menu whose enabled
       state never appears on the screen a teacher actually uses
       is a state nobody has really looked at — the same reason
       the unplaced students exist at all. */
    source: MANUAL_STUDENT_INDEXES.has(i) ? 'manual' : 'district',

    /* Emergent Bilingual — the current Texas term, replacing
       "ELL". Districts care about this wording. */
    eb: h % 7 === 0,
  }
})

export function getStudent(id) {
  return students.find((s) => s.id === id)
}

/* ============================================================
   WHAT "NEEDS HELP" MEANS, IN ONE PLACE

   Low, or middling and falling. The second half matters: a
   student at 70 and sliding is a problem you can still catch,
   and a rule that only looked at the number would wait until
   she had dropped to 64 to mention her.

   This lives here rather than inside the screen that first
   needed it, because the class card, the class roster and the
   new-class picker all draw the same line, and three copies of
   one rule is three chances for them to disagree about who is
   struggling.

   ---- A STUDENT IN NO CLASS IS NOT FLAGGED ----
   The campus roster now includes children who have only just
   arrived, and the picker was labelling six of the first seven
   of them "Needs help" — under a heading that said, two inches
   above, that they were new to the campus. The product was
   passing judgement on work it has never seen.

   The guard also makes the flag mean something precise. Every
   place this rule is used is class-scoped: the red band counts
   students struggling IN THAT CLASS, and the picker's filter
   offers the ones she could gather from her own rooms. A child
   who is in none of them has no standing to report, and gets
   one the moment she is placed.

   ---- AND THAT IS NOW FIXED ----
   This block used to end by noting that `mastery` was fabricated
   for a child with no record, and that the honest value was
   null. It is null — see recomputeMastery. A brand-new arrival,
   and anyone who has not finished anything, now reads as having
   no score rather than a plausible one.
   ============================================================ */
export function needsHelp(student) {
  if (!student) return false
  if (!placedIds().has(student.id)) return false
  /* One rule, shared with every other screen. The old version
     carried its own cut line AND a trend clause, which is how
     the product ended up with two different numbers called the
     same word. */
  return needsAttention(student.mastery)
}

/* Rebuilt only when a class is added, because this is asked
   several hundred times per render — once per student per class
   — and rebuilding a 110-entry Set on each of those would be
   work done for nothing. Rosters don't change after creation in
   this prototype; if they ever do, bump the counter there too. */
let placedCache = { stamp: -1, set: new Set() }
let classStamp = 0
function placedIds() {
  if (placedCache.stamp !== classStamp) {
    placedCache = { stamp: classStamp, set: new Set(classes.flatMap((c) => c.studentIds)) }
  }
  return placedCache.set
}

/* ---------- Classes ---------- */
export const classes = [
  /* ---- NO CLOCK TIME, NO ROOM ----
     Dhinesh's rule, and it is about what this product can
     honestly claim to know. EduSmart is one of several tools a
     teacher has open; it does not own her timetable, it is not
     told when her periods run, and it has no idea whether she
     is at a desk at 08:15 or marking at nine in the evening.
     Printing "08:15" asserted a fact we had invented.

     The room went for the same reason — "Lab 2" was unexplained
     on the card and unowned by the product. Nobody enters it,
     nothing keeps it current, and a teacher who moved rooms in
     October would be reading a lie until someone fixed the
     seed data.

     What survives is what the product genuinely holds: the
     class's name and who is in it. Everywhere the interface
     wanted a schedule it now uses due dates instead, which are
     real — the teacher set them herself. */
  { id: 'c1', name: '1st Period', studentIds: sliceIds(0, 24) },
  { id: 'c2', name: '2nd Period', studentIds: sliceIds(24, 45) },
  { id: 'c3', name: '3rd Period', studentIds: sliceIds(45, 68) },
  { id: 'c4', name: '4th Period', studentIds: sliceIds(68, 90) },
  { id: 'c5', name: '5th Period', studentIds: sliceIds(90, 110) },

  /* ---- THE GROUPS THAT MAKE THE SCALE REAL ----
     Three more timetabled sections and four named groups, which
     is roughly what a teacher on a big campus actually has: the
     periods she teaches, plus the smaller sets she builds
     herself for tutoring, review and a club.

     THE NAMES MATTER MORE THAN THEY LOOK. A twelfth "12th
     Period" would have been quicker and would have been a lie —
     no school day has twelve periods, and a prototype that
     claims one teaches the viewer to distrust the rest of the
     data. The named groups also exercise something the period
     classes never did: a class whose name is long enough to
     truncate, and a roster of eleven rather than twenty-four,
     so the dialog gets tested on the shapes it will actually
     meet rather than on seven copies of the same shape.

     No day of the week in any of these names, for the same
     reason there are no clock times anywhere: the product is
     not told when a group meets, so it must not imply it.

     ---- THE NAMES RUN IN ID ORDER, AND THAT IS DELIBERATE ----
     c5 was "6th Period" before this change, so adding 5th as c6
     made every list in the product read 4th, 6th, 5th. Nothing
     was broken; it just looked unsorted, which is the same cost
     to a reader as being unsorted. The fix was to rename rather
     than to sort at each call site: a sort function has to be
     remembered in every new list someone writes, while names
     that match their ids are right by default and cannot drift.
     The rosters are arbitrary mock data, so renaming costs
     nothing real. */
  { id: 'c6', name: '6th Period', studentIds: sliceIds(122, 145) },
  { id: 'c7', name: '7th Period', studentIds: sliceIds(145, 168) },
  { id: 'c8', name: '8th Period', studentIds: sliceIds(168, 190) },
  { id: 'c9', name: 'Tutoring Group A', studentIds: sliceIds(190, 202) },
  { id: 'c10', name: 'Tutoring Group B', studentIds: sliceIds(202, 213) },
  { id: 'c11', name: 'STAAR Review Group', studentIds: sliceIds(213, 227) },
  { id: 'c12', name: 'Science Club', studentIds: sliceIds(227, 240) },
]

function sliceIds(a, b) {
  return Array.from({ length: b - a }, (_, i) => `stu-${a + i + 1}`)
}

/* ---- WHO ISN'T IN ANYTHING YET ----
   Computed rather than listed, so it stays true: put one of
   these students into a new class and she leaves this group by
   herself, with nothing to remember to update. A hand-kept list
   of the unplaced is a list that is wrong the first time
   somebody is placed.

   Classes made inside the product count, which is the point —
   the picker should not keep offering a child under "not in a
   class yet" after the teacher has just put her in one. */
export function unplacedStudents() {
  const placed = new Set(classes.flatMap((c) => c.studentIds))
  return students.filter((s) => !placed.has(s.id))
}

export function getClass(id) {
  return classes.find((c) => c.id === id)
}

/* ============================================================
   MAKING A NEW CLASS

   WHY THIS PUSHES INTO THE ARRAY INSTEAD OF LIVING IN REACT
   STATE. Roughly a dozen functions in this file answer questions
   about a class — its roster, its assignments, its average, who
   is struggling in it — and every screen in the product asks
   them by id. If a class created at runtime lived somewhere
   else, every one of those lookups would need a second place to
   look, and the first one anybody forgot would be a class that
   exists on the Classes screen and nowhere else.

   So a new class is added to the same list the seeded ones are
   in, and every existing helper works on it without being told
   it happened. In a real build this is the POST that the next
   GET returns; here the array IS the database.

   The store keeps a counter alongside so React knows to redraw
   — mutating an array it isn't watching would otherwise leave
   the new class invisible until something else caused a render.
   ============================================================ */
export function registerClass({ name, studentIds }) {
  /* Ids are minted rather than counted, because counting breaks
     the moment a class is ever removed: delete c6 and the next
     `c${classes.length + 1}` is c6 again, pointing at a
     different roster with the old one's assignments still
     naming it. */
  const cls = {
    id: `c-${Date.now().toString(36)}`,
    name: name.trim(),
    studentIds: [...studentIds],
    createdHere: true,
  }
  classes.push(cls)
  classStamp += 1 /* invalidates the placed-student cache above */
  return cls
}

/* ---- RENAMING ----
   Allowed on every class, including the district's own sections.
   The name on a card is a label the teacher reads; the identity
   underneath is the id, and that is what assignments, reports
   and the roster sync all hold on to. So relabelling "3rd
   Period" as "Science — Block B" changes what she sees and
   nothing the district records. The rename dialog says so, at
   the moment it matters, rather than the product quietly
   deciding for her that she may not. */
export function renameClass(id, name) {
  const cls = getClass(id)
  if (!cls) return null
  cls.name = name.trim()
  return cls
}

/* ---- TAKING A CHILD OUT OF A CLASS ----
   Same rule as deleting the class itself, and for the same
   reason: a timetabled section is the district's record of who
   she teaches, so removing a child from 1st Period here would
   not remove him from the district's roster — it would just
   hide a student she is still responsible for. On a group she
   built herself, the membership is hers to change.

   The child is never touched, only his membership. He stays on
   the district roster and in every other class he is in, which
   is what the confirmation says. */
export function canEditRoster(cls) {
  return Boolean(cls?.createdHere)
}

/* Whether the teacher owns this child's record, as opposed to
   merely being able to see it. Edit and Reset password both
   hinge on it; removing him from a group does not, because that
   is a fact about the group. */
export function canEditStudent(student) {
  return student?.source === 'manual'
}

/* Changing a record she owns. Mutates in place for the same
   reason registerClass does — every screen reads this array, and
   a second place to look is a screen that shows the old name. */
export function updateStudent(id, patch) {
  const student = getStudent(id)
  if (!canEditStudent(student)) return false
  Object.assign(student, patch)
  if (patch.firstName || patch.lastName) {
    student.name = `${student.firstName} ${student.lastName}`
    student.initials = student.firstName[0] + student.lastName[0]
  }
  return true
}

/* ---- A TEMPORARY PASSWORD ----
   Two short words and two digits, because a Grade 5 child has to
   read this off a slip of paper and type it without help.
   Random characters are correct for an adult and useless here —
   the teacher would end up typing it for twenty-four of them.

   Nothing is stored: the prototype has no accounts. It returns
   the string so the dialog can show it once, which is also how
   the real thing should behave. */
const PASSWORD_WORDS = ['comet', 'river', 'maple', 'tiger', 'amber', 'pebble', 'orbit', 'cedar']
export function makeTemporaryPassword() {
  const pick = () => PASSWORD_WORDS[Math.floor(Math.random() * PASSWORD_WORDS.length)]
  return `${pick()}-${pick()}-${10 + Math.floor(Math.random() * 90)}`
}

/* ---- ADDING, WHICH IS NOT GATED ----
   Allowed on every class, including the district's own
   sections. See the note in AddStudentsDialog: adding
   supplements the district's roster where removing contradicts
   it, and the September case — a child in the room before his
   record arrives — is the reason the capability exists at all.

   Ids already in the class are skipped rather than rejected.
   The picker will not offer them, but a caller that passes one
   should get a no-op and not a duplicate row. */
export function addStudentsToClass(classId, studentIds) {
  const cls = getClass(classId)
  if (!cls) return 0
  const fresh = studentIds.filter((id) => getStudent(id) && !cls.studentIds.includes(id))
  if (fresh.length === 0) return 0
  cls.studentIds = [...cls.studentIds, ...fresh]
  classStamp += 1 /* they may have been unplaced — see placedIds */
  return fresh.length
}

export function removeStudentFromClass(classId, studentId) {
  const cls = getClass(classId)
  if (!canEditRoster(cls)) return false
  const before = cls.studentIds.length
  cls.studentIds = cls.studentIds.filter((id) => id !== studentId)
  if (cls.studentIds.length === before) return false
  classStamp += 1 /* he may now be unplaced — see placedIds */
  return true
}

/* ============================================================
   DELETING — AND WHAT IT TAKES WITH IT

   Only for classes the teacher made here. A timetabled section
   is the district's record of which children she teaches, and
   removing it from this screen would not remove it from
   anywhere real — it would just hide a roster she is still
   responsible for, along with every assignment sitting on it.
   `canDelete` is the one place that rule is written down.

   THE PART THAT IS EASY TO GET WRONG. A class is not a leaf.
   Assignments name the classes they were given to, so deleting
   a class leaves every one of those pointing at something that
   no longer exists — the dangling-id fault the resource audit
   caught once already, arriving this time through a door the
   teacher opened herself.

   So the id is stripped from every assignment that carried it,
   and an assignment left with no classes at all is removed
   too: work assigned to nobody is not an assignment, it is a
   record with nothing on the other end of it.

   The counts come back so the dialog can say what will happen
   BEFORE it happens, rather than reporting it afterwards.
   ============================================================ */
export function canDelete(cls) {
  return Boolean(cls?.createdHere)
}

export function deletionImpact(id) {
  const touched = assignments.filter((a) => a.classIds.includes(id))
  return {
    assignments: touched.length,
    /* Assignments this class was the ONLY recipient of — these
       disappear rather than merely shrinking, which is a
       different sentence and deserves its own number. */
    removed: touched.filter((a) => a.classIds.length === 1).length,
  }
}

export function deleteClass(id) {
  const cls = getClass(id)
  if (!canDelete(cls)) return false

  for (let i = assignments.length - 1; i >= 0; i -= 1) {
    const a = assignments[i]
    if (!a.classIds.includes(id)) continue
    a.classIds = a.classIds.filter((c) => c !== id)
    if (a.classIds.length === 0) assignments.splice(i, 1)
  }

  classes.splice(classes.indexOf(cls), 1)
  classStamp += 1
  return true
}

export function studentsInClass(classId) {
  const cls = getClass(classId)
  if (!cls) return []
  return cls.studentIds.map(getStudent).filter(Boolean)
}

/* ---------- Assignments ---------- */
export const assignments = [
  /* ---- COVERAGE IS PART OF THE MOCK'S JOB ----
     Six assignments across forty-two standards left almost
     every Library row reading "Not assigned yet", which makes a
     working feature look broken in a demo. These three bring
     the Matter unit — the one a teacher is actually in right
     now — to full coverage, so the rows there show real
     numbers, while the later units stay unassigned and
     demonstrate the empty state honestly. A year in progress,
     which is what the screen is for. */
  {
    id: 'a7',
    title: 'Mixtures — module and review',
    standardId: '5.6B',
    resourceIds: ['5.6B-IM-0', '5.6B-IMC-0', '5.6B-SR-0'],
    classIds: ['c1', 'c2', 'c3', 'c4', 'c5'],
    created: '2026-08-19',
    start: '2026-09-01',
    due: '2026-09-11',
    status: 'closed',
  },
  {
    id: 'a8',
    title: 'Solutions — module and review',
    standardId: '5.6C',
    resourceIds: ['5.6C-IM-0', '5.6C-IMC-0', '5.6C-SR-0'],
    /* ---- THE WIDE ONE ----
       Every class the teacher has. This is the assignment that
       answers "what does this look like at fifteen", and it was
       the right one to widen rather than seeding a thirteenth
       assignment: it already carries the two awkward states —
       a class on a later window, and a class with students who
       joined after it went out — so the busy case and the odd
       cases are visible in the same dialog instead of being
       demonstrated separately on tidy data. */
    classIds: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'],
    created: '2026-08-27',
    start: '2026-09-09',
    due: '2026-09-19',
    status: 'active',
    /* ---- THE TWO STATES THE LIVE PRODUCT SHOWS, SEEDED ----
       Both exist in Dhinesh's Workspace screens and neither can
       be reached by clicking around a fresh prototype, so the
       mock has to carry them or the feature demos as dead
       markup. See the note on `perClass` above.

       4th Period got this a week after the others and has its
       own window — the live product's "Newly Assigned" card
       with later dates. The window's student list is filled in
       on load below, because the rosters are generated and are
       not literals we can name here. */
    perClass: { c4: { addedLate: true, windows: null } },
  },
  {
    id: 'a9',
    title: 'Forces — opening module',
    standardId: '5.7A',
    resourceIds: ['5.7A-IM-0', '5.7A-SR-0'],
    classIds: ['c2'],
    created: '2026-09-02',
    start: '2026-09-15',
    due: '2026-09-25',
    status: 'active',
  },

  /* ---- THE FOURTH LIVE ASSIGNMENT FOR 1st PERIOD ----
     Added so the class card's "+N more assigned" line has
     something to say. Until now no class had more than three
     live at once, which meant the overflow case existed in the
     code and nowhere on screen — the kind of state that is
     easy to get wrong precisely because nobody ever looks at
     it.

     It is also the realistic shape of the thing: a re-teach on
     a unit that closed with a weak average (a7, Mixtures),
     given to the two classes that struggled with it, with a
     longer runway than the live work because it is catch-up
     rather than the main sequence. Being the furthest out, it
     is the one the card folds away — which is the right one to
     fold. */
  {
    id: 'a10',
    title: 'Mixtures — Re-teach and Review',
    standardId: '5.6B',
    /* ---- THE FULL FIVE, SO THE CEILING IS ON SCREEN ----
       A playlist holds five resources at most, and until now
       nothing in the seed data used more than three — so the
       widest the assignment report could ever be was a shape
       nobody had looked at. This is the one assignment that
       carries the maximum, and it is deliberately the same one
       that carries two delivery windows: one card in the
       prototype stands at the edge of both limits, which is
       where layout gives way if it is going to. */
    resourceIds: ['5.6B-IM-1', '5.6B-IMC-1', '5.6B-SR-1', '5.6B-QUIZ', '5.6B-READER'],
    classIds: ['c1', 'c4'],
    created: '2026-09-02',
    start: '2026-09-15',
    due: '2026-09-22',
    status: 'active',
    /* ---- ONE CLASS, TWO DEADLINES, IN THE SEED ----
       The model has always allowed a class to hold more than one
       window — Catch-up and Assign again both create them — but
       nothing in the seed data arrived that way, so the state
       could be MADE in the prototype and never SEEN in it.
       Dhinesh asked how the reports tell the two groups apart,
       and the honest answer was that nobody had ever looked at a
       report in that condition, including me.

       So 1st Period opens in it. Twenty children on the window
       the class was given; four on a longer one, which is what a
       re-teach group looks like — handed it earlier, given until
       the end of the month. Both windows are open and both have
       scores, so the report has to tell them apart on the dates
       rather than on one group being blank. */
    perClass: {
      c1: {
        windows: [
          {
            start: '2026-09-15',
            due: '2026-09-22',
            studentIds: [
              'stu-1', 'stu-2', 'stu-3', 'stu-4', 'stu-5',
              'stu-6', 'stu-7', 'stu-8', 'stu-9', 'stu-10',
              'stu-11', 'stu-12', 'stu-13', 'stu-14', 'stu-15',
              'stu-16', 'stu-17', 'stu-18', 'stu-19', 'stu-20',
            ],
          },
          {
            start: '2026-09-11',
            due: '2026-09-29',
            studentIds: ['stu-21', 'stu-22', 'stu-23', 'stu-24'],
          },
        ],
      },
    },
  },

  {
    id: 'a1',
    title: 'Particles of Matter — Module & Companion',
    standardId: '5.6D',
    resourceIds: ['5.6D-IM-0', '5.6D-IMC-0', '5.6D-SR-0'],
    classIds: ['c1', 'c2', 'c3'],
    created: '2026-08-26',
    start: '2026-09-08',
    due: '2026-09-18',
    status: 'active',
  },
  {
    id: 'a2',
    title: 'Complete Circuits — Lab and Review',
    standardId: '5.8B',
    resourceIds: ['5.8B-LAB', '5.8B-SR-0'],
    classIds: ['c1', 'c4'],
    created: '2026-09-01',
    start: '2026-09-14',
    due: '2026-09-17',
    status: 'active',
  },
  {
    id: 'a3',
    title: 'Physical Properties — Unit Quiz',
    standardId: '5.6A',
    resourceIds: ['5.6A-QUIZ'],
    classIds: ['c2', 'c3', 'c5'],
    created: '2026-09-02',
    start: '2026-09-15',
    due: '2026-09-19',
    status: 'active',
  },
  {
    id: 'a4',
    title: 'The Water Cycle — Model and Reader',
    standardId: '5.10A',
    resourceIds: ['5.10A-IM-0', '5.10A-READER', '5.10A-LAB'],
    classIds: ['c3'],
    created: '2026-09-08',
    start: '2026-09-21',
    due: '2026-09-28',
    status: 'scheduled',
  },
  {
    id: 'a5',
    title: 'Energy Transformation — Student Review',
    standardId: '5.8A',
    resourceIds: ['5.8A-SR-0', '5.8A-VOCAB'],
    classIds: ['c1', 'c2', 'c3', 'c4'],
    created: '2026-08-12',
    start: '2026-08-25',
    due: '2026-09-05',
    status: 'closed',
  },
  {
    id: 'a6',
    title: 'Food Webs — Anchoring Phenomenon',
    standardId: '5.12B',
    resourceIds: ['5.12B-PHENOM', '5.12B-IM-0'],
    classIds: ['c4', 'c5'],
    created: '2026-08-19',
    start: '2026-09-01',
    due: '2026-09-12',
    status: 'closed',
  },
]

export function getAssignment(id) {
  return assignments.find((a) => a.id === id)
}

export function assignmentsForClass(classId) {
  return assignments.filter((a) => a.classIds.includes(classId))
}

/* ============================================================
   AN ASSIGNMENT IS A SET OF DELIVERIES
   ------------------------------------------------------------
   Taken from the live product's Workspace › Assigned, which
   models this properly and which I had been flattening.

   The thing a teacher sends is not "an assignment to five
   classes with one due date". It is five DELIVERIES of the same
   material, each with its own window and its own population,
   and the live product shows exactly that: a card per group
   carrying 8/10 Students and Aug 19 → Aug 30, one of them
   marked "Newly Assigned" with later dates, and one carrying
   "Multiple Due Dates" because two children joined after the
   rest and were caught up separately.

   Two facts fall out of it that a single `due` cannot hold:

     DATES ARE PER CLASS. 4th Period can be given the same
     material three weeks after 1st Period, and judging them
     against 1st Period's deadline marks them late for work they
     were handed this morning.

     THE POPULATION IS A SNAPSHOT. An assignment goes to the
     children who were in the room when it was sent. A child who
     joins on Thursday is not behind — he was never given it.
     The live product calls this "2 Students newly added" and
     offers to catch him up, which is the single most thoughtful
     thing in the current Workspace.

   `perClass` holds the override; an assignment that was sent
   once, to everyone, in one window, carries none and reads
   exactly as it did before.
   ============================================================ */

/* ============================================================
   A DELIVERY IS A LIST OF WINDOWS
   ------------------------------------------------------------
   The model used to be one window per class plus an `extraDue`
   for the case where latecomers were caught up on a different
   deadline. That was enough to PRINT "Multiple due dates" and
   not enough to answer it: the flat `reached` list knew who had
   the work but not which deadline they were on, so the moment
   Dhinesh asked for the dates to open up, the honest answer was
   that the data could not say.

   So a class's delivery is now a list:

     windows: [ { start, due, studentIds }, … ]

   One entry for the original send, one more each time a group
   was given the same material on a different window. Everything
   else derives from it — the ratio is the union, the status is
   the latest deadline, "multiple due dates" is simply
   `windows.length > 1`, and the breakdown the teacher opens is
   the list itself rather than something reconstructed.

   The lesson, and it has come up twice now: A SUMMARY YOU
   CANNOT EXPAND IS A SUMMARY OF SOMETHING YOU ARE NOT STORING.
   "Multiple due dates" was true and unopenable, which is the
   shape of a fact the model has lost.

   An assignment that was sent once, to everyone, on one window
   carries no `perClass` at all and reads exactly as it did
   before: `windowsFor` synthesises the single window from the
   assignment's own dates and the class roster.
   ============================================================ */

export function windowsFor(assignment, classId) {
  const roster = getClass(classId)?.studentIds ?? []
  const here = new Set(roster)
  const d = assignment?.perClass?.[classId]
  if (!d?.windows?.length) {
    return [{ start: assignment?.start, due: assignment?.due, studentIds: roster }]
  }
  /* Each window is intersected with the live roster rather than
     returned raw — a child who has since left the class should
     not keep appearing in its counts. A window left empty by
     that is dropped, because an empty window is not a deadline
     anybody is working to. */
  return d.windows
    .map((w) => ({ ...w, studentIds: w.studentIds.filter((id) => here.has(id)) }))
    .filter((w) => w.studentIds.length > 0)
}

/* Everyone this class's delivery actually reached, across all
   its windows. */
export function reachedIn(assignment, classId) {
  const ids = new Set()
  for (const w of windowsFor(assignment, classId)) {
    for (const id of w.studentIds) ids.add(id)
  }
  return [...ids]
}

/* Children in the class who were not here when it was sent.
   The nudge, and the reason this model exists. */
export function newcomersIn(assignment, classId) {
  if (!assignment?.perClass?.[classId]?.windows) return []
  const had = new Set(reachedIn(assignment, classId))
  return (getClass(classId)?.studentIds ?? []).filter((id) => !had.has(id))
}

/* ---- THE DEADLINE THIS CHILD IS ACTUALLY WORKING TO ----
   Everything else here reasons about a class's windows. The
   report has to reason about one student's, because "late" means
   nothing until you know which deadline you are measuring
   against: in 1st Period a child on the re-teach window still
   has a fortnight when the rest of the room is already past due.

   Returns null for a child the delivery never reached, which the
   caller prints as nothing rather than as a date he was never
   given. */
export function windowForStudent(assignment, classId, studentId) {
  return (
    windowsFor(assignment, classId).find((w) => w.studentIds.includes(studentId)) ?? null
  )
}

export function deliveryFor(assignment, classId) {
  const ws = windowsFor(assignment, classId)
  const d = assignment?.perClass?.[classId]
  return {
    /* The first window is the one the class as a whole was
       given, and it is what the row shows when there is only
       one. When there are several the row says so instead of
       picking one, because picking one is a lie about the other
       half of the room. */
    start: ws[0]?.start ?? assignment?.start,
    due: ws[0]?.due ?? assignment?.due,
    addedLate: !!d?.addedLate,
    windows: ws,
    multiple: ws.length > 1,
  }
}

export function dueForClass(assignment, classId) {
  return deliveryFor(assignment, classId).due
}

/* ---- STATUS, READ PER CLASS ----
   Once two classes can hold two windows, "Live" stops being one
   fact about the assignment: 1st Period's copy can have closed
   while 4th Period's is still open. Anywhere a badge sits next
   to ONE class, it has to be this one — and it reads the LAST
   deadline across the class's windows, because a class with
   anyone still working is a class that is still open. */
export function statusForClass(assignment, classId) {
  const ws = windowsFor(assignment, classId)
  if (ws.every((w) => daysUntil(w.start) > 0)) return 'upcoming'
  const last = ws.reduce((m, w) => (w.due > m ? w.due : m), ws[0]?.due ?? assignment.due)
  return daysUntil(last) < 0 ? 'closed' : 'live'
}

/* The rollup, for the three groups on the Assigned tab. An
   assignment is live if ANY class still has it open — the
   teacher's question there is "is there anything outstanding on
   this", and one open class is a yes. */
export function statusOf(assignment) {
  const states = assignment.classIds.map((cid) => statusForClass(assignment, cid))
  if (states.includes('live')) return 'live'
  if (states.includes('upcoming')) return 'upcoming'
  return 'closed'
}

/* ---- CAN THE EXISTING WINDOW BE REUSED? ----
   Dhinesh's rule from the prototype: adding a class offers the
   dates the others got, and that option is DISABLED when the
   due date has already passed — not hidden. A missing option
   reads either as "doesn't apply" or as "can't be done", and
   she has no way to tell which; a dimmed one with its reason
   attached answers the question she would otherwise carry. */
export function canKeepDates(assignment) {
  return daysUntil(assignment?.due ?? todayISO) >= 0
}

export function classesNotOnAssignment(assignmentId) {
  const a = getAssignment(assignmentId)
  if (!a) return []
  return classes.filter((c) => !a.classIds.includes(c.id))
}

function snapshot(classId) {
  return [...(getClass(classId)?.studentIds ?? [])]
}

export function addClassesToAssignment(assignmentId, classIds, dates) {
  const a = getAssignment(assignmentId)
  if (!a) return
  a.perClass = a.perClass ?? {}
  for (const cid of classIds) {
    if (a.classIds.includes(cid)) continue
    a.classIds.push(cid)
    a.perClass[cid] = {
      addedLate: true,
      windows: [
        {
          start: dates?.start ?? a.start,
          due: dates?.due ?? a.due,
          studentIds: snapshot(cid),
        },
      ],
    }
  }
  classStamp++
}

export function removeClassFromAssignment(assignmentId, classId) {
  const a = getAssignment(assignmentId)
  if (!a) return
  a.classIds = a.classIds.filter((cid) => cid !== classId)
  if (a.perClass) delete a.perClass[classId]
  classStamp++
}

/* ============================================================
   DUPLICATE
   ------------------------------------------------------------
   What a teacher means by it: "run this again". Same material,
   same classes, a fresh window — the September version of the
   lesson she gave in April, or the re-teach after a unit test
   went badly.

   It does NOT copy the progress, obviously, but the mock has to
   be told that: `fresh` is read by progressFor, which otherwise
   hashes student + assignment and would hand a copy made ten
   seconds ago a completion rate. The suffix is "(copy)" rather
   than a silent duplicate title, because two identical names in
   one list is the thing that makes her open both to find out
   which is which.
   ============================================================ */
let copySeq = 0

export function duplicateAssignment(id) {
  const a = getAssignment(id)
  if (!a) return null
  const start = todayISO
  const due = addDaysISO(todayISO, 7)
  const copy = {
    ...a,
    id: `${a.id}-copy-${++copySeq}`,
    title: `${a.title} (copy)`,
    resourceIds: [...a.resourceIds],
    classIds: [...a.classIds],
    created: todayISO,
    start,
    due,
    status: 'active',
    /* The copy starts from nothing: no per-class windows, no
       population snapshots, no newcomers. Carrying `perClass`
       across would tell her 4th Period was "newly assigned"
       three weeks ago on an assignment made this morning. */
    perClass: undefined,
    fresh: true,
  }
  assignments.push(copy)
  classStamp++
  return copy
}

/* ---- UNASSIGN ----
   Takes the whole thing back, from every class. The word is the
   live product's, and it is the right one: "delete" describes
   what happens to the record, "unassign" describes what happens
   to the twenty-four children who had it on their list this
   morning. */
export function unassignAssignment(id) {
  const i = assignments.findIndex((a) => a.id === id)
  if (i < 0) return false
  assignments.splice(i, 1)
  classStamp++
  return true
}

/* What taking it back costs, named in the numbers she loses —
   the same argument as `deletionImpact`. A confirmation that
   asks her to be sure of something it has not told her is a
   speed bump, not a safeguard. */
export function unassignImpact(id) {
  const a = getAssignment(id)
  if (!a) return { classes: 0, students: 0, completed: 0 }
  const st = assignmentStats(id)
  return { classes: a.classIds.length, students: st.total, completed: st.completed }
}

function addDaysISO(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/* ============================================================
   ASSIGNING TO NAMED CHILDREN
   ------------------------------------------------------------
   The students-mode half of re-assigning, and the thing that
   removes the one overstatement this model still had.

   Until now, picking six children out of 1st Period recorded
   "1st Period has it" — because an assignment has to name
   classes for any screen to find it, and nothing carried the
   narrower truth. The delivery snapshot already existed for the
   newcomers nudge, so it can carry this too: the class is
   listed, and its window holds exactly the six.

   Everything downstream was already reading the delivery rather
   than the roster — the completion ratio, the stats, the
   nudge — so this costs nothing to honour. A fact modelled
   properly once tends to pay for itself the second time it is
   needed.

   TWO CASES, AND THE SECOND IS THE INTERESTING ONE:

     THE CLASS DOES NOT HAVE IT. It joins, carrying only the
     children she picked and the window she chose.

     THE CLASS ALREADY HAS IT, and she is adding more of its
     children. Their names are merged into the delivery, and if
     she gave them a different deadline the class genuinely
     holds two — which is what `extraDue` records and what the
     card reports as "Multiple due dates". The live product does
     exactly this, and it is right to: printing one date would
     be a lie about half the room.
   ============================================================ */
export function assignStudentsToAssignment(assignmentId, studentIds, dates) {
  const a = getAssignment(assignmentId)
  if (!a) return
  a.perClass = a.perClass ?? {}

  const byClass = new Map()
  for (const sid of studentIds) {
    const c = classes.find((x) => x.studentIds.includes(sid))
    if (!c) continue
    if (!byClass.has(c.id)) byClass.set(c.id, [])
    byClass.get(c.id).push(sid)
  }

  const start = dates?.start ?? a.start
  const due = dates?.due ?? a.due

  for (const [cid, ids] of byClass) {
    if (!a.classIds.includes(cid)) {
      a.classIds.push(cid)
      a.perClass[cid] = { addedLate: true, windows: [{ start, due, studentIds: [...ids] }] }
      continue
    }
    /* A class with no `perClass` had the assignment on its
       original window, with its whole roster — write that down
       before adding to it, rather than branching every caller
       around the absence. */
    const d = (a.perClass[cid] = a.perClass[cid] ?? {
      addedLate: false,
      windows: [
        { start: a.start, due: a.due, studentIds: [...(getClass(cid)?.studentIds ?? [])] },
      ],
    })

    /* ---- MERGE INTO A MATCHING WINDOW, DON'T ADD A SECOND ----
       Two windows with the same two dates are one window. If
       they were kept apart, the class would report "multiple
       due dates" over a pair of identical ones and the
       breakdown would show the same range twice — a distinction
       the data can see and the teacher cannot. */
    const same = d.windows.find((w) => w.start === start && w.due === due)
    if (same) {
      same.studentIds = [...new Set([...same.studentIds, ...ids])]
    } else {
      /* And they leave whichever window they were on, so a
         child never appears under two deadlines at once. */
      for (const w of d.windows) {
        w.studentIds = w.studentIds.filter((id) => !ids.includes(id))
      }
      d.windows = d.windows.filter((w) => w.studentIds.length > 0)
      d.windows.push({ start, due, studentIds: [...ids] })
      d.windows.sort((x, y) => x.due.localeCompare(y.due))
    }
  }
  classStamp++
}

/* ---- CATCHING UP THE CHILDREN WHO JOINED LATE ----
   Handled by `assignStudentsToAssignment` above, because it is
   the same operation: add these named children to this class's
   delivery, on this window. There was a separate `catchUpClass`
   that took a whole class and one date; it went when the
   dialog learned to let a teacher pick WHICH of the newcomers
   to catch up, at which point the two functions were doing the
   same job with different amounts of truth. */



/* ============================================================
   SECOND ATTEMPTS
   ------------------------------------------------------------
   Until now every score in this prototype was a child's only
   score, which quietly made the product a report card rather
   than a teaching tool. Re-assign existed, it opened, it picked
   students and resources — and nothing ever came back. The one
   loop the whole screen is built around had no second half.

   So a handful of children in 1st Period have one: they did
   "Mixtures — Re-teach and Review", sank on a piece or two of
   it, the teacher sent those pieces back, and they came up.

   ---- THE RULES THAT KEEP IT HONEST ----

   ONLY THE RESOURCES THAT FAILED. Dhinesh was explicit, and it
   matches the Re-assign dialog he designed: it picks resources
   per student. Re-sending the whole assignment would re-test
   work the child had already got right, which is a different
   action — the coaching plan — and belongs to a different
   screen. A resource the child passed keeps its first score
   untouched and shows no arrow, because nothing happened to it.

   A RETAKE IS ONLY A RETAKE IF THE FIRST GO WAS BAD. The plan
   is built from the scores, not alongside them: a child is
   eligible when a completed resource came in under the retake
   line, and the pieces re-sent are his worst ones. That ordering
   is the whole point. Generating "re-attempted" as a flag and a
   lift independently of the first score would produce children
   who were re-taught after scoring 82, which is the kind of
   detail that tells a teacher the screen is made up.

   THE LATEST ATTEMPT IS THE SCORE. The overall, the class
   average, the bands and mastery all read the second number.
   The first one is kept and shown, but it does not go on
   counting against a child who has since fixed it — a product
   that averages the two is telling her the re-teach half worked,
   which is not a thing anybody believes.

   AND THE LIFT IS NOT A MIRACLE. Twelve to twenty-six points,
   seeded per child and resource. Enough to cross a band, not
   enough to turn a 30 into a 95 — a prototype where re-teaching
   always produces mastery is a sales demo, and it would make
   the comparison column worthless for judging the design.
   ============================================================ */
const RETAKE_BELOW = 60
const RETAKE_ASSIGNMENT = 'a10'

/* Which of this child's resources were sent back, if any.
   Returns null for everyone else, which is nearly everyone. */
function retakePlanFor(studentId, assignmentId) {
  if (assignmentId !== RETAKE_ASSIGNMENT) return null
  const a = getAssignment(assignmentId)
  if (!a) return null
  /* Only the class the re-teach actually happened in. */
  const own = classes.find((c) => c.studentIds.includes(studentId))
  if (own?.id !== 'c1') return null

  /* Roughly half the eligible children, so the report shows both
     a child who was re-taught and a child who was not — a column
     where every row carries an arrow is as uninformative as one
     where none do. */
  if (hash(studentId + 'retake-picked') % 100 >= 78) return null

  const base = baseProgress(studentId, assignmentId)
  if (base?.state !== 'completed') return null

  const rows = baseResourceRows(studentId, assignmentId, base)
  const failed = rows
    .filter((r) => r.score != null && r.score < RETAKE_BELOW)
    .sort((x, y) => x.score - y.score)
  if (!failed.length) return null

  /* His worst one, or his worst two when he sank on several.
     Nobody gets more than two back at once: a re-assign that
     returns four of five pieces is not a re-teach, it is the
     assignment again. */
  const take = failed.length > 2 ? 2 : 1
  return {
    resourceIds: failed.slice(0, take).map((r) => r.resource.id),
    /* Sent back the day after the class window shut. */
    sentOn: '2026-09-23',
  }
}

/* The lift on one resource, seeded so it never moves. */
function retakeLift(studentId, resourceId) {
  return 12 + (hash(studentId + resourceId + 'lift') % 15)
}

export function wasRetaken(studentId, assignmentId) {
  return !!retakePlanFor(studentId, assignmentId)
}

/* ---------- Progress ---------- */
function baseProgress(studentId, assignmentId) {
  const student = getStudent(studentId)
  const assignment = getAssignment(assignmentId)
  if (!student || !assignment) return null

  const h = hash(studentId + assignmentId)

  if (assignment.status === 'scheduled') {
    return { state: 'not-started', score: null, minutes: 0 }
  }

  /* A copy made in this session. Nobody has had a chance. */
  if (assignment.fresh) {
    return { state: 'not-started', score: null, minutes: 0 }
  }

  /* ---- A CHILD WHO WAS NEVER GIVEN IT HAS NOT NEGLECTED IT ----
     `hash` is a fingerprint of the pair, with no idea when the
     pair came to exist. Without this, a class added three weeks
     late opens with fourteen of twenty-four already finished,
     and a child who joined on Thursday appears to have ignored
     work he never received. Both are the same bug, and both are
     answered by the delivery's snapshot. */
  const own = classes.find((c) => c.studentIds.includes(studentId))
  if (own) {
    const d = assignment.perClass?.[own.id]
    if (d?.windows) {
      const mine = d.windows.find((w) => w.studentIds.includes(studentId))
      /* Never given it. */
      if (!mine) return { state: 'not-started', score: null, minutes: 0 }
      /* ---- READ THE WINDOW, NOT THE CLASS ----
         Given today or later, so nobody has had time — and this
         is per STUDENT because two children in one class can be
         on two windows. The class-level version of this check
         told a child caught up this morning that she was
         already in progress, because the hash does not know
         when she was handed the work. The window does. */
      if (daysUntil(mine.start) >= 0) {
        return { state: 'not-started', score: null, minutes: 0 }
      }
    }
  }

  const isDone = assignment.status === 'closed' ? h % 10 < 9 : h % 10 < 6
  if (!isDone) {
    return {
      state: h % 10 < 8 ? 'in-progress' : 'not-started',
      score: null,
      minutes: h % 10 < 8 ? 4 + (h % 12) : 0,
    }
  }

  /* Score orbits the student's ABILITY — the hidden seed — not
     the mastery figure on screen, which is itself computed from
     these scores. Reading mastery here would make the number
     define the evidence that defines the number. */
  const drift = (h % 21) - 10
  const score = Math.max(12, Math.min(100, student.ability + drift))
  return { state: 'completed', score, minutes: 8 + (h % 24) }
}

/* ---- ONE CHILD, ONE RESOURCE ----
   `progressFor` answers "how did he do on this assignment".
   The assignment report needs the level under that: he scored
   58% overall, but WHICH of the three pieces sank him. On the
   live product's report that column-per-resource is the whole
   point of the screen — a 60% quiz beside a 100% reader and a
   14% student review is a completely different conversation
   from three flat 58s, and only the second one tells her what
   to re-teach.

   TWO RULES KEEP IT HONEST.

   First, the resource scores average to EXACTLY the assignment
   score the rest of the product already shows. A report whose
   row adds up to 62 under an Overall column reading 58 is a
   report a teacher stops trusting, and she would be right to.
   The drifts are generated, then centred, then the rounding
   remainder is walked back onto whichever resource has room for
   it — so the mean is the assignment score by construction, not
   by luck.

   Second, a part-finished assignment finishes IN ORDER. A child
   who has done the module and not the quiz is the ordinary
   case; one who has done the quiz but not the module he was
   meant to watch first is not, and scattering the gaps at
   random would invent that child several times per class. */
function baseResourceRows(studentId, assignmentId, overall) {
  const a = getAssignment(assignmentId)
  if (!a) return []
  const items = a.resourceIds.map(getResource).filter(Boolean)
  if (!overall) return []

  if (overall.state === 'not-started') {
    return items.map((r) => ({ resource: r, state: 'not-started', score: null, minutes: 0 }))
  }

  /* How far down the list he has got. At least one started,
     never all of them — "all of them" is what completed means,
     and this branch is the one where he is not. */
  if (overall.state === 'in-progress') {
    const reach = 1 + (hash(studentId + assignmentId + 'reach') % Math.max(1, items.length - 1))
    return items.map((r, i) => {
      if (i < reach - 1) {
        const h = hash(studentId + r.id)
        return {
          resource: r,
          state: 'completed',
          score: Math.max(12, Math.min(100, (getStudent(studentId)?.ability ?? 60) + ((h % 21) - 10))),
          minutes: Math.max(2, Math.round((r.minutes ?? 10) * (0.6 + (h % 90) / 100))),
        }
      }
      if (i === reach - 1) {
        return {
          resource: r,
          state: 'in-progress',
          score: null,
          minutes: Math.max(1, Math.round((r.minutes ?? 10) * 0.4)),
        }
      }
      return { resource: r, state: 'not-started', score: null, minutes: 0 }
    })
  }

  /* ---- COMPLETED: THE SCORES THAT ADD UP ---- */
  const n = items.length
  const base = overall.score
  const raw = items.map((r) => (hash(studentId + r.id) % 31) - 15)
  const mean = raw.reduce((s, d) => s + d, 0) / n
  const out = raw.map((d) => Math.max(8, Math.min(100, Math.round(base + d - mean))))

  /* Centring and clamping both leave a remainder. Walk it back
     onto resources that can absorb it, a point at a time. */
  let diff = base * n - out.reduce((s, v) => s + v, 0)
  for (let pass = 0; diff !== 0 && pass < n * 60; pass++) {
    const k = pass % n
    const step = diff > 0 ? 1 : -1
    const next = out[k] + step
    if (next >= 8 && next <= 100) {
      out[k] = next
      diff -= step
    }
  }

  return items.map((r, i) => {
    const h = hash(studentId + r.id + 'min')
    return {
      resource: r,
      state: 'completed',
      score: out[i],
      minutes: Math.max(2, Math.round((r.minutes ?? 10) * (0.5 + (h % 110) / 100))),
    }
  })
}

/* ============================================================
   COACHING PLANS THAT ACTUALLY HAPPENED
   ------------------------------------------------------------
   Sending a coaching plan used to tick a button, wait 1.4
   seconds and close. Nothing was stored, so the next morning the
   screen could not tell a child she had taught again from a
   child she had not — and the one question a plan raises, "did
   it work", had nowhere to be answered.

   ---- WHAT A PLAN IS, AS AGAINST A RE-ASSIGN ----
   Dhinesh drew the line and it is a good one. Re-assign is
   surgical: these two pieces, back to these children. A coaching
   plan is the bigger intervention — the child did well on one of
   the five, so you keep that one and send him back through the
   other four, with support material alongside. One is a
   correction; the other is a re-teach.

   So a plan's targets are computed, not chosen blind: the
   resources in THIS assignment that he fell under the line on,
   minus anything a re-assign has already fixed. That exclusion
   matters — without it a cell could carry two interventions and
   show "60 → 71" having silently dropped the 48 it started
   from, which is a worse lie than showing nothing.

   ---- RESULTS APPEAR AT ONCE, AND THAT IS A PRETENCE ----
   Dhinesh asked for this deliberately so the finished state is
   always one click away, and in a prototype with no clock that
   is the right call. It is still the one place in this file
   where the data does something real children cannot: a plan
   sent at 11am does not have four completed resources by 11am.
   Written down here so that nobody later mistakes it for a
   model of how the product would behave.
   ============================================================ */
/* ---- THE PLAN USES THE PRODUCT'S OWN LINE, NOT A NEW ONE ----
   This started at 60, which was a third threshold invented for
   one function — and Dhinesh has already caught me doing
   exactly that once, with two different numbers wearing the word
   "struggling". `needsAttention` is the line the whole product
   draws at 70, it is the line the red count in the header is
   made of, and it is the line a teacher has already read on
   this screen before she presses Coach. A piece of work that
   needs attention is a piece of work worth re-teaching; there
   is no second question for a second number to answer.

   (The 60 in the re-attempt seed above is not a rival to it.
   That one decides which children in made-up data happen to
   have been sent work back; this one is a rule the product
   applies in front of the teacher.) */

export const coachingPlans = []

/* The pieces of this assignment a plan would cover: what he
   fell under the line on, leaving out what a re-assign already
   put right. Returns [] when there is nothing to re-teach,
   which is the signal that this child does not need a plan. */
export function coachingTargetsFor(studentId, assignmentId) {
  return resourceProgressFor(studentId, assignmentId)
    .filter((r) => needsAttention(r.score) && !r.retaken)
    .sort((a, b) => a.score - b.score)
    .map((r) => r.resource)
}

/* ---- WHICH ASSIGNMENT A PLAN HANGS OFF ----
   A plan is recorded against an assignment, because that is
   where its results are read: the report's columns are the
   pieces it re-taught. Opened from the assignment report that
   is settled. Opened from Today, from a roster or from a student
   page it is not, so this answers it the way the teacher would —
   his worst finished piece of work on the standard she is
   looking at, which is the one that put him on her list. */
export function coachableAssignmentFor(studentId, standardId) {
  const own = classes.find((c) => c.studentIds.includes(studentId))
  if (!own) return null
  const candidates = assignmentsForClass(own.id)
    .filter((a) => !standardId || a.standardId === standardId)
    .map((a) => ({ a, p: baseProgress(studentId, a.id) }))
    .filter(({ p }) => p?.state === 'completed')
  if (!candidates.length) return null
  candidates.sort((x, y) => x.p.score - y.p.score)
  return candidates[0].a
}

export function coachingPlanFor(studentId, assignmentId) {
  return (
    coachingPlans.find(
      (p) => p.studentId === studentId && p.assignmentId === assignmentId
    ) ?? null
  )
}

/* ---- THE LIFT A RE-TEACH BUYS ----
   Bigger than a re-assign's, because a plan is more work and
   carries support material the re-assign does not — but still
   seeded, still capped, and still short of mastery. The ceiling
   is 84: a child who needed attention a fortnight ago does not
   come back at 97, and a prototype that says he does is selling.

   The first version ran 16-31 points and took Jayden Price from
   49 to 75 — out of "Did not meet", past "Approaches", into
   "Meets", off one plan. That is the sales-demo version of this
   feature. At 10-22 he lands in the sixties: better, visibly
   better, and still on her list. Which is both more honest and
   more useful, because the screen then has to answer what she
   does next. */
function coachLift(studentId, resourceId) {
  return 10 + (hash(studentId + resourceId + 'coach') % 13)
}

export function sendCoachingPlan({
  studentId,
  assignmentId,
  classId,
  standardId,
  supportIds = [],
  /* `todayISO` is a constant in this file, not a function —
     calling it threw on the first live send and left the panel
     sitting on the compose form with nothing recorded. */
  sentOn = todayISO,
}) {
  const existing = coachingPlanFor(studentId, assignmentId)
  if (existing) return existing

  const targets = coachingTargetsFor(studentId, assignmentId)
  const plan = {
    id: `plan-${coachingPlans.length + 1}`,
    studentId,
    assignmentId,
    classId,
    standardId,
    sentOn,
    supportIds,
    results: targets.map((r) => {
      /* `firstScore` is read from the row as it stands the moment
         the plan goes out, so it is whatever the child actually
         had — not a number regenerated later from a seed that
         has since moved on. */
      const before =
        resourceProgressFor(studentId, assignmentId).find(
          (row) => row.resource.id === r.id
        )?.score ?? 0
      return {
        resourceId: r.id,
        firstScore: before,
        score: Math.min(84, before + coachLift(studentId, r.id)),
      }
    }),
  }
  coachingPlans.push(plan)
  return plan
}

/* ---- A FEW PLANS THAT WENT OUT A FORTNIGHT AGO ----
   So the finished state exists before anybody presses anything.
   Seeded from the children who are furthest under on a10 and
   were NOT re-assigned, which is the same rule the button uses —
   if the seed and the button disagreed about who needs a plan,
   the screen would be arguing with itself on load. */
function seedCoachingPlans() {
  const ids = getClass('c1')?.studentIds ?? []
  for (const sid of ids) {
    /* Finished the thing first. A plan can honestly go to a
       child who is still working — a teacher may well not wait —
       but the overall column has no score to compare against
       until he is done, so seeding one there puts arrows in the
       cells beside an Overall that says "Still working" and
       explains neither. The live button has the same rule: it
       only appears on a finished row. */
    if (baseProgress(sid, 'a10')?.state !== 'completed') continue
    if (retakePlanFor(sid, 'a10')) continue
    /* No random gate. Every child who qualifies gets one, because
       the alternative is a screen that says "this one needed
       re-teaching and nobody did anything" next to an identical
       child who was taught — with the difference decided by a
       hash. A teacher reading that would be right to ask which
       of the two the product is wrong about. */
    if (!coachingTargetsFor(sid, 'a10').length) continue
    sendCoachingPlan({
      studentId: sid,
      assignmentId: 'a10',
      classId: 'c1',
      standardId: '5.6B',
      sentOn: '2026-09-25',
    })
  }
}

/* ---- THE PUBLIC VIEW: WHAT THE CHILD STANDS AT NOW ----
   Both of these are the base reading with the re-attempt laid
   over it. A resource that was sent back carries BOTH numbers —
   `firstScore` is what he got the first time, `score` is where
   he is now — and the resources that were not sent back are
   returned exactly as they were, with no `firstScore` at all.
   The absence is deliberate: a column of arrows where only two
   of them mean anything teaches a teacher to stop reading them. */
export function resourceProgressFor(studentId, assignmentId) {
  const rows = retakenRows(studentId, assignmentId)
  const coached = coachingPlanFor(studentId, assignmentId)
  if (!coached) return rows

  /* ---- THE PLAN'S RESULTS SIT ON TOP, AND ARE READ NOT GUESSED ----
     The scores come off the stored plan rather than being
     recomputed here, because the plan recorded what the child
     had the day it went out. Regenerating the "before" from a
     seed would let it drift away from the number the teacher
     was looking at when she pressed Send. */
  return rows.map((row) => {
    const hit = coached.results.find((r) => r.resourceId === row.resource.id)
    if (!hit || row.score == null) return row
    return {
      ...row,
      score: hit.score,
      firstScore: hit.firstScore,
      coached: true,
      minutes: row.minutes + Math.max(3, Math.round(row.minutes * 0.8)),
    }
  })
}

function retakenRows(studentId, assignmentId) {
  const base = baseProgress(studentId, assignmentId)
  const rows = baseResourceRows(studentId, assignmentId, base)
  const plan = retakePlanFor(studentId, assignmentId)
  if (!plan) return rows

  return rows.map((row) => {
    if (!plan.resourceIds.includes(row.resource.id) || row.score == null) return row
    const first = row.score
    const next = Math.min(96, first + retakeLift(studentId, row.resource.id))
    return {
      ...row,
      score: next,
      firstScore: first,
      /* He sat with it a second time, so the time on the piece
         is both goes added together — the minutes column is a
         measure of effort spent, and the first sitting was not
         un-spent by the second. */
      minutes: row.minutes + Math.max(2, Math.round(row.minutes * 0.6)),
      retaken: true,
    }
  })
}

export function progressFor(studentId, assignmentId) {
  const base = baseProgress(studentId, assignmentId)
  const plan = retakePlanFor(studentId, assignmentId)
  const coached = coachingPlanFor(studentId, assignmentId)
  if ((!plan && !coached) || base?.state !== 'completed') return base

  /* The overall has to be the mean of the row the teacher is
     looking at, or the report contradicts itself across one
     line. So it is recomputed from the post-retake scores
     rather than lifted by some separate rule. */
  const rows = resourceProgressFor(studentId, assignmentId)
  const scored = rows.filter((r) => r.score != null)
  const score = Math.round(scored.reduce((s, r) => s + r.score, 0) / scored.length)
  const minutes = rows.reduce((s, r) => s + (r.minutes ?? 0), 0)

  return {
    ...base,
    score,
    minutes,
    firstScore: base.score,
    retaken: !!plan,
    retakenOn: plan?.sentOn,
    retakenResourceIds: plan?.resourceIds,
    coached: !!coached,
    coachedOn: coached?.sentOn,
    coachedResourceIds: coached?.results.map((r) => r.resourceId),
  }
}

/* ============================================================
   MASTERY IS A READING OF REAL WORK, OVER TIME

   Dhinesh's second point: the product had no time dimension at
   all. Every competitor has one, and ours was a trend arrow
   seeded from a hash — it pointed up or down at random and
   agreed with the score beside it only by accident. That is
   worse than having nothing, because it looks like information.

   ---- WHY A DECAYING AVERAGE AND NOT A CHART ----
   Mastery Connect's answer is not a graph. It is a SETTING:
   Most Recent, Mode, Maximum, Decaying Average, Average, Power
   Law — a rule about how old evidence counts, applied to the
   one number the teacher already reads. Decaying Average is
   their most-used option and the default decay is 65%.

   That is a better idea than a sparkline, and it is the one we
   take. A child who scored 40, then 55, then 70 should read as
   roughly 62 and rising, not as 55 — his average flatters his
   past and buries his progress. The weighting says the opposite:
   the most recent piece of work counts fully, the one before it
   counts 65% as much, the one before that 42%, and so on. Nobody
   has to read a chart to see that he is climbing; the number
   itself has already climbed.

   ---- AND THE ARROW BECOMES TRUE ----
   The trend is computed from the same series — the weighted
   recent half against the weighted earlier half — so the arrow
   and the number can no longer contradict each other. A child
   can be at 62 and rising or 62 and falling, and the screen now
   means it.

   WHAT THIS DOES NOT DO: it recomputes once, at module load.
   Assigning work during a session will not move anybody's
   mastery until a reload. In a real product this is a query;
   here it is a pass over seeded data, and pretending otherwise
   would be the kind of fake precision this whole exercise is
   trying to remove.
   ============================================================ */
const DECAY = 0.65

function completedSeriesFor(studentId) {
  const own = classes.find((c) => c.studentIds.includes(studentId))
  if (!own) return []
  return assignmentsForClass(own.id)
    .map((a) => ({ a, pr: progressFor(studentId, a.id) }))
    .filter(({ pr }) => pr?.state === 'completed')
    /* Oldest first, by the deadline they worked to — not by the
       order the array happens to hold them in. */
    .sort((x, y) => (x.a.due ?? '').localeCompare(y.a.due ?? ''))
    .map(({ pr }) => pr.score)
}

/* Weights run newest-heaviest. An empty series returns null,
   which every caller already knows how to draw. */
function decayingAverage(scores) {
  if (!scores.length) return null
  let num = 0
  let den = 0
  for (let i = scores.length - 1, w = 1; i >= 0; i--, w *= DECAY) {
    num += scores[i] * w
    den += w
  }
  return Math.round(num / den)
}

/* Rising, falling or flat, from the same evidence as the
   number. Three points either side at most, because "is he
   climbing" is a question about this unit, not about September.
   A five-point gap, so ordinary wobble does not print an arrow. */
function trendFrom(scores) {
  if (scores.length < 3) return 'flat'
  const cut = Math.floor(scores.length / 2)
  const earlier = decayingAverage(scores.slice(0, cut))
  const recent = decayingAverage(scores.slice(cut))
  if (earlier == null || recent == null) return 'flat'
  if (recent - earlier >= 5) return 'up'
  if (earlier - recent >= 5) return 'down'
  return 'flat'
}

export function recomputeMastery() {
  for (const s of students) {
    const scores = completedSeriesFor(s.id)
    /* ---- NO WORK, NO NUMBER ----
       This used to fall back to the seed when a child had
       finished nothing, on the grounds that four screens assumed
       a number. That was the wrong trade and Dhinesh found it
       the way these things are always found: two counts on one
       screen that would not agree.

       7th Period's card said 4 children needed attention and the
       segment above it said 5. The fifth was Rafael Osei at 57%
       — a figure with nothing behind it. He has one assignment
       in that class and he is still working on it, so the
       product had no evidence about him at all, invented a
       plausible score from his seed, and then flagged him on the
       invention.

       That is worse than a blank in every direction. It accuses
       a child of falling behind on work nobody has marked, it
       pads the number a teacher uses to plan her week, and it
       makes two honest counts contradict each other on the same
       screen.

       Null now. "We do not know yet" is a real state, and every
       screen that shows a score already knows how to draw it —
       Score prints an em dash, levelFor returns no band, and
       needsAttention is false, because a child cannot need
       attention on the strength of nothing. */
    s.mastery = decayingAverage(scores)
    s.trend = trendFrom(scores)
  }
}

export function assignmentStats(assignmentId) {
  const a = getAssignment(assignmentId)
  if (!a) return { total: 0, completed: 0, avg: null, needAttention: 0 }

  const ids = a.classIds.flatMap((cid) => reachedIn(a, cid))
  const rows = ids.map((sid) => progressFor(sid, assignmentId))
  const done = rows.filter((r) => r?.state === 'completed')
  const avg = done.length
    ? Math.round(done.reduce((sum, r) => sum + r.score, 0) / done.length)
    : 0
  const needAttention = done.filter((r) => needsAttention(r.score)).length

  return { total: ids.length, completed: done.length, avg, needAttention }
}

/* ---- ONE ASSIGNMENT, ONE CLASS ----
   `assignmentStats` averages across every class an assignment
   went to, which is the right number on a screen about the
   assignment and the wrong one on a screen about this class.
   A teacher looking at 1st Period's report does not want 3rd
   Period's scores folded into it.

   Returns null for `avg` rather than 0 when nobody has
   finished, for the reason classStats does: no data and a floor
   score are not the same fact. */
export function assignmentStatsForClass(assignmentId, classId) {
  /* Scoped to the children this class's delivery actually
     reached. Counting the newcomers would push every ratio
     down and make a class look like it was falling behind on
     the day a new child enrolled. */
  const ids = reachedIn(getAssignment(assignmentId), classId)
  const rows = ids.map((sid) => progressFor(sid, assignmentId))
  const done = rows.filter((r) => r?.state === 'completed')
  return {
    total: ids.length,
    completed: done.length,
    avg: done.length
      ? Math.round(done.reduce((sum, r) => sum + r.score, 0) / done.length)
      : null,
    needAttention: done.filter((r) => needsAttention(r.score)).length,
  }
}

export function classStats(classId) {
  const ids = getClass(classId)?.studentIds ?? []
  const rows = assignmentsForClass(classId).flatMap((a) =>
    ids.map((sid) => progressFor(sid, a.id))
  )
  const done = rows.filter((r) => r?.state === 'completed')
  /* ---- NULL, NOT ZERO ----
     This used to return 0 when a class had finished nothing,
     and 0 is a claim: it says they sat the work and scored
     nothing. A brand-new class would have opened showing a red
     0% before a single thing had been assigned to it. No data
     and a floor score are not the same fact, and the Score
     component already knows how to draw the difference. */
  const avg = done.length
    ? Math.round(done.reduce((s, r) => s + r.score, 0) / done.length)
    : null
  const flagged = ids.filter((sid) => needsHelp(getStudent(sid)))
  return { size: ids.length, avg, flagged: flagged.length, flaggedIds: flagged }
}

/* ---- HOW THE CLASS SPLITS, NOT JUST WHERE IT SITS ----
   An average is a claim about the middle and silent about the
   shape. Two classes both reading 68% can be a room where
   everybody is at 68 and a room where ten children are failing
   and ten are excelling, and those two need completely opposite
   things from a teacher. This is the single most common
   criticism of average-based reporting, and the fix is to print
   the distribution beside the mean rather than instead of it.

   Returns one entry per band, in the scale's own order, with
   zero-count bands kept — a class with nobody in Masters should
   show an empty quarter rather than a bar that silently
   restacks and looks like a different class. */
export function classBands(classId) {
  const ids = getClass(classId)?.studentIds ?? []
  const counts = Object.fromEntries(LEVELS.map((l) => [l.id, 0]))
  let unscored = 0
  for (const sid of ids) {
    const level = levelFor(getStudent(sid)?.mastery)
    if (!level) {
      unscored += 1
      continue
    }
    counts[level.id] += 1
  }
  /* ---- THE DENOMINATOR IS THE CLASS, NOT THE MARKED PART ----
     Dividing by the scored children alone would make a class
     where three of twenty-three have finished look like a
     confident reading of twenty-three. The bars have to add up
     to the room, which means the unmarked part gets a share of
     the width and a row of its own. Four bands that quietly
     sum to a different number than the "23 students" above them
     is how a card loses a teacher's trust. */
  return {
    total: ids.length,
    unscored,
    bands: LEVELS.map((l) => ({ ...l, count: counts[l.id] })),
  }
}

/* ---------- Students who need attention ----------
   The query the live product cannot answer without a teacher
   going and looking, table by table, class by class. Making it
   a first-class function is the whole point of the redesign:
   the software should notice, not the teacher. */
/* ---- HER CHILDREN, NOT THE DISTRICT'S ----
   This mapped over `students` — every child in the district,
   all six hundred of them, Kindergarten to Grade 12. The screen
   was therefore offering a Grade 5 science teacher a coaching
   plan for a Grade 2 child she has never met, and printing the
   row with no class name beside it because there was no class
   of hers to name. Two hundred and eighty-eight rows, most of
   them nobody's business.

   It was wrong from the first version and nothing exposed it
   until the cohort grew: with five classes the noise was small
   enough to look like data. That is the usual way a scope bug
   survives — it is not wrong enough to notice until the numbers
   move.

   `myStudents()` is the fix and the name is the point: every
   list on this screen answers "which of MY students", so the
   roster it starts from has to be hers. A child in two of her
   groups is counted once; a child in none of them is not her
   concern on this screen. */
export function myStudents() {
  const seen = new Set()
  const out = []
  for (const c of classes) {
    for (const sid of c.studentIds) {
      if (seen.has(sid)) continue
      seen.add(sid)
      const st = getStudent(sid)
      if (st) out.push(st)
    }
  }
  return out
}

/* ---- THE ASSIGNMENT THIS CHILD DID WORST ON ----
   "Weakest on 5.11A" tells a teacher which part of the
   curriculum he is behind on. It does not tell her what he
   actually sat and failed, which is the thing she can open,
   re-teach or re-assign tomorrow morning. A standard is a
   category; an assignment is an event with a date and a score.

   Only COMPLETED work counts. An assignment he has not started
   is not one he did badly on, and a card that called it his
   worst would be accusing him of failing something nobody has
   marked.

   Returns null when there is nothing finished yet — the caller
   prints nothing rather than inventing a worst. */
export function weakestAssignmentFor(studentId) {
  const cls = classes.find((c) => c.studentIds.includes(studentId))
  if (!cls) return null
  let worst = null
  for (const a of assignmentsForClass(cls.id)) {
    const pr = progressFor(studentId, a.id)
    if (pr?.state !== 'completed') continue
    if (!worst || pr.score < worst.score) worst = { assignment: a, score: pr.score }
  }
  return worst
}

/* ---- NEEDS ATTENTION MEANS ONE THING: THE SCORE IS LOW ----
   This used to be three rules stacked on top of each other:
   below 60; below 72 and slipping; or slipping and below 82.
   That third rule is why a student sitting at 81% turned up in
   a list headed "Needs attention", and Dhinesh was right to
   stop on it. Sorted highest-first, the list opened on the
   people who were fine.

   The rule itself was not indefensible — a child dropping from
   90 to 81 IS worth a look — but it failed the test this whole
   redesign is built on: the screen has to speak on its own. The
   table shows a score and a trend arrow. It never showed WHICH
   of the three rules caught a given child, so an 81% row had no
   visible reason to be there, and a teacher scanning the list
   has to either trust it blindly or stop and work it out. A
   filter she cannot predict is a filter she stops believing.

   So: one line, drawn at 70%. Below it you are on the list,
   above it you are not, and she can tell which side of the line
   anyone is on by reading the number already in front of her.
   No rule to learn.

   Nothing is lost by dropping the trend clause. The students
   who were only here for slipping still carry the falling arrow
   in the table, in the same column as their score — so a
   teacher sorting by score still sees them, in the place where
   that fact belongs, rather than being told they are in trouble
   without being told why.

   Severity still splits the list in two, but now along the same
   axis rather than a second one: under 60 is failing, 60–69 is
   short of the line. Both need her; one needs her first. */
export function studentsNeedingAttention() {
  return myStudents()
    .map((s) => {
      const cls = classes.find((c) => c.studentIds.includes(s.id))
      const weakest = pickWeakestStandard(s)
      let reason = null
      let severity = null

      /* ---- THE BAND IS THE REASON ----
         This used to be two hand-written cut lines, 60 and 70,
         written out again here. Now it reads the one scale: a
         child below Meets is on the list, and WHICH band he is
         in is both the severity and the sentence. The two
         numbers that used to live in this function are gone,
         and so is the chance of them drifting from the ones on
         the cards. */
      const level = levelFor(s.mastery)
      if (level && needsAttention(s.mastery)) {
        severity = level.id === 'below' ? 'alert' : 'watch'
        reason =
          s.trend === 'down'
            ? `${level.label} · ${s.mastery}% and falling`
            : `${level.label} · ${s.mastery}%`
      }

      return reason ? { student: s, cls, reason, severity, standard: weakest } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.student.mastery - b.student.mastery)
}

/* Only ever flags a TESTED content standard. A coaching plan
   built around "analyze data" would be useless to a teacher —
   intervention happens on content, not on process. */
export function pickWeakestStandard(student) {
  const tested = allStandards.filter((s) => s.tested)
  return tested[hash(student.id) % tested.length]
}

/* Some TEKS are genuinely harder for a cohort than others, and
   a per-standard difficulty is what makes that true here.

   Without it, averaging 110 students regresses every standard
   to roughly the same number — and the Library ends up showing
   "71%" on every single card. Which is exactly the failure I
   criticised in the live product, where all eight category
   cards read "78 Resources": a figure identical everywhere
   helps a teacher choose nothing.

   A number only earns its place on a card if it VARIES. */
function standardDifficulty(standardId) {
  return (hash('teks' + standardId) % 47) - 25 // roughly -25 … +21
}

export function standardScore(studentId, standardId) {
  const s = getStudent(studentId)
  if (!s) return 0
  const h = hash(studentId + standardId)
  const spread = (h % 25) - 12 // individual variation
  return Math.max(
    10,
    Math.min(100, s.ability + standardDifficulty(standardId) + spread)
  )
}

/* ---------- Recently used / saved ----------
   The cheapest possible fix for "buried features": remember
   what the teacher touched last. The live product remembers
   nothing, so every visit starts at the top of the tree. */
export const recentResourceIds = [
  '5.6D-IM-0',
  '5.8B-LAB',
  '5.6A-QUIZ',
  '5.10A-IM-0',
  '5.8A-SR-0',
  '5.12B-PHENOM',
]

export const savedResourceIds = [
  '5.9A-PHENOM',
  '5.13A-IM-0',
  '5.10C-READER',
  '5.6D-SR-0',
  '5.7A-LAB',
]

/* ---------- Saved playlists ----------
   Dhinesh asked whether Saved holds playlists as well as loose
   resources. It has to, and the reason is the whole point of a
   playlist: assembling one is the expensive part. A teacher
   spends twenty minutes sequencing six resources for a lesson,
   and if the only thing Saved can hold is individual cards then
   that twenty minutes is spent again next year.

   Loose resources answer "I might use this". A saved playlist
   answers "I have already worked out how to teach this" — the
   second is worth far more and takes far longer to rebuild, so
   it belongs at the top of the tab rather than mixed in among
   single cards. */
export const savedPlaylists = [
  {
    id: 'pl-density',
    name: 'Sinking and floating — full lesson',
    note: 'Built for 3rd Period last year. Phenomenon first, then the lab.',
    updated: 'Saved 3 weeks ago',
    resourceIds: ['5.6A-PHENOM', '5.6A-IM-2', '5.6A-IMC-2', '5.6A-LAB', '5.6A-SR-2'],
  },
  {
    id: 'pl-staar-review',
    name: 'STAAR review — Matter and Energy',
    note: 'Review material for the first three 5.6 standards.',
    updated: 'Saved in April',
    /* THREE. This one predated the five-resource cap and had six
       — a saved playlist the product itself could no longer
       create. Dhinesh cut it to three rather than the maximum,
       which is the better mock: three cards all showing exactly
       five would make the cap look like a fixed size rather than
       a ceiling, and a demo where every example is the same
       length hides how the card behaves when it isn't.

       Mock data has to obey the product's own rules, and it
       should also exercise their range. */
    resourceIds: ['5.6A-SR-0', '5.6B-SR-0', '5.6C-SR-0'],
  },
  {
    id: 'pl-water-cycle',
    name: 'Water cycle week',
    note: 'Five days. Works as-is if you have the lab kit.',
    updated: 'Saved in January',
    resourceIds: [
      '5.10A-PHENOM',
      '5.10A-IM-0',
      '5.10A-IMC-0',
      '5.10A-LAB',
      '5.10A-JOURNAL',
    ],
  },
]

/* ============================================================
   TODAY  —  and why it is a constant, not `new Date()`

   Every due date in this file was authored against 16 Sep 2026.
   Read against that date the year makes sense: three modules
   land this week, Forces lands next week, the Water Cycle is
   scheduled but not open yet, and three units are closed behind
   her. A year in progress, which is what the screens are for.

   THE BUG THIS PREVENTS. If the screens asked the browser what
   day it is, that carefully built week would rot on the shelf.
   Demo this on 24 September and every live assignment is
   suddenly overdue; demo it in November and the whole year has
   collapsed into the past. A prototype being pitched to a room
   cannot have a shelf life measured in days.

   So the prototype has its own clock, fixed here. Nothing
   decides whether a piece of work is late by asking the
   browser; it asks this. To move the whole world forward,
   change this one line.

   STILL OUTSTANDING: the date picker in DateField.jsx defaults
   its highlighted "today" to the real one, so opening a
   calendar there will disagree with this by however many days
   have passed. It doesn't mark anything late, so nothing reads
   wrong yet — but it should be pointed at this constant when we
   next touch assigning.
   ============================================================ */
export const todayISO = '2026-09-16'

/* Whole days from the prototype's today to an ISO date.
   Negative means the date has passed. Both sides are pinned to
   UTC midnight so daylight-saving and the viewer's own timezone
   can't shift a boundary and turn "due today" into "1 day
   overdue" for somebody in Sydney. */
export function daysUntil(iso) {
  const day = 24 * 60 * 60 * 1000
  return Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${todayISO}T00:00:00Z`)) / day)
}

/* ---- HOW A DUE DATE SHOULD READ ----
   A teacher scanning a card needs to know how much runway she
   has, and "due Sep 19" makes her do the subtraction against a
   calendar she isn't looking at. Inside a week the relative
   form answers the question directly. Beyond a week it stops
   helping — "due in 11 days" is harder to place than a date —
   so it hands back to the calendar.

   `tone` is returned alongside the words rather than being
   worked out again at each call site, so a date can never be
   phrased as late in one place and calm in another. */
export function dueLabel(iso) {
  const d = daysUntil(iso)
  if (d < 0) return { text: d === -1 ? '1 day overdue' : `${Math.abs(d)} days overdue`, tone: 'alert' }
  if (d === 0) return { text: 'due today', tone: 'watch' }
  if (d === 1) return { text: 'due tomorrow', tone: 'watch' }
  if (d <= 7) return { text: `due in ${d} days`, tone: 'normal' }
  return {
    text: `due ${new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })}`,
    tone: 'normal',
  }
}

/* ---- A DATE THAT IS DONE IS NAMED, NOT COUNTED ----
   `dueLabel` phrases any past date as "11 days overdue", which
   is right on work still in flight and wrong once the window
   has shut. A row reading "Closed · 11 days overdue" in red is
   the product contradicting itself in six words: nothing is
   late, the window simply ended. */
export function onDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

/* ---------- What the teacher is teaching right now ----------
   Derived from where her live assignments are concentrated.

   This is a small function doing a lot of work. A Grade 5
   teacher follows a scope and sequence: she is on ONE unit for
   three or four weeks at a time. So the overwhelming majority
   of Library visits are inside a single strand — and the
   product can work out which one without asking her.

   In a production build this would come from the district's
   scope and sequence rather than being inferred. The inference
   is here so the prototype behaves correctly without one. */
export function currentUnitId() {
  const tally = {}
  assignments
    .filter((a) => a.status === 'active')
    .forEach((a) => {
      const unitId = getStandard(a.standardId)?.unitId
      if (unitId) tally[unitId] = (tally[unitId] ?? 0) + 1
    })

  const best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]
  return best?.[0] ?? contentUnits[0].id
}

/* ============================================================
   SHARED WITH YOU
   ------------------------------------------------------------
   What colleagues have sent this teacher. Dhinesh's addition,
   and it fills a real gap: every teacher in a 5th-grade team
   builds the water-cycle lesson separately, and the product
   had no way for one of them to hand it to the others.

   THREE COLLEAGUES, DELIBERATELY UNEVEN. One has sent a lot,
   one has sent a little, one has sent a single resource. A
   demo where every teacher has sent exactly two things hides
   how the grouping behaves — the same reason the saved
   playlists run 3, 5 and 5 rather than all five.

   They are from three different schools in the same district,
   because sharing across a campus boundary is the case that
   makes this feature worth building; sharing with the teacher
   next door can happen in the corridor.
   ============================================================ */
export const sharedTeachers = [
  {
    id: 'sh-webb',
    name: 'Marcus Webb',
    initials: 'MW',
    detail: 'Grade 5 Science · Creekside Elementary',
  },
  {
    id: 'sh-raman',
    name: 'Priya Raman',
    initials: 'PR',
    detail: 'Grade 5 Science · Ridgeview Elementary',
  },
  {
    id: 'sh-alvarez',
    name: 'Daniela Alvarez',
    initials: 'DA',
    detail: 'Science Instructional Coach · Katy ISD',
  },
]

/* Playlists a colleague has sent. Same shape as savedPlaylists
   plus `from` and `shared`, so the card that draws a saved
   lesson can draw a shared one without a second component —
   and, more importantly, so a copy of one becomes an ordinary
   saved playlist with no conversion step. */
export const sharedPlaylists = [
  {
    id: 'sp-webb-earth',
    from: 'sh-webb',
    name: 'Day and night — the whole week',
    note: "Ran this with 2nd and 4th Period. The phenomenon lands better before the module, not after.",
    shared: 'Shared 2 days ago',
    resourceIds: ['5.9A-PHENOM', '5.9A-IM-0', '5.9A-IMC-0', '5.9A-LAB', '5.9A-JOURNAL'],
  },
  {
    id: 'sp-webb-forces',
    from: 'sh-webb',
    name: 'Forces — short version for a 45 min period',
    note: 'Cut down to fit one period. Skips the reader.',
    shared: 'Shared last week',
    resourceIds: ['5.7A-PHENOM', '5.7A-IM-0', '5.7A-LAB'],
  },
  {
    id: 'sp-alvarez-eco',
    from: 'sh-alvarez',
    name: 'Ecosystems — district model lesson',
    note: 'The sequence the district is recommending for 5.12A. Reader is optional if you are short on time.',
    shared: 'Shared in August',
    resourceIds: ['5.12A-PHENOM', '5.12A-IM-0', '5.12A-IMC-0', '5.12A-LAB', '5.12A-READER'],
  },
]

/* Single resources a colleague has flagged. Loose, not
   sequenced — the equivalent of "have you seen this one". */
export const sharedResources = [
  { id: 'sr-1', from: 'sh-webb', resourceId: '5.8B-VOCAB', shared: 'Shared 2 days ago' },
  { id: 'sr-2', from: 'sh-raman', resourceId: '5.9A-SR-0', shared: 'Shared yesterday' },
  { id: 'sr-3', from: 'sh-raman', resourceId: '5.12A-SR-0', shared: 'Shared yesterday' },
  { id: 'sr-4', from: 'sh-alvarez', resourceId: '5.8B-QUIZ', shared: 'Shared in August' },
]

export const getSharedTeacher = (id) => sharedTeachers.find((t) => t.id === id)

/* ---- WHO HAS ACTUALLY BEEN TAUGHT THIS, AND HOW DID THEY DO ----
   Dhinesh's point about "Class average": the number was true
   and told a teacher nothing, because it never said WHICH
   class. Worse, it averaged all five of her classes on a TEKS
   she might only have assigned to two — quietly folding in
   thirty students who have never seen the material.

   So the population is the classes this TEKS has been assigned
   to, and the row says so out loud.

   THE AVERAGE IS OVER STUDENTS, NOT OVER CLASSES. A class of
   24 and a class of 20 should not carry equal weight in a
   figure she reads as "how did my kids do on this".

   Returns null when nothing has been assigned. That is a real
   state and a useful one — early in the year most of the year
   is null — so the row shows it rather than printing a 0% that
   would read as failure. */
export function assignedPerformanceFor(standardId) {
  const classIds = new Set()
  assignments
    .filter((a) => a.standardId === standardId)
    .forEach((a) => a.classIds.forEach((id) => classIds.add(id)))

  const taught = classes.filter((c) => classIds.has(c.id))
  if (!taught.length) return null

  const perClass = taught
    .map((c) => {
      const roster = studentsInClass(c.id)
      return {
        id: c.id,
        name: c.name,
        avg: Math.round(
          roster.reduce((sum, st) => sum + standardScore(st.id, standardId), 0) /
            Math.max(roster.length, 1)
        ),
      }
    })
    .sort((a, b) => a.avg - b.avg)

  /* Deduped, because a student in two of her sections must not
     be counted twice in the average. */
  const seen = new Set()
  taught.forEach((c) => studentsInClass(c.id).forEach((st) => seen.add(st.id)))
  const roster = [...seen]

  return {
    classCount: taught.length,
    average: Math.round(
      roster.reduce((sum, id) => sum + standardScore(id, standardId), 0) / roster.length
    ),
    lowest: perClass[0],
    perClass,
  }
}

/* ---- What all her students average on one TEKS ----
   This calculation lived inside StandardDetail, and the Library
   list needed the same number. Two copies of an average is how
   two screens end up quoting different figures for the same
   thing after someone fixes a rounding bug in one of them.

   It is every student she teaches, not the mean of the class
   means: a class of 30 and a class of 18 do not get equal
   weight in a number she reads as "how did my kids do". */
export function classAverageFor(standardId) {
  if (!students.length) return null
  return Math.round(
    students.reduce((sum, st) => sum + standardScore(st.id, standardId), 0) / students.length
  )
}

/* ============================================================
   SELF-CHECK
   ------------------------------------------------------------
   Dhinesh found this the way users find every silent data bug:
   the Recent tab said 6 and showed 3, and Saved said 8 and
   showed 6.

   The counts were not lying. Every list in the product renders
   with `.map(getResource).filter(Boolean)` or the `r ? … :
   null` version of the same thing, which is correct defensive
   code — a dangling id should not blank a screen. But the
   COUNTS were taken from the raw id arrays, so the two halves
   disagreed by exactly the number of broken references, and
   the interface reported the disagreement as a fact about the
   teacher's material.

   Eight ids were dangling, across recent, saved and six
   assignments. They were all the same mistake: '5.6D-IM' for
   what became '5.6D-IM-0' when instruction modules gained
   per-sub-topic variants. The references were written before
   the refactor and nothing complained, because `filter(Boolean)`
   is exactly the code that makes not complaining the default.

   SO THE FIX IS TWO THINGS, and the second matters more. The
   ids are corrected; and from now on a dangling reference says
   so, loudly, the moment the app loads. Mock data is edited by
   hand, often, usually to build one demo — it will drift again.
   What must not happen again is drifting QUIETLY.

   It warns rather than throws. A prototype that refuses to
   start in front of an audience because one demo resource is
   misspelled has traded a cosmetic bug for a fatal one. The
   console is the right volume: unmissable to whoever is
   working on the data, invisible to everyone in the room.
   ============================================================ */
/* ============================================================
   SEEDING THE TWO DELIVERY STATES
   ------------------------------------------------------------
   A window's student list is a list of ids, and the rosters are
   generated rather than written out, so these cannot be
   literals in the assignment objects above. They are filled in
   once, here, after the classes exist.

   What this produces, matching Dhinesh's Workspace screens:

     a8 / 4th Period   added a week after the others, its own
                       window, nobody started yet — the live
                       product's "Newly Assigned" card.

     a8 / 1st Period   two children joined the class after it
                       went out — the "2 Students newly added ·
                       Assign" nudge. They are real students on
                       the roster, so catching them up moves a
                       real number.

   Both on ONE assignment, which is how Dhinesh's screen shows
   it: Particles of matter carries a late-added group and a
   group with newcomers at the same time, and seeing the two
   markers side by side is what makes the distinction between
   them legible.

   Every other delivery is left without a snapshot, which
   `reachedIn` reads as "everyone had it". That is the truth for
   assignments the mock presents as history, and it keeps the
   complication on the two records that are demonstrating it.
   ============================================================ */
function seedDeliveries() {
  const a8 = getAssignment('a8')
  if (a8?.perClass?.c4) {
    a8.perClass.c4 = {
      addedLate: true,
      windows: [
        {
          start: '2026-09-16',
          due: '2026-09-30',
          studentIds: [...(getClass('c4')?.studentIds ?? [])],
        },
      ],
    }
  }

  const c1 = getClass('c1')
  if (a8 && c1 && a8.classIds.includes('c1')) {
    a8.perClass.c1 = {
      addedLate: false,
      windows: [
        {
          start: a8.start,
          due: a8.due,
          /* Everyone except the last two on the roster — they
             are the ones who "joined after". */
          studentIds: c1.studentIds.slice(0, -2),
        },
      ],
    }
  }
}
seedDeliveries()

function auditMockData() {
  const known = new Set(resources.map((r) => r.id))
  const dangling = []

  const check = (ids, where) =>
    ids.forEach((id) => known.has(id) || dangling.push(`${where} → ${id}`))

  check(recentResourceIds, 'recentResourceIds')
  check(savedResourceIds, 'savedResourceIds')
  savedPlaylists.forEach((p) => check(p.resourceIds, `savedPlaylists "${p.name}"`))
  sharedPlaylists.forEach((p) => check(p.resourceIds, `sharedPlaylists "${p.name}"`))
  check(sharedResources.map((s) => s.resourceId), 'sharedResources')
  assignments.forEach((a) => check(a.resourceIds ?? [], `assignments "${a.title ?? a.id}"`))

  /* Shares point at people as well as resources, and a share
     from a teacher who does not exist renders as a group with
     no heading — another failure that looks like a layout bug
     and is a data one. */
  const people = new Set(sharedTeachers.map((t) => t.id))
  ;[...sharedPlaylists, ...sharedResources].forEach(
    (x) => people.has(x.from) || dangling.push(`share ${x.id} → unknown teacher ${x.from}`)
  )

  if (dangling.length) {
    console.error(
      `[EduSmart mock data] ${dangling.length} dangling reference(s). ` +
        `Lists will silently drop these while counts still include them:\n  ` +
        dangling.join('\n  ')
    )
  }
  return dangling
}

/* Last, because it reads assignments, classes and progressFor —
   everything above it. */
/* ---- ORDER MATTERS HERE ----
   The seeded plans have to exist BEFORE mastery is computed,
   because a plan changes the scores it reads. Run the other way
   round, a child's mastery would be the figure he had before a
   re-teach that the screen above it says already happened. */
seedCoachingPlans()
recomputeMastery()

if (import.meta.env?.DEV) auditMockData()

export { auditMockData }
