export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  planet: string;
  planetColor: string;
  planetGlow: string;
  emoji: string;
  intro: {
    headline: string;
    body: string;
    facts: { icon: string; label: string; value: string }[];
  };
  quiz: QuizQuestion[];
  badge: { id: string; label: string; emoji: string; color: string };
}

export const lessons: Lesson[] = [
  {
    id: "gravity",
    title: "Gravity & Weight",
    subtitle: "Why do astronauts bounce on the Moon?",
    planet: "Mars",
    planetColor: "#c1440e",
    planetGlow: "#ff6b35",
    emoji: "🔴",
    intro: {
      headline: "Gravity is the invisible force that shapes the universe",
      body:
        "Every object with mass pulls other objects toward it. The more massive an object, the stronger its gravitational pull. This is why you weigh different amounts on different planets — it's not your mass that changes, it's the strength of gravity pulling you down!",
      facts: [
        { icon: "⚖️", label: "Your weight on Mars", value: "38% of Earth weight" },
        { icon: "🌙", label: "Moon gravity", value: "1/6th of Earth's" },
        { icon: "🪐", label: "Jupiter gravity", value: "2.5× stronger!" },
        { icon: "☀️", label: "Sun gravity", value: "28× Earth's pull" },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "If you weigh 60kg on Earth, what would you weigh on the Moon?",
        options: ["60kg", "10kg", "30kg", "100kg"],
        correctIndex: 1,
        explanation: "The Moon has 1/6th of Earth's gravity, so 60 ÷ 6 = 10kg!",
      },
      {
        id: "q2",
        question: "What causes gravity?",
        options: ["Air pressure", "Magnetism", "Mass of objects", "Temperature"],
        correctIndex: 2,
        explanation: "Gravity is caused by mass! The more massive an object, the stronger its gravitational pull.",
      },
      {
        id: "q3",
        question: "On which planet would you feel the heaviest?",
        options: ["Mars", "Moon", "Jupiter", "Mercury"],
        correctIndex: 2,
        explanation: "Jupiter is the most massive planet in our solar system, giving it the strongest gravity — 2.5× Earth's!",
      },
    ],
    badge: { id: "gravity-master", label: "Gravity Master", emoji: "🏆", color: "#ffa500" },
  },
  {
    id: "solar-system",
    title: "The Solar System",
    subtitle: "Eight worlds orbiting our star",
    planet: "Saturn",
    planetColor: "#c8a96e",
    planetGlow: "#ffd700",
    emoji: "🪐",
    intro: {
      headline: "Our cosmic neighbourhood is vast beyond imagination",
      body:
        "The Solar System formed 4.6 billion years ago from a swirling cloud of gas and dust. At its centre sits the Sun — a star so massive it contains 99.8% of all the mass in the Solar System. Eight planets orbit the Sun, from tiny Mercury to giant Neptune.",
      facts: [
        { icon: "🌡️", label: "Hottest planet", value: "Venus: 465°C" },
        { icon: "❄️", label: "Coldest planet", value: "Neptune: -214°C" },
        { icon: "💨", label: "Fastest winds", value: "Neptune: 2,100 km/h" },
        { icon: "🌊", label: "Ocean planet", value: "Only Earth!" },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "Which is the largest planet in our Solar System?",
        options: ["Saturn", "Earth", "Jupiter", "Neptune"],
        correctIndex: 2,
        explanation: "Jupiter is so large that 1,300 Earths could fit inside it!",
      },
      {
        id: "q2",
        question: "Which planet is closest to the Sun?",
        options: ["Venus", "Mercury", "Earth", "Mars"],
        correctIndex: 1,
        explanation: "Mercury is the closest planet to the Sun, completing one orbit in just 88 days.",
      },
      {
        id: "q3",
        question: "How many planets are in our Solar System?",
        options: ["7", "9", "8", "10"],
        correctIndex: 2,
        explanation: "There are 8 planets. Pluto was reclassified as a dwarf planet in 2006.",
      },
    ],
    badge: { id: "solar-explorer", label: "Solar Explorer", emoji: "🪐", color: "#ffd700" },
  },
];
