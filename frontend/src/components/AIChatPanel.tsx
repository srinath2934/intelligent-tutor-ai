import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

interface Message {
    role: "user" | "tutor";
    content: string;
}

interface AIChatPanelProps {
    studentId: string;
}

const AIChatPanel = ({ studentId }: AIChatPanelProps) => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "tutor", content: "👋 Hi Explorer! Ask me anything about space, planets, or the cosmos! 🚀✨" }
    ]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const connect = () => {
            const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
            const socket = new WebSocket(`${proto}://${window.location.host}/ws/tutor/${studentId}`);
            ws.current = socket;

            socket.onopen = () => setIsConnected(true);
            socket.onclose = () => {
                setIsConnected(false);
                setIsThinking(false); // unfreeze input on disconnect
                setTimeout(connect, 3000);
            };
            socket.onerror = () => {
                setIsConnected(false);
                setIsThinking(false); // unfreeze input on error
            };

            socket.onmessage = (evt) => {
                const data = JSON.parse(evt.data);
                if (data.type === "start") {
                    setIsThinking(true);
                    setMessages(prev => [...prev, { role: "tutor", content: "" }]);
                } else if (data.type === "text") {
                    setMessages(prev => {
                        const updated = [...prev];
                        const last = updated[updated.length - 1];
                        if (last?.role === "tutor") {
                            updated[updated.length - 1] = { ...last, content: last.content + data.chunk };
                        }
                        return updated;
                    });
                } else if (data.type === "final") {
                    setIsThinking(false);
                    // Use explanation field — this is what TutorResponse sends
                    const aiText = data.response?.explanation || data.response?.message || '';
                    if (aiText) {
                        setMessages(prev => {
                            const updated = [...prev];
                            const last = updated[updated.length - 1];
                            // If streaming already filled the bubble, don't overwrite
                            if (last?.role === "tutor" && !last.content) {
                                updated[updated.length - 1] = { ...last, content: aiText };
                            }
                            return updated;
                        });
                    }
                }
            };
        };

        connect();
        return () => ws.current?.close();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    const handleSend = () => {
        const text = input.trim();
        if (!text || !isConnected || isThinking) return;
        setMessages(prev => [...prev, { role: "user", content: text }]);
        ws.current?.send(JSON.stringify({ question: text }));
        setInput("");
        setIsThinking(true);
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
                        style={{
                            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(210 100% 60%))",
                            boxShadow: "0 0 30px hsl(var(--primary) / 0.5)",
                        }}
                        aria-label="Open AI Tutor"
                    >
                        <MessageCircle className="w-7 h-7 text-white" />
                        {!isConnected && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full border-2 border-background" />
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-3xl overflow-hidden shadow-2xl"
                        style={{
                            height: "520px",
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                        }}
                    >
                        {/* Header */}
                        <div
                            className="flex items-center gap-3 p-4 shrink-0"
                            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(210 100% 60%))" }}
                        >
                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-bold text-sm">Spacey AI Tutor</p>
                                <p className="text-white/70 text-xs">{isConnected ? "● Online" : "○ Connecting..."}</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                            ? "rounded-br-sm text-white"
                                            : "rounded-bl-sm"
                                            }`}
                                        style={{
                                            background: msg.role === "user"
                                                ? "hsl(var(--primary))"
                                                : "hsl(var(--muted))",
                                            color: msg.role === "user" ? "white" : "hsl(var(--foreground))",
                                        }}
                                    >
                                        {msg.content || (isThinking && i === messages.length - 1 ? (
                                            <span className="flex gap-1 items-center">
                                                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </span>
                                        ) : "...")}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleSend()}
                                    placeholder="Ask about space..."
                                    disabled={!isConnected || isThinking}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                                    style={{
                                        background: "hsl(var(--muted))",
                                        color: "hsl(var(--foreground))",
                                        border: "1px solid hsl(var(--border))",
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!isConnected || isThinking || !input.trim()}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                                    style={{
                                        background: "hsl(var(--primary))",
                                        color: "hsl(var(--primary-foreground))",
                                    }}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatPanel;
