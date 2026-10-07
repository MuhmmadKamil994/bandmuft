# BandMuft — Free IELTS Mock Tests

100% free IELTS preparation platform for Pakistani students.
English-only. No premium at launch (premium comes later).

## Structure

- `web/` — Next.js (App Router) frontend, deployed on Vercel
- `api/` — Express REST API, deployed on Render

## Deploy pattern (same as FYP)

1. GitHub monorepo, push this folder
2. Vercel → import `web/` (set `NEXT_PUBLIC_API_URL` to the Render URL)
3. Render → Web Service from `api/` (build: `npm install`, start: `npm start`)
4. MongoDB Atlas — separate database from FYP (`bandmuft`, not `medicheck`)

## Keys

Jhon pastes every key himself. See `KEYSETUP.md` (written at the end)
for exactly which file and where. In code, every secret reads from
`process.env` — nothing is hardcoded.
