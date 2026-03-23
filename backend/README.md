# Backend – IoT Logistikmodell

## Überblick

Dieses Backend ist Teil eines IoT-Logistiksystems auf Basis von Fischertechnik und Raspberry Pi.

Es dient dazu, MQTT-Daten der Anlage zu empfangen, zu speichern und über eine REST-API für das Frontend bereitzustellen.

---

## Architektur

Systemübersicht:


Fischertechnik Anlage
↓
Raspberry Pi
↓
MQTT Broker
↓
├── Frontend (Live-Daten)
└── Backend (Historie & Analyse)
↓
TimescaleDB (PostgreSQL)


### Rollen

| Komponente | Aufgabe |
|----------|--------|
| MQTT Broker | verteilt Nachrichten |
| Backend | speichert & analysiert Daten |
| Frontend | visualisiert Daten |

---

## Technologien

- **NestJS** – Backend Framework
- **Prisma** – ORM
- **TimescaleDB (PostgreSQL)** – Datenbank
- **Docker** – Containerisierung
- **MQTT (mosquitto)** – Messaging

---

## Setup

### Voraussetzungen

- Docker + Docker Compose
- Node.js (nur für lokale Entwicklung)

---

### Starten


docker compose up --build


Backend läuft dann auf:


http://localhost:3000


---

## Datenmodell

### SensorData

Tabelle: `sensor_data`

| Feld | Typ | Beschreibung |
|-----|----|-------------|
| id | Int | Primärschlüssel |
| component_id | String | z. B. "entry-route" |
| topic | String | MQTT Topic |
| payload | JSON | Nachricht |
| received_at | DateTime | Zeitstempel |

---

## MQTT Integration

### Status

- Implementiert ✅
- Wartet auf echten Broker ⏳

---

### Verhalten

Das Backend:

- verbindet sich mit `MQTT_BROKER_URL`
- subscribed auf:


entry-route/#
hochregallager/#
plant/#


- speichert jede Nachricht in der Datenbank

---

### Payload Handling


try {
JSON.parse(payload)
} catch {
payload als String speichern
}


---

### Wichtige Regeln

- Kein eigener MQTT Broker im Backend
- Verbindung darf nicht zum Absturz führen
- Reconnect muss funktionieren

---

## API Dokumentation

Basis-URL:


/api


---

### Health Check


GET /api/health


Antwort:


{ "status": "ok" }


---

### Alle Daten


GET /api/sensor-data


---

### Letzte Werte pro Komponente


GET /api/sensor-data/latest


---

### Daten nach Komponente


GET /api/sensor-data/:componentId


Query:

- `limit` (default 100)
- `since` (ISO Timestamp)

---

### Zeitbereich


GET /api/sensor-data/range?from=...&to=...


---

### Statistiken


GET /api/sensor-data/stats/:componentId


Antwort:


{
"count": 10,
"firstTimestamp": "...",
"lastTimestamp": "...",
"averageValue": 50,
"minValue": 10,
"maxValue": 90
}


---

### Aktivität (Zeitbuckets)


GET /api/sensor-data/activity/:componentId?interval=minute


Antwort:


[
{ "time": "...", "count": 5 }
]

---

### Ollama Chat Proxy


POST /api/ollama/chat


Beispiel-Request:


{
	"model": "qwen2.5:7b",
	"stream": false,
	"messages": [
		{ "role": "system", "content": "Du bist ein Projektassistent." },
		{ "role": "user", "content": "Welche Sensor-Endpoints gibt es?" }
	]
}


Konfiguration über Umgebungsvariablen:

- `OLLAMA_CHAT_ENDPOINT` (default: `http://host.docker.internal:11434/api/chat`)
- `OLLAMA_MODEL` (optionaler Default, z. B. `qwen2.5:7b`)


---

## Wichtige Designentscheidungen

### 1. Trennung Live vs. Historie

- Frontend nutzt MQTT direkt (Live)
- Backend speichert Historie

---

### 2. Keine Aktorsteuerung

Das Backend sendet **keine MQTT-Befehle**.

→ Nur passiver Datenempfang

---

### 3. Skalierbarkeit

- Zeitbasierte Abfragen
- Limits für große Datenmengen
- einfache Erweiterbarkeit

---

## Entwicklungshinweise

### Struktur


src/
├── mqtt/
├── sensor-data/
├── prisma/
└── app.module.ts


---

### Prisma

- Kein `url` mehr im schema (Prisma 7)
- Config über `prisma.config.ts`

---

### Docker

- Backend läuft in Container
- DB ist eigener Container
- Kommunikation über Service-Namen

---

## Für KI-Agenten

### Wichtige Regeln

❗ NICHT ändern:

- Prisma Schema (ohne Absprache)
- bestehende API-Endpoints
- Docker Struktur

---

### Erlaubt:

- neue Endpoints
- neue Services
- Refactoring innerhalb Module

---

### Zu beachten:

- immer Limits verwenden
- keine unbounded queries
- keine neuen PrismaClients erstellen
- immer PrismaService verwenden

---

## Aktueller Stand

| Bereich | Status |
|--------|--------|
Backend Infrastruktur | ✅ fertig |
Datenbank | ✅ fertig |
API | ✅ fertig |
Statistik | ✅ fertig |
MQTT Code | ✅ fertig |
MQTT Verbindung | ⏳ wartet auf Broker |

---

## Nächste Schritte

- MQTT Broker anbinden
- Frontend Integration
- Visualisierung (Charts)

---

## Kontakt / Hinweise

Bei Fragen bitte im Team abstimmen.

Dieses Backend ist stabil und bereit für Integration.
