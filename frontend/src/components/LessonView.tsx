import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lesson, QuizQuestion } from "@/data/lessons";
import { saveProgress, getLessonProgress } from "@/lib/progress";
import GravitySimulator from "./GravitySimulator";
import Quiz from "./Quiz";
import BadgeReward from "./BadgeReward";
import { Loader2 } from "lucide-react";

type Step = "intro" | "explore" | "quiz" | "reward";

interface LessonViewProps {
  lesson: Lesson;
  studentId: string;
  onBack: () => void;
}

const STEPS: Step[] = ["intro", "explore", "quiz", "reward"];
const STEP_LABELS = ["Intro", "Explore", "Quiz", "Reward"];

const stepIndex = (s: Step) => STEPS.indexOf(s);

const LessonView = ({ lesson, studentId, onBack }: LessonViewProps) => {
  const [step, setStep] = useState<Step>("intro");
  const [score, setScore] = useState(0);
  const [aiQuestions, setAiQuestions] = useState<QuizQuestion[] | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState(false);

  useEffect(() => {
    const saved = getLessonProgress(lesson.id);
    if (saved && !saved.completed) {
      setStep(STEPS[Math.min(saved.step, 2)] as Step);
    }
  }, [lesson.id]);

  const fetchAIQuiz = async () => {
    setQuizLoading(true);
    setQuizError(false);
    try {
      const response = await fetch(`/api/quiz/${encodeURIComponent(lesson.title)}`);
      if (!response.ok) throw new Error("Quiz fetch failed");
      const data = await response.json();
      setAiQuestions(data.questions);
    } catch (err) {
      console.error("AI quiz fetch failed, falling back to static questions", err);
      setQuizError(true);
      setAiQuestions(lesson.quiz); // fallback to static
    } finally {
      setQuizLoading(false);
    }
  };

  const goTo = (next: Step) => {
    setStep(next);
    saveProgress(lesson.id, { step: stepIndex(next) });
    // Fetch AI quiz when going to quiz step
    if (next === "quiz" && !aiQuestions) {
      fetchAIQuiz();
    }
  };

  const handleQuizComplete = async (s: number) => {
    setScore(s);
    const passed = s >= Math.ceil((aiQuestions ?? lesson.quiz).length / 2);
    const badges = passed ? [lesson.badge.id] : [];

    // Save locally
    saveProgress(lesson.id, {
      step: 3,
      score: s,
      completed: true,
      completedAt: new Date().toISOString(),
      badges,
    });

    // Save to server DB with real student ID
    try {
      await fetch(`/api/progress/${lesson.id}?student_id=${studentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: s * 10,
          completed: true,
          badges,
          completedAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Failed to save progress to server", err);
    }

    setStep("reward");
  };

  const currentIdx = stepIndex(step);
  const quizQuestions = aiQuestions ?? lesson.quiz;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          aria-label="Back to missions"
        >
          ← Back
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {STEPS.slice(0, -1).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full transition-all duration-300"
                style={{
                  background:
                    currentIdx > i
                      ? "hsl(var(--primary))"
                      : currentIdx === i
                        ? "hsl(var(--accent))"
                        : "hsl(var(--muted))",
                  boxShadow: currentIdx === i ? "0 0 8px hsl(var(--accent))" : "none",
                }}
              />
              <span
                className="text-xs hidden sm:block"
                style={{
                  color:
                    currentIdx >= i
                      ? "hsl(var(--foreground))"
                      : "hsl(var(--muted-foreground))",
                }}
              >
                {STEP_LABELS[i]}
              </span>
              {i < STEPS.length - 2 && (
                <div
                  className="w-6 h-px"
                  style={{
                    background: currentIdx > i ? "hsl(var(--primary))" : "hsl(var(--muted))",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 sm:px-6 py-6 relative z-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {step === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-8xl mx-auto w-fit"
                    style={{ filter: `drop-shadow(0 0 30px ${lesson.planetGlow})` }}
                  >
                    {lesson.emoji}
                  </motion.div>
                  <div>
                    <h1 className="font-space text-2xl sm:text-3xl text-foreground mb-2">
                      {lesson.title}
                    </h1>
                    <p className="text-muted-foreground">{lesson.subtitle}</p>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-space text-base text-primary mb-3">
                    {lesson.intro.headline}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {lesson.intro.body}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {lesson.intro.facts.map((fact, i) => (
                    <motion.div
                      key={fact.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="glass-card rounded-xl p-4"
                    >
                      <div className="text-2xl mb-2">{fact.icon}</div>
                      <p className="text-xs text-muted-foreground mb-1">{fact.label}</p>
                      <p className="font-space text-sm text-primary">{fact.value}</p>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => goTo("explore")}
                  className="w-full py-4 rounded-xl font-space text-sm font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(210 100% 60%))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "var(--shadow-glow-cyan)",
                  }}
                >
                  Start Exploring →
                </button>
              </motion.div>
            )}

            {step === "explore" && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <GravitySimulator lesson={lesson} />
                <button
                  onClick={() => goTo("quiz")}
                  className="w-full py-4 rounded-xl font-space text-sm font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--accent)), hsl(20 100% 60%))",
                    color: "hsl(var(--accent-foreground))",
                    boxShadow: "var(--shadow-glow-amber)",
                  }}
                >
                  Take the Quiz →
                </button>
              </motion.div>
            )}

            {step === "quiz" && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card rounded-2xl p-6"
              >
                {quizLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-muted-foreground text-sm font-space">
                      🤖 AI is generating your quiz...
                    </p>
                  </div>
                ) : (
                  <>
                    {quizError && (
                      <p className="text-xs text-muted-foreground mb-4 text-center">
                        ⚠️ Using offline questions (AI unavailable)
                      </p>
                    )}
                    <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
                  </>
                )}
              </motion.div>
            )}

            {step === "reward" && (
              <motion.div
                key="reward"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-2xl p-8"
              >
                <BadgeReward lesson={lesson} score={score} onContinue={onBack} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default LessonView;
