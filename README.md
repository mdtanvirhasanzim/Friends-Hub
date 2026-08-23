# FriendsHub — Private Circle & Real-Time Location Platform

**FriendsHub** is a private, modern community web application designed exclusively for close-knit groups of friends. Its centerpiece feature is **real-time location sharing** on an interactive OpenStreetMap canvas with privacy controls, paired with community feeds, shared photo galleries, event RSVPs, and administrative controls.

---

## 🌟 Key Features

- **📍 Real-Time Location Radar (OpenStreetMap + Leaflet)**:
  - Watch live friend locations with status bubbles and smooth animations.
  - Proximity radar rings (1 km / 5 km / 10 km) centered on your position.
  - Direction compass, bearing markers, and one-click Google Maps navigation routing.
  - Real-time simulation engine to test movement without traveling.
  - Explicit **Location Sharing ON/OFF** toggle with privacy modes (Exact vs Approximate fuzzed coords).

- **📰 Community Feed**:
  - Share status updates, photos, and location-tagged check-ins.
  - Post reactions (animated likes) and nested comments.
  - Admin broadcast announcements pinned to the top.
  - Content filtering: All updates, Photos only, Meetups, and Discussions.

- **📸 Photo Gallery & High-Res Albums**:
  - Multiple albums (e.g. *Friends Trip, Meetup, University, Birthday*).
  - High-resolution modal lightbox viewer with download capabilities.
  - Multi-file drag-and-drop uploader.

- **📅 Meetups & Events Planning**:
  - Schedule upcoming friend gatherings with time, venue, and GPS coordinates.
  - Three-tier RSVP: `Going ✅`, `Maybe 🤔`, `Decline ❌`.
  - Single-click calendar export (`.ics` format for Google Calendar and Apple Calendar).
  - "View on Live Map" navigation shortcut.

- **👥 Friends Directory & Profiles**:
  - Online/Offline status indicators and last seen timestamps.
  - Full member profiles with contact details, personal photo reels, and post history.

- **🛡️ Admin Console**:
  - Manage membership (toggle roles: Admin/Member, suspend/activate accounts).
  - Content moderation queue for reported posts.
  - Broadcast announcement manager.
  - Generate single-use private invitation links.

---

## 🚀 Quick Start & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🗄️ Supabase Backend Setup (Optional)

FriendsHub includes a built-in **reactive data store** with localStorage persistence so that the application works out of the box with sample data and persona switching.

To connect a live **Supabase** backend:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard and run the entire script provided in [`supabase_schema.sql`](./supabase_schema.sql).
3. Create a public Storage bucket named `photos`.
4. Copy your project credentials into `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-jwt-key
   ```

---

## 🌐 Netlify Deployment Guide

1. Push this repository to **GitHub**.
2. Go to **[Netlify](https://app.netlify.com)** and choose **Add new site > Import an existing project**.
3. Select your GitHub repository.
4. Netlify will automatically detect `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. (Optional) In **Site configuration > Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy Site** — your private friends hub is live!

---

## 🔒 Security & Privacy

- Location sharing is **disabled by default** on account creation.
- Location coordinates are only queryable when a member explicitly toggles location sharing to **ON**.
- Members can switch to **Approximate Location Mode** to fuzz their location by ±500 meters.
- Protected by Row Level Security (RLS) policies preventing unauthenticated public reads.
