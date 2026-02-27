# Weedoloveweed - Cannabis Diary App

## Overview
A shared cannabis diary/log for 4 users. Search strains, log sessions, write reviews, share discoveries, and track terpene profiles — all in a social feed format.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js (Auth.js) with Google OAuth |
| Database | PostgreSQL (via Vercel Postgres or Neon) |
| ORM | Prisma |
| Hosting | Vercel |
| Photos | Vercel Blob |
| Strain Data | Cannlytics API + Kushy seed data |
| Dispensary Search | Google Places API + manual entry |
| Charts | Recharts (terpene visualizations) |

---

## Design Direction

**Style: Colorful + Playful**
- Bold, vibrant color palette
- Fun gradients and expressive UI
- Strain type color coding:
  - Indica: Purple/violet tones
  - Sativa: Orange/warm tones
  - Hybrid: Green tones
- Rounded cards, playful typography
- PWA — installable on home screens from browser

---

## Core Features

### 1. Authentication (Google Login)
- Google OAuth via NextAuth.js
- Whitelist of 4 allowed Google email addresses
- Session persists on phone/browser (stays logged in)
- Each action tied to authenticated user

### 2. Strain Search & Lookup
- Search bar to find strains by name
- Pull data from strain API: name, type (indica/sativa/hybrid), terpene profile, THC/CBD %, effects, description, images
- Display strain detail cards with all info
- Fallback: if a strain isn't in the API, allow manual entry

### 3. Session Logging (Diary Entries)
Each log entry captures:
- **Strain** (linked from search or manual entry)
- **Date/time** (auto-filled, editable)
- **Rating** (1-5 stars)
- **Feelings/effects** (tags: relaxed, creative, hungry, sleepy, etc.)
- **Review** (free-text)
- **Dispensary** (from dispensary picker — see below)
- **Brand** (free-text)
- **Photos** (upload from phone camera/gallery)
- **Who logged it** (automatic from auth)

### 4. Social Feed (Home Page / Default Landing)
The feed is the **primary landing page** of the app. It's what you see when you open the app.

**Compact card format:**
- **Avatar + Name** (Google profile pic)
- **"[Name] is smoking [Strain Name]"** headline
- **Strain type badge** (Indica/Sativa/Hybrid — color-coded)
- **Star rating** (1-5)
- **Photo thumbnail** (if uploaded)
- **Dispensary name** as a small tag
- **Timestamp** ("2 hours ago", "Yesterday")
- Tap card to expand → full review, terpene info, brand, feelings, etc.
- **Quick actions** on each card: Bookmark the strain, share

Feed is chronological, newest first. All 4 users' posts are visible.

### 5. Badge Notifications (PWA)
- Red badge count on the PWA home screen icon showing unread feed posts
- Uses the Badging API (supported on Android Chrome + iOS Safari 16.4+)
- Tracks "last seen" timestamp per user, counts new posts since then
- Badge clears when app is opened
- No push notifications — lightweight and non-intrusive

### 6. Dispensary Tracking
**Hybrid approach: Google Places API + Manual Entry**

- **Location-based suggestions**: Auto-detect user location (browser geolocation) to suggest nearby dispensaries
- **Zip code search**: Type a zip code to find dispensaries in that area via Google Places API
- **Favorites**: Frequently-used dispensaries pinned to top of picker
- **Manual add**: Users can add a dispensary manually if not found
- **Pre-seeded dispensaries**:
  - Green Dragon (College Ave, Fort Collins, CO)
  - Livewell (Denver, CO)
  - Starbuds (Denver, CO)

When logging an entry, the dispensary picker shows:
1. Your favorite/recent dispensaries
2. Nearby dispensaries (via location or zip)
3. Option to add a new one manually

### 7. Bookmarks / Favorites
- Bookmark any strain to a personal "Want to Try" or "Favorites" list
- Quick access from profile page

### 8. Share
- Share a log entry or strain via link (public shareable URL)
- Copy-to-clipboard or native share on mobile

### 9. Terpene Profiles
- Visual terpene breakdown for each strain (radar chart or bar chart)
- Common terpenes: Myrcene, Limonene, Caryophyllene, Linalool, Pinene, Humulene, Terpinolene
- Color-coded for easy reading

---

## Data Model (Prisma Schema)

### Users
```
User
- id
- name
- email (Google)
- image (Google avatar)
- lastSeenFeed (DateTime — for badge notifications)
- entries (relation)
- bookmarks (relation)
```

### Strains
```
Strain
- id
- name
- type (indica / sativa / hybrid)
- description
- thcPercent
- cbdPercent
- imageUrl
- terpeneProfile (JSON - terpene name -> percentage)
- effects (JSON array)
- apiSourceId (external API reference)
- entries (relation)
```

### Diary Entries (Log)
```
Entry
- id
- userId (relation -> User)
- strainId (relation -> Strain)
- dispensaryId (relation -> Dispensary)
- rating (1-5)
- review (text)
- feelings (JSON array of tags)
- brand (string)
- photos (JSON array of URLs)
- createdAt
- updatedAt
```

