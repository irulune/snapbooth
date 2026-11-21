# Snapbooth

A song-themed photobooth with a small social network on top. Take a four-photo strip, then keep it private or share it to the feed.

- `index.html`: the app (home feed, search, profiles, messages). Hash-routed, no build step.
- `booth.html`: the photobooth. Save privately, print, download, or share to the feed.
- `api/song.js`: serverless route for iTunes previews (no key) and Musixmatch lyrics (set `MUSIXMATCH_API_KEY`).
- Backend: Supabase (Auth, Postgres with Row Level Security, Storage, Realtime for messages).
- The publishable Supabase key in the HTML files is meant to be public. Never commit a service role or secret key.
- Posts and avatars live in a public `posts` bucket. Private saves live in a private `strips` bucket.
- Not built yet: blocking, reporting, private accounts, notifications.
