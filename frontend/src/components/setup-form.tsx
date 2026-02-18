"use client";

import { useChatStore } from "../store/terminal-store";

export function SetupBar() {
  const { apiKey, setApiKey, videoUrl, setVideoUrl, videoId, clear } =
    useChatStore();

  const thumbnail = extractThumbnail(videoUrl);

  return (
    <div className="border-b border-[#2a2a2a] bg-[#0d0d0d] px-4 py-3">
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        <h1 className="text-sm font-bold text-green-400 shrink-0">DVD</h1>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="OpenAI API Key"
            className="w-40 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-green-700"
          />

          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube URL"
              className="flex-1 min-w-0 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-green-700"
            />
            {thumbnail && (
              <img
                src={thumbnail}
                alt=""
                className="h-7 w-12 rounded object-cover border border-[#2a2a2a] shrink-0"
              />
            )}
          </div>
        </div>

        {videoId && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-cyan-500 font-mono">
              {videoId}
            </span>
            <button
              onClick={clear}
              className="text-[10px] text-gray-500 hover:text-gray-300 border border-[#2a2a2a] rounded px-2 py-1 transition-colors"
            >
              New
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function extractThumbnail(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match
    ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
    : null;
}
