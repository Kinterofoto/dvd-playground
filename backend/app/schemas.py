from pydantic import BaseModel


class ProcessRequest(BaseModel):
    video_url: str


class QueryRequest(BaseModel):
    video_id: str
    question: str


class StatusResponse(BaseModel):
    status: str  # "ready" | "not_found" | "processing"
    video_id: str | None = None
