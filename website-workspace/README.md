# Website Workspace

Dieser Ordner dient als Oberordner fuer alle Projekte rund um die Website.

## Struktur

- `main-website/` Hauptanwendung (dieses bestehende Projekt)
- `highbay-storage/` Externes Projekt fuer Hochregallager
- `entry-route/` Externes Projekt fuer Entry-Route
- `docs/` Ausfuehrliche Projektdokumentation

## Einbindung externer Repos

Sobald die beiden GitHub-URLs vorliegen, koennen die Repos in die Zielordner geklont werden.

Beispiel:

```bash
git clone <HIGHBAY_REPO_URL> highbay-storage
git clone <ENTRY_ROUTE_REPO_URL> entry-route
```

## Hinweis

Das bestehende laufende Projekt bleibt weiterhin im Root-Ordner `Neue-Konzepte/` erhalten.
Dieser Workspace-Ordner ist eine saubere Struktur fuer die naechsten Integrationsschritte.
