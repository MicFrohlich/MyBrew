# Brewly — Ready State Design Spec
**Date:** 2026-04-14
**Goal:** Investor-ready demo — real auth, real data persistence, shareable URL, PWA install

---

## 1. Architecture

Single Vite + React PWA. One codebase, one deploy, three role-based shells. Supabase for database, auth, and realtime.

```
brewly/
├── src/
│   ├── main.jsx
│   ├── App.jsx               # Auth gate → role shell router
│   ├── lib/
│   │   └── supabase.js       # Supabase client singleton
│   ├── shells/
│   │   ├── ConsumerShell.jsx # Bottom nav, espresso dark theme
│   │   ├── BaristaShell.jsx  # Bottom nav, green theme
│   │   └── AdminShell.jsx    # Sidebar, espresso dark theme
│   ├── screens/              # One folder per screen
│   ├── components/           # Shared UI primitives
│   └── styles/
│       └── tokens.css        # CSS vars extracted from existing prototypes
├── public/
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service worker (vite-plugin-pwa)
└── supabase/
    └── seed.sql              # Seed from hardcoded prototype data
```

**Flow:** `/` → Supabase session check → no session → `/auth` → on login, read `user_metadata.role` → render matching shell.

---

## 2. Tech Stack

| Concern | Choice |
|---|---|
| Frontend | Vite + React |
| PWA | vite-plugin-pwa |
| Backend / DB | Supabase (Postgres) |
| Auth | Supabase Auth — Google OAuth + email/password |
| Map | Leaflet (already in prototype) |
| QR encode | qrcode.react |
| QR decode | html5-qrcode (camera scan in Barista shell) |
| i18n | react-i18next + i18next-browser-languagedetector |
| Deploy | Vercel or Netlify (single app) |

---

## 3. Data Model

```sql
-- Core identity
profiles          (id, user_id, display_name, avatar_emoji, role: consumer|barista|roaster|admin)

-- Consumer taste
taste_profiles    (id, user_id, level: casual|exploring|expert,
                   sliders jsonb, flavors jsonb, brew_methods text[],
                   location_prefs text[], created_at)

-- Coffee catalogue
roasteries        (id, name, city, color, emoji, website, desc, tags text[])
beans             (id, roastery_id, name, origin, process, roast, score, price,
                   flavors text[], acidity, body, sweetness, fruitiness,
                   intensity, aroma, finish, trend, methods text[])
cafes             (id, roastery_id, name, addr, lat, lng, hours)

-- Barista
barista_profiles  (id, user_id, cafe_id, specialties text[], bio, yrs, kudos, rating)
menu_today        (id, cafe_id, barista_id, bean_id, brew_method, active, updated_at)

-- Social
checkins          (id, user_id, cafe_id, bean_id, barista_id, note, rating, created_at)
social_posts      (id, user_id, content, cafe_id, bean_id, upvotes int, created_at)
```

**Match scoring:** computed client-side — consumer taste profile vs bean attributes. No stored scores; always fresh on fetch.

**RLS:** `role = admin` bypasses row-level restrictions. Roasters can CRUD their own roastery + beans only. Baristas can CRUD their own `barista_profiles` and `menu_today` rows.

---

## 4. Auth & Routing

**Auth:** Google OAuth + email/password via Supabase Auth. On first sign-in, a Postgres `auth` trigger inserts a `profiles` row with `role = consumer`. Barista/roaster role set during onboarding. Admin promotes manually from `/admin/users`.

