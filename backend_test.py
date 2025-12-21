#!/usr/bin/env python3
"""
Backend API Tests for IPPL4Y Platform
Tests the health check and logo management endpoints as specified in the review request.
"""

import requests
import json
import time
import io
from PIL import Image
from typing import Dict, Any

# Get backend URL from frontend .env
BACKEND_URL = "https://ipplay-stream.preview.emergentagent.com/api"

def test_post_health_check():
    """Test POST /api/health-check endpoint with multiple URLs"""
    print("\n=== Testing POST /api/health-check ===")
    
    # Test URLs as specified in the review request
    test_urls = [
        "https://google.com",
        "https://httpbin.org/status/200", 
        "http://invalid-url-test.xyz"
    ]
    
    payload = {"urls": test_urls}
    
    try:
        print(f"Sending POST request to: {BACKEND_URL}/health-check")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f"{BACKEND_URL}/health-check",
            json=payload,
            timeout=30
        )
        
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['results', 'total', 'online', 'offline', 'slow']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            # Validate results array
            if not isinstance(data['results'], list):
                print("❌ FAIL: 'results' should be a list")
                return False
            
            if len(data['results']) != len(test_urls):
                print(f"❌ FAIL: Expected {len(test_urls)} results, got {len(data['results'])}")
                return False
            
            # Validate each result
            for i, result in enumerate(data['results']):
                required_result_fields = ['url', 'status', 'response_time_ms', 'checked_at']
                missing_result_fields = [field for field in required_result_fields if field not in result]
                
                if missing_result_fields:
                    print(f"❌ FAIL: Result {i} missing fields: {missing_result_fields}")
                    return False
                
                if result['url'] not in test_urls:
                    print(f"❌ FAIL: Unexpected URL in result: {result['url']}")
                    return False
                
                if result['status'] not in ['online', 'offline', 'slow']:
                    print(f"❌ FAIL: Invalid status '{result['status']}' for URL {result['url']}")
                    return False
                
                print(f"✅ URL: {result['url']} - Status: {result['status']} - Response Time: {result['response_time_ms']}ms")
            
            # Validate counts
            actual_online = sum(1 for r in data['results'] if r['status'] == 'online')
            actual_offline = sum(1 for r in data['results'] if r['status'] == 'offline')
            actual_slow = sum(1 for r in data['results'] if r['status'] == 'slow')
            
            if data['online'] != actual_online:
                print(f"❌ FAIL: Online count mismatch. Expected: {actual_online}, Got: {data['online']}")
                return False
            
            if data['offline'] != actual_offline:
                print(f"❌ FAIL: Offline count mismatch. Expected: {actual_offline}, Got: {data['offline']}")
                return False
            
            if data['slow'] != actual_slow:
                print(f"❌ FAIL: Slow count mismatch. Expected: {actual_slow}, Got: {data['slow']}")
                return False
            
            if data['total'] != len(data['results']):
                print(f"❌ FAIL: Total count mismatch. Expected: {len(data['results'])}, Got: {data['total']}")
                return False
            
            print("✅ POST /api/health-check - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ FAIL: Request failed - {str(e)}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ FAIL: Invalid JSON response - {str(e)}")
        return False
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_get_single_health_check():
    """Test GET /api/health-check/single endpoint"""
    print("\n=== Testing GET /api/health-check/single ===")
    
    test_url = "https://google.com"
    
    try:
        print(f"Sending GET request to: {BACKEND_URL}/health-check/single?url={test_url}")
        
        response = requests.get(
            f"{BACKEND_URL}/health-check/single",
            params={"url": test_url},
            timeout=30
        )
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['url', 'status', 'response_time_ms', 'checked_at']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            if data['url'] != test_url:
                print(f"❌ FAIL: URL mismatch. Expected: {test_url}, Got: {data['url']}")
                return False
            
            if data['status'] not in ['online', 'offline', 'slow']:
                print(f"❌ FAIL: Invalid status: {data['status']}")
                return False
            
            if not isinstance(data['response_time_ms'], int):
                print(f"❌ FAIL: response_time_ms should be integer, got: {type(data['response_time_ms'])}")
                return False
            
            print(f"✅ URL: {data['url']} - Status: {data['status']} - Response Time: {data['response_time_ms']}ms")
            print("✅ GET /api/health-check/single - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ FAIL: Request failed - {str(e)}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ FAIL: Invalid JSON response - {str(e)}")
        return False
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_invalid_url_handling():
    """Test how the API handles invalid URLs"""
    print("\n=== Testing Invalid URL Handling ===")
    
    invalid_test_url = "not-a-valid-url"
    
    try:
        print(f"Testing single endpoint with invalid URL: {invalid_test_url}")
        
        response = requests.get(
            f"{BACKEND_URL}/health-check/single",
            params={"url": invalid_test_url},
            timeout=30
        )
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            if data['status'] != 'offline':
                print(f"❌ FAIL: Invalid URL should return 'offline' status, got: {data['status']}")
                return False
            
            if 'error' not in data or not data['error']:
                print("❌ FAIL: Invalid URL should include error message")
                return False
            
            print("✅ Invalid URL handling - Correctly marked as offline with error message")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def create_test_png_image() -> bytes:
    """Create a small test PNG image for logo upload testing"""
    # Create a simple 100x100 red square PNG image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes.getvalue()


