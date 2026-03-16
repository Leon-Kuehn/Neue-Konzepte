# Modulinteraktion – Hochregallager & Eingangsroute

## 1. Übersicht

Das IoT-Logistikmodell besteht aus zwei physisch getrennten Modulen, die über einen
gemeinsamen **MQTT-Broker** miteinander kommunizieren. Dieses Dokument beschreibt,
wie die Module zusammenspielen, welche Daten ausgetauscht werden und wie der typische
Materialfluss abläuft.

---

## 2. Architektur der Interaktion

```mermaid
graph LR
    subgraph Eingangsroute
        ER[Raspberry Pi<br>Eingangsroute]
    end

    subgraph MQTT-Broker
        MOSQ[Mosquitto<br>192.168.178.40:1883]
    end

    subgraph Hochregallager
        HBS[Raspberry Pi<br>Hochregallager]
    end

    subgraph Web-Frontend
        FE[React-App<br>mqtt.js]
    end

    ER -->|Publish: Status & Sensordaten| MOSQ
    ER -->|Subscribe: Steuerbefehle| MOSQ
    HBS -->|Publish: Status & Ergebnisse| MOSQ
    HBS -->|Subscribe: hochregallager/set| MOSQ
    FE -->|Publish: Befehle| MOSQ
    FE -->|Subscribe: Status & Ergebnisse| MOSQ
    MOSQ -.->|Nachrichtenverteilung| MOSQ
```

### Kommunikationsprinzip

- **Lose Kopplung:** Die Module kennen sich nicht direkt – sie kommunizieren
  ausschließlich über MQTT-Topics.
- **Publish/Subscribe:** Jedes Modul veröffentlicht seinen Status und abonniert
  Befehle.
- **Zentraler Broker:** Mosquitto verteilt alle Nachrichten an die jeweiligen
  Abonnenten.
- **Frontend als Orchestrator:** Das Web-Frontend kann Befehle an beide Module
  senden und deren Status visualisieren.

---

## 3. Gemeinsame MQTT-Infrastruktur

### 3.1 Broker-Konfiguration

| Parameter | Wert |
|---|---|
| **Software** | Eclipse Mosquitto |
| **IP-Adresse** | `192.168.178.40` |
| **TCP-Port** | `1883` |
| **Benutzername** | `dhbw-mqtt` |
| **Passwort** | `daisy56` |
| **Protokoll** | MQTT v3.1.1 / v5.0 |

### 3.2 Topic-Übersicht (Gesamtsystem)

| Topic | Sender | Empfänger | Beschreibung |
|---|---|---|---|
| `hochregallager/set` | Frontend, Eingangsroute | Hochregallager | Steuerbefehle für HBS |
| `hochregallager/status` | Hochregallager | Frontend, Eingangsroute | Systemstatus des HBS |
| `hochregallager/result` | Hochregallager | Frontend, Eingangsroute | Ergebnis einer HBS-Operation |
| `eingangsroute/set`* | Frontend | Eingangsroute | Steuerbefehle für Eingangsroute |
| `eingangsroute/status`* | Eingangsroute | Frontend | Status der Eingangsroute |
| `eingangsroute/sensor/*`* | Eingangsroute | Frontend | Sensordaten |

> \* = Geschätzte Topics – noch nicht aus Quellcode verifiziert (siehe
> [Eingangsroute-Dokumentation](entry-route.md)).

---

## 4. Materialfluss und Interaktionsszenarien

### 4.1 Szenario: Werkstück einlagern (End-to-End)

```mermaid
sequenceDiagram
    participant ES as Eingabestation
    participant ER as Eingangsroute (RPi)
    participant MQTT as MQTT-Broker
    participant HBS as Hochregallager (RPi)
    participant FE as Web-Frontend

    Note over ES: Werkstück einlegen

    ES->>ER: Sensor erkennt Werkstück
    ER->>MQTT: Publish: eingangsroute/status<br>{"status": "transporting"}
    MQTT->>FE: Status-Update anzeigen

    Note over ER: Transport über<br>Förderbänder 1-5

    ER->>MQTT: Publish: eingangsroute/sensor/rfid/1<br>{"tag_id": "ABC123"}
    MQTT->>FE: RFID-Erkennung anzeigen

    Note over ER: Werkstück erreicht<br>Übergabepunkt

    ER->>MQTT: Publish: hochregallager/set<br>{"operation": "STORE_RANDOM"}
    MQTT->>HBS: Einlagerungsbefehl

    HBS->>MQTT: Publish: hochregallager/status<br>{"status": "busy"}
    MQTT->>FE: HBS-Status: beschäftigt
    MQTT->>ER: HBS-Status: beschäftigt

    Note over HBS: Achsen fahren,<br>Box einlagern

    HBS->>MQTT: Publish: hochregallager/result<br>{"operation": "STORE", "x": 3, "z": 2, "result": "success"}
    MQTT->>FE: Ergebnis anzeigen
    MQTT->>ER: Einlagerung bestätigt

    HBS->>MQTT: Publish: hochregallager/status<br>{"status": "ready"}
    MQTT->>FE: HBS-Status: bereit
```

