"use client";

import { useState } from "react";
import { ChatMessage, ToolCallInfo } from "../../lib/types";
import { getFrameUrl } from "../../lib/api";

function ToolCall({ tool }: { tool: ToolCallInfo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2 border border-[#2a2a2a] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-[#111] hover:bg-[#1a1a1a] transition-colors text-left"
      >
        <span className="text-amber-400 font-mono">{tool.name}</span>
        <span className="text-gray-500 truncate flex-1">
          {tool.arguments?.slice(0, 80)}
          {(tool.arguments?.length || 0) > 80 ? "..." : ""}
        </span>
        <span className="text-gray-500">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Frame grid */}
      {tool.frames && tool.frames.length > 0 && (
        <div className="grid grid-cols-3 gap-1 p-2 bg-[#0d0d0d]">
          {tool.frames.map((frame, i) => (
            <img
              key={i}
              src={getFrameUrl(frame)}
              alt={`Frame ${i + 1}`}
              className="rounded w-full aspect-video object-cover"
              loading="lazy"
            />
          ))}
        </div>
      )}

      {expanded && (
        <div className="px-3 py-2 text-xs bg-[#0d0d0d]">
          <pre className="text-gray-400 whitespace-pre-wrap break-words font-mono">
            {tool.arguments}
          </pre>
          {tool.result && (
            <>
              <div className="border-t border-[#2a2a2a] my-2" />
              <pre className="text-cyan-400/70 whitespace-pre-wrap break-words font-mono max-h-40 overflow-y-auto">
                {tool.result}
              </pre>
            </>
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
      <div className="flex justify-end mb-4">
        <div className="bg-[#1a3a1a] border border-green-900/50 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
          <p className="text-sm text-green-100">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.role === "status") {
    return (
      <div className="flex justify-center mb-3">
        <div className="bg-[#111] border border-[#2a2a2a] rounded-full px-4 py-1.5 text-xs text-blue-400">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.role === "error") {
    return (
      <div className="flex justify-center mb-3">
        <div className="bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-2 text-xs text-red-400">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        {/* Thinking toggle */}
        {message.thinking && (
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="text-xs text-violet-400/60 hover:text-violet-400 mb-1 flex items-center gap-1 transition-colors"
          >
            <span>{showThinking ? "▼" : "▶"}</span>
            <span>Thinking</span>
          </button>
        )}
        {showThinking && message.thinking && (
          <div className="bg-violet-950/20 border border-violet-900/30 rounded-lg px-3 py-2 mb-2 text-xs text-violet-300/70 whitespace-pre-wrap max-h-48 overflow-y-auto">
            {message.thinking}
          </div>
        )}

        {/* Tool calls */}
        {message.toolCalls?.map((tool, i) => (
          <ToolCall key={i} tool={tool} />
        ))}

        {/* Main content (answer) */}
        {message.content && (
          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl rounded-bl-sm px-4 py-2.5 mt-2">
            <p className="text-sm text-gray-100 whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
