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
| Strain Data | Open cannabis strain API (see API section below) |

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
- **Purchase info** (dispensary name, brand)
- **Photos** (upload from phone camera/gallery)
- **Who logged it** (automatic from auth)

### 4. Social Feed
- Real-time-ish feed on the home page
- Shows: **"[Name] is smoking [Strain Name]"**
- Each feed item links to the full log entry
- Shows strain thumbnail, quick rating, and a snippet of the review
- Chronological, newest first

### 5. Bookmarks / Favorites
- Bookmark any strain to a personal "Want to Try" or "Favorites" list
- Quick access from profile page

### 6. Share
- Share a log entry or strain via link (public shareable URL)
- Copy-to-clipboard or native share on mobile

### 7. Terpene Profiles
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
- rating (1-5)
- review (text)
- feelings (JSON array of tags)
- dispensary (string)
- brand (string)
- photos (JSON array of URLs)
- createdAt
- updatedAt
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
| `/` | Social feed (home) — "Name is smoking..." |
| `/search` | Strain search page |
| `/strain/[id]` | Strain detail page (terpenes, info, past reviews) |
| `/log/new` | Create new diary entry |
| `/log/[id]` | View a single diary entry |
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
- [ ] Set up Prisma + PostgreSQL schema
- [ ] Configure NextAuth.js with Google OAuth
- [ ] Whitelist 4 user emails
- [ ] Deploy skeleton to Vercel

### Phase 2: Strain Search & Data
- [ ] Integrate strain API (or seed database)
- [ ] Build search page with autocomplete
- [ ] Strain detail page with terpene visualization
- [ ] Cache strain data in Postgres to reduce API calls

### Phase 3: Diary / Logging
- [ ] Create entry form (strain, rating, review, feelings, dispensary, photos)
- [ ] Photo upload (Vercel Blob or similar)
- [ ] Entry detail view
- [ ] Edit / delete entries

### Phase 4: Social Feed
- [ ] Home feed showing all users' recent entries
- [ ] "Name is smoking Strain" format
- [ ] Link to full entry
- [ ] Strain thumbnails in feed

### Phase 5: Bookmarks & Sharing
- [ ] Bookmark strains (favorites / want to try)
- [ ] Profile page with personal entries + bookmarks
- [ ] Shareable entry links
- [ ] Mobile share integration

### Phase 6: Polish
- [ ] Mobile-responsive PWA setup (installable on phones)
- [ ] Terpene radar/bar charts
- [ ] User stats (total strains tried, favorite type, etc.)
- [ ] Dark mode (it's a weed app, come on)

---

## Open Questions for Discussion

1. **Strain API**: Weedmaps/Leafly APIs are generally restricted to business partners. We'll likely need an open alternative or seed our own data. See research findings above.

2. **Photo storage**: Vercel Blob (simple, included) vs Cloudinary (image optimization) vs S3?

3. **PWA vs native app**: A PWA (Progressive Web App) works great on phones, is installable from the browser, and avoids app store headaches. Recommended for a 4-person app.

4. **Notifications**: Want push notifications when someone posts to the feed? (Nice-to-have, not required for v1.)

5. **Privacy**: Should entries be visible to all 4 users by default, or should there be a "private" option?
