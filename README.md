# IoT Plant Admin

Webbasiertes Uberwachungs- und Steuerungssystem fur eine IoT-Logistikanlage auf Basis von Siemens-Automatisierungshardware.

Das System besteht aus zwei Hauptkomponenten: einem NestJS-Backend und einem React-Frontend. Die Komponenten kommunizieren uber MQTT (Echtzeitsensordaten) und eine REST-API.

## Schnellstart

```bash
docker compose up --build
```

Für einen sauberen, reproduzierbaren Neustart (inkl. Entfernen von Orphans):

```bash
./scripts/compose-up-clean.sh
```

Das Frontend ist danach unter [https://localhost](https://localhost) erreichbar (selbstsigniertes Entwicklungszertifikat).

Fur die MQTT-Verbindung muss die Adresse des MQTT-Brokers (Raspberry Pi) konfiguriert werden:

```bash
MQTT_BROKER_URL=mqtt://<raspberry-pi-ip>:1883 docker compose up --build
```

## Dokumentation

| Dokument | Inhalt |
| -------- | ------ |
| [docs/PROJEKTDOKUMENTATION.md](docs/PROJEKTDOKUMENTATION.md) | Zusammenhängende Hauptdokumentation (Architektur, Frontend, Backend, Betrieb) |
| [docs/README.md](docs/README.md) | Projektubersicht, Komponentenbeschreibung, Technologie-Stack |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Systemarchitektur, Docker-Dienste, MQTT-Topics, Datenbankschema |
| [docs/SETUP.md](docs/SETUP.md) | Lokale Entwicklungsumgebung, Voraussetzungen, Umgebungsvariablen |
| [docs/API.md](docs/API.md) | REST-API-Referenz des Backends (alle Endpunkte) |
| [docs/HARDWARE.md](docs/HARDWARE.md) | Hardware-Komponenten, Anlagenansicht, Pin-Belegung |
| [docs/HANDOVER.md](docs/HANDOVER.md) | Ubergabenotizen, bekannte Probleme, empfohlene nachste Schritte |

## Verzeichnisstruktur

```text
backend/        NestJS-Backend (REST-API, MQTT-Ingest, Prisma ORM)
frontend/       React-Frontend (Vite, Material UI)
docker/         Datenbankinitialisierungsskripte
docs/           Projektdokumentation
docker-compose.yml
```
