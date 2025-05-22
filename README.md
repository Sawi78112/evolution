# Evolution 1.0

**AI-Powered DeepFake Detection & Intelligence Management Platform**  
Built with **Next.js**, **TailwindCSS**, and **Supabase**  
By **Evo Tech LLC**

---

## 🧠 Overview

**Evolution 1.0** is a role-based, AI-driven threat intelligence system that embeds DeepFake detection into a full investigative workflow. With autonomous Agents that process image, video, audio, and text data, Evolution links digital artifacts to people, cases, and timelines—empowering users to detect, verify, and act with speed and precision.

---

## 🚀 Key Features

- ✅ **AI DeepFake Detection**: DF-I (Image), DF-V (Video), DF-A (Audio), DF-T (Text)
- 🧠 **Real-Time & Scheduled Analysis** with reliability thresholds
- 👤 **Case & Person Management** with cross-linking and biometrics
- 🔐 **Role-Based Access** (Admin, Division Manager, Analyst, Investigator)
- 📦 **Supabase Integration**: User auth, file storage, and live data syncing
- 📅 **Smart Scheduler**: Batch analysis and timed agent execution
- 📊 **Dashboards & Reports**: Visual results, filters, and export tools
- 🧾 **Immutable Audit Trail**: Tracks all activity and overrides

---

## 🧰 Tech Stack

| Layer        | Tech                     |
|--------------|--------------------------|
| Frontend     | [Next.js](https://nextjs.org), [TailwindCSS](https://tailwindcss.com) |
| Backend      | [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage) |
| AI Services  | Python APIs or serverless ML inference endpoints |
| Scheduling   | Supabase Functions, CRON jobs, or Edge functions |
| Auth         | Supabase Auth with RBAC, 2FA, and delegation logic |
| Deployment   | Vercel, Docker, or custom cloud/VPS hosting |

---

## 🧪 DeepFake Agent Suite

| Agent ID | Type   | Analysis Focus                                  | Max Reliability % |
|----------|--------|--------------------------------------------------|-------------------|
| DF-I     | Image  | Lighting, texture, facial symmetry, EXIF metadata | 15%               |
| DF-V     | Video  | Lip-sync, blink rate, motion physics             | 20%               |
| DF-A     | Audio  | Voiceprint, breath/pause rhythm, spectral signature | 25%            |
| DF-T     | Text   | Handwriting curve, forgery, NLP structure        | 30%               |

> Artifacts over these thresholds are flagged as unreliable unless manually approved by authorized roles.

---

## 🧭 How It Works

1. **User uploads** image/video/audio/text to a case or person.
2. **Agent (DF-*) runs** on-demand or scheduled via Supabase Edge Function.
3. **Reliability score returned** and auto-compared to thresholds.
4. **Flagged content** is linked, excluded, or escalated.
5. **Analysts can override**, and results are logged in audit trails.
6. **Reports** are generated via UI dashboard.

---

## 🛠 Setup Instructions (Local Dev)

```bash
# 1. Clone this repo
git clone https://github.com/your-org/evolution-platform.git && cd evolution-platform

# 2. Install frontend dependencies
npm install

# 3. Configure .env file (example below)

# 4. Run locally
npm run dev
