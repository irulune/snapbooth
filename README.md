# Snapbooth

A song-themed photobooth with a small social network on top. Take a four-photo set, then post it as a collage or a tall strip, share it with everyone, followers only, or just yourself.

- `index.html`, `app.js`, `create.js`: the app (feed, search, profiles, messages, create flow). Hash-routed, no build step.
- `booth.html`: redirects to the create flow.
- `api/song.js`: serverless route for iTunes previews (no key) and Musixmatch lyrics (set `MUSIXMATCH_API_KEY`).
- Backend: Supabase (Auth, Postgres with Row Level Security, Storage, Realtime for messages).
- Images: public posts live in the public `posts` bucket. Followers-only and private posts live in the private `strips` bucket and are shown with signed URLs. Changing a post's visibility moves the file when needed.
- Right-click a post (or tap its dots) for visibility, caption, comment and like settings, print, download and delete.
- The publishable Supabase key is meant to be public. Never commit a service role or secret key.
- Not built yet: blocking, reporting, private accounts, notifications.
