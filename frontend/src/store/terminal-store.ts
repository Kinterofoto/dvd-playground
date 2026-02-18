import { create } from "zustand";
import { LineType, TerminalLine } from "../lib/types";

interface TerminalState {
  lines: TerminalLine[];
  isProcessing: boolean;
  isQuerying: boolean;
  videoId: string | null;
  addLine: (type: LineType, content: string) => void;
  clear: () => void;
  setProcessing: (v: boolean) => void;
  setQuerying: (v: boolean) => void;
  setVideoId: (id: string | null) => void;
}

let lineCounter = 0;

export const useTerminalStore = create<TerminalState>((set) => ({
  lines: [],
  isProcessing: false,
  isQuerying: false,
  videoId: null,

  addLine: (type, content) =>
    set((state) => ({
      lines: [
        ...state.lines,
        {
          id: `line-${++lineCounter}`,
          type,
          content,
          timestamp: Date.now(),
        },
      ],
    })),

  clear: () =>
    set({
      lines: [],
      isProcessing: false,
      isQuerying: false,
      videoId: null,
    }),

  setProcessing: (v) => set({ isProcessing: v }),
  setQuerying: (v) => set({ isQuerying: v }),
  setVideoId: (id) => set({ videoId: id }),
}));
