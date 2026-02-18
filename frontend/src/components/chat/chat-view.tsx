"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/terminal-store";
import { ChatMessageBubble } from "./chat-message";

function Onboarding() {
  return (
    <div className="flex flex-col items-center justify-center pt-28 pb-16 select-none">
      {/* Abstract metallic orb */}
      <div className="relative w-28 h-28 mb-10">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-300/10 via-zinc-500/5 to-transparent blur-2xl" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-zinc-400/8 via-transparent to-zinc-600/5" />
        <div className="absolute inset-0 rounded-full border border-zinc-700/20" />
        <div className="absolute inset-[3px] rounded-full border border-zinc-600/10" />
        {/* Reflection sweep */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute -inset-full animate-[shimmer_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-12" />
        </div>
        {/* Center mark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-8 bg-gradient-to-b from-transparent via-zinc-500/30 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-8 bg-gradient-to-r from-transparent via-zinc-500/30 to-transparent" />
      </div>

      {/* Title with metallic gradient */}
      <h1 className="text-chrome text-lg tracking-[0.3em] uppercase font-light mb-4">
        dvd
      </h1>

      <p className="text-[11px] text-zinc-600 tracking-wider uppercase mb-8">
        deep video discovery
      </p>

      {/* Thin decorative line */}
      <div className="w-32 h-px bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent mb-8" />

      {/* Steps */}
      <div className="flex flex-col gap-3 text-center">
        <Step n="01" text="enter your openai api key" />
        <Step n="02" text="paste a youtube url" />
        <Step n="03" text="ask anything about the video" />
      </div>

      {/* Bottom accent */}
      <div className="mt-12 flex items-center gap-3">
        <div className="w-6 h-px bg-zinc-800" />
        <span className="text-[9px] text-zinc-700 tracking-widest uppercase">
          ai-powered video analysis
        </span>
        <div className="w-6 h-px bg-zinc-800" />
      </div>
    </div>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex items-center gap-3 justify-center">
      <span className="text-[10px] font-mono text-zinc-700">{n}</span>
      <span className="text-[11px] text-zinc-500 tracking-wide">{text}</span>
    </div>
  );
}

export function ChatView() {
  const messages = useChatStore((s) => s.messages);
  const isProcessing = useChatStore((s) => s.isProcessing);
  const isQuerying = useChatStore((s) => s.isQuerying);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isActive = isProcessing || isQuerying;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {messages.length === 0 && <Onboarding />}

        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}

        {isActive && (
          <div className="mb-6">
            <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wider">
              dvd
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-block w-1 h-1 rounded-full bg-zinc-600 animate-pulse" />
              <span className="text-[11px] text-zinc-600">
                {isProcessing ? "processing video" : "analyzing"}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
