import { create } from "zustand";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatState {
  isOpen: boolean;
  sessionId: string | null;
  language: "en" | "te";
  messages: Message[];
  isTyping: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  setLanguage: (lang: "en" | "te") => void;
  addMessage: (role: "user" | "assistant", content: string) => void;
  setTyping: (typing: boolean) => void;
  setSessionId: (id: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  sessionId: null,
  language: "en",
  messages: [],
  isTyping: false,
  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setLanguage: (language) => set({ language }),
  addMessage: (role, content) =>
    set((s) => ({
      messages: [...s.messages, { id: crypto.randomUUID(), role, content, timestamp: new Date() }],
    })),
  setTyping: (isTyping) => set({ isTyping }),
  setSessionId: (sessionId) => set({ sessionId }),
  clearMessages: () => set({ messages: [], sessionId: null }),
}));
