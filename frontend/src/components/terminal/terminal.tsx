"use client";

import { useEffect, useRef } from "react";
import { useTerminalStore } from "../../store/terminal-store";
import { TerminalLineComponent } from "./terminal-line";

export function Terminal() {
  const lines = useTerminalStore((s) => s.lines);
  const isProcessing = useTerminalStore((s) => s.isProcessing);
  const isQuerying = useTerminalStore((s) => s.isQuerying);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const isActive = isProcessing || isQuerying;

  return (
    <div className="flex-1 overflow-y-auto p-4 text-sm">
      {lines.length === 0 && (
        <div className="text-[var(--text-dim)] py-8 text-center">
          <pre className="text-[var(--color-green)] mb-4 text-xs leading-tight">
{`  ___  _   _ ___
 |   \\| | | |   \\
 | |) \\ \\_/ | |) |
 |___/ \\_/ |___/ `}
          </pre>
          <p>Deep Video Discovery Playground</p>
          <p className="mt-1 text-xs">
            Enter your API key and a YouTube URL to start analyzing
          </p>
        </div>
      )}

      {lines.map((line) => (
        <TerminalLineComponent
          key={line.id}
          type={line.type}
          content={line.content}
        />
      ))}

      {isActive && (
        <div className="py-0.5 text-[var(--text-dim)]">
          <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-[var(--color-green)] mr-2 align-middle" />
          <span className="text-xs">
            {isProcessing ? "Processing video..." : "Agent is thinking..."}
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