### 4.2 Szenario: Werkstück auslagern und über Eingangsroute ausgeben

```mermaid
sequenceDiagram
    participant FE as Web-Frontend
    participant MQTT as MQTT-Broker
    participant HBS as Hochregallager (RPi)
    participant ER as Eingangsroute (RPi)
    participant AS as Ausgabestation

    FE->>MQTT: Publish: hochregallager/set<br>{"operation": "DESTORE", "x": 3, "z": 2}
    MQTT->>HBS: Auslagerungsbefehl

    HBS->>MQTT: Publish: hochregallager/status<br>{"status": "busy"}
    MQTT->>FE: HBS-Status: beschäftigt

    Note over HBS: Achsen fahren,<br>Box auslagern

    HBS->>MQTT: Publish: hochregallager/result<br>{"operation": "DESTORE", "x": 3, "z": 2, "result": "success"}
    MQTT->>FE: Ergebnis anzeigen
    MQTT->>ER: Auslagerung abgeschlossen

    Note over ER: Werkstück auf<br>Förderstrecke übernehmen

    ER->>MQTT: Publish: eingangsroute/status<br>{"status": "transporting"}
    MQTT->>FE: Transport-Status

    Note over ER: Transport zum Ausgabepunkt

    ER->>AS: Werkstück ausgeben
    ER->>MQTT: Publish: eingangsroute/status<br>{"status": "idle"}
    MQTT->>FE: Route frei
```

### 4.3 Szenario: Manueller Betrieb am Hochregallager

```mermaid
sequenceDiagram
    participant OP as Bediener
    participant UT as UserTerminal<br>(LCD + Taster)
    participant HBS as HBSController
    participant MQTT as MQTT-Broker
    participant FE as Web-Frontend

    OP->>UT: Blauen Taster drücken<br>(Manueller Modus)
    UT->>HBS: Manuellen Modus aktivieren

    OP->>UT: Gelb/Grün navigieren<br>Operation auswählen
    UT->>HBS: store_box_random()

    HBS->>MQTT: Publish: hochregallager/status<br>{"status": "busy"}
    MQTT->>FE: Status-Update

    Note over HBS: Einlagerung durchführen

    HBS->>UT: Ergebnis auf LCD anzeigen
    HBS->>MQTT: Publish: hochregallager/result<br>{"operation": "STORE", ...}
    MQTT->>FE: Ergebnis anzeigen

    HBS->>MQTT: Publish: hochregallager/status<br>{"status": "ready"}
```

---

## 5. Datenformate im Austausch

### 5.1 Befehlsnachrichten (→ Modul)

Befehle an ein Modul folgen einem einheitlichen JSON-Schema:

```json
{
  "operation": "<OPERATIONS_CODE>",
  "<param1>": <wert>,
  "<param2>": <wert>
}
```

#### Hochregallager-Befehle (verifiziert)

| Operation | Zusätzliche Felder | Beispiel |
|---|---|---|
| `STORE` | `x`, `z` | `{"operation": "STORE", "x": 5, "z": 3}` |
| `STORE_RANDOM` | – | `{"operation": "STORE_RANDOM"}` |
| `STORE_ASCENDING` | – | `{"operation": "STORE_ASCENDING"}` |
| `DESTORE` | `x`, `z` | `{"operation": "DESTORE", "x": 5, "z": 3}` |
| `DESTORE_RANDOM` | – | `{"operation": "DESTORE_RANDOM"}` |
| `DESTORE_ASCENDING` | – | `{"operation": "DESTORE_ASCENDING"}` |
| `DESTORE_OLDEST` | – | `{"operation": "DESTORE_OLDEST"}` |
| `REARRANGE` | `x`, `z`, `x_new`, `z_new` | `{"operation": "REARRANGE", "x": 2, "z": 1, "x_new": 8, "z_new": 4}` |

