# Projektdokumentation – IoT Plant Admin (Neue Konzepte)

**Projektkontext:** Studienprojekt zur webbasierten Überwachung und Bedienung einer IoT-Logistikanlage mit Frontend, Backend, MQTT-Kommunikation und Zeitreihendatenbank.

**Stand:** 30.03.2026  
**Autorengruppe:** Studierendenteam „Neue Konzepte"

---

## 1. Ziel und Umfang des Projekts

Dieses Projekt löst die Aufgabe, eine bestehende Logistikanlage softwareseitig modern zu überwachen und steuerbar zu machen. Die Anlage besteht aus Sensoren und Aktoren (z. B. Förderbänder, Induktivsensoren, RFID-Sensoren, Hochregallager-Komponenten), die Ereignisse und Zustände in Echtzeit liefern.

Die Anwendung besteht aus zwei technischen Hauptteilen:

1. **Backend (NestJS / TypeScript)** für Datenerfassung, Persistenz und API-Bereitstellung.
2. **Frontend (React / TypeScript)** für Visualisierung, Interaktion und Betriebsunterstützung.

### 1.1 Fachliche Ziele

- Live-Überwachung des Anlagenzustands in einer Top-Down-Ansicht.
- Historisierung von Sensordaten für Auswertungen.
- Simulationsbetrieb für Entwicklung, Test und Demo ohne reale Anlage.
- Einheitliche, wartbare und dokumentierte Softwarebasis.

### 1.2 Abgrenzung

- Keine produktionsreife Benutzerverwaltung / Authentifizierung implementiert.
- Kein vollständiges Leitsystem für Sicherheitssteuerung.
- Fokus liegt auf Monitoring, Datenhaltung und studentischer Erweiterbarkeit.

---

## 2. Systemüberblick

### 2.1 Gesamtarchitektur

Die Systemarchitektur folgt einer klaren Schichtung:

- **Hardware-/Gateway-Schicht:** Anlage + MQTT-Broker (typisch auf Raspberry Pi)
- **Service-Schicht:** NestJS-Backend mit MQTT-Ingest + REST-API
- **Persistenz-Schicht:** TimescaleDB (PostgreSQL)
- **Präsentations-Schicht:** React-Frontend im Browser

### 2.2 Kommunikationswege

1. **MQTT (Live-Daten):**
   - Backend abonniert Topics (`entry-route/#`, `hochregallager/#`, `plant/#`) und persistiert Nachrichten.
   - Frontend kann zusätzlich direkt per MQTT (WebSocket) Live-Zustände beziehen.

2. **REST (Historie & Business-Logik):**
   - Frontend ruft Backend-Endpunkte unter `/api/*` auf.
   - Backend liefert gefilterte, aggregierte und historische Daten.

3. **Datenbankzugriff:**
   - Backend nutzt Prisma als ORM auf TimescaleDB.

---

## 3. Technologiestack

## 3.1 Backend

- Node.js 20
- NestJS
- Prisma ORM
- MQTT.js
- TimescaleDB (PostgreSQL 16)

## 3.2 Frontend

- React 19
- TypeScript
- Vite
- Material UI
- TanStack React Query
- MQTT.js

## 3.3 Infrastruktur

- Docker + Docker Compose
- Nginx für Frontend-Auslieferung
- Selbstsigniertes TLS-Zertifikat für Entwicklungszwecke

---

## 4. Backend – Detaillierte Funktionsweise

### 4.1 Modulstruktur

Das Backend ist modular aufgebaut. Zentrale Module:

- `mqtt` – Verbindungsaufbau und Ingest von MQTT-Nachrichten
- `sensor-data` – Datenspeicherung und Auswertungs-Endpoints
- `simulation-config` – CRUD für Simulationsdefinitionen
- `warehouse-simulator` – Erzeugung synthetischer Lagerdaten
- `ollama` – optionaler LLM-Proxy
- `prisma` – Datenbankzugriff

