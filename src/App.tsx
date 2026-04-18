/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Settings, 
  ShieldCheck, 
  Zap, 
  Globe, 
  MessageSquare, 
  Phone, 
  User,
  ExternalLink,
  ChevronRight,
  Loader2,
  Sparkles,
  Search,
  CheckCircle2,
  Info
} from 'lucide-react';
import { generateChatResponse, generateImage } from './lib/gemini';

// --- Types ---
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

// --- Components ---

const StatusBadge = ({ label, active }: { label: string; active?: boolean }) => (
  <div className="status-badge">
    <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-electric-blue animate-pulse' : 'bg-slate-500'}`} />
    {label}
  </div>
);

const SpecificationCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    whileHover={{ borderColor: 'rgba(56, 189, 248, 0.4)', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
    className="p-5 bg-glass border border-glass-border rounded-2xl transition-all group"
  >
    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 mb-3 group-hover:scale-110 transition-transform">
      <Icon className="w-5 h-5 text-electric-blue" />
    </div>
    <h3 className="font-bold text-electric-blue text-sm uppercase tracking-wider mb-1">{title}</h3>
    <p className="text-sm text-text-dim leading-relaxed font-sans">{description}</p>
  </motion.div>
);

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Namaste! Main G-Alexa hoon, aapka smart partner. Gagan Mottan ne mujhe design kiya hai aapki life aur business ko supercharge karne ke liye. Kaise help karun aaj?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSend = async (text?: string) => {
    // ... same as before
    const content = text || inputValue;
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (content.toLowerCase().includes('generate image') || content.toLowerCase().includes('create image') || content.toLowerCase().includes('image banana')) {
        setIsGeneratingImage(true);
        const imageUrl = await generateImage(content);
        setIsGeneratingImage(false);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Aapke liye image taiyar hai!",
          imageUrl: imageUrl || undefined,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const response = await generateChatResponse(messages.concat(userMessage).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          content: m.content
        })));
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition isn't supported in your browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN';

    if (isListening) {
      setIsListening(false);
      recognition.stop();
    } else {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-sky-500/30 overflow-x-hidden text-slate-100">
      {/* Background radial highlight */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] bg-sky-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[50%] bg-blue-950/10 blur-[155px] rounded-full" />
      </div>

      {/* --- Navigation --- */}
      <nav className="relative z-50 p-6 md:px-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black italic tracking-tighter">
            G-<span className="text-electric-blue">ALEXA</span>
          </div>
          <StatusBadge label="System Online" active />
        </div>

        <div className="hidden md:flex items-center gap-10">
          <div className="text-xs font-mono text-text-dim tracking-widest flex items-center gap-2">
            <span className="w-1 h-1 bg-sky-500 rounded-full" />
            {time.toLocaleTimeString([], { hour12: false })}
          </div>
          <button 
            onClick={() => window.open('https://wa.me/919682604827', '_blank')}
            className="px-6 py-2.5 bg-electric-blue text-navy rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-sky-500/20 flex items-center gap-2"
          >
            Connect Now
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-6 md:px-16 grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-12 pt-4">
        
        {/* --- Hero & Chat --- */}
        <section className="flex flex-col gap-10 min-h-[600px]">
          <div className="flex flex-col gap-2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight hero-gradient-text"
            >
              Smart Thinking,<br />Smarter Living.
            </motion.h1>
            <p className="text-text-dim text-lg max-w-xl leading-relaxed mt-4">
              The future of AI is here. G-Alexa is not just a machine, it's your smart business partner, engineered with 2 years of high-level coding.
            </p>
          </div>

          <div className="flex-1 glass-panel flex flex-col overflow-hidden relative min-h-[500px]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-4 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-electric-blue text-navy font-semibold' 
                          : 'bg-white/5 text-slate-100 border border-white/5'
                      }`}>
                        {msg.content && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                        {msg.imageUrl && (
                          <motion.img 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={msg.imageUrl} 
                            alt="Generated content" 
                            className="mt-3 rounded-xl w-full max-w-sm border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-text-dim uppercase tracking-widest font-mono">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex gap-2 items-center">
                    <Loader2 className="w-4 h-4 text-electric-blue animate-spin" />
                    <span className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Processing</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-navy/50 border-t border-white/5 backdrop-blur-sm">
              <div className="relative flex items-center gap-3">
                <button 
                  onClick={toggleVoice}
                  className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-400 hover:text-electric-blue'}`}
                >
                  <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                </button>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="G-Alexa ko command dein..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-electric-blue/50 transition-all"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-4 bg-electric-blue text-navy rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-sky-500/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- Visualization Sidebar --- */}
        <aside className="flex flex-col gap-8">
          
          <div className="bg-slate-800 p-8 rounded-[32px] border border-glass-border flex flex-col gap-10 relative overflow-hidden group">
            <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] border border-white/5 z-10 font-bold uppercase tracking-widest text-white/70">
              AI Analytics
            </div>
            
            <div className="aspect-square w-full rounded-full border-2 border-dashed border-electric-blue/20 flex flex-col items-center justify-center gap-2 relative mt-12 mb-4">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="absolute inset-[-10px] border border-electric-blue/10 rounded-full"
              />
              <h2 className="text-5xl font-extrabold text-white">40,000+</h2>
              <span className="text-[10px] text-text-dim uppercase tracking-[0.2em] font-bold">Concurrent Users</span>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-4">
              <div>
                <h4 className="text-[10px] text-text-dim uppercase tracking-widest font-bold mb-4">Developer & Owner</h4>
                <div className="text-2xl font-bold mb-1">Gagan Mottan</div>
                <div className="flex justify-between text-xs text-text-dim">
                  <span>+91 96826-04827</span>
                  <span className="text-electric-blue">24/7 Available</span>
                </div>
              </div>
              <button 
                onClick={() => window.open('https://wa.me/919682604827', '_blank')}
                className="w-full py-4 bg-electric-blue text-navy rounded-2xl font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-xl shadow-sky-500/10"
              >
                Connect Now
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <SpecificationCard 
              icon={Zap} 
              title="Global Knowledge" 
              description="Powered by advanced LLM tech to answer any query instantly."
            />
            <SpecificationCard 
              icon={Mic} 
              title="Voice Intelligence" 
              description="Handle WhatsApp voice notes and audio calls with ease."
            />
          </div>
        </aside>
      </main>

      <footer className="p-16 border-t border-white/5 bg-navy flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-2xl font-black italic tracking-tighter">
          G-<span className="text-electric-blue">ALEXA</span>
        </div>
        <div className="flex gap-12 text-[10px] text-text-dim uppercase tracking-[0.3em] font-bold">
          <span className="hover:text-electric-blue cursor-pointer transition-colors">Safety Protocol</span>
          <span className="hover:text-electric-blue cursor-pointer transition-colors">Startup Tips</span>
          <span className="hover:text-electric-blue cursor-pointer transition-colors">Privacy</span>
        </div>
        <span className="text-[10px] text-text-dim/50 font-mono tracking-widest">© 2026 PRODUCED BY GAGAN MOTTAN</span>
      </footer>
    </div>
  );
}
