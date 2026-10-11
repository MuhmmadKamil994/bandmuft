# BandMuft — Nayi Update Deploy Karne Ka Tarika (Oct 2026 Build)

Ye package poori website ka naya version hai: 4-skill Full Mock Tests (Listening audio ke saath,
Reading, Writing — Gemini feedback, Speaking — mic recording + feedback), 16-subject Course
(7 steps har subject), naya Design-C certificate (QR verify ke saath), naya Admin Panel
(user manage, email change, password reset, ban, delete, recordings), Contact page, aur
Gemini fix (purana model band ho chuka tha — is liye writing feedback atakta tha).

**Koi paisa nahi lagega** — sab free tiers par hi hai. Databases (users, certificates) mehfooz
rahenge; purani site usi waqt tak chalti rahegi jab tak tum push nahi karte.

---

## Step 1 — Backup (2 minute)

Apne computer par `D:\Eites web` folder ki aik copy bana lo, naam rakho `Eites web - backup`.
Bas — safety ke liye.

## Step 2 — Naya code purane folder ke upar daalo

Is ZIP ko `D:\Eites web` ke andar hi extract karo ("Extract here" / sab files replace kar do).
**Tumhari `.env` files mehfooz rahengi** — ZIP mein `.env` shamil hi nahi hai, sirf code hai.
`node_modules` bhi ZIP mein nahi (wo deploy par khud ban jata hai).

## Step 3 — Render par aik chhoti setting (optional, 1 minute)

Render dashboard → `bandmuft-api` → Environment → aik nayi variable add karo:

| Key | Value |
|---|---|
| `CONTACT_TO` | Apni Gmail wali email (contact form ke messages yahan ayenge). Khaali choro to `ADMIN_EMAIL` wali email par hi jayenge — woh pehle se set hai, to ye step optional hai. |

`NODE_ENV=production` pehle se set hai — use mat cherna.

## Step 4 — Naye tests database mein daalo (Seed)

Apne computer par terminal/PowerShell kholo aur:

```bash
cd "D:\Eites web\api"
node src/seed.js
```

Ye 3 Full Mock Tests + 9 practice tests (Listening/Reading/Speaking alag alag) + writing
prompts database mein daal dega. Purane users aur certificates ko kuch nahi hoga.
(Seed tumhari local `api/.env` wali `MONGODB_URI` use karta hai — wohi jo production ki hai.)

## Step 5 — GitHub par push karo

```bash
cd "D:\Eites web"
git add .
git commit -m "BandMuft complete build: 4-skill mocks, course, new certificate, admin panel"
git push
```

Push hote hi **Vercel (website, ~2 minute)** aur **Render (backend, ~4 minute)** khud deploy
kar denge. Website wohi purani hai: **https://bandmuft.vercel.app**

## Step 6 — Test checklist (deploy ke baad)

1. Register karo aik naye account se → seedha dashboard ana chahiye (koi OTP nahi).
2. Mock Tests → **Full Mock Test 1** → Listening chalao — **audio chalni chahiye** (audio website
   ke andar hai, koi Cloudinary nahi).
3. Listening + Reading submit karo → bands ke saath result ayega.
4. Writing dono tasks likh kar submit karo → thori dair mein Gemini feedback (band + corrections).
   Agar "pending" dikhe to result page refresh karo — system khud dobara try karta hai.
5. Speaking: mic allow karo, teeno parts record karo, submit → transcript + band + feedback.
   Apni recording result page par khud bhi sun sakte ho.
6. Certificate issue karo → **View Certificate** (dark premium design) + PDF download + QR scan
   karke verify page khulta hai.
7. Course kholo → koi subject (masalan Education) → 7 steps: Vocabulary (Urdu meanings +
   pronunciation suno), Key Ideas, Reading, Listening (audio), Writing, Speaking, Subject Test.
8. Admin Panel (`/admin`): Users mein search, email change, password reset, ban, delete —
   aur Attempts mein students ki speaking recordings sun/delete kar sakte ho.

## Step 7 — Render ko jagaye rakhna (free keep-alive)

Package mein `.github/workflows/keep-alive.yml` shamil hai — push ke baad GitHub khud har
~10 minute mein backend ko ping karega, taake Render soye na aur site foran khule.
GitHub repo → **Actions** tab mein "keep-alive" workflow nazar ayega. Kuch karne ki zaroorat
nahi; bas pehli dafa Actions tab khul jaye to agar "Enable workflows" ayay to enable kar dena.

## Masla ho to — wapas purani site par

```bash
cd "D:\Eites web"
git revert HEAD --no-edit
git push
```

Vercel/Render khud purana version wapas laga denge. Database ko kuch nahi hota.

## Yaad rakho

- Speaking recordings database mein save hoti hain (~1 MB per test). Database free tier
  512 MB hai — Admin Panel → Attempts se purani recordings waqtan fawaqtan delete karte
  rehna (wahan total size bhi dikhta hai).
- Password bhoolne par students ko email-reset nahi milega (Resend test mode ki wajah se) —
  wo Contact page se tumse rabta karenge, tum Admin Panel → Users se unka email change +
  password reset kar dena. Pehchan ke liye unse account name / tests / certificate ID poochna.
- Register page par students ko real email use karne ki warning pehle se lagi hai.
