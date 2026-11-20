# Snapbooth

A song-themed photobooth that runs in the browser. Pick a song vibe, choose a filter, take four photos, and keep the strip.

- Static page (`index.html`) plus one serverless route (`api/song.js`).
- Photos stay on your device until you choose Save to profile.
- Accounts and cloud storage use Supabase (Auth, a `strips` table, and a private `strips` storage bucket). Row Level Security limits every row and file to its owner.
- The publishable Supabase key in `index.html` is meant to be public. Never put a service role or secret key in this repo.
- Music: 30-second previews come from the iTunes Search API (no key needed).
- Lyrics: the Musixmatch API, called only from `api/song.js`. Set the `MUSIXMATCH_API_KEY` environment variable in Vercel to turn it on. Without it the lyrics panel says lyrics are unavailable. Lyrics are shown in the panel only and are never written onto saved strips.
- Saved strips can be printed one at a time or several per sheet.
- Camera access needs HTTPS (or localhost).

## Run locally

```
npx vercel dev
```

## Add a song

Add an entry to the `T` array in `index.html`: `{t:'title',a:'artist',c:'original caption',k:'#hex',f:'filterName'}`. Captions are your own words.
