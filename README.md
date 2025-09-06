# ClassTrack – Advanced Attendance App  

ClassTrack is a modern management app. It works as a **Progressive Web App (PWA)** on iOS and as a **native Android app** (via Capacitor/TWA).  

## ✨ Features (MVP)  
- One-time **teacher registration** (stored locally).  
- **Create classes** with subject & schedule.  
- **Upload Excel** with student details (enrollment no, name, registration number).  
- **Swipe-based attendance system** – swipe right = present, left = absent.  
- **Export attendance** as CSV for each class & date.  
- **Local data storage** (no backend required initially).  

## 🚀 Tech Stack  
- **React + Vite** for frontend.  
- **TailwindCSS** for styling.  
- **xlsx (SheetJS)** for Excel parsing.  
- **PWA** support for cross-platform usage.  
- **Capacitor / TWA** for Android APK.  

## 📦 Getting Started  

1. Clone this repo:  
```bash
git clone https://github.com/your-username/classtrack.git
cd classtrack
````

2. Install dependencies:

```bash
npm install
```

3. Run in development:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Preview production build:

```bash
npm run preview
```

## 📱 Deployment

* **Web/PWA (iOS users):** Deploy the `dist/` folder to Vercel, Netlify, or GitHub Pages.
* **Android App:** Wrap with Capacitor or Trusted Web Activity (TWA) and upload to Play Store.

## 🔮 Future Features

* Internal marks & grading.
* Class performance analytics.
* Cloud sync with Firebase/Supabase.
* Multi-teacher collaboration.

---