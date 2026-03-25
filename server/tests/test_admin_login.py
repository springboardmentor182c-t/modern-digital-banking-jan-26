#!/usr/bin/env python3
"""
Test script to verify admin login functionality
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8080"

def test_admin_login():
    print("=== Testing Admin Login ===\n")
    
    email = "admin@smartbank.com"
    password = "Admin@123"
    
    payload = {
        "email": email,
        "password": password
    }
    
    print(f"Sending POST request to {BASE_URL}/admin/login")
    print(f"Payload: {json.dumps(payload, indent=2)}\n")
    
    try:
        response = requests.post(f"{BASE_URL}/admin/login", json=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}\n")
        
        if response.status_code == 200:
            print("✓ Admin login successful!")
            data = response.json()
            print(f"  Admin ID: {data.get('admin_id')}")
            print(f"  Role: {data.get('role')}")
        else:
            print("✗ Admin login failed!")
            print(f"  Error: {response.json().get('detail', 'Unknown error')}")
    
    except requests.exceptions.ConnectionError:
        print("✗ Error: Cannot connect to backend server")
        print("  Make sure the uvicorn server is running on port 8080")
        print("\n  To start the backend server, run:")
        print("  cd src/backend && uvicorn main:app --reload --port 8080")
    except Exception as e:
        print(f"✗ Error: {str(e)}")

if __name__ == "__main__":
    test_admin_login()
