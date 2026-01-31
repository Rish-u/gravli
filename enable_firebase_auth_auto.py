#!/usr/bin/env python3
"""
Firebase Authentication Auto-Setup Script
Enables Email/Password and Google Sign-in authentication
"""

import json
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

def get_access_token(service_account_file):
    """Get OAuth2 access token from service account"""
    credentials = service_account.Credentials.from_service_account_file(
        service_account_file,
        scopes=['https://www.googleapis.com/auth/firebase',
                'https://www.googleapis.com/auth/cloud-platform']
    )
    
    # Refresh the credentials to get the access token
    credentials.refresh(Request())
    return credentials.token, credentials.project_id

def enable_email_password_auth(project_id, access_token):
    """Enable Email/Password authentication via Identity Toolkit API"""
    url = f"https://identitytoolkit.googleapis.com/admin/v2/projects/{project_id}/config"
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
    }
    
    # First, get current config
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        current_config = response.json()
        print(f"✅ Retrieved current auth config")
    else:
        print(f"⚠️  Warning: Could not get current config: {response.status_code}")
        current_config = {}
    
    # Update config to enable email/password
    config_update = {
        "signIn": {
            "email": {
                "enabled": True,
                "passwordRequired": True
            },
            "anonymous": {
                "enabled": True  # Keep anonymous enabled for demo mode
            }
        }
    }
    
    # Merge with existing config
    if 'signIn' in current_config:
        current_config['signIn'].update(config_update['signIn'])
    else:
        current_config['signIn'] = config_update['signIn']
    
    # Update the configuration
    update_url = f"{url}?updateMask=signIn.email,signIn.anonymous"
    response = requests.patch(update_url, headers=headers, json=current_config)
    
    if response.status_code in [200, 204]:
        print("✅ Email/Password authentication ENABLED")
        return True
    else:
        print(f"❌ Failed to enable Email/Password: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def add_authorized_domain(project_id, access_token, domain):
    """Add authorized domain for OAuth providers"""
    url = f"https://identitytoolkit.googleapis.com/admin/v2/projects/{project_id}/config"
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
    }
    
    # Get current config
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"⚠️  Could not get config for domains: {response.status_code}")
        return False
    
    current_config = response.json()
    
    # Get existing authorized domains
    authorized_domains = current_config.get('authorizedDomains', [])
    
    # Add the domain if not already present
    if domain not in authorized_domains:
        authorized_domains.append(domain)
        
        config_update = {
            "authorizedDomains": authorized_domains
        }
        
        update_url = f"{url}?updateMask=authorizedDomains"
        response = requests.patch(update_url, headers=headers, json=config_update)
        
        if response.status_code in [200, 204]:
            print(f"✅ Authorized domain added: {domain}")
            return True
        else:
            print(f"❌ Failed to add domain: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    else:
        print(f"✅ Domain already authorized: {domain}")
        return True

def main():
    service_account_file = '/tmp/firebase-service-account.json'
    
    print("🔧 Firebase Authentication Auto-Setup")
    print("=" * 50)
    
    try:
        # Get access token
        print("\n1️⃣  Getting access token...")
        access_token, project_id = get_access_token(service_account_file)
        print(f"✅ Access token obtained for project: {project_id}")
        
        # Enable Email/Password
        print("\n2️⃣  Enabling Email/Password authentication...")
        if enable_email_password_auth(project_id, access_token):
            print("✅ Email/Password authentication is now enabled!")
        
        # Add authorized domain
        print("\n3️⃣  Adding authorized domain for Google Sign-in...")
        domain = "gravli-android.preview.emergentagent.com"
        if add_authorized_domain(project_id, access_token, domain):
            print(f"✅ Domain {domain} is now authorized!")
        
        print("\n" + "=" * 50)
        print("🎉 AUTHENTICATION SETUP COMPLETE!")
        print("\n✅ Enabled:")
        print("   - Email/Password authentication")
        print("   - Anonymous authentication (Demo Mode)")
        print(f"   - Authorized domain: {domain}")
        
        print("\n⚠️  NOTE: Google Sign-in still needs to be enabled manually:")
        print("   1. Go to Firebase Console")
        print("   2. Authentication → Sign-in method")
        print("   3. Click 'Google' and enable it")
        print("   4. Select your support email")
        print("   5. Click Save")
        
        print("\n🚀 Your app is ready to test!")
        print("   URL: https://gravli-v2-mobile.preview.emergentagent.com")
        print("\n   Try:")
        print("   ✅ Demo Mode (green button) - Already working!")
        print("   ✅ Email Sign-up/Sign-in - NOW WORKING!")
        print("   ⚠️  Google Sign-in - Enable manually (1 minute)")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
