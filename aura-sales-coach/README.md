# Aura Sales Coach – KI-Verkaufsassistent

Mobile-first Web-App (PWA) für Verkäufer im telefonischen Outbound-Vertrieb von **Aura Natura**.
Während eines laufenden Telefonats liefert der Coach in Sekunden:

- **A – Das sagst du jetzt** (2–3 Sätze zum Vorlesen)
- **B – Passende Produkte** (nur aus der Produktdatenbank, mit Inhaltsstoffen, Nutzen, Gegenanzeigen, Dosierung)
- **C – Deine nächste Frage**
- **D – Verkaufsüberleitung**
- **E – Wichtige Hinweise** (Wechselwirkungen, Arzt-Hinweise, Prüfbedarf)

## Funktionen

| Bereich | Was er kann |
|---|---|
| **Live-Coach** | Beschwerden (Mehrfachauswahl) + Einwand + Freitext/Spracheingabe → Analyse in Sekunden, Folgefragen direkt darunter |
| **KI-Chat** | Chat mit vollständigem Gesprächsgedächtnis, Antworten werden live gestreamt |
| **Schnellaktionen** | Weitere Argumente · Kürzer · Einfacher · Passendes Produkt · Kunde lehnt ab · Preisargument · Abschluss · Neue Frage · Neuer Kunde |
| **Produkte** | Durchsuchbare Datenbank (Name, Inhaltsstoff, Beschwerde), Kennzeichnung „Verifiziert/Unbestätigt“ |
| **Verlauf** | Vergangene Gespräche auf dem Gerät, Ergebnis markieren (Abschluss/Rückruf/Abgelehnt), fortsetzen |
| **Admin** (`/admin`) | Produkte anlegen/bearbeiten/löschen, KI-Import aus Katalogtext, JSON-Import/-Export |

### Sicherheit & Seriosität (eingebaut)
- **Feste Warnregeln** unabhängig von der KI: Blutverdünner, Krebs/Chemo, feuchte Makula/Augenspritzen, Schwangerschaft, Niere/Leber, Diabetes, Schilddrüse, OP, Warnsymptome (→ 112), **Demenz/Betreuung (kein Abschluss)**, **Werbewiderspruch (Sperrvermerk)**.
- Die KI darf **nur** Produktangaben aus der Datenbank verwenden. Fehlende Inhaltsstoffe, Preise oder Dosierungen werden **nicht erfunden** („Das prüfe ich für Sie nach“).
- Gesundheitsaussagen nur als **zugelassene EU-Health-Claims** (VO 1924/2006, 432/2012) – und nur, wenn der Nährstoff nachweislich enthalten ist. Keine Heilversprechen.
- Bei Blutverdünnern schlägt auch der Demo-Modus keine Produkte mit Gerinnungs-Hinweis (Ginkgo, Omega-3, Kurkuma …) vor.

### Datenschutz (DSGVO)
- API-Schlüssel liegen **nur auf dem Server** (keine `NEXT_PUBLIC_`-Variablen).
- Telefonnummern, E-Mails, IBAN, Adressen, Geburtsdaten werden vor dem Senden automatisch entfernt. Für Namen nutzt die KI den Platzhalter `[Name]`.
- Gesprächsinhalte werden **nicht** auf dem Server oder in der Datenbank gespeichert. Der Verlauf liegt nur im Browser des Verkäufers und wird nach 30 Tagen automatisch gelöscht.
- OpenAI: Für den Produktivbetrieb einen **Auftragsverarbeitungsvertrag (DPA)** mit OpenAI abschließen und im Verarbeitungsverzeichnis aufnehmen. API-Daten werden von OpenAI standardmäßig nicht zum Training genutzt.
- Telefonwerbung: B2C-Anrufe nur mit vorheriger ausdrücklicher Einwilligung (§ 7 Abs. 2 Nr. 1 UWG) und dokumentiert (§ 7a UWG). Die App unterstützt dabei, Widersprüche sofort zu respektieren.

> ⚠️ **Wichtig zu den Produktdaten:** Die 13 Startprodukte sind nur mit Namen und Kategorien angelegt und als **„Unbestätigt“** markiert. Inhaltsstoffe, Dosierungen, Preise und Aussagen müssen aus den **offiziellen Aura-Natura-Unterlagen** im Admin-Bereich eingepflegt und dann als „Verifiziert“ markiert werden. Vorher nennt der Coach keine Inhaltsstoffe, Preise oder Dosierungen.

---

## Lokal starten

