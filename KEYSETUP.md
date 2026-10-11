# KEYSETUP — Keys kahan paste karni hain

Jhon: har key tum khud paste karoge. Code mein kahin bhi asal key hardcoded nahi —
sab `process.env` se aati hain. Neeche exact file + exact jagah.

## Step 0 — Local dev ke liye (apne computer par test karna ho to)

```bash
cp api/.env.example api/.env
cp web/.env.example web/.env
```

Phir `api/.env` kholo aur `PASTE_YOUR_..._HERE` wali jagahon par asal keys likho.
**`api/.env` kabhi GitHub par push mat karna** (`.gitignore` mein hai).

## Step 1 — Render (backend) → Environment tab

Render dashboard → tumhari `bandmuft-api` service → **Environment** →
har aik add karo:

| Key | Kahan se milegi |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers → connection string (password apna daalna). Database ka naam `bandmuft` — FYP wale `medicheck` se alag |
| `JWT_ACCESS_SECRET` | Khud banao: neeche command dekho (32+ random characters) |
| `JWT_REFRESH_SECRET` | Khud banao: doosri random string (pehli wali se different) |
| `WEB_URL` | `https://tumhara-vercel-url.vercel.app` (Vercel deploy ke baad; local test ke liye `http://localhost:3000`) |
| `RESEND_API_KEY` | resend.com → API Keys → Create API Key → `re_...` se shuru hoti hai |
| `GEMINI_API_KEY` | Tumhare paas FYP wali hai — wohi paste karo |
| `MAIL_FROM` | `BandMuft <onboarding@resend.dev>` (domain verify ke baad apni domain wali) |
| `NODE_ENV` | `production` — **lazmi**: isi se login cookies cross-origin par kaam karti hain (`SameSite=None`) |
| `ADMIN_EMAIL` | (optional) Admin ka email — seed chalane par ye user admin ban jayega |
| `ADMIN_PASSWORD` | (optional) Admin ka password — sirf tab jab naya admin user banana ho |

Random secret banane ki command (apne computer ke terminal mein):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Do dafa chalao — aik `JWT_ACCESS_SECRET`, doosri `JWT_REFRESH_SECRET`.

## Step 2 — Vercel (frontend) → Environment Variables

Vercel dashboard → tumhara `bandmuft` project → Settings → Environment Variables:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://tumhara-render-url.onrender.com` (Render service ka URL, `/api` ke baghair) |

Save ke baad **Redeploy** karna — warna nayi value nahi lagegi.

## Step 3 — Baad mein (jab zaroorat ho)

| Key | Kab chahiye |
|---|---|
| `CONTACT_TO` | (optional) Contact form ke messages kis email par ayen — khaali ho to `ADMIN_EMAIL` par jayenge. Render → Environment mein add karo |
| `GEMINI_MODEL` | (optional) Gemini model override — default `gemini-2.5-flash` hai, aam tor par zaroorat nahi |

**Audio note (2026 update):** Cloudinary ki zaroorat khatam. Saari test audio files website ke
andar hain (`web/public/audio/`) aur Vercel ke saath hi serve hoti hain. Speaking recordings
database (MongoDB) mein save hoti hain — Admin Panel → Attempts se play/delete kar sakte ho.

**Seed note:** `node src/seed.js` ab 3 full mock tests + un se bane practice tests
(listening/reading/speaking) + writing prompts seed karta hai. Code update ke baad aik dafa
seed dobara chalana — purane users/certificates mehfooz rahte hain.

## Yaad rakho

- Passwords (email waghera) **kahin nahi** dalne — sirf upar wali keys.
- Koi key chat mein ya GitHub repo mein kabhi mat bhejo/likho.
- Key change karo to Render/Vercel par service **restart/redeploy** zaroori hai.
