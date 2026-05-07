# GoodViews — Setup Guide

A complete guide to getting GoodViews running on your iPhone.
No coding experience needed — just follow each step in order.

---

## What you'll do

1. Create a GitHub account and upload the code
2. Create a Supabase account (your database)
3. Get a free TMDB API key (movie data)
4. Deploy to Vercel (live on the internet)
5. Add to your iPhone home screen

Total time: ~30–45 minutes

---

## Step 1 — GitHub (store your code)

1. Go to **github.com** and create a free account
2. Click the **+** icon → **New repository**
3. Name it `goodviews`, set to **Public**, click **Create repository**
4. Click **uploading an existing file**
5. Drag ALL the files from this folder into the browser window
6. Click **Commit changes**

---

## Step 2 — Supabase (your database)

1. Go to **supabase.com** and sign up for free
2. Click **New project**, give it a name (e.g. "goodviews"), choose a region close to you
3. Wait ~2 minutes for it to provision
4. Go to **SQL Editor** in the left sidebar → **New query**
5. Open the file `supabase-schema.sql` from this folder, copy everything, paste it in, click **Run**
   - You should see "Success" — this creates all your tables
6. Go to **Project Settings** → **API**
7. Copy these two values — you'll need them in Step 4:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ…`)

---

## Step 3 — TMDB API key (movie & TV data)

1. Go to **themoviedb.org** and create a free account
2. Go to **Settings** → **API** → **Create** → choose **Developer**
3. Fill in the form (app name: GoodViews, website: your Vercel URL once you have it, or just put `localhost`)
4. Copy your **API Key (v3 auth)** — you'll need it in Step 4

---

## Step 4 — Vercel (put it live on the internet)

1. Go to **vercel.com** and sign up using your GitHub account
2. Click **Add New Project** → find your `goodviews` repository → click **Import**
3. Before deploying, click **Environment Variables** and add these three:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | Your Supabase Project URL from Step 2 |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key from Step 2 |
   | `VITE_TMDB_API_KEY` | Your TMDB API key from Step 3 |

4. Click **Deploy** — wait about 2 minutes
5. Vercel gives you a URL like `goodviews.vercel.app` — that's your app!

---

## Step 5 — Add to your iPhone

1. Open the Vercel URL in **Safari** on your iPhone
2. Tap the **Share** button (the box with an arrow pointing up)
3. Scroll down and tap **Add to Home Screen**
4. Give it a name (GoodViews) and tap **Add**
5. It now appears on your home screen and opens full-screen like a real app 🎉

---

## Updating the app later

Whenever you want to change something:
1. Make changes to the files
2. Go back to your GitHub repository
3. Upload the changed files again
4. Vercel will automatically re-deploy in about 2 minutes

---

## Something not working?

Common issues:

**Blank screen after deploy:** Check that all 3 environment variables are set correctly in Vercel. Even a small typo will break it.

**"Invalid API key" on movie search:** Double-check your TMDB key. Note it can take up to 24 hours after creating your TMDB account to activate.

**Can't sign up / log in:** Make sure you ran the full SQL schema in Supabase. Also check that the Supabase URL and anon key are correct.

**Looks weird on iPhone:** Make sure you're opening in Safari specifically (not Chrome) for the "Add to Home Screen" option.
