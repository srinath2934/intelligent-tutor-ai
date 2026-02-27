import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "tutor_progress.db")

def init_db():
    """Initializes the SQLite database with the progress table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS student_progress (
            student_id TEXT PRIMARY KEY,
            score INTEGER DEFAULT 0,
            badges TEXT DEFAULT ''
        )
    ''')
    conn.commit()
    conn.close()

def get_progress(student_id: str):
    """Retrieve score and badges for a student."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT score, badges FROM student_progress WHERE student_id = ?", (student_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {"score": row[0], "badges": row[1].split(",") if row[1] else []}
    return {"score": 0, "badges": []}

def add_score_and_badge(student_id: str, points: int, new_badge: str = None):
    """Add points to the student's score and optionally award a badge."""
    current = get_progress(student_id)
    new_score = current["score"] + points
    
    badges = current["badges"]
    if new_badge and new_badge not in badges:
        badges.append(new_badge)
        
    badges_str = ",".join(badges)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO student_progress (student_id, score, badges)
        VALUES (?, ?, ?)
        ON CONFLICT(student_id) DO UPDATE SET
            score=excluded.score,
            badges=excluded.badges
    ''', (student_id, new_score, badges_str))
    conn.commit()
    conn.close()
    
    return {"score": new_score, "badges": badges}

# Initialize on import
init_db()

def init_lesson_db():
    """Initializes the lesson_progress table for per-lesson tracking."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lesson_progress (
            student_id TEXT,
            lesson_id TEXT,
            score INTEGER DEFAULT 0,
            completed INTEGER DEFAULT 0,
            badges TEXT DEFAULT '',
            completed_at TEXT,
            PRIMARY KEY (student_id, lesson_id)
        )
    ''')
    conn.commit()
    conn.close()

def save_lesson_progress(student_id: str, lesson_id: str, score: int, completed: bool, badges: list, completed_at: str = None):
    """Save per-lesson progress to SQLite."""
    badges_str = ",".join(badges or [])
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO lesson_progress (student_id, lesson_id, score, completed, badges, completed_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(student_id, lesson_id) DO UPDATE SET
            score=excluded.score,
            completed=excluded.completed,
            badges=excluded.badges,
            completed_at=excluded.completed_at
    ''', (student_id, lesson_id, score, int(completed), badges_str, completed_at))
    conn.commit()
    conn.close()

def get_all_lesson_progress(student_id: str):
    """Return all lesson progress records for a student."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT lesson_id, score, completed, badges, completed_at FROM lesson_progress WHERE student_id = ?", (student_id,))
    rows = cursor.fetchall()
    conn.close()
    result = {}
    for row in rows:
        result[row[0]] = {
            "lessonId": row[0],
            "score": row[1],
            "completed": bool(row[2]),
            "badges": row[3].split(",") if row[3] else [],
            "completedAt": row[4],
            "step": 3 if row[2] else 0
        }
    return result

# Initialize lesson progress table on import
init_lesson_db()
