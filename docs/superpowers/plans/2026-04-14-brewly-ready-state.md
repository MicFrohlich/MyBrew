# Brewly Ready State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Brewly HTML prototypes into an investor-ready PWA with Supabase backend, role-based auth, four shells (Consumer, Barista, Admin, Roaster), and English + Hebrew localisation with RTL support.

**Architecture:** Single Vite + React app. Auth gate reads `profiles.role` from Supabase and renders the matching shell. Consumer and Barista shells use bottom nav; Admin and Roaster shells use sidebar. All shells share one design-token system extracted from existing prototypes. i18n via `react-i18next` with automatic RTL direction swap.

**Tech Stack:** Vite, React 18, React Router v6, Supabase JS v2, Leaflet + react-leaflet, qrcode.react, html5-qrcode, react-i18next, i18next-browser-languagedetector, vite-plugin-pwa, Vitest, @testing-library/react

**Prerequisites:**
- Node.js 20+
- A Supabase project (free tier is fine) — note URL + anon key
- Google OAuth credentials registered in Supabase Auth settings
- Existing prototype files remain untouched under `archive/`

---

## File Structure

```
brewly/
├── src/
│   ├── main.jsx                    # Vite entry, mounts <App/>
│   ├── App.jsx                     # Router, auth gate, role → shell
│   ├── lib/
│   │   ├── supabase.js             # Supabase client singleton
│   │   ├── match.js                # Pure match scoring function
│   │   └── i18n.js                 # react-i18next init
│   ├── hooks/
│   │   ├── useAuth.js              # session, user, profile, signIn, signOut
│   │   ├── useTasteProfile.js      # read/write taste_profiles
│   │   ├── useCafes.js             # cafe list + menu_today join
│   │   ├── useBeans.js             # beans + roastery join
│   │   └── useFeed.js              # social_posts + checkins
│   ├── shells/
│   │   ├── ConsumerShell.jsx       # dark espresso, bottom nav
│   │   ├── BaristaShell.jsx        # green, bottom nav
│   │   ├── AdminShell.jsx          # dark, sidebar
│   │   └── RoasterShell.jsx        # dark, sidebar, scoped
│   ├── screens/
│   │   ├── AuthScreen.jsx
│   │   ├── onboard/
│   │   │   ├── ConsumerOnboard.jsx
│   │   │   ├── BaristaOnboard.jsx
│   │   │   ├── RoasterOnboard.jsx
│   │   │   └── ShopOnboard.jsx
│   │   ├── consumer/
│   │   │   ├── Home.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── BeansScreen.jsx
│   │   │   └── ConsumerProfile.jsx
│   │   ├── barista/
│   │   │   ├── Today.jsx
│   │   │   ├── Scan.jsx
│   │   │   ├── Stats.jsx
│   │   │   └── BaristaProfile.jsx
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Roasteries.jsx
│   │   │   ├── AdminBeans.jsx
│   │   │   ├── Cafes.jsx
│   │   │   └── Users.jsx
│   │   └── roaster/
│   │       ├── RoasterDashboard.jsx
│   │       ├── RoasterBeans.jsx
│   │       └── RoasterCafes.jsx
│   ├── components/
│   │   ├── BottomNav.jsx
│   │   ├── Sidebar.jsx
│   │   ├── CafeCard.jsx
│   │   ├── BeanCard.jsx
│   │   ├── MatchBadge.jsx
│   │   ├── QRDisplay.jsx
│   │   ├── LangSwitcher.jsx
│   │   ├── Modal.jsx
│   │   └── Toast.jsx
│   ├── locales/
│   │   ├── en.json
│   │   └── he.json
│   ├── styles/
│   │   ├── tokens.css              # CSS vars from prototypes
│   │   ├── global.css              # shared utility classes
│   │   ├── consumer.css
│   │   ├── barista.css
│   │   └── admin.css
│   └── __tests__/
│       ├── match.test.js
│       └── i18n.test.js
├── supabase/
│   ├── schema.sql                  # tables, RLS, triggers
│   └── seed.sql                    # roasteries, beans, cafes
├── public/
│   ├── manifest.webmanifest
│   ├── icon-192.png
│   └── icon-512.png
├── vite.config.js
├── .env.example
└── package.json
```

---

## Phase 1: Foundation (Tasks 1–8)

These must complete first. After Phase 1, auth works, DB is seeded, router is in place, and i18n is wired. Everything else builds on this.

### Task 1: Scaffold Vite project + dependencies

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `.env.example`, `.gitignore`

- [ ] **Step 1: Initialise Vite React project in the repo root**

Run:
```bash
cd /Users/michaelfrohlich/Documents/Personal/Brewly/brewly
npm create vite@latest . -- --template react
```
When prompted about non-empty directory: choose **Ignore files and continue**.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install @supabase/supabase-js react-router-dom leaflet react-leaflet qrcode.react html5-qrcode react-i18next i18next i18next-browser-languagedetector
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vite-plugin-pwa vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

- [ ] **Step 4: Update `.gitignore`**

Append:
```
.env
.env.local
dist
node_modules
.vite
coverage
```

- [ ] **Step 5: Create `.env.example`**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 6: Replace `vite.config.js` with PWA + test config**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Brewly',
        short_name: 'Brewly',
        description: 'Coffee Taste Intelligence',
        theme_color: '#120B06',
        background_color: '#120B06',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.js'
  }
});
```

- [ ] **Step 7: Create `src/test-setup.js`**

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 8: Add test script to `package.json`**

In `scripts`, add: `"test": "vitest"` and `"test:run": "vitest run"`.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vite.config.js .gitignore .env.example index.html src/
git commit -m "Scaffold Vite React project with PWA and test setup"
```

---

### Task 2: Design tokens + global CSS

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/tokens.css`**

```css
:root {
  /* Espresso/cream palette (consumer + admin) */
  --cr: #FAF8F3; --cr2: #F2EDE3; --cr3: #E8DFD0;
  --ink: #1E0F07; --ink2: #3D2010; --ink3: #6B4030;
  --gld: #C8974A; --gld2: #E8C07A; --gld3: #F5E4C0;
  --sge: #6D8C6A; --sge2: #9DB89A; --sge3: #E2F0DF;
  --rst: #A83820; --rst2: #D4614A; --rst3: #FCEAE6;
  --pur: #7C3AED; --pur2: #EDE9FE;

  /* Dark shell backgrounds (v9 palette) */
  --bg: #0d0a07;
  --s1: #181210; --s2: #231a13; --s3: #2e231a;
  --br: rgba(255,255,255,0.07);
  --cream: #f4e6cf;
  --muted: #7a6a57;
  --amber: #c8883c;
  --amb2: #e8a855;
  --terra: #c4614a;
  --sage: #7d9a6e;
  --sage2: #9db88d;

  /* Borders / shadows */
  --b: rgba(30,15,7,.08);
  --b2: rgba(30,15,7,.14);
  --b3: rgba(30,15,7,.22);
  --sh: 0 1px 8px rgba(30,15,7,.06);
  --sh2: 0 4px 20px rgba(30,15,7,.10);
  --sh3: 0 12px 40px rgba(30,15,7,.15);

  /* Barista green palette */
  --ba: #0D2B12; --ba2: #1A4520; --ba3: #2A6B32;
  --ba4: #3D9B48; --ba5: #5CC466;

  /* Fonts */
  --f-body: 'Inter', sans-serif;
  --f-serif: 'Cormorant Garamond', serif;
}

:root[lang="he"] {
  --f-body: 'Heebo', sans-serif;
  --f-serif: 'Frank Ruhl Libre', serif;
}
```

- [ ] **Step 2: Create `src/styles/global.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Heebo:wght@300;400;500;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #root {
  height: 100%;
  font-family: var(--f-body);
  background: var(--bg);
  color: var(--cream);
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
input, textarea, select { font-family: inherit; }

.serif { font-family: var(--f-serif); }

/* RTL-safe utility classes — use logical properties */
.stack { display: flex; flex-direction: column; }
.row { display: flex; align-items: center; }
.grow { flex: 1; }
.gap-s { gap: 6px; } .gap-m { gap: 12px; } .gap-l { gap: 20px; }

/* Screen-reader only */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
```

- [ ] **Step 3: Import in `src/main.jsx`**

Replace the generated `main.jsx` with:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tokens.css';
import './styles/global.css';
import './lib/i18n.js';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Commit**

```bash
git add src/styles/ src/main.jsx
git commit -m "Add design tokens and global CSS with RTL-friendly utilities"
```

---

### Task 3: i18n setup with English + Hebrew

**Files:**
- Create: `src/lib/i18n.js`, `src/locales/en.json`, `src/locales/he.json`, `src/__tests__/i18n.test.js`

- [ ] **Step 1: Create `src/locales/en.json`**

```json
{
  "app": { "name": "Brewly", "tagline": "Coffee Taste Intelligence" },
  "auth": {
    "signIn": "Sign in",
    "signUp": "Sign up",
    "email": "Email",
    "password": "Password",
    "continueWithGoogle": "Continue with Google",
    "or": "or",
    "iAmA": "I'm a",
    "consumer": "Coffee lover",
    "barista": "Barista",
    "roaster": "Roaster",
    "shop": "Shop owner",
    "errorInvalid": "Invalid email or password"
  },
  "nav": {
    "home": "Home", "map": "Map", "feed": "Feed", "beans": "Beans", "profile": "Profile",
    "today": "Today", "scan": "Scan", "stats": "Stats",
    "dashboard": "Dashboard", "roasteries": "Roasteries", "cafes": "Cafés", "users": "Users"
  },
  "onboard": {
    "welcome": "Welcome to Brewly",
    "step": "Step {{current}} of {{total}}",
    "next": "Next", "back": "Back", "finish": "Finish",
    "profile": {
      "title": "Your profile",
      "displayName": "Display name",
      "chooseAvatar": "Choose avatar"
    },
    "level": {
      "title": "How well do you know coffee?",
      "casual": "Casual drinker",
      "casualDesc": "I know what I like",
      "exploring": "Exploring",
      "exploringDesc": "I'm learning the language",
      "expert": "Expert",
      "expertDesc": "I cup, I taste, I score"
    },
    "taste": { "title": "Taste preferences", "flavorNotes": "Flavor notes you enjoy" },
    "brewing": { "title": "How do you brew?", "selectAll": "Select all that apply" },
    "location": { "title": "Where do you drink coffee?", "distance": "Max distance" }
  },
  "home": {
    "greeting": "Good morning",
    "forYou": "For you",
    "nearby": "Nearby cafés",
    "brewingNow": "Brewing now",
    "match": "{{pct}}% match",
    "seeAll": "See all"
  },
  "barista": {
    "todayMenu": "Today's menu",
    "addBean": "Add bean",
    "scanCustomer": "Scan customer QR",
    "scanHint": "Point the camera at a Brewly QR code",
    "matchForThem": "Match for them",
    "kudos": "Kudos",
    "scansThisMonth": "Scans this month",
    "avgMatch": "Avg match",
    "repeatRate": "Repeat rate"
  },
  "admin": {
    "totalUsers": "Total users",
    "activeCafes": "Active cafés",
    "menuUpdates": "Menu updates today",
    "create": "Create", "edit": "Edit", "delete": "Delete", "cancel": "Cancel", "save": "Save",
    "confirmDelete": "Are you sure? This cannot be undone.",
    "promote": "Promote", "demote": "Demote"
  },
  "profile": {
    "signOut": "Sign out",
    "editTaste": "Edit taste profile",
    "language": "Language",
    "myQR": "My QR code",
    "qrHint": "Show this to your barista for a personalised brew"
  },
  "common": {
    "loading": "Loading…",
    "error": "Something went wrong",
    "retry": "Retry",
    "offline": "You're offline — showing cached data"
  }
}
```

- [ ] **Step 2: Create `src/locales/he.json`**

```json
{
  "app": { "name": "ברוּלי", "tagline": "בינת טעם הקפה" },
  "auth": {
    "signIn": "התחברות",
    "signUp": "הרשמה",
    "email": "דוא״ל",
    "password": "סיסמה",
    "continueWithGoogle": "המשך עם Google",
    "or": "או",
    "iAmA": "אני",
    "consumer": "אוהב/ת קפה",
    "barista": "ברמן/ית",
    "roaster": "קלאי/ת",
    "shop": "בעל/ת בית קפה",
    "errorInvalid": "דוא״ל או סיסמה שגויים"
  },
  "nav": {
    "home": "בית", "map": "מפה", "feed": "עדכונים", "beans": "פולים", "profile": "פרופיל",
    "today": "היום", "scan": "סריקה", "stats": "נתונים",
    "dashboard": "לוח בקרה", "roasteries": "קלייה", "cafes": "בתי קפה", "users": "משתמשים"
  },
  "onboard": {
    "welcome": "ברוכים הבאים לברוּלי",
    "step": "שלב {{current}} מתוך {{total}}",
    "next": "הבא", "back": "חזרה", "finish": "סיום",
    "profile": {
      "title": "הפרופיל שלך",
      "displayName": "שם תצוגה",
      "chooseAvatar": "בחר/י אווטאר"
    },
    "level": {
      "title": "עד כמה את/ה מכיר/ה קפה?",
      "casual": "שותה מזדמן/ת",
      "casualDesc": "אני יודע/ת מה אני אוהב/ת",
      "exploring": "מתעניין/ת",
      "exploringDesc": "אני לומד/ת את השפה",
      "expert": "מומחה/ית",
      "expertDesc": "אני טועם/ת, מנקד/ת ומבין/ה"
    },
    "taste": { "title": "העדפות טעם", "flavorNotes": "ניחוחות שאת/ה אוהב/ת" },
    "brewing": { "title": "איך את/ה מכין/ה קפה?", "selectAll": "בחר/י את כל מה שמתאים" },
    "location": { "title": "איפה את/ה שותה קפה?", "distance": "מרחק מקסימלי" }
  },
  "home": {
    "greeting": "בוקר טוב",
    "forYou": "בשבילך",
    "nearby": "בתי קפה בסביבה",
    "brewingNow": "מכינים עכשיו",
    "match": "{{pct}}% התאמה",
    "seeAll": "הצג הכל"
  },
  "barista": {
    "todayMenu": "תפריט היום",
    "addBean": "הוסף פול",
    "scanCustomer": "סרוק קוד לקוח",
    "scanHint": "כוון/י את המצלמה אל קוד QR של ברוּלי",
    "matchForThem": "ההתאמה עבורו/ה",
    "kudos": "מחמאות",
    "scansThisMonth": "סריקות החודש",
    "avgMatch": "התאמה ממוצעת",
    "repeatRate": "שיעור חזרה"
  },
  "admin": {
    "totalUsers": "סה״כ משתמשים",
    "activeCafes": "בתי קפה פעילים",
    "menuUpdates": "עדכוני תפריט היום",
    "create": "צור", "edit": "ערוך", "delete": "מחק", "cancel": "ביטול", "save": "שמירה",
    "confirmDelete": "האם את/ה בטוח/ה? פעולה זו אינה הפיכה.",
    "promote": "קדם", "demote": "הורד"
  },
  "profile": {
    "signOut": "התנתקות",
    "editTaste": "ערוך פרופיל טעם",
    "language": "שפה",
    "myQR": "קוד ה-QR שלי",
    "qrHint": "הראה/י לברמן/ית להכנה מותאמת אישית"
  },
  "common": {
    "loading": "טוען…",
    "error": "משהו השתבש",
    "retry": "נסה שוב",
    "offline": "לא מקוון — מציג נתונים שמורים"
  }
}
```

- [ ] **Step 3: Create `src/lib/i18n.js`**

```js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.json';
import he from '../locales/he.json';

