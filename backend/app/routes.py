import json

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse

import dvd.config as config
from dvd.dvd_core import DVDCoreAgent

from .schemas import ProcessRequest, QueryRequest, StatusResponse
from .streaming import stream_agent_query
from .video_manager import (
    check_video_status,
    get_video_paths,
    process_video_pipeline,
    set_api_key,
)

router = APIRouter(prefix="/api")


def _get_api_key(x_openai_api_key: str | None = Header(None)) -> str:
    if not x_openai_api_key:
        raise HTTPException(status_code=400, detail="X-OpenAI-API-Key header is required")
    return x_openai_api_key


def _sse_encode(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


@router.post("/process")
async def process_video(
    req: ProcessRequest,
    x_openai_api_key: str | None = Header(None),
):
    api_key = _get_api_key(x_openai_api_key)

    def generate():
        try:
            for event in process_video_pipeline(req.video_url, api_key):
                yield _sse_encode(event)
        except Exception as e:
            yield _sse_encode({"type": "error", "message": str(e)})

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/query")
async def query_video(
    req: QueryRequest,
    x_openai_api_key: str | None = Header(None),
):
    api_key = _get_api_key(x_openai_api_key)

    paths = get_video_paths(req.video_id)
    if not paths:
        raise HTTPException(status_code=404, detail="Video not processed yet")

    video_db_path, caption_file = paths

    def generate():
        try:
            set_api_key(api_key)
            agent = DVDCoreAgent(video_db_path, caption_file, config.MAX_ITERATIONS)

            for event in stream_agent_query(agent, req.question):
                yield _sse_encode(event)
        except Exception as e:
            yield _sse_encode({"type": "error", "message": str(e)})

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/status/{video_id}")
async def video_status(video_id: str):
    status = check_video_status(video_id)
    return StatusResponse(status=status, video_id=video_id)
