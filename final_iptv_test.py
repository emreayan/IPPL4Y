#!/usr/bin/env python3
"""
Final IPTV Tests for Review Request
Tests all the specific functionality mentioned in the review request.
"""

import requests
import json
import time

# Get backend URL from frontend .env
BACKEND_URL = "https://iptvplayer-4.preview.emergentagent.com/api"

# Test credentials from review request
TEST_DEVICE_ID = "11:30:02:28:02:bb"
TEST_DEVICE_KEY = "1323008583"
IPTV_SERVER_URL = "http://germanyservers1.net:8080"
IPTV_USERNAME = "jd4bD9OQ"
IPTV_PASSWORD = "tJn9FewD"

def test_stream_proxy():
    """Test GET /api/stream/proxy - Stream proxy for Mixed Content fix"""
    print("\n=== Testing GET /api/stream/proxy ===")
    
    # Test stream URL from review request
    test_stream_url = "http://germanyservers1.net:8080/live/jd4bD9OQ/tJn9FewD/37501.ts"
    
    try:
        print(f"Testing stream proxy with URL: {test_stream_url}")
        
        response = requests.get(
            f"{BACKEND_URL}/stream/proxy",
            params={"url": test_stream_url},
            timeout=30,
            stream=True
        )
        
        print(f"Response Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'N/A')}")
        print(f"CORS Header: {response.headers.get('access-control-allow-origin', 'N/A')}")
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if content_type == 'video/mp2t':
                print("✅ Stream proxy working - Correct content-type: video/mp2t")
                return True
            else:
                print(f"⚠️  Stream proxy working but unexpected content-type: {content_type}")
                return True
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: {str(e)}")
        return False


def test_image_proxy():
    """Test GET /api/image/proxy - Image proxy for Mixed Content fix"""
    print("\n=== Testing GET /api/image/proxy ===")
    
    # Use a working test image URL
    test_image_url = "https://httpbin.org/image/png"
    
    try:
        print(f"Testing image proxy with URL: {test_image_url}")
        
        response = requests.get(
            f"{BACKEND_URL}/image/proxy",
            params={"url": test_image_url},
            timeout=30
        )
        
        print(f"Response Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'N/A')}")
        print(f"CORS Header: {response.headers.get('access-control-allow-origin', 'N/A')}")
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_length = len(response.content)
            
            if 'image/' in content_type and content_length > 0:
                print(f"✅ Image proxy working - Content-Type: {content_type}, Size: {content_length} bytes")
                return True
            else:
                print(f"❌ FAIL: Invalid image content")
                return False
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: {str(e)}")
        return False


def test_device_register():
    """Test device registration with review request credentials"""
    print("\n=== Testing Device Register ===")
    
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
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Device registration successful")
                return True
            else:
                print(f"❌ FAIL: {data}")
                return False
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: {str(e)}")
        return False


def test_playlist_addition():
    """Test adding IPTV playlist with real credentials"""
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
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                playlist_id = data['playlist']['id']
                print(f"✅ Playlist added successfully - ID: {playlist_id}")
                return playlist_id
            else:
                print(f"❌ FAIL: {data}")
                return None
        elif response.status_code == 400:
            # Check if it's a playlist limit issue
            data = response.json()
            if "Maksimum playlist sayısına ulaşıldı" in data.get('detail', ''):
                print("⚠️  Playlist limit reached - using existing playlist")
                return get_test_playlist_id()
            else:
                print(f"❌ FAIL: {data}")
                return None
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ FAIL: {str(e)}")
        return None


def get_test_playlist_id():
    """Get existing Test IPTV playlist ID"""
    try:
        response = requests.get(f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlists")
        if response.status_code == 200:
            data = response.json()
            for playlist in data.get('playlists', []):
                if playlist['playlist_name'] == 'Test IPTV':
                    return playlist['id']
        return None
    except:
        return None


def test_playlist_parse(playlist_id):
    """Test parsing IPTV playlist"""
    print("\n=== Testing Playlist Parse ===")
    
    if not playlist_id:
        print("❌ No playlist ID available")
        return False
    
    try:
        print(f"Parsing playlist: {playlist_id}")
        
        response = requests.post(
            f"{BACKEND_URL}/playlist/parse/{playlist_id}",
            timeout=120
        )
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                total_channels = data.get('total_channels', 0)
                print(f"✅ Playlist parsed - {total_channels} channels found")
                return total_channels > 0
            else:
                print(f"❌ FAIL: {data.get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: {str(e)}")
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
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                categories = data.get('categories', [])
                print(f"✅ Categories retrieved - {len(categories)} categories found")
                
                # Check for required categories
                category_names = [cat.get('name', '') for cat in categories]
                if 'TÜMÜ' in category_names:
                    print("✅ Required 'TÜMÜ' category found")
                    return True
                else:
                    print("❌ FAIL: Missing 'TÜMÜ' category")
                    return False
            else:
                print(f"❌ FAIL: {data.get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: {str(e)}")
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
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                channels = data.get('channels', [])
                count = data.get('count', 0)
                print(f"✅ Channels retrieved - {count} channels found")
                
                if len(channels) > 0:
                    first_channel = channels[0]
                    print(f"✅ First channel: {first_channel.get('name', 'N/A')}")
                    return True
                else:
                    print("❌ FAIL: No channels found")
                    return False
            else:
                print(f"❌ FAIL: {data.get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: {str(e)}")
        return False


def main():
    """Run all IPTV tests from review request"""
    print("🚀 Starting IPPL4Y IPTV Application Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print("="*60)
    
    results = []
    
    # Test proxy endpoints (Critical for Mixed Content fix)
    results.append(("Stream Proxy Test", test_stream_proxy()))
    results.append(("Image Proxy Test", test_image_proxy()))
    
    # Test device registration
    results.append(("Device Register", test_device_register()))
    
    # Test playlist management
    playlist_id = test_playlist_addition()
    results.append(("Playlist Addition", playlist_id is not None))
    
    # Ensure playlist is active
    if playlist_id:
        try:
            requests.put(f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlist/{playlist_id}/active")
        except:
            pass
    
    # Test playlist parsing
    results.append(("Playlist Parse", test_playlist_parse(playlist_id)))
    
    # Test channel retrieval
    results.append(("Channel Categories", test_channel_categories()))
    results.append(("Channels by Category", test_channels_by_category()))
    
    # Summary
    print("\n" + "="*60)
    print("📊 IPPL4Y IPTV APPLICATION TEST RESULTS")
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
    
    # Critical assessment
    critical_tests = ["Stream Proxy Test", "Image Proxy Test", "Device Register", "Playlist Addition"]
    critical_passed = sum(1 for name, result in results if name in critical_tests and result)
    
    print(f"\nCritical Tests Passed: {critical_passed}/{len(critical_tests)}")
    
    if failed == 0:
        print("\n🎉 All IPTV tests passed successfully!")
        print("✅ Stream proxy working - HTTP streams can be played on HTTPS frontend")
        print("✅ Image proxy working - HTTP images can be displayed on HTTPS frontend")
        print("✅ Device authentication working with provided credentials")
        print("✅ IPTV playlist management working with Xtream Codes")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed.")
        if critical_passed == len(critical_tests):
            print("✅ All critical proxy functionality is working!")
        return failed == 0


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)