Voraussetzung: **Node.js 22** (https://nodejs.org)

```bash
cd aura-sales-coach
npm install
cp .env.example .env.local      # dann Werte eintragen (mind. OPENAI_API_KEY)
npm run dev
```

App öffnen: http://localhost:3000 – auf dem iPhone im selben WLAN: `http://<IP-des-Rechners>:3000`.

**Ohne `OPENAI_API_KEY`** läuft die App im **Demo-Modus** mit regelbasierten Antworten – ideal zum Ausprobieren.

### Umgebungsvariablen (`.env.local`)

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `OPENAI_API_KEY` | für KI | Schlüssel von https://platform.openai.com/api-keys |
| `OPENAI_MODEL` | nein | Standard `gpt-4o-mini` (schnell & günstig). Jedes Chat-Completions-Modell möglich. |
| `OPENAI_TRANSCRIBE_MODEL` | nein | Spracheingabe, Standard `whisper-1` |
| `APP_ACCESS_CODE` | **im Live-Betrieb ja** | Team-Zugangscode – schützt App und OpenAI-Budget |
| `ADMIN_PASSWORD` | für Admin | Passwort für `/admin` |
| `SESSION_SECRET` | ja | Zufallswert, z. B. `openssl rand -hex 32` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Live-Betrieb | Produktdatenbank; ohne diese wird `data/products.json` genutzt |

## Datenbank (Supabase) einrichten

1. Projekt auf https://supabase.com anlegen (Region **EU / Frankfurt** wählen).
2. Im Dashboard → **SQL Editor** den Inhalt von `supabase/schema.sql` ausführen.
3. Unter **Project Settings → API** `URL` und `service_role`-Key in `.env.local` eintragen.
4. Startprodukte übertragen: `npm run seed:supabase`

Ohne Supabase funktioniert alles mit der Datei `data/products.json` (Admin-Änderungen werden dort gespeichert – nur lokal/auf eigenem Server, nicht auf Vercel).

## Veröffentlichen (Vercel – empfohlen)

1. Code zu GitHub pushen.
2. Auf https://vercel.com → **Add New Project** → Repository wählen → **Root Directory: `aura-sales-coach`**.
3. Unter **Environment Variables** alle Werte aus `.env.example` eintragen (insbesondere `APP_ACCESS_CODE`, `SUPABASE_*`).
4. **Deploy** → die App läuft unter `https://<projekt>.vercel.app` (eigene Domain optional). Region in den Projekt-Einstellungen auf **Frankfurt (fra1)** stellen.

Alternativ auf jedem Node-Server: `npm run build && npm start` (Port 3000, HTTPS über Reverse-Proxy).

> Hinweis: Dieses Repository wird zusätzlich als GitHub-Pages-Seite ausgeliefert. Die App selbst läuft dort **nicht** (benötigt einen Node-Server), der Quellcode enthält aber keine Geheimnisse.

## Auf dem iPhone installieren (PWA)

1. App-URL in **Safari** öffnen und Zugangscode eingeben.
2. **Teilen-Symbol** → **„Zum Home-Bildschirm“** → **Hinzufügen**.
3. Die App startet nun im Vollbild wie eine native App.

Spracheingabe: Mikrofon-Symbol antippen (Safari fragt einmalig nach Mikrofonzugriff). Alternativ funktioniert immer die Diktiertaste der iPhone-Tastatur.

## Produktdaten pflegen

`/admin` (auch über das Zahnrad auf der Produktseite):
- **Neues Produkt / Bearbeiten**: alle Felder (Inhaltsstoffe je Zeile, Kundenfragen als `Frage :: Antwort`).
- **Katalog importieren (KI)**: Text aus offiziellem Katalog/Datenblatt einfügen → KI extrahiert nur, was im Text steht → Entwurf prüfen → speichern.
- **JSON-Import/-Export** für Massenpflege und Backups.
- Erst mit Haken **„Verifiziert“** + Quellenangabe nutzt der Coach Inhaltsstoffe, Dosierung und Preis im Gespräch.

## Projektstruktur

```
src/
  app/
    page.tsx              Live-Coach
    chat/ produkte/ verlauf/ admin/ login/
    api/coach             KI-Endpunkt (Streaming) + Demo-Fallback
    api/products          Produktliste
    api/admin/*           Login, Produktpflege, KI-Katalogimport
    api/transcribe        Spracheingabe (Whisper)
    manifest.ts           PWA-Manifest
  components/             UI (Antwortkarten, Produktkarten, Schnellaktionen, Mikrofon …)
  lib/
    prompt.ts             System-Prompt & Regeln für die KI
    safety.ts             Feste Warnregeln (Wechselwirkungen, Risiken)
    knowledge.ts          Zugelassene Health-Claims & Wirkstoffhinweise
    fallback.ts           Regelbasierter Coach (Demo/Ausfall)
    redact.ts             Entfernt personenbezogene Kennungen
    products/repo.ts      Supabase oder JSON-Datei
middleware.ts             Zugangsschutz
supabase/schema.sql       Datenbankschema
data/products.json        Startprodukte (unbestätigt)
public/sw.js              Service Worker (Offline-Seite, schneller Start)
```

## Skripte

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklung |
| `npm run build && npm start` | Produktion |
| `npm run typecheck` | TypeScript-Prüfung |
| `npm run seed:supabase` | Produkte nach Supabase übertragen |
| `npm run icons` | App-Icons neu erzeugen (Python + Pillow) |
