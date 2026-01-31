# 🎯 Quick Setup: 5-Minute Firebase Authentication Guide

## What You'll Enable
- ✅ Email/Password Sign-in (for email registration)
- ✅ Google Sign-in (one-click with Google account)

## Before You Start
- **Firebase Project**: gravli2466
- **Preview Domain**: gravli-android.preview.emergentagent.com
- **Time Required**: 5 minutes

---

## Part 1: Enable Email/Password (2 minutes)

### Step-by-Step Clicks:

1. **Open Firebase Console**
   ```
   URL: https://console.firebase.google.com
   ```

2. **Select Your Project**
   ```
   Click on: "gravli2466"
   ```

3. **Go to Authentication**
   ```
   Left sidebar → Click "Authentication"
   ```

4. **Open Sign-in Methods**
   ```
   Top tabs → Click "Sign-in method"
   ```

5. **Enable Email/Password**
   ```
   Scroll to find: "Email/Password"
   Click on it
   Toggle ON the first switch (Email/Password)
   Leave second switch OFF (Email link)
   Click "Save"
   ```

### ✅ Success Check:
You should see **"Email/Password"** with a green **"Enabled"** badge

---

## Part 2: Enable Google Sign-in (3 minutes)

### Step 1: Enable Provider

1. **Stay in Sign-in method tab**
   ```
   (You're already here from Part 1)
   ```

2. **Enable Google**
   ```
   Scroll to find: "Google"
   Click on it
   Toggle ON "Enable"
   Select your email from "Project support email" dropdown
   Click "Save"
   ```

### ✅ Success Check:
You should see **"Google"** with a green **"Enabled"** badge

### Step 2: Add Preview Domain (CRITICAL!)

1. **Go to Settings Tab**
   ```
   At the top, click "Settings" tab
   (Next to "Sign-in method" tab)
   ```

2. **Scroll to Authorized Domains**
   ```
   Scroll down to "Authorized domains" section
   You'll see localhost and your Firebase domain already there
   ```

3. **Add Your Preview Domain**
   ```
   Click "Add domain" button
   Enter EXACTLY: gravli-android.preview.emergentagent.com
   Click "Add"
   ```

### ✅ Success Check:
You should see **3 domains** in the list:
- localhost
- gravli2466.firebaseapp.com  
- gravli-android.preview.emergentagent.com ← NEW!

---

## Part 3: Test Everything (2 minutes)

### Test 1: Email/Password Sign-up

1. Open: https://gravli-v2-mobile.preview.emergentagent.com
2. Click: **"Continue with Email"**
3. Click: **"Don't have an account? Sign Up"**
4. Fill in:
   - Name: `Test Student`
   - Email: `teststudent@gravli.app`
   - Password: `test123`
5. Click: **"Create Account"**
6. **Expected**: Success message → Choose role screen

### Test 2: Google Sign-in

1. Go back to: https://gravli-v2-mobile.preview.emergentagent.com
2. (If you just signed up, logout first)
3. Click: **"Sign in with Google"**
4. **Expected**: Google account picker popup
5. Select your Google account
6. **Expected**: Redirect to role selection

### Test 3: Demo Mode (Already Works)

1. Go to: https://gravli-v2-mobile.preview.emergentagent.com
2. Click: **"Try Demo Mode (No Setup Required)"**
3. Click: **"Start Demo"**
4. **Expected**: Works immediately (already functional)

---

## Troubleshooting

### Error: "Unauthorized domain"
**When**: Clicking "Sign in with Google"
**Fix**: 
- Make sure you added domain in Part 2, Step 2
- Domain must be exact: `gravli-android.preview.emergentagent.com`
- Wait 1-2 minutes for Firebase to update
- Clear browser cache and retry

### Error: "Operation not allowed"
**When**: Trying to sign up with email
**Fix**:
- Go back to Part 1, Step 5
- Make sure first toggle is ON (green)
- Click "Save" again
- Refresh your browser

### Google Popup Closes Immediately
**Fix**:
- Allow popups for gravli-android.preview.emergentagent.com
- Try in incognito mode
- Try different browser (Chrome recommended)

---

## What Happens After Setup

### All 3 Authentication Methods Work:

**1. Demo Mode** 🟢
- Already working
- No email needed
- Instant access

**2. Email/Password** 📧
- Sign up with any email
- Password 6+ characters
- Custom display name

**3. Google Sign-in** 🔵
- One click sign-in
- Uses Google profile
- Includes photo

---

## Quick Reference

### Firebase Console URLs:
- **Main Console**: https://console.firebase.google.com
- **Direct to Authentication**: https://console.firebase.google.com/u/0/project/gravli2466/authentication

### Your App URLs:
- **Preview**: https://gravli-v2-mobile.preview.emergentagent.com
- **Test Account**: teststudent@gravli.app / test123

### Key Settings:
- **Project ID**: gravli2466
- **Auth Domain**: gravli2466.firebaseapp.com
- **Preview Domain**: gravli-android.preview.emergentagent.com

---

## Final Checklist

After completing all steps, verify:

- ☐ Email/Password shows "Enabled" (green badge)
- ☐ Google shows "Enabled" (green badge)
- ☐ Preview domain appears in Authorized domains list
- ☐ Can sign up with email
- ☐ Can sign in with Google
- ☐ Demo mode still works

---

## Need Help?

If something doesn't work:
1. Double-check you're in the right Firebase project (gravli2466)
2. Make sure you clicked "Save" after each change
3. Wait 1-2 minutes for changes to propagate
4. Clear browser cache
5. Try in incognito/private browsing mode

---

**That's it!** Your authentication is now fully configured. All three sign-in methods will work perfectly! 🎉

**Ready to test**: https://gravli-v2-mobile.preview.emergentagent.com
