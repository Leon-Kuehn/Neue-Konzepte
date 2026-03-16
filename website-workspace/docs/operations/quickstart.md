# Quickstart-Anleitung – IoT-Logistikmodell

Diese Anleitung beschreibt Schritt für Schritt, wie das IoT-Logistikmodell
(Hochregallager + Eingangsroute + Web-Frontend) eingerichtet und gestartet wird.

---

## 1. Voraussetzungen

### 1.1 Hardware

| Komponente | Anforderung |
|---|---|
| **Raspberry Pi (Hochregallager)** | Raspberry Pi 3/4, Raspbian/Raspberry Pi OS, I²C aktiviert |
| **Raspberry Pi (Eingangsroute)** | Raspberry Pi 3/4, Raspbian/Raspberry Pi OS |
| **Fischertechnik-Modell** | Hochregallager und Eingangsroute aufgebaut und verkabelt |
| **MQTT-Broker** | Separater Rechner oder RPi mit Mosquitto |
| **Docker-Host** | PC/Server mit Docker und Docker Compose (für Web-Frontend) |
| **Netzwerk** | Alle Geräte im selben lokalen Netzwerk (WLAN oder Ethernet) |

### 1.2 Software

| Software | Version | Zweck |
|---|---|---|
| Python | ≥ 3.7 | Modulsteuerung auf Raspberry Pi |
| pip | aktuell | Python-Paketverwaltung |
| Mosquitto | ≥ 2.0 | MQTT-Broker |
| Docker | ≥ 20.10 | Container-Runtime |
| Docker Compose | ≥ 2.0 | Multi-Container-Orchestrierung |
| Git | ≥ 2.0 | Repository-Verwaltung |
| Node.js | ≥ 18 (nur für Entwicklung) | Frontend-Build |

### 1.3 Netzwerkkonfiguration

| Gerät | IP-Adresse (Beispiel) | Port |
|---|---|---|
| MQTT-Broker (Mosquitto) | `192.168.178.40` | `1883` (TCP), `9001` (WebSocket) |
| Docker-Host (Frontend) | `192.168.178.x` | `80` (HTTP), `443` (HTTPS) |
| Raspberry Pi (Hochregallager) | `192.168.178.x` | – |
| Raspberry Pi (Eingangsroute) | `192.168.178.x` | – |

---

## 2. MQTT-Broker einrichten

### 2.1 Mosquitto installieren

Auf dem Broker-Rechner (z. B. separater Raspberry Pi):

```bash
sudo apt update
sudo apt install -y mosquitto mosquitto-clients
```

### 2.2 Mosquitto konfigurieren

Konfigurationsdatei bearbeiten:

```bash
sudo nano /etc/mosquitto/mosquitto.conf
```

Inhalt:

```conf
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd

# WebSocket-Listener für das Frontend
listener 9001
protocol websockets
```

### 2.3 Benutzer anlegen

> **⚠️ Sicherheitshinweis:** Die hier angegebenen Zugangsdaten (`dhbw-mqtt` /
> `daisy56`) sind für die **Entwicklungs- und Laborumgebung** vorgesehen. In einer
> produktiven Umgebung sollten sichere, individuelle Passwörter verwendet werden.

```bash
sudo mosquitto_passwd -c /etc/mosquitto/passwd dhbw-mqtt
# Passwort eingeben: daisy56
```

### 2.4 Mosquitto starten

```bash
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
sudo systemctl status mosquitto
```

### 2.5 Verbindung testen

In einem Terminal:

```bash
mosquitto_sub -h 192.168.178.40 -t "test/#" -u dhbw-mqtt -P daisy56
```

In einem zweiten Terminal:

```bash
mosquitto_pub -h 192.168.178.40 -t "test/hello" -m "Hallo Welt" -u dhbw-mqtt -P daisy56
```

Die Nachricht „Hallo Welt" sollte im ersten Terminal erscheinen.

---

## 3. Hochregallager einrichten

### 3.1 I²C auf dem Raspberry Pi aktivieren

```bash
sudo raspi-config
# Interface Options → I2C → Enable
sudo reboot
```

Nach dem Neustart prüfen:

```bash
sudo i2cdetect -y 1
```

Erwartete Adressen: `0x20`, `0x22`, `0x24` (MCP23017), `0x27` (LCD PCF8574)

### 3.2 Quellcode kopieren

```bash
mkdir -p ~/iot/high_bay_storage
# Dateien aus website-workspace/highbay-storage/ auf den RPi kopieren:
scp -r website-workspace/highbay-storage/* pi@<RPI_IP>:~/iot/high_bay_storage/
```

### 3.3 Python-Abhängigkeiten installieren

