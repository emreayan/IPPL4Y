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