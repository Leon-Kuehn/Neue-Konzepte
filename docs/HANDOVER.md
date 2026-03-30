# Ubergabenotizen

## Aktueller Projektstatus

### Was funktioniert

- **Backend (NestJS)**: Vollstandig funktionsfahig. MQTT-Ingest, REST-API, Datenbankpersistenz und alle dokumentierten Endpunkte sind implementiert und getestet.
- **Frontend (React)**: Vollstandig funktionsfahig. Interaktive SVG-Anlagenansicht, Echtzeitdaten per MQTT, Simulationsdesigner, KPI-Dashboard und MQTT-Einstellungsseite sind implementiert.
- **Datenbank (TimescaleDB)**: Vollstandig eingerichtet. Zeitreihentabelle `sensor_data` als Hypertable konfiguriert. Prisma-Schema ist synchronisiert.
- **Docker Compose**: Das gesamte System lasst sich mit `docker compose up --build` starten.
- **Warehouse-Simulator**: Integrierter Backend-Dienst, der synthetische Lagerbewegungen generiert.

### Was unvollstandig oder eingeschrankt ist

- **Ollama-Integration**: Der Ollama-LLM-Dienst ist in `docker-compose.yml` auskommentiert, da das Docker-Image 7-9 GB benotigt. Die Implementierung im Backend und Frontend ist vorhanden, aber der Dienst muss manuell aktiviert werden.
- **HTTPS-Zertifikat**: Das Frontend verwendet ein selbstsigniertes Entwicklungszertifikat. Fur den Produktivbetrieb muss ein gultiges Zertifikat in `frontend/nginx/certs/` hinterlegt werden.
- **Frontend - Lint-Warnung**: Es gibt eine vorhandene Lint-Warnung in `frontend/src/components/ComponentGroupList.tsx` (keine Auswirkung auf die Funktionalitat).

## Bekannte Probleme und Einschrankungen

- Das Frontend verbindet sich direkt per WebSocket mit dem MQTT-Broker. Der Broker muss daher WebSocket-Verbindungen auf Port 1883 (oder einem konfigurierten Port) zulassen. Mosquitto muss entsprechend konfiguriert sein (`listener 1883`, `protocol websockets`).
- Die MQTT-Verbindungseinstellungen im Frontend werden im Browser-`localStorage` gespeichert und sind nicht persistiert im Backend.
- Der Warehouse-Simulator schreibt Testdaten in die produktive `sensor_data`-Tabelle. Bei Produktivbetrieb mit echter Hardware sollte der Simulator nicht parallel laufen.
- Keine Authentifizierung: Die REST-API ist ohne Zugriffsschutz erreichbar. Fur einen produktiven Einsatz musste eine Authentifizierungsschicht (z.B. JWT) erganze werden.

## Empfehlungen fur den nachsten Studierendenjahrgang

1. **Backend-Endpunkt fur Komponenten implementieren**: `GET /api/components` anlegen, der die Liste der bekannten Anlagekomponenten aus der Datenbank oder einer Konfigurationsdatei zuruckgibt.
2. **Authentifizierung erganzen**: JWT-basierte Authentifizierung fur die REST-API implementieren, damit die App nicht offen erreichbar ist.
3. **Produktionszertifikat einrichten**: Ein gultiges TLS-Zertifikat (z.B. via Let's Encrypt) fur das Nginx-Frontend konfigurieren.
4. **Pin-Dokumentation aktualisieren**: Die Pinbelegung der Siemens-Module am Raspberry Pi neu dokumentieren und in `docs/HARDWARE.md` erganzen.
5. **Mosquitto-Konfiguration dokumentieren**: Die exakte Konfigurationsdatei des MQTT-Brokers auf dem Raspberry Pi dokumentieren.
6. **Ollama-Integration abschliessen**: Entscheidung treffen, ob der Ollama-LLM-Assistent weiterentwickelt werden soll, und gegebenenfalls in den regularen Docker-Compose-Stack aufnehmen.
7. **Lint-Warnung beheben**: Vorhandene ESLint-Warnung in `frontend/src/components/ComponentGroupList.tsx` bereinigen.

## Zugangsdaten und physischer Hardware-Zugang

- **Raspberry Pi**: [TODO: IP-Adresse, SSH-Zugangsdaten und Standort bitte erganzen]
- **MQTT-Broker-Konfiguration**: [TODO: Pfad zur Mosquitto-Konfigurationsdatei auf dem Raspberry Pi erganzen]
- **Datenbank-Passwort (Produktion)**: [TODO: Falls geandert, sicheres Passwort dokumentieren oder auf Passwortverwaltung hinweisen]
- **Physische Anlage**: [TODO: Standort der Anlage, Ansprechperson fur Hardware-Zugang und Sicherheitshinweise erganzen]
- **DHBW-Serversystem**: [TODO: Server-URL, VPN-Zugang und Ansprechperson erganzen]

## Projekthistorie

Dieses Projekt wurde im Rahmen einer Studienarbeit im Kurs IoT-Logistik an der DHBW entwickelt. Es loste eine fruhere Python-basierte Implementierung ab und wurde vollstandig in TypeScript (Backend/Frontend) neu implementiert.
