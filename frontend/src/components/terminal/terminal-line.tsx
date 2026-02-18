"use client";

import { LineType } from "../../lib/types";

const LINE_CONFIG: Record<
  LineType,
  { label: string; labelClass: string; textClass: string }
> = {
  system: {
    label: "",
    labelClass: "",
    textClass: "text-[var(--text-dim)]",
  },
  user: {
    label: "> ",
    labelClass: "text-[var(--color-green)]",
    textClass: "text-[var(--color-green)]",
  },
  status: {
    label: "[STATUS] ",
    labelClass: "text-[var(--color-blue)]",
    textClass: "text-[var(--text-primary)]",
  },
  thinking: {
    label: "[THINK]  ",
    labelClass: "text-[var(--color-violet)]",
    textClass: "text-[var(--color-violet)] opacity-90",
  },
  tool_call: {
    label: "[TOOL]   ",
    labelClass: "text-[var(--color-amber)]",
    textClass: "text-[var(--color-amber)]",
  },
  tool_result: {
    label: "[RESULT] ",
    labelClass: "text-[var(--color-cyan)]",
    textClass: "text-[var(--color-cyan)] opacity-80",
  },
  answer: {
    label: "[ANSWER] ",
    labelClass: "text-[var(--color-green)] font-bold",
    textClass: "text-[var(--color-green)] font-bold",
  },
  error: {
    label: "[ERROR]  ",
    labelClass: "text-[var(--color-red)]",
    textClass: "text-[var(--color-red)]",
  },
};

interface Props {
  type: LineType;
  content: string;
}

export function TerminalLineComponent({ type, content }: Props) {
  const config = LINE_CONFIG[type];

  return (
    <div className="py-0.5 leading-relaxed whitespace-pre-wrap break-words">
      {config.label && (
        <span className={`${config.labelClass} select-none`}>
          {config.label}
        </span>
      )}
      <span className={config.textClass}>{content}</span>
    </div>
  );
}
