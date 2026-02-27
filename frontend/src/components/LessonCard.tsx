import { motion } from "framer-motion";
import { Lesson } from "@/data/lessons";
import { LessonProgress } from "@/lib/progress";

interface LessonCardProps {
  lesson: Lesson;
  progress: LessonProgress | null;
  onStart: () => void;
}

const LessonCard = ({ lesson, progress, onStart }: LessonCardProps) => {
  const isCompleted = progress?.completed;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative glass-card rounded-2xl p-6 cursor-pointer overflow-hidden group"
      style={{
        borderColor: isCompleted ? `${lesson.planetGlow}40` : undefined,
        boxShadow: isCompleted ? `0 0 30px ${lesson.planetGlow}25` : undefined,
      }}
      onClick={onStart}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${lesson.planetGlow}, transparent 70%)` }}
      />

      <div className="relative z-10 flex items-start gap-4">
        {/* Planet visual */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl flex-shrink-0 mt-1"
          style={{ filter: `drop-shadow(0 0 12px ${lesson.planetGlow})` }}
        >
          {lesson.emoji}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-space text-lg text-foreground leading-tight">{lesson.title}</h3>
            {isCompleted && (
              <span className="flex-shrink-0 text-lg" title="Completed!">✅</span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{lesson.subtitle}</p>

          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isCompleted ? "100%" : progress ? `${(progress.step / 3) * 100}%` : "0%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full progress-bar-cosmic"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {["Intro", "Explore", "Quiz"].map((s, i) => (
                <span
                  key={s}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: (progress?.step ?? 0) > i || isCompleted
                      ? `hsl(var(--primary) / 0.2)`
                      : `hsl(var(--muted))`,
                    color: (progress?.step ?? 0) > i || isCompleted
                      ? `hsl(var(--primary))`
                      : `hsl(var(--muted-foreground))`,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            {isCompleted && (
              <span className="text-xs font-space" style={{ color: lesson.planetGlow }}>
                {progress?.score}/3
              </span>
            )}
          </div>
        </div>
      </div>

      {progress?.badges?.length ? (
        <div className="relative z-10 mt-4 pt-4 border-t border-border/40 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Earned:</span>
          {progress.badges.map((b) => (
            <span key={b} className="text-base badge-glow rounded-full" title={b}>{lesson.badge.emoji}</span>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
};

export default LessonCard;
