from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx
import asyncio
import base64
import shutil
import re


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory for logo storage
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)

# Logo settings
MAX_LOGO_SIZE = 2 * 1024 * 1024  # 2MB
ALLOWED_LOGO_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.svg'}
LOGO_FILENAME = 'app_logo'

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

# Logo Response Model
class LogoResponse(BaseModel):
    has_custom_logo: bool
    logo_url: Optional[str] = None
    uploaded_at: Optional[str] = None


# ==================== DEVICE & PLAYLIST MODELS ====================

MAX_PLAYLISTS_PER_DEVICE = 10

class DeviceRegisterRequest(BaseModel):
    device_id: str  # MAC format: 11:30:02:28:02:bb
    device_key: str  # Numeric: 1323008583
    platform: Optional[str] = "unknown"  # android_tv, webos, tizen, web

class DeviceResponse(BaseModel):
    device_id: str
    device_key: str
    platform: str
    status: str  # unregistered, registered, active
    created_at: str
    last_seen_at: str

class PlaylistType(BaseModel):
    type: str  # 'm3u' or 'xtream'

class PlaylistCreateRequest(BaseModel):
    playlist_name: str
    playlist_url: str  # M3U URL or Xtream base URL (http://server:port)
    playlist_type: str = "m3u"  # 'm3u' or 'xtream'
    # Xtream specific fields (optional)
    xtream_username: Optional[str] = None
    xtream_password: Optional[str] = None

class PlaylistUpdateRequest(BaseModel):
    playlist_name: Optional[str] = None
    playlist_url: Optional[str] = None
    playlist_type: Optional[str] = None
    xtream_username: Optional[str] = None
    xtream_password: Optional[str] = None

class PlaylistResponse(BaseModel):
    id: str
    device_id: str
    playlist_name: str
    playlist_url: str
    playlist_type: str
    xtream_username: Optional[str] = None
    is_active: bool
    created_at: str

class DevicePlaylistsResponse(BaseModel):
    device_id: str
    device_status: str
    playlists: List[PlaylistResponse]
    active_playlist: Optional[PlaylistResponse] = None

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


# ==================== LOGO MANAGEMENT ENDPOINTS ====================

def get_current_logo_path() -> Optional[Path]:
    """Find the current logo file if it exists"""
    for ext in ALLOWED_LOGO_EXTENSIONS:
        logo_path = UPLOADS_DIR / f"{LOGO_FILENAME}{ext}"
        if logo_path.exists():
            return logo_path
    return None


def delete_existing_logo():
    """Delete any existing logo file"""
    for ext in ALLOWED_LOGO_EXTENSIONS:
        logo_path = UPLOADS_DIR / f"{LOGO_FILENAME}{ext}"
        if logo_path.exists():
            logo_path.unlink()


@api_router.post("/admin/logo")
async def upload_logo(file: UploadFile = File(...)):
    """Upload a new logo (Superadmin only)"""
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_LOGO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Desteklenmeyen dosya formatı. İzin verilen: {', '.join(ALLOWED_LOGO_EXTENSIONS)}"
        )
    
    # Read file content
    content = await file.read()
    
    # Validate file size
    if len(content) > MAX_LOGO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Dosya boyutu çok büyük. Maksimum: {MAX_LOGO_SIZE // (1024*1024)}MB"
        )
    
    # Delete existing logo
    delete_existing_logo()
    
    # Save new logo
    logo_path = UPLOADS_DIR / f"{LOGO_FILENAME}{file_ext}"
    with open(logo_path, 'wb') as f:
        f.write(content)
    
    # Store metadata in database
    await db.settings.update_one(
        {"key": "app_logo"},
        {
            "$set": {
                "key": "app_logo",
                "filename": f"{LOGO_FILENAME}{file_ext}",
                "original_name": file.filename,
                "uploaded_at": datetime.now(timezone.utc).isoformat(),
                "size": len(content),
                "content_type": file.content_type
            }
        },
        upsert=True
    )
    
    logger.info(f"Logo uploaded: {file.filename}")
    
    return {
        "success": True,
        "message": "Logo başarıyla yüklendi",
        "logo_url": f"/api/admin/logo/file"
    }


