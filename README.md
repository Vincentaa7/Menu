<div align="center">

# 🍳 ResepKu

**Platform berbagi resep masakan berbasis AI — modern, cepat, dan gratis.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203-orange)](https://console.groq.com/)

</div>

---

## ✨ Fitur Utama

- 🔐 **Autentikasi** — Register & login dengan Supabase Auth
- 📖 **Feed Publik** — Temukan resep dari seluruh pengguna
- 🔍 **Pencarian & Filter** — Cari berdasarkan nama atau kategori
- ➕ **Kelola Resep** — Buat, edit, dan hapus resep milik sendiri
- 🖼️ **Upload Foto** — Simpan gambar resep ke Supabase Storage
- 🔖 **Bookmark** — Simpan resep favorit
- 🤖 **Chef Bot AI** — Asisten masak berbasis Groq Llama 3

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 15, Tailwind CSS, shadcn/ui |
| Backend | Python FastAPI |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Storage | Supabase Storage |
| AI | Groq API (Llama 3) |
| Hosting | Vercel (frontend) + Render (backend) |

---

## 🚀 Cara Menjalankan Secara Lokal

### Prasyarat
- Python 3.11+
- Node.js 18+
- Akun [Supabase](https://supabase.com) & [Groq](https://console.groq.com)

### 1. Setup Database
Jalankan isi file `schema.sql` di **Supabase SQL Editor**.

### 2. Setup Backend
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Buat file `backend/.env` (lihat `backend/.env.example`):
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=gsk_...
ALLOWED_ORIGINS=http://localhost:3000
```

```bash
uvicorn main:app --reload
# Backend berjalan di http://localhost:8000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Buat file `frontend/.env.local` (lihat `frontend/.env.local.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
# Frontend berjalan di http://localhost:3000
```

---

## 📁 Struktur Project

```
Menu/
├── schema.sql              # SQL schema untuk Supabase
├── backend/                # FastAPI
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   └── routers/
│       ├── recipes.py      # CRUD resep + upload gambar
│       ├── bookmarks.py    # Sistem bookmark
│       └── chat.py         # Chef Bot (Groq AI)
└── frontend/               # Next.js
    ├── app/                # Halaman (App Router)
    ├── components/         # Navbar, RecipeCard, ChefBotWidget
    ├── contexts/           # AuthContext
    └── lib/                # supabase.ts, api.ts
```

---

## 🌐 Deploy

| Service | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) — set Root Directory ke `frontend` |
| Backend | [Render](https://render.com) — set Root Directory ke `backend` |
| DB/Auth | Supabase Free Tier |

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.
