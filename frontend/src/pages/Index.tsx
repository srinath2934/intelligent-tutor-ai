import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarField from "@/components/StarField";
import LessonCard from "@/components/LessonCard";
import LessonView from "@/components/LessonView";
import AIChatPanel from "@/components/AIChatPanel";
import LoginPage from "@/components/LoginPage";
import { lessons } from "@/data/lessons";
import { getLessonProgress, LessonProgress, saveProgress } from "@/lib/progress";
import { LogOut, User } from "lucide-react";

interface StudentSession {
  name: string;
  studentId: string;
}

const SESSION_KEY = "spacey_student_session";

const Index = () => {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const handleLogin = (name: string, studentId: string) => {
    const s: StudentSession = { name, studentId };
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setActiveLesson(null);
    setProgress({});
  };

  const refreshProgress = () => {
    if (!session) return;
    const p: Record<string, LessonProgress> = {};
    lessons.forEach((l) => {
      const lp = getLessonProgress(l.id);
      if (lp) p[l.id] = lp;
    });
    setProgress(p);
  };

  useEffect(() => {
    if (!session) return;
    refreshProgress();
    // Sync from server DB
    fetch(`/api/progress/overview?student_id=${session.studentId}`)
      .then(r => r.json())
      .then((serverData: Record<string, LessonProgress>) => {
        Object.entries(serverData).forEach(([lessonId, lp]) => {
          saveProgress(lessonId, lp);
        });
        refreshProgress();
      })
      .catch(() => { });
  }, [session]);

  const currentLesson = activeLesson ? lessons.find((l) => l.id === activeLesson) : null;

  const totalBadges = Object.values(progress).reduce(
    (sum, p) => sum + (p.badges?.length ?? 0), 0
  );
  const completedLessons = Object.values(progress).filter((p) => p.completed).length;

  // Show login if no session
  if (!session) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <StarField />
        <div className="relative z-10">
          <LoginPage onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarField />

      {/* Top nav — user info + logout */}
      <div
        className="relative z-20 flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: "hsl(var(--border) / 0.4)", background: "hsl(var(--background) / 0.7)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "hsl(var(--primary) / 0.2)" }}
          >
            <User className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary))" }} />
          </div>
          <span className="text-sm font-medium text-foreground">{session.name}</span>
          {totalBadges > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "hsl(var(--accent) / 0.2)", color: "hsl(var(--accent))" }}
            >
              🏅 {totalBadges} badge{totalBadges !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid hsl(var(--border))" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>

      <AnimatePresence mode="wait">
        {currentLesson ? (
          <motion.div
            key="lesson"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.35 }}
            className="relative z-10"
          >
            <LessonView
              lesson={currentLesson}
              studentId={session.studentId}
              onBack={() => { setActiveLesson(null); refreshProgress(); }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-10"
          >
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-10"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-4 inline-block"
                style={{ filter: "drop-shadow(0 0 30px hsl(192 100% 50% / 0.6))" }}
              >
                🚀
              </motion.div>
              <h1
                className="text-3xl sm:text-4xl text-foreground mb-3 glow-text-cyan"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Welcome, {session.name}!
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                Explore the cosmos, one mission at a time. Complete lessons to earn badges!
              </p>

              {(completedLessons > 0 || totalBadges > 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex gap-4 mt-5 px-6 py-3 glass-card rounded-full"
                >
                  <div className="text-center">
                    <div className="font-space text-lg" style={{ color: "hsl(var(--primary))", fontFamily: "'Orbitron', sans-serif" }}>
                      {completedLessons}
                    </div>
                    <div className="text-xs text-muted-foreground">Missions</div>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <div className="text-lg" style={{ color: "hsl(var(--accent))", fontFamily: "'Orbitron', sans-serif" }}>
                      {totalBadges}
                    </div>
                    <div className="text-xs text-muted-foreground">Badges</div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs text-muted-foreground uppercase tracking-widest mb-4"
            >
              🛸 Available Missions
            </motion.p>

            <div className="space-y-4">
              {lessons.map((lesson, i) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.1 }}
                >
                  <LessonCard
                    lesson={lesson}
                    progress={progress[lesson.id] ?? null}
                    onStart={() => setActiveLesson(lesson.id)}
                  />
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 text-center text-xs text-muted-foreground"
            >
              🌟 Progress saved automatically — keep exploring!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Tutor — visible after login only */}
      <AIChatPanel studentId={session.studentId} />
    </div>
  );
};

export default Index;
