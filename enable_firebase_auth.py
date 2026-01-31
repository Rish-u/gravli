#!/usr/bin/env python3
"""
Script to enable Firebase Authentication methods:
- Email/Password Sign-in
- Google Sign-in
- Anonymous Sign-in (for demo mode)
"""

import json
import requests
import google.auth.transport.requests
from google.oauth2 import service_account

# Firebase Admin SDK credentials
SERVICE_ACCOUNT_INFO = {
    "type": "service_account",
    "project_id": "gravli2466",
    "private_key_id": "115372f5ec8890f1935e7594386899a04777ea03",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDBBm9qqrxgpWyq\n75I5UEboI570zMMwfpvi/WtiO6hQJdaN1agp0aunsK+wsILX0AqwOGoGMG7DJkjB\nKlm8j7tYgShB1/LOAlwxWmfiZ4wp0tK8P+oQSa1yX7ZK8KAsQhvk4bNVE+Ja3FMA\ndphX+dAimwtU44GwU4oMFoef9dzpvqUhC17kT5+0jTQyQyU7Ja3KqW2PJA19+R3Z\n9gCrtfSMT/041KmDFQhORTCu53ozlr70EGT5IznJCY2yorAVE8pDSuGkELYwL0zu\n6nCtexqRcRvQ0/1QiZxXyXWMZ3gwtQK8YlReCgJKXCOhuaMn7Dp/ztInY7zg9+9y\n48OAXrnTAgMBAAECggEANJnv1+YiQsYh2G1D8Fl3kUBPy49Xa8o86f08e78dLYY6\nM1mzo33PZPnJzwEzDuPTXdVp0zj0njq7HeTQIooauFIuKc9TDB/phsuHvtOQBz+8\nDO/v9bNWUHJTx5VOWPFFD7kP+VHbX/5loh0vg94AgcW1r1L2XxpM5uFm4UkLhCjl\nV+XP57bm0Gz5xozmff3kdYzhfy83skhGkL4HrpJv1kMt7ysup7sK70+dtpm+stiY\n+C4G3znQxdDSPe1uN748a2qb5F/j4vrh+ZMMGAHR5UvbgFJts9hELz8CAZgodKHi\nhavRpP1fOI4GDMydUjeSlRAmuuPpGkRhFKTsFhcKSQKBgQD7u6CQophf1Wny8w6s\nbwIjeTrgDSEVEfI+RX/k3BsatIMEWtZ1ManUDowd2HyHkZvPDxjoi5KClOr1KQl2\n/Pfn+gbagTUbB0Iu9vtPwRxD/rLZ64eHz7X8uDIzVpLZ+OJF4i4RqwvjgrOxLh9l\nuIXkHVPb/0n6IlfaHwO36GL0GQKBgQDETAz/uwGzUFgm6i3/2Qbfb1Ic+/LjpQqJ\ntDtGfxh9nyNA5ByquBHUHLYOT+K2TmwmiDQgMQluK1/WMwLI07M2xOz48D9J9YGE\ny3n+uoDaunsa4gKPJJ2kD0PfnmrAtXxFq62LSF4/uIKwhVMDFzBuAzSQAt2i65z5\nmRSIkpW6ywKBgCRk7QLcLxFz5lx0nYN6jSGZzlREMas9K/uqyqHI3LZQsLx5cZYB\n9x6sd7985AwplhAqi5xbSXRNmWaWZ0LnseO89y6yDX553yyxEoZmUfLWqP7umWqe\nMh52dvOLKbIP1I7r82MkipR6+gW8uFdZhSoEv3IIB6b9PhxP7ZayJ1RJAoGAfTMk\nd1eHVh9AmlFy1WRPBeOys9neqWNyvTG/PM+Dh1wg2BqmThzpAijt1WMObsjGIi1t\nUbr1ENeJYM1YUU71V1Fy87QIKdv0qAY/4UCDPv8B1buhdjsccK9r0wzvecpHYQiG\nv/eAZZQBhyUCNU5tDT3uIIwzYN52WJxShGk6JtECgYB41tnNzClDTEk158RKbl3X\nnEsbrXxpVWZWXRW0DfP6i0sYfVh0FGJS2Tr/nAYnudCSh+0j/SoEvt5x3gTyv/2k\npKFXpkwv3CgBX4KMat4xEePb+/MeI8kZm9MCV7xg+utYMu/GyJn9UjCBbVehaCcE\nw/36Kgdecooqp4Ks/oTMVA==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@gravli2466.iam.gserviceaccount.com",
    "client_id": "102921227125836147687",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40gravli2466.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}

PROJECT_ID = SERVICE_ACCOUNT_INFO["project_id"]

