import React, { useState, useEffect, useRef } from 'react';
import {
  Rocket,
  Send,
  Sparkles,
  Brain,
  Compass,
  HelpCircle,
  Users,
  Mail,
  Settings,
  LayoutGrid,
  Search,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const visualMap = {
  'mars': { emoji: '🔴', color: 'rgba(255, 87, 51, 0.5)', label: 'Planet Mars', stats: 'Diameter: 6,779 km' },
  'jupiter': { emoji: '🪐', color: 'rgba(243, 199, 139, 0.5)', label: 'Jupiter Giant', stats: 'Diameter: 139,820 km' },
  'earth': { emoji: '🌍', color: 'rgba(88, 166, 255, 0.5)', label: 'Home Earth', stats: 'Diameter: 12,742 km' },
  'moon': { emoji: '🌖', color: 'rgba(240, 246, 252, 0.5)', label: 'Earth Moon', stats: 'Distance: 384,400 km' },
  'sun': { emoji: '☀️', color: 'rgba(255, 215, 0, 0.5)', label: 'The Sun Star', stats: 'Temp: 5,500°C' },
  'gravity': { emoji: '🍎', color: 'rgba(218, 54, 51, 0.5)', label: 'Physics: Gravity', stats: 'Force: 9.8 m/s²' },
  'default': { emoji: '🚀', color: 'rgba(59, 130, 246, 0.5)', label: 'Space Station', stats: 'Deep Space Explorer' }
};

const thinkingMessages = [
  "Consulting the star charts... 🗺️✨",
  "Asking the friendly aliens... 👽💭",
  "Calculating cosmic coordinates... 🧮🚀",
  "Finding the space facts... 🔭💫",
  "Warping through the data... 🌌💫"
];

function App() {
  const [messages, setMessages] = useState([{
    role: 'tutor',
    content: "Hello Explorer! I am your Magical Space Tutor! Ask me anything about the universe, planets, or stars! 🌟"
  }]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [currentVisual, setCurrentVisual] = useState({ type: 'default', label: 'Space Station' });
  const [quiz, setQuiz] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [isConnected, setIsConnected] = useState(false);

  const ws = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/tutor/student_unique_123`);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log("Connected to Space Mission Control");
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'start') {
          setIsThinking(true);
          setStreamingText('');
        } else if (data.type === 'text') {
          setIsThinking(false);
          setStreamingText(prev => prev + data.chunk);
        } else if (data.type === 'final') {
          const resp = data.response;
          setMessages(prev => [
            ...prev,
            { role: 'tutor', content: resp.explanation + (resp.followUpQuestion ? `\n\n${resp.followUpQuestion}` : '') }
          ]);
          setStreamingText('');
          setIsThinking(false);

          if (resp.navigationEvent) {
            const target = resp.navigationEvent.toLowerCase();
            const found = Object.keys(visualMap).find(k => target.includes(k)) || 'default';
            setCurrentVisual({ type: found, label: resp.navigationEvent });
            setQuiz(null);
          }
          if (resp.quizData) {
            setQuiz(resp.quizData);
            setQuizAnswered(false);
            setSelectedIdx(null);
          }
        }
      };

      ws.current.onclose = (event) => {
        setIsConnected(false);
        setIsThinking(false);
        setStreamingText('');
        if (event.code === 1011) {
          setMessages(prev => [...prev, { role: 'tutor', content: "⚠️ Mission Control Error: " + event.reason }]);
        }
        console.log("Mission Disconnected. Reconnecting...");
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => ws.current?.close();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isThinking]);

  const handleSend = () => {
    if (!input.trim() || !isConnected) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    ws.current.send(JSON.stringify({ question: userMsg }));
    setInput('');
    setIsThinking(true);
  };

  return (
    <div className="flex h-screen w-screen bg-space-deep overflow-hidden font-sans text-white">
      {/* Behance-style Bright Blue Sidebar */}
      <nav className="w-20 bg-sidebar-bg flex flex-col items-center py-8 gap-6 z-50 shadow-[5px_0_30px_rgba(0,160,255,0.3)]">
        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-4 hover:scale-110 transition-transform cursor-pointer">
          <Rocket className="w-7 h-7 text-white fill-current" />
        </div>

        <button onClick={() => setActiveTab('home')} className={`sidebar-icon ${activeTab === 'home' ? 'sidebar-icon-active' : ''}`}>
          <LayoutGrid className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('comms')} className={`sidebar-icon ${activeTab === 'comms' ? 'sidebar-icon-active' : ''}`}>
          <Mail className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('map')} className={`sidebar-icon ${activeTab === 'map' ? 'sidebar-icon-active' : ''}`}>
          <Compass className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('users')} className={`sidebar-icon ${activeTab === 'users' ? 'sidebar-icon-active' : ''}`}>
          <Users className="w-6 h-6" />
        </button>

        <div className="mt-auto flex flex-col gap-6">
          <button className="sidebar-icon"><Settings className="w-6 h-6" /></button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 relative">
        {/* Background Decorative Planets */}
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Viewscreen (Center Panel) */}
        <section className="flex-[1.5] flex flex-col gap-6 h-full min-w-0">
          {/* Header Bar */}
          <header className="flex items-center justify-between px-2 shrink-0">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black text-white glow-text tracking-tight uppercase">Beyond Explorer</h1>
              <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-blue-400 border border-white/10 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400 animate-pulse'}`} />
                {isConnected ? 'MISSION ACTIVE' : 'CONNECTION LOST'}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/5 p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"><Search className="w-5 h-5 opacity-50" /></div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/10 relative hover:bg-white/10 transition-colors cursor-pointer">
                < Bell className="w-5 h-5 opacity-50" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-space-deep" />
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/20 hover:border-blue-400 transition-colors cursor-pointer">
                <img src="https://ui-avatars.com/api/?name=Explorer&background=00a0ff&color=fff" alt="User Avatar" />
              </div>
            </div>
          </header>

          {/* Central Viewscreen */}
          <div className="flex-1 glass-panel rounded-[40px] flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!quiz ? (
                <motion.div
                  key="planet"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className="flex flex-col items-center gap-4 text-center z-10 w-full"
                >
                  <div className="relative glowing-planet mb-4 lg:mb-8">
                    <div className="text-[140px] sm:text-[180px] lg:text-[220px] leading-none filter drop-shadow-[0_0_80px_rgba(255,255,255,0.2)] animate-float">
                      {visualMap[currentVisual.type]?.emoji}
                    </div>
                    {/* Ring/Atmosphere Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full blur-[80px] opacity-30 transform scale-150 -z-10"
                      style={{ backgroundColor: visualMap[currentVisual.type]?.color }}
                      animate={{ scale: [1.4, 1.6, 1.4], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase glow-text">{currentVisual.label}</h3>
                  <p className="text-blue-300 font-mono tracking-[0.2em] text-xs sm:text-sm opacity-80 uppercase">{visualMap[currentVisual.type]?.stats}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, rotateX: 45, y: 50 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-2xl bg-white/5 border border-white/20 p-6 sm:p-10 rounded-[40px] backdrop-blur-3xl z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                        <HelpCircle className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-blue-400 font-bold uppercase tracking-widest text-xs">Space Quiz Mission</span>
                    </div>
                    {quizAnswered && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase ${selectedIdx === quiz.answer_index ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                      >
                        {selectedIdx === quiz.answer_index ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {selectedIdx === quiz.answer_index ? 'Mission Accomplished' : 'Mission Failed'}
                      </motion.div>
                    )}
                  </div>

                  <h4 className="text-2xl sm:text-3xl font-bold mb-8 text-white leading-tight">{quiz.question}</h4>

                  <div className="grid grid-cols-1 gap-4">
                    {quiz.options.map((opt, i) => {
                      let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30";
                      if (quizAnswered) {
                        if (i === quiz.answer_index) btnStyle = "bg-green-500/30 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] text-green-100";
                        else if (i === selectedIdx) btnStyle = "bg-red-500/30 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-red-100";
                        else btnStyle = "opacity-30 border-white/5 cursor-not-allowed";
                      }
                      return (
                        <motion.button
                          key={i}
                          disabled={quizAnswered}
                          whileHover={quizAnswered ? {} : { x: 10 }}
                          onClick={() => { setSelectedIdx(i); setQuizAnswered(true); }}
                          className={`w-full text-left p-4 sm:p-5 rounded-[22px] border transition-all duration-300 flex items-center gap-4 text-lg sm:text-xl font-semibold ${btnStyle}`}
                        >
                          <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase border ${quizAnswered && i === quiz.answer_index ? 'bg-green-500 border-green-400 text-white' : 'bg-white/10 border-white/10'}`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>
                  {quizAnswered && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setQuiz(null)}
                      className="mt-8 w-full py-4 text-sm font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors"
                    >
                      Return to Navigation
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Chat Panel (Right Sidebar Chat) */}
        <aside className="flex-[0.8] flex flex-col gap-6 max-w-[450px] min-w-[320px] h-full shadow-2xl">
          <div className="flex-1 glass-panel rounded-[40px] flex flex-col overflow-hidden">
            <div className="p-6 bg-white/5 border-b border-white/10 flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-blue-500/30">🤖</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black uppercase text-white tracking-wider leading-none truncate">Mission Comms</h3>
                <div className="text-[10px] text-green-400 flex items-center gap-1.5 font-bold mt-1.5 tracking-widest">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  LIVE CONNECTION
                </div>
              </div>
              <div className="bg-white/10 p-2 rounded-xl border border-white/10 cursor-pointer hover:bg-white/20 transition-colors">
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border ${msg.role === 'user' ? 'bg-blue-500 border-blue-400' : 'bg-white/10 border-white/10'}`}>
                    {msg.role === 'user' ? '🧑‍🚀' : '🤖'}
                  </div>
                  <div className={`p-4 sm:p-5 rounded-[22px] max-w-[85%] ${msg.role === 'user'
                    ? 'bg-sidebar-bg text-white rounded-tr-none shadow-[0_5px_15px_rgba(0,160,255,0.2)]'
                    : 'bg-white/10 border border-white/10 text-white rounded-tl-none backdrop-blur-md'
                    }`}>
                    <p className="whitespace-pre-wrap leading-relaxed text-[14px] sm:text-[15px] font-medium">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {streamingText && (
                <div className="flex items-end gap-3 flex-row">
                  <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-sm shrink-0">🤖</div>
                  <div className="p-4 sm:p-5 rounded-[22px] rounded-tl-none bg-white/10 border border-white/10 text-white backdrop-blur-md max-w-[85%]">
                    <p className="whitespace-pre-wrap leading-relaxed text-[14px] sm:text-[15px] font-medium">{streamingText}</p>
                  </div>
                </div>
              )}

              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-6 bg-white/5 rounded-[30px] border border-white/5"
                >
                  <div className="relative flex justify-center items-center h-10 w-10">
                    <motion.div
                      className="w-full h-full bg-blue-500/30 rounded-full absolute"
                      animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  </div>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse glow-text px-4 text-center">
                    {thinkingMessages[Math.floor(Date.now() / 4000) % thinkingMessages.length]}
                  </p>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 sm:p-6 bg-black/40 border-t border-white/10 flex gap-3 shrink-0 backdrop-blur-xl">
              <input
                className="flex-1 bg-white/5 border border-white/20 rounded-[22px] px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-white/30 backdrop-blur-md transition-all focus:bg-white/10"
                placeholder="Ask your space tutor..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !isConnected}
                className="bg-sidebar-bg p-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-90 transition-all text-white disabled:opacity-20 disabled:grayscale cursor-pointer overflow-hidden group relative"
              >
                <motion.div className="relative z-10" whileHover={{ rotate: 45, x: 2, y: -2 }}>
                  <Send className="w-6 h-6" />
                </motion.div>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
