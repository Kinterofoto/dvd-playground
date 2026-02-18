import json

from dvd.dvd_core import DVDCoreAgent
from dvd.utils import extract_answer


def stream_agent_query(agent: DVDCoreAgent, question: str):
    """Wrap DVDCoreAgent.stream_run() as typed SSE event dicts."""
    try:
        final_answer = None
        for msg in agent.stream_run(question):
            if not isinstance(msg, dict) or "role" not in msg:
                continue

            if msg["role"] == "assistant":
                content = msg.get("content", "")
                if content:
                    yield {"type": "thinking", "content": content}

                # Check for finish tool call
                for tc in msg.get("tool_calls") or []:
                    func = tc.get("function", {})
                    if func.get("name") == "finish":
                        try:
                            args = json.loads(func.get("arguments", "{}"))
                            final_answer = args.get("answer", "")
                        except json.JSONDecodeError:
                            pass

            elif msg["role"] == "tool_call":
                name = msg.get("name", "unknown")
                arguments = msg.get("arguments", "{}")
                # Remove database arg from display
                try:
                    args_dict = json.loads(arguments)
                    args_dict.pop("database", None)
                    arguments = json.dumps(args_dict)
                except (json.JSONDecodeError, TypeError):
                    pass

                if name != "finish":
                    yield {"type": "tool_call", "name": name, "arguments": arguments}

            elif msg["role"] == "tool":
                content = msg.get("content", "")
                if len(content) > 3000:
                    content = content[:3000] + "..."
                yield {"type": "tool_result", "name": msg.get("name", ""), "content": content}

        if final_answer:
            yield {"type": "answer", "content": final_answer}

        yield {"type": "done"}

    except Exception as e:
        yield {"type": "error", "message": str(e)}