@api_router.get("/admin/logo")
async def get_logo_info():
    """Get current logo information"""
    logo_path = get_current_logo_path()
    
    if logo_path:
        # Get metadata from database
        metadata = await db.settings.find_one({"key": "app_logo"}, {"_id": 0})
        return LogoResponse(
            has_custom_logo=True,
            logo_url="/api/admin/logo/file",
            uploaded_at=metadata.get("uploaded_at") if metadata else None
        )
    
    return LogoResponse(
        has_custom_logo=False,
        logo_url=None,
        uploaded_at=None
    )


@api_router.get("/admin/logo/file")
async def get_logo_file():
    """Serve the logo file"""
    logo_path = get_current_logo_path()
    
    if not logo_path:
        raise HTTPException(status_code=404, detail="Logo bulunamadı")
    
    # Determine content type
    ext = logo_path.suffix.lower()
    content_types = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    }
    
    return FileResponse(
        logo_path,
        media_type=content_types.get(ext, 'application/octet-stream'),
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )


@api_router.delete("/admin/logo")
async def delete_logo():
    """Delete the custom logo (revert to default)"""
    logo_path = get_current_logo_path()
    
    if not logo_path:
        raise HTTPException(status_code=404, detail="Silinecek logo bulunamadı")
    
    # Delete file
    delete_existing_logo()
    
    # Remove metadata from database
    await db.settings.delete_one({"key": "app_logo"})
    
    logger.info("Custom logo deleted")
    
    return {
        "success": True,
        "message": "Logo silindi, varsayılan logo kullanılacak"
    }


# ==================== DEVICE MANAGEMENT ENDPOINTS ====================

def validate_device_id(device_id: str) -> bool:
    """Validate device ID format (MAC-like: XX:XX:XX:XX:XX:XX)"""
    import re
    pattern = r'^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$'
    return bool(re.match(pattern, device_id))


def validate_device_key(device_key: str) -> bool:
    """Validate device key format (numeric)"""
    return device_key.isdigit() and len(device_key) >= 6


@api_router.post("/device/register")
async def register_device(request: DeviceRegisterRequest):
    """Register a new device or update existing one"""
    # Validate formats
    if not validate_device_id(request.device_id):
        raise HTTPException(
            status_code=400,
            detail="Geçersiz Device ID formatı. Örnek: 11:30:02:28:02:bb"
        )
    
    if not validate_device_key(request.device_key):
        raise HTTPException(
            status_code=400,
            detail="Geçersiz Device Key formatı. Örnek: 1323008583"
        )
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Check if device already exists
    existing_device = await db.devices.find_one({"device_id": request.device_id}, {"_id": 0})
    
    if existing_device:
        # Verify device key matches
        if existing_device.get("device_key") != request.device_key:
            raise HTTPException(
                status_code=403,
                detail="Device Key eşleşmiyor"
            )
        
        # Update last seen
        await db.devices.update_one(
            {"device_id": request.device_id},
            {"$set": {"last_seen_at": now}}
        )
        
        return {
            "success": True,
            "message": "Cihaz zaten kayıtlı",
            "device": {
                **existing_device,
                "last_seen_at": now
            }
        }
    
    # Create new device
    device_doc = {
        "device_id": request.device_id,
        "device_key": request.device_key,
        "platform": request.platform,
        "status": "registered",
        "created_at": now,
        "last_seen_at": now
    }
    
    await db.devices.insert_one(device_doc)
    del device_doc["_id"]
    
    logger.info(f"Device registered: {request.device_id}")
    
    return {
        "success": True,
        "message": "Cihaz başarıyla kaydedildi",
        "device": device_doc
    }


