from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
import asyncio
import base64
import shutil


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# URL Health Check Models
class UrlHealthCheckRequest(BaseModel):
    urls: List[str]

class UrlHealthResult(BaseModel):
    url: str
    status: str  # 'online', 'offline', 'slow'
    response_time_ms: int
    status_code: Optional[int] = None
    error: Optional[str] = None
    checked_at: str

class UrlHealthCheckResponse(BaseModel):
    results: List[UrlHealthResult]
    total: int
    online: int
    offline: int
    slow: int

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# URL Health Check Endpoint
async def check_single_url(url: str) -> UrlHealthResult:
    """Check health of a single URL"""
    start_time = asyncio.get_event_loop().time()
    
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.head(url)
            end_time = asyncio.get_event_loop().time()
            response_time_ms = int((end_time - start_time) * 1000)
            
            status = 'online'
            if response.status_code >= 400:
                status = 'offline'
            elif response_time_ms > 500:
                status = 'slow'
            
            return UrlHealthResult(
                url=url,
                status=status,
                response_time_ms=response_time_ms,
                status_code=response.status_code,
                error=None,
                checked_at=datetime.now(timezone.utc).isoformat()
            )
    except httpx.TimeoutException:
        end_time = asyncio.get_event_loop().time()
        response_time_ms = int((end_time - start_time) * 1000)
        return UrlHealthResult(
            url=url,
            status='offline',
            response_time_ms=response_time_ms,
            status_code=None,
            error='Connection timeout',
            checked_at=datetime.now(timezone.utc).isoformat()
        )
    except httpx.ConnectError:
        end_time = asyncio.get_event_loop().time()
        response_time_ms = int((end_time - start_time) * 1000)
        return UrlHealthResult(
            url=url,
            status='offline',
            response_time_ms=response_time_ms,
            status_code=None,
            error='Connection failed',
            checked_at=datetime.now(timezone.utc).isoformat()
        )
    except Exception as e:
        end_time = asyncio.get_event_loop().time()
        response_time_ms = int((end_time - start_time) * 1000)
        return UrlHealthResult(
            url=url,
            status='offline',
            response_time_ms=response_time_ms,
            status_code=None,
            error=str(e),
            checked_at=datetime.now(timezone.utc).isoformat()
        )


@api_router.post("/health-check", response_model=UrlHealthCheckResponse)
async def check_urls_health(request: UrlHealthCheckRequest):
    """Check health status of multiple URLs"""
    logger.info(f"Checking health of {len(request.urls)} URLs")
    
    # Check all URLs concurrently
    tasks = [check_single_url(url) for url in request.urls]
    results = await asyncio.gather(*tasks)
    
    # Calculate statistics
    online_count = sum(1 for r in results if r.status == 'online')
    offline_count = sum(1 for r in results if r.status == 'offline')
    slow_count = sum(1 for r in results if r.status == 'slow')
    
    return UrlHealthCheckResponse(
        results=results,
        total=len(results),
        online=online_count,
        offline=offline_count,
        slow=slow_count
    )


@api_router.get("/health-check/single")
async def check_single_url_health(url: str):
    """Check health of a single URL via query parameter"""
    result = await check_single_url(url)
    return result

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()