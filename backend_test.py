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