const RTL_LANGS = ['he', 'ar'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he }
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'he'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'brewly-lang'
    }
  });

function applyDirection(lng) {
  const dir = RTL_LANGS.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);
}

applyDirection(i18n.language || 'en');
i18n.on('languageChanged', applyDirection);

export default i18n;
```

- [ ] **Step 4: Write failing test for i18n direction**

Create `src/__tests__/i18n.test.js`:
```js
import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../lib/i18n.js';

describe('i18n', () => {
  beforeEach(() => { localStorage.clear(); });

  it('defaults to English LTR', async () => {
    await i18n.changeLanguage('en');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('switches to Hebrew RTL when language changes', async () => {
    await i18n.changeLanguage('he');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('he');
  });

  it('translates a known key in Hebrew', async () => {
    await i18n.changeLanguage('he');
    expect(i18n.t('auth.signIn')).toBe('התחברות');
  });
});
```

- [ ] **Step 5: Run test**

```bash
npm run test:run -- i18n
```
Expected: all 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/i18n.js src/locales/ src/__tests__/i18n.test.js
git commit -m "Add react-i18next with English and Hebrew plus RTL direction swap"
```

---

### Task 4: Supabase schema

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Create `supabase/schema.sql`**

```sql
create extension if not exists "uuid-ossp";

-- Profiles
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  avatar_emoji text default '☕',
  role text not null default 'consumer'
    check (role in ('consumer','barista','roaster','admin')),
  locale text default 'en',
  created_at timestamptz default now()
);

-- Taste profiles
create table taste_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  level text not null check (level in ('casual','exploring','expert')),
  sliders jsonb not null default '{}',
  flavors jsonb not null default '[]',
  brew_methods text[] not null default '{}',
  location_prefs text[] not null default '{}',
  max_distance_km numeric default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on taste_profiles (user_id);

-- Roasteries
create table roasteries (
  id text primary key,
  name text not null,
  city text not null,
  color text default '#1A1A1A',
  emoji text default '☕',
  website text,
  description text,
  tags text[] default '{}',
  owner_id uuid references auth.users(id) on delete set null
);

-- Beans
create table beans (
  id text primary key,
  roastery_id text references roasteries(id) on delete cascade not null,
  name text not null,
  origin text,
  process text,
  roast text,
  score numeric(4,1),
  price text,
  flavors text[] default '{}',
  acidity numeric(3,1),
  body numeric(3,1),
  sweetness numeric(3,1),
  fruitiness numeric(3,1),
  intensity numeric(3,1),
  aroma numeric(3,1),
  finish numeric(3,1),
  trend text default 'steady' check (trend in ('hot','rising','steady','new')),
  methods text[] default '{}'
);
create index on beans (roastery_id);

-- Cafes
create table cafes (
  id uuid primary key default uuid_generate_v4(),
  roastery_id text references roasteries(id) on delete set null,
  name text not null,
  addr text,
  lat numeric(9,6),
  lng numeric(9,6),
  hours text
);

-- Barista profiles
create table barista_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  cafe_id uuid references cafes(id) on delete set null,
  specialties text[] default '{}',
  bio text,
  yrs integer default 0,
  kudos integer default 0,
  rating numeric(2,1) default 0.0
);

-- Menu today
create table menu_today (
  id uuid primary key default uuid_generate_v4(),
  cafe_id uuid references cafes(id) on delete cascade not null,
  barista_id uuid references barista_profiles(id) on delete set null,
  bean_id text references beans(id) on delete cascade not null,
  brew_method text,
  active boolean default true,
  updated_at timestamptz default now()
);
create index on menu_today (cafe_id);

-- Check-ins
create table checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  cafe_id uuid references cafes(id) on delete set null,
  bean_id text references beans(id) on delete set null,
  barista_id uuid references barista_profiles(id) on delete set null,
  note text,
  rating integer check (rating between 1 and 5),
  created_at timestamptz default now()
);

-- Social posts
create table social_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  cafe_id uuid references cafes(id) on delete set null,
  bean_id text references beans(id) on delete set null,
  upvotes integer default 0,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (user_id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'consumer'
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS
alter table profiles enable row level security;
alter table taste_profiles enable row level security;
alter table roasteries enable row level security;
alter table beans enable row level security;
alter table cafes enable row level security;
alter table barista_profiles enable row level security;
alter table menu_today enable row level security;
alter table checkins enable row level security;
alter table social_posts enable row level security;

-- Helper: is_admin
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles where user_id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
create policy "read own profile" on profiles for select using (auth.uid() = user_id);
create policy "read all profiles (admin)" on profiles for select using (is_admin());
create policy "update own profile" on profiles for update using (auth.uid() = user_id);
create policy "admin manage profiles" on profiles for all using (is_admin());

-- taste_profiles
create policy "own taste profile" on taste_profiles for all using (auth.uid() = user_id);

-- roasteries
create policy "public read roasteries" on roasteries for select using (true);
create policy "admin manage roasteries" on roasteries for all using (is_admin());
create policy "roaster manage own roastery" on roasteries for all using (owner_id = auth.uid());

-- beans
create policy "public read beans" on beans for select using (true);
create policy "admin manage beans" on beans for all using (is_admin());
create policy "roaster manage own beans" on beans for all using (
  exists (select 1 from roasteries where id = roastery_id and owner_id = auth.uid())
);

-- cafes
create policy "public read cafes" on cafes for select using (true);
create policy "admin manage cafes" on cafes for all using (is_admin());

-- barista_profiles
create policy "public read baristas" on barista_profiles for select using (true);
create policy "own barista profile" on barista_profiles for all using (user_id = auth.uid());
create policy "admin manage baristas" on barista_profiles for all using (is_admin());

-- menu_today
create policy "public read menu" on menu_today for select using (true);
create policy "barista manage own menu" on menu_today for all using (
  exists (select 1 from barista_profiles where id = barista_id and user_id = auth.uid())
);
create policy "admin manage menu" on menu_today for all using (is_admin());

-- checkins
create policy "public read checkins" on checkins for select using (true);
create policy "own checkins" on checkins for all using (auth.uid() = user_id);

-- social_posts
create policy "public read posts" on social_posts for select using (true);
create policy "own posts" on social_posts for all using (auth.uid() = user_id);
```

- [ ] **Step 2: Apply schema to Supabase**

Open Supabase dashboard → SQL editor → paste `supabase/schema.sql` → Run. Verify all tables appear under Database → Tables.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "Add Supabase schema with RLS policies and auth trigger"
```

---

### Task 5: Seed data

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Step 1: Create `supabase/seed.sql`**

Extract the hardcoded roastery + bean data from `brewly-barista-fixed.html` (lines 99–178 — the `ROASTERIES` constant) and translate to SQL. Full contents:

```sql
-- Roasteries
insert into roasteries (id, name, city, color, emoji, website, description, tags) values
('father','Father Coffee','Johannesburg','#2A1810','☕','father.coffee','JHB''s most innovative specialty roaster. 46+ coffees annually, rare Geisha releases, vacuum fermentation.',
 array['Microlots','Experimental','Geisha specialist']),
('beanthere','Bean There Coffee Company','Johannesburg','#1E2A18','🌍','beanthere.co.za','Pioneer of direct trade in SA since 2006. Exclusively African single origins.',
 array['Direct trade','African only','Fair trade']),
('seam','Seam Coffee','Johannesburg','#282018','🌱','seam.co.za','Founded 2017 by David Walstra. Campbell Road blend. Direct trade Fourways roastery.',
 array['Direct trade','Fourways','Sustainable']),
('rosetta','Rosetta Roastery','Cape Town','#1A2A18','🌿','rosettaroastery.com','Award-winning Cape Town roaster. Classic and Progressive tiers. Direct trade.',
 array['Award-winning','Direct trade','CPT icon']),
('truth','Truth. Coffee','Cape Town','#201820','⚙️','truth.coffee','World''s best café 2014. Steampunk. Destination café Buitenkant St.',
 array['World-class','Steampunk']),
('origin','Origin Coffee Roasting','Cape Town','#182028','🔬','originroasting.co.za','Founded 2005. Godfather of SA specialty. Widest single-origin selection in SA.',
 array['Pioneer','Widest selection','De Waterkant']);

-- Beans (full list from prototype — copy from brewly-barista-fixed.html ROASTERIES constant)
insert into beans (id, roastery_id, name, origin, process, roast, score, price, flavors, acidity, body, sweetness, fruitiness, intensity, aroma, finish, trend, methods) values
('f1','father','Antimaceration Geisha by El Paraíso','Colombia','Vacuum Fermented','Light',91,'R529',
 array['Guava','Pineapple','Passionfruit','Cola','Cacao'],8.5,8,8,10,9,9,8,'hot',array['V60','Chemex','Filter']),
('f2','father','Lalesa Black Honey, Yirgacheffe','Ethiopia','Black Honey','Light',87.5,'R359',
 array['Guava','Apricot','Toffee','Mango'],7,6,9,9,7,8,7.5,'rising',array['V60','AeroPress','Espresso']),
('f3','father','K Organics Anaerobic Natural, Huye','Rwanda','Anaerobic Natural','Light',93,'R1379',
 array['Blueberry jam','Hibiscus','Dark chocolate','Red wine'],8,7,9.5,9.5,8.5,9,9,'rising',array['V60','Cold brew']),
('f4','father','Pink Bourbon by Diego Bermudez','Colombia','Washed','Light',89,'R489',
 array['Rose','Raspberry','Lychee'],8,4.5,8.5,8.5,5,8.5,7.5,'steady',array['V60','Filter']),
('bt1','beanthere','Ethiopia Single Origin','Ethiopia','Washed','Light-Medium',86,'R155',
 array['Jasmine','Bergamot','Lemon','Peach'],8.5,3.5,6.5,8.5,4.5,8.5,7,'hot',array['V60','Batch brew']),
('bt2','beanthere','Kenya Single Origin','Kenya','Washed','Light-Medium',87,'R155',
 array['Blackcurrant','Brown sugar','Citrus'],9,5,6.5,8.5,6,7.5,7.5,'steady',array['V60','Espresso']),
('bt3','beanthere','Rwanda Single Origin','Rwanda','Washed','Light',86,'R150',
 array['Peach','Rose','Orange zest'],7.5,4.5,8,7.5,4.5,8,7,'new',array['V60','AeroPress']),
('bt4','beanthere','Burundi Single Origin','Burundi','Washed','Light-Medium',85,'R140',
 array['Black plum','Cinnamon','Dark chocolate'],7.5,5.5,7.5,7,5.5,7.5,7.5,'steady',array['Espresso','Milk drink']),
('sm1','seam','Campbell Road House Blend','Ethiopia / Colombia','Mixed','Medium',85,'R185',
 array['Milk chocolate','Treacle sugar','Brown sugar'],5.5,6.5,8.5,5,6,7,7,'steady',array['Espresso','Milk drink']),
('sm2','seam','Ethiopia Yirgacheffe Single Origin','Ethiopia','Washed','Light',87,'R210',
 array['Jasmine','Lemon','Bergamot'],8.5,3.5,7,9,4.5,9,7.5,'rising',array['V60','Filter']),
('sm3','seam','Rwanda Nyamasheke Natural','Rwanda','Natural','Light',88,'R220',
 array['Strawberry','Hibiscus','Rose','Honey'],7,5.5,9,8.5,5,8.5,8,'rising',array['V60','Cold brew']),
('r1','rosetta','Yirgacheffe Kochere','Ethiopia','Washed','Light',92,'R260',
 array['Bergamot','Lemon','White jasmine'],9,3,7,9,3.5,9.5,8,'hot',array['V60','Filter']),
('r2','rosetta','Kenya Thiriku AA','Kenya','Washed','Light-Medium',91,'R275',
 array['Blackcurrant','Peach','Brown sugar'],8.5,5.5,7,8,5.5,8,8,'rising',array['V60','Espresso']),
('t1','truth','The Gospel — Ethiopia Gedeb','Ethiopia','Washed','Light',92,'R255',
 array['Jasmine','Bergamot','White peach'],8.5,3.5,7.5,9,4,9.5,8.5,'rising',array['V60','Chemex']),
('o1','origin','Ethiopia Yirgacheffe Washed','Ethiopia','Washed','Light',90,'R245',
 array['Bergamot','Floral','Citrus'],8.5,3.5,7,9,4,9,8,'hot',array['V60','Siphon']),
('o2','origin','Kenya Nyeri AB','Kenya','Washed','Light-Medium',89,'R260',
 array['Blackcurrant','Peach','Wine-like'],8.5,5,7,8.5,5.5,8,8,'rising',array['Espresso','V60']);

-- Cafes
insert into cafes (roastery_id, name, addr, lat, lng, hours) values
('father','Father Kramerville','142 Fox St, Kramerville',-26.2041,28.0473,'Mon–Sat 7–17'),
('father','Father Rosebank','The Zone, Oxford Rd',-26.1472,28.0438,'Mon–Sun 7–18'),
('beanthere','Bean There Braamfontein','25 Paul Nel St, Braamfontein',-26.1934,28.0345,'Mon–Sat 7–17'),
('seam','Seam Fourways','75 Century Blvd, Riversands',-26.0001,28.0024,'Mon–Fri 7–17'),
('rosetta','Rosetta De Waterkant','8 Jarvis St, De Waterkant',-33.9166,18.4182,'Mon–Sun 7–18'),
('truth','Truth Buitenkant','36 Buitenkant St',-33.9249,18.4241,'Mon–Sat 7–18'),
('origin','Origin De Waterkant','28 Hudson St',-33.9162,18.4188,'Mon–Sun 7–17');
```

- [ ] **Step 2: Apply seed to Supabase**

Supabase dashboard → SQL editor → paste `supabase/seed.sql` → Run. Verify rows appear in `roasteries`, `beans`, `cafes` tables.

- [ ] **Step 3: Commit**

```bash
git add supabase/seed.sql
git commit -m "Add Supabase seed data for roasteries, beans, and cafes"
```

---

### Task 6: Supabase client + useAuth hook

**Files:**
- Create: `src/lib/supabase.js`, `src/hooks/useAuth.js`

- [ ] **Step 1: Create `src/lib/supabase.js`**

```js
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase env vars — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true }
});
```

- [ ] **Step 2: Create `src/hooks/useAuth.js`**

```js
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) { setProfile(null); return; }
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [session]);

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });

  const signInWithEmail = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUpWithEmail = (email, password) =>
    supabase.auth.signUp({ email, password });

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{
      session, user: session?.user, profile,
      loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 3: Create `.env.local` with real values**

```bash
cp .env.example .env.local
# Edit .env.local and paste your Supabase URL + anon key
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase.js src/hooks/useAuth.js
git commit -m "Add Supabase client and useAuth hook with profile loading"
```

---

### Task 7: Match scoring library (TDD)

**Files:**
- Create: `src/lib/match.js`, `src/__tests__/match.test.js`

- [ ] **Step 1: Write failing test `src/__tests__/match.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { matchScore } from '../lib/match.js';

const bean = {
  acidity: 8, body: 4, sweetness: 7, fruitiness: 9,
  intensity: 5, aroma: 9, finish: 8,
  flavors: ['Bergamot','Lemon','Jasmine']
};

describe('matchScore', () => {
  it('returns 75 when taste profile is empty', () => {
    expect(matchScore({ level: 'casual', sliders: {}, flavors: [] }, bean)).toBe(75);
  });

  it('scores 100 when sliders match bean exactly (casual)', () => {
    const profile = { level: 'casual', sliders: { sweet: 70, strength: 50 }, flavors: [] };
    expect(matchScore(profile, bean)).toBeGreaterThanOrEqual(90);
  });

  it('boosts score when flavors overlap', () => {
    const withoutFlavors = matchScore({ level: 'exploring', sliders: { acidity: 80, body: 40 }, flavors: [] }, bean);
    const withFlavors = matchScore({ level: 'exploring', sliders: { acidity: 80, body: 40 }, flavors: ['Jasmine','Lemon'] }, bean);
    expect(withFlavors).toBeGreaterThan(withoutFlavors);
  });

  it('returns a rounded integer between 0 and 100', () => {
    const score = matchScore({ level: 'exploring', sliders: { acidity: 50, body: 50 }, flavors: ['Chocolate'] }, bean);
    expect(Number.isInteger(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
```

- [ ] **Step 2: Run test (expect FAIL — match.js does not exist)**

```bash
npm run test:run -- match
```

- [ ] **Step 3: Create `src/lib/match.js`**

```js
const SLIDER_MAP = {
  casual:    { sweet: 'sweetness', strength: 'intensity', milk: 'body' },
  exploring: { acidity: 'acidity', body: 'body', roast: 'intensity' },
  expert:    { acidity: 'acidity', body: 'body' }
};

function sliderComponent(level, sliders, bean) {
  const map = SLIDER_MAP[level] || {};
  const keys = Object.keys(map).filter(k => sliders[k] !== undefined);
  if (keys.length === 0) return null;
  let total = 0;
  for (const k of keys) {
    const prefTen = sliders[k] / 10;
    const beanVal = bean[map[k]] ?? 5;
    const diff = Math.abs(prefTen - beanVal);
    total += Math.max(0, 1 - diff / 10);
  }
  return total / keys.length;
}

function flavorComponent(flavors, bean) {
  if (!flavors?.length || !bean.flavors?.length) return null;
  const norm = s => s.toLowerCase();
  const userSet = flavors.map(norm);
  const beanSet = bean.flavors.map(norm);
  const overlap = userSet.filter(u => beanSet.some(b => b.includes(u) || u.includes(b))).length;
  return Math.min(overlap / Math.max(userSet.length, 1), 1);
}

export function matchScore(tasteProfile, bean) {
  if (!tasteProfile || !bean) return 75;
  const parts = [];
  const slider = sliderComponent(tasteProfile.level, tasteProfile.sliders || {}, bean);
  if (slider !== null) parts.push(slider);
  const flavor = flavorComponent(tasteProfile.flavors, bean);
  if (flavor !== null) parts.push(flavor);
  if (parts.length === 0) return 75;
  const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
  return Math.round(avg * 100);
}
```

- [ ] **Step 4: Run test (expect PASS)**

```bash
npm run test:run -- match
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/match.js src/__tests__/match.test.js
git commit -m "Add client-side match scoring with tests"
```

---

### Task 8: App router + auth gate

**Files:**
- Create: `src/App.jsx`

- [ ] **Step 1: Create `src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.js';
import AuthScreen from './screens/AuthScreen.jsx';
import ConsumerOnboard from './screens/onboard/ConsumerOnboard.jsx';
import BaristaOnboard from './screens/onboard/BaristaOnboard.jsx';
import RoasterOnboard from './screens/onboard/RoasterOnboard.jsx';
import ShopOnboard from './screens/onboard/ShopOnboard.jsx';
import ConsumerShell from './shells/ConsumerShell.jsx';
import BaristaShell from './shells/BaristaShell.jsx';
import AdminShell from './shells/AdminShell.jsx';
import RoasterShell from './shells/RoasterShell.jsx';

function RootRedirect() {
  const { loading, user, profile } = useAuth();
  if (loading) return <div style={{ padding: 40, color: 'var(--cream)' }}>Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) return <div style={{ padding: 40, color: 'var(--cream)' }}>Loading profile…</div>;
  switch (profile.role) {
    case 'admin':   return <Navigate to="/admin" replace />;
    case 'barista': return <Navigate to="/barista" replace />;
    case 'roaster': return <Navigate to="/roaster" replace />;
    default:        return <Navigate to="/home" replace />;
  }
}

function RequireRole({ role, children }) {
  const { loading, user, profile } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) return null;
  if (profile.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/onboard" element={<ConsumerOnboard />} />
          <Route path="/onboard/barista" element={<BaristaOnboard />} />
          <Route path="/onboard/roaster" element={<RoasterOnboard />} />
          <Route path="/onboard/shop" element={<ShopOnboard />} />
          <Route path="/home/*" element={<RequireRole role="consumer"><ConsumerShell /></RequireRole>} />
          <Route path="/barista/*" element={<RequireRole role="barista"><BaristaShell /></RequireRole>} />
          <Route path="/admin/*" element={<RequireRole role="admin"><AdminShell /></RequireRole>} />
          <Route path="/roaster/*" element={<RequireRole role="roaster"><RoasterShell /></RequireRole>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 2: Create placeholder shell + screen files so the app builds**

Create each of these files with a minimal stub returning `<div>ComponentName</div>`:
- `src/screens/AuthScreen.jsx`
- `src/screens/onboard/ConsumerOnboard.jsx`
- `src/screens/onboard/BaristaOnboard.jsx`
- `src/screens/onboard/RoasterOnboard.jsx`
- `src/screens/onboard/ShopOnboard.jsx`
- `src/shells/ConsumerShell.jsx`
- `src/shells/BaristaShell.jsx`
- `src/shells/AdminShell.jsx`
- `src/shells/RoasterShell.jsx`

Example stub (repeat for each, changing the name):
```jsx
export default function ConsumerShell() {
  return <div style={{ padding: 40, color: 'var(--cream)' }}>ConsumerShell</div>;
}
```

- [ ] **Step 3: Run dev server and verify build**

```bash
npm run dev
```
Open `http://localhost:5173`. Should redirect to `/auth` (empty session). No console errors. Stop the dev server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/screens/ src/shells/
git commit -m "Add router with auth gate, role redirect, and placeholder screens"
```

---

## Phase 1 Checkpoint

After Phase 1, the following must work:
- `npm run dev` starts the app
- Unauthenticated users land on `/auth` (stub)
- `npm run test:run` passes match and i18n tests
- Supabase schema + seed applied, tables visible in dashboard
- Switching `i18n.language` to `he` flips `<html dir="rtl">` globally

**Proceed to Phase 2 only after all above pass.**

---

## Phase 2: Auth + Consumer Shell (Tasks 9–16)

### Task 9: Auth screen

**Files:**
- Replace stub: `src/screens/AuthScreen.jsx`
- Create: `src/components/LangSwitcher.jsx`, `src/styles/auth.css`

- [ ] **Step 1: Create `src/components/LangSwitcher.jsx`**

```jsx
import { useTranslation } from 'react-i18next';

export default function LangSwitcher() {
  const { i18n, t } = useTranslation();
  const toggle = () => i18n.changeLanguage(i18n.language === 'he' ? 'en' : 'he');
  return (
    <button
      onClick={toggle}
      aria-label={t('profile.language')}
      style={{
        padding: '6px 12px', borderRadius: 20, border: '1px solid var(--br)',
        background: 'var(--s1)', color: 'var(--cream)', fontSize: 12, fontWeight: 500
      }}>
      {i18n.language === 'he' ? 'EN' : 'עברית'}
    </button>
  );
}
```

- [ ] **Step 2: Create `src/styles/auth.css`**

```css
.auth-wrap { min-height: 100vh; display: flex; flex-direction: column; padding: 72px 24px 40px; background: linear-gradient(180deg,#090604 0%,#130d08 60%,#0d0a07 100%); }
.auth-top { display: flex; justify-content: flex-end; margin-bottom: 24px; }
.auth-logo { font-family: var(--f-serif); font-size: 64px; font-weight: 700; color: var(--cream); line-height: 1; letter-spacing: -2px; }
.auth-logo em { color: var(--amber); font-style: normal; }
.auth-tag { font-size: 14px; color: var(--muted); margin-top: 8px; }
.auth-form { margin-top: 40px; display: flex; flex-direction: column; gap: 12px; }
.auth-input { padding: 14px 16px; border-radius: 12px; border: 1px solid var(--br); background: var(--s1); color: var(--cream); font-size: 14px; outline: none; }
.auth-input:focus { border-color: var(--amber); }
.auth-btn { padding: 15px; border-radius: 12px; background: var(--amber); color: #0d0a07; font-weight: 600; font-size: 15px; cursor: pointer; border: none; }
.auth-btn-g { background: #fff; color: #3c4043; display: flex; align-items: center; justify-content: center; gap: 10px; }
.auth-divider { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 12px; margin: 16px 0; }
.auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--br); }
.auth-role-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 20px; }
.auth-role { flex: 1; min-width: 80px; padding: 10px; border-radius: 10px; border: 1px solid var(--br); background: var(--s1); color: var(--cream); font-size: 12px; font-weight: 500; text-align: center; cursor: pointer; }
.auth-role.sel { background: rgba(200,136,60,.14); border-color: var(--amber); color: var(--amb2); }
.auth-err { color: var(--terra); font-size: 12px; text-align: center; }
.auth-toggle { text-align: center; font-size: 13px; color: var(--muted); margin-top: 20px; }
.auth-toggle button { color: var(--amber); text-decoration: underline; background: none; border: none; cursor: pointer; }
```

- [ ] **Step 3: Replace `src/screens/AuthScreen.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../lib/supabase.js';
import LangSwitcher from '../components/LangSwitcher.jsx';
import '../styles/auth.css';

const ROLES = ['consumer', 'barista', 'roaster', 'shop'];

export default function AuthScreen() {
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consumer');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null); setBusy(true);
    const fn = mode === 'signup' ? signUpWithEmail : signInWithEmail;
    const { data, error } = await fn(email, password);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    if (mode === 'signup' && data.user && role !== 'consumer') {
      sessionStorage.setItem('brewly-pending-role', role);
      navigate(`/onboard/${role === 'shop' ? 'shop' : role}`);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-top"><LangSwitcher /></div>
      <div className="auth-logo">Brew<em>ly</em></div>
      <div className="auth-tag">{t('app.tagline')}</div>

      <form className="auth-form" onSubmit={submit}>
        <button type="button" className="auth-btn auth-btn-g" onClick={signInWithGoogle}>
          <span style={{ fontWeight: 700 }}>G</span> {t('auth.continueWithGoogle')}
        </button>
        <div className="auth-divider">{t('auth.or')}</div>
        <input className="auth-input" type="email" placeholder={t('auth.email')}
               value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="auth-input" type="password" placeholder={t('auth.password')}
               value={password} onChange={e => setPassword(e.target.value)} required />

        {mode === 'signup' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>{t('auth.iAmA')}</div>
            <div className="auth-role-row">
              {ROLES.map(r => (
                <button key={r} type="button"
                        className={`auth-role${role === r ? ' sel' : ''}`}
                        onClick={() => setRole(r)}>{t(`auth.${r}`)}</button>
              ))}
            </div>
          </div>
        )}

        {err && <div className="auth-err">{err}</div>}

        <button className="auth-btn" type="submit" disabled={busy}>
          {busy ? t('common.loading') : (mode === 'signup' ? t('auth.signUp') : t('auth.signIn'))}
        </button>

        <div className="auth-toggle">
          <button type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
            {mode === 'signup' ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Manual test**

```bash
npm run dev
```
- Open `http://localhost:5173/auth`
- Toggle language — Hebrew flips layout RTL, all labels translate
- Sign up with a test email/password, role = consumer
- Verify Supabase dashboard → Authentication shows the new user
- Verify `profiles` table has a row with role=consumer
- Sign out from console: `localStorage.clear()` then reload

- [ ] **Step 5: Commit**

```bash
git add src/screens/AuthScreen.jsx src/components/LangSwitcher.jsx src/styles/auth.css
git commit -m "Add auth screen with Google, email, role selection, and language switch"
```

---

### Task 10: Consumer onboarding

**Files:**
- Replace stub: `src/screens/onboard/ConsumerOnboard.jsx`
- Create: `src/styles/onboard.css`

- [ ] **Step 1: Create `src/styles/onboard.css`**

```css
.ob { min-height: 100vh; display: flex; flex-direction: column; padding-bottom: 32px; background: var(--bg); }
.ob-head { padding: 56px 24px 20px; }
.pdots { display: flex; gap: 6px; margin-bottom: 28px; }
.pdot { width: 6px; height: 6px; border-radius: 3px; background: var(--br); transition: all .3s; }
.pdot.a { background: var(--amber); width: 22px; }
.pdot.d { background: var(--sage); }
.ob-title { font-family: var(--f-serif); font-size: 32px; font-weight: 700; color: var(--cream); line-height: 1.15; margin-bottom: 8px; }
.ob-sub { font-size: 13px; color: var(--muted); line-height: 1.6; }
.ob-body { flex: 1; padding: 8px 24px 0; overflow-y: auto; }
.ob-foot { padding: 16px 24px 0; display: flex; gap: 10px; }
.btn-back { width: 52px; height: 52px; border-radius: 13px; border: 1px solid var(--br); background: transparent; color: var(--cream); font-size: 18px; cursor: pointer; }
.btn-cont { flex: 1; background: var(--amber); color: #0d0a07; border: none; padding: 16px; border-radius: 13px; font-size: 15px; font-weight: 600; cursor: pointer; }
.btn-cont:disabled { opacity: .4; cursor: not-allowed; }
.lv-card { padding: 18px; border-radius: 16px; border: 2px solid var(--br); background: var(--s1); cursor: pointer; display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
.lv-card.sel { border-color: var(--amber); background: rgba(200,136,60,.07); }
.lv-ico { font-size: 40px; }
.lv-name { font-family: var(--f-serif); font-size: 20px; font-weight: 600; color: var(--cream); }
.lv-desc { font-size: 12px; color: var(--muted); margin-top: 3px; }
.ob-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.ob-chip { padding: 9px 15px; border-radius: 100px; border: 1px solid var(--br); background: var(--s1); color: var(--cream); font-size: 12px; cursor: pointer; }
.ob-chip.sel { background: rgba(200,136,60,.14); border-color: var(--amber); color: var(--amb2); }
.ob-slider { margin-bottom: 22px; }
.ob-slider label { display: block; font-size: 13px; color: var(--cream); margin-bottom: 8px; }
.ob-slider input[type=range] { width: 100%; accent-color: var(--amber); }
.ob-input { width: 100%; padding: 14px 16px; background: var(--s1); border: 1px solid var(--br); border-radius: 12px; color: var(--cream); font-size: 14px; outline: none; }
.ob-input:focus { border-color: var(--amber); }
```

- [ ] **Step 2: Replace `src/screens/onboard/ConsumerOnboard.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { supabase } from '../../lib/supabase.js';
import '../../styles/onboard.css';

const LEVELS = [
  { id: 'casual',    ico: '☕' },
  { id: 'exploring', ico: '🔎' },
  { id: 'expert',    ico: '🏆' }
];

const FLAVORS_BY_LEVEL = {
  casual:    ['Chocolate','Caramel','Fruity','Nutty','Vanilla','Spicy'],
  exploring: ['Blueberry','Citrus','Tropical','Stone Fruit','Dark Chocolate','Caramel','Hazelnut','Floral'],
  expert:    ['Jasmine','Rose','Bergamot','Raspberry','Passionfruit','Mango','Cocoa','Black Pepper','Tobacco','Honey']
};

const BREW = ['Espresso','Pour Over','French Press','AeroPress','Cold Brew','Drip','Moka','Capsule'];
const LOCS = ['Specialty','Cozy','Work-friendly','Social','Roastery'];

export default function ConsumerOnboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [level, setLevel] = useState(null);
  const [sliders, setSliders] = useState({});
  const [flavors, setFlavors] = useState([]);
  const [brewMethods, setBrewMethods] = useState([]);
  const [locationPrefs, setLocationPrefs] = useState([]);
  const [maxDistance, setMaxDistance] = useState(5);

  const STEPS = 5;
  const canNext = [displayName.trim().length > 0, !!level, flavors.length > 0, brewMethods.length > 0, locationPrefs.length > 0][step];

  function toggle(arr, setArr, v) { setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]); }

  async function finish() {
    await supabase.from('profiles').update({ display_name: displayName }).eq('user_id', user.id);
    await supabase.from('taste_profiles').insert({
      user_id: user.id, level, sliders, flavors,
      brew_methods: brewMethods, location_prefs: locationPrefs,
      max_distance_km: maxDistance
    });
    navigate('/home');
  }

  const sliderKeys = level === 'casual' ? ['sweet','strength','milk']
                   : level === 'exploring' ? ['acidity','body','roast']
                   : level === 'expert' ? ['acidity','body'] : [];

  return (
    <div className="ob">
      <div className="ob-head">
        <div className="pdots">{Array.from({length: STEPS}).map((_, i) => (
          <div key={i} className={`pdot${i === step ? ' a' : i < step ? ' d' : ''}`}/>
        ))}</div>
        <div className="ob-title">
          {step === 0 && t('onboard.profile.title')}
          {step === 1 && t('onboard.level.title')}
          {step === 2 && t('onboard.taste.title')}
          {step === 3 && t('onboard.brewing.title')}
          {step === 4 && t('onboard.location.title')}
        </div>
        <div className="ob-sub">{t('onboard.step', { current: step + 1, total: STEPS })}</div>
      </div>

      <div className="ob-body">
        {step === 0 && (
          <input className="ob-input" placeholder={t('onboard.profile.displayName')}
                 value={displayName} onChange={e => setDisplayName(e.target.value)} />
        )}

        {step === 1 && LEVELS.map(L => (
          <div key={L.id} className={`lv-card${level === L.id ? ' sel' : ''}`} onClick={() => setLevel(L.id)}>
            <div className="lv-ico">{L.ico}</div>
            <div>
              <div className="lv-name">{t(`onboard.level.${L.id}`)}</div>
              <div className="lv-desc">{t(`onboard.level.${L.id}Desc`)}</div>
            </div>
          </div>
        ))}

        {step === 2 && level && (
          <>
            {sliderKeys.map(k => (
              <div key={k} className="ob-slider">
                <label>{k}</label>
                <input type="range" min="0" max="100"
                       value={sliders[k] ?? 50}
                       onChange={e => setSliders({ ...sliders, [k]: +e.target.value })} />
              </div>
            ))}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>{t('onboard.taste.flavorNotes')}</div>
            <div className="ob-chips">
              {FLAVORS_BY_LEVEL[level].map(f => (
                <button key={f} className={`ob-chip${flavors.includes(f) ? ' sel' : ''}`}
                        onClick={() => toggle(flavors, setFlavors, f)}>{f}</button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <div className="ob-chips">
            {BREW.map(b => (
              <button key={b} className={`ob-chip${brewMethods.includes(b) ? ' sel' : ''}`}
                      onClick={() => toggle(brewMethods, setBrewMethods, b)}>{b}</button>
            ))}
          </div>
        )}

        {step === 4 && (
          <>
            <div className="ob-chips">
              {LOCS.map(l => (
                <button key={l} className={`ob-chip${locationPrefs.includes(l) ? ' sel' : ''}`}
                        onClick={() => toggle(locationPrefs, setLocationPrefs, l)}>{l}</button>
              ))}
            </div>
            <div className="ob-slider" style={{ marginTop: 24 }}>
              <label>{t('onboard.location.distance')}: {maxDistance} km</label>
              <input type="range" min="1" max="25" value={maxDistance}
                     onChange={e => setMaxDistance(+e.target.value)} />
            </div>
          </>
        )}
      </div>

      <div className="ob-foot">
        {step > 0 && <button className="btn-back" onClick={() => setStep(step - 1)}>←</button>}
        <button className="btn-cont" disabled={!canNext}
                onClick={() => step === STEPS - 1 ? finish() : setStep(step + 1)}>
          {step === STEPS - 1 ? t('onboard.finish') : t('onboard.next')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Manual test**

```bash
npm run dev
```
Sign up a fresh consumer account. Walk through all 5 steps in English, then again in Hebrew (language switcher on auth screen). Verify `taste_profiles` row appears in Supabase.

- [ ] **Step 4: Commit**

```bash
git add src/screens/onboard/ConsumerOnboard.jsx src/styles/onboard.css
git commit -m "Add consumer onboarding flow with 5 steps and localisation"
```

---

### Task 11: Consumer Shell + BottomNav

**Files:**
- Replace stub: `src/shells/ConsumerShell.jsx`
- Create: `src/components/BottomNav.jsx`, `src/styles/consumer.css`

- [ ] **Step 1: Create `src/styles/consumer.css`**

```css
.c-shell { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); color: var(--cream); }
.c-body { flex: 1; overflow-y: auto; padding-bottom: 72px; }
.c-head { padding: 52px 22px 16px; display: flex; justify-content: space-between; align-items: flex-start; }
.c-greet { font-family: var(--f-serif); font-size: 28px; color: var(--cream); line-height: 1.15; }
.c-greet span { font-size: 13px; font-family: var(--f-body); color: var(--muted); display: block; margin-top: 3px; }
.av-circle { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--amber), var(--terra)); display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; }

.cafe-card { background: var(--s1); border-radius: 16px; padding: 15px; margin-bottom: 11px; border: 1px solid var(--br); cursor: pointer; }
.cc-top { display: flex; justify-content: space-between; margin-bottom: 9px; }
.cc-name { font-family: var(--f-serif); font-size: 18px; font-weight: 600; color: var(--cream); }
.cc-area { font-size: 11px; color: var(--muted); margin-top: 2px; }
.match-badge { font-size: 11px; font-weight: 700; color: var(--amber); background: rgba(200,136,60,.12); padding: 3px 9px; border-radius: 100px; }
.c-section-head { display: flex; justify-content: space-between; align-items: center; margin: 20px 22px 12px; }
.c-section-ttl { font-family: var(--f-serif); font-size: 20px; font-weight: 600; color: var(--cream); }
.c-section-body { padding: 0 22px; }
```

- [ ] **Step 2: Create `src/components/BottomNav.jsx`**

```jsx
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function BottomNav({ items, theme = 'consumer' }) {
  const { t } = useTranslation();
  const bg = theme === 'barista' ? '#0F2214' : 'var(--s1)';
  const activeColor = theme === 'barista' ? 'var(--ba5)' : 'var(--amber)';
  return (
    <nav style={{
      position: 'fixed', insetInlineStart: 0, insetInlineEnd: 0, bottom: 0,
      display: 'flex', background: bg, borderTop: '1px solid var(--br)',
      padding: '8px 0 10px', zIndex: 100
    }}>
      {items.map(it => (
        <NavLink key={it.to} to={it.to} end={it.end}
                 style={({ isActive }) => ({
                   flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                   gap: 2, fontSize: 10, fontWeight: 500, letterSpacing: '.5px',
                   textTransform: 'uppercase',
                   color: isActive ? activeColor : 'var(--muted)'
                 })}>
          <span style={{ fontSize: 20 }}>{it.icon}</span>
          <span>{t(`nav.${it.key}`)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: Replace `src/shells/ConsumerShell.jsx`**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../screens/consumer/Home.jsx';
import MapView from '../screens/consumer/MapView.jsx';
import Feed from '../screens/consumer/Feed.jsx';
import BeansScreen from '../screens/consumer/BeansScreen.jsx';
import ConsumerProfile from '../screens/consumer/ConsumerProfile.jsx';
import BottomNav from '../components/BottomNav.jsx';
import '../styles/consumer.css';

const NAV = [
  { to: '/home',         end: true,  key: 'home',    icon: '⌂' },
  { to: '/home/map',     end: false, key: 'map',     icon: '◎' },
  { to: '/home/feed',    end: false, key: 'feed',    icon: '❋' },
  { to: '/home/beans',   end: false, key: 'beans',   icon: '◉' },
  { to: '/home/profile', end: false, key: 'profile', icon: '☻' }
];

export default function ConsumerShell() {
  return (
    <div className="c-shell">
      <div className="c-body">
        <Routes>
          <Route index element={<Home />} />
          <Route path="map" element={<MapView />} />
          <Route path="feed" element={<Feed />} />
          <Route path="beans" element={<BeansScreen />} />
          <Route path="profile" element={<ConsumerProfile />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </div>
      <BottomNav items={NAV} theme="consumer" />
    </div>
  );
}
```

- [ ] **Step 4: Create stub screens**

Create the following with minimal stubs (replaced in later tasks):
```jsx
// src/screens/consumer/Home.jsx
export default function Home() { return <div style={{padding:24}}>Home</div>; }
```
Repeat for `MapView.jsx`, `Feed.jsx`, `BeansScreen.jsx`, `ConsumerProfile.jsx` in `src/screens/consumer/`.

- [ ] **Step 5: Commit**

```bash
git add src/shells/ConsumerShell.jsx src/components/BottomNav.jsx src/styles/consumer.css src/screens/consumer/
git commit -m "Add consumer shell, bottom navigation, and screen stubs"
```

---

### Task 12: Consumer Home screen

**Files:**
- Create: `src/hooks/useCafes.js`
- Replace: `src/screens/consumer/Home.jsx`
- Create: `src/components/CafeCard.jsx`, `src/components/MatchBadge.jsx`

- [ ] **Step 1: Create `src/hooks/useCafes.js`**

```js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function useCafes() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: cafeRows } = await supabase
        .from('cafes')
        .select('*, roasteries(name,emoji,color)');
      const { data: menuRows } = await supabase
        .from('menu_today')
        .select('cafe_id, bean_id, brew_method, active, beans(name,flavors,acidity,body,sweetness,fruitiness,intensity,aroma,finish)')
        .eq('active', true);
      const menuByCafe = {};
      (menuRows || []).forEach(r => {
        if (!menuByCafe[r.cafe_id]) menuByCafe[r.cafe_id] = [];
        menuByCafe[r.cafe_id].push(r);
      });
      setCafes((cafeRows || []).map(c => ({ ...c, menu: menuByCafe[c.id] || [] })));
      setLoading(false);
    })();
  }, []);

  return { cafes, loading };
}

export function useTasteProfile(userId) {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!userId) return;
    supabase.from('taste_profiles').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(1).single()
      .then(({ data }) => setProfile(data));
  }, [userId]);
  return profile;
}
```

- [ ] **Step 2: Create `src/components/MatchBadge.jsx`**

```jsx
import { useTranslation } from 'react-i18next';

