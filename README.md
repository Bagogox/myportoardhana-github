# Portfolio Website — Ilham Yudhistira Ardhana, S.T

Website portfolio statis (HTML + Tailwind via CDN) dengan **backend serverless**
untuk fitur download CV, siap deploy ke Vercel.

## Struktur Project

```
├── index.html              Halaman utama
├── projects.html            Halaman proyek
├── skills.html               Halaman keahlian
├── contact.html              Halaman kontak (ada bento card download CV)
├── api/
│   ├── download-cv.js         Serverless function (backend) untuk download PDF
│   └── send-message.js        Serverless function (backend) untuk kirim pesan contact form ke email
├── assets/
│   ├── docs/
│   │   └── CV_Ilham_Yudhistira_Ardhana.pdf   File CV asli
│   └── images/                Gambar-gambar website
├── package.json
└── vercel.json
```

## Cara Kerja Backend Contact Form (Kirim Pesan ke Email)

Form di halaman **Contact ("Let's Collaborate")** — Nama, Email, dan Pesan —
mengirim data ke endpoint backend:

```
POST /api/send-message
```

Endpoint ini (`api/send-message.js`) adalah Vercel Serverless Function yang:
1. Memvalidasi input (nama/email/pesan wajib diisi, format email valid, panjang pesan wajar).
2. Menolak diam-diam kalau terdeteksi bot (honeypot field tersembunyi).
3. Mengirim email ke alamat Anda lewat **Gmail SMTP** (via Nodemailer), dengan
   `replyTo` otomatis diisi email pengirim — jadi Anda tinggal klik **Reply** di
   Gmail untuk membalas langsung ke orang yang mengisi form.

### WAJIB: Setup sebelum deploy

Fitur ini butuh **App Password** dari akun Gmail Anda (bukan password login biasa),
karena Google tidak lagi mengizinkan login SMTP pakai password akun biasa.

**Langkah membuat App Password:**
1. Buka https://myaccount.google.com/security
2. Aktifkan **2-Step Verification** dulu kalau belum aktif (wajib, syarat App Password).
3. Buka https://myaccount.google.com/apppasswords
4. Pilih app **"Mail"**, beri nama bebas (mis. "Portfolio Website"), klik **Generate**.
5. Google akan menampilkan 16 karakter (mis. `abcd efgh ijkl mnop`) — salin tanpa spasi.

**Set Environment Variables di Vercel:**
Buka dashboard project di vercel.com → **Settings → Environment Variables**, lalu tambahkan:

| Key | Value |
|---|---|
| `GMAIL_USER` | Alamat Gmail Anda, mis. `ilhamyudhistiraardhana10@gmail.com` |
| `GMAIL_APP_PASSWORD` | 16 karakter App Password dari langkah di atas (tanpa spasi) |
| `CONTACT_TO_EMAIL` | (opsional) email tujuan pesan masuk, kalau dikosongkan akan otomatis pakai `GMAIL_USER` |

Setelah menambahkan env vars, **redeploy** project (Vercel → Deployments → ⋯ → Redeploy)
agar variabelnya terbaca oleh function.

> Kalau env vars ini belum diset, form akan menampilkan pesan error "Server belum
> dikonfigurasi untuk mengirim email" saat dicoba — bukan gagal diam-diam.

### Testing lokal (opsional)
Buat file `.env` di root project (jangan pernah di-commit ke git — sudah masuk `.gitignore`):
```
GMAIL_USER=alamat_gmail_anda@gmail.com
GMAIL_APP_PASSWORD=16karakterapppassword
CONTACT_TO_EMAIL=alamat_gmail_anda@gmail.com
```
Lalu jalankan `vercel dev` dan coba isi form contact di `http://localhost:3000/contact.html`.

## Cara Kerja Backend Download CV

Semua tombol **"Download CV"** dan **"Download Full CV (PDF)"** di semua halaman
mengarah ke endpoint backend:

```
GET /api/download-cv
```

Endpoint ini (`api/download-cv.js`) adalah Vercel Serverless Function (Node.js)
yang membaca file `assets/docs/CV_Ilham_Yudhistira_Ardhana.pdf` di server lalu
mengirimkannya sebagai file attachment (`Content-Disposition: attachment`),
sehingga browser otomatis mendownload file PDF-nya saat tombol diklik —
tidak lagi hanya `alert()` atau tautan mati seperti sebelumnya.

Kalau suatu saat CV diganti, cukup timpa file
`assets/docs/CV_Ilham_Yudhistira_Ardhana.pdf` dengan file baru
(nama file boleh diganti juga, tinggal ubah konstanta `CV_FILENAME`
di `api/download-cv.js`) — tidak perlu ubah HTML sama sekali.

## Cara Deploy ke Vercel

### Opsi 1 — Lewat Vercel CLI (paling cepat)
```bash
npm i -g vercel
cd isengiseng-project
vercel
```
Ikuti instruksi di terminal (login, pilih scope, dsb), lalu:
```bash
vercel --prod
```

### Opsi 2 — Lewat Dashboard vercel.com
1. Push folder ini ke repository GitHub/GitLab/Bitbucket.
2. Buka https://vercel.com/new, import repo tersebut.
3. Framework Preset: **Other** (tidak perlu build command, tidak perlu output directory — semua file statis di root sudah otomatis ter-serve, dan folder `api/` otomatis dikenali sebagai Serverless Functions).
4. Klik **Deploy**.
5. Website langsung online di `nama-project.vercel.app`.

### Opsi 3 — Drag & drop di dashboard Vercel
Vercel juga mendukung upload folder langsung tanpa git, lewat halaman
"Add New Project" → tab **Upload**.

## Uji Coba Lokal (opsional)
```bash
npm i -g vercel
vercel dev
```
Buka `http://localhost:3000`, lalu klik tombol Download CV di halaman mana pun
untuk memastikan file PDF benar-benar terdownload dari `/api/download-cv`.
