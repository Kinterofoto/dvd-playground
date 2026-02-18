"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/terminal-store";
import { ChatMessageBubble } from "./chat-message";

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
        {messages.length === 0 && (
          <div className="pt-32 text-center">
            <p className="text-xs tracking-widest uppercase text-[var(--text-3)]">
              deep video discovery
            </p>
            <p className="text-[11px] text-[var(--text-3)] mt-3 max-w-sm mx-auto leading-relaxed">
              paste a youtube url and ask questions about any video.
              the agent analyzes frames and subtitles to find answers.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}

        {isActive && (
          <div className="mb-6">
            <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wider">
              dvd
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-block w-1 h-1 rounded-full bg-[var(--text-3)] animate-pulse" />
              <span className="text-[11px] text-[var(--text-3)]">
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
