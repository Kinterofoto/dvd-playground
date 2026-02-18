import os

# ------------------ video download and segmentation configuration ------------------ #
VIDEO_DATABASE_FOLDER = os.environ.get("VIDEO_DATABASE_FOLDER", "./video_database/")
VIDEO_RESOLUTION = "360"
VIDEO_FPS = 2
CLIP_SECS = 10

# ------------------ model configuration ------------------ #
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", None)

AOAI_CAPTION_VLM_ENDPOINT_LIST = [""]
AOAI_CAPTION_VLM_MODEL_NAME = "gpt-4.1-mini"

AOAI_ORCHESTRATOR_LLM_ENDPOINT_LIST = [""]
AOAI_ORCHESTRATOR_LLM_MODEL_NAME = "o3"

AOAI_TOOL_VLM_ENDPOINT_LIST = [""]
AOAI_TOOL_VLM_MODEL_NAME = "gpt-4.1-mini"
AOAI_TOOL_VLM_MAX_FRAME_NUM = 50

AOAI_EMBEDDING_RESOURCE_LIST = [""]
AOAI_EMBEDDING_LARGE_MODEL_NAME = "text-embedding-3-large"
AOAI_EMBEDDING_LARGE_DIM = 3072

# ------------------ agent and tool setting ------------------ #
LITE_MODE = False
GLOBAL_BROWSE_TOPK = 300
OVERWRITE_CLIP_SEARCH_TOPK = 0

SINGLE_CHOICE_QA = False
MAX_ITERATIONS = 3
