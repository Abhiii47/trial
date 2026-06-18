# SmartPrice: Electrical Shop Price Lookup Mobile App

SmartPrice is a production-ready mobile application and REST backend designed for electrical product shops. It features instant search, offline mode caching (supporting 10,000+ items), barcode scanning, and role-based permissions (employees lookup prices; owners manage the catalog).

---

## 📂 Folder Structure

```text
smartprice/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts           # MongoDB and Mongoose config
│   │   │   └── jsonDb.ts       # Local file fallback database (db.json)
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── productController.ts
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts
│   │   ├── models/
│   │   │   ├── Product.ts
│   │   │   └── User.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   └── productRoutes.ts
│   │   ├── scripts/
│   │   │   ├── seed.ts         # Initial mock seeder
│   │   │   └── test-api.js     # API route test runner
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript Interfaces
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
└── frontend/
    ├── app/
    │   ├── (admin)/
    │   │   └── dashboard.tsx   # Owner statistics & management screen
    │   ├── (auth)/
    │   │   └── login.tsx       # Secure owner login screen
    │   ├── _layout.tsx         # Stack routing navigation configuration
    │   ├── index.tsx           # Search lookup home screen
    │   └── scanner.tsx         # Camera barcode scanner screen
    ├── assets/                 # App icons, splash screens
    ├── src/
    │   ├── components/
    │   │   ├── AddEditProductModal.tsx # Slide-up management drawer
    │   │   └── ProductCard.tsx         # Stylized dark-theme item cards
    │   ├── services/
    │   │   └── api.ts          # Automatic backend URL parser
    │   ├── store/
    │   │   ├── useAuthStore.ts    # Secure session management
    │   │   └── useProductStore.ts # Local caching, sorting & filtering
    │   └── theme/
    │       └── colors.ts       # Color system tokens
    ├── app.json
    ├── package.json
    └── tsconfig.json
```

---

## 🗄️ Database Schemas & Roles

### 1. User Schema
```typescript
User {
  _id: ObjectId
  name: string
  email: string
  password: string // select: false (hidden by default)
  role: "owner"
  createdAt: Date
  updatedAt: Date
}
```

### 2. Product Schema
```typescript
Product {
  _id: ObjectId
  productName: string
  productCode: string     // unique, indexed
  barcode?: string        // unique, sparse indexed
  category: string        // indexed
  brand: string           // indexed
  price: number
  createdAt: Date
  updatedAt: Date
}
```

### Roles
- **Employee:** Doesn't require login. Can query, sync, and scan barcodes. Cannot access admin routes, edit prices, or modify products.
- **Owner:** Full admin capabilities. Authenticates via JWT. Can add/edit/delete products and update prices.

---

## ⚡ Caching & Low-End Device Optimization

To ensure smooth performance on low-end Android devices with **10,000+ items**:
1. **In-Memory Filtering:** Instead of querying the database on every keystroke (which creates network latency and server overhead), the app performs a full catalog sync on startup (or when requested) and caches the products in local `AsyncStorage`. All text and barcode searches are run in-memory against this array using optimized Javascript filters, providing **instant 0ms response times** even when offline.
2. **Virtualized Lists:** The main search screen utilizes React Native's `FlatList` configured with performance optimization props (`getItemLayout`, `maxToRenderPerBatch`, `windowSize`, `removeClippedSubviews`, etc.) to prevent high RAM consumption and frame-rate drops when scrolling through massive catalogs.

---

## 🌐 Backend REST APIs

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Logs in owner, returns details & JWT |
| `GET` | `/products` | Public | Fetches all products (for local app sync) |
| `GET` | `/products/search?q=...` | Public | Searches products on server |
| `POST` | `/products` | Private (Owner) | Creates a new product |
| `PUT` | `/products/:id` | Private (Owner) | Updates product details/price |
| `DELETE` | `/products/:id` | Private (Owner) | Deletes a product |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Create a `.env` file inside the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smartprice?retryWrites=true&w=majority
JWT_SECRET=supersecretjwtkey123!@#
JWT_EXPIRE=30d
```
*(If no `MONGO_URI` is supplied or the server fails to connect, the backend automatically falls back to a local file-based database `db.json` so you can test immediately.)*

### Frontend (`frontend/.env`)
By default, the frontend automatically extracts the development computer's IP address from Expo's dev server (`Constants.expoConfig.hostUri`). However, you can hardcode a URL for production:
```env
EXPO_PUBLIC_API_URL=https://your-backend-api-production.com
```

---

## 📦 APK / AAB Build Instructions

You can build the Android APK/AAB package using Expo EAS Build (recommended for ease of use) or locally via Gradle.

### Method A: Expo EAS Build (Cloud - Recommended)

1. **Install EAS CLI globally:**
   ```bash
   npm install -g eas-cli
   ```
2. **Log in to your Expo account:**
   ```bash
   eas login
   ```
3. **Configure EAS Build in the project:**
   Run this from the `frontend/` folder:
   ```bash
   eas build:configure
   ```
   Select `Android` when prompted. This will generate an `eas.json` file.
4. **Configure `eas.json` for APK generation:**
   Add a `preview` or `local` profile to generate a direct `.apk` file instead of an `.aab` (App Bundle) file:
   ```json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "android": {
           "buildType": "apk"
         }
       },
       "production": {}
     }
   }
   ```
5. **Run the APK build command:**
   ```bash
   eas build --platform android --profile preview
   ```
   *EAS will compile your app in the cloud and output a URL to download the completed `.apk` file directly to your testing device.*

---

### Method B: Local Android Gradle Build

If you want to build the APK completely locally on your machine without Expo cloud services, you must eject the project to generate native Android folders:

1. **Pre-build/Eject Expo:**
   Inside the `frontend/` folder, run:
   ```bash
   npx expo prebuild
   ```
   This generates the native `android` directory containing the Gradle wrappers and source code.
2. **Compile using Gradle:**
   Make sure you have Android SDK, JDK, and `ANDROID_HOME` environment variables configured, then run:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
3. **Retrieve the APK:**
   The output APK will be saved at:
   `frontend/android/app/build/outputs/apk/release/app-release.apk`

---

## 🚀 Production Deployment Guide

### 1. Deploy the Backend
Deploy the Node.js Express server to a hosting provider such as **Render**, **Railway**, or **Heroku**:
1. Connect your GitHub repository.
2. Set the build command: `cd backend && npm install && npm run build`
3. Set the start command: `cd backend && npm start`
4. Define the Environment Variables (`PORT`, `MONGO_URI`, `JWT_SECRET`) in the hosting panel.

### 2. Set Up MongoDB Atlas
1. Register for a free MongoDB Atlas cluster.
2. Add your server's IP address to the Network Access Allowlist.
3. Obtain the connection string and set it as `MONGO_URI` in the backend hosting panel.
4. Seed the database by running `npm run seed` pointing to the Atlas connection string.

### 3. Build & Deploy Frontend
1. Change the API URL: Set `EXPO_PUBLIC_API_URL` to your production backend URL.
2. Generate the AAB (Android App Bundle) file for Google Play Store upload:
   ```bash
   eas build --platform android --profile production
   ```
3. Upload the resulting `.aab` file to the Google Play Console under **Production / Releases**.
