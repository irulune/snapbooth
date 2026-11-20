# Snapbooth

A song-themed photobooth that runs in the browser. Pick a song vibe, choose a filter, take four photos, and keep the strip.

- Static site, no build step: one `index.html`.
- Photos stay on your device until you choose Save to profile.
- Accounts and cloud storage use Supabase (Auth, a `strips` table, and a private `strips` storage bucket). Row Level Security limits every row and file to its owner.
- The publishable key in `index.html` is meant to be public. Never put a service role or secret key in this repo.
- Camera access needs HTTPS (or localhost).
- Filters use `CanvasRenderingContext2D.filter`; browsers without it save unfiltered photos.

## Run locally

```
npx serve .
```

## Add a song

Add an entry to the `T` array in `index.html`: `{t:'title',a:'artist',c:'original caption',k:'#hex',f:'filterName'}`. Captions are original lines, not song lyrics.