Auf dem Raspberry Pi:

```bash
cd ~/iot/high_bay_storage
pip install paho-mqtt RPLCD smbus2 RPi.GPIO
```

### 3.4 MQTT-Broker-Adresse konfigurieren

In `hbs_mqtt_client.py` die Broker-IP anpassen:

```python
SERVER_IP = "192.168.178.40"  # IP des MQTT-Brokers
PORT = 1883
```

### 3.5 Hochregallager starten

```bash
cd ~/iot/high_bay_storage
python3 hbs_main.py
```

**Erwartetes Verhalten:**

1. LCD zeigt Initialisierungsnachricht
2. Referenzfahrt aller drei Achsen (X, Y, Z)
3. Grüne LED leuchtet → System bereit
4. LCD zeigt „Bereit" oder ähnliche Nachricht

### 3.6 Funktionstest über MQTT

```bash
# Zufällig einlagern:
mosquitto_pub -h 192.168.178.40 \
  -t "hochregallager/set" \
  -m '{"operation": "STORE_RANDOM"}' \
  -u dhbw-mqtt -P daisy56

# Status beobachten:
mosquitto_sub -h 192.168.178.40 \
  -t "hochregallager/#" \
  -u dhbw-mqtt -P daisy56
```

---

## 4. Eingangsroute einrichten

> **⚠️ Hinweis:** Das Quell-Repository `DHBWLoerrach/iot-logistikmodel` ist derzeit
> privat und nicht zugänglich. Die folgenden Schritte sind vorbereitet für den Fall,
> dass Zugriff gewährt wird.

### 4.1 Repository klonen (sobald verfügbar)

```bash
cd website-workspace/entry-route/
git clone https://github.com/DHBWLoerrach/iot-logistikmodel .
```

### 4.2 Abhängigkeiten installieren

```bash
pip install -r requirements.txt
```

### 4.3 Konfiguration anpassen

MQTT-Broker-Adresse und Zugangsdaten analog zum Hochregallager konfigurieren.

### 4.4 Eingangsroute starten

```bash
cd ~/iot/entry_route
python3 <hauptskript>.py   # Genaues Hauptskript noch unbekannt
```

---

## 5. Web-Frontend und Backend starten

### 5.1 Repository klonen

```bash
git clone <REPO_URL> iot-logistik
cd iot-logistik
```

### 5.2 Docker Compose starten

```bash
docker compose up -d
```

Dies startet drei Container:

| Container | Port | Funktion |
|---|---|---|
| `db` (PostgreSQL) | `5432` | Datenbank |
| `backend` (NestJS) | `3000` | REST-API |
| `frontend` (Nginx) | `80`, `443` | Web-Oberfläche |

### 5.3 Status prüfen

```bash
docker compose ps
docker compose logs -f
```

### 5.4 Frontend öffnen

Im Browser: `https://<DOCKER_HOST_IP>/`

> **Hinweis:** Das selbstsignierte SSL-Zertifikat erzeugt eine Browser-Warnung.
> Diese kann für den Entwicklungsbetrieb ignoriert werden.

### 5.5 MQTT-Broker im Frontend konfigurieren

1. Seite `/mqtt` aufrufen
2. Broker-Adresse eingeben: `ws://192.168.178.40:9001` (WebSocket)
3. Benutzername: `dhbw-mqtt`
4. Passwort: `daisy56`
5. Verbinden

### 5.6 Anlagenvisualisierung

1. Seite `/plant` aufrufen
2. Interaktive SVG-Karte zeigt alle Komponenten
3. Hotspots anklicken für Details und Steuerung

---

## 6. Gesamtsystem-Test

### 6.1 Checkliste

| Schritt | Prüfung | ✓ |
|---|---|---|
| 1 | Mosquitto läuft und ist erreichbar | ☐ |
| 2 | Hochregallager-RPi ist mit Broker verbunden | ☐ |
| 3 | LCD zeigt „Bereit", grüne LED leuchtet | ☐ |
| 4 | MQTT-Testbefehle werden vom HBS ausgeführt | ☐ |
| 5 | Docker-Container laufen (db, backend, frontend) | ☐ |
| 6 | Frontend erreichbar unter `https://<IP>/` | ☐ |
| 7 | MQTT-Verbindung im Frontend konfiguriert und aktiv | ☐ |
| 8 | Anlagenvisualisierung zeigt Status der Module | ☐ |

### 6.2 End-to-End-Test

