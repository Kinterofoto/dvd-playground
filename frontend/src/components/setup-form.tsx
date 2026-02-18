"use client";

import { useCallback, useRef, useState } from "react";
import { streamProcess, streamQuery } from "../lib/api";
import { useTerminalStore } from "../store/terminal-store";

export function SetupForm() {
  const [apiKey, setApiKey] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [question, setQuestion] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const {
    addLine,
    clear,
    setProcessing,
    setQuerying,
    setVideoId,
    videoId,
    isProcessing,
    isQuerying,
  } = useTerminalStore();

  const isActive = isProcessing || isQuerying;

  const handleAnalyze = useCallback(async () => {
    if (!apiKey || !videoUrl || !question) return;

    const abortController = new AbortController();
    abortRef.current = abortController;

    // If video already processed, skip to query
    if (videoId) {
      addLine("user", question);
      setQuerying(true);

      try {
        for await (const event of streamQuery(
          videoId,
          question,
          apiKey,
          abortController.signal
        )) {
          switch (event.type) {
            case "thinking":
              addLine("thinking", event.content || "");
              break;
            case "tool_call":
              addLine("tool_call", `${event.name}(${event.arguments || ""})`);
              break;
            case "tool_result":
              addLine(
                "tool_result",
                `${event.name}: ${event.content || ""}`
              );
              break;
            case "answer":
              addLine("answer", event.content || "");
              break;
            case "error":
              addLine("error", event.message || "Unknown error");
              break;
          }
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          addLine("error", err instanceof Error ? err.message : "Connection failed");
        }
      } finally {
        setQuerying(false);
        setQuestion("");
      }
      return;
    }

    // Full flow: process then query
    clear();
    addLine("system", "DVD Playground v1.0.0");
    addLine("system", "---");
    addLine("user", `Video: ${videoUrl}`);
    addLine("user", `Question: ${question}`);
    addLine("system", "");

    // Phase 1: Process video
    setProcessing(true);
    let resolvedVideoId: string | null = null;

    try {
      for await (const event of streamProcess(
        videoUrl,
        apiKey,
        abortController.signal
      )) {
        switch (event.type) {
          case "status":
            addLine("status", event.message || "");
            break;
          case "done":
            resolvedVideoId = event.video_id || null;
            addLine("status", "Video processing complete");
            break;
          case "error":
            addLine("error", event.message || "Processing failed");
            setProcessing(false);
            return;
        }
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        addLine("error", err instanceof Error ? err.message : "Connection failed");
      }
      setProcessing(false);
      return;
    }

    setProcessing(false);

    if (!resolvedVideoId) {
      addLine("error", "No video ID returned");
      return;
    }

    setVideoId(resolvedVideoId);
    addLine("system", "");
    addLine("system", "Starting agent analysis...");

    // Phase 2: Query
    setQuerying(true);

    try {
      for await (const event of streamQuery(
        resolvedVideoId,
        question,
        apiKey,
        abortController.signal
      )) {
        switch (event.type) {
          case "thinking":
            addLine("thinking", event.content || "");
            break;
          case "tool_call":
            addLine("tool_call", `${event.name}(${event.arguments || ""})`);
            break;
          case "tool_result":
            addLine(
              "tool_result",
              `${event.name}: ${event.content || ""}`
            );
            break;
          case "answer":
            addLine("answer", event.content || "");
            break;
          case "error":
            addLine("error", event.message || "Unknown error");
            break;
        }
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        addLine("error", err instanceof Error ? err.message : "Connection failed");
      }
    } finally {
      setQuerying(false);
    }
  }, [apiKey, videoUrl, question, videoId, addLine, clear, setProcessing, setQuerying, setVideoId]);

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
    setProcessing(false);
    setQuerying(false);
    addLine("system", "Aborted by user");
  }, [addLine, setProcessing, setQuerying]);

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    clear();
    setVideoUrl("");
    setQuestion("");
  }, [clear]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isActive) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const thumbnail = extractThumbnail(videoUrl);

  return (
    <div className="border-b border-[var(--border)] p-4 bg-[var(--bg-secondary)]">
      <div className="flex items-center gap-3 mb-3">
        <h1 className="text-sm font-bold text-[var(--color-green)]">
          DVD Playground
        </h1>
        <span className="text-xs text-[var(--text-dim)]">v1.0.0</span>
        {videoId && (
          <span className="text-xs text-[var(--color-cyan)] ml-auto">
            Video loaded: {videoId}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr] gap-3">
        <div>
          <label className="text-xs text-[var(--text-dim)] block mb-1">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--color-green)]"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div>
          <label className="text-xs text-[var(--text-dim)] block mb-1">
            YouTube URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--color-green)]"
              onKeyDown={handleKeyDown}
            />
            {thumbnail && (
              <img
                src={thumbnail}
                alt="thumb"
                className="h-8 w-14 rounded object-cover border border-[var(--border)]"
              />
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-[var(--text-dim)] block mb-1">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What happens in this video?"
              className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--color-green)]"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="flex items-end gap-2">
            {isActive ? (
              <button
                onClick={handleAbort}
                className="px-4 py-1.5 text-sm bg-[var(--color-red)] text-white rounded hover:opacity-80 transition-opacity"
              >
                Abort
              </button>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={!apiKey || !videoUrl || !question}
                className="px-4 py-1.5 text-sm bg-[var(--color-green)] text-black rounded font-bold hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {videoId ? "Ask" : "Analyze"}
              </button>
            )}

            {videoId && !isActive && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-sm border border-[var(--border)] text-[var(--text-dim)] rounded hover:text-[var(--text-primary)] hover:border-[var(--text-dim)] transition-colors"
              >
                New
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-[var(--text-dim)] mt-2">
        Your API key is sent over HTTPS and never stored. Full mode: downloads
        video + analyzes frames with GPT-4 Vision.
      </p>
    </div>
  );
}

function extractThumbnail(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return null;
}
