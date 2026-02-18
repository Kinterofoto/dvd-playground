import json
import os
import re

import dvd.config as config
from dvd.frame_caption import process_video, process_video_lite
from dvd.video_utils import decode_video_to_frames, download_srt_subtitle, load_video


def extract_video_id(video_url: str) -> str:
    """Extract YouTube video ID from URL."""
    patterns = [
        r"v=([a-zA-Z0-9_-]{11})",
        r"youtu\.be/([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, video_url)
        if match:
            return match.group(1)
    raise ValueError(f"Could not extract video ID from: {video_url}")


def set_api_key(api_key: str):
    """Set the OpenAI API key in config and env for subprocess compatibility."""
    config.OPENAI_API_KEY = api_key
    os.environ["OPENAI_API_KEY"] = api_key


def process_video_pipeline(video_url: str, api_key: str):
    """Generator that yields progress events while processing a video."""
    set_api_key(api_key)

    video_id = extract_video_id(video_url)

    video_path = os.path.join(config.VIDEO_DATABASE_FOLDER, "raw", f"{video_id}.mp4")
    frames_dir = os.path.join(config.VIDEO_DATABASE_FOLDER, video_id, "frames")
    captions_dir = os.path.join(config.VIDEO_DATABASE_FOLDER, video_id, "captions")
    caption_file = os.path.join(captions_dir, "captions.json")
    video_db_path = os.path.join(config.VIDEO_DATABASE_FOLDER, video_id, "database.json")
    srt_path = os.path.join(config.VIDEO_DATABASE_FOLDER, video_id, "subtitles.srt")

    os.makedirs(os.path.join(config.VIDEO_DATABASE_FOLDER, "raw"), exist_ok=True)
    os.makedirs(frames_dir, exist_ok=True)
    os.makedirs(captions_dir, exist_ok=True)

    # Check if already fully processed
    if os.path.exists(video_db_path) and os.path.exists(caption_file):
        yield {"type": "status", "message": "Video already processed, skipping..."}
        yield {"type": "done", "video_id": video_id}
        return

    if config.LITE_MODE:
        # Lite mode: subtitles only
        yield {"type": "status", "message": "Downloading subtitles..."}
        if not os.path.exists(srt_path):
            download_srt_subtitle(video_url, srt_path)
        yield {"type": "status", "message": "Processing subtitles..."}
        process_video_lite(captions_dir, srt_path)
    else:
        # Full mode: download video + extract frames + caption with GPT-4 Vision
        yield {"type": "status", "message": "Downloading video..."}
        if not os.path.exists(video_path):
            load_video(video_url)
        yield {"type": "status", "message": "Video downloaded"}

        yield {"type": "status", "message": "Extracting frames at 2fps..."}
        if not os.listdir(frames_dir):
            decode_video_to_frames(video_path)
        yield {"type": "status", "message": "Frames extracted"}

        yield {"type": "status", "message": "Generating captions with GPT-4 Vision (this may take several minutes)..."}
        if not os.path.exists(caption_file):
            # Also download subtitles for transcript overlay
            try:
                if not os.path.exists(srt_path):
                    download_srt_subtitle(video_url, srt_path)
                process_video(frames_dir, captions_dir, subtitle_file_path=srt_path)
            except Exception:
                # Subtitles may not be available, process without them
                process_video(frames_dir, captions_dir)
        yield {"type": "status", "message": "Captions generated"}

    # Build vector database
    yield {"type": "status", "message": "Building vector database..."}
    if not os.path.exists(video_db_path):
        from dvd.build_database import init_single_video_db
        init_single_video_db(caption_file, video_db_path, config.AOAI_EMBEDDING_LARGE_DIM)
    yield {"type": "status", "message": "Database ready"}

    yield {"type": "done", "video_id": video_id}


def get_video_paths(video_id: str) -> tuple[str, str] | None:
    """Return (video_db_path, caption_file) if video is processed, else None."""
    video_db_path = os.path.join(config.VIDEO_DATABASE_FOLDER, video_id, "database.json")
    caption_file = os.path.join(config.VIDEO_DATABASE_FOLDER, video_id, "captions", "captions.json")
    if os.path.exists(video_db_path) and os.path.exists(caption_file):
        return video_db_path, caption_file
    return None


def check_video_status(video_id: str) -> str:
    """Check if a video is already processed."""
    paths = get_video_paths(video_id)
    return "ready" if paths else "not_found"
