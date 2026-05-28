# Betterment Group Property Platform

Open marketplace real estate listing platform for Kenya.  
Built with Next.js 14 · Supabase · Vercel · M-Pesa Daraja

---

## Project Structure

```
betterment-property/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    ← Run this first in Supabase
├── src/
│   ├── app/
│   │   ├── page.tsx                  ← Homepage
│   │   ├── listings/                 ← Search & browse
│   │   ├── properties/[slug]/        ← Single property page
│   │   ├── dashboard/                ← Agent dashboard
│   │   ├── admin/                    ← Admin panel
│   │   └── api/
│   │       ├── properties/           ← CRUD API
│   │       ├── agents/               ← Agent management
│   │       ├── inquiries/            ← Contact/lead system
│   │       └── payments/mpesa/       ← Daraja STK push
│   ├── components/
│   │   ├── ui/                       ← Buttons, inputs, cards
│   │   ├── layout/                   ← Navbar, footer, sidebar
│   │   ├── properties/               ← PropertyCard, PropertyGrid, etc.
│   │   └── search/                   ← Filter bar, search input
│   └── lib/
│       ├── supabase/                 ← client.ts + server.ts
│       ├── types/                    ← All TypeScript types
│       └── hooks/                    ← useProperties, useAuth, etc.
├── .env.example                      ← Copy → .env.local
└── package.json
```

---

## Setup Steps (Do These In Order)

### Step 1 — Supabase Project
1. Go to [supabase.com](https://supabase.com) → New project
2. Name it `betterment-property`
3. Choose region: `East Africa (eu-west-2)` (closest to Nairobi)
4. Go to SQL Editor → paste `supabase/migrations/001_initial_schema.sql` → Run
5. Copy your Project URL and anon key → paste in `.env.local`

### Step 2 — Local Setup
```bash
git clone <your-repo>
cd betterment-property
npm install
cp .env.example .env.local
# Fill in .env.local with your Supabase keys
npm run dev
```

### Step 3 — Vercel Deployment
```bash
npx vercel
# Add all .env.local variables in Vercel dashboard → Settings → Environment Variables
```

### Step 4 — Google Maps
1. [console.cloud.google.com](https://console.cloud.google.com)
2. Enable: Maps JavaScript API + Geocoding API + Places API
3. Create API key → restrict to your domain
4. Add to `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Step 5 — M-Pesa Daraja
1. [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create app → get Consumer Key + Secret
3. For sandbox testing use shortcode: `174379`
4. Add all values to `.env.local`

---

## Build Phases

### Phase 1 — Foundation ✅ (Current)
- [x] Database schema (properties, users, locations, inquiries, payments)
- [x] TypeScript types
- [x] Supabase client setup
- [x] Properties API (GET list, GET single, POST, PATCH, DELETE)
- [ ] Homepage UI
- [ ] Listings search page
- [ ] Property detail page
- [ ] Auth (sign up / login)

### Phase 2 — Business Layer
- [ ] Agent dashboard (manage listings)
- [ ] Admin dashboard (approve/reject listings)
- [ ] Inquiry system (WhatsApp + email notifications)
- [ ] M-Pesa featured listing payment
- [ ] Image upload (Supabase Storage)

### Phase 3 — Polish
- [ ] Google Maps search
- [ ] SEO (dynamic meta, sitemap, robots.txt)
- [ ] Mortgage calculator
- [ ] Off-plan project pages
- [ ] Mobile PWA

---

## Listing Tiers & Revenue

| Tier | Price (KES) | Duration | Perks |
|------|------------|----------|-------|
| Basic | Free | 30 days | Standard listing, 5 photos |
| Featured | 2,500 | 30 days | Highlighted, 15 photos, priority search |
| Premium | 5,000 | 30 days | Top placement, unlimited photos, social boost |

At 1,000 users/day → ~30,000 MAU  
If 5% of agents upgrade to Featured: significant monthly revenue  
Add developer packages at KES 15,000–50,000/project

---

## Tech Stack

| Layer | Tool | Cost at 1k/day |
|-------|------|----------------|
| Frontend | Next.js 14 | Free |
| Backend | Next.js API Routes | Free |
| Database | Supabase (PostgreSQL) | Free (50k MAU) |
| Auth | Supabase Auth | Free |
| Storage | Supabase Storage | Free (1GB) |
| Hosting | Vercel | Free → $20/mo when scaling |
| Maps | Google Maps API | $200 free credit/month |
| Email | Resend.com | Free (3k emails/month) |

**Total cost at launch: KES 0**  
**Total cost at 10k users/day: ~KES 5,000/month**