Die App startet über `main.ts`, setzt den Prefix `/api`, aktiviert CORS und bindet alle Module über `app.module.ts`.

### 4.2 MQTT-Ingest

Beim Start verbindet sich der MQTT-Service mit `MQTT_BROKER_URL`. Bei erfolgreicher Verbindung werden Topic-Muster abonniert.

Ablauf pro Nachricht:

1. Nachricht trifft auf Topic ein.
2. Payload wird übernommen (wenn möglich JSON-parsed).
3. Datensatz wird als Sensor-Event persistiert.
4. Fehler werden geloggt, ohne den Backend-Prozess zu beenden.

Dadurch bleibt das System auch bei fehlerhaften Einzelmeldungen robust.

### 4.3 Sensor-Data-API

Das Modul `sensor-data` stellt den Kern der historischen Auswertung bereit.

Wichtige Endpunkte:

- `POST /api/sensor-data/ingest` – direkte Ingest-Schnittstelle
- `GET /api/sensor-data` – gefilterte Listenabfrage
- `GET /api/sensor-data/latest` – letzter Datensatz je Komponente
- `GET /api/sensor-data/range` – Zeitbereichsabfrage
- `GET /api/sensor-data/stats/:componentId` – Basisstatistiken
- `GET /api/sensor-data/activity/:componentId` – Aktivitätsbuckets
- `GET /api/sensor-data/:componentId` – Verlauf je Komponente

Parameter werden validiert (z. B. `limit`, `offset`, ISO-Zeitstempel), um API-Nutzung und Fehlerbild vorhersehbar zu halten.

### 4.4 Simulationsverwaltung

Über `simulation-config` können Simulationsdefinitionen als Datensätze gepflegt werden:

- `GET /api/simulations`
- `GET /api/simulations/:id`
- `POST /api/simulations`
- `PUT /api/simulations/:id`
- `DELETE /api/simulations/:id`

Damit lassen sich reproduzierbare Testszenarien im Team austauschen.

### 4.5 Warehouse-Simulator

Der Warehouse-Simulator ist als separater Service implementiert und über API steuerbar:

- `GET /api/warehouse-simulator/status`
- `GET /api/warehouse-simulator/logs`
- `POST /api/warehouse-simulator/start`
- `POST /api/warehouse-simulator/stop`
- `POST /api/warehouse-simulator/tick`

Der Simulator unterstützt damit sowohl kontinuierlichen Betrieb als auch manuelle Einzelschritte für Debugging und Demo.

### 4.6 Ollama-Proxy (optional)

Die `ollama`-Schnittstelle erlaubt den Aufruf eines lokalen LLM-Dienstes aus dem Frontend über das Backend.

- `GET /api/ollama/health`
- `POST /api/ollama/chat`

Hinweis: Der Dienst ist im Compose-Setup standardmäßig deaktiviert, weil das Modell-Image groß ist.

---

## 5. Datenmodell und Persistenz

### 5.1 Tabelle `sensor_data`

Zweck: Speicherung aller eingehenden MQTT- und Ingest-Ereignisse.

Wesentliche Felder:

- `id`
- `component_id`
- `topic`
- `payload` (JSON)
- `received_at`

### 5.2 Tabelle `simulation_definitions`

Zweck: Speicherung der Simulationskonfigurationen.

Wesentliche Felder:

- `id`
- `name`
- `description`
- `repeat`
- `steps`
- `created_at`
- `updated_at`

### 5.3 Schema-Management

Das Projekt nutzt in der aktuellen Entwicklungslogik primär `prisma db push`. Für weiterführenden produktionsnahen Betrieb sind versionierte Prisma-Migrationen empfehlenswert.

---

## 6. Frontend – Detaillierte Funktionsweise

### 6.1 Grundaufbau

Das Frontend startet über `main.tsx` mit einem globalen `QueryClientProvider` (React Query). In `App.tsx` werden Theme, Accessibility-Optionen, Routing und Simulations-/Live-Dienste initialisiert.

