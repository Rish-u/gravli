# Gravli - Campus Delivery App 🍔🚀

**Your on-campus delivery solution. Fast, easy, and by students, for students.**

An Android/iOS mobile application that connects students who need food deliveries with student deliverers on campus. Built with React Native (Expo), Firebase, and real-time updates.

---

## 📱 Features

### For Students (Orderers)
- **🏪 Browse 12 Campus Cafes**
  - Corner Cafe with full 72-item menu
  - 11 additional cafes (HR2-HR12)
- **🛒 Smart Shopping Cart**
  - Add/remove items
  - Real-time price calculation
  - Cart validation across cafes
- **📍 Location-Based Delivery**
  - Block selection (B1-B4, G1-G2, Library, Admin)
  - Room number input (3-digit validation)
- **💰 Transparent Pricing**
  - Item total + ₹50 delivery fee
  - Clear breakdown before checkout
- **📊 Real-Time Order Tracking**
  - Live status updates
  - ETA from deliverer
  - Three-stage tracking: Reached Cafe → Picked Up → Delivered
- **📜 Order History**
  - View all completed orders
  - Past delivery details

### For Deliverers
- **💼 Available Jobs Board**
  - See all open delivery requests
  - View earnings per delivery (₹50)
  - Accept jobs with one tap
- **🚴 Active Delivery Management**
  - Set estimated delivery time (1-40 mins)
  - Update status at each stage
  - One active delivery at a time (quality focus)
- **📈 Delivery Stats**
  - Track total completed deliveries
  - View delivery history
- **💸 Transparent Earnings**
  - ₹50 per delivery
  - Clear earning display

### Shared Features
- **🔐 Google Authentication**
  - Secure Firebase-based login
  - Profile photos and names
- **🔄 Easy Role Switching**
  - Switch between Student/Deliverer modes
  - Persistent role selection
- **⏱️ Smart Order Expiration**
  - 15-minute auto-cancellation for unfulfilled orders
  - Prevents stale requests
- **🌓 Dark Theme**
  - Eye-friendly dark mode interface
  - Modern purple/green color scheme

---

## 🏗️ Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native with Expo Router
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Hooks
- **Storage**: AsyncStorage (role persistence)
- **UI Components**: React Native core components
- **Icons**: Expo Vector Icons
- **Forms**: react-native-keyboard-aware-scroll-view

### Backend & Database
- **Authentication**: Firebase Authentication (Google Sign-in)
- **Database**: Cloud Firestore (real-time NoSQL)
- **Real-time Sync**: Firestore onSnapshot listeners
- **Collection Path**: `/artifacts/gravli-android/public/data/deliveries`

---

## 📂 Project Structure

```
app/frontend/
├── app/
│   ├── _layout.tsx           # Root layout with navigation
│   ├── index.tsx             # Login screen
│   ├── role-selection.tsx    # Student/Deliverer selection
│   ├── student.tsx           # Student view (order food)
│   └── deliverer.tsx         # Deliverer view (fulfill orders)
├── config/
│   └── firebase.ts           # Firebase configuration
├── constants/
│   └── cafeData.ts           # Menu data for all cafes
├── types/
│   └── index.ts              # TypeScript interfaces
├── utils/
│   └── helpers.ts            # Helper functions
└── app.json                  # Expo configuration
```

---

## 🚀 Getting Started

### Installation

1. **Navigate to frontend**
   ```bash
   cd app/frontend
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   yarn start
   ```

4. **Run on device/simulator**
   - Scan QR code with Expo Go app (Android/iOS)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser

---

## 📱 How to Use

### As a Student

1. **Login**: Sign in with your Google account
2. **Select Role**: Choose "Order Food"
3. **Browse Cafes**: Tap on any of the 12 cafes
4. **Build Your Order**:
   - Search for items in the menu
   - Use +/- buttons to adjust quantity
   - Items are automatically added to cart
5. **Checkout**:
   - View cart with all items
   - Select your block (B1-B4, G1-G2, etc.)
   - Enter your room number (3 digits)
   - Confirm order
6. **Track Delivery**:
   - See active order bar at top
   - View real-time status updates
   - Check ETA from deliverer

### As a Deliverer

1. **Login**: Sign in with your Google account
2. **Select Role**: Choose "Deliver Orders"
3. **Accept Jobs**:
   - Browse available deliveries
   - See pickup location, destination, and earnings
   - Tap "Accept Job" to start
4. **Fulfill Delivery**:
   - Set ETA (1-40 minutes)
   - Update status: "Reached Cafe"
   - Update status: "Picked Up"
   - Complete: "Delivered"
5. **View Stats**: Check total deliveries completed

---

## 🎨 Design Highlights

- **Color Scheme**:
  - Primary: Purple (#8b5cf6)
  - Student: Indigo (#6366f1)
  - Deliverer: Green (#22c55e)
  - Background: Dark slate (#0f172a, #1e293b)

- **Typography**: System fonts with clear hierarchy
- **Touch Targets**: Minimum 44px for iOS, 48px for Android
- **Responsive**: Works on phones and tablets

---

## 📊 Performance Optimizations

- **Real-time Updates**: Firestore onSnapshot for instant synchronization
- **Auto-cleanup**: Orders expire after 15 minutes
- **Efficient Rendering**: FlatList for long menus
- **Memoization**: useMemo for cart calculations
- **Lazy Loading**: Modals load on-demand

---

## 🐛 Known Limitations

1. **Google Sign-in on Mobile**: 
   - Currently works on web platform
   - Mobile requires additional OAuth configuration
   - Users can sign in on web first, then access mobile

2. **Payment Integration**: 
   - Currently cash-on-delivery only
   - No integrated payment gateway

---

## 🚀 Future Enhancements

- [ ] Native Google Sign-in for mobile
- [ ] Push notifications for order updates
- [ ] In-app payment integration (UPI, Cards)
- [ ] GPS-based live tracking
- [ ] Rating system for deliverers
- [ ] Promo codes and discounts

---

**Made By Students, Made For Students**

Built with ❤️ by the Gravli team
