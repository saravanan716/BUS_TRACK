# BusTrack India 🚌

Live bus tracking app with permanent Supabase connection — no reconnection prompts ever.

---

## How the Permanent Connection Works

```
User opens page
      ↓
Frontend fetches GET /api/supabase
      ↓
Vercel serverless function reads env vars
SUPABASE_URL + SUPABASE_ANON_KEY
      ↓
Returns { url, key } to frontend
      ↓
Frontend auto-connects to Supabase
      ↓
App loads data — Admin / Driver / Passenger all work ✅
```

No user ever sees a "Connect to database" screen. It just works.

---

## Deploy to Vercel (One-Time Setup)

### Step 1 — Upload your files

Your project structure must be:
```
bustrack/
├── index.html          ← the main frontend (renamed from bustrack_light__4_.html)
├── api/
│   └── supabase.js     ← serverless credential proxy
├── vercel.json         ← routing config
└── .env.example        ← template (safe to commit)
```

### Step 2 — Set Environment Variables in Vercel

1. Go to [vercel.com](https://vercel.com) → your project → **Settings → Environment Variables**
2. Add these two variables:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://tuqzskyhiseatgaocjgi.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` (your full anon key) |

3. Set them for **Production**, **Preview**, and **Development** environments.

### Step 3 — Deploy

```bash
# Install Vercel CLI (if not already)
npm install -g vercel

# Login
vercel login

# Deploy from your project folder
cd bustrack/
vercel --prod
```

Or just push to GitHub and connect the repo to Vercel for auto-deploys.

---

## Local Development

```bash
# Install Vercel CLI
npm install -g vercel

# Copy env template
cp .env.example .env.local
# Edit .env.local with your real Supabase credentials

# Run locally (simulates the serverless functions)
vercel dev
```

Your app runs at `http://localhost:3000` with full Supabase connectivity.

---

## Supabase Database Setup

If you haven't set up the tables yet, run this SQL in your Supabase SQL Editor:

```sql
-- BusTrack tables
create table if not exists buses (
  id bigint primary key default extract(epoch from now())*1000,
  name text not null,
  stops jsonb not null,
  added_at timestamptz default now()
);
create table if not exists driver_location (
  id int primary key default 1,
  lat float8, lon float8, speed float8,
  heading float8, sharing boolean default false,
  bus_name text, route_stops jsonb,
  updated_at timestamptz default now()
);
create table if not exists settings (
  key text primary key,
  value text not null
);
insert into settings(key,value) values('admin_pw','admin'),('driver_pw','driver')
  on conflict(key) do nothing;
alter table buses enable row level security;
alter table driver_location enable row level security;
alter table settings enable row level security;
create policy "public read buses" on buses for select using (true);
create policy "public write buses" on buses for all using (true);
create policy "public read driver" on driver_location for select using (true);
create policy "public write driver" on driver_location for all using (true);
create policy "public read settings" on settings for select using (true);
create policy "public write settings" on settings for all using (true);
```

---

## Files Explained

| File | Purpose |
|------|---------|
| `index.html` | Frontend SPA — auto-connects to Supabase on load |
| `api/supabase.js` | Serverless function — serves credentials from env vars |
| `vercel.json` | Routes `/api/*` to serverless, everything else to `index.html` |
| `.env.example` | Template for env vars (safe to commit, no real secrets) |

---

## Roles

| Role | How Connection Works |
|------|----------------------|
| **Admin** | Auto-connected on page load — no prompt |
| **Driver** | Auto-connected on page load — no prompt |
| **Passenger** | Auto-connected on page load — no prompt |