### 5.2 Statusnachrichten (Modul →)

```json
{
  "status": "<ready|busy|error>"
}
```

| Wert | Bedeutung | LED am HBS |
|---|---|---|
| `ready` | Modul betriebsbereit | 🟢 Grün |
| `busy` | Operation wird ausgeführt | 🟡 Gelb |
| `error` | Fehler aufgetreten | 🔴 Rot |

### 5.3 Ergebnisnachrichten (Modul →)

```json
{
  "operation": "<OPERATIONS_CODE>",
  "x": <nummer>,
  "z": <nummer>,
  "result": "<success|error>",
  "message": "<Klartext-Fehlermeldung>"
}
```

### 5.4 Sensordaten – Eingangsroute (geschätzt)

#### Induktiver Sensor

```json
{
  "sensor_id": 1,
  "type": "inductive",
  "detected": true,
  "timestamp": "2026-03-16T10:30:00Z"
}
```

#### RFID-Sensor

```json
{
  "sensor_id": 1,
  "type": "rfid",
  "tag_id": "ABC123",
  "timestamp": "2026-03-16T10:30:05Z"
}
```

#### Lichtschranke

```json
{
  "sensor_id": 1,
  "type": "light_barrier",
  "interrupted": true,
  "timestamp": "2026-03-16T10:30:10Z"
}
```

> **⚠️ Hinweis:** Die Sensordaten-Formate der Eingangsroute sind geschätzt und
> noch nicht verifiziert.

---

## 6. Fehlerbehandlung und Zustandsübergänge

### 6.1 Zustandsdiagramm des Hochregallagers

```mermaid
stateDiagram-v2
    [*] --> Initialisierung
    Initialisierung --> Bereit: Referenzfahrten abgeschlossen
    Initialisierung --> Fehler: Hardware-Fehler

    Bereit --> Beschäftigt: Befehl empfangen
    Beschäftigt --> Bereit: Operation erfolgreich
    Beschäftigt --> Fehler: Operation fehlgeschlagen

    Fehler --> Initialisierung: Reset / Neustart
    Fehler --> Bereit: Fehler behoben

    Bereit --> [*]: Shutdown-Befehl
```

### 6.2 Typische Fehlerfälle

| Fehler | Ursache | MQTT-Meldung | Reaktion |
|---|---|---|---|
| Platz belegt | Einlagerung an belegten Platz | `{"result": "error", "message": "..."}` | Anderen Platz wählen |
| Platz leer | Auslagerung von leerem Platz | `{"result": "error", "message": "..."}` | Belegung prüfen |
| Lager voll | Alle 50 Plätze belegt | `{"result": "error", "message": "..."}` | Blaue LED leuchtet |
| Not-Aus | Roter Taster gedrückt | `{"status": "error"}` | Manueller Reset nötig |
| MQTT-Verbindung unterbrochen | Netzwerkproblem | Keine Meldung möglich | Automatische Wiederverbindung |

---

## 7. Zeitverhalten

### 7.1 Typische Dauern (geschätzt)

| Operation | Geschätzte Dauer | Beschreibung |
|---|---|---|
| Referenzfahrt (pro Achse) | 5–15 s | Achse fährt zum Endschalter |
| Einlagerung (nah) | 10–20 s | Kurzer Achsenweg |
| Einlagerung (fern) | 20–40 s | Maximaler Achsenweg |
| Auslagerung | 10–40 s | Abhängig von Position |
| Umlagern | 20–60 s | Zwei Fahrten erforderlich |
| Förderband-Transport | 5–30 s | Abhängig von Strecke |

### 7.2 Reihenfolge-Garantien

- **MQTT QoS 0/1:** Nachrichten können (selten) verloren gehen oder doppelt ankommen
- **Sequenziell:** Das Hochregallager verarbeitet Befehle **nacheinander** – ein neuer
  Befehl wird erst nach Abschluss des aktuellen akzeptiert (Status: `busy`)
- **Keine Warteschlange:** Befehle, die während `busy` eintreffen, werden
  typischerweise verworfen → Frontend sollte auf `ready` warten
