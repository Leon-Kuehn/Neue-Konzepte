# Projektubersicht: IoT Plant Admin

## Was das Projekt macht

IoT Plant Admin ist ein webbasiertes Uberwachungs- und Steuerungssystem fur eine IoT-Logistikanlage auf Basis von Siemens-Automatisierungshardware. Die Anwendung empfangt Sensordaten von physischen Komponenten (Forderbander, Sensoren, Eingabestationen, Hochregallager) uber das MQTT-Protokoll, speichert diese in einer Zeitreihendatenbank und stellt sie uber ein interaktives Web-Dashboard dar.

## Hauptkomponenten

### Backend (NestJS)

- Verzeichnis: `backend/`
- Technologie: Node.js, NestJS, Prisma ORM, TimescaleDB (PostgreSQL-kompatibel)
- Aufgaben:
  - MQTT-Client: abonniert Sensor-Topics und speichert eingehende Nachrichten in der Datenbank
  - REST-API: stellt Sensordaten, Simulationskonfigurationen und weitere Endpunkte bereit
  - Prisma-Migrationen: verwaltet das Datenbankschema

### Frontend (React / Vite)

- Verzeichnis: `frontend/`
- Technologie: React 19, TypeScript, Vite, Material UI 7, react-router-dom, mqtt.js
- Aufgaben:
  - Echtzeit-Dashboard mit interaktiver SVG-Anlagenansicht
  - Anzeige von Sensordaten und KPIs
  - Konfiguration der MQTT-Verbindung
  - Simulationsdesigner fur Testszenarien

## Kommunikation zwischen den Komponenten

```
[Siemens-Hardware / Raspberry Pi]
         |
     MQTT-Broker (z.B. Mosquitto auf Raspberry Pi)
         |
   ------+------
   |            |
Backend      Frontend (Browser)
(NestJS)     mqtt.js-Client
   |            |
TimescaleDB   Browser-UI
(PostgreSQL)
```

- Der **Backend**-Dienst abonniert die MQTT-Topics `entry-route/#`, `hochregallager/#` und `plant/#` und schreibt eingehende Nachrichten in die Datenbank.
- Das **Frontend** verbindet sich ebenfalls als MQTT-Client direkt mit dem Broker (via WebSocket) fur Echtzeitanzeigen.

## Technologie-Ubersicht

| Komponente | Technologien |
|------------|-------------|
| Backend    | Node.js 20, NestJS, Prisma 7, TimescaleDB (PostgreSQL 16) |
| Frontend   | React 19, TypeScript, Vite, Material UI 7, mqtt.js |
| Infrastruktur | Docker, Docker Compose, Nginx, TimescaleDB |
| Datenbank  | TimescaleDB (Hypertable fur Zeitreihendaten) |

## Weiterfuhrende Dokumentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Systemarchitektur, Docker-Dienste, MQTT-Topics, Datenbankschema
- [SETUP.md](SETUP.md) - Lokale Entwicklungsumgebung einrichten
- [API.md](API.md) - REST-API-Referenz des Backends
- [HARDWARE.md](HARDWARE.md) - Hardware-Komponenten und Pin-Belegung
- [HANDOVER.md](HANDOVER.md) - Ubergabenotizen fur den nachsten Studierendenjahrgang