1. Im Frontend auf `/plant` navigieren
2. Hochregallager-Hotspot anklicken
3. Befehl „Einlagern zufällig" (STORE_RANDOM) senden
4. Beobachten:
   - HBS-Status wechselt zu „beschäftigt" (gelbe LED)
   - Achsen fahren, Box wird eingelagert
   - HBS-Status wechselt zurück zu „bereit" (grüne LED)
   - Ergebnismeldung im Frontend erscheint

---

## 7. Häufige Fehler und Lösungen

### 7.1 MQTT-Verbindung schlägt fehl

| Symptom | Mögliche Ursache | Lösung |
|---|---|---|
| `Connection refused` | Mosquitto läuft nicht | `sudo systemctl start mosquitto` |
| `Not authorized` | Falsche Zugangsdaten | Benutzername/Passwort prüfen |
| `Connection timed out` | Firewall blockiert Port | `sudo ufw allow 1883` und `sudo ufw allow 9001` |
| Frontend verbindet nicht | Kein WebSocket-Listener | `listener 9001` + `protocol websockets` in Mosquitto-Konfig |

### 7.2 I²C-Geräte nicht erkannt

| Symptom | Mögliche Ursache | Lösung |
|---|---|---|
| `i2cdetect` zeigt keine Adressen | I²C nicht aktiviert | `sudo raspi-config` → I2C → Enable |
| Nur teilweise Adressen sichtbar | Kabel locker | I²C-Verkabelung prüfen |
| `IOError: [Errno 121]` | Gerät antwortet nicht | MCP23017 / PCF8574 prüfen |

### 7.3 Hochregallager startet nicht

| Symptom | Mögliche Ursache | Lösung |
|---|---|---|
| `ModuleNotFoundError: paho` | Paket nicht installiert | `pip install paho-mqtt` |
| `ModuleNotFoundError: RPLCD` | Paket nicht installiert | `pip install RPLCD` |
| `RuntimeError: Not running on RPi` | Desktop-System erkannt | `SIMULATION = True` in `hbs_operator.py` setzen |
| LCD zeigt nichts | Falsche I²C-Adresse | Adresse `0x27` mit `i2cdetect` prüfen |
| Pickle-Fehler | Korrupte Speicherdatei | `obj/storage_places.pkl` löschen (setzt Lagerbelegung zurück) |

### 7.4 Docker-Container starten nicht

| Symptom | Mögliche Ursache | Lösung |
|---|---|---|
| `port already in use` | Port belegt | `sudo lsof -i :80` → Prozess beenden |
| `database not ready` | PostgreSQL noch nicht bereit | Warten oder `docker compose restart backend` |
| `build failed` | Fehlende Dateien | `git status` prüfen, ggf. `git pull` |
| Frontend zeigt 502 | Backend nicht erreichbar | `docker compose logs backend` prüfen |

### 7.5 Achsen fahren nicht korrekt

| Symptom | Mögliche Ursache | Lösung |
|---|---|---|
| Achse fährt nicht los | Endschalter dauerhaft aktiv | Mechanik prüfen, Endschalter-Position justieren |
| Achse fährt über Ziel | Positionssensor defekt | Sensor und Verkabelung prüfen |
| Not-Aus ausgelöst | Roter Taster gedrückt | Taster lösen, System neu initialisieren |
| Unbekannte Y-Position | Greiferposition verloren | `init_y`-Befehl senden (Referenzfahrt) |

---

## 8. Nützliche Befehle

### MQTT-Debugging

```bash
# Alle Nachrichten mithören:
mosquitto_sub -h 192.168.178.40 -t "#" -u dhbw-mqtt -P daisy56 -v

# Nur Hochregallager-Topics:
mosquitto_sub -h 192.168.178.40 -t "hochregallager/#" -u dhbw-mqtt -P daisy56 -v

# Belegung anzeigen:
mosquitto_pub -h 192.168.178.40 -t "hochregallager/set" \
  -m '{"operation": "show_occupancy"}' -u dhbw-mqtt -P daisy56

# System herunterfahren (Vorsicht!):
mosquitto_pub -h 192.168.178.40 -t "hochregallager/set" \
  -m '{"operation": "shutdown"}' -u dhbw-mqtt -P daisy56
```

### Docker-Befehle

```bash
# Container starten:
docker compose up -d

# Container stoppen:
docker compose down

# Logs anzeigen:
docker compose logs -f

# Datenbank zurücksetzen:
docker compose down -v
docker compose up -d

# In Container einsteigen:
docker compose exec backend sh
```

### Raspberry Pi – Fernzugriff

```bash
# SSH-Verbindung:
ssh pi@<RPI_IP>

# Hochregallager im Hintergrund starten:
nohup python3 ~/iot/high_bay_storage/hbs_main.py &

# Prozess finden und beenden:
ps aux | grep hbs_main
kill <PID>
```
