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
          addMessage("error", err instanceof Error ? err.message : "Connection failed");
        }
      } finally {
        setQuerying(false);
      }
    },
    [apiKey, addMessage, appendToLastAssistant, addToolCallToLast, updateLastToolResult, addFramesToLastTool, setQuerying]
  );

  const handleSubmit = useCallback(async () => {
    const q = question.trim();
    if (!q || !apiKey || !videoUrl) return;

    addMessage("user", q);
    setQuestion("");

    // If video already processed, go straight to query
    if (videoId) {
      await runQuery(videoId, q);
      return;
    }

    // Process video first
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
          addMessage("error", event.message || "Processing failed");
          setProcessing(false);
          return;
        }
      }
    } catch (err) {
      if (!abort.signal.aborted) {
        addMessage("error", err instanceof Error ? err.message : "Connection failed");
      }
      setProcessing(false);
      return;
    }

    setProcessing(false);
    if (!vid) {
      addMessage("error", "No video ID returned");
      return;
    }

    setVideoId(vid);
    addMessage("status", "Video ready. Analyzing...");
    await runQuery(vid, q);
  }, [question, apiKey, videoUrl, videoId, addMessage, setProcessing, setVideoId, runQuery]);

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
    setProcessing(false);
    setQuerying(false);
    addMessage("status", "Aborted");
  }, [addMessage, setProcessing, setQuerying]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isActive) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const ready = !!apiKey && !!videoUrl;

  return (
    <div className="border-t border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !ready
              ? "Set your API key and YouTube URL above first..."
              : videoId
              ? "Ask another question about this video..."
              : "Ask a question about the video..."
          }
          disabled={!ready}
          className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-green-600 disabled:opacity-40"
        />
        {isActive ? (
          <button
            onClick={handleAbort}
            className="px-5 py-2.5 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!ready || !question.trim()}
            className="px-5 py-2.5 text-sm bg-green-600 text-black rounded-xl font-bold hover:bg-green-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
