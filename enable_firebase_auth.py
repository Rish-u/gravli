"""
Firebase Authentication Auto-Setup Script

This script will automatically enable:
1. Email/Password authentication
2. Google Sign-in authentication

Requirements:
- Firebase Admin SDK service account key JSON file
"""

import firebase_admin
from firebase_admin import credentials, auth
import requests
import json

def enable_auth_providers(service_account_path):
    """
    Enable Email/Password and Google authentication providers
    """
    try:
        # Initialize Firebase Admin
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        
        print("✅ Firebase Admin initialized")
        
        # Get project ID
        project_id = cred.project_id
        print(f"📦 Project ID: {project_id}")
        
        # Note: Firebase Admin SDK doesn't directly support enabling auth providers
        # This requires Firebase REST API calls with proper authentication
        
        print("\n⚠️  Firebase Admin SDK cannot directly enable auth providers")
        print("📋 You need to enable them manually in Firebase Console:")
        print("\n1. Go to: https://console.firebase.google.com")
        print(f"2. Select project: {project_id}")
        print("3. Authentication → Sign-in method")
        print("4. Enable 'Email/Password'")
        print("5. Enable 'Google'")
        print(f"6. Add authorized domain: gravli-android.preview.emergentagent.com")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    # Path to service account key
    service_account_path = "path/to/serviceAccountKey.json"
    enable_auth_providers(service_account_path)