### Dispensaries
```
Dispensary
- id
- name
- address
- city
- state
- zipCode
- latitude
- longitude
- googlePlaceId (optional — from Google Places API)
- isPreSeeded (boolean)
- entries (relation)
```

### Bookmarks
```
Bookmark
- id
- userId (relation -> User)
- strainId (relation -> Strain)
- listType ("favorites" | "want_to_try")
- createdAt
```

---

## Pages / Routes

| Route | Description |
|-------|-------------|
| `/` | Social feed (home) — compact cards, "Name is smoking..." |
| `/search` | Strain search page |
| `/strain/[id]` | Strain detail page (terpenes, info, past reviews) |
| `/log/new` | Create new diary entry |
| `/log/[id]` | View a single diary entry (expanded card) |
| `/profile` | User's own entries, bookmarks, stats |
| `/login` | Google sign-in page |

---

## Strain API Strategy

### Research Findings

**Weedmaps & Leafly — NOT available** for this use case:
- Weedmaps API is restricted to POS integration partners (menu/order data only, no strain encyclopedia)
- Leafly's public strain API was discontinued; current API is dispensary-only

### Recommended Approach: Cannlytics + Kushy Seed Data

**Primary API — [Cannlytics](https://cannlytics.com/api/data/strains/)**
- Free, no auth required
- Rich data: 20+ terpenes, detailed cannabinoids (THC, THCA, CBD, CBG, CBN, etc.), predicted effects/aromas
- Actively maintained (updated Oct 2025)
- Example: `GET https://cannlytics.com/api/data/strains/blue-dream`

**Seed Dataset — [Kushy Cannabis Dataset](https://github.com/kushyapp/cannabis-dataset)**
- Free open-source CSV/SQL with strain names, descriptions, images, breeder/lineage info, effects, flavors
- Import into our Postgres DB on initial setup
- Fills gaps Cannlytics doesn't cover (descriptions, images, lineage)

**Backup — [Strain API on RapidAPI](https://rapidapi.com/raygorodskij/api/Strain)**
- Free tier: 1,000 requests/month
- 2,000+ strains with name, type, effects, flavors
- No terpene data, but good for basic lookups

### Fallback: Manual Entry
- If a strain isn't found in any API/dataset, users can manually enter strain info
- User-contributed data stays in our Postgres DB
- Over time, the app builds its own enriched strain database

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Initialize Next.js project with TypeScript + Tailwind
- [ ] Set up Prisma + PostgreSQL schema (all models)
- [ ] Configure NextAuth.js with Google OAuth
- [ ] Whitelist 4 user emails
- [ ] Deploy skeleton to Vercel

### Phase 2: Social Feed (Home Page)
- [ ] Home feed page as default landing
- [ ] Compact feed cards ("Name is smoking Strain")
- [ ] Tap-to-expand full entry view
- [ ] Strain type badges (color-coded)
- [ ] Timestamps and avatars

### Phase 3: Strain Search & Data
- [ ] Integrate Cannlytics API
- [ ] Import Kushy seed dataset
- [ ] Build search page with autocomplete
- [ ] Strain detail page with terpene visualization
- [ ] Cache strain data in Postgres to reduce API calls

### Phase 4: Diary / Logging
- [ ] Create entry form (strain, rating, review, feelings, dispensary, photos)
- [ ] Dispensary picker (Google Places + favorites + manual)
- [ ] Photo upload via Vercel Blob
- [ ] Pre-seed dispensaries (Green Dragon, Livewell, Starbuds)
- [ ] Entry detail view
- [ ] Edit / delete entries

### Phase 5: Bookmarks & Sharing
- [ ] Bookmark strains (favorites / want to try)
- [ ] Profile page with personal entries + bookmarks
- [ ] Shareable entry links
- [ ] Mobile share integration

### Phase 6: Polish
- [ ] PWA setup (installable, home screen badge notifications)
- [ ] Terpene radar/bar charts (Recharts)
- [ ] User stats (total strains tried, favorite type, etc.)
- [ ] Colorful + playful theme polish

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | Google OAuth | Real identity, easy setup, persistent login |
| Photo storage | Vercel Blob | Simple, included with Vercel, sufficient for 4 users |
| App type | PWA | Installable from browser, no app store needed |
| Notifications | Badge count only | Lightweight, shows unread count on home screen icon |
| Privacy | All entries visible | It's a shared friend group — everything is public to the 4 users |
| Design | Colorful + playful | Bold colors, fun gradients, strain-type color coding |
| Feed style | Compact cards | Strain, rating, photo, dispensary at a glance — tap to expand |
| Dispensaries | Google Places + manual | Location search + pre-seeded favorites + manual add |
| Strain API | Cannlytics + Kushy seed | Best free data for terpenes/cannabinoids + seed dataset for coverage |

---

## Still Needed Before Building

1. **4 Google email addresses** to whitelist for auth
2. **Google Cloud API key** for Google Places (dispensary search) — needs a Google Cloud project with Places API enabled
3. **Vercel account** connected to this repo for deployments