### 6.2 Routing

Wichtige Seiten:

- `/plant` – Top-Down-Anlagenansicht
- `/components` – Komponentenbrowser
- `/hochregallager` – High-Bay-Ansicht
- `/plant-control` – Steuer-/Kontrollansicht
- `/mqtt` – MQTT-Konfiguration
- `/docs` – integrierte Dokuansicht

### 6.3 Top-Down-View und Komponentenmodell

Die Top-Down-Ansicht basiert auf einer konfigurierten Hotspot-Map und Icon-Komponenten.

- Ball Loader sind konsistent als `ball-loader-1` bis `ball-loader-4` geführt.
- Sichtbarkeit, Hervorhebung und Zustände werden im UI-Kontext zusammengeführt.
- Historische und Live-Daten können parallel dargestellt werden.

### 6.4 Live-/Historien-Kopplung

Das Frontend trennt bewusst zwei Datenquellen:

1. **MQTT-Livekanal:** schnelle Statusaktualisierung in der Oberfläche
2. **REST-Historie:** gespeicherte Daten, Auswertungen und Statistiken

Diese Trennung verbessert die Lesbarkeit der Architektur und verhindert, dass zeitkritische Zustandswechsel nur durch Polling abgebildet werden.

### 6.5 Zustand und Benutzerpräferenzen

Folgende Aspekte sind im Frontend berücksichtigt:

- Theme-Modus (hell/dunkel/system)
- Farbvarianten
- Accessibility (Textgröße, Kontrast, reduzierte Bewegung)
- Simulations-Designer-Kontext
- Komponenten-Livefeed

---

## 7. API-Vertrag zwischen Frontend und Backend

### 7.1 Grundprinzip

Das Frontend nutzt standardmäßig eine relative API-Basis (`/api`), wodurch Docker-/Nginx-Proxybetrieb ohne Codeänderung funktioniert.

### 7.2 Beispielhafter Nutzungsfluss

1. Frontend ruft `GET /api/health` auf (Backend-Statusanzeige).
2. Frontend lädt `GET /api/sensor-data/latest` für Übersicht.
3. Bei Komponentenwahl folgen `stats`, `activity`, `history` Endpunkte.
4. Parallel laufen Live-Updates über MQTT.

### 7.3 Fehlerbehandlung

- Nicht-2xx Responses führen zu kontrollierten UI-Fehlerzuständen.
- Leere Datenmengen werden explizit als „kein Datensatz vorhanden“ dargestellt.

---

## 8. Deployment und Betrieb

### 8.1 Docker-Compose-Start

Standardstart:

```bash
docker compose up --build
```

Erwartete Dienste:

- Frontend (HTTPS über Nginx)
- Backend (`/api`)
- TimescaleDB

### 8.2 Umgebungsvariablen (Auszug)

- `MQTT_BROKER_URL`
- `DATABASE_URL`
- `CORS_ORIGIN`
- `OLLAMA_CHAT_ENDPOINT`
- `OLLAMA_MODEL`

### 8.3 Betriebshinweise

- Für Produktivbetrieb ist ein echtes TLS-Zertifikat notwendig.
- MQTT-Broker muss WebSocket-Verbindungen unterstützen, wenn der Browser direkt verbunden wird.
- Simulator sollte nicht parallel zu produktiver Realdatenerfassung laufen.

---

## 9. Qualität, Testbarkeit und Wartbarkeit

### 9.1 Entwicklungsprinzipien

- Modulare Trennung im Backend
- Trennung Live (MQTT) vs. Historie (REST)
- Typisierte Verträge im Frontend
- Konzentration auf nachvollziehbare Komponenten-IDs

### 9.2 Test- und Prüfschritte

Empfohlene Mindestchecks vor Abgabe oder Deployment:

1. Backend baut und startet.
2. Frontend baut ohne Fehler.
3. Health-Endpoint liefert `ok`.
4. MQTT-Ingest schreibt Datensätze in `sensor_data`.
5. Top-Down-View zeigt korrekte Komponentenzahl.
6. Simulator-Start/Stop/Tick funktionieren.

