module.exports = async (req, res) => {
  const title = String(req.query.title || '').slice(0, 100);
  const artist = String(req.query.artist || '').slice(0, 100);
  if (!title) { res.status(400).json({ error: 'title required' }); return; }
  const out = { name: title, preview: null, art: null, lyrics: null, copyright: null, pixel: null };
  try {
    const r = await fetch('https://itunes.apple.com/search?' + new URLSearchParams({ term: title + ' ' + artist, entity: 'song', limit: '8' }));
    const j = await r.json();
    const first = artist.toLowerCase().split(' ')[0];
    const list = (j.results || []).filter(x => x.previewUrl);
    const hit = list.find(x => (x.artistName || '').toLowerCase().includes(first)) || list[0];
    if (hit) {
      out.name = hit.trackName;
      out.preview = hit.previewUrl;
      out.art = (hit.artworkUrl100 || '').replace('100x100', '300x300');
    }
  } catch (e) {}
  const key = process.env.MUSIXMATCH_API_KEY;
  if (key) {
    try {
      const u = 'https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?' + new URLSearchParams({ q_track: title, q_artist: artist, format: 'json', apikey: key });
      const j = await (await fetch(u)).json();
      const l = j.message && j.message.body && j.message.body.lyrics;
      if (l && l.lyrics_body) {
        out.lyrics = l.lyrics_body.split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('*') && !/^\(\d+\)$/.test(s));
        out.copyright = l.lyrics_copyright || null;
        out.pixel = l.pixel_tracking_url || null;
      }
    } catch (e) {}
  }
  res.setHeader('Cache-Control', out.lyrics ? 'no-store' : 'public, s-maxage=3600');
  res.status(200).json(out);
};
