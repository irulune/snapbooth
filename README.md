# Snapbooth

A song-themed photobooth that runs in the browser. Pick a song vibe, choose a filter, take four photos, and save the strip as a PNG.

- No build step, no dependencies: one static `index.html`.
- Photos never leave your device. The camera feed is processed locally.
- Needs HTTPS (or localhost) for camera access.
- Filters use `CanvasRenderingContext2D.filter`; browsers without it save unfiltered photos.

## Run locally

```
npx serve .
```

## Add a song

Add an entry to the `T` array in `index.html`: `{t:'title',a:'artist',c:'original caption',k:'#hex',f:'filterName'}`. Captions are original lines, not song lyrics.