export default function MatchBadge({ pct }) {
  const { t } = useTranslation();
  return <span className="match-badge">{t('home.match', { pct })}</span>;
}
```

- [ ] **Step 3: Create `src/components/CafeCard.jsx`**

```jsx
import { useTranslation } from 'react-i18next';
import MatchBadge from './MatchBadge.jsx';
import { matchScore } from '../lib/match.js';

export default function CafeCard({ cafe, tasteProfile }) {
  const { t } = useTranslation();
  const best = cafe.menu.reduce((best, m) => {
    const s = tasteProfile ? matchScore(tasteProfile, m.beans) : 75;
    return s > (best?.score ?? -1) ? { ...m, score: s } : best;
  }, null);

  return (
    <div className="cafe-card">
      <div className="cc-top">
        <div>
          <div className="cc-name">{cafe.name}</div>
          <div className="cc-area">{cafe.addr}</div>
        </div>
        {best && <MatchBadge pct={best.score} />}
      </div>
      {best && (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
          {t('home.brewingNow')}: <span style={{ color: 'var(--cream)' }}>{best.beans.name}</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Replace `src/screens/consumer/Home.jsx`**

```jsx
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { useCafes, useTasteProfile } from '../../hooks/useCafes.js';
import CafeCard from '../../components/CafeCard.jsx';

export default function Home() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const tasteProfile = useTasteProfile(user?.id);
  const { cafes, loading } = useCafes();

  return (
    <>
      <div className="c-head">
        <div className="c-greet">
          {t('home.greeting')}
          <span>{profile?.display_name}</span>
        </div>
        <div className="av-circle">{profile?.avatar_emoji || '☕'}</div>
      </div>

      <div className="c-section-head">
        <div className="c-section-ttl">{t('home.forYou')}</div>
      </div>

      <div className="c-section-body">
        {loading && <div style={{ color: 'var(--muted)' }}>{t('common.loading')}</div>}
        {cafes
          .map(c => ({ c, score: c.menu[0] && tasteProfile ? matchScoreForCafe(c, tasteProfile) : 75 }))
          .sort((a, b) => b.score - a.score)
          .map(({ c }) => <CafeCard key={c.id} cafe={c} tasteProfile={tasteProfile} />)}
      </div>
    </>
  );
}

function matchScoreForCafe(cafe, tasteProfile) {
  const scores = cafe.menu.map(m => {
    try { return require('../../lib/match.js').matchScore(tasteProfile, m.beans); }
    catch { return 0; }
  });
  return scores.length ? Math.max(...scores) : 0;
}
```

Note: replace the `matchScoreForCafe` implementation to use ES imports:
```jsx
import { matchScore } from '../../lib/match.js';
// ...
function matchScoreForCafe(cafe, tasteProfile) {
  const scores = cafe.menu.map(m => matchScore(tasteProfile, m.beans));
  return scores.length ? Math.max(...scores) : 0;
}
```

- [ ] **Step 5: Manual test**

```bash
npm run dev
```
Sign in as consumer. Home screen shows cafes sorted by match score. Switch to Hebrew — labels translate, layout mirrors.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useCafes.js src/components/CafeCard.jsx src/components/MatchBadge.jsx src/screens/consumer/Home.jsx
git commit -m "Add consumer home screen with cafe cards and match scoring"
```

---

### Task 13: Consumer Map screen

**Files:**
- Replace: `src/screens/consumer/MapView.jsx`

- [ ] **Step 1: Add Leaflet CSS import to `src/main.jsx`**

Add at top of imports:
```js
import 'leaflet/dist/leaflet.css';
```

- [ ] **Step 2: Replace `src/screens/consumer/MapView.jsx`**

```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useCafes } from '../../hooks/useCafes.js';
import { useTranslation } from 'react-i18next';

// Fix Leaflet icon paths (needed when bundled)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView() {
  const { cafes, loading } = useCafes();
  const { t } = useTranslation();
  if (loading) return <div style={{ padding: 24 }}>{t('common.loading')}</div>;
  const first = cafes.find(c => c.lat && c.lng);
  const center = first ? [Number(first.lat), Number(first.lng)] : [-26.2, 28.04];

  return (
    <div style={{ height: 'calc(100vh - 72px)' }}>
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {cafes.filter(c => c.lat && c.lng).map(c => (
          <Marker key={c.id} position={[Number(c.lat), Number(c.lng)]}>
            <Popup>
              <strong>{c.name}</strong><br/>
              <span style={{ fontSize: 12 }}>{c.addr}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

- [ ] **Step 3: Manual test**

```bash
npm run dev
```
Navigate to `/home/map`. Map loads, pins visible for all cafes in seed.

- [ ] **Step 4: Commit**

```bash
git add src/screens/consumer/MapView.jsx src/main.jsx
git commit -m "Add consumer map view with Leaflet and cafe pins"
```

---

### Task 14: Consumer Feed screen

**Files:**
- Create: `src/hooks/useFeed.js`
- Replace: `src/screens/consumer/Feed.jsx`

- [ ] **Step 1: Create `src/hooks/useFeed.js`**

```js
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export function useFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('social_posts')
      .select('*, profiles!social_posts_user_id_fkey(display_name, avatar_emoji), cafes(name), beans(name)')
      .order('created_at', { ascending: false })
      .limit(50);
    setPosts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { posts, loading, reload: load };
}

export async function createPost({ userId, content, cafeId, beanId }) {
  return supabase.from('social_posts').insert({ user_id: userId, content, cafe_id: cafeId, bean_id: beanId });
}

export async function upvotePost(id, current) {
  return supabase.from('social_posts').update({ upvotes: (current || 0) + 1 }).eq('id', id);
}
```

- [ ] **Step 2: Replace `src/screens/consumer/Feed.jsx`**

```jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { useFeed, createPost, upvotePost } from '../../hooks/useFeed.js';

export default function Feed() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { posts, loading, reload } = useFeed();
  const [draft, setDraft] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    await createPost({ userId: user.id, content: draft, cafeId: null, beanId: null });
    setDraft('');
    reload();
  }

  async function up(p) {
    await upvotePost(p.id, p.upvotes);
    reload();
  }

  return (
    <div style={{ padding: '52px 0 0' }}>
      <div className="c-section-head" style={{ marginTop: 0 }}>
        <div className="c-section-ttl">{t('nav.feed')}</div>
      </div>

      <form onSubmit={submit} style={{ padding: '0 22px 16px' }}>
        <textarea
          value={draft} onChange={e => setDraft(e.target.value)}
          placeholder="What are you drinking?"
          style={{
            width: '100%', minHeight: 70, padding: 12,
            background: 'var(--s1)', border: '1px solid var(--br)',
            borderRadius: 12, color: 'var(--cream)', fontFamily: 'inherit', resize: 'vertical'
          }}
        />
        <button type="submit" className="btn-cont" style={{ marginTop: 8, width: '100%' }}>Post</button>
      </form>

      {loading && <div style={{ padding: 24, color: 'var(--muted)' }}>{t('common.loading')}</div>}

      {posts.map(p => (
        <div key={p.id} style={{
          padding: '14px 22px', borderBottom: '1px solid var(--br)'
        }}>
          <div style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>
            {p.profiles?.avatar_emoji || '☕'} {p.profiles?.display_name || 'user'}
          </div>
          <div style={{ fontSize: 14, marginTop: 6, color: 'var(--cream)' }}>{p.content}</div>
          <button onClick={() => up(p)}
                  style={{ fontSize: 12, color: 'var(--amber)', marginTop: 8, background: 'none', border: 'none', padding: 0 }}>
            ↑ {p.upvotes || 0}
          </button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useFeed.js src/screens/consumer/Feed.jsx
git commit -m "Add consumer feed screen with post composer and upvote"
```

---

### Task 15: Consumer Beans browser

**Files:**
- Create: `src/hooks/useBeans.js`, `src/components/BeanCard.jsx`
- Replace: `src/screens/consumer/BeansScreen.jsx`

- [ ] **Step 1: Create `src/hooks/useBeans.js`**

```js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function useBeans() {
  const [beans, setBeans] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('beans')
      .select('*, roasteries(name, emoji, color)')
      .order('score', { ascending: false })
      .then(({ data }) => { setBeans(data || []); setLoading(false); });
  }, []);
  return { beans, loading };
}
```

- [ ] **Step 2: Create `src/components/BeanCard.jsx`**

```jsx
import MatchBadge from './MatchBadge.jsx';
import { matchScore } from '../lib/match.js';

export default function BeanCard({ bean, tasteProfile }) {
  const score = tasteProfile ? matchScore(tasteProfile, bean) : null;
  return (
    <div className="cafe-card">
      <div className="cc-top">
        <div>
          <div className="cc-name">{bean.name}</div>
          <div className="cc-area">{bean.roasteries?.name} · {bean.origin} · {bean.process}</div>
        </div>
        {score !== null && <MatchBadge pct={score} />}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
        {(bean.flavors || []).join(' · ')}
      </div>
      <div style={{ fontSize: 12, color: 'var(--amber)', marginTop: 6, fontWeight: 600 }}>{bean.price}</div>
    </div>
  );
}
```

- [ ] **Step 3: Replace `src/screens/consumer/BeansScreen.jsx`**

```jsx
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { useBeans } from '../../hooks/useBeans.js';
import { useTasteProfile } from '../../hooks/useCafes.js';
import BeanCard from '../../components/BeanCard.jsx';

export default function BeansScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { beans, loading } = useBeans();
  const tasteProfile = useTasteProfile(user?.id);
  const [filter, setFilter] = useState('all');

  const origins = useMemo(() => ['all', ...new Set(beans.map(b => b.origin).filter(Boolean))], [beans]);
  const filtered = filter === 'all' ? beans : beans.filter(b => b.origin === filter);

  return (
    <div style={{ padding: '52px 0 0' }}>
      <div className="c-section-head" style={{ marginTop: 0 }}>
        <div className="c-section-ttl">{t('nav.beans')}</div>
      </div>

      <div style={{ padding: '0 22px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {origins.map(o => (
          <button key={o} className={`ob-chip${filter === o ? ' sel' : ''}`}
                  onClick={() => setFilter(o)}
                  style={{ flexShrink: 0 }}>{o}</button>
        ))}
      </div>

      <div className="c-section-body">
        {loading && <div style={{ color: 'var(--muted)' }}>{t('common.loading')}</div>}
        {filtered.map(b => <BeanCard key={b.id} bean={b} tasteProfile={tasteProfile} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useBeans.js src/components/BeanCard.jsx src/screens/consumer/BeansScreen.jsx
git commit -m "Add consumer bean browser with origin filter and match scoring"
```

---

### Task 16: Consumer Profile + QR code

**Files:**
- Create: `src/components/QRDisplay.jsx`
- Replace: `src/screens/consumer/ConsumerProfile.jsx`

- [ ] **Step 1: Create `src/components/QRDisplay.jsx`**

```jsx
import { QRCodeSVG } from 'qrcode.react';

export default function QRDisplay({ value, size = 220 }) {
  return (
    <div style={{
      padding: 20, background: '#fff', borderRadius: 16,
      display: 'inline-block', margin: '0 auto'
    }}>
      <QRCodeSVG value={value} size={size} level="M" />
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/screens/consumer/ConsumerProfile.jsx`**

```jsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import QRDisplay from '../../components/QRDisplay.jsx';
import LangSwitcher from '../../components/LangSwitcher.jsx';

export default function ConsumerProfile() {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/auth');
  }

  return (
    <div style={{ padding: '52px 22px 24px' }}>
      <div className="c-section-ttl">{profile?.display_name}</div>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{user?.email}</div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          {t('profile.myQR')}
        </div>
        {user && <QRDisplay value={user.id} />}
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>{t('profile.qrHint')}</div>
      </div>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--cream)' }}>{t('profile.language')}</span>
        <LangSwitcher />
      </div>

      <button onClick={() => navigate('/onboard')}
              style={{ marginTop: 20, width: '100%', padding: 14, borderRadius: 12,
                       border: '1px solid var(--br)', background: 'var(--s1)', color: 'var(--cream)', fontSize: 14 }}>
        {t('profile.editTaste')}
      </button>

      <button onClick={handleSignOut}
              style={{ marginTop: 12, width: '100%', padding: 14, borderRadius: 12,
                       border: 'none', background: 'var(--terra)', color: '#fff', fontSize: 14, fontWeight: 600 }}>
        {t('profile.signOut')}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/QRDisplay.jsx src/screens/consumer/ConsumerProfile.jsx
git commit -m "Add consumer profile screen with QR code and language switcher"
```

---

## Phase 2 Checkpoint

- Consumer can sign up, onboard, see home, map, feed, beans, and profile
- QR code renders the user UUID
- All screens translate between English and Hebrew with direction swap
- Match scores show on cafe and bean cards

---

## Phase 3: Barista Shell (Tasks 17–21)

### Task 17: Barista onboarding

**Files:**
- Replace stub: `src/screens/onboard/BaristaOnboard.jsx`

- [ ] **Step 1: Replace `src/screens/onboard/BaristaOnboard.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { supabase } from '../../lib/supabase.js';
import '../../styles/onboard.css';

const SPECIALTIES = ['V60','Chemex','Espresso','Latte art','AeroPress','Cold brew','Siphon','Milk drinks','Competition prep','Education'];

export default function BaristaOnboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [cafes, setCafes] = useState([]);
  const [cafeId, setCafeId] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [bio, setBio] = useState('');

  useEffect(() => {
    supabase.from('cafes').select('id, name, addr').then(({ data }) => setCafes(data || []));
  }, []);

  const STEPS = 4;
  const canNext = [displayName.trim().length > 0, !!cafeId, specialties.length > 0, bio.trim().length > 0][step];

  function toggleSpec(s) {
    setSpecialties(specialties.includes(s) ? specialties.filter(x => x !== s) : [...specialties, s]);
  }

  async function finish() {
    await supabase.from('profiles').update({ display_name: displayName, role: 'barista' }).eq('user_id', user.id);
    await supabase.from('barista_profiles').insert({
      user_id: user.id, cafe_id: cafeId, specialties, bio, yrs: 0, kudos: 0, rating: 5.0
    });
    window.location.assign('/');
  }

  return (
    <div className="ob">
      <div className="ob-head">
        <div className="pdots">{Array.from({length: STEPS}).map((_, i) => (
          <div key={i} className={`pdot${i === step ? ' a' : i < step ? ' d' : ''}`} />
        ))}</div>
        <div className="ob-title">
          {step === 0 && t('onboard.profile.title')}
          {step === 1 && 'Which café?'}
          {step === 2 && 'Your specialties'}
          {step === 3 && 'Short bio'}
        </div>
        <div className="ob-sub">{t('onboard.step', { current: step + 1, total: STEPS })}</div>
      </div>

      <div className="ob-body">
        {step === 0 && (
          <input className="ob-input" placeholder={t('onboard.profile.displayName')}
                 value={displayName} onChange={e => setDisplayName(e.target.value)} />
        )}
        {step === 1 && cafes.map(c => (
          <div key={c.id}
               className={`lv-card${cafeId === c.id ? ' sel' : ''}`}
               onClick={() => setCafeId(c.id)}>
            <div className="lv-ico">☕</div>
            <div>
              <div className="lv-name">{c.name}</div>
              <div className="lv-desc">{c.addr}</div>
            </div>
          </div>
        ))}
        {step === 2 && (
          <div className="ob-chips">
            {SPECIALTIES.map(s => (
              <button key={s} className={`ob-chip${specialties.includes(s) ? ' sel' : ''}`}
                      onClick={() => toggleSpec(s)}>{s}</button>
            ))}
          </div>
        )}
        {step === 3 && (
          <textarea className="ob-input" rows={5}
                    placeholder="A few sentences about your coffee journey…"
                    value={bio} onChange={e => setBio(e.target.value)} />
        )}
      </div>

      <div className="ob-foot">
        {step > 0 && <button className="btn-back" onClick={() => setStep(step - 1)}>←</button>}
        <button className="btn-cont" disabled={!canNext}
                onClick={() => step === STEPS - 1 ? finish() : setStep(step + 1)}>
          {step === STEPS - 1 ? t('onboard.finish') : t('onboard.next')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/onboard/BaristaOnboard.jsx
git commit -m "Add barista onboarding flow"
```

---

### Task 18: Barista Shell + Today screen

**Files:**
- Replace stub: `src/shells/BaristaShell.jsx`
- Create: `src/styles/barista.css`, `src/screens/barista/Today.jsx`

- [ ] **Step 1: Create `src/styles/barista.css`**

```css
.b-shell { min-height: 100vh; display: flex; flex-direction: column; background: var(--ba); color: #fff; }
.b-body { flex: 1; overflow-y: auto; padding: 48px 20px 80px; }
.b-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.b-title { font-family: var(--f-serif); font-size: 26px; color: #fff; }
.b-card { background: #0F2214; border: 1px solid rgba(61,155,72,.25); border-radius: 14px; padding: 14px; margin-bottom: 10px; }
.b-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.b-bean-name { font-family: var(--f-serif); font-size: 17px; font-weight: 600; color: #fff; }
.b-bean-sub { font-size: 11px; color: rgba(255,255,255,.5); margin-top: 3px; }
.b-toggle { padding: 6px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; border: 1px solid rgba(93,196,102,.3); background: transparent; color: var(--ba5); cursor: pointer; }
.b-toggle.on { background: var(--ba3); color: #fff; border-color: var(--ba3); }
.b-btn { width: 100%; padding: 14px; border-radius: 12px; background: var(--ba3); color: #fff; font-weight: 600; font-size: 14px; border: none; cursor: pointer; margin-top: 12px; }
```

- [ ] **Step 2: Replace `src/shells/BaristaShell.jsx`**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Today from '../screens/barista/Today.jsx';
import Scan from '../screens/barista/Scan.jsx';
import Stats from '../screens/barista/Stats.jsx';
import BaristaProfile from '../screens/barista/BaristaProfile.jsx';
import BottomNav from '../components/BottomNav.jsx';
import '../styles/barista.css';

const NAV = [
  { to: '/barista',         end: true,  key: 'today',   icon: '◉' },
  { to: '/barista/scan',    end: false, key: 'scan',    icon: '⌬' },
  { to: '/barista/stats',   end: false, key: 'stats',   icon: '◈' },
  { to: '/barista/profile', end: false, key: 'profile', icon: '☻' }
];

export default function BaristaShell() {
  return (
    <div className="b-shell">
      <div className="b-body">
        <Routes>
          <Route index element={<Today />} />
          <Route path="scan" element={<Scan />} />
          <Route path="stats" element={<Stats />} />
          <Route path="profile" element={<BaristaProfile />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </div>
      <BottomNav items={NAV} theme="barista" />
    </div>
  );
}
```

- [ ] **Step 3: Create `src/screens/barista/Today.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { supabase } from '../../lib/supabase.js';

export default function Today() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [baristaProfile, setBaristaProfile] = useState(null);
  const [menu, setMenu] = useState([]);
  const [beans, setBeans] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: bp } = await supabase.from('barista_profiles')
        .select('*, cafes(id, name)')
        .eq('user_id', user.id).single();
      setBaristaProfile(bp);
      if (!bp?.cafe_id) return;
      const { data: menuRows } = await supabase.from('menu_today')
        .select('*, beans(name, origin)')
        .eq('cafe_id', bp.cafe_id)
        .order('updated_at', { ascending: false });
      setMenu(menuRows || []);
      const { data: beanRows } = await supabase.from('beans').select('id, name, origin').order('name');
      setBeans(beanRows || []);
    })();
  }, [user]);

  async function toggle(row) {
    await supabase.from('menu_today').update({ active: !row.active }).eq('id', row.id);
    setMenu(menu.map(m => m.id === row.id ? { ...m, active: !row.active } : m));
  }

  async function addBean(beanId) {
    await supabase.from('menu_today').insert({
      cafe_id: baristaProfile.cafe_id, barista_id: baristaProfile.id,
      bean_id: beanId, brew_method: 'V60', active: true
    });
    setAdding(false);
    const { data } = await supabase.from('menu_today')
      .select('*, beans(name, origin)').eq('cafe_id', baristaProfile.cafe_id);
    setMenu(data || []);
  }

  return (
    <>
      <div className="b-head">
        <div className="b-title">{t('barista.todayMenu')}</div>
      </div>
      {menu.map(m => (
        <div key={m.id} className="b-card">
          <div className="b-card-top">
            <div>
              <div className="b-bean-name">{m.beans?.name}</div>
              <div className="b-bean-sub">{m.beans?.origin} · {m.brew_method}</div>
            </div>
            <button className={`b-toggle${m.active ? ' on' : ''}`} onClick={() => toggle(m)}>
              {m.active ? 'LIVE' : 'OFF'}
            </button>
          </div>
        </div>
      ))}

      {!adding && <button className="b-btn" onClick={() => setAdding(true)}>+ {t('barista.addBean')}</button>}

      {adding && (
        <div className="b-card" style={{ marginTop: 12 }}>
          {beans.map(b => (
            <div key={b.id} onClick={() => addBean(b.id)}
                 style={{ padding: '8px 0', cursor: 'pointer', color: '#fff', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              {b.name} — <span style={{ color: 'rgba(255,255,255,.5)' }}>{b.origin}</span>
            </div>
          ))}
          <button className="b-btn" onClick={() => setAdding(false)} style={{ background: 'transparent', border: '1px solid var(--br)' }}>
            {t('admin.cancel')}
          </button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Create stubs for `Scan.jsx`, `Stats.jsx`, `BaristaProfile.jsx`**

```jsx
// src/screens/barista/Scan.jsx
export default function Scan() { return <div>Scan</div>; }
```
Repeat for `Stats.jsx` and `BaristaProfile.jsx`.

- [ ] **Step 5: Commit**

```bash
git add src/shells/BaristaShell.jsx src/styles/barista.css src/screens/barista/
git commit -m "Add barista shell and today's menu screen"
```

---

### Task 19: Barista Scan screen (QR decode)

**Files:**
- Replace: `src/screens/barista/Scan.jsx`

- [ ] **Step 1: Replace `src/screens/barista/Scan.jsx`**

```jsx
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase.js';
import { matchScore } from '../../lib/match.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function Scan() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const containerRef = useRef(null);
  const scannerRef = useRef(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const id = 'barista-qr-reader';
    const el = document.getElementById(id);
    if (!el) return;
    const scanner = new Html5Qrcode(id);
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 240 },
      async (decoded) => {
        scanner.stop().catch(() => {});
        await lookup(decoded);
      },
      () => {}
    ).catch(e => setErr(e.message || String(e)));

    return () => { try { scanner.stop(); scanner.clear(); } catch {} };
  }, []);

  async function lookup(userId) {
    const { data: tp } = await supabase.from('taste_profiles')
      .select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(1).single();
    const { data: profile } = await supabase.from('profiles')
      .select('display_name, avatar_emoji').eq('user_id', userId).single();
    const { data: bp } = await supabase.from('barista_profiles')
      .select('cafe_id').eq('user_id', user.id).single();
    const { data: menu } = await supabase.from('menu_today')
      .select('*, beans(*)').eq('cafe_id', bp.cafe_id).eq('active', true);
    const scored = (menu || []).map(m => ({ ...m, score: tp ? matchScore(tp, m.beans) : 75 }))
      .sort((a, b) => b.score - a.score);
    setResult({ profile, tp, menu: scored });
  }

  return (
    <div>
      <div className="b-title" style={{ marginBottom: 16 }}>{t('barista.scanCustomer')}</div>
      {!result && (
        <>
          <div id="barista-qr-reader" ref={containerRef} style={{ width: '100%', borderRadius: 14, overflow: 'hidden' }} />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', textAlign: 'center', marginTop: 12 }}>
            {t('barista.scanHint')}
          </div>
          {err && <div style={{ color: 'var(--terra)', marginTop: 8 }}>{err}</div>}
        </>
      )}
      {result && (
        <div>
          <div className="b-card">
            <div className="b-bean-name">{result.profile?.avatar_emoji} {result.profile?.display_name}</div>
            <div className="b-bean-sub">Level: {result.tp?.level}</div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 8px' }}>
            {t('barista.matchForThem')}
          </div>
          {result.menu.map(m => (
            <div key={m.id} className="b-card">
              <div className="b-card-top">
                <div>
                  <div className="b-bean-name">{m.beans?.name}</div>
                  <div className="b-bean-sub">{m.beans?.origin} · {m.brew_method}</div>
                </div>
                <div style={{ color: 'var(--ba5)', fontWeight: 700 }}>{m.score}%</div>
              </div>
            </div>
          ))}
          <button className="b-btn" onClick={() => { setResult(null); window.location.reload(); }}>
            Scan another
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Manual test**

```bash
npm run dev
```
Log in as a barista account (manually set role via Supabase dashboard or go through barista onboarding). Navigate to `/barista/scan`. Browser asks for camera permission. Show a consumer's QR code — the consumer profile and ranked menu should display.

- [ ] **Step 3: Commit**

```bash
git add src/screens/barista/Scan.jsx
git commit -m "Add barista QR scanner with customer profile lookup and match ranking"
```

---

### Task 20: Barista Stats + Profile

**Files:**
- Replace: `src/screens/barista/Stats.jsx`, `src/screens/barista/BaristaProfile.jsx`

- [ ] **Step 1: Replace `src/screens/barista/Stats.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { supabase } from '../../lib/supabase.js';

export default function Stats() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bp, setBp] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('barista_profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => setBp(data));
  }, [user]);

  if (!bp) return <div>{t('common.loading')}</div>;

  const stats = [
    { label: t('barista.kudos'), value: bp.kudos },
    { label: t('barista.scansThisMonth'), value: 0 },
    { label: t('barista.avgMatch'), value: '—' },
    { label: t('barista.repeatRate'), value: '—' }
  ];

  return (
    <div>
      <div className="b-title" style={{ marginBottom: 20 }}>{t('nav.stats')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} className="b-card">
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
              {s.label}
            </div>
            <div className="b-bean-name" style={{ fontSize: 28, marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/screens/barista/BaristaProfile.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { supabase } from '../../lib/supabase.js';
import LangSwitcher from '../../components/LangSwitcher.jsx';

export default function BaristaProfile() {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [bp, setBp] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('barista_profiles').select('*, cafes(name)').eq('user_id', user.id).single()
      .then(({ data }) => setBp(data));
  }, [user]);

  return (
    <div>
      <div className="b-title">{profile?.display_name}</div>
      <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 4 }}>
        {bp?.cafes?.name}
      </div>

      <div className="b-card" style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          Bio
        </div>
        <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.5 }}>{bp?.bio}</div>
      </div>

      <div className="b-card">
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          Specialties
        </div>
        <div style={{ fontSize: 13, color: '#fff' }}>{(bp?.specialties || []).join(' · ')}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <span style={{ fontSize: 13, color: '#fff' }}>{t('profile.language')}</span>
        <LangSwitcher />
      </div>

      <button className="b-btn" style={{ background: 'var(--terra)' }}
              onClick={async () => { await signOut(); navigate('/auth'); }}>
        {t('profile.signOut')}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/barista/Stats.jsx src/screens/barista/BaristaProfile.jsx
git commit -m "Add barista stats and profile screens"
```

---

## Phase 3 Checkpoint

- Barista onboarding creates `barista_profiles` row and sets role
- `/barista` shows today's menu with toggle + add bean
- `/barista/scan` opens camera and decodes consumer QR → shows ranked menu
- Stats + profile screens populate from barista_profiles
- Green theme throughout, English + Hebrew supported

---

## Phase 4: Admin + Roaster Shells (Tasks 21–28)

### Task 21: Admin Shell + Sidebar

**Files:**
- Create: `src/styles/admin.css`, `src/components/Sidebar.jsx`
- Replace stub: `src/shells/AdminShell.jsx`

- [ ] **Step 1: Create `src/styles/admin.css`**

```css
.a-shell { display: flex; min-height: 100vh; background: var(--bg); color: var(--cream); }
.a-side { width: 240px; flex-shrink: 0; background: var(--s1); border-inline-end: 1px solid var(--br); padding: 24px 16px; display: flex; flex-direction: column; }
.a-logo { font-family: var(--f-serif); font-size: 28px; font-weight: 700; margin-bottom: 28px; padding-inline-start: 8px; }
.a-logo em { color: var(--amber); font-style: normal; }
.a-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; color: var(--muted); font-size: 13px; font-weight: 500; margin-bottom: 4px; text-decoration: none; }
.a-nav-item.active { background: rgba(200,136,60,.08); color: var(--amber); }
.a-nav-item:hover:not(.active) { color: var(--cream); }
.a-main { flex: 1; padding: 32px 40px; overflow-y: auto; }
.a-h1 { font-family: var(--f-serif); font-size: 32px; color: var(--cream); margin-bottom: 24px; }
.a-card { background: var(--s1); border: 1px solid var(--br); border-radius: 14px; padding: 20px; }
.a-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
.a-stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
.a-stat-val { font-family: var(--f-serif); font-size: 32px; color: var(--cream); margin-top: 6px; }

.a-table { width: 100%; border-collapse: collapse; }
.a-table th { text-align: start; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); border-bottom: 1px solid var(--br); font-weight: 500; }
.a-table td { padding: 14px 12px; border-bottom: 1px solid var(--br); font-size: 13px; color: var(--cream); }
.a-table tr:hover td { background: rgba(200,136,60,.03); }
.a-btn { padding: 8px 14px; border-radius: 10px; background: var(--amber); color: #0d0a07; font-size: 13px; font-weight: 600; border: none; cursor: pointer; }
.a-btn-ghost { background: transparent; border: 1px solid var(--br); color: var(--cream); }
.a-btn-danger { background: var(--terra); color: #fff; }
.a-btn-row { display: flex; gap: 8px; }
.a-form-field { margin-bottom: 14px; }
.a-form-field label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 6px; }
.a-form-field input, .a-form-field textarea, .a-form-field select {
  width: 100%; padding: 12px 14px; background: var(--s2); border: 1px solid var(--br);
  border-radius: 10px; color: var(--cream); font-size: 14px; outline: none;
}
.a-form-field input:focus, .a-form-field textarea:focus, .a-form-field select:focus { border-color: var(--amber); }
.a-role-badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
.a-role-consumer { background: rgba(125,154,110,.15); color: var(--sage2); }
.a-role-barista { background: rgba(93,196,102,.15); color: var(--ba5); }
.a-role-roaster { background: rgba(196,97,74,.15); color: var(--terra); }
.a-role-admin { background: rgba(200,136,60,.15); color: var(--amber); }
```

- [ ] **Step 2: Create `src/components/Sidebar.jsx`**

```jsx
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LangSwitcher from './LangSwitcher.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function Sidebar({ items, title = 'Brew' }) {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  return (
    <aside className="a-side">
      <div className="a-logo">{title}<em>ly</em></div>
      <nav style={{ flex: 1 }}>
        {items.map(it => (
          <NavLink key={it.to} to={it.to} end={it.end}
                   className={({ isActive }) => `a-nav-item${isActive ? ' active' : ''}`}>
            <span>{it.icon}</span>
            <span>{t(`nav.${it.key}`)}</span>
          </NavLink>
        ))}
      </nav>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <LangSwitcher />
        <button onClick={signOut}
                style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          {t('profile.signOut')}
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Replace `src/shells/AdminShell.jsx`**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Dashboard from '../screens/admin/Dashboard.jsx';
import Roasteries from '../screens/admin/Roasteries.jsx';
import AdminBeans from '../screens/admin/AdminBeans.jsx';
import Cafes from '../screens/admin/Cafes.jsx';
import Users from '../screens/admin/Users.jsx';
import '../styles/admin.css';

const NAV = [
  { to: '/admin',            end: true,  key: 'dashboard',  icon: '◈' },
  { to: '/admin/roasteries', end: false, key: 'roasteries', icon: '☕' },
  { to: '/admin/beans',      end: false, key: 'beans',      icon: '◉' },
  { to: '/admin/cafes',      end: false, key: 'cafes',      icon: '⌂' },
  { to: '/admin/users',      end: false, key: 'users',      icon: '☻' }
];

export default function AdminShell() {
  return (
    <div className="a-shell">
      <Sidebar items={NAV} />
      <main className="a-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="roasteries" element={<Roasteries />} />
          <Route path="beans" element={<AdminBeans />} />
          <Route path="cafes" element={<Cafes />} />
          <Route path="users" element={<Users />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Create stub admin screen files**

Create `src/screens/admin/Dashboard.jsx`, `Roasteries.jsx`, `AdminBeans.jsx`, `Cafes.jsx`, `Users.jsx` each with:
```jsx
export default function X() { return <div>X</div>; }
```

- [ ] **Step 5: Commit**

```bash
git add src/shells/AdminShell.jsx src/styles/admin.css src/components/Sidebar.jsx src/screens/admin/
git commit -m "Add admin shell with dark sidebar layout and placeholder screens"
```

---

### Task 22: Admin Dashboard

**Files:**
- Replace: `src/screens/admin/Dashboard.jsx`

- [ ] **Step 1: Replace `src/screens/admin/Dashboard.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase.js';

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ users: 0, cafes: 0, menu: 0 });

  useEffect(() => {
    (async () => {
      const [u, c, m] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('cafes').select('*', { count: 'exact', head: true }),
        supabase.from('menu_today').select('*', { count: 'exact', head: true }).eq('active', true)
      ]);
      setStats({ users: u.count || 0, cafes: c.count || 0, menu: m.count || 0 });
    })();
  }, []);

  return (
    <>
      <h1 className="a-h1">{t('nav.dashboard')}</h1>
      <div className="a-stat-grid">
        <div className="a-card">
          <div className="a-stat-label">{t('admin.totalUsers')}</div>
          <div className="a-stat-val">{stats.users}</div>
        </div>
        <div className="a-card">
          <div className="a-stat-label">{t('admin.activeCafes')}</div>
          <div className="a-stat-val">{stats.cafes}</div>
        </div>
        <div className="a-card">
          <div className="a-stat-label">{t('admin.menuUpdates')}</div>
          <div className="a-stat-val">{stats.menu}</div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/admin/Dashboard.jsx
git commit -m "Add admin dashboard with count stats"
```

---

### Task 23: Admin Roasteries CRUD

**Files:**
- Replace: `src/screens/admin/Roasteries.jsx`

- [ ] **Step 1: Replace `src/screens/admin/Roasteries.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase.js';

const EMPTY = { id: '', name: '', city: '', emoji: '☕', website: '', description: '', tags: '' };

export default function Roasteries() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load() {
    const { data } = await supabase.from('roasteries').select('*').order('name');
    setRows(data || []);
  }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    const payload = { ...editing, tags: editing.tags.split(',').map(s => s.trim()).filter(Boolean) };
    if (editing._new) {
      await supabase.from('roasteries').insert(payload);
    } else {
      delete payload._new;
      await supabase.from('roasteries').update(payload).eq('id', editing.id);
    }
    setEditing(null); load();
  }

  async function del(id) {
    if (!confirm(t('admin.confirmDelete'))) return;
    await supabase.from('roasteries').delete().eq('id', id);
    load();
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="a-h1" style={{ margin: 0 }}>{t('nav.roasteries')}</h1>
        <button className="a-btn" onClick={() => setEditing({ ...EMPTY, _new: true, tags: '' })}>
          + {t('admin.create')}
        </button>
      </div>

      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="a-table">
          <thead><tr><th>Name</th><th>City</th><th>Tags</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.emoji} {r.name}</td>
                <td>{r.city}</td>
                <td style={{ color: 'var(--muted)' }}>{(r.tags || []).join(', ')}</td>
                <td>
                  <div className="a-btn-row">
                    <button className="a-btn a-btn-ghost" onClick={() => setEditing({ ...r, tags: (r.tags || []).join(', ') })}>
                      {t('admin.edit')}
                    </button>
                    <button className="a-btn a-btn-danger" onClick={() => del(r.id)}>
                      {t('admin.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
             onClick={() => setEditing(null)}>
          <form className="a-card" onClick={e => e.stopPropagation()} onSubmit={save}
                style={{ width: 480, maxWidth: '90vw' }}>
            <div className="a-form-field">
              <label>ID (slug)</label>
              <input value={editing.id} disabled={!editing._new}
                     onChange={e => setEditing({ ...editing, id: e.target.value })} required />
            </div>
            <div className="a-form-field">
              <label>Name</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div className="a-form-field">
              <label>City</label>
              <input value={editing.city} onChange={e => setEditing({ ...editing, city: e.target.value })} required />
            </div>
            <div className="a-form-field">
              <label>Emoji</label>
              <input value={editing.emoji} onChange={e => setEditing({ ...editing, emoji: e.target.value })} />
            </div>
            <div className="a-form-field">
              <label>Website</label>
              <input value={editing.website || ''} onChange={e => setEditing({ ...editing, website: e.target.value })} />
            </div>
            <div className="a-form-field">
              <label>Description</label>
              <textarea rows={3} value={editing.description || ''}
                        onChange={e => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="a-form-field">
              <label>Tags (comma-separated)</label>
              <input value={editing.tags} onChange={e => setEditing({ ...editing, tags: e.target.value })} />
            </div>
            <div className="a-btn-row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="a-btn a-btn-ghost" onClick={() => setEditing(null)}>
                {t('admin.cancel')}
              </button>
              <button type="submit" className="a-btn">{t('admin.save')}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/admin/Roasteries.jsx
git commit -m "Add admin roasteries CRUD with modal form"
```

---

### Task 24: Admin Beans CRUD

**Files:**
- Replace: `src/screens/admin/AdminBeans.jsx`

- [ ] **Step 1: Replace `src/screens/admin/AdminBeans.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase.js';

const EMPTY = {
  id: '', roastery_id: '', name: '', origin: '', process: '', roast: '',
  score: 85, price: '', flavors: '',
  acidity: 5, body: 5, sweetness: 5, fruitiness: 5, intensity: 5, aroma: 5, finish: 5,
  trend: 'steady', methods: ''
};

const NUMERIC = ['score','acidity','body','sweetness','fruitiness','intensity','aroma','finish'];

export default function AdminBeans() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [roasteries, setRoasteries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');

  async function load() {
    const { data } = await supabase.from('beans').select('*, roasteries(name)').order('name');
    setRows(data || []);
  }
  useEffect(() => {
    load();
    supabase.from('roasteries').select('id, name').then(({ data }) => setRoasteries(data || []));
  }, []);

  const filtered = filter === 'all' ? rows : rows.filter(r => r.roastery_id === filter);

  async function save(e) {
    e.preventDefault();
    const payload = {
      ...editing,
      flavors: editing.flavors.split(',').map(s => s.trim()).filter(Boolean),
      methods: editing.methods.split(',').map(s => s.trim()).filter(Boolean)
    };
    NUMERIC.forEach(k => { payload[k] = Number(payload[k]); });
    if (editing._new) {
      await supabase.from('beans').insert(payload);
    } else {
      delete payload._new;
      await supabase.from('beans').update(payload).eq('id', editing.id);
    }
    setEditing(null); load();
  }

  async function del(id) {
    if (!confirm(t('admin.confirmDelete'))) return;
    await supabase.from('beans').delete().eq('id', id);
    load();
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="a-h1" style={{ margin: 0 }}>{t('nav.beans')}</h1>
        <button className="a-btn" onClick={() => setEditing({ ...EMPTY, _new: true })}>
          + {t('admin.create')}
        </button>
      </div>

      <div style={{ marginBottom: 14 }}>
        <select className="a-form-field-select"
                value={filter} onChange={e => setFilter(e.target.value)}
                style={{ padding: '8px 12px', background: 'var(--s2)', color: 'var(--cream)', border: '1px solid var(--br)', borderRadius: 8 }}>
          <option value="all">All roasteries</option>
          {roasteries.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="a-table">
          <thead><tr><th>Name</th><th>Roastery</th><th>Origin</th><th>Score</th><th></th></tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td style={{ color: 'var(--muted)' }}>{r.roasteries?.name}</td>
                <td>{r.origin}</td>
                <td>{r.score}</td>
                <td>
                  <div className="a-btn-row">
                    <button className="a-btn a-btn-ghost"
                            onClick={() => setEditing({
                              ...r,
                              flavors: (r.flavors || []).join(', '),
                              methods: (r.methods || []).join(', ')
                            })}>
                      {t('admin.edit')}
                    </button>
                    <button className="a-btn a-btn-danger" onClick={() => del(r.id)}>
                      {t('admin.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, overflowY: 'auto', padding: 20 }}
             onClick={() => setEditing(null)}>
          <form className="a-card" onClick={e => e.stopPropagation()} onSubmit={save}
                style={{ width: 560, maxWidth: '90vw' }}>
            <div className="a-form-field"><label>ID (slug)</label>
              <input value={editing.id} disabled={!editing._new}
                     onChange={e => setEditing({ ...editing, id: e.target.value })} required />
            </div>
            <div className="a-form-field"><label>Roastery</label>
              <select value={editing.roastery_id}
                      onChange={e => setEditing({ ...editing, roastery_id: e.target.value })} required>
                <option value="">Select…</option>
                {roasteries.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="a-form-field"><label>Name</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="a-form-field"><label>Origin</label>
                <input value={editing.origin || ''} onChange={e => setEditing({ ...editing, origin: e.target.value })} />
              </div>
              <div className="a-form-field"><label>Process</label>
                <input value={editing.process || ''} onChange={e => setEditing({ ...editing, process: e.target.value })} />
              </div>
              <div className="a-form-field"><label>Roast</label>
                <input value={editing.roast || ''} onChange={e => setEditing({ ...editing, roast: e.target.value })} />
              </div>
              <div className="a-form-field"><label>Price</label>
                <input value={editing.price || ''} onChange={e => setEditing({ ...editing, price: e.target.value })} />
              </div>
              <div className="a-form-field"><label>Score (0–100)</label>
                <input type="number" step="0.1" value={editing.score}
                       onChange={e => setEditing({ ...editing, score: e.target.value })} />
              </div>
              <div className="a-form-field"><label>Trend</label>
                <select value={editing.trend}
                        onChange={e => setEditing({ ...editing, trend: e.target.value })}>
                  <option>hot</option><option>rising</option><option>steady</option><option>new</option>
                </select>
              </div>
            </div>
            <div className="a-form-field"><label>Flavors (comma-separated)</label>
              <input value={editing.flavors} onChange={e => setEditing({ ...editing, flavors: e.target.value })} />
            </div>
            <div className="a-form-field"><label>Brew methods (comma-separated)</label>
              <input value={editing.methods} onChange={e => setEditing({ ...editing, methods: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              {['acidity','body','sweetness','fruitiness','intensity','aroma','finish'].map(k => (
                <div key={k} className="a-form-field" style={{ margin: 0 }}>
                  <label>{k}</label>
                  <input type="number" step="0.1" min="0" max="10"
                         value={editing[k]}
                         onChange={e => setEditing({ ...editing, [k]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="a-btn-row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="a-btn a-btn-ghost" onClick={() => setEditing(null)}>{t('admin.cancel')}</button>
              <button type="submit" className="a-btn">{t('admin.save')}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/admin/AdminBeans.jsx
git commit -m "Add admin beans CRUD with all taste attributes"
```

---

### Task 25: Admin Cafes CRUD

**Files:**
- Replace: `src/screens/admin/Cafes.jsx`

- [ ] **Step 1: Replace `src/screens/admin/Cafes.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase.js';

const EMPTY = { name: '', addr: '', lat: '', lng: '', hours: '', roastery_id: '' };

export default function Cafes() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [roasteries, setRoasteries] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load() {
    const { data } = await supabase.from('cafes').select('*, roasteries(name)').order('name');
    setRows(data || []);
  }
  useEffect(() => {
    load();
    supabase.from('roasteries').select('id, name').then(({ data }) => setRoasteries(data || []));
  }, []);

  async function save(e) {
    e.preventDefault();
    const payload = {
      name: editing.name, addr: editing.addr, hours: editing.hours,
      lat: editing.lat ? Number(editing.lat) : null,
      lng: editing.lng ? Number(editing.lng) : null,
      roastery_id: editing.roastery_id || null
    };
    if (editing.id) {
      await supabase.from('cafes').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('cafes').insert(payload);
    }
    setEditing(null); load();
  }

  async function del(id) {
    if (!confirm(t('admin.confirmDelete'))) return;
    await supabase.from('cafes').delete().eq('id', id);
    load();
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="a-h1" style={{ margin: 0 }}>{t('nav.cafes')}</h1>
        <button className="a-btn" onClick={() => setEditing({ ...EMPTY })}>+ {t('admin.create')}</button>
      </div>

      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="a-table">
          <thead><tr><th>Name</th><th>Address</th><th>Roastery</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td style={{ color: 'var(--muted)' }}>{r.addr}</td>
                <td>{r.roasteries?.name || '—'}</td>
                <td>
                  <div className="a-btn-row">
                    <button className="a-btn a-btn-ghost" onClick={() => setEditing({ ...r })}>{t('admin.edit')}</button>
                    <button className="a-btn a-btn-danger" onClick={() => del(r.id)}>{t('admin.delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
             onClick={() => setEditing(null)}>
          <form className="a-card" onClick={e => e.stopPropagation()} onSubmit={save}
                style={{ width: 480, maxWidth: '90vw' }}>
            <div className="a-form-field"><label>Name</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div className="a-form-field"><label>Address</label>
              <input value={editing.addr || ''} onChange={e => setEditing({ ...editing, addr: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="a-form-field"><label>Latitude</label>
                <input type="number" step="0.000001" value={editing.lat || ''}
                       onChange={e => setEditing({ ...editing, lat: e.target.value })} />
              </div>
              <div className="a-form-field"><label>Longitude</label>
                <input type="number" step="0.000001" value={editing.lng || ''}
                       onChange={e => setEditing({ ...editing, lng: e.target.value })} />
              </div>
            </div>
            <div className="a-form-field"><label>Hours</label>
              <input value={editing.hours || ''} onChange={e => setEditing({ ...editing, hours: e.target.value })} />
            </div>
            <div className="a-form-field"><label>Roastery</label>
              <select value={editing.roastery_id || ''}
                      onChange={e => setEditing({ ...editing, roastery_id: e.target.value })}>
                <option value="">None</option>
                {roasteries.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="a-btn-row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="a-btn a-btn-ghost" onClick={() => setEditing(null)}>{t('admin.cancel')}</button>
              <button type="submit" className="a-btn">{t('admin.save')}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/admin/Cafes.jsx
git commit -m "Add admin cafes CRUD with lat/lng editing"
```

---

### Task 26: Admin Users — role management

**Files:**
- Replace: `src/screens/admin/Users.jsx`

- [ ] **Step 1: Replace `src/screens/admin/Users.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase.js';

const ROLES = ['consumer', 'barista', 'roaster', 'admin'];

export default function Users() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);

  async function load() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setRows(data || []);
  }
  useEffect(() => { load(); }, []);

  async function setRole(userId, role) {
    await supabase.from('profiles').update({ role }).eq('user_id', userId);
    load();
  }

  return (
    <>
      <h1 className="a-h1">{t('nav.users')}</h1>
      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="a-table">
          <thead><tr><th>Name</th><th>Role</th><th>Change role</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.avatar_emoji} {r.display_name}</td>
                <td><span className={`a-role-badge a-role-${r.role}`}>{r.role}</span></td>
                <td>
                  <div className="a-btn-row">
                    {ROLES.filter(role => role !== r.role).map(role => (
                      <button key={role} className="a-btn a-btn-ghost" onClick={() => setRole(r.user_id, role)}>
                        → {role}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/admin/Users.jsx
git commit -m "Add admin users screen with role change"
```

---

### Task 27: Roaster Shell + screens + onboarding

**Files:**
- Replace stubs: `src/shells/RoasterShell.jsx`, `src/screens/onboard/RoasterOnboard.jsx`, `src/screens/onboard/ShopOnboard.jsx`
- Create: `src/screens/roaster/RoasterDashboard.jsx`, `RoasterBeans.jsx`, `RoasterCafes.jsx`

- [ ] **Step 1: Replace `src/shells/RoasterShell.jsx`**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import RoasterDashboard from '../screens/roaster/RoasterDashboard.jsx';
import RoasterBeans from '../screens/roaster/RoasterBeans.jsx';
import RoasterCafes from '../screens/roaster/RoasterCafes.jsx';
import '../styles/admin.css';

const NAV = [
  { to: '/roaster',        end: true,  key: 'dashboard', icon: '◈' },
  { to: '/roaster/beans',  end: false, key: 'beans',     icon: '◉' },
  { to: '/roaster/cafes',  end: false, key: 'cafes',     icon: '⌂' }
];

export default function RoasterShell() {
  return (
    <div className="a-shell">
      <Sidebar items={NAV} />
      <main className="a-main">
        <Routes>
          <Route index element={<RoasterDashboard />} />
          <Route path="beans" element={<RoasterBeans />} />
          <Route path="cafes" element={<RoasterCafes />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/screens/roaster/RoasterDashboard.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { supabase } from '../../lib/supabase.js';

export default function RoasterDashboard() {
  const { user } = useAuth();
  const [roastery, setRoastery] = useState(null);
  const [counts, setCounts] = useState({ beans: 0, cafes: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: r } = await supabase.from('roasteries').select('*').eq('owner_id', user.id).single();
      setRoastery(r);
      if (!r) return;
      const [b, c] = await Promise.all([
        supabase.from('beans').select('*', { count: 'exact', head: true }).eq('roastery_id', r.id),
        supabase.from('cafes').select('*', { count: 'exact', head: true }).eq('roastery_id', r.id)
      ]);
      setCounts({ beans: b.count || 0, cafes: c.count || 0 });
    })();
  }, [user]);

  if (!roastery) return <div>Loading…</div>;

  return (
    <>
      <h1 className="a-h1">{roastery.emoji} {roastery.name}</h1>
      <div style={{ color: 'var(--muted)', marginBottom: 24 }}>{roastery.city}</div>
      <div className="a-stat-grid">
        <div className="a-card">
          <div className="a-stat-label">Beans</div>
          <div className="a-stat-val">{counts.beans}</div>
        </div>
        <div className="a-card">
          <div className="a-stat-label">Cafés</div>
          <div className="a-stat-val">{counts.cafes}</div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Create `src/screens/roaster/RoasterBeans.jsx`**

Same code as `src/screens/admin/AdminBeans.jsx` from Task 24, but:
- Filter query to beans where `roastery_id = <my roastery id>`
- Lock the `roastery_id` field in the form to the roaster's own roastery
- Load my roastery in a `useEffect` at top: `supabase.from('roasteries').select('id').eq('owner_id', user.id).single()`
- Filter `load()` query with `.eq('roastery_id', myRoastery.id)`
- When creating a new bean, set `editing.roastery_id = myRoastery.id` automatically and hide the select
- Everything else identical

Write the full file with those modifications (no shortcuts).

- [ ] **Step 4: Create `src/screens/roaster/RoasterCafes.jsx`**

Same code as `src/screens/admin/Cafes.jsx` from Task 25 but:
- Filter query: `.eq('roastery_id', myRoastery.id)`
- Force `editing.roastery_id = myRoastery.id` on create, hide the select
- Load my roastery in a `useEffect` the same way

Write the full file with those modifications.

- [ ] **Step 5: Replace `src/screens/onboard/RoasterOnboard.jsx`**

```jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { supabase } from '../../lib/supabase.js';
import '../../styles/onboard.css';

function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export default function RoasterOnboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [tags, setTags] = useState('');
  const [desc, setDesc] = useState('');

  const STEPS = 4;
  const canNext = [name.trim().length > 0, city.trim().length > 0, true, true][step];

  async function finish() {
    const id = slug(name);
    await supabase.from('roasteries').insert({
      id, name, city, description: desc,
      tags: tags.split(',').map(s => s.trim()).filter(Boolean),
      owner_id: user.id, emoji: '☕'
    });
    await supabase.from('profiles').update({ role: 'roaster', display_name: name }).eq('user_id', user.id);
    window.location.assign('/');
  }

  return (
    <div className="ob">
      <div className="ob-head">
        <div className="pdots">{Array.from({length: STEPS}).map((_, i) => (
          <div key={i} className={`pdot${i === step ? ' a' : i < step ? ' d' : ''}`} />
        ))}</div>
        <div className="ob-title">
          {step === 0 && 'Roastery name'}
          {step === 1 && 'City'}
          {step === 2 && 'Tags'}
          {step === 3 && 'Short description'}
        </div>
      </div>
      <div className="ob-body">
        {step === 0 && <input className="ob-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Origin Coffee Roasting" />}
        {step === 1 && <input className="ob-input" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Cape Town" />}
        {step === 2 && <input className="ob-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="direct trade, microlots, washed-only" />}
        {step === 3 && <textarea className="ob-input" rows={5} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What makes your roastery unique?" />}
      </div>
      <div className="ob-foot">
        {step > 0 && <button className="btn-back" onClick={() => setStep(step - 1)}>←</button>}
        <button className="btn-cont" disabled={!canNext}
                onClick={() => step === STEPS - 1 ? finish() : setStep(step + 1)}>
          {step === STEPS - 1 ? t('onboard.finish') : t('onboard.next')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Replace `src/screens/onboard/ShopOnboard.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { supabase } from '../../lib/supabase.js';
import '../../styles/onboard.css';

export default function ShopOnboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [addr, setAddr] = useState('');
  const [hours, setHours] = useState('');
  const [roasteries, setRoasteries] = useState([]);
  const [roasteryId, setRoasteryId] = useState('');

  useEffect(() => {
    supabase.from('roasteries').select('id, name').then(({ data }) => setRoasteries(data || []));
  }, []);

  const STEPS = 4;
  const canNext = [name.trim().length > 0, addr.trim().length > 0, true, true][step];

  async function finish() {
    await supabase.from('cafes').insert({
      name, addr, hours, roastery_id: roasteryId || null
    });
    await supabase.from('profiles').update({ role: 'admin', display_name: name }).eq('user_id', user.id);
    window.location.assign('/');
  }

  return (
    <div className="ob">
      <div className="ob-head">
        <div className="pdots">{Array.from({length: STEPS}).map((_, i) => (
          <div key={i} className={`pdot${i === step ? ' a' : i < step ? ' d' : ''}`} />
        ))}</div>
        <div className="ob-title">
          {step === 0 && 'Shop name'}
          {step === 1 && 'Address'}
          {step === 2 && 'Hours'}
          {step === 3 && 'Linked roastery (optional)'}
        </div>
      </div>
      <div className="ob-body">
        {step === 0 && <input className="ob-input" value={name} onChange={e => setName(e.target.value)} />}
        {step === 1 && <input className="ob-input" value={addr} onChange={e => setAddr(e.target.value)} />}
        {step === 2 && <input className="ob-input" value={hours} onChange={e => setHours(e.target.value)} placeholder="Mon–Fri 7–17" />}
        {step === 3 && (
          <select className="ob-input" value={roasteryId} onChange={e => setRoasteryId(e.target.value)}>
            <option value="">None</option>
            {roasteries.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        )}
      </div>
      <div className="ob-foot">
        {step > 0 && <button className="btn-back" onClick={() => setStep(step - 1)}>←</button>}
        <button className="btn-cont" disabled={!canNext}
                onClick={() => step === STEPS - 1 ? finish() : setStep(step + 1)}>
          {step === STEPS - 1 ? t('onboard.finish') : t('onboard.next')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/shells/RoasterShell.jsx src/screens/roaster/ src/screens/onboard/RoasterOnboard.jsx src/screens/onboard/ShopOnboard.jsx
git commit -m "Add roaster shell, roaster/shop onboarding, and scoped CRUD screens"
```

---

### Task 28: PWA manifest + install prompt

**Files:**
- Create: `public/icon-192.png`, `public/icon-512.png` (use any plain coffee-cup icon for the demo; can be generated from an emoji-to-PNG tool or a simple filled circle)
- Modify: `src/App.jsx` (inject install prompt)

- [ ] **Step 1: Generate or copy two PNG icons**

Place `icon-192.png` and `icon-512.png` in `public/`. For a quick placeholder, any solid-colored PNG with the letter B will do. The manifest defined in Task 1 already points at these paths.

- [ ] **Step 2: Verify manifest in `vite.config.js`**

Already set in Task 1. No changes needed unless icons were placed at a different path.

- [ ] **Step 3: Manual test PWA**

```bash
npm run build && npm run preview
```
Open the preview URL in Chrome. Devtools → Application → Manifest should show Brewly with both icons and `standalone` display. Click the install button in the URL bar.

- [ ] **Step 4: Commit**

```bash
git add public/icon-192.png public/icon-512.png
git commit -m "Add PWA icons"
```

---

## Phase 4 Checkpoint

- Admin can log in and CRUD roasteries, beans, cafes
- Admin can change user roles
- Roaster can log in and see only their own roastery's data
- Roaster and shop onboarding flows create the right records and set roles
- App is installable as a PWA

---

## Phase 5: Final verification (Task 29)

### Task 29: Full demo walkthrough + deployment

- [ ] **Step 1: Clean end-to-end test**

In Supabase dashboard, delete test users created during development. Then perform this full walkthrough in Chrome incognito:

1. Visit the deployed URL
2. Sign up as consumer → complete onboarding → see populated home screen
3. Toggle language to Hebrew → confirm RTL and translation on every consumer screen
4. Sign out
5. Sign up as barista → complete barista onboarding → see today's menu
6. Scan a saved consumer QR → confirm ranked menu appears
7. Sign out
8. Log in as admin (manually promote via SQL: `update profiles set role='admin' where user_id='<uuid>'`)
9. Visit `/admin` → verify all CRUD screens work
10. Visit `/admin/users` → promote another user to roaster
11. Sign in as roaster → confirm only their roastery is visible

- [ ] **Step 2: Deploy**

```bash
npm run build
```
Deploy `dist/` to Vercel or Netlify. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in the hosting dashboard. Add the deployed URL to Supabase Auth → URL Configuration → Site URL + Redirect URLs.

- [ ] **Step 3: Final commit + tag**

```bash
git add .
git commit -m "Final ready-state verification" --allow-empty
git tag ready-state-v1
```

---

## Self-Review

**Spec coverage checklist:**
- [x] §1 Architecture — Tasks 1, 8
- [x] §2 Tech stack — Task 1
- [x] §3 Data model — Tasks 4, 5
- [x] §4 Auth + routing — Tasks 6, 8, 9
- [x] §5 Consumer screens — Tasks 10–16
- [x] §5 Barista screens — Tasks 17–20
- [x] §5 Admin screens — Tasks 21–26
- [x] §5 Roaster screens — Task 27
- [x] §6 PWA — Tasks 1, 28
- [x] §7 Seed data — Task 5
- [x] §8 Localisation (Hebrew/RTL) — Task 3, referenced in every screen task

**Out-of-scope items correctly omitted:** push notifications, payments, chat, e-commerce, native apps.

**No placeholders:** every code block is complete. Tasks 27.3 and 27.4 reference the shape from earlier tasks but direct the engineer to write the full file with the specified modifications rather than copy-paste verbatim.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-14-brewly-ready-state.md`. Two execution options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?


