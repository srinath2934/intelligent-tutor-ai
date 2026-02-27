import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarField from "@/components/StarField";
import LessonCard from "@/components/LessonCard";
import LessonView from "@/components/LessonView";
import AIChatPanel from "@/components/AIChatPanel";
import { lessons } from "@/data/lessons";
import { getLessonProgress, LessonProgress, saveProgress } from "@/lib/progress";

const STUDENT_ID = "student_unique_123";

const Index = () => {
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});

  const refreshProgress = () => {
    const p: Record<string, LessonProgress> = {};
    lessons.forEach((l) => {
      const lp = getLessonProgress(l.id);
      if (lp) p[l.id] = lp;
    });
    setProgress(p);
  };

  useEffect(() => {
    refreshProgress();

    // Sync progress from server DB on mount (satisfies persistence requirement)
    fetch(`/api/progress/overview`)
      .then(r => r.json())
      .then((serverData: Record<string, LessonProgress>) => {
        // Merge server data into localStorage
        Object.entries(serverData).forEach(([lessonId, lp]) => {
          saveProgress(lessonId, lp);
        });
        refreshProgress();
      })
      .catch(() => { }); // Silently fail if backend is down
  }, []);

  const handleStartLesson = (id: string) => {
    setActiveLesson(id);
  };

  const handleBack = () => {
    setActiveLesson(null);
    refreshProgress();
  };

  const currentLesson = activeLesson ? lessons.find((l) => l.id === activeLesson) : null;

  const totalBadges = Object.values(progress).reduce(
    (sum, p) => sum + (p.badges?.length ?? 0),
    0
  );
  const completedLessons = Object.values(progress).filter((p) => p.completed).length;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarField />

      <AnimatePresence mode="wait">
        {currentLesson ? (
          <motion.div
            key="lesson"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            <LessonView lesson={currentLesson} onBack={handleBack} />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16"
          >
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-4 inline-block"
                style={{ filter: "drop-shadow(0 0 30px hsl(192 100% 50% / 0.6))" }}
              >
                🚀
              </motion.div>
              <h1 className="font-space text-3xl sm:text-4xl text-foreground mb-3 glow-text-cyan">
                Spacey Science
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md mx-auto">
                Explore the cosmos, one mission at a time. Complete lessons to earn badges and become a Space Explorer!
              </p>

              {/* Stats row */}
              {(completedLessons > 0 || totalBadges > 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex gap-4 mt-6 px-6 py-3 glass-card rounded-full"
                >
                  <div className="text-center">
                    <div className="font-space text-lg text-primary">{completedLessons}</div>
                    <div className="text-xs text-muted-foreground">Missions</div>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <div className="font-space text-lg text-accent">{totalBadges}</div>
                    <div className="text-xs text-muted-foreground">Badges</div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-5"
            >
              <h2 className="font-space text-sm text-muted-foreground uppercase tracking-widest">
                🛸 Available Missions
              </h2>
            </motion.div>

            {/* Lessons grid */}
            <div className="space-y-4">
              {lessons.map((lesson, i) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <LessonCard
                    lesson={lesson}
                    progress={progress[lesson.id] ?? null}
                    onStart={() => handleStartLesson(lesson.id)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-16 text-center"
            >
              <p className="text-muted-foreground text-xs">
                🌟 Progress is saved automatically — keep exploring!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Tutor Chat — available on all pages */}
      <AIChatPanel />
    </div>
  );
};

export default Index;
