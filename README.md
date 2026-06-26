# RaiLoversPK Portfolio — Next.js Site

Electric Blue · Dark · Bold · Firebase-Ready

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: CSS Variables + Inline styles (no Tailwind dependency)
- **Fonts**: Bebas Neue (display) + Inter (body) via Google Fonts
- **Backend**: Firebase Firestore (contact form, dynamic data)
- **Images**: Next.js `<Image>` with remote patterns for YouTube & Firebase Storage

---

## File Structure

```
app/
  globals.css          ← Design tokens, shared utilities, animations
  layout.jsx           ← Root layout + metadata
  page.jsx             ← Home page
  about/page.jsx       ← About page
  projects/page.jsx    ← Projects / Vlogs page
  contact/page.jsx     ← Contact page with form

components/
  Nav.jsx              ← Sticky nav with active link detection
  Ticker.jsx           ← Animated marquee ticker bar

next.config.js         ← Image remote patterns (YouTube, Firebase, Unsplash)
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Fill in your Firebase config in .env.local
# 4. Run dev server
npm run dev
```

---

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_YT_KEY=
NEXT_PUBLIC_YT_CHANNEL=
```

---

## Firebase — Contact Form

In `app/contact/page.jsx`, find the comment block:

```js
// ── Firebase integration point ──────────────────
// import { db } from '@/lib/firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// await addDoc(collection(db, 'contact_messages'), { ...form, timestamp: serverTimestamp() });
```

Uncomment and wire up your `lib/firebase.js` (same one you use in Railovers PK).

---

## Images

Replace all `/images/*.webp` placeholder paths with your own images in `/public/images/`:

| File                    | Used on        |
|-------------------------|----------------|
| `hero-bg.webp`          | Home hero      |
| `portrait.webp`         | About page     |
| `vlog-quetta.webp`      | Home vlogs     |
| `vlog-khyber.webp`      | Home vlogs     |
| `vlog-lhr-khi.webp`     | Home vlogs     |
| `vlog-tezgam.webp`      | Home vlogs     |
| `proj-quetta.webp`      | Projects grid  |
| `proj-website.webp`     | Projects grid  |
| `proj-khyber.webp`      | Projects grid  |
| `proj-planner.webp`     | Projects grid  |
| `proj-tezgam.webp`      | Projects grid  |
| `proj-northern.webp`    | Projects grid  |
| `post-pak-express.webp` | Home posts     |
| `post-northern.webp`    | Home posts     |
| `post-booking.webp`     | Home posts     |

---

## Design Tokens

All design decisions live in `app/globals.css` under `:root`:

```css
--accent:     #1E90FF;   /* Electric Blue — change this for a different theme */
--bg:         #050508;   /* Page background */
--bg2:        #0c0c12;   /* Card background */
--bg3:        #131320;   /* Input / deep surface */
--border:     rgba(255,255,255,0.07);
--muted:      rgba(255,255,255,0.42);
```

To change the accent color site-wide, update `--accent` and `--accent-dim` in one place.

---

## Deployment

Recommended: **Vercel** (zero-config with Next.js)

```bash
npm run build   # check for errors first
vercel deploy
```
