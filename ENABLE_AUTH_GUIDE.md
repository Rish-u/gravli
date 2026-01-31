# 🔐 Complete Firebase Authentication Setup Guide

## Current Status
- ✅ **Demo Mode**: Working (uses Anonymous Auth)
- ⚠️ **Google Sign-in**: Code ready, needs Firebase Console setup
- ⚠️ **Email/Password**: Code ready, needs Firebase Console setup

---

## Step 1: Enable Email/Password Authentication

### 1.1 Go to Firebase Console
1. Open: https://console.firebase.google.com
2. Select your project: **gravli2466**

### 1.2 Enable Email/Password Provider
1. Click **"Authentication"** in the left sidebar
2. Go to **"Sign-in method"** tab
3. Find **"Email/Password"** in the providers list
4. Click on it to open settings
5. Toggle **"Enable"** to ON (first toggle)
6. **Leave "Email link (passwordless sign-in)" OFF** (second toggle)
7. Click **"Save"**

**Screenshot guidance**: You should see "Email/Password" with a green "Enabled" status after this.

---

## Step 2: Enable Google Sign-in

### 2.1 Enable Google Provider
1. Still in **Authentication > Sign-in method**
2. Find **"Google"** in the providers list
3. Click on it to open settings
4. Toggle **"Enable"** to ON
5. **Project support email**: Select your email from dropdown
6. Click **"Save"**

### 2.2 Add Authorized Domain (CRITICAL for Preview)
1. Go to **Authentication > Settings** tab
2. Scroll down to **"Authorized domains"** section
3. Click **"Add domain"** button
4. Enter: `gravli-android.preview.emergentagent.com`
5. Click **"Add"**

**Why this is needed**: Firebase blocks Google Sign-in from unauthorized domains for security. Adding your preview domain allows Google Sign-in to work.

---

## Step 3: Verify Setup

### 3.1 Check Email/Password
After enabling, try this:
1. Go to: https://gravli-android.preview.emergentagent.com
2. Click **"Continue with Email"**
3. Click **"Don't have an account? Sign Up"**
4. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
5. Click **"Create Account"**
6. Should see "Account created successfully!"

### 3.2 Check Google Sign-in
After adding domain:
1. Go to: https://gravli-android.preview.emergentagent.com
2. Click **"Sign in with Google"**
3. Should see Google account picker popup
4. Select your Google account
5. Should redirect to role selection screen

---

## Step 4: Visual Verification

### After Email/Password is enabled:
```
Authentication > Sign-in method
├── Email/Password: ✅ Enabled
├── Google: ⏸️ (enable in Step 2)
└── Anonymous: ✅ Enabled (auto-enabled)
```

### After Google Sign-in is enabled:
```
Authentication > Sign-in method
├── Email/Password: ✅ Enabled
├── Google: ✅ Enabled
└── Anonymous: ✅ Enabled

Authentication > Settings > Authorized domains
├── localhost (default)
├── gravli2466.firebaseapp.com (default)
└── gravli-android.preview.emergentagent.com ✅ (YOU ADDED THIS)
```

---

## Troubleshooting

### Google Sign-in Error: "Unauthorized domain"
**Problem**: Domain not added to authorized domains
**Solution**: 
1. Go to Authentication > Settings > Authorized domains
2. Make sure `gravli-android.preview.emergentagent.com` is in the list
3. Wait 1-2 minutes for Firebase to propagate changes
4. Clear browser cache and try again

### Email Sign-up Error: "Operation not allowed"
**Problem**: Email/Password not enabled
**Solution**: 
1. Go to Authentication > Sign-in method
2. Make sure Email/Password shows "Enabled" in green
3. Refresh your app and try again

### Google Sign-in Popup Closes Immediately
**Problem**: Pop-up blocker or incorrect domain
**Solution**:
1. Allow pop-ups for gravli-android.preview.emergentagent.com
2. Verify domain is correctly spelled in Firebase Console
3. Try in incognito/private browsing mode

---

## Quick Test Accounts

### Email/Password Test Accounts
Create these for testing:

**Student Account:**
- Email: student@gravli.test
- Password: student123
- Name: Alex Student

**Deliverer Account:**
- Email: deliverer@gravli.test  
- Password: deliver123
- Name: Sam Deliverer

**Admin Account:**
- Email: admin@gravli.test
- Password: admin123456
- Name: Admin User

---

## Code Verification

### ✅ All authentication code is already implemented:

1. **Firebase Config** (`/app/frontend/config/firebase.ts`)
   - Firebase initialization ✅
   - Auth instance ✅
   - Google provider ✅

2. **Login Screen** (`/app/frontend/app/index.tsx`)
   - Google Sign-in with popup ✅
   - Email/Password sign up ✅
   - Email/Password sign in ✅
   - Anonymous/Demo mode ✅
   - Error handling ✅
   - Form validation ✅

3. **Navigation Flow**
   - Auto-redirect after login ✅
   - Role selection ✅
   - Persistent sessions ✅

---

## After Setup Completion

Once you've completed Steps 1 & 2, all three authentication methods will work:

### 🟢 Demo Mode (Already Working)
- Instant access, no email needed
- Uses Firebase Anonymous Auth
- Full app functionality

### 🔵 Google Sign-in (After Setup)
- One-click authentication
- Uses Google account info
- Profile photo included

### 📧 Email/Password (After Setup)
- Create account with email
- Password must be 6+ characters
- Custom display name

---

## Security Notes

### Current Firestore Rules
Your Firestore security rules should allow authenticated users to access data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/gravli-android/public/data/deliveries/{deliveryId} {
      // Allow any authenticated user (including anonymous) to read
      allow read: if request.auth != null;
      
      // Allow any authenticated user to create
      allow create: if request.auth != null;
      
      // Allow authenticated user to update if they're requester or deliverer
      allow update: if request.auth != null && 
        (resource.data.requesterId == request.auth.uid || 
         resource.data.delivererId == request.auth.uid);
      
      // Allow only requester to delete their own orders
      allow delete: if request.auth != null && 
        resource.data.requesterId == request.auth.uid;
    }
  }
}
```

These rules work for:
- ✅ Anonymous users (Demo Mode)
- ✅ Email/Password users
- ✅ Google Sign-in users

---

## Need Help?

### Common Issues:

1. **"Failed to sign in"**
   - Check Firebase Console is accessible
   - Verify project ID is correct: gravli2466
   - Make sure authentication methods are enabled

2. **Google popup blocked**
   - Allow popups for your domain
   - Try different browser
   - Use incognito mode

3. **Email already exists**
   - Email is already registered
   - Use "Sign In" instead of "Sign Up"
   - Or use different email

---

## Summary Checklist

Before testing, make sure:
- ☐ Email/Password enabled in Firebase Console
- ☐ Google Sign-in enabled in Firebase Console  
- ☐ Preview domain added to authorized domains
- ☐ Waited 1-2 minutes after changes
- ☐ Cleared browser cache
- ☐ Pop-ups allowed for preview domain

After completing all steps, **all three authentication methods** will work perfectly! 🎉

---

**Project**: Gravli Campus Delivery  
**Firebase Project**: gravli2466  
**Preview URL**: https://gravli-android.preview.emergentagent.com  
**Last Updated**: January 2025
