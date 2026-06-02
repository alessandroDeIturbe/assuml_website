# ASSUML — Architettura Pagine

## Route Map

```
/                          → Home (Hero + wave bg, CTA Marketplace + Podcast + Sostienici)
│
├── /marketplace           → Hub Appunti (Light Mode)
│   ├── /marketplace/[id]  → Viewer protetto (ProtectedNotesViewer)
│   └── /marketplace/upload→ Form upload (auth required) → status: pending_approval
│
├── /admin                 → Dashboard Admin (auth: role=admin)
│   ├── /admin/pending     → Coda moderazione PDF → Approva / Rifiuta
│   ├── /admin/users       → Gestione utenti
│   └── /admin/orders      → Ordini & revenue
│
├── /sostienici            → Landing donazioni (Light Mode)
│   ├── Stripe Checkout    → donazioni libere / quota sostenitore
│   └── /contatti          → Form con routing: Studenti | Sponsor | Press
│
└── /podcast               → CiSiamo Hub (Dark Mode forzato)
    ├── /podcast/[slug]    → Singola puntata (player audio embed)
    └── /podcast/festival  → Spazio Festival partner (Ramificazioni etc.)
```

## Flussi Chiave

### Upload & Moderazione
```
Studente → /marketplace/upload
  → POST /api/notes (status: pending_approval, fileKey: S3/R2)
  → Admin notificato → /admin/pending
  → Admin approva → status: approved → visibile in /marketplace
  → Admin rifiuta → notifica studente + motivo
```

### Acquisto & DRM
```
Utente → seleziona dispensa → Stripe Checkout
  → webhook /api/stripe → crea Purchase record
  → /marketplace/[id] → ProtectedNotesViewer
    → firma URL temporanea (signed URL, TTL 1h)
    → pdf.js canvas render (no <a> diretti)
    → watermark dinamico (userId overlay)
    → blocco: contextmenu, keydown screenshot, devtools
```

### Donazioni
```
Visitatore → /sostienici
  → sceglie importo (free input o preset: 10/25/50 CHF)
  → Stripe Checkout (mode: payment) | Twint redirect
  → success → /sostienici/grazie + email conferma
```

## Stack Tecnico

| Layer       | Scelta                              |
|-------------|-------------------------------------|
| Framework   | Next.js 14 App Router               |
| Styling     | Tailwind CSS (config custom)        |
| Auth        | NextAuth.js (Credentials + Google)  |
| DB          | PostgreSQL (Prisma ORM)             |
| Storage     | Cloudflare R2 (signed URLs)         |
| Pagamenti   | Stripe + Twint redirect             |
| PDF Viewer  | pdf.js (canvas mode, no native PDF) |
| Dark Mode   | Tailwind `class` strategy           |

## Schema Dati Essenziale (Prisma)

```prisma
model Note {
  id          String   @id @default(cuid())
  title       String
  description String?
  fileKey     String   // R2 key, mai esposto al client
  price       Float    // 0 = gratuito
  currency    String   @default("CHF")
  status      NoteStatus @default(PENDING_APPROVAL)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  purchases   Purchase[]
  createdAt   DateTime @default(now())
}

enum NoteStatus { PENDING_APPROVAL APPROVED REJECTED }

model Purchase {
  id         String   @id @default(cuid())
  userId     String
  noteId     String
  stripeId   String   @unique
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
  note       Note     @relation(fields: [noteId], references: [id])
}
```
