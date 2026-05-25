# AddisJobs — Prime Hospitality 🌟

AddisJobs is an elite, premium-grade Telegram Mini App (TMA) designed specifically to connect top hospitality talent with Ethiopia's finest premium venues, restaurants, and hotels. 

Powered by Next.js and Supabase, AddisJobs provides a beautiful, native-like mobile experience directly inside Telegram with glassmorphic visuals, fluid animations, and real-time backend updates.

---

## ✨ Features

- 📱 **Telegram Native UX:** Specifically tailored for Telegram Mini Apps with light/dark theme reactive styling, fluid gesture-based animations, and haptic feedback.
- 💼 **Onboarding Flow:** A highly polished 6-step registration flow for job seekers (category choice, contact details, experience level, portfolio, and resumes).
- 🔍 **Interactive Job Search:** Full virtualized list matching with lightning-fast scrolling, filter chips, and instant category filters.
- 📊 **Employer Dashboard:** A dedicated command center for vetted employers to review applications and post new jobs via a premium, animated slide-up bottom drawer.
- ⚡ **Supabase Backend:** Powered by secure Row-Level Security (RLS) database policies, real-time sync, and edge function validations.

---

## 🛠️ Technology Stack

- **Core & Routing:** [Next.js](https://nextjs.org/) (React 19, TypeScript)
- **Styling & Motion:** [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) + [Framer Motion](https://www.framer.com/motion/) for fluid animations
- **Backend:** [Supabase](https://supabase.com/) (PostgreSQL database, Row-Level Security, Edge Functions)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Integration:** [@telegram-apps/sdk](https://telegram-apps.github.io/tma.js/) for smooth Telegram WebApp bindings

---

## 🚀 Setup & Local Installation

Follow these steps to run the application locally on your computer:

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/elias2025new/AddisJobs.git
cd AddisJobs
```

### 2️⃣ Configure Environment Variables
Copy the root `.env.example` file to create your own local credentials:
```bash
cp .env.example .env.local
```

> [!IMPORTANT]
> You **MUST** open `.env.local` and replace the placeholder values with your actual Supabase URL, Anon Key, Service Role Key, and Telegram Bot Token before booting the application.

### 3️⃣ Install Dependencies
Navigate into the main app folder and install all required modules:
```bash
cd prime-hospitality
npm install
```

### 4️⃣ Run the App Locally
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application!

---

## 🏗️ Supabase Schema & Security

The database schema is fully defined in the `/supabase/migrations` folder and uses strict **Row-Level Security (RLS)** to protect candidate details and employer data.

- **`profiles`:** Stores candidate details and CV URLs.
- **`employers`:** Stores premium hospitality business verification profiles.
- **`jobs`:** Contains active and pending job listings.
- **`applications`:** Tracks status updates (applied, under review, accepted) securely.