### 9.3 Wartungsfreundlichkeit

- Klare Ordnerstruktur
- Dokumentierte API-Endpunkte
- Konfigurierbare Umgebungsvariablen
- Erweiterbarkeit durch zusätzliche Komponenten-/Topic-Gruppen

---

## 10. Bekannte Grenzen und Risiken

1. **Sicherheit:** Keine Authentifizierung der API.
2. **Infrastrukturabhängigkeit:** MQTT-Broker-Konfiguration extern auf Raspberry Pi.
3. **Modellgröße Ollama:** Optionaler Dienst wegen Ressourcenbedarf nicht standardmäßig aktiv.
4. **Hardware-Dokumentation:** Einzelne physische Details (z. B. Pin-Mapping) müssen ggf. weiter gepflegt werden.

---

## 11. Übergabe und Einarbeitung neuer Teammitglieder

### 11.1 Empfohlene Reihenfolge für die Einarbeitung

1. `docs/PROJEKTDOKUMENTATION.md` vollständig lesen.
2. `docs/SETUP.md` zur lokalen Umgebung befolgen.
3. `docs/API.md` als Backend-Schnittstellenreferenz verwenden.
4. Frontend über `/plant` und `/mqtt` praktisch nachvollziehen.
5. Backend-Module gezielt im Quellcode durchgehen (`mqtt`, `sensor-data`, `simulation-config`, `warehouse-simulator`).

### 11.2 Typische erste Aufgaben für neue Studierende

- Kleine UI-Anpassungen in der Top-Down-Ansicht
- Erweiterung von Auswertungen in `sensor-data`
- Simulationsschritte ergänzen
- Dokumentationspflege bei geänderten Komponenten/Topics

---

## 12. Fazit

Das Projekt erfüllt die Zielsetzung einer vollständigen, webgestützten Monitoring- und Simulationsplattform für eine IoT-Logistikanlage. Die Architektur trennt Live-Kommunikation, Persistenz und Visualisierung sauber. Durch NestJS-Module, React-Struktur, Docker-Betrieb und dokumentierte Schnittstellen ist eine solide Basis für studentische Weiterentwicklung gegeben.

Mit dieser Dokumentation liegt eine durchgehende Grundlage vor, die den Projektaufbau, die Laufzeitlogik und die Schnittstellen von Frontend und Backend nachvollziehbar erklärt und damit eine abgabefähige Wissensbasis bereitstellt.

---

## 13. End-to-End-Abläufe (fachlich und technisch)

Um die Funktionsweise des Systems vollständig zu verstehen, sind die zentralen End-to-End-Abläufe unten in Form von Szenarien dokumentiert.

### 13.1 Szenario A: Live-Statuswechsel einer Komponente

**Ausgangssituation:** Ein Förderband ändert seinen Zustand von `off` auf `on`.

**Ablauf:**

1. Die Hardware bzw. der Gateway publiziert ein MQTT-Event, z. B. auf `plant/conveyor-3/status`.
2. Der Backend-MQTT-Client empfängt die Nachricht über seine bestehende Subscription.
3. Der Payload wird verarbeitet und als neuer Datensatz in `sensor_data` gespeichert.
4. Parallel kann das Frontend den Live-Wert direkt über seinen MQTT-Kanal anzeigen.
5. Die Top-Down-Ansicht aktualisiert den Visualzustand (Icon/Farbe/Animation).
6. Eine spätere Historienabfrage zeigt den gleichen Wechsel über REST reproduzierbar an.

**Ergebnis:** Live-Reaktion und Persistenz sind synchron gedacht, aber technisch entkoppelt umgesetzt.

### 13.2 Szenario B: Benutzer öffnet Komponentendetails

**Ausgangssituation:** In der Anlagenansicht wird eine Komponente ausgewählt.

**Ablauf:**

