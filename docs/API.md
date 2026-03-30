# Backend REST-API Referenz

## Allgemeines

- Alle Endpunkte haben das globale Prafix `/api`.
- Das Backend lauft standardmassig auf Port `3000`.
- Vollstandige Basis-URL: `http://<host>:3000/api`
- Authentifizierung: keine (derzeit kein JWT oder andere Auth-Mechanismen implementiert)
- CORS: konfiguriert uber die Umgebungsvariable `CORS_ORIGIN`

## Gesundheitsstatus

### `GET /api/health`

Gibt den Betriebsstatus des Backends zuruck.

**Antwort:**
```json
{ "status": "ok" }
```

---

## Sensordaten (`/api/sensor-data`)

### `GET /api/sensor-data`

Gibt eine Liste von Sensordatensatzen zuruck.

**Query-Parameter:**

| Parameter     | Typ    | Pflicht | Beschreibung |
|---------------|--------|---------|-------------|
| `componentId` | string | nein    | Filtert nach Komponenten-ID |
| `topic`       | string | nein    | Filtert nach MQTT-Topic |
| `limit`       | int    | nein    | Max. Anzahl Ergebnisse (Standard: 100, Max: 1000) |
| `offset`      | int    | nein    | Uberspringt N Datensatze (fur Paginierung) |

**Antwort:** Array von `SensorDataEntry`-Objekten.

---

### `GET /api/sensor-data/latest`

Gibt den aktuellsten Eintrag pro `componentId` zuruck.

**Antwort:** Array der neuesten Datensatze je Komponente.

---

### `GET /api/sensor-data/range`

Gibt Datensatze in einem Zeitbereich zuruck (aufsteigend sortiert).

**Query-Parameter:**

| Parameter | Typ            | Pflicht | Beschreibung |
|-----------|----------------|---------|-------------|
| `from`    | ISO-Timestamp  | ja      | Beginn des Zeitbereichs |
| `to`      | ISO-Timestamp  | ja      | Ende des Zeitbereichs |

---

### `GET /api/sensor-data/stats/:componentId`

Gibt statistische Auswertungen fur eine Komponente zuruck.

**Pfad-Parameter:**

| Parameter     | Beschreibung |
|---------------|-------------|
| `componentId` | ID der Anlagekomponente |

**Antwort:** Anzahl der Eintrafe, erster und letzter Zeitstempel, optionale numerische Statistiken.

---

### `GET /api/sensor-data/activity/:componentId`

Gibt die Aktivitatsauswertung fur eine Komponente in Zeitintervallen zuruck.

**Pfad-Parameter:**

| Parameter     | Beschreibung |
|---------------|-------------|
| `componentId` | ID der Anlagekomponente |

**Query-Parameter:**

| Parameter  | Typ                | Pflicht | Beschreibung |
|------------|--------------------|---------|-------------|
| `interval` | `minute` oder `hour` | ja    | Aggregationsintervall |

---

### `GET /api/sensor-data/:componentId`

Gibt Datensatze fur eine bestimmte Komponente zuruck.

**Pfad-Parameter:**

| Parameter     | Beschreibung |
|---------------|-------------|
| `componentId` | ID der Anlagekomponente |

**Query-Parameter:**

| Parameter | Typ           | Pflicht | Beschreibung |
|-----------|---------------|---------|-------------|
| `limit`   | int           | nein    | Max. Anzahl Ergebnisse |
| `since`   | ISO-Timestamp | nein    | Nur Datensatze ab diesem Zeitpunkt |

---

### `POST /api/sensor-data/ingest`

Nimmt einen Sensordatensatz direkt entgegen (Alternativpfad zum MQTT-Ingest, z.B. fur Simulatoren).

**Request-Body (JSON):**

```json
{
  "topic": "plant/conveyor-1/status",
  "payload": { "status": "on" },
  "componentId": "conveyor-1",
  "receivedAt": "2025-01-01T12:00:00.000Z"
}
```

