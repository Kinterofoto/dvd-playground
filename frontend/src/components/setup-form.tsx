"use client";

import { useChatStore } from "../store/terminal-store";

export function SetupBar() {
  const { apiKey, setApiKey, videoUrl, setVideoUrl, videoId, clear } =
    useChatStore();

  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg-1)]">
      <div className="flex items-center gap-4 max-w-3xl mx-auto px-4 h-11">
        <span className="text-[10px] tracking-widest uppercase text-[var(--text-3)] shrink-0">
          dvd
        </span>

        <div className="w-px h-4 bg-[var(--border)]" />

        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="api key"
          className="w-32 bg-transparent text-xs text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none font-mono"
        />

        <div className="w-px h-4 bg-[var(--border)]" />

        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="youtube url"
          className="flex-1 min-w-0 bg-transparent text-xs text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none font-mono"
        />

        {videoId && (
          <>
            <div className="w-px h-4 bg-[var(--border)]" />
            <span className="text-[10px] text-[var(--text-3)] font-mono shrink-0">
              {videoId}
            </span>
            <button
              onClick={clear}
              className="text-[10px] text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
            >
              reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
