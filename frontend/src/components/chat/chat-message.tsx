"use client";

import { useState } from "react";
import { ChatMessage, ToolCallInfo } from "../../lib/types";
import { getFrameUrl } from "../../lib/api";

function ToolCall({ tool }: { tool: ToolCallInfo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="group flex items-center gap-2 text-[11px] text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
      >
        <span className="font-mono">{expanded ? "-" : "+"}</span>
        <span className="font-mono">{tool.name}</span>
      </button>

      {tool.frames && tool.frames.length > 0 && (
        <div className="grid grid-cols-3 gap-px mt-2 rounded overflow-hidden">
          {tool.frames.map((frame, i) => (
            <img
              key={i}
              src={getFrameUrl(frame)}
              alt=""
              className="w-full aspect-video object-cover grayscale hover:grayscale-0 transition-all duration-300"
              loading="lazy"
            />
          ))}
        </div>
      )}

      {expanded && (
        <div className="mt-1.5 pl-4 border-l border-[var(--border)]">
          <pre className="text-[10px] text-[var(--text-3)] whitespace-pre-wrap break-words font-mono leading-relaxed">
            {tool.arguments}
          </pre>
          {tool.result && (
            <pre className="text-[10px] text-[var(--text-2)] whitespace-pre-wrap break-words font-mono mt-1 max-h-32 overflow-y-auto leading-relaxed">
              {tool.result}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const [showThinking, setShowThinking] = useState(false);

  if (message.role === "user") {
    return (
      <div className="mb-6">
        <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wider">
          you
        </span>
        <p className="text-sm text-[var(--text-0)] mt-1">{message.content}</p>
      </div>
    );
  }

  if (message.role === "status") {
    return (
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] font-mono text-[var(--text-3)]">--</span>
        <span className="text-[11px] text-[var(--text-3)]">
          {message.content}
        </span>
      </div>
    );
  }

  if (message.role === "error") {
    return (
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] font-mono text-[var(--text-3)]">!!</span>
        <span className="text-[11px] text-red-400/60">{message.content}</span>
      </div>
    );
  }

  // Assistant
  return (
    <div className="mb-6">
      <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wider">
        dvd
      </span>

      {message.thinking && (
        <button
          onClick={() => setShowThinking(!showThinking)}
          className="block text-[10px] text-[var(--text-3)] hover:text-[var(--text-2)] mt-1 transition-colors font-mono"
        >
          {showThinking ? "- hide reasoning" : "+ show reasoning"}
        </button>
      )}
      {showThinking && message.thinking && (
        <div className="mt-1 pl-4 border-l border-[var(--border)] max-h-40 overflow-y-auto">
          <p className="text-[11px] text-[var(--text-3)] whitespace-pre-wrap leading-relaxed">
            {message.thinking}
          </p>
        </div>
      )}

      {message.toolCalls?.map((tool, i) => (
        <ToolCall key={i} tool={tool} />
      ))}

      {message.content && (
        <p className="text-sm text-[var(--text-1)] mt-2 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      )}
    </div>
  );
}