1. Frontend setzt die aktive Komponente im UI-State.
2. React Query triggert abhängige REST-Calls (`history`, `stats`, optional `activity`).
3. API liefert gespeicherte Messwerte, Aggregationen und Zeitverläufe.
4. UI rendert Detailpanel mit Lade-/Fehler-/No-Data-Zuständen.
5. Bei laufenden Live-Daten bleibt der Echtzeitstatus parallel sichtbar.

**Ergebnis:** Bedienung bleibt reaktiv, ohne die Persistenzabfragen zu blockieren.

### 13.3 Szenario C: Simulationsbetrieb ohne reale Hardware

**Ausgangssituation:** Entwicklung oder Demo ohne physische Anlage.

**Ablauf:**

1. Benutzer startet den Warehouse-Simulator über API.
2. Simulator erzeugt zyklisch synthetische Ereignisse.
3. Ereignisse werden im selben Persistenzfluss wie reale MQTT-Daten gespeichert.
4. Frontend zeigt daraus Historie und aktuelle Veränderungen.
5. Für reproduzierbare Durchläufe werden Simulationsdefinitionen aus `simulation_definitions` genutzt.

**Ergebnis:** Gleiches Datenmodell für Real- und Testbetrieb reduziert Sonderlogik.

---

## 14. Quellcode-Struktur und Verantwortlichkeiten

Dieses Kapitel beschreibt, wie sich fachliche Verantwortung auf die Ordnerstruktur abbildet.

### 14.1 Backend-Verzeichnis

- `src/main.ts`  
   Prozessstart, Global Prefix `/api`, CORS.

- `src/app.module.ts`  
   Zentrale Modulverdrahtung.

- `src/mqtt/`  
   Betrieb des MQTT-Clients und Topic-Handling.

- `src/sensor-data/`  
   Kernlogik der Datenerfassung und Auswertung.

- `src/simulation-config/`  
   Persistente Konfigurationen für Simulationsabläufe.

- `src/warehouse-simulator/`  
   Generator für simulierte Lagerereignisse.

- `src/ollama/`  
   Optionaler KI-Proxy-Endpunkt.

- `prisma/schema.prisma`  
   Datenmodell und Tabellenstruktur.

### 14.2 Frontend-Verzeichnis

- `src/main.tsx`  
   Entry Point mit React Query Provider.

- `src/App.tsx`  
   Routing, Layout, Theme, App-Kontexte.

- `src/pages/`  
   Seitenlogik (`plant`, `components`, `mqtt`, ...).

- `src/entryRoute/`  
   Top-Down-Hotspots, Icon-Mapping, Interaktionslogik.

- `src/components/`  
   Wiederverwendbare UI-Bausteine und Detailkomponenten.

- `src/services/`  
   API-Client, Live-Feed-Logik, Simulationsintegration.

- `src/hooks/`  
   Datenzugriff über React Query, wiederverwendbare Data Hooks.

### 14.3 Dokumentationsstruktur

- `docs/PROJEKTDOKUMENTATION.md`  
   Gesamtzusammenhang für Abgabe und Einarbeitung.

- `docs/API.md`  
   Endpunkt-Referenz.

- `docs/SETUP.md`  
   Installations- und Startanleitung.

- `docs/ARCHITECTURE.md`  
   Architekturkompaktwissen.

- `docs/HANDOVER.md`  
   Übergabewissen und nächste Schritte.

---

## 15. Konfiguration und Umgebungsvariablen im Überblick

### 15.1 Backend-Konfiguration

| Variable | Bedeutung | Beispiel |
| --- | --- | --- |
| `PORT` | HTTP-Port des Backends | `3000` |
| `DATABASE_URL` | PostgreSQL/TimescaleDB-Verbindungsstring | `postgresql://...` |
| `MQTT_BROKER_URL` | Broker-Adresse für MQTT-Ingest | `mqtt://192.168.178.40:1883` |
| `CORS_ORIGIN` | erlaubte Frontend-Origin | `http://localhost:5173` |
| `OLLAMA_CHAT_ENDPOINT` | optionales Ollama-Backend | `http://localhost:11434/api/chat` |
| `OLLAMA_MODEL` | optionales Default-Modell | `qwen2.5:0.5b` |

