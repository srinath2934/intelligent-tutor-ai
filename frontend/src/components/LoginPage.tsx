import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Star, User } from "lucide-react";

interface LoginPageProps {
    onLogin: (name: string, studentId: string) => void;
}

const AVATARS = ["🚀", "🪐", "⭐", "🌙", "☄️", "🌍", "🔭", "👨‍🚀"];

const LoginPage = ({ onLogin }: LoginPageProps) => {
    const [name, setName] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState(0);
    const [error, setError] = useState("");

    const handleLogin = () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setError("Please enter your name, Explorer!");
            return;
        }
        if (trimmed.length < 2) {
            setError("Name must be at least 2 characters.");
            return;
        }
        if (trimmed.length > 30) {
            setError("Name too long! Max 30 characters.");
            return;
        }
        // Create a deterministic mock student ID from name
        const studentId = `student_${trimmed.toLowerCase().replace(/\s+/g, "_")}_${trimmed.length}`;
        onLogin(trimmed, studentId);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Animated background stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.6 + 0.2,
                        }}
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{
                            duration: 2 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="w-full max-w-md z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="text-7xl mb-4 inline-block"
                        style={{ filter: "drop-shadow(0 0 30px hsl(192 100% 50% / 0.6))" }}
                    >
                        🚀
                    </motion.div>
                    <h1
                        className="font-space text-3xl text-foreground mb-2 glow-text-cyan"
                        style={{ fontFamily: "'Orbitron', sans-serif" }}
                    >
                        Spacey Science
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Your personal AI Space Tutor — let's explore the cosmos!
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card rounded-3xl p-8 space-y-6">
                    <div className="text-center">
                        <h2
                            className="font-space text-lg text-foreground mb-1"
                            style={{ fontFamily: "'Orbitron', sans-serif" }}
                        >
                            Who's the Explorer?
                        </h2>
                        <p className="text-muted-foreground text-xs">
                            Enter your name to track your mission progress and badges
                        </p>
                    </div>

                    {/* Avatar picker */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-2">Choose your avatar:</p>
                        <div className="grid grid-cols-8 gap-2">
                            {AVATARS.map((avatar, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedAvatar(i)}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all"
                                    style={{
                                        background: selectedAvatar === i
                                            ? "hsl(var(--primary) / 0.3)"
                                            : "hsl(var(--muted))",
                                        border: selectedAvatar === i
                                            ? "2px solid hsl(var(--primary))"
                                            : "2px solid transparent",
                                        boxShadow: selectedAvatar === i
                                            ? "0 0 12px hsl(var(--primary) / 0.5)"
                                            : "none",
                                    }}
                                >
                                    {avatar}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Name input */}
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-medium">Your name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={name}
                                onChange={e => { setName(e.target.value); setError(""); }}
                                onKeyDown={e => e.key === "Enter" && handleLogin()}
                                placeholder="e.g. Alex, Sam, Luna..."
                                maxLength={30}
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    background: "hsl(var(--muted))",
                                    color: "hsl(var(--foreground))",
                                    border: error
                                        ? "1px solid hsl(0 84% 60%)"
                                        : "1px solid hsl(var(--border))",
                                }}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs"
                                style={{ color: "hsl(0 84% 60%)" }}
                            >
                                {error}
                            </motion.p>
                        )}
                    </div>

                    {/* Login button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogin}
                        className="w-full py-4 rounded-xl font-space text-sm font-bold transition-all"
                        style={{
                            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(210 100% 60%))",
                            color: "hsl(var(--primary-foreground))",
                            boxShadow: "0 0 30px hsl(var(--primary) / 0.4)",
                            fontFamily: "'Orbitron', sans-serif",
                        }}
                    >
                        {AVATARS[selectedAvatar]} Launch Mission!
                    </motion.button>

                    <p className="text-center text-xs text-muted-foreground">
                        🔒 No account needed · Progress saved locally · Mock data only
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