@api_router.post("/device/validate")
async def validate_device(request: DeviceRegisterRequest):
    """Validate device credentials without registering"""
    # Validate formats
    if not validate_device_id(request.device_id):
        raise HTTPException(
            status_code=400,
            detail="Geçersiz Device ID formatı"
        )
    
    if not validate_device_key(request.device_key):
        raise HTTPException(
            status_code=400,
            detail="Geçersiz Device Key formatı"
        )
    
    # Check device exists and key matches
    device = await db.devices.find_one({"device_id": request.device_id}, {"_id": 0})
    
    if not device:
        return {"valid": False, "message": "Cihaz bulunamadı"}
    
    if device.get("device_key") != request.device_key:
        return {"valid": False, "message": "Device Key eşleşmiyor"}
    
    return {
        "valid": True,
        "message": "Cihaz doğrulandı",
        "device": device
    }


@api_router.get("/device/{device_id}")
async def get_device(device_id: str):
    """Get device information"""
    device = await db.devices.find_one({"device_id": device_id}, {"_id": 0})
    
    if not device:
        raise HTTPException(status_code=404, detail="Cihaz bulunamadı")
    
    return device


@api_router.get("/device/{device_id}/playlists")
async def get_device_playlists(device_id: str, device_key: Optional[str] = None):
    """Get all playlists for a device"""
    # Check device exists
    device = await db.devices.find_one({"device_id": device_id}, {"_id": 0})
    
    if not device:
        raise HTTPException(status_code=404, detail="Cihaz bulunamadı")
    
    # Optional: Validate device key if provided
    if device_key and device.get("device_key") != device_key:
        raise HTTPException(status_code=403, detail="Device Key eşleşmiyor")
    
    # Update last seen
    await db.devices.update_one(
        {"device_id": device_id},
        {"$set": {"last_seen_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Get playlists
    playlists = await db.playlists.find(
        {"device_id": device_id},
        {"_id": 0}
    ).to_list(MAX_PLAYLISTS_PER_DEVICE)
    
    # Find active playlist
    active_playlist = next((p for p in playlists if p.get("is_active")), None)
    
    return {
        "device_id": device_id,
        "device_status": device.get("status"),
        "playlists": playlists,
        "active_playlist": active_playlist
    }


@api_router.post("/device/{device_id}/playlist")
async def add_playlist(device_id: str, request: PlaylistCreateRequest, device_key: Optional[str] = None):
    """Add a playlist to a device (max 10)"""
    # Check device exists
    device = await db.devices.find_one({"device_id": device_id}, {"_id": 0})
    
    if not device:
        raise HTTPException(status_code=404, detail="Cihaz bulunamadı")
    
    # Validate device key if provided
    if device_key and device.get("device_key") != device_key:
        raise HTTPException(status_code=403, detail="Device Key eşleşmiyor")
    
    # Check playlist limit
    playlist_count = await db.playlists.count_documents({"device_id": device_id})
    if playlist_count >= MAX_PLAYLISTS_PER_DEVICE:
        raise HTTPException(
            status_code=400,
            detail=f"Maksimum playlist sayısına ulaşıldı ({MAX_PLAYLISTS_PER_DEVICE})"
        )
    
    # Validate playlist type
    if request.playlist_type not in ["m3u", "xtream"]:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz playlist türü. 'm3u' veya 'xtream' olmalı"
        )
    
    # For xtream type, username and password are required
    if request.playlist_type == "xtream":
        if not request.xtream_username or not request.xtream_password:
            raise HTTPException(
                status_code=400,
                detail="Xtream türü için kullanıcı adı ve şifre gerekli"
            )
    
    now = datetime.now(timezone.utc).isoformat()
    playlist_id = str(uuid.uuid4())
    
    # First playlist is automatically active
    is_first = playlist_count == 0
    
    playlist_doc = {
        "id": playlist_id,
        "device_id": device_id,
        "playlist_name": request.playlist_name,
        "playlist_url": request.playlist_url,
        "playlist_type": request.playlist_type,
        "xtream_username": request.xtream_username if request.playlist_type == "xtream" else None,
        "xtream_password": request.xtream_password if request.playlist_type == "xtream" else None,
        "is_active": is_first,
        "created_at": now
    }
    
    await db.playlists.insert_one(playlist_doc)
    
    # Update device status to active if first playlist
    if is_first:
        await db.devices.update_one(
            {"device_id": device_id},
            {"$set": {"status": "active"}}
        )
    
    logger.info(f"Playlist added to device {device_id}: {request.playlist_name}")
    
    # Don't return password in response
    del playlist_doc["_id"]
    if playlist_doc.get("xtream_password"):
        playlist_doc["xtream_password"] = "***"
    
    return {
        "success": True,
        "message": "Playlist eklendi",
        "playlist": playlist_doc
    }


@api_router.put("/device/{device_id}/playlist/{playlist_id}")
async def update_playlist(device_id: str, playlist_id: str, request: PlaylistUpdateRequest):
    """Update a playlist"""
    # Check playlist exists
    playlist = await db.playlists.find_one(
        {"id": playlist_id, "device_id": device_id},
        {"_id": 0}
    )
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist bulunamadı")
    
    # Build update document
    update_doc = {}
    if request.playlist_name is not None:
        update_doc["playlist_name"] = request.playlist_name
    if request.playlist_url is not None:
        update_doc["playlist_url"] = request.playlist_url
    if request.playlist_type is not None:
        update_doc["playlist_type"] = request.playlist_type
    if request.xtream_username is not None:
        update_doc["xtream_username"] = request.xtream_username
    if request.xtream_password is not None:
        update_doc["xtream_password"] = request.xtream_password
    
    if not update_doc:
        raise HTTPException(status_code=400, detail="Güncellenecek alan belirtilmedi")
    
    await db.playlists.update_one(
        {"id": playlist_id, "device_id": device_id},
        {"$set": update_doc}
    )
    
    logger.info(f"Playlist updated: {playlist_id}")
    
    return {
        "success": True,
        "message": "Playlist güncellendi"
    }


@api_router.delete("/device/{device_id}/playlist/{playlist_id}")
async def delete_playlist(device_id: str, playlist_id: str):
    """Delete a playlist"""
    # Check playlist exists
    playlist = await db.playlists.find_one(
        {"id": playlist_id, "device_id": device_id},
        {"_id": 0}
    )
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist bulunamadı")
    
    was_active = playlist.get("is_active", False)
    
    # Delete playlist
    await db.playlists.delete_one({"id": playlist_id, "device_id": device_id})
    
    # If deleted playlist was active, make another one active
    if was_active:
        remaining = await db.playlists.find_one({"device_id": device_id}, {"_id": 0})
        if remaining:
            await db.playlists.update_one(
                {"id": remaining["id"]},
                {"$set": {"is_active": True}}
            )
        else:
            # No playlists left, update device status
            await db.devices.update_one(
                {"device_id": device_id},
                {"$set": {"status": "registered"}}
            )
    
    logger.info(f"Playlist deleted: {playlist_id}")
    
    return {
        "success": True,
        "message": "Playlist silindi"
    }


@api_router.put("/device/{device_id}/playlist/{playlist_id}/active")
async def set_active_playlist(device_id: str, playlist_id: str):
    """Set a playlist as active"""
    # Check playlist exists
    playlist = await db.playlists.find_one(
        {"id": playlist_id, "device_id": device_id},
        {"_id": 0}
    )
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist bulunamadı")
    
    # Deactivate all playlists for this device
    await db.playlists.update_many(
        {"device_id": device_id},
        {"$set": {"is_active": False}}
    )
    
    # Activate the selected playlist
    await db.playlists.update_one(
        {"id": playlist_id, "device_id": device_id},
        {"$set": {"is_active": True}}
    )
    
    logger.info(f"Active playlist changed for device {device_id}: {playlist_id}")
    
    return {
        "success": True,
        "message": "Aktif playlist değiştirildi",
        "active_playlist_id": playlist_id
    }

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