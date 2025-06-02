# MP3 Cover Fetcher 🎵

Uno script Node.js che scarica automaticamente le copertine per i file `.mp3`, utilizzando una catena intelligente di servizi online: **iTunes**, **Spotify**, **Deezer**, **Last.fm**, **MusicBrainz**, **Discogs** e fallback gestito. Include:

- 🎯 Parsing intelligente del nome file per estrarre artista e titolo
- 🔀 Generazione di combinazioni di ricerca per coprire variazioni
- 🧼 Pulizia automatica dei nomi (rimozione di `feat.`, `remix`, `original mix`, ecc.)
- 📦 Salvataggio delle copertine direttamente nei file MP3
- 🧾 Logging dettagliato dei file per cui la copertina non è stata trovata
- 🧠 Priorità delle fonti configurabile (default: Spotify → iTunes → MusicBrainz → Discogs)

---

## 📦 Requisiti

- Node.js `>=18`
- Librerie (installate automaticamente via `npm/pnpm/yarn/ecc. install`)

---

## ⚙️ Installazione

```bash
git clone https://github.com/tuo-utente/mp3-cover-fetcher.git
cd mp3-cover-fetcher
npm install
