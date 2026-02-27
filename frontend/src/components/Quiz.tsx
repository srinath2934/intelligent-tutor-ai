import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuizQuestion } from "@/data/lessons";

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

const Quiz = ({ questions, onComplete }: QuizProps) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const q = questions[current];
  const isLast = current === questions.length - 1;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
  };

  const handleNext = () => {
    const correct = selected === q.correctIndex;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    if (isLast) {
      onComplete(newAnswers.filter(Boolean).length);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-3">
        {questions.map((_, i) => (
          <div
            key={i}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i === current ? "2rem" : "0.5rem",
              background:
                i < current
                  ? "hsl(var(--primary))"
                  : i === current
                  ? "hsl(var(--accent))"
                  : "hsl(var(--muted))",
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          <div className="text-center">
            <span className="text-xs font-space text-muted-foreground">
              Question {current + 1} of {questions.length}
            </span>
            <h3 className="font-space text-lg text-foreground mt-2 leading-snug">{q.question}</h3>
          </div>

          <div className="grid gap-3">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              const isWrong = selected === i && !isCorrect;
              const showGreen = selected !== null && isCorrect;
              const showRed = isWrong;

              return (
                <motion.button
                  key={i}
                  whileHover={selected === null ? { x: 4 } : {}}
                  whileTap={selected === null ? { scale: 0.98 } : {}}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  className="w-full text-left p-4 rounded-xl border transition-all duration-200 font-body text-sm"
                  style={{
                    background: showGreen
                      ? "hsl(142 70% 45% / 0.15)"
                      : showRed
                      ? "hsl(0 84% 60% / 0.15)"
                      : selected === null
                      ? "hsl(var(--muted))"
                      : "hsl(var(--muted) / 0.5)",
                    borderColor: showGreen
                      ? "hsl(142 70% 45%)"
                      : showRed
                      ? "hsl(0 84% 60%)"
                      : "hsl(var(--border))",
                    color: showGreen
                      ? "hsl(142 70% 70%)"
                      : showRed
                      ? "hsl(0 84% 70%)"
                      : "hsl(var(--foreground))",
                    cursor: selected !== null ? "default" : "pointer",
                  }}
                  aria-label={`Option ${i + 1}: ${opt}`}
                >
                  <span className="mr-3 font-space text-xs opacity-60">
                    {["A", "B", "C", "D"][i]}
                  </span>
                  {opt}
                  {showGreen && " ✓"}
                  {showRed && " ✗"}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4 border"
                style={{
                  borderColor:
                    selected === q.correctIndex
                      ? "hsl(142 70% 45% / 0.4)"
                      : "hsl(0 84% 60% / 0.4)",
                }}
              >
                <p className="text-sm">
                  <span className="font-space text-xs mr-2">
                    {selected === q.correctIndex ? "🌟" : "💡"}
                  </span>
                  {q.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {selected !== null && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="w-full py-3 rounded-xl font-space text-sm font-semibold transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(210 100% 60%))",
                color: "hsl(var(--primary-foreground))",
                boxShadow: "var(--shadow-glow-cyan)",
              }}
            >
              {isLast ? "See Results →" : "Next Question →"}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
