# Eingangsroute-Modul – Dokumentation

## 1. Übersicht

Das Eingangsroute-Modul (Entry Route) bildet die Materialzuführung im
IoT-Logistikmodell ab. Es transportiert Werkstücke über eine Förderstrecke mit
mehreren Stationen zur Identifikation, Bearbeitung und Weiterleitung an das
Hochregallager.

**Quell-Repository:** [`DHBWLoerrach/iot-logistikmodel`](https://github.com/DHBWLoerrach/iot-logistikmodel)
**Lokaler Pfad:** `website-workspace/entry-route/`

---

## ⚠️ Wichtiger Hinweis

> **Das Quell-Repository `DHBWLoerrach/iot-logistikmodel` ist privat und war zum
> Zeitpunkt der Dokumentation (März 2026) nicht zugänglich.** Die Inhalte konnten
> daher **nicht in dieses Repository kopiert** werden.
>
> Die folgende Dokumentation basiert auf:
> - Den Frontend-Komponenten in `frontend/src/entryRoute/`
> - Der Hotspot-Konfiguration (`hotspots.config.json`)
> - Kontextinformationen aus dem Gesamtprojekt
> - Der erwarteten Repository-Struktur aus der Issue-Beschreibung
>
> **Sobald Zugriff auf das Repository gewährt wird, sollte der Quellcode nach
> `website-workspace/entry-route/` geklont und diese Dokumentation entsprechend
> aktualisiert werden.**

---

## 2. Erwartete Repository-Struktur

Basierend auf der Issue-Beschreibung enthält `DHBWLoerrach/iot-logistikmodel`:

```
iot-logistikmodel/
├── entry_route/          ← Steuerungscode der Eingangsroute
├── high_bay_storage/     ← HBS-Integrationslayer (ggf. abweichend von smlaage/DHBW-HBS)
├── docs/                 ← Originaldokumentation
├── .gitignore
├── README.md
└── requirements.txt
```

> **Hinweis:** Die genaue Dateistruktur innerhalb von `entry_route/` ist unbekannt.
> Es wird erwartet, dass sie ähnlich wie das Hochregallager-Modul aufgebaut ist:
> Hauptskript, Controller, MQTT-Client und Hardware-Abstraktion.

---

## 3. Bekannte Komponenten

Die folgenden Komponenten sind aus der Frontend-Konfiguration
(`frontend/src/entryRoute/hotspots.config.json`) und den Icon-Komponenten bekannt:

### 3.1 Förderbänder (Conveyor Belts)

| Komponente | ID | Beschreibung |
|---|---|---|
| **Förderband 1** | `conveyor-belt-1` | Erstes Transportband der Strecke |
| **Förderband 2** | `conveyor-belt-2` | Zweites Transportband |
| **Förderband 3** | `conveyor-belt-3` | Drittes Transportband |
| **Förderband 4** | `conveyor-belt-4` | Viertes Transportband |
| **Förderband 5** | `conveyor-belt-5` | Fünftes Transportband |

Jedes Förderband wird durch einen eigenen Motor angetrieben und kann unabhängig
gesteuert werden. Die Icon-Komponente `ConveyorBeltIcon.tsx` visualisiert den
Betriebszustand.

### 3.2 Drehförderband (Rotating Conveyor)

| Komponente | ID | Beschreibung |
|---|---|---|
| **Drehförderband 1** | `rotating-conveyor-1` | Drehbares Förderband als Weiche |

Das Drehförderband ermöglicht einen Richtungswechsel in der Förderstrecke. Es kann
Werkstücke in verschiedene Richtungen umleiten. Visualisiert durch
`RotatingConveyorIcon.tsx`.

### 3.3 Induktive Sensoren (Inductive Sensors)

| Komponente | ID | Beschreibung |
|---|---|---|
| **Induktiver Sensor 1** | `inductive-sensor-1` | Metallerkennung an Position 1 |
| **Induktiver Sensor 2** | `inductive-sensor-2` | Metallerkennung an Position 2 |
| **Induktiver Sensor 3** | `inductive-sensor-3` | Metallerkennung an Position 3 |
| **Induktiver Sensor 4** | `inductive-sensor-4` | Metallerkennung an Position 4 |
| **Induktiver Sensor 5** | `inductive-sensor-5` | Metallerkennung an Position 5 |

Induktive Sensoren erkennen metallische Werkstücke berührungslos. Sie dienen der
Positionserkennung und Materialklassifikation entlang der Förderstrecke.

### 3.4 RFID-Sensoren

| Komponente | ID | Beschreibung |
|---|---|---|
| **RFID-Sensor 1** | `rfid-sensor-1` | RFID-Leser an Station 1 |
| **RFID-Sensor 2** | `rfid-sensor-2` | RFID-Leser an Station 2 |
| **RFID-Sensor 3** | `rfid-sensor-3` | RFID-Leser an Station 3 |

RFID-Sensoren identifizieren Werkstücke anhand ihrer RFID-Tags. Dies ermöglicht die
eindeutige Zuordnung und Nachverfolgung jedes Werkstücks im System.

### 3.5 Kugellade-Stationen (Ball Loaders)

| Komponente | ID | Beschreibung |
|---|---|---|
| **Kugellade-Station 1** | `ball-loader-1` | Pneumatische Beladung an Station 1 |
| **Kugellade-Station 2** | `ball-loader-2` | Pneumatische Beladung an Station 2 |
| **Kugellade-Station 3** | `ball-loader-3` | Pneumatische Beladung an Station 3 |

Die Kugellade-Stationen beladen Werkstücke pneumatisch mit Kugeln. Dies simuliert
einen Bearbeitungsschritt in der Logistikkette. Visualisiert durch
`BallLoaderIcon.tsx`.

### 3.6 Lichtschranke (Light Barrier)

| Komponente | ID | Beschreibung |
|---|---|---|
| **Lichtschranke 1** | `light-barrier-1` | Optische Unterbrechungserkennung |

Die Lichtschranke erkennt das Durchlaufen von Werkstücken an einer bestimmten
Position. Sie wird typischerweise zur Zählung oder Positionserkennung eingesetzt.

### 3.7 Eingabestation (Input Station)

| Komponente | ID | Beschreibung |
|---|---|---|
| **Eingabestation 1** | `input-station-1` | Einschleusung neuer Werkstücke |

Die Eingabestation ist der Startpunkt der Förderstrecke. Hier werden neue Werkstücke
in das System eingeschleust.

### 3.8 Hochregallager-Anbindung

| Komponente | ID | Beschreibung |
|---|---|---|
| **Hochregallager** | `high-bay-storage` | Verbindung zum Hochregallager-Modul |

Am Ende der Eingangsroute werden die Werkstücke an das Hochregallager übergeben.
Die Kommunikation erfolgt über MQTT (siehe
[Modulinteraktion](module-interaction.md)).

---

## 4. Erwartete MQTT-Integration

### 4.1 Topic-Konvention (geschätzt)

Basierend auf der Namenskonvention des Hochregallagers (`hochregallager/set`,
`hochregallager/status`, `hochregallager/result`) wird folgendes Topic-Schema
für die Eingangsroute erwartet:

| Topic | Richtung | Beschreibung |
|---|---|---|
| `eingangsroute/set` | Frontend → Eingangsroute | Steuerbefehle |
| `eingangsroute/status` | Eingangsroute → Frontend | Gesamtstatus der Route |
| `eingangsroute/result` | Eingangsroute → Frontend | Operationsergebnisse |

### 4.2 Erwartete Sensordaten-Topics

Für Echtzeit-Sensordaten könnten separate Topics existieren:

| Topic | Beschreibung |
|---|---|
| `eingangsroute/sensor/induktiv/<1-5>` | Zustandsänderungen der induktiven Sensoren |
| `eingangsroute/sensor/rfid/<1-3>` | RFID-Leseergebnisse |
| `eingangsroute/sensor/lichtschranke/1` | Lichtschranken-Ereignisse |
| `eingangsroute/foerderband/<1-5>` | Status der Förderbänder |
| `eingangsroute/drehfoerderband/1` | Status des Drehförderbands |
| `eingangsroute/kugellade/<1-3>` | Status der Kugellade-Stationen |

> **⚠️ Achtung:** Diese Topics sind **geschätzt** und nicht aus dem Quellcode
> verifiziert. Die tatsächlichen Topics können abweichen.

### 4.3 Erwartetes Nachrichtenformat

Analog zum Hochregallager wird JSON als Nachrichtenformat erwartet:

```json
{
  "operation": "<BEFEHL>",
  "parameter1": "<wert>",
  "parameter2": "<wert>"
}
```

### 4.4 MQTT-Broker-Konfiguration

Die Eingangsroute nutzt denselben MQTT-Broker wie das Hochregallager:

| Parameter | Wert |
|---|---|
| Broker-IP | `192.168.178.40` |
| Port | `1883` |
| Benutzername | `dhbw-mqtt` |
| Passwort | `daisy56` |

---

## 5. Frontend-Komponenten

Das Frontend enthält bereits vollständige Visualisierungskomponenten für die
Eingangsroute:

### 5.1 Hauptkomponenten

| Datei | Beschreibung |
|---|---|
| `EntryRouteMap.tsx` | Interaktive SVG-Karte mit Hotspot-Rendering und Zustandsverwaltung (251 Zeilen) |
| `EntryRoutePanel.tsx` | Panel zur Anzeige von Hotspot-Details (61 Zeilen) |
| `mapHotspots.ts` | Hotspot-Konfiguration und Typ-Definitionen (101 Zeilen) |
| `componentBindings.ts` | Zuordnung von Hotspot-IDs zu Komponenten-IDs (33 Zeilen) |
| `hotspots.config.json` | Hotspot-Definitionen mit Positionen und Icons |
| `EntryRouteMap.css` | Styling der Kartenkomponente |

### 5.2 Icon-Komponenten (`icons/`)

| Datei | Visualisiert |
|---|---|
| `ConveyorBeltIcon.tsx` | Förderband |
| `RotatingConveyorIcon.tsx` | Drehförderband |
| `InductiveSensorIcon.tsx` | Induktiver Sensor |
| `RfidSensorIcon.tsx` | RFID-Sensor |
| `BallLoaderIcon.tsx` | Kugellade-Station |
| `LightBarrierIcon.tsx` | Lichtschranke |
| `InputStationIcon.tsx` | Eingabestation |
| `HighBayStorageIcon.tsx` | Hochregallager |
| `LightSensorIcon.tsx` | Lichtsensor |
| `SensorGenericIcon.tsx` | Generischer Sensor (Fallback) |
| `DeviceSquareIcon.tsx` | Generisches Gerät (Fallback) |

---

## 6. Nächste Schritte

1. **Repository-Zugriff beantragen** bei der DHBW Lörrach für
   `DHBWLoerrach/iot-logistikmodel`
2. **Code klonen** nach `website-workspace/entry-route/`:
   ```bash
   cd website-workspace/entry-route/
   git clone https://github.com/DHBWLoerrach/iot-logistikmodel .
   ```
3. **Dokumentation aktualisieren** – Diese Datei mit den tatsächlichen
   Dateistrukturen, Klassen, Funktionen und MQTT-Topics ergänzen
4. **MQTT-Topics verifizieren** – Geschätzte Topics mit den tatsächlich
   implementierten Topics abgleichen
5. **Integration testen** – Zusammenspiel mit dem Hochregallager-Modul
   überprüfen
