export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  badges: string[];
  completedAt?: string;
  step: number;
}

const STORAGE_KEY = "spacey_science_progress";

export function getProgress(): Record<string, LessonProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(lessonId: string, progress: Partial<LessonProgress>) {
  const all = getProgress();
  all[lessonId] = { lessonId, completed: false, score: 0, badges: [], step: 0, ...all[lessonId], ...progress };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all[lessonId];
}

export function getLessonProgress(lessonId: string): LessonProgress | null {
  const all = getProgress();
  return all[lessonId] ?? null;
}

export function awardBadge(lessonId: string, badge: string) {
  const progress = getLessonProgress(lessonId) ?? { lessonId, completed: false, score: 0, badges: [], step: 0 };
  if (!progress.badges.includes(badge)) {
    progress.badges.push(badge);
  }
  return saveProgress(lessonId, progress);
}
