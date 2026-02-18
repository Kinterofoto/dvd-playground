import json
import math

import dvd.config as config
from dvd.dvd_core import DVDCoreAgent


def _compute_frame_names(time_ranges_hhmmss: list, video_length_str: str, fps: int) -> list[str]:
    """Compute frame filenames from time ranges, matching the logic in build_database.py."""
    def hhmmss_to_secs(t: str) -> int:
        t = t.split(".")[0]
        parts = t.split(":")
        if len(parts) == 2:
            parts = ["00"] + parts
        h, m, s = map(int, parts)
        return h * 3600 + m * 60 + s

    video_length_secs = hhmmss_to_secs(video_length_str)
    max_frames = config.AOAI_TOOL_VLM_MAX_FRAME_NUM

    ranges = []
    for tr in time_ranges_hhmmss:
        start = hhmmss_to_secs(str(tr[0]))
        end = min(hhmmss_to_secs(str(tr[1])), video_length_secs)
        ranges.append((start, end))
    ranges.sort()

    total_time = sum(e - s for s, e in ranges)
    if total_time <= 0:
        return []

    # Sample evenly across all ranges
    import numpy as np
    offsets = np.linspace(0, total_time, num=max_frames, endpoint=False)

    prefix = []
    acc = 0
    for s, e in ranges:
        prefix.append((acc, s, e - s))
        acc += e - s

    timepoints = []
    for off in offsets:
        for base, seg_start, seg_len in prefix:
            if off < base + seg_len:
                timepoints.append(seg_start + (off - base))
                break

    max_idx = int(video_length_secs * fps) - 1
    indices = sorted(set(
        min(max(int(round(t * fps)), 0), max_idx) for t in timepoints
    ))[:max_frames]

    # Sample at most 6 for display
    if len(indices) > 6:
        step = len(indices) / 6
        indices = [indices[int(i * step)] for i in range(6)]

    return [f"frame_n{idx:06d}.jpg" for idx in indices]


def stream_agent_query(agent: DVDCoreAgent, question: str):
    """Wrap DVDCoreAgent.stream_run() as typed SSE event dicts."""
    video_meta = agent.video_db.get_additional_data()
    video_id = video_meta.get("video_file_root", "").split("/")[-1]
    video_length = video_meta.get("video_length", "00:00:00")
    fps = video_meta.get("fps", config.VIDEO_FPS)

    try:
        final_answer = None
        for msg in agent.stream_run(question):
            if not isinstance(msg, dict) or "role" not in msg:
                continue

            if msg["role"] == "assistant":
                content = msg.get("content", "")
                if content:
                    yield {"type": "thinking", "content": content}

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

                frames = []
                try:
                    args_dict = json.loads(arguments)
                    args_dict.pop("database", None)

                    # Extract frames for frame_inspect_tool
                    if name == "frame_inspect_tool" and "time_ranges_hhmmss" in args_dict:
                        frame_names = _compute_frame_names(
                            args_dict["time_ranges_hhmmss"], video_length, fps
                        )
                        frames = [
                            f"/api/frames/{video_id}/{fn}" for fn in frame_names
                        ]

                    arguments = json.dumps(args_dict)
                except (json.JSONDecodeError, TypeError):
                    pass

                if name != "finish":
                    event = {"type": "tool_call", "name": name, "arguments": arguments}
                    if frames:
                        event["frames"] = frames
                    yield event

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
