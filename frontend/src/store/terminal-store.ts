import { create } from "zustand";
import { ChatMessage, MessageRole, ToolCallInfo } from "../lib/types";

interface ChatState {
  messages: ChatMessage[];
  isProcessing: boolean;
  isQuerying: boolean;
  videoId: string | null;
  apiKey: string;
  videoUrl: string;

  addMessage: (role: MessageRole, content: string) => string;
  appendToLastAssistant: (field: "thinking" | "content", text: string) => void;
  addToolCallToLast: (tool: ToolCallInfo) => void;
  updateLastToolResult: (toolName: string, result: string) => void;
  addFramesToLastTool: (frames: string[]) => void;
  clear: () => void;
  setProcessing: (v: boolean) => void;
  setQuerying: (v: boolean) => void;
  setVideoId: (id: string | null) => void;
  setApiKey: (key: string) => void;
  setVideoUrl: (url: string) => void;
}

let counter = 0;

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isProcessing: false,
  isQuerying: false,
  videoId: null,
  apiKey: "",
  videoUrl: "",

  addMessage: (role, content) => {
    const id = `msg-${++counter}`;
    set((s) => ({
      messages: [
        ...s.messages,
        { id, role, content, toolCalls: [], timestamp: Date.now() },
      ],
    }));
    return id;
  },

  appendToLastAssistant: (field, text) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs.findLast((m) => m.role === "assistant");
      if (last) {
        last[field] = (last[field] || "") + text;
      }
      return { messages: msgs };
    }),

  addToolCallToLast: (tool) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs.findLast((m) => m.role === "assistant");
      if (last) {
        last.toolCalls = [...(last.toolCalls || []), tool];
      }
      return { messages: msgs };
    }),

  updateLastToolResult: (toolName, result) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs.findLast((m) => m.role === "assistant");
      if (last?.toolCalls) {
        const tc = [...last.toolCalls];
        const tool = tc.findLast((t) => t.name === toolName);
        if (tool) tool.result = result;
        last.toolCalls = tc;
      }
      return { messages: msgs };
    }),

  addFramesToLastTool: (frames) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs.findLast((m) => m.role === "assistant");
      if (last?.toolCalls?.length) {
        const tc = [...last.toolCalls];
        tc[tc.length - 1].frames = frames;
        last.toolCalls = tc;
      }
      return { messages: msgs };
    }),

  clear: () => set({ messages: [], isProcessing: false, isQuerying: false, videoId: null }),
  setProcessing: (v) => set({ isProcessing: v }),
  setQuerying: (v) => set({ isQuerying: v }),
  setVideoId: (id) => set({ videoId: id }),
  setApiKey: (key) => set({ apiKey: key }),
  setVideoUrl: (url) => set({ videoUrl: url }),
}));
