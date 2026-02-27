import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Lesson } from "@/data/lessons";

interface BadgeRewardProps {
  lesson: Lesson;
  score: number;
  onContinue: () => void;
}

const BadgeReward = ({ lesson, score, onContinue }: BadgeRewardProps) => {
  const total = lesson.quiz.length;
  const isPerfect = score === total;
  const passed = score >= Math.ceil(total / 2);

  useEffect(() => {
    if (passed) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#00d4ff", "#ffa500", "#ffffff", "#a855f7"],
      });
    }
  }, [passed]);

  return (
    <div className="text-center space-y-6 py-4">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="text-8xl mx-auto w-fit"
        style={{ filter: `drop-shadow(0 0 30px ${lesson.badge.color})` }}
      >
        {passed ? lesson.badge.emoji : "📚"}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="font-space text-2xl mb-2" style={{ color: lesson.badge.color }}>
          {isPerfect ? "🌟 Perfect Score!" : passed ? "Mission Complete!" : "Keep Exploring!"}
        </h2>
        <p className="text-muted-foreground">
          You scored <strong className="text-foreground">{score} out of {total}</strong>
        </p>
      </motion.div>

      {passed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="inline-flex flex-col items-center gap-2 px-6 py-4 rounded-2xl badge-glow"
          style={{
            background: `${lesson.badge.color}15`,
            border: `2px solid ${lesson.badge.color}60`,
          }}
        >
          <span className="text-3xl">{lesson.badge.emoji}</span>
          <div>
            <p className="font-space text-sm" style={{ color: lesson.badge.color }}>
              {lesson.badge.label}
            </p>
            <p className="text-xs text-muted-foreground">Badge Earned!</p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex gap-3 justify-center"
      >
        <button
          onClick={onContinue}
          className="px-6 py-3 rounded-xl font-space text-sm font-semibold transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(210 100% 60%))",
            color: "hsl(var(--primary-foreground))",
            boxShadow: "var(--shadow-glow-cyan)",
          }}
        >
          Back to Missions 🚀
        </button>
      </motion.div>
    </div>
  );
};

export default BadgeReward;
