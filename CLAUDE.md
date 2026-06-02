# ISTRUZIONI OPERATIVE: SVILUPPO PORTALE ASSUML

Questo documento funge da contesto e memoria di configurazione per l'Agent. Non modificare la struttura dei servizi Docker e dei flussi di rete concordati.

## 1. ARCHITETTURA DI RETE & HOSTING (LOCALE)
L'infrastruttura gira su Docker Desktop (Mac) ed è esposta localmente.
- **Frontend (Next.js 14):** Eseguito nativamente sull'host (Mac) via `npm run dev` su `http://localhost:3000`.
- **Database (PostgreSQL 16):** Isolato in Docker, esposto su `localhost:5432`.
- **Storage (MinIO/S3):** Isolato in Docker, esposto su `localhost:9000` (API) e `localhost:9001` (Console).

*Nota di flusso:* I comandi di configurazione del codice, `npm install` e `prisma migrate` vanno eseguiti **sull'host (Mac)** e NON dentro i container. Prisma comunicherà con il container DB dall'esterno tramite la porta esposta.

## 2. REQUISITI TECNICI CORE

### A. Marketplace Appunti (Protezione DRM)
1. **Stato Approvazione:** Ogni upload finisce nel DB con `status: "PENDING"`. Visibile sul portale solo dopo switch a `APPROVED` da parte dell'admin ASSUML.
2. **Prezzo:** Libero, impostato dallo studente (CHF/EUR).
3. **DRM & Anti-Copia (ProtectedNotesViewer.jsx):**
   - No download, no link statici a file in `public/`.
   - Rendering dei PDF via Canvas (`pdf.js`) con `pointer-events-none`.
   - Blocco globale del tasto destro (`contextmenu`).
   - Intercettazione `keydown` per shortcut di screenshot (`PrintScreen`, `Cmd+Shift+3/4/5`, `F12`, `Cmd+S/P`).
   - Blur del Canvas su evento `visibilitychange` (anti-cattura da Alt-Tab).
   - Watermark dinamico obliquo (30°) sovrapposto con l'ID dell'utente loggato.

### B. Gestione File Protetti (S3 Signed URLs)
- I file PDF non devono mai risiedere nella root pubblica del web server.
- **Upload:** L'endpoint `/api/notes/upload` genera una presigned URL per caricare il file direttamente nel bucket privato di MinIO (`storage:9000`).
- **Visualizzazione:** L'endpoint `/api/notes/[id]/view` verifica nel DB se l'utente ha un record in `Purchase` per quell'appunto o se è un Admin. Se autorizzato, genera una Signed URL S3 con Time-To-Live (TTL) di **30 secondi** e la passa al Canvas.

### C. Sezione Esterni & Fundraising
- Landing page per donazioni e sponsorizzazioni istituzionali.
- `/api/donate/checkout`: Inizializzazione sessione Stripe Checkout / Twint per donazioni libere con salvataggio dello stato della transazione (`PENDING`, `COMPLETED`, `FAILED`) nel DB.

### D. Hub CiSIamo Podcast
- Sezione multimediale con design system scuro (Dark Mode).
- Filtri dinamici per categorie e spazio dedicato ai festival partner (es. *Festival Ramificazioni*).

## 3. DESIGN SYSTEM (STILE SVIZZERO / LOGO "QUADRATA.JPG")
- **Layout:** Editoriale, asimmetrico, minimalista. Prevalentemente Light Mode, Dark Mode confinato al Podcast.
- **Visual Asset:** Logo originale (`quadrata.jpg`) posizionato in Navbar (onda nera su fondo bianco).
- **Palette Colori:** Sfondi netti (bianco/nero). Elementi attivi, hover e bottoni utilizzano un gradiente CSS derivato dalla scritta "SUML":
  `Rosso Corallo (#FF4D4D) ➔ Ciano (#00CFCF) ➔ Verde Acido (#AAFF00)`.

## 4. LINEE GUIDA PER L'AGENT (STRICT)
- Scrivi codice Next.js 14/React standard, preferendo l'App Router (`src/app/`).
- Risolvi i problemi di compatibilità di Prisma 7+ e Node v26 mantenendo lo schema pulito e strutturando le enum su righe separate.
- Se riscontri un errore 404 sulla root (`/`), verifica immediatamente l'esistenza e l'export di default del file `src/app/page.jsx`.
- Genera risposte brevi, tecniche e focalizzate sulla scrittura diretta dei file.