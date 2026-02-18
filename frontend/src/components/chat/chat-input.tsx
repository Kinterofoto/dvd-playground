"use client";

import { useCallback, useRef, useState } from "react";
import { streamProcess, streamQuery } from "../../lib/api";
import { useChatStore } from "../../store/terminal-store";

export function ChatInput() {
  const [question, setQuestion] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const {
    addMessage,
    appendToLastAssistant,
    addToolCallToLast,
    updateLastToolResult,
    addFramesToLastTool,
    setProcessing,
    setQuerying,
    setVideoId,
    videoId,
    apiKey,
    videoUrl,
    isProcessing,
    isQuerying,
  } = useChatStore();

  const isActive = isProcessing || isQuerying;

  const runQuery = useCallback(
    async (vid: string, q: string) => {
      const abort = new AbortController();
      abortRef.current = abort;
      setQuerying(true);
      addMessage("assistant", "");

      try {
        for await (const event of streamQuery(vid, q, apiKey, abort.signal)) {
          switch (event.type) {
            case "thinking":
              appendToLastAssistant("thinking", event.content || "");
              break;
            case "tool_call":
              addToolCallToLast({
                name: event.name || "",
                arguments: event.arguments || "",
              });
              if (event.frames?.length) {
                addFramesToLastTool(event.frames);
              }
              break;
            case "tool_result":
              updateLastToolResult(event.name || "", event.content || "");
              break;
            case "answer":
              appendToLastAssistant("content", event.content || "");
              break;
            case "error":
              addMessage("error", event.message || "Unknown error");
              break;
          }
        }
      } catch (err) {
        if (!abort.signal.aborted) {
          addMessage(
            "error",
            err instanceof Error ? err.message : "connection failed"
          );
        }
      } finally {
        setQuerying(false);
      }
    },
    [
      apiKey,
      addMessage,
      appendToLastAssistant,
      addToolCallToLast,
      updateLastToolResult,
      addFramesToLastTool,
      setQuerying,
    ]
  );

  const handleSubmit = useCallback(async () => {
    const q = question.trim();
    if (!q || !apiKey || !videoUrl) return;

    addMessage("user", q);
    setQuestion("");

    if (videoId) {
      await runQuery(videoId, q);
      return;
    }

    const abort = new AbortController();
    abortRef.current = abort;
    setProcessing(true);

    let vid: string | null = null;
    try {
      for await (const event of streamProcess(videoUrl, apiKey, abort.signal)) {
        if (event.type === "status") {
          addMessage("status", event.message || "");
        } else if (event.type === "done") {
          vid = event.video_id || null;
        } else if (event.type === "error") {
          addMessage("error", event.message || "processing failed");
          setProcessing(false);
          return;
        }
      }
    } catch (err) {
      if (!abort.signal.aborted) {
        addMessage(
          "error",
          err instanceof Error ? err.message : "connection failed"
        );
      }
      setProcessing(false);
      return;
    }

    setProcessing(false);
    if (!vid) {
      addMessage("error", "no video id returned");
      return;
    }

    setVideoId(vid);
    await runQuery(vid, q);
  }, [
    question,
    apiKey,
    videoUrl,
    videoId,
    addMessage,
    setProcessing,
    setVideoId,
    runQuery,
  ]);

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
    setProcessing(false);
    setQuerying(false);
    addMessage("status", "aborted");
  }, [addMessage, setProcessing, setQuerying]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isActive) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const ready = !!apiKey && !!videoUrl;

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg-1)]">
      <div className="flex items-center gap-3 max-w-3xl mx-auto px-4 h-12">
        <span className="text-[10px] text-[var(--text-3)] font-mono shrink-0">
          {">"}
        </span>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !ready ? "set api key and url above" : "ask about this video"
          }
          disabled={!ready}
          className="flex-1 bg-transparent text-sm text-[var(--text-0)] placeholder-[var(--text-3)] focus:outline-none disabled:opacity-30 font-mono"
        />
        {isActive ? (
          <button
            onClick={handleAbort}
            className="text-[10px] text-[var(--text-3)] hover:text-[var(--text-1)] font-mono transition-colors"
          >
            stop
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!ready || !question.trim()}
            className="text-[10px] text-[var(--text-3)] hover:text-[var(--text-1)] font-mono transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            send
          </button>
        )}
      </div>
    </div>
  );
}
