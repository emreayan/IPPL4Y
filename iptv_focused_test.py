#!/usr/bin/env python3
"""
Focused IPTV Tests for Review Request
Tests the specific IPTV functionality mentioned in the review request.
"""

import requests
import json
import time
from typing import Dict, Any

# Get backend URL from frontend .env
BACKEND_URL = "https://iptvplayer-4.preview.emergentagent.com/api"

# Test credentials from review request
TEST_DEVICE_ID = "11:30:02:28:02:bb"
TEST_DEVICE_KEY = "1323008583"
IPTV_SERVER_URL = "http://germanyservers1.net:8080"
IPTV_USERNAME = "jd4bD9OQ"
IPTV_PASSWORD = "tJn9FewD"

def test_stream_proxy_basic():
    """Test stream proxy with a basic HTTP stream"""
    print("\n=== Testing Stream Proxy (Basic) ===")
    
    # Use a simpler test stream URL
    test_stream_url = "http://germanyservers1.net:8080/live/jd4bD9OQ/tJn9FewD/37501.ts"
    
    try:
        print(f"Testing stream proxy with: {test_stream_url}")
        
        response = requests.get(
            f"{BACKEND_URL}/stream/proxy",
            params={"url": test_stream_url},
            timeout=15,
            stream=True
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'N/A')}")
        print(f"CORS Header: {response.headers.get('access-control-allow-origin', 'N/A')}")
        
        if response.status_code == 200:
            # Check if we get video content type
            content_type = response.headers.get('content-type', '')
            if 'video/mp2t' in content_type:
                print("✅ Stream proxy working - Correct content type")
                return True
            else:
                print(f"⚠️  Stream proxy working but unexpected content type: {content_type}")
                return True
        elif response.status_code == 502:
            print("❌ 502 Bad Gateway - Upstream server issue")
            return False
        elif response.status_code == 520:
            print("❌ 520 Error - Connection error")
            return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_image_proxy_basic():
    """Test image proxy with a basic HTTP image"""
    print("\n=== Testing Image Proxy (Basic) ===")
    
    # Use the test image URL from review request
    test_image_url = "http://resim.yayins.com/kanallar/tr.png"
    
    try:
        print(f"Testing image proxy with: {test_image_url}")
        
        response = requests.get(
            f"{BACKEND_URL}/image/proxy",
            params={"url": test_image_url},
            timeout=15
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'N/A')}")
        print(f"CORS Header: {response.headers.get('access-control-allow-origin', 'N/A')}")
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_length = len(response.content)
            
            print(f"Content Length: {content_length} bytes")
            
            if 'image/' in content_type and content_length > 0:
                print("✅ Image proxy working - Valid image received")
                return True
            else:
                print(f"⚠️  Image proxy responded but content may be invalid")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_device_registration():
    """Test device registration with review request credentials"""
    print("\n=== Testing Device Registration ===")
    
    payload = {
        "device_id": TEST_DEVICE_ID,
        "device_key": TEST_DEVICE_KEY,
        "platform": "web"
    }
    
    try:
        print(f"Registering device: {TEST_DEVICE_ID}")
        
        response = requests.post(
            f"{BACKEND_URL}/device/register",
            json=payload,
            timeout=30
        )
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Device registration successful")
                return True
            else:
                print(f"❌ Registration failed: {data}")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_playlist_addition():
    """Test adding IPTV playlist"""
    print("\n=== Testing Playlist Addition ===")
    
    payload = {
        "playlist_name": "Test IPTV",
        "playlist_url": IPTV_SERVER_URL,
        "playlist_type": "xtream",
        "xtream_username": IPTV_USERNAME,
        "xtream_password": IPTV_PASSWORD
    }
    
    try:
        print(f"Adding IPTV playlist: {payload['playlist_name']}")
        
        response = requests.post(
            f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlist",
            json=payload,
            timeout=30
        )
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                playlist_id = data['playlist']['id']
                print(f"✅ Playlist added successfully - ID: {playlist_id}")
                return playlist_id
            else:
                print(f"❌ Playlist addition failed: {data}")
                return None
        elif response.status_code == 400:
            data = response.json()
            if "Maksimum playlist sayısına ulaşıldı" in data.get('detail', ''):
                print("⚠️  Playlist limit reached - this is expected behavior")
                # Try to find an existing playlist to use for testing
                return get_existing_playlist_id()
            else:
                print(f"❌ HTTP 400: {data}")
                return None
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None


def get_existing_playlist_id():
    """Get an existing playlist ID for testing"""
    try:
        response = requests.get(f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlists", timeout=30)
        if response.status_code == 200:
            data = response.json()
            playlists = data.get('playlists', [])
            if playlists:
                return playlists[0]['id']
        return None
    except:
        return None


def test_playlist_parse(playlist_id):
    """Test parsing playlist"""
    print("\n=== Testing Playlist Parse ===")
    
    if not playlist_id:
        print("❌ No playlist ID available for testing")
        return False
    
    try:
        print(f"Parsing playlist: {playlist_id}")
        
        response = requests.post(
            f"{BACKEND_URL}/playlist/parse/{playlist_id}",
            timeout=120
        )
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                total_channels = data.get('total_channels', 0)
                print(f"✅ Playlist parsed - {total_channels} channels found")
                return True
            else:
                print(f"❌ Parse failed: {data.get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_channel_categories():
    """Test getting channel categories"""
    print("\n=== Testing Channel Categories ===")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/channels/categories",
            params={"device_id": TEST_DEVICE_ID},
            timeout=30
        )
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                categories = data.get('categories', [])
                print(f"✅ Categories retrieved - {len(categories)} categories found")
                return True
            else:
                print(f"⚠️  Categories not ready: {data.get('message', 'Unknown')}")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_channels_by_category():
    """Test getting channels by category"""
    print("\n=== Testing Channels by Category ===")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/channels/by-category",
            params={
                "device_id": TEST_DEVICE_ID,
                "category_id": "all"
            },
            timeout=30
        )
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                channels = data.get('channels', [])
                print(f"✅ Channels retrieved - {len(channels)} channels found")
                return True
            else:
                print(f"⚠️  Channels not ready: {data.get('message', 'Unknown')}")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def main():
    """Run focused IPTV tests"""
    print("🚀 Starting Focused IPTV Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print("="*60)
    
    results = []
    
    # Test core proxy functionality
    results.append(("Stream Proxy", test_stream_proxy_basic()))
    results.append(("Image Proxy", test_image_proxy_basic()))
    
    # Test device and playlist functionality
    results.append(("Device Registration", test_device_registration()))
    playlist_id = test_playlist_addition()
    results.append(("Playlist Addition", playlist_id is not None))
    
    # Test playlist parsing and channel retrieval
    results.append(("Playlist Parse", test_playlist_parse(playlist_id)))
    results.append(("Channel Categories", test_channel_categories()))
    results.append(("Channels by Category", test_channels_by_category()))
    
    # Summary
    print("\n" + "="*60)
    print("📊 FOCUSED IPTV TEST RESULTS")
    print("="*60)
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} - {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All focused IPTV tests passed!")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed.")
        return False


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)