| Feld          | Typ    | Pflicht | Beschreibung |
|---------------|--------|---------|-------------|
| `topic`       | string | ja      | MQTT-Topic |
| `payload`     | any    | nein    | Nachrichteninhalt |
| `componentId` | string | nein    | Komponenten-ID (wird aus Topic abgeleitet, falls nicht angegeben) |
| `receivedAt`  | string | nein    | ISO-Timestamp (Standard: aktuelle Zeit) |

---

## Simulationskonfigurationen (`/api/simulations`)

### `GET /api/simulations`

Gibt alle gespeicherten Simulationskonfigurationen zuruck.

---

### `GET /api/simulations/:id`

Gibt eine einzelne Simulationskonfiguration zuruck.

---

### `POST /api/simulations`

Erstellt eine neue Simulationskonfiguration.

**Request-Body (JSON):**

```json
{
  "id": "meine-simulation",
  "name": "Testlauf 1",
  "description": "Optionale Beschreibung",
  "repeat": 3,
  "steps": []
}
```

| Feld          | Typ    | Pflicht | Beschreibung |
|---------------|--------|---------|-------------|
| `id`          | string | ja      | Eindeutige ID |
| `name`        | string | ja      | Anzeigename |
| `description` | string | nein    | Beschreibung |
| `repeat`      | int    | nein    | Wiederholungen |
| `steps`       | array  | nein    | Simulationsschritte |

---

### `PUT /api/simulations/:id`

Aktualisiert eine Simulationskonfiguration.

---

### `DELETE /api/simulations/:id`

Loscht eine Simulationskonfiguration.

---

## Warehouse-Simulator (`/api/warehouse-simulator`)

Der Warehouse-Simulator emuliert Lageroperationen und schreibt synthetische Sensordaten in die Datenbank.

### `GET /api/warehouse-simulator/status`

Gibt den aktuellen Status des Simulators zuruck (lauft/gestoppt, Intervall, Statistiken).

---

### `GET /api/warehouse-simulator/logs`

Gibt die letzten Simulatorereignisse zuruck.

**Query-Parameter:**

| Parameter | Typ | Pflicht | Beschreibung |
|-----------|-----|---------|-------------|
| `limit`   | int | nein    | Max. Anzahl Eintrafe (Standard: 30, Max: 200) |

---

### `POST /api/warehouse-simulator/start`

Startet den Simulator.

**Request-Body (JSON, optional):**

```json
{ "intervalMs": 4000 }
```

| Feld         | Typ | Pflicht | Beschreibung |
|--------------|-----|---------|-------------|
| `intervalMs` | int | nein    | Tick-Intervall in Millisekunden (Standard: 4000, Min: 1000, Max: 60000) |

---

### `POST /api/warehouse-simulator/stop`

Stoppt den Simulator.

---

### `POST /api/warehouse-simulator/tick`

Fuhrt einen einzelnen Simulator-Schritt manuell aus.

---

## Ollama-Integration (`/api/ollama`)

Das Backend proxiert Anfragen an einen lokal laufenden Ollama-LLM-Dienst. Dieser Dienst ist standardmassig deaktiviert (Docker-Image zu gro).

### `GET /api/ollama/health`

Pruft, ob der Ollama-Dienst erreichbar ist.

---

### `POST /api/ollama/chat`

Sendet eine Chat-Nachricht an das konfigurierte Sprachmodell.

**Request-Body (JSON):**

```json
{
  "model": "qwen2.5:0.5b",
  "stream": false,
  "messages": [
    { "role": "user", "content": "Wie viele Pakete wurden heute verarbeitet?" }
  ]
}
```

---

## Antwortformat SensorDataEntry

```json
{
  "id": 42,
  "componentId": "conveyor-1",
  "topic": "plant/conveyor-1/status",
  "payload": { "status": "on" },
  "receivedAt": "2025-01-01T12:00:00.000Z"
}
```
