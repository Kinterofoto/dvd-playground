import { SSEEvent } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

async function* parseSSEStream(
  response: Response
): AsyncGenerator<SSEEvent> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ")) {
        try {
          const data = JSON.parse(trimmed.slice(6));
          yield data as SSEEvent;
        } catch {
          // skip malformed JSON
        }
      }
    }
  }
}

export async function* streamProcess(
  videoUrl: string,
  apiKey: string,
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  const response = await fetch(`${BACKEND_URL}/api/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-OpenAI-API-Key": apiKey,
    },
    body: JSON.stringify({ video_url: videoUrl }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Process failed: ${text}`);
  }

  yield* parseSSEStream(response);
}

export async function* streamQuery(
  videoId: string,
  question: string,
  apiKey: string,
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  const response = await fetch(`${BACKEND_URL}/api/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-OpenAI-API-Key": apiKey,
    },
    body: JSON.stringify({ video_id: videoId, question }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Query failed: ${text}`);
  }

  yield* parseSSEStream(response);
}
