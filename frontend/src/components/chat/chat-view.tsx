"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/terminal-store";
import { ChatMessageBubble } from "./chat-message";

function WireframeShape() {
  return (
    <div className="perspective-[800px] w-40 h-40 mb-8">
      <div className="w-full h-full animate-[spin3d_12s_linear_infinite] [transform-style:preserve-3d]">
        {/* Cube faces - wireframe style */}
        {[
          "rotateY(0deg)   translateZ(40px)",
          "rotateY(180deg) translateZ(40px)",
          "rotateY(90deg)  translateZ(40px)",
          "rotateY(-90deg) translateZ(40px)",
          "rotateX(90deg)  translateZ(40px)",
          "rotateX(-90deg) translateZ(40px)",
        ].map((transform, i) => (
          <div
            key={i}
            className="absolute inset-[30px] border border-zinc-700/25"
            style={{ transform, backfaceVisibility: "visible" }}
          />
        ))}

        {/* Inner rotated cube */}
        <div className="absolute inset-0 animate-[spin3d-reverse_8s_linear_infinite] [transform-style:preserve-3d]">
          {[
            "rotateY(0deg)   translateZ(22px)",
            "rotateY(180deg) translateZ(22px)",
            "rotateY(90deg)  translateZ(22px)",
            "rotateY(-90deg) translateZ(22px)",
            "rotateX(90deg)  translateZ(22px)",
            "rotateX(-90deg) translateZ(22px)",
          ].map((transform, i) => (
            <div
              key={i}
              className="absolute inset-[45px] border border-zinc-600/15"
              style={{ transform, backfaceVisibility: "visible" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Onboarding() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-16 select-none">
      <WireframeShape />

      <h1 className="text-chrome text-lg tracking-[0.3em] uppercase font-light mb-4">
        dvd
      </h1>

      <p className="text-[11px] text-zinc-600 tracking-wider uppercase mb-8">
        deep video discovery
      </p>

      <div className="w-32 h-px bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent mb-8" />

      <div className="flex flex-col gap-3 text-center">
        <Step n="01" text="enter your openai api key" />
        <Step n="02" text="paste a youtube url" />
        <Step n="03" text="ask anything about the video" />
      </div>

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
