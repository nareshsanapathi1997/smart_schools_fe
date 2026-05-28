"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Mic, MicOff, Send, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/store/useChatStore";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const pathname = usePathname();
  const { isOpen, toggle, setOpen, messages, addMessage, isTyping, setTyping, sessionId, setSessionId, language, setLanguage } =
    useChatStore();
  const [input, setInput] = useState("");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = language === "te" ? "te-IN" : "en-IN";
      recognitionRef.current.onresult = (e) => {
        setInput(e.results[0][0].transcript);
        setListening(false);
      };
      recognitionRef.current.onend = () => setListening(false);
    }
  }, [language]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    addMessage("user", text);
    setInput("");
    setTyping(true);

    try {
      const res = await api.post("/chatbot/chat", {
        message: text,
        session_id: sessionId,
        language,
      });
      const { response, session_id, quick_replies } = res.data.data;
      if (session_id) setSessionId(session_id);
      addMessage("assistant", response);
      setQuickReplies(quick_replies || []);
    } catch {
      addMessage("assistant", "Sorry, I'm having trouble connecting. Please try again or contact us directly.");
    } finally {
      setTyping(false);
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 z-50 flex h-[520px] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border/50 bg-background shadow-2xl shadow-primary/10"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-primary to-accent px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">AI School Assistant</p>
                  <p className="text-xs text-white/80">Online • English & Telugu</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setLanguage(language === "en" ? "te" : "en")}
                  title="Switch language"
                >
                  <Globe className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
                  Hi! I&apos;m your AI assistant. Ask about admissions, fees, courses, timings, or school location.
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.role === "user" ? "bg-primary text-white" : "bg-muted"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-2 w-2 rounded-full bg-primary/60"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-border/40 px-4 py-2">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 border-t border-border/40 p-3"
            >
              <Button type="button" variant="ghost" size="icon" onClick={toggleVoice} className={listening ? "text-red-500" : ""}>
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === "te" ? "మీ ప్రశ్న..." : "Ask me anything..."}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-xl shadow-primary/30"
        aria-label="Open AI chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </motion.button>
    </>
  );
}
