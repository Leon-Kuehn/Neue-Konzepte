# Hardware und Sensorreferenz

## Siemens-Automatisierungsmodule

Das Logistikmodell basiert auf Siemens-Baugruppen der LOGO!-/ET200-Reihe bzw. vergleichbaren Industriemodulen. Die genauen Typenbezeichnungen sind in den fruheren Datenblattern dokumentiert (nicht mehr im Repository enthalten). Die folgende Tabelle listet die im Quellcode referenzierten Komponentenklassen:

| Kategorie           | Rolle     | Anzahl (Mockdaten) | Beschreibung |
|---------------------|-----------|--------------------|--------------|
| `conveyor`          | Aktor     | 14                 | Forderbander (kurz und lang) |
| `rotating-conveyor` | Aktor     | 3                  | Drehforderbander / Weichen |
| `pusher`            | Aktor     | 2                  | Schieber / Pusher |
| `pneumatic-unit`    | Aktor     | 4                  | Pneumatische Fulleinheiten / Ball Loader |
| `crane`             | Aktor     | 1                  | Kran im Hochregallager |
| `storage`           | Aktor     | 1                  | Hochregallager (highbay-storage-1) |
| `deposit-place`     | Aktor     | 2                  | Ablageplatze |
| `input`             | Aktor     | 1                  | Eingabestation (input-station-1) |
| `inductive-sensor`  | Sensor    | 18                 | Induktive Sensoren (Warkenerfassung) |
| `rfid-sensor`       | Sensor    | 5                  | RFID-Lesegerate |
| `optical-sensor`    | Sensor    | 1                  | Lichtschranke (lightbarrier-1) |

## MQTT-Kommunikation

Jede Komponente kommuniziert uber folgende MQTT-Topics:

```
plant/{componentId}/status     - aktueller Status (on/off)
plant/{componentId}/command    - Steuerbefehl
plant/{componentId}/telemetry  - Messwerte
```

Das Hochregallager und die Eingabestrecke nutzen separate Topic-Namensraume:

```
entry-route/#       - Alle Topics der Eingabestrecke
hochregallager/#    - Alle Topics des Hochregallagers
```

## Anlagenansicht

Die interaktive Entry-Route-Ansicht wird im Frontend uber die Hotspot-Definitionen in `frontend/src/entryRoute/hotspots.config.json` und die Icon-Komponenten in `frontend/src/entryRoute/icons/` aufgebaut.

## Hotspot-ID-Zuordnung (Entry-Route-Karte)

Die Hotspot-IDs in `hotspots.config.json` stimmen direkt mit den Komponenten-IDs in den Mockdaten uberein:

| Hotspot-ID           | Komponenten-ID       | Typ |
|----------------------|----------------------|-----|
| `input-station-1`    | `input-station-1`    | Eingabestation |
| `conveyor-1` bis `conveyor-14` | gleich     | Forderbander |
| `rotating-conveyor-1` bis `-3` | gleich    | Drehforderbander |
| `inductive-1` bis `inductive-18` | gleich  | Induktive Sensoren |
| `rfid-1` bis `rfid-5` | gleich              | RFID-Sensoren |
| `ball-loader-1` bis `-4` | gleich           | Ball Loader |
| `lightbarrier-1`     | `lightbarrier-1`     | Lichtschranke |
| `highbay-storage-1`  | `highbay-storage-1`  | Hochregallager |

## Raspberry Pi als MQTT-Gateway

Der Raspberry Pi betreibt einen MQTT-Broker (Mosquitto) und vermittelt zwischen den Siemens-Modulen und dem Backend. Die IP-Adresse des Raspberry Pi ist uber die Umgebungsvariable `MQTT_BROKER_URL` konfigurierbar (Standardwert im `docker-compose.yml`: `mqtt://192.168.178.40:1883`).

Das Frontend verbindet sich direkt per WebSocket mit dem MQTT-Broker. Der Standardwert fur den Host ist `raspberrypi.local` (Port 1883), konfigurierbar uber die MQTT-Einstellungsseite in der App.

## Pin-Belegung

[TODO: Bitte erganzen - die ursprungliche Pin-Ubersicht (Excel-Datei) war im Repository vorhanden, wurde aber als Datenblattu-Datei entfernt. Eine Neu-Dokumentation der Pinbelegung der Siemens-Module am Raspberry Pi ist erforderlich.]

## Physische Einrichtungsanforderungen

1. Siemens-Module sind an der physischen Logistikanlage montiert und uber Feldbuskabel verbunden.
2. Ein Raspberry Pi muss im gleichen Netzwerk wie der Server betrieben werden.
3. Mosquitto (MQTT-Broker) muss auf dem Raspberry Pi laufen und WebSocket-Verbindungen auf Port 1883 akzeptieren.
4. Die IP-Adresse des Raspberry Pi muss uber `MQTT_BROKER_URL` im `docker-compose.yml` oder einer `.env`-Datei konfiguriert werden.

[TODO: Bitte erganzen - Netzwerkkonfiguration, VLAN-Einstellungen und Zugangsdaten fur die physische Anlage.]
