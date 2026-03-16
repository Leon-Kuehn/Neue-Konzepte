# ADR-001: Zusammenführung der Quell-Repositories

**Status:** Akzeptiert
**Datum:** 16.03.2026
**Autor:** Projektteam IoT-Logistikmodell, DHBW Lörrach

---

## Kontext

Das IoT-Logistikmodell der DHBW Lörrach besteht aus mehreren Softwarekomponenten, die
ursprünglich in getrennten Git-Repositories entwickelt wurden:

| Repository | Inhalt | Sichtbarkeit |
|---|---|---|
| [`smlaage/DHBW-HBS`](https://github.com/smlaage/DHBW-HBS) | Hochregallager-Steuerung (Python) | Öffentlich |
| [`DHBWLoerrach/iot-logistikmodel`](https://github.com/DHBWLoerrach/iot-logistikmodel) | Eingangsroute-Steuerung und HBS-Integration | Privat |
| Dieses Repository | Web-Frontend (React), Backend (NestJS), Infrastruktur (Docker) | – |

Diese Aufteilung führte zu folgenden Problemen:

1. **Fragmentierte Dokumentation** – Jedes Repository hatte eigene READMEs und
   Anleitungen, aber keine Gesamtdokumentation
2. **Versionsinkompatibilitäten** – Änderungen in einem Repository konnten
   unbemerkt die Kompatibilität mit anderen brechen
3. **Onboarding-Aufwand** – Neue Teammitglieder mussten mehrere Repositories
   klonen und deren Zusammenhänge selbst erschließen
4. **Fehlende Nachvollziehbarkeit** – Die Zuordnung von Code zu Modulen war
   nicht unmittelbar ersichtlich
5. **Zugriffsprobleme** – `DHBWLoerrach/iot-logistikmodel` ist privat; nicht alle
   Beteiligten haben Zugriff

---

## Entscheidung

Die Quellcode-Dateien der physischen Module werden **in dieses Repository kopiert**
und in einer einheitlichen Verzeichnisstruktur unter `website-workspace/` abgelegt.

### Gewählte Struktur

```
website-workspace/
├── highbay-storage/       ← Kopie aus smlaage/DHBW-HBS
│   ├── hbs_main.py
│   ├── hbs_controller.py
│   ├── hbs_operator.py
│   ├── hbs_mqtt_client.py
│   ├── hbs_user_terminal.py
│   ├── hbs_collections.py
│   ├── io_extension.py
│   ├── hbs_messages_de.dat
│   ├── README.md
│   └── ...
├── entry-route/           ← Zielordner für DHBWLoerrach/iot-logistikmodel
│   └── README.md          ← Platzhalter (Quell-Repo war nicht zugänglich)
├── docs/                  ← Umfassende Gesamtdokumentation
│   ├── README.md
│   ├── architecture/
│   ├── integration/
│   ├── operations/
│   └── decisions/
└── ...
```

### Kopiervorgang

| Modul | Quelle | Ziel | Datum | Status |
|---|---|---|---|---|
| Hochregallager | `smlaage/DHBW-HBS` | `website-workspace/highbay-storage/` | 16.03.2026 | ✅ Kopiert |
| Eingangsroute | `DHBWLoerrach/iot-logistikmodel` | `website-workspace/entry-route/` | 16.03.2026 | ❌ Nicht möglich (privates Repo) |

### Wichtige Details

- Der Code wurde **kopiert**, nicht als Git-Submodul eingebunden, da eine
  eigenständige Weiterentwicklung im Mono-Repo geplant ist.
- Die Original-Repositories bleiben als Referenz bestehen und werden nicht gelöscht.
- Die Git-Historie der kopierten Dateien beginnt ab dem Zeitpunkt der Übernahme
  in dieses Repository.

---

## Begründung

### Warum Mono-Repo statt Submodule?

| Kriterium | Mono-Repo (gewählt) | Git-Submodule |
|---|---|---|
| Einfachheit | ✅ Ein `git clone` reicht | ❌ `git submodule update --init` nötig |
| Dokumentation | ✅ Alles an einem Ort | ❌ Über Repos verteilt |
| CI/CD | ✅ Eine Pipeline für alles | ❌ Separate Pipelines |
| Versionierung | ✅ Ein konsistenter Stand | ❌ Submodul-Pinning nötig |
| Zugangsprobleme | ✅ Gelöst (Code ist hier) | ❌ Privates Repo bleibt Problem |
| Eigenständige Weiterentwicklung | ✅ Direkt möglich | ❌ Upstream-Sync nötig |
| Git-Historie der Quellen | ❌ Verloren | ✅ Erhalten |

### Warum umfassende Dokumentation?

Die Dokumentation im Verzeichnis `docs/` ist bewusst so ausführlich gehalten, dass
ein Rückgriff auf die Original-Repositories **nicht mehr notwendig** ist. Dies
adressiert insbesondere das Zugriffsproblem bei `DHBWLoerrach/iot-logistikmodel`.

---

## Konsequenzen

### Positive Konsequenzen

1. **Einheitlicher Einstiegspunkt** – Neues Teammitglieder finden alles in einem
   Repository
2. **Konsistente Dokumentation** – Eine zusammenhängende, deutschsprachige
   Dokumentation deckt alle Module ab
3. **Kein Zugangsproblem** – Der kopierte Code steht allen Beteiligten zur
   Verfügung
4. **Vereinfachtes Deployment** – Eine einzige Codebasis für das gesamte System
5. **Leichteres Refactoring** – Cross-Modul-Änderungen (z. B. MQTT-Topics)
   können in einem Commit durchgeführt werden

### Negative Konsequenzen

1. **Verlorene Git-Historie** – Die Commit-Geschichte der kopierten Dateien geht
   verloren
2. **Kein automatischer Upstream-Sync** – Änderungen in den Original-Repositories
   müssen manuell übernommen werden
3. **Code-Duplikation** – Derselbe Code existiert in zwei Repositories
4. **Eingangsroute fehlt** – Das private Repository konnte nicht kopiert werden;
   die Eingangsroute muss nachträglich ergänzt werden

### Offene Punkte

- [ ] Zugriff auf `DHBWLoerrach/iot-logistikmodel` beantragen
- [ ] Nach Zugriff: Code nach `website-workspace/entry-route/` kopieren
- [ ] Dokumentation der Eingangsroute mit tatsächlichem Code ergänzen
- [ ] Prüfen, ob `high_bay_storage/` im iot-logistikmodel-Repo vom Code in
      `smlaage/DHBW-HBS` abweicht

---

## Referenzen

- **Hochregallager-Quellcode:** [github.com/smlaage/DHBW-HBS](https://github.com/smlaage/DHBW-HBS)
- **Eingangsroute-Quellcode:** [github.com/DHBWLoerrach/iot-logistikmodel](https://github.com/DHBWLoerrach/iot-logistikmodel) (privat)
- **Merge-Datum:** 16. März 2026
- **Architekturübersicht:** [`../architecture/overview.md`](../architecture/overview.md)
- **Hochregallager-Dokumentation:** [`../integration/highbay-storage.md`](../integration/highbay-storage.md)
- **Eingangsroute-Dokumentation:** [`../integration/entry-route.md`](../integration/entry-route.md)