### 15.2 Frontend-Konfiguration

| Variable | Bedeutung | Beispiel |
| --- | --- | --- |
| `VITE_API_BASE` | API-Basis für REST-Zugriffe | `http://localhost:3000/api` |
| `VITE_API_BASE_URL` | kompatibler Fallback | `http://localhost:3000` |
| `VITE_OLLAMA_CHAT_ENDPOINT` | optionales Chat-Ziel | `/api/ollama/chat` |
| `VITE_OLLAMA_MODEL` | Modell-Hinweis an Backend | `qwen2.5:0.5b` |
| `VITE_OLLAMA_TIMEOUT_MS` | Request-Timeout | `20000` |

### 15.3 Docker-Compose-Kontext

Im Compose-Betrieb wird die Standardkommunikation über interne Servicenamen aufgelöst. Dadurch muss im Normalfall keine feste Host-IP in den Quellcode eingetragen werden.

Wichtig für reproduzierbaren Betrieb:

- Konsistente `.env`-Datei im Projektroot
- Eindeutige Portbelegung
- Persistentes DB-Volume

---

## 16. Bedienlogik der Website (UI-verständnisorientiert)

Da die Abgabe explizit die Funktionsweise „in der Website“ nachvollziehbar machen soll, beschreibt dieses Kapitel die Sicht der Benutzeroberfläche.

### 16.1 Navigation und Informationsarchitektur

Die Oberfläche ist als Dashboard-Anwendung aufgebaut. Zentrale Navigationseinträge führen zu den betriebsrelevanten Ansichten.

- **Top-Down-View (`/plant`)** – primäre Betriebsansicht
- **Komponentenbrowser (`/components`)** – strukturierte Liste und Suche
- **MQTT-Einstellungen (`/mqtt`)** – Verbindungskonfiguration
- **Dokumentation (`/docs`)** – integrierter Wissenszugang

### 16.2 Top-Down-View als Leitansicht

Die Top-Down-Ansicht bildet die Anlage als interaktive Karte mit Hotspots ab. Für jeden Hotspot gelten folgende Prinzipien:

1. Eindeutige ID im Komponentenraum
2. Eindeutiges visuelles Icon (Kategoriezuordnung)
3. Zustandsdarstellung (`on`, `off`, `error`)
4. Detailzugang über Klick/Fokusaktion

Dadurch wird die Karte gleichzeitig zur Betriebsübersicht und zum Einstieg in Detailanalysen.

### 16.3 Details und Diagnostik

Bei Auswahl einer Komponente werden relevante Daten in Ebenen bereitgestellt:

- aktueller Zustand
- letzte persistierte Werte
- Verlauf
- statistische Kennzahlen

Die getrennte Darstellung von „Live“ und „Historie“ ist didaktisch und technisch sinnvoll, weil Unterschiede zwischen Momentanzustand und Datenbankstand transparent bleiben.

### 16.4 Benutzerpräferenzen und Barrierefreiheit

Die Anwendung unterstützt unterschiedliche Betriebspräferenzen:

- helle/dunkle Darstellung
- verschiedene Farbschemata
- reduzierte Bewegung
- hohe Kontraste
- größere Schrift

Für den Studienkontext ist diese Gestaltung wichtig, weil mehrere Personen mit unterschiedlichen Geräten und Wahrnehmungsanforderungen am Projekt arbeiten.

---

## 17. Wartung, Erweiterung und typische Änderungsaufgaben

### 17.1 Neue Komponente ins System aufnehmen

Empfohlene Reihenfolge:

1. Komponenten-ID und Kategorie festlegen
2. MQTT-Topic-Konvention definieren
3. Frontend-Hotspot und/oder Komponentenliste ergänzen
4. Mock-/Live-Mapping anpassen
5. Doku in `HARDWARE.md` und Hauptdoku ergänzen