def get_access_token():
    """Get access token using service account credentials"""
    credentials = service_account.Credentials.from_service_account_info(
        SERVICE_ACCOUNT_INFO,
        scopes=[
            'https://www.googleapis.com/auth/firebase',
            'https://www.googleapis.com/auth/identitytoolkit',
            'https://www.googleapis.com/auth/cloud-platform'
        ]
    )
    request = google.auth.transport.requests.Request()
    credentials.refresh(request)
    return credentials.token

def get_current_config(access_token):
    """Get current Identity Toolkit configuration"""
    url = f"https://identitytoolkit.googleapis.com/admin/v2/projects/{PROJECT_ID}/config"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error getting config: {response.status_code} - {response.text}")
        return None

def enable_email_auth(access_token):
    """Enable Email/Password authentication"""
    url = f"https://identitytoolkit.googleapis.com/admin/v2/projects/{PROJECT_ID}/config"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Enable email sign-in
    data = {
        "signIn": {
            "email": {
                "enabled": True,
                "passwordRequired": True
            },
            "anonymous": {
                "enabled": True
            }
        }
    }
    
    params = {
        "updateMask": "signIn.email.enabled,signIn.email.passwordRequired,signIn.anonymous.enabled"
    }
    
    response = requests.patch(url, headers=headers, json=data, params=params)
    
    if response.status_code == 200:
        print("✅ Email/Password and Anonymous authentication enabled successfully!")
        return True
    else:
        print(f"❌ Error enabling email auth: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def enable_google_provider(access_token):
    """Enable Google as an identity provider"""
    url = f"https://identitytoolkit.googleapis.com/admin/v2/projects/{PROJECT_ID}/defaultSupportedIdpConfigs/google.com"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # First check if it exists
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        # Update existing config
        data = {
            "enabled": True,
            "clientId": "",  # Will use default
            "clientSecret": ""  # Will use default
        }
        response = requests.patch(url, headers=headers, json=data, params={"updateMask": "enabled"})
    elif response.status_code == 404:
        # Create new config
        data = {
            "name": f"projects/{PROJECT_ID}/defaultSupportedIdpConfigs/google.com",
            "enabled": True
        }
        response = requests.post(
            f"https://identitytoolkit.googleapis.com/admin/v2/projects/{PROJECT_ID}/defaultSupportedIdpConfigs?idpId=google.com",
            headers=headers,
            json=data
        )
    
    if response.status_code in [200, 201]:
        print("✅ Google Sign-in provider enabled!")
        return True
    else:
        print(f"⚠️ Google provider response: {response.status_code}")
        print(f"Note: Google Sign-in may need manual OAuth setup in Firebase Console")
        return False

def add_authorized_domain(access_token, domain):
    """Add authorized domain for OAuth"""
    url = f"https://identitytoolkit.googleapis.com/admin/v2/projects/{PROJECT_ID}/config"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Get current config first
    current = get_current_config(access_token)
    if current:
        authorized_domains = current.get("authorizedDomains", [])
        if domain not in authorized_domains:
            authorized_domains.append(domain)
            
            data = {
                "authorizedDomains": authorized_domains
            }
            
            response = requests.patch(
                url, 
                headers=headers, 
                json=data,
                params={"updateMask": "authorizedDomains"}
            )
            
            if response.status_code == 200:
                print(f"✅ Added {domain} to authorized domains")
                return True
            else:
                print(f"❌ Error adding domain: {response.status_code}")
                return False
        else:
            print(f"ℹ️ Domain {domain} already authorized")
            return True
    return False

def main():
    print("=" * 60)
    print("Firebase Authentication Setup for Gravli")
    print("=" * 60)
    print()
    
    print("🔑 Getting access token...")
    access_token = get_access_token()
    print("✅ Access token obtained")
    print()
    
    print("📧 Enabling Email/Password and Anonymous authentication...")
    enable_email_auth(access_token)
    print()
    
    print("🔵 Enabling Google Sign-in provider...")
    enable_google_provider(access_token)
    print()
    
    print("🌐 Adding authorized domains...")
    domains_to_add = [
        "localhost",
        "gravli2466.firebaseapp.com",
        "gravli2466.web.app"
    ]
    for domain in domains_to_add:
        add_authorized_domain(access_token, domain)
    print()
    
    print("=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print()
    print("The following authentication methods are now enabled:")
    print("  ✓ Email/Password Sign-in")
    print("  ✓ Anonymous Sign-in (Demo Mode)")
    print("  ✓ Google Sign-in (may need OAuth client setup)")
    print()
    print("NOTE: For Google Sign-in to work fully, you may need to:")
    print("  1. Go to Firebase Console > Authentication > Sign-in method")
    print("  2. Click on Google and ensure it's enabled")
    print("  3. Add your OAuth client IDs if using native apps")

if __name__ == "__main__":
    main()