```
/                     → redirect based on role
/auth                 → login / signup (Google + email)
                        "I'm a barista / roaster / shop" option on auth screen

-- Onboarding
/onboard              → consumer: profile → level → taste → brewing → location
/onboard/barista      → name → cafe select or create → specialties → bio
/onboard/roaster      → roastery name → city → tags → first bean
/onboard/shop         → shop name → address/map pin → hours → roastery link

-- Consumer shell
/home                 → cafe discovery (default tab)
/home/map             → map view
/home/feed            → social feed
/home/beans           → bean browser
/home/profile         → taste profile, QR code, settings

-- Barista shell
/barista              → today's menu (default tab)
/barista/scan         → QR scanner → customer profile overlay
/barista/stats        → kudos, scan count, avg match score, repeat rate
/barista/profile      → bio, specialties, cafe link

-- Roaster shell (subset of admin, own data only)
/roaster              → own roastery dashboard
/roaster/beans        → CRUD own beans
/roaster/cafes        → CRUD own cafe locations

-- Admin shell
/admin                → dashboard: user count, active cafes, today's menu activity
/admin/roasteries     → CRUD all roasteries
/admin/beans          → CRUD all beans
/admin/cafes          → CRUD all cafes
/admin/users          → role management: promote/demote
```

---

## 5. Screens per Shell

### Consumer Shell — espresso dark theme (base: brewly-v9.jsx)
- **Home:** cafe cards with match %, "brewing now" badge from `menu_today`, distance
- **Map:** Leaflet, cafe pins, tap → cafe detail bottom sheet
- **Feed:** social posts, upvotes, check-in composer
- **Beans:** browse by roastery, filter by flavor / origin / process, match score overlay
- **Profile:** taste profile display + edit, QR code generator, sign out

### Barista Shell — green theme (base: brewly-barista-fixed.html)
- **Today:** `menu_today` rows, toggle active/inactive, swap bean
- **Scan:** camera → QR decode → consumer profile overlay with match scores vs today's menu
- **Stats:** kudos, scan count, avg match score, top bean, repeat rate
- **Profile:** bio, specialties, cafe link

### Admin Shell — espresso dark theme, sidebar layout (new)
- **Dashboard:** user count, active cafes, today's menu activity
- **Roasteries:** table + create/edit form
- **Beans:** table + create/edit form (per roastery)
- **Cafes:** table + create/edit form (map pin picker)
- **Users:** table, role badge, promote/demote

### Roaster Shell — espresso dark theme, sidebar layout (new)
- Scoped to own roastery only
- Manage beans, cafe locations
- No access to other roasteries or user management

---

## 6. PWA

- `vite-plugin-pwa` with Workbox
- `manifest.json`: name "Brewly", short_name "Brewly", theme_color `#120B06`, background_color `#120B06`, display "standalone"
- Offline: cache app shell + static assets. Data screens show cached last state with "offline" indicator.
- Install prompt: shown after onboarding completion

---

## 7. Seed Data

`supabase/seed.sql` populated from existing hardcoded constants in prototype files:
- 6 roasteries (Father, Bean There, Seam, Rosetta, Truth, Origin)
- ~20 beans across roasteries
- Cafe locations per roastery
- 5 barista profiles
- Sample social posts and check-ins

---

## 8. Localisation (English + Hebrew)

- **Library:** `react-i18next` with `i18next-browser-languagedetector`
- **Languages:** English (`en`, default) and Hebrew (`he`)
- **Translation files:** `src/locales/en.json` and `src/locales/he.json` — flat namespaced keys (`home.title`, `auth.signIn`, etc.)
- **RTL support:** `dir="rtl"` set on `<html>` when language is `he`; CSS uses logical properties (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`) instead of `left`/`right` where direction matters
- **Language switcher:** in Consumer Profile screen and Auth screen; persisted to `localStorage` via `i18next-browser-languagedetector`
- **Fonts:** Hebrew uses `Heebo` (body) and `Frank Ruhl Libre` (serif headings) loaded from Google Fonts; English keeps existing `Inter` / `Cormorant Garamond`. Font family swaps via `:root[lang="he"]` selector.
- **Date/number formatting:** use `Intl.DateTimeFormat` and `Intl.NumberFormat` with active locale
- **Coverage:** all user-facing strings in shells, screens, onboarding, auth, and validation messages. Seed data (roastery names, bean names) stays in its original language — content is not translated, UI chrome is.

---

## 9. Out of Scope (for this demo)

- Push notifications
- Payments / ordering
- Real-time chat
- Bean shop / e-commerce
- Native mobile apps (PWA covers this for demo)
