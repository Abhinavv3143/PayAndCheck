# payandcheck.in — Next.js + Razorpay (LIVE + Gated + Badges)

Features
- ✅ Razorpay checkout (test/live)
- ✅ Counts increment **after verified payment**
- ✅ **LIVE** updates via SSE
- ✅ **Gated** `/a/{amount}` (only opens after payment via signed cookie)
- ✅ **Dev-only Fake Pay** (local testing, opt-in)
- ✅ **First-payer Badge** per amount (unique, verifiable SVG)

## Setup
1. Copy env:
```
cp .env.example .env
# edit .env with your Razorpay test keys (and strong secrets)
```
2. Install & init DB:
```
npm i
npx prisma db push
npm run dev
```
3. Local dev fake pay (optional):
```
ENABLE_FAKE_PAY=true
NEXT_PUBLIC_ENABLE_FAKE_PAY_UI=true
```
4. Open http://localhost:3000

## Gated access
- After payment verify (or dev fake pay), server sets `pac_a_{amount}` cookie with a signed token.
- `/a/{amount}` validates it server-side and redirects home if missing/invalid.

## Badges
- First payer for an amount mints a unique badge (DB `UNIQUE(amount)`).
- Public endpoints:
  - `/api/badge/[id]` (JSON)
  - `/api/badge/[id]/svg` (SVG art)

Built: 2025-08-22T19:16:36.397077
