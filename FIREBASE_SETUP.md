# 🔧 Firebase Setup Instructions

## Enable Email/Password Authentication

To use email authentication in your Gravli app, you need to enable it in Firebase Console:

### Steps:

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `gravli2466`
3. **Navigate to Authentication**:
   - Click on "Authentication" in the left sidebar
   - Go to "Sign-in method" tab
4. **Enable Email/Password**:
   - Find "Email/Password" in the providers list
   - Click on it
   - Toggle "Enable" to ON
   - Click "Save"

### Add Authorized Domain (for Google Sign-in)

If you want Google Sign-in to work in the preview:

1. In Firebase Console → Authentication → Settings
2. Go to "Authorized domains"
3. Click "Add domain"
4. Add: `gravli-android.preview.emergentagent.com`
5. Click "Add"

---

## ✅ Authentication Methods Available

### 1. **Email/Password (Currently Working)**
   - Sign up with email and password
   - Sign in with existing credentials
   - Password must be at least 6 characters

### 2. **Google Sign-in (Requires Domain Authorization)**
   - Works after adding preview domain to Firebase
   - Provides instant login with Google account

---

## 🧪 Test Accounts

You can create test accounts using the email authentication:

**Example:**
- Email: `student@test.com`
- Password: `test123`

**Or create your own:**
- Any email format
- Minimum 6-character password
- Full name for profile

---

## 🔒 Security Rules

Current Firestore security rules allow authenticated users to:
- ✅ Read all delivery requests
- ✅ Create new delivery requests
- ✅ Update delivery requests they're involved in
- ✅ Delete their own delivery requests

---

## 📱 Testing the App

1. **Open preview**: https://gravli-v2-mobile.preview.emergentagent.com
2. **Click "Continue with Email"**
3. **Sign Up**:
   - Enter your name
   - Enter email
   - Enter password (min 6 chars)
   - Click "Create Account"
4. **Choose Role**: Student or Deliverer
5. **Start using the app!**

---

## 🐛 Troubleshooting

### "Email already in use"
- This email is already registered
- Click "Already have an account? Sign In" instead

### "Wrong password"
- Check your password
- Firebase requires minimum 6 characters

### "User not found"
- This email isn't registered yet
- Click "Don't have an account? Sign Up"

### Google Sign-in not working
- Add preview domain to Firebase authorized domains
- Or use Email/Password authentication instead

---

## 🚀 Ready to Go!

Your Gravli app now supports:
- ✅ Email/Password authentication
- ✅ Full user profiles
- ✅ Persistent sessions
- ✅ Role switching
- ✅ All delivery features

**No API keys needed from users - authentication is fully configured!**
