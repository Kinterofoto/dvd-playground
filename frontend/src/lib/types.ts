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
  frames?: string[];
}

export type MessageRole = "user" | "assistant" | "status" | "error";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  thinking?: string;
  toolCalls?: ToolCallInfo[];
  frames?: string[];
  timestamp: number;
}

export interface ToolCallInfo {
  name: string;
  arguments: string;
  result?: string;
  frames?: string[];
}
