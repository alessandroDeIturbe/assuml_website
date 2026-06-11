# ASSUML — Portale Studenti CSI

Portale web dell'Associazione Studenti del Conservatorio della Svizzera Italiana.  
Next.js 15 · PostgreSQL 16 · MinIO · next-auth v5 · Prisma 5 · Stripe.

---

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 18, Tailwind CSS |
| Auth | next-auth v5 beta (JWT strategy, Google OAuth + Credentials) |
| ORM | Prisma 5 + PostgreSQL 16 |
| Storage | MinIO (S3-compatible) |
| Pagamenti | Stripe Checkout / webhook |
| DRM PDF | pdf.js su Canvas con stream proxy server-side + watermark |

---

## Architettura locale

```
Mac host  :3000   →  Next.js (npm run dev)
Docker    :5432   →  PostgreSQL 16  (assuml_db)
Docker    :9000   →  MinIO API
Docker    :9001   →  MinIO Console
```

I comandi `npm install`, `prisma migrate` e `npm run dev` vanno eseguiti **sull'host Mac**, non dentro i container. Prisma raggiunge il DB tramite la porta esposta.

---

## Setup rapido

### 1. Clona e installa

```bash
git clone <repo-url> assuml_website
cd assuml_website
npm install
```

### 2. Variabili d'ambiente

Copia `.env.example` in `.env` e compila i valori:

```bash
cp .env.example .env
```

| Variabile | Descrizione |
|-----------|-------------|
| `DATABASE_URL` | `postgresql://assuml:assuml_pass@localhost:5432/assuml_db` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | OAuth app Google (opzionale) |
| `GOOGLE_CLIENT_SECRET` | OAuth app Google (opzionale) |
| `MINIO_ENDPOINT` | `http://storage:9000` |
| `MINIO_ACCESS_KEY` | `assuml_admin` |
| `MINIO_SECRET_KEY` | `supersecret` |
| `MINIO_BUCKET` | `assuml-notes` |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_MINIO_CONSOLE` | `http://localhost:9001` |

### 3. Avvia i container Docker

```bash
docker compose up -d db storage createbucket
```

Il servizio `createbucket` crea automaticamente il bucket `assuml-notes` e configura CORS per `localhost:3000`.

### 4. Migra il database

```bash
npx prisma migrate dev --name init
```

### 5. Avvia il dev server

```bash
npm run dev
```

Il portale è disponibile su [http://localhost:3000](http://localhost:3000).

---

## Struttura directory

```
src/
├── app/
│   ├── page.jsx                  # Home
│   ├── accedi/                   # Login
│   ├── area-personale/           # Profilo utente
│   ├── appunti/                  # Marketplace appunti
│   │   ├── [id]/                 # Viewer PDF DRM
│   │   └── upload/               # Upload materiale
│   ├── associazione/             # Comitato ASSUML
│   ├── cisiamo/                  # Hub CiSiamo Podcast
│   ├── contatti/
│   ├── convenzioni/
│   ├── eventi/
│   ├── guida/                    # Guida dello studente
│   ├── ramificazioni/            # Festival Ramificazioni
│   ├── shop/
│   ├── sostienici/               # Donazioni
│   └── admin/                    # Pannello admin (ADMIN only)
│       ├── page.jsx
│       ├── AdminClient.jsx
│       └── projects/[slug]/      # Editor schede CiSiamo / Ramificazioni
├── components/
│   ├── ProtectedNotesViewer.jsx  # Canvas DRM con watermark
│   ├── TranslatedHome.jsx
│   ├── Bacheca.jsx
│   └── AdminEditLink.jsx
├── contexts/
│   └── LanguageContext.jsx       # i18n IT/EN via React Context
├── lib/
│   ├── auth.js                   # next-auth config
│   ├── prisma.js
│   └── minio.js                  # S3Client + listObjects + presign
└── locales/
    ├── it.json
    └── en.json
```

---

## Funzionalità principali

### Marketplace Appunti

- Gli studenti caricano PDF via presigned URL diretta a MinIO (bucket privato)
- Ogni appunto entra con `status: PENDING_APPROVAL`; visibile solo dopo approvazione admin
- Prezzo libero in CHF/EUR; acquisto P2P con upload ricevuta di pagamento
- Stripe Checkout per pagamenti diretti (opzionale)

### DRM PDF (stream proxy)

- Il browser **non riceve mai** l'URL MinIO: pdf.js scarica il PDF da `/api/notes/[id]/stream`
- L'endpoint `/stream` verifica auth + acquisto server-side, poi proxya i byte da MinIO
- Rendering su `<canvas>` con `pointer-events-none`
- Watermark dinamico tiled obliquo (−30°) con email utente + data
- Blocco tasto destro, shortcut screenshot (`PrintScreen`, `Cmd+Shift+3/4/5`), stampa (`@media print`)
- Blur su `visibilitychange` (anti-Alt-Tab capture)

### Pannello Admin

- Gestione annunci bacheca istituzionale
- Approvazione / rifiuto appunti con nota di rifiuto
- Gestione comitato (CRUD `CommitteeMember`)
- Guida studente editabile (CRUD `GuidaSection`)
- Editor schede progetto CiSiamo e Ramificazioni (JSON in `Project.content`)
- Storage browser MinIO: sfoglia bucket, preview presigned (120s TTL), link diretto alla console

### i18n IT/EN

Il toggle lingua è disponibile in Navbar. Tradotte: Home, Appunti, CiSiamo, Ramificazioni, Navbar.  
Pagine server-only (Guida, Associazione, Convenzioni, Contatti) rimangono in italiano — limitazione strutturale del Context-based i18n con Server Components.

---

## Script npm

```bash
npm run dev          # Next.js dev server
npm run build        # Build produzione
npm run lint         # ESLint
npm run db:migrate   # prisma migrate dev
npm run db:generate  # prisma generate
npm run db:studio    # Prisma Studio su :5555
```

---

## Modelli Prisma

| Modello | Descrizione |
|---------|-------------|
| `User` | Utenti con ruolo `STUDENT` / `ADMIN` |
| `Note` | Appunti con status `PENDING_APPROVAL` / `APPROVED` / `REJECTED` |
| `Purchase` | Acquisti con status `PENDING_RECEIPT` / `PENDING_APPROVAL` / `ACTIVE` |
| `Donation` | Donazioni Stripe |
| `Event` | Calendario eventi |
| `Convention` | Convenzioni partner |
| `Announcement` | Bacheca istituzionale |
| `GuidaSection` | Sezioni della Guida dello Studente (editabile da admin) |
| `Project` | Contenuto JSON delle schede progetto (`cisiamo`, `ramificazioni`) |
| `CommitteeMember` | Membri del comitato ASSUML |

---

## Design System

- Layout editoriale, asimmetrico, minimalista (stile svizzero)
- Light Mode come default; Dark Mode confinato alla sezione Podcast
- Logo `quadrata.jpg` in Navbar (onda nera su fondo bianco)
- Gradiente attivo/hover/CTA: `#FF4D4D → #00CFCF → #AAFF00`

---

## Note di deployment

- I container Docker sono pensati per uso locale. In produzione sostituire MinIO con AWS S3 (o Cloudflare R2) e aggiornare `MINIO_ENDPOINT`.
- `NEXTAUTH_SECRET` deve essere un segreto forte (≥ 32 byte) e diverso per ogni ambiente.
- Il webhook Stripe richiede `STRIPE_WEBHOOK_SECRET`; in locale usare la Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