### 17.2 Neue Auswertung im Backend ergänzen

1. Service-Methode in `sensor-data` implementieren
2. Controller-Endpunkt mit Validierung hinzufügen
3. Antwortmodell dokumentieren (`docs/API.md`)
4. Frontend-Hook ergänzen
5. UI in Detailansicht anbinden

### 17.3 Neue Simulationslogik ergänzen

1. Simulationsschritte modellieren (`steps`-Struktur)
2. Simulator-Engine erweitern
3. Start-/Stop-/Tick-Verhalten testen
4. Seiteneffekte auf Echt-/Testdaten dokumentieren

---

## 18. Troubleshooting-Leitfaden

### 18.1 Backend startet, aber keine Sensordaten kommen an

Prüfen:

- Ist `MQTT_BROKER_URL` gesetzt?
- Ist der Broker erreichbar (Netzwerk/Firewall)?
- Werden die erwarteten Topic-Muster wirklich publiziert?
- Zeigt das Backend Log-Meldungen zu `connect`/`subscribe`?

### 18.2 Frontend zeigt „Backend unreachable"

Prüfen:

- Läuft Backend auf Port 3000?
- Ist API-Basis korrekt (`/api` oder `VITE_API_BASE`)?
- Ist CORS-Origin freigegeben?

### 18.3 Top-Down-Ansicht zeigt falsche Komponentenanzahl

Prüfen:

- Konsistenz zwischen Hotspots und Komponentenliste
- ID-Bereiche (z. B. `ball-loader-1` bis `ball-loader-4`)
- Filterlogik im Komponentenbrowser

### 18.4 Simulator liefert keine Daten

Prüfen:

- `POST /api/warehouse-simulator/start` erfolgreich?
- `GET /api/warehouse-simulator/status` zeigt laufenden Zustand?
- Logs enthalten Tick-Ereignisse?

---

## 19. Abgabe-Checkliste (studentisch/prüfungsorientiert)

Diese Checkliste kann direkt vor der finalen Abgabe verwendet werden.

### 19.1 Funktionale Checks

- [ ] `docker compose up --build` startet alle Kernservices
- [ ] Frontend erreichbar (HTTPS)
- [ ] `GET /api/health` liefert `status: ok`
- [ ] Top-Down-Ansicht ist interaktiv
- [ ] Komponentenanzahl und IDs konsistent
- [ ] Historie/Statistiken abrufbar
- [ ] Simulator start/stop/tick funktionsfähig

### 19.2 Dokumentationschecks

- [ ] Hauptdokumentation vorhanden und vollständig
- [ ] Setup-Dokument aktuell
- [ ] API-Dokument aktuell
- [ ] Hardware-/Handover-Kapitel gepflegt
- [ ] Keine veralteten Template-Dateien

### 19.3 Qualitätschecks

- [ ] Frontend-Build erfolgreich
- [ ] Keine kritischen Runtime-Fehler im Log
- [ ] Offene TODOs als TODO markiert und eingeordnet

---

## 20. Perspektive für Folgejahrgänge

Für die Weiterentwicklung in Folgeprojekten empfehlen sich folgende Prioritäten:

1. **Security Layer**  
    Einführung von Authentifizierung und rollenbasierter Autorisierung.

2. **Betriebsmonitoring**  
    Ergänzung von Metriken, Alerting und zentralem Log-Stack.

3. **Migrationsstrategie**  
    Konsequent versionierte Prisma-Migrationen für produktionsnahen Betrieb.

4. **Hardware-Digital Twin**  
    Präzisere Modellierung von Anlagenzuständen für Prognosen und Fehlersimulation.

5. **Testabdeckung**  
    Ausbau von Integrations- und E2E-Tests entlang der Kernabläufe.

Diese Schritte bauen direkt auf der vorhandenen Architektur auf und sind mit überschaubarem Risiko erweiterbar.
