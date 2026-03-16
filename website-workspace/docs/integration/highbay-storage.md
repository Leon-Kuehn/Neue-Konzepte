# Hochregallager-Modul – Vollständige Dokumentation

## 1. Übersicht

Das Hochregallager-Modul (High-Bay Storage, HBS) steuert ein automatisiertes
Fischertechnik-Regalsystem über einen Raspberry Pi. Es bietet 50 Lagerplätze
in einem Raster von 10 X-Positionen × 5 Z-Ebenen. Ein Drei-Achsen-Fahrwerk
(X, Y, Z) mit Greifmechanik transportiert Boxen zwischen Übergabeposition und
Lagerplatz.

**Quell-Repository:** [`smlaage/DHBW-HBS`](https://github.com/smlaage/DHBW-HBS)
**Lokaler Pfad:** `website-workspace/highbay-storage/`

---

## 2. Dateiübersicht

| Datei | Klasse / Inhalt | Beschreibung |
|---|---|---|
| `hbs_main.py` | `HBS` | Einstiegspunkt, Hauptschleife, Kommandoentschlüsselung |
| `hbs_controller.py` | `HBSController` | Lagerverwaltung, Ein-/Auslagerung, Persistenz |
| `hbs_operator.py` | `HBSOperator` | Achsensteuerung, Greifmechanik, Hardware-Abstraction |
| `hbs_mqtt_client.py` | `MQTTClient` | MQTT-Verbindung, Topic-Abonnements, Nachrichtenversand |
| `hbs_user_terminal.py` | `UserTerminal` | LCD-Anzeige, LEDs, Taster, Benutzerinteraktion |
| `hbs_collections.py` | Enumerationen | IOPins, SysStatus, YPos, Msg |
| `io_extension.py` | `IOExtension` | I²C-Treiber für MCP23017 GPIO-Expander |
| `hbs_messages_de.dat` | Nachrichtendatei | Deutsche Klartextnachrichten für LCD-Anzeige |
| `obj/storage_places.pkl` | Pickle-Datei | Persistente Lagerbelegung |
| `logfiles/` | Verzeichnis | Laufzeitprotokolle |

---

## 3. Detaillierte Dateibeschreibungen

### 3.1 `hbs_main.py` – Einstiegspunkt

#### Klasse `HBS`

Dies ist der zentrale Einstiegspunkt des gesamten Moduls. Beim Start werden alle
Teilsysteme initialisiert und die Hauptschleife gestartet.

**Konstanten:**

| Name | Wert | Beschreibung |
|---|---|---|
| `HOME_DIR` | `/home/<user>/iot/high_bay_storage` | Arbeitsverzeichnis auf dem Raspberry Pi |

**Initialisierung (Reihenfolge):**

1. `UserTerminal` – LCD, LEDs, Taster
2. `HBSController` – Lagerverwaltung und Achsensteuerung
3. `MQTTClient` – Verbindung zum MQTT-Broker

**Hauptschleife:**

Die Hauptschleife wartet auf zwei Ereignisquellen:

1. **MQTT-Nachrichten** – JSON-Kommandos über das Topic `hochregallager/set`
2. **Manuelle Tastereingabe** – Bedienung über die physischen Taster am Gerät

Eingehende MQTT-Nachrichten werden mit der Methode `decode_json()` entschlüsselt und
in die entsprechende Controller-Aktion umgesetzt.

**Unterstützte Kommandos:**

| Kommando | Aktion |
|---|---|
| `store` | Einlagern an bestimmter Position (x, z) |
| `destore` | Auslagern von bestimmter Position (x, z) |
| `rearrange` | Umlagern von (x, z) nach (x_new, z_new) |
| `store_random` | Einlagern an zufälligem freien Platz |
| `destore_random` | Auslagern von zufälligem belegten Platz |
| `init_x` | X-Achse initialisieren (Referenzfahrt) |
| `init_y` | Y-Achse initialisieren (Referenzfahrt) |
| `init_z` | Z-Achse initialisieren (Referenzfahrt) |
| `show_occupancy` | Belegung auf LCD anzeigen |
| `shutdown` | System herunterfahren (`sudo poweroff`) |

**Startbefehl:**

```bash
cd /home/<user>/iot/high_bay_storage
python3 hbs_main.py
```

> **Hinweis:** `<user>` ist ein Platzhalter für den tatsächlichen Benutzernamen auf
> dem Raspberry Pi (z. B. `pi`). Der Pfad entspricht der Konstante `HOME_DIR` in
> `hbs_main.py` und muss ggf. an die lokale Umgebung angepasst werden.

---

### 3.2 `hbs_controller.py` – Lagerverwaltung

#### Klasse `HBSController`

Verwaltet die 50 Lagerplätze und orchestriert Ein-/Auslagerungsvorgänge.

**Persistenz:**

- Lagerbelegung wird in `obj/storage_places.pkl` (Python Pickle) gespeichert
- Automatisches Laden beim Start und Speichern nach jeder Änderung

**Lagerplatz-Datenstruktur:**

Jeder Lagerplatz hat folgende Attribute:

| Attribut | Typ | Beschreibung |
|---|---|---|
| `x` | int | X-Position (1–10) |
| `z` | int | Z-Ebene (1–5) |
| `taken` | bool | Belegt (`True`) oder frei (`False`) |
| `timestamp` | float | Zeitstempel der letzten Änderung |

**Lagerraster:**

```
Z-Ebene 5:  [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ][10]
Z-Ebene 4:  [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ][10]
Z-Ebene 3:  [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ][10]
Z-Ebene 2:  [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ][10]
Z-Ebene 1:  [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ][10]
             X=1   X=2   X=3   X=4   X=5   X=6   X=7   X=8   X=9  X=10
```

**Methoden:**

| Methode | Parameter | Beschreibung |
|---|---|---|
| `store_box(x, z)` | X-Position, Z-Ebene | Box an bestimmtem Platz einlagern |
| `destore_box(x, z)` | X-Position, Z-Ebene | Box von bestimmtem Platz auslagern |
| `store_box_random()` | – | Box an zufälligem freien Platz einlagern |
| `destore_box_random()` | – | Box von zufälligem belegten Platz auslagern |
| `rearrange_box(x, z, x_new, z_new)` | Alter und neuer Platz | Box umlagern |

**Ablauf einer Einlagerung (`store_box`):**

1. Prüfen, ob der Zielplatz frei ist
2. Achsen zur Übergabeposition fahren (Y = STORE)
3. Box aufnehmen (`get_box`)
4. Achsen zum Zielplatz fahren (X, Z)
5. Box ablegen (`put_box`)
6. Lagerplatz als belegt markieren
7. Zustand persistieren (Pickle)

---

### 3.3 `hbs_operator.py` – Achsensteuerung

#### Klasse `HBSOperator`

Steuert die physischen Achsen und die Greifmechanik auf niedrigster Ebene.

**Achsenkonfiguration:**

| Achse | Bereich | Funktion |
|---|---|---|
| **X** | 1–10 | Horizontale Position (links/rechts) |
| **Y** | DESTORE / DEFAULT / STORE / UNDEFINED | Vertikale Greiferposition (aus-/einlagern) |
| **Z** | 1–5 | Regalebene (oben/unten) |

**Y-Positionen (Enum `YPos`):**

| Wert | Beschreibung |
|---|---|
| `DESTORE` | Greiferposition zum Auslagern (Box aus Regal entnehmen) |
| `DEFAULT` | Standardposition (Fahrposition) |
| `STORE` | Greiferposition zum Einlagern (Box ins Regal setzen) |
| `UNDEFINED` | Unbekannte Position (nach Fehler) |

**Bewegungsmethoden:**

| Methode | Beschreibung |
|---|---|
| `move_xpos(target)` | X-Achse zur Zielposition fahren |
| `move_ypos(target)` | Y-Achse zur Zielposition fahren |
| `move_zpos(target)` | Z-Achse zur Zielposition fahren |
| `move_xzpos(x, z)` | X- und Z-Achse gleichzeitig fahren |
| `move_home()` | Alle Achsen in Ausgangsposition fahren |

**Box-Handhabung:**

| Methode | Beschreibung |
|---|---|
| `put_box()` | Box am aktuellen Lagerplatz ablegen |
| `get_box()` | Box vom aktuellen Lagerplatz aufnehmen |
| `fetch_box()` | Box von Übergabeposition abholen |
| `drop_box()` | Box an Übergabeposition absetzen |

**Initialisierungsmethoden (Referenzfahrten):**

| Methode | Beschreibung |
|---|---|
| `init_xpos()` | X-Achse auf Referenzpunkt fahren |
| `init_ypos()` | Y-Achse auf Referenzpunkt fahren |
| `init_zpos()` | Z-Achse auf Referenzpunkt fahren |

**Sonderfunktionen:**

- **Not-Aus:** Roter Taster stoppt alle Achsen sofort
- **Simulationsmodus:** `SIMULATION`-Flag erlaubt Testbetrieb ohne Hardware

---

### 3.4 `hbs_mqtt_client.py` – MQTT-Kommunikation

#### Klasse `MQTTClient`

Kapselt die gesamte MQTT-Kommunikation des Hochregallagers.

**Konfiguration:**

| Parameter | Standardwert | Beschreibung |
|---|---|---|
| `SERVER_IP` | `192.168.1.94` | IP-Adresse des MQTT-Brokers |
| `PORT` | `1883` | TCP-Port des MQTT-Brokers |
| `MQTT_USERNAME` | `dhbw-mqtt` | Benutzername für die Authentifizierung |
| `MQTT_PASSWORD` | `daisy56` | Passwort für die Authentifizierung |

> **Hinweis:** Im produktiven Netz (README) wird die IP `192.168.178.40` verwendet.
> Der Code enthält als Standard `192.168.1.94`. Die tatsächlich verwendete Adresse
> hängt von der Netzwerkkonfiguration ab.

**Topics:**

| Topic | Typ | QoS | Beschreibung |
|---|---|---|---|
| `hochregallager/set` | Subscribe | – | Empfängt JSON-Kommandos |
| `hochregallager/status` | Publish | – | Sendet Statusmeldungen |
| `hochregallager/result` | Publish | – | Sendet Operationsergebnisse |

**Bibliothek:** `paho-mqtt` (`paho.mqtt.client`)

**Callback-Funktionen:**

- `on_connect` – Wird bei erfolgreicher Verbindung aufgerufen, abonniert `hochregallager/set`
- `on_message` – Wird bei eingehender Nachricht aufgerufen, leitet an `decode_json()` weiter

---

### 3.5 `hbs_user_terminal.py` – Benutzerschnittstelle

#### Klasse `UserTerminal`

Steuert das physische Benutzerinterface am Hochregallager.

**LCD-Display:**

| Parameter | Wert |
|---|---|
| Typ | HD44780 (4 Zeilen × 20 Zeichen) |
| Ansteuerung | I²C über PCF8574 |
| I²C-Adresse | `0x27` |
| Bibliothek | RPLCD (`RPLCD.i2c.CharLCD`) |

**LED-Anzeigen:**

| Farbe | Bedeutung |
|---|---|
| 🟢 Grün | System bereit (Ready) |
| 🟡 Gelb | System beschäftigt (Busy) |
| 🔴 Rot | Fehler (Error) |
| 🔵 Blau | Lager voll (Storage Full) |

**Taster:**

| Farbe | Einzelfunktion | Kombination |
|---|---|---|
| 🔵 Blau | Manueller Modus aktivieren | – |
| 🟢 Grün | Navigation: runter | Grün + Gelb = Programm beenden |
| 🟡 Gelb | Navigation: hoch | – |
| 🔴 Rot | Not-Aus (Sofortstopp) | Grün + Rot = System herunterfahren |

**Nachrichtendatei:**

Die Klartextnachrichten für das LCD werden aus `hbs_messages_de.dat` geladen.
Format: Schlüssel-Wert-Paare, eine Nachricht pro Zeile.

**Bibliotheken:** `RPLCD`, `RPi.GPIO`

---

### 3.6 `hbs_collections.py` – Enumerationen und Konstanten

Definiert alle systemweiten Enumerationen:

#### Enum `IOPins`

Zuordnung der logischen Pin-Namen zu physischen Ports der MCP23017 GPIO-Expander.
Ermöglicht eine hardwareunabhängige Adressierung der I/O-Signale.

#### Enum `SysStatus`

| Wert | Bedeutung |
|---|---|
| `ERROR` | Fehler aufgetreten |
| `READY` | System betriebsbereit |
| `BUSY` | Operation wird ausgeführt |

#### Enum `YPos`

| Wert | Beschreibung |
|---|---|
| `DESTORE` | Auslagerposition |
| `DEFAULT` | Fahrposition (Standard) |
| `STORE` | Einlagerposition |
| `UNDEFINED` | Unbekannt / ungültig |

#### Enum `Msg`

Alle Fehler- und Statuscodes, die vom System verwendet werden. Dient als Schlüssel
für die Nachrichtendatei `hbs_messages_de.dat`.

---

### 3.7 `io_extension.py` – I²C-GPIO-Erweiterung

#### Klasse `IOExtension`

Treiber für die I²C-Kommunikation mit den MCP23017 GPIO-Expandern.

**MCP23017-Konfiguration:**

| Chip | I²C-Adresse | Funktion |
|---|---|---|
| Chip 1 | `0x20` | I/O-Gruppe A |
| Chip 2 | `0x24` | I/O-Gruppe B |
| Chip 3 | `0x22` | I/O-Gruppe C |

**I/O-Belegung:**

| Gruppe | Typ | Anzahl | Beschreibung |
|---|---|---|---|
| In-A | Eingang | 8 | Sensoren / Endschalter Gruppe A |
| In-B | Eingang | 8 | Sensoren / Endschalter Gruppe B |
| In-C | Eingang | 8 | Sensoren / Endschalter Gruppe C |
| In-D | Eingang | 8 | Sensoren / Endschalter Gruppe D |
| Out-A | Ausgang | 8 | Motoren / Aktoren Gruppe A |
| Out-B | Ausgang | 8 | Motoren / Aktoren Gruppe B |

**Gesamt:** 32 digitale Eingänge, 16 digitale Ausgänge

**Bibliothek:** `smbus2` (`SMBus`)

---

### 3.8 `hbs_messages_de.dat` – Nachrichtendatei

Deutsche Klartextnachrichten für die LCD-Anzeige. Jede Nachricht wird über einen
Schlüssel (aus `Msg`-Enum) referenziert.

**Format:**

```
<SCHLUESSEL>=<Nachrichtentext>
```

**Beispielhafte Nachrichtentypen:**

- Statusmeldungen (Bereit, Beschäftigt, Initialisierung)
- Fehlermeldungen (Position ungültig, Platz belegt, Platz leer, Lager voll)
- Operationsmeldungen (Einlagern, Auslagern, Umlagern)
- Systemmeldungen (Herunterfahren, Not-Aus, Programmende)

---

## 4. MQTT-Nachrichtenformat (vollständig)

### 4.1 Eingehende Befehle (`hochregallager/set`)

Alle Befehle sind JSON-Objekte mit dem Pflichtfeld `operation`:

#### STORE – Einlagern an bestimmter Position

```json
{
  "operation": "STORE",
  "x": 5,
  "z": 3
}
```

#### STORE_RANDOM – Einlagern an zufälligem freien Platz

```json
{
  "operation": "STORE_RANDOM"
}
```

#### STORE_ASCENDING – Einlagern aufsteigend

```json
{
  "operation": "STORE_ASCENDING"
}
```

#### DESTORE – Auslagern von bestimmter Position

```json
{
  "operation": "DESTORE",
  "x": 5,
  "z": 3
}
```

#### DESTORE_RANDOM – Auslagern von zufälligem belegten Platz

```json
{
  "operation": "DESTORE_RANDOM"
}
```

#### DESTORE_ASCENDING – Auslagern aufsteigend

```json
{
  "operation": "DESTORE_ASCENDING"
}
```

#### DESTORE_OLDEST – Älteste Box auslagern

```json
{
  "operation": "DESTORE_OLDEST"
}
```

#### REARRANGE – Box umlagern

```json
{
  "operation": "REARRANGE",
  "x": 2,
  "z": 1,
  "x_new": 8,
  "z_new": 4
}
```

### 4.2 Ausgehende Statusmeldungen (`hochregallager/status`)

Statusmeldungen informieren über den aktuellen Systemzustand:

```json
{
  "status": "ready"
}
```

Mögliche Werte: `ready`, `busy`, `error`

### 4.3 Ausgehende Ergebnisse (`hochregallager/result`)

Ergebnisnachrichten bestätigen den Abschluss einer Operation:

```json
{
  "operation": "STORE",
  "x": 5,
  "z": 3,
  "result": "success"
}
```

---

## 5. Abhängigkeiten

### 5.1 Python-Pakete

| Paket | Import | Zweck |
|---|---|---|
| `paho-mqtt` | `paho.mqtt.client` | MQTT-Client-Bibliothek |
| `RPLCD` | `RPLCD.i2c.CharLCD` | HD44780-LCD-Ansteuerung über I²C |
| `RPi.GPIO` | `RPi.GPIO` | GPIO-Zugriff auf Raspberry Pi |
| `smbus2` | `smbus2.SMBus` | I²C-Bus-Kommunikation |

### 5.2 Python-Standardbibliothek

| Modul | Zweck |
|---|---|
| `logging` | Protokollierung |
| `json` | JSON-Parsing der MQTT-Nachrichten |
| `pickle` | Serialisierung der Lagerbelegung |
| `random` | Zufallsauswahl bei `*_random`-Operationen |
| `time` | Zeitstempel und Verzögerungen |
| `os` | Dateisystemoperationen |
| `subprocess` | Systemaufruf für `sudo poweroff` |
| `enum` | Enumerationen |

### 5.3 Installation

```bash
pip install paho-mqtt RPLCD smbus2 RPi.GPIO
```

> **Hinweis:** `RPi.GPIO` und `smbus2` sind nur auf Raspberry Pi (mit aktiviertem
> I²C) lauffähig. Für Entwicklung auf Desktop-Systemen muss der `SIMULATION`-Modus
> in `hbs_operator.py` aktiviert werden.

---

## 6. Konfigurationsparameter

| Parameter | Datei | Standardwert | Beschreibung |
|---|---|---|---|
| `HOME_DIR` | `hbs_main.py` | `/home/<user>/iot/high_bay_storage` | Arbeitsverzeichnis |
| `SERVER_IP` | `hbs_mqtt_client.py` | `192.168.1.94` | MQTT-Broker-IP |
| `PORT` | `hbs_mqtt_client.py` | `1883` | MQTT-Broker-Port |
| `MQTT_USERNAME` | `hbs_mqtt_client.py` | `dhbw-mqtt` | MQTT-Benutzername |
| `MQTT_PASSWORD` | `hbs_mqtt_client.py` | `daisy56` | MQTT-Passwort |
| `SIMULATION` | `hbs_operator.py` | `False` | Simulationsmodus ein/aus |
| I²C-Adressen | `io_extension.py` | `0x20`, `0x24`, `0x22` | MCP23017-Adressen |
| LCD-Adresse | `hbs_user_terminal.py` | `0x27` | PCF8574 I²C-Adresse |
| Speicherdatei | `hbs_controller.py` | `obj/storage_places.pkl` | Pickle-Datei für Lagerbelegung |

---

## 7. Verzeichnisstruktur

```
website-workspace/highbay-storage/
├── hbs_main.py              ← Einstiegspunkt
├── hbs_controller.py        ← Lagerverwaltung
├── hbs_operator.py          ← Achsensteuerung
├── hbs_mqtt_client.py       ← MQTT-Client
├── hbs_user_terminal.py     ← LCD, LEDs, Taster
├── hbs_collections.py       ← Enumerationen
├── io_extension.py          ← I²C-Treiber
├── hbs_messages_de.dat      ← Deutsche Meldungstexte
├── HBS-Kurzanleitung.pdf    ← Kurzanleitung (PDF)
├── README.md                ← Original-README
├── obj/
│   └── storage_places.pkl   ← Persistente Lagerbelegung
└── logfiles/                ← Protokolldateien
```
