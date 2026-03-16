# Projektdokumentation – IoT-Logistikmodell

Dieses Verzeichnis enthält die vollständige, deutschsprachige Dokumentation des
IoT-Logistikmodells der DHBW Lörrach. Das Modell kombiniert zwei physische Module –
ein **Hochregallager** (High-Bay Storage) und eine **Eingangsroute** (Entry Route) –
zu einem durchgängigen Logistik-Demonstrator auf Basis von Fischertechnik-Komponenten,
Raspberry Pi und MQTT.

---

## Dokumentenübersicht

| Dokument | Pfad | Beschreibung |
|---|---|---|
| **Architekturübersicht** | [`architecture/overview.md`](architecture/overview.md) | Gesamtarchitektur, Komponenten, Kommunikationsfluss, Hardware-Basis, Komponentendiagramm (Mermaid) |
| **Hochregallager-Modul** | [`integration/highbay-storage.md`](integration/highbay-storage.md) | Vollständige Dokumentation aller Python-Dateien, Klassen, Funktionen, MQTT-Topics, Nachrichtenformate und Abhängigkeiten |
| **Eingangsroute-Modul** | [`integration/entry-route.md`](integration/entry-route.md) | Dokumentation der Eingangsroute – bekannte Komponenten, erwartete MQTT-Integration, Hinweis auf nicht-zugängliches Quell-Repository |
| **Modulinteraktion** | [`integration/module-interaction.md`](integration/module-interaction.md) | Zusammenspiel von Hochregallager und Eingangsroute, gemeinsame MQTT-Topics, Sequenzdiagramm (Mermaid), Datenformate |
| **Quickstart-Anleitung** | [`operations/quickstart.md`](operations/quickstart.md) | Schritt-für-Schritt-Einrichtung: Voraussetzungen, Installation, Konfiguration, Startbefehle, häufige Fehler |
| **ADR: Repository-Zusammenführung** | [`decisions/repo-merge.md`](decisions/repo-merge.md) | Architecture Decision Record zur Zusammenführung der Quell-Repositories in dieses Mono-Repo |

---

## Verzeichnisstruktur

```
docs/
├── README.md                          ← diese Datei (Master-Index)
├── architecture/
│   └── overview.md                    ← Gesamtarchitektur
├── integration/
│   ├── highbay-storage.md             ← Hochregallager-Modul
│   ├── entry-route.md                 ← Eingangsroute-Modul
│   └── module-interaction.md          ← Modulinteraktion
├── operations/
│   └── quickstart.md                  ← Schnellstart-Anleitung
└── decisions/
    └── repo-merge.md                  ← ADR: Repo-Zusammenführung
```

---

## Schnelleinstieg

1. **Architektur verstehen** → [`architecture/overview.md`](architecture/overview.md)
2. **Module im Detail** → [`integration/highbay-storage.md`](integration/highbay-storage.md) und [`integration/entry-route.md`](integration/entry-route.md)
3. **System aufsetzen** → [`operations/quickstart.md`](operations/quickstart.md)
4. **Entscheidungshintergründe** → [`decisions/repo-merge.md`](decisions/repo-merge.md)

---

## Hinweise

- Alle Dokumente sind auf **Deutsch** verfasst und so ausführlich gehalten, dass ein
  Rückgriff auf die Original-Repositories nicht mehr notwendig ist.
- Mermaid-Diagramme können direkt in GitHub, GitLab oder kompatiblen Markdown-Viewern
  gerendert werden.
- Bei Fragen oder Ergänzungswünschen bitte ein Issue im Repository anlegen.