def test_logo_get_initial():
    """Test GET /api/admin/logo - should initially show no custom logo"""
    print("\n=== Testing GET /api/admin/logo (Initial State) ===")
    
    try:
        print(f"Sending GET request to: {BACKEND_URL}/admin/logo")
        
        response = requests.get(f"{BACKEND_URL}/admin/logo", timeout=30)
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['has_custom_logo', 'logo_url', 'uploaded_at']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            # Initially should have no custom logo
            if data['has_custom_logo'] is not False:
                print(f"❌ FAIL: Expected has_custom_logo to be false initially, got: {data['has_custom_logo']}")
                return False
            
            if data['logo_url'] is not None:
                print(f"❌ FAIL: Expected logo_url to be null initially, got: {data['logo_url']}")
                return False
            
            if data['uploaded_at'] is not None:
                print(f"❌ FAIL: Expected uploaded_at to be null initially, got: {data['uploaded_at']}")
                return False
            
            print("✅ GET /api/admin/logo (Initial) - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_logo_upload():
    """Test POST /api/admin/logo - upload a logo"""
    print("\n=== Testing POST /api/admin/logo (Upload Logo) ===")
    
    try:
        # Create test PNG image
        png_data = create_test_png_image()
        
        print(f"Sending POST request to: {BACKEND_URL}/admin/logo")
        print(f"Uploading PNG image of size: {len(png_data)} bytes")
        
        files = {
            'file': ('test_logo.png', png_data, 'image/png')
        }
        
        response = requests.post(f"{BACKEND_URL}/admin/logo", files=files, timeout=30)
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['success', 'message', 'logo_url']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            if data['success'] is not True:
                print(f"❌ FAIL: Expected success to be true, got: {data['success']}")
                return False
            
            if not isinstance(data['message'], str) or not data['message']:
                print(f"❌ FAIL: Expected non-empty message string, got: {data['message']}")
                return False
            
            if data['logo_url'] != '/api/admin/logo/file':
                print(f"❌ FAIL: Expected logo_url to be '/api/admin/logo/file', got: {data['logo_url']}")
                return False
            
            print("✅ POST /api/admin/logo (Upload) - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_logo_get_after_upload():
    """Test GET /api/admin/logo - should show custom logo after upload"""
    print("\n=== Testing GET /api/admin/logo (After Upload) ===")
    
    try:
        print(f"Sending GET request to: {BACKEND_URL}/admin/logo")
        
        response = requests.get(f"{BACKEND_URL}/admin/logo", timeout=30)
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['has_custom_logo', 'logo_url', 'uploaded_at']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            # Should now have custom logo
            if data['has_custom_logo'] is not True:
                print(f"❌ FAIL: Expected has_custom_logo to be true after upload, got: {data['has_custom_logo']}")
                return False
            
            if data['logo_url'] != '/api/admin/logo/file':
                print(f"❌ FAIL: Expected logo_url to be '/api/admin/logo/file', got: {data['logo_url']}")
                return False
            
            if not isinstance(data['uploaded_at'], str) or not data['uploaded_at']:
                print(f"❌ FAIL: Expected uploaded_at to be non-empty string, got: {data['uploaded_at']}")
                return False
            
            print("✅ GET /api/admin/logo (After Upload) - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_logo_file_download():
    """Test GET /api/admin/logo/file - should return the logo file"""
    print("\n=== Testing GET /api/admin/logo/file (Download Logo) ===")
    
    try:
        print(f"Sending GET request to: {BACKEND_URL}/admin/logo/file")
        
        response = requests.get(f"{BACKEND_URL}/admin/logo/file", timeout=30)
        
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            # Check content type
            content_type = response.headers.get('content-type', '')
            if not content_type.startswith('image/'):
                print(f"❌ FAIL: Expected image content type, got: {content_type}")
                return False
            
            # Check content length
            content_length = len(response.content)
            if content_length == 0:
                print("❌ FAIL: Logo file is empty")
                return False
            
            print(f"✅ Logo file downloaded successfully - Size: {content_length} bytes, Type: {content_type}")
            print("✅ GET /api/admin/logo/file - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_logo_delete():
    """Test DELETE /api/admin/logo - delete the logo"""
    print("\n=== Testing DELETE /api/admin/logo (Delete Logo) ===")
    
    try:
        print(f"Sending DELETE request to: {BACKEND_URL}/admin/logo")
        
        response = requests.delete(f"{BACKEND_URL}/admin/logo", timeout=30)
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['success', 'message']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            if data['success'] is not True:
                print(f"❌ FAIL: Expected success to be true, got: {data['success']}")
                return False
            
            if not isinstance(data['message'], str) or not data['message']:
                print(f"❌ FAIL: Expected non-empty message string, got: {data['message']}")
                return False
            
            print("✅ DELETE /api/admin/logo - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_logo_get_after_delete():
    """Test GET /api/admin/logo - should show no custom logo after delete"""
    print("\n=== Testing GET /api/admin/logo (After Delete) ===")
    
    try:
        print(f"Sending GET request to: {BACKEND_URL}/admin/logo")
        
        response = requests.get(f"{BACKEND_URL}/admin/logo", timeout=30)
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['has_custom_logo', 'logo_url', 'uploaded_at']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            # Should now have no custom logo again
            if data['has_custom_logo'] is not False:
                print(f"❌ FAIL: Expected has_custom_logo to be false after delete, got: {data['has_custom_logo']}")
                return False
            
            if data['logo_url'] is not None:
                print(f"❌ FAIL: Expected logo_url to be null after delete, got: {data['logo_url']}")
                return False
            
            if data['uploaded_at'] is not None:
                print(f"❌ FAIL: Expected uploaded_at to be null after delete, got: {data['uploaded_at']}")
                return False
            
            print("✅ GET /api/admin/logo (After Delete) - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_logo_file_404_after_delete():
    """Test GET /api/admin/logo/file - should return 404 after delete"""
    print("\n=== Testing GET /api/admin/logo/file (404 After Delete) ===")
    
    try:
        print(f"Sending GET request to: {BACKEND_URL}/admin/logo/file")
        
        response = requests.get(f"{BACKEND_URL}/admin/logo/file", timeout=30)
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print("✅ GET /api/admin/logo/file correctly returns 404 after logo deletion")
            return True
        else:
            print(f"❌ FAIL: Expected 404 status code, got: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_logo_upload_invalid_format():
    """Test POST /api/admin/logo with invalid file format"""
    print("\n=== Testing POST /api/admin/logo (Invalid Format) ===")
    
    try:
        # Create a text file instead of image
        text_data = b"This is not an image file"
        
        print(f"Sending POST request to: {BACKEND_URL}/admin/logo")
        print("Uploading invalid file format (.txt)")
        
        files = {
            'file': ('test_file.txt', text_data, 'text/plain')
        }
        
        response = requests.post(f"{BACKEND_URL}/admin/logo", files=files, timeout=30)
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            if 'detail' in data and 'Desteklenmeyen dosya formatı' in data['detail']:
                print("✅ Invalid format correctly rejected with proper error message")
                return True
            else:
                print(f"❌ FAIL: Expected proper error message, got: {data}")
                return False
        else:
            print(f"❌ FAIL: Expected 400 status code for invalid format, got: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_logo_upload_large_file():
    """Test POST /api/admin/logo with file size > 2MB"""
    print("\n=== Testing POST /api/admin/logo (Large File) ===")
    
    try:
        # Create a large file (3MB)
        large_data = b"x" * (3 * 1024 * 1024)  # 3MB
        
        print(f"Sending POST request to: {BACKEND_URL}/admin/logo")
        print(f"Uploading large file of size: {len(large_data)} bytes (3MB)")
        
        files = {
            'file': ('large_logo.png', large_data, 'image/png')
        }
        
        response = requests.post(f"{BACKEND_URL}/admin/logo", files=files, timeout=30)
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            if 'detail' in data and 'Dosya boyutu çok büyük' in data['detail']:
                print("✅ Large file correctly rejected with proper error message")
                return True
            else:
                print(f"❌ FAIL: Expected proper error message, got: {data}")
                return False
        else:
            print(f"❌ FAIL: Expected 400 status code for large file, got: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def run_logo_management_tests():
    """Run all logo management tests in sequence"""
    print("\n🎨 Starting Logo Management API Tests")
    print("="*60)
    
    logo_results = []
    
    # Test complete logo management flow
    logo_results.append(("GET /api/admin/logo (Initial)", test_logo_get_initial()))
    logo_results.append(("POST /api/admin/logo (Upload)", test_logo_upload()))
    logo_results.append(("GET /api/admin/logo (After Upload)", test_logo_get_after_upload()))
    logo_results.append(("GET /api/admin/logo/file (Download)", test_logo_file_download()))
    logo_results.append(("DELETE /api/admin/logo (Delete)", test_logo_delete()))
    logo_results.append(("GET /api/admin/logo (After Delete)", test_logo_get_after_delete()))
    logo_results.append(("GET /api/admin/logo/file (404 After Delete)", test_logo_file_404_after_delete()))
    
    # Test error conditions
    logo_results.append(("POST /api/admin/logo (Invalid Format)", test_logo_upload_invalid_format()))
    logo_results.append(("POST /api/admin/logo (Large File)", test_logo_upload_large_file()))
    
    return logo_results


# ==================== DEVICE & PLAYLIST MANAGEMENT TESTS ====================

# Test device credentials as specified in review request
TEST_DEVICE_ID = "11:30:02:28:02:bb"
TEST_DEVICE_KEY = "1323008583"

def test_device_register():
    """Test POST /api/device/register - Device registration"""
    print("\n=== Testing POST /api/device/register ===")
    
    payload = {
        "device_id": TEST_DEVICE_ID,
        "device_key": TEST_DEVICE_KEY,
        "platform": "android_tv"
    }
    
    try:
        print(f"Sending POST request to: {BACKEND_URL}/device/register")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f"{BACKEND_URL}/device/register",
            json=payload,
            timeout=30
        )
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['success', 'message', 'device']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            if data['success'] is not True:
                print(f"❌ FAIL: Expected success to be true, got: {data['success']}")
                return False
            
            # Validate device object
            device = data['device']
            device_required_fields = ['device_id', 'device_key', 'platform', 'status', 'created_at', 'last_seen_at']
            missing_device_fields = [field for field in device_required_fields if field not in device]
            
            if missing_device_fields:
                print(f"❌ FAIL: Missing device fields: {missing_device_fields}")
                return False
            
            if device['device_id'] != TEST_DEVICE_ID:
                print(f"❌ FAIL: Device ID mismatch. Expected: {TEST_DEVICE_ID}, Got: {device['device_id']}")
                return False
            
            if device['device_key'] != TEST_DEVICE_KEY:
                print(f"❌ FAIL: Device Key mismatch. Expected: {TEST_DEVICE_KEY}, Got: {device['device_key']}")
                return False
            
            print("✅ POST /api/device/register - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_device_validate():
    """Test POST /api/device/validate - Device validation"""
    print("\n=== Testing POST /api/device/validate ===")
    
    payload = {
        "device_id": TEST_DEVICE_ID,
        "device_key": TEST_DEVICE_KEY
    }
    
    try:
        print(f"Sending POST request to: {BACKEND_URL}/device/validate")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f"{BACKEND_URL}/device/validate",
            json=payload,
            timeout=30
        )
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['valid', 'message']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            if data['valid'] is not True:
                print(f"❌ FAIL: Expected valid to be true, got: {data['valid']}")
                return False
            
            print("✅ POST /api/device/validate - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_device_validate_invalid_format():
    """Test device validation with invalid formats"""
    print("\n=== Testing Device Validation - Invalid Formats ===")
    
    # Test invalid device_id format (not MAC format)
    invalid_device_payload = {
        "device_id": "invalid-device-id",
        "device_key": TEST_DEVICE_KEY
    }
    
    try:
        print("Testing invalid device_id format...")
        response = requests.post(
            f"{BACKEND_URL}/device/validate",
            json=invalid_device_payload,
            timeout=30
        )
        
        if response.status_code == 400:
            print("✅ Invalid device_id format correctly rejected")
        else:
            print(f"❌ FAIL: Expected 400 for invalid device_id, got: {response.status_code}")
            return False
        
        # Test invalid device_key format (non-numeric)
        invalid_key_payload = {
            "device_id": TEST_DEVICE_ID,
            "device_key": "invalid-key"
        }
        
        print("Testing invalid device_key format...")
        response = requests.post(
            f"{BACKEND_URL}/device/validate",
            json=invalid_key_payload,
            timeout=30
        )
        
        if response.status_code == 400:
            print("✅ Invalid device_key format correctly rejected")
            return True
        else:
            print(f"❌ FAIL: Expected 400 for invalid device_key, got: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_playlist_add_m3u():
    """Test POST /api/device/{device_id}/playlist - Add M3U playlist"""
    print("\n=== Testing POST /api/device/{device_id}/playlist (M3U) ===")
    
    payload = {
        "playlist_name": "Test M3U Playlist",
        "playlist_url": "http://test.com/playlist.m3u",
        "playlist_type": "m3u"
    }
    
    try:
        print(f"Sending POST request to: {BACKEND_URL}/device/{TEST_DEVICE_ID}/playlist")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlist",
            json=payload,
            timeout=30
        )
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['success', 'message', 'playlist']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            if data['success'] is not True:
                print(f"❌ FAIL: Expected success to be true, got: {data['success']}")
                return False
            
            # Validate playlist object
            playlist = data['playlist']
            playlist_required_fields = ['id', 'device_id', 'playlist_name', 'playlist_url', 'playlist_type', 'is_active', 'created_at']
            missing_playlist_fields = [field for field in playlist_required_fields if field not in playlist]
            
            if missing_playlist_fields:
                print(f"❌ FAIL: Missing playlist fields: {missing_playlist_fields}")
                return False
            
            if playlist['playlist_type'] != 'm3u':
                print(f"❌ FAIL: Expected playlist_type 'm3u', got: {playlist['playlist_type']}")
                return False
            
            # Store playlist ID for later tests
            global test_m3u_playlist_id
            test_m3u_playlist_id = playlist['id']
            
            print("✅ POST /api/device/{device_id}/playlist (M3U) - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_playlist_add_xtream():
    """Test POST /api/device/{device_id}/playlist - Add Xtream playlist"""
    print("\n=== Testing POST /api/device/{device_id}/playlist (Xtream) ===")
    
    payload = {
        "playlist_name": "Test Xtream Playlist",
        "playlist_url": "http://xtream.com:8080",
        "playlist_type": "xtream",
        "xtream_username": "testuser",
        "xtream_password": "testpass"
    }
    
    try:
        print(f"Sending POST request to: {BACKEND_URL}/device/{TEST_DEVICE_ID}/playlist")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlist",
            json=payload,
            timeout=30
        )
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['success', 'message', 'playlist']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            if data['success'] is not True:
                print(f"❌ FAIL: Expected success to be true, got: {data['success']}")
                return False
            
            # Validate playlist object
            playlist = data['playlist']
            if playlist['playlist_type'] != 'xtream':
                print(f"❌ FAIL: Expected playlist_type 'xtream', got: {playlist['playlist_type']}")
                return False
            
            # Password should be masked in response
            if playlist.get('xtream_password') != '***':
                print(f"❌ FAIL: Expected password to be masked, got: {playlist.get('xtream_password')}")
                return False
            
            # Store playlist ID for later tests
            global test_xtream_playlist_id
            test_xtream_playlist_id = playlist['id']
            
            print("✅ POST /api/device/{device_id}/playlist (Xtream) - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_playlist_add_xtream_missing_credentials():
    """Test Xtream playlist without required credentials"""
    print("\n=== Testing Xtream Playlist - Missing Credentials ===")
    
    payload = {
        "playlist_name": "Invalid Xtream",
        "playlist_url": "http://xtream.com:8080",
        "playlist_type": "xtream"
        # Missing xtream_username and xtream_password
    }
    
    try:
        print("Testing Xtream playlist without credentials...")
        response = requests.post(
            f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlist",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 400:
            data = response.json()
            if 'kullanıcı adı ve şifre gerekli' in data.get('detail', ''):
                print("✅ Xtream without credentials correctly rejected")
                return True
            else:
                print(f"❌ FAIL: Expected proper error message, got: {data}")
                return False
        else:
            print(f"❌ FAIL: Expected 400 for missing credentials, got: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_get_device_playlists():
    """Test GET /api/device/{device_id}/playlists"""
    print("\n=== Testing GET /api/device/{device_id}/playlists ===")
    
    try:
        print(f"Sending GET request to: {BACKEND_URL}/device/{TEST_DEVICE_ID}/playlists")
        
        response = requests.get(
            f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlists",
            timeout=30
        )
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['device_id', 'device_status', 'playlists', 'active_playlist']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            if data['device_id'] != TEST_DEVICE_ID:
                print(f"❌ FAIL: Device ID mismatch. Expected: {TEST_DEVICE_ID}, Got: {data['device_id']}")
                return False
            
            if not isinstance(data['playlists'], list):
                print(f"❌ FAIL: Expected playlists to be a list, got: {type(data['playlists'])}")
                return False
            
            # Should have at least 2 playlists (M3U and Xtream added earlier)
            if len(data['playlists']) < 2:
                print(f"❌ FAIL: Expected at least 2 playlists, got: {len(data['playlists'])}")
                return False
            
            # Should have an active playlist
            if data['active_playlist'] is None:
                print("❌ FAIL: Expected an active playlist, got None")
                return False
            
            print("✅ GET /api/device/{device_id}/playlists - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_set_active_playlist():
    """Test PUT /api/device/{device_id}/playlist/{playlist_id}/active"""
    print("\n=== Testing PUT /api/device/{device_id}/playlist/{playlist_id}/active ===")
    
    try:
        # Use the Xtream playlist ID from earlier test
        playlist_id = test_xtream_playlist_id
        print(f"Setting playlist {playlist_id} as active")
        
        response = requests.put(
            f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlist/{playlist_id}/active",
            timeout=30
        )
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['success', 'message', 'active_playlist_id']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            if data['success'] is not True:
                print(f"❌ FAIL: Expected success to be true, got: {data['success']}")
                return False
            
            if data['active_playlist_id'] != playlist_id:
                print(f"❌ FAIL: Active playlist ID mismatch. Expected: {playlist_id}, Got: {data['active_playlist_id']}")
                return False
            
            print("✅ PUT /api/device/{device_id}/playlist/{playlist_id}/active - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_delete_playlist():
    """Test DELETE /api/device/{device_id}/playlist/{playlist_id}"""
    print("\n=== Testing DELETE /api/device/{device_id}/playlist/{playlist_id} ===")
    
    try:
        # Delete the M3U playlist
        playlist_id = test_m3u_playlist_id
        print(f"Deleting playlist {playlist_id}")
        
        response = requests.delete(
            f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlist/{playlist_id}",
            timeout=30
        )
        
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['success', 'message']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ FAIL: Missing required fields: {missing_fields}")
                return False
            
            if data['success'] is not True:
                print(f"❌ FAIL: Expected success to be true, got: {data['success']}")
                return False
            
            print("✅ DELETE /api/device/{device_id}/playlist/{playlist_id} - All validations passed!")
            return True
            
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def test_playlist_limit():
    """Test maximum playlist limit (10 playlists per device)"""
    print("\n=== Testing Playlist Limit (Max 10) ===")
    
    try:
        # First, get current playlist count
        response = requests.get(f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlists", timeout=30)
        if response.status_code != 200:
            print("❌ FAIL: Could not get current playlists")
            return False
        
        current_count = len(response.json()['playlists'])
        print(f"Current playlist count: {current_count}")
        
        # Add playlists until we reach the limit
        playlists_to_add = 10 - current_count
        
        for i in range(playlists_to_add):
            payload = {
                "playlist_name": f"Test Playlist {i+1}",
                "playlist_url": f"http://test{i+1}.com/playlist.m3u",
                "playlist_type": "m3u"
            }
            
            response = requests.post(
                f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlist",
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                print(f"❌ FAIL: Could not add playlist {i+1}")
                return False
        
        # Now try to add one more (should fail)
        payload = {
            "playlist_name": "Exceeding Limit Playlist",
            "playlist_url": "http://exceed.com/playlist.m3u",
            "playlist_type": "m3u"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/device/{TEST_DEVICE_ID}/playlist",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 400:
            data = response.json()
            if 'Maksimum playlist sayısına ulaşıldı' in data.get('detail', ''):
                print("✅ Playlist limit correctly enforced")
                return True
            else:
                print(f"❌ FAIL: Expected proper limit error message, got: {data}")
                return False
        else:
            print(f"❌ FAIL: Expected 400 for exceeding limit, got: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False


def run_device_playlist_tests():
    """Run all device and playlist management tests"""
    print("\n📱 Starting Device & Playlist Management API Tests")
    print("="*60)
    
    device_results = []
    
    # Initialize global variables for playlist IDs
    global test_m3u_playlist_id, test_xtream_playlist_id
    test_m3u_playlist_id = None
    test_xtream_playlist_id = None
    
    # Device Management Tests
    device_results.append(("POST /api/device/register", test_device_register()))
    device_results.append(("POST /api/device/validate", test_device_validate()))
    device_results.append(("Device Validation - Invalid Formats", test_device_validate_invalid_format()))
    
    # Playlist Management Tests
    device_results.append(("POST /api/device/{device_id}/playlist (M3U)", test_playlist_add_m3u()))
    device_results.append(("POST /api/device/{device_id}/playlist (Xtream)", test_playlist_add_xtream()))
    device_results.append(("Xtream - Missing Credentials", test_playlist_add_xtream_missing_credentials()))
    device_results.append(("GET /api/device/{device_id}/playlists", test_get_device_playlists()))
    device_results.append(("PUT /api/device/{device_id}/playlist/{playlist_id}/active", test_set_active_playlist()))
    device_results.append(("DELETE /api/device/{device_id}/playlist/{playlist_id}", test_delete_playlist()))
    device_results.append(("Playlist Limit Test (Max 10)", test_playlist_limit()))
    
    return device_results


def run_health_check_tests():
    """Run all health check tests"""
    print("\n🏥 Starting Health Check API Tests")
    print("="*60)
    
    health_results = []
    
    # Test health check endpoints
    health_results.append(("POST /api/health-check", test_post_health_check()))
    health_results.append(("GET /api/health-check/single", test_get_single_health_check()))
    health_results.append(("Invalid URL Handling", test_invalid_url_handling()))
    
    return health_results


def main():
    """Run all backend API tests"""
    print("🚀 Starting IPPL4Y Platform Backend API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    
    all_results = []
    
    # Run Logo Management Tests (Primary focus based on test_result.md)
    logo_results = run_logo_management_tests()
    all_results.extend(logo_results)
    
    # Run Health Check Tests (Already tested but included for completeness)
    health_results = run_health_check_tests()
    all_results.extend(health_results)
    
    # Summary
    print("\n" + "="*80)
    print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
    print("="*80)
    
    passed = 0
    failed = 0
    
    print("\n🎨 LOGO MANAGEMENT API RESULTS:")
    for test_name, result in logo_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} - {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print("\n🏥 HEALTH CHECK API RESULTS:")
    for test_name, result in health_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} - {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(all_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All backend API tests passed successfully!")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please check the issues above.")
        return False


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)