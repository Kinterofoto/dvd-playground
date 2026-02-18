export type SSEEventType =
  | "status"
  | "thinking"
  | "tool_call"
  | "tool_result"
  | "answer"
  | "done"
  | "error";

export interface SSEEvent {
  type: SSEEventType;
  content?: string;
  message?: string;
  name?: string;
  arguments?: string;
  video_id?: string;
  step?: string;
}

export type LineType =
  | "system"
  | "user"
  | "thinking"
  | "tool_call"
  | "tool_result"
  | "answer"
  | "error"
  | "status";

export interface TerminalLine {
  id: string;
  type: LineType;
  content: string;
  timestamp: number;
}
