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
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🎬</div>
            <h2 className="text-lg font-bold text-gray-300 mb-1">
              Deep Video Discovery
            </h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Paste a YouTube URL, enter your OpenAI API key, and ask questions
              about any video. The AI agent will analyze frames and subtitles to
              find answers.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}

        {isActive && (
          <div className="flex justify-start mb-4">
            <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-gray-500">
                {isProcessing ? "Processing video..." : "Analyzing..."}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
