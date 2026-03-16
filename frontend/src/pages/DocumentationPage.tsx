import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useAppPreferences } from "../context/AppPreferencesContext";

type SensorDoc = {
  type: string;
  purpose: string;
  signals: string;
  troubleshooting: string;
};

type DocsContent = {
  title: string;
  intro: string;
  quickStartTitle: string;
  quickStart: string[];
  navigationTitle: string;
  navigation: string[];
  mqttTitle: string;
  mqtt: string[];
  sensorTitle: string;
  sensorHeaderType: string;
  sensorHeaderPurpose: string;
  sensorHeaderSignals: string;
  sensorHeaderTroubleshooting: string;
  sensors: SensorDoc[];
  highBayTitle: string;
  highBay: string[];
  troubleshootingTitle: string;
  troubleshooting: string[];
  bestPracticesTitle: string;
  bestPractices: string[];
};

const docsByLanguage: Record<"de" | "en" | "fr", DocsContent> = {
  de: {
    title: "System-Dokumentation",
    intro:
      "Diese Seite erklaert Sensorik, Navigation und den optimalen Bedienablauf fuer den taeglichen Betrieb.",
    quickStartTitle: "Schnellstart (2 Minuten)",
    quickStart: [
      "In Einstellungen den MQTT-Broker eintragen und verbinden.",
      "In Top-Down-Ansicht den Live-Status pruefen (Online/Offline, ON/OFF).",
      "Komponentenbrowser nutzen, um schnell Details zu einer Komponente zu sehen.",
      "Im Hochregallager Slot anklicken, Inhalt pruefen und Analysekarte auswerten.",
    ],
    navigationTitle: "Navigation und Bedienkonzept",
    navigation: [
      "Top-Down-Ansicht: Live-Status aller relevanten Stationen auf der Strecke.",
      "Hochregallager: Slot-fuer-Slot-Ansicht mit Lagerinhalt und wirtschaftlicher Bewertung.",
      "Komponentenbrowser: Strukturierte Liste nach Kategorien mit schneller Detailsuche.",
      "Einstellungen: Theme, Sprache und MQTT-Verbindungsparameter.",
      "Dokumentation: Bedienhilfe, Sensorerklaerungen und Troubleshooting.",
    ],
    mqttTitle: "MQTT-Verbindung richtig einrichten",
    mqtt: [
      "Host und Port auf den erreichbaren Broker setzen (z. B. raspberrypi.local:1883).",
      "TLS nur aktivieren, wenn dein Broker auch wirklich TLS anbietet (typisch Port 8883).",
      "Nach Connect wird die Verbindung gespeichert und bei erneutem Aufruf wiederverwendet.",
      "Wenn keine Live-Daten kommen, zuerst Broker erreichbar? Dann Topics und Rechte pruefen.",
    ],
    sensorTitle: "Sensoren und Komponenten: Bedeutung",
    sensorHeaderType: "Typ",
    sensorHeaderPurpose: "Aufgabe",
    sensorHeaderSignals: "Typische Signale",
    sensorHeaderTroubleshooting: "Fehlersuche",
    sensors: [
      {
        type: "Induktivsensor",
        purpose: "Erkennung metallischer Werkstuecke ohne Beruehrung.",
        signals: "Digital ON/OFF, meist 24V Schaltsignal.",
        troubleshooting:
          "Abstand pruefen, Sensorflaeche reinigen, Versorgungsspannung und Stecker kontrollieren.",
      },
      {
        type: "Lichtsensor / Lichtschranke",
        purpose: "Objekterkennung ueber Lichtstrahl oder Reflexion.",
        signals: "Digital ON/OFF oder analoger Intensitaetswert.",
        troubleshooting:
          "Optik reinigen, Ausrichtung Sender/Empfaenger pruefen, Fremdlichtquellen minimieren.",
      },
      {
        type: "RFID-Sensor",
        purpose: "Identifikation von Werkstuecken/Traegern per Tag-ID.",
        signals: "Gelesene ID, Statuscode, Kommunikationszustand.",
        troubleshooting:
          "Tag-Position und Abstand pruefen, Abschirmung durch Metall beachten, Bus-Kommunikation testen.",
      },
      {
        type: "Foerderband-Segment",
        purpose: "Materialtransport zwischen Stationen.",
        signals: "Status ON/OFF, Zykluszaehler, Laufzeit.",
        troubleshooting:
          "Motoransteuerung, Blockaden, Endschalter und Not-Aus-Kette pruefen.",
      },
      {
        type: "Pneumatik-/Aktoreinheit",
        purpose: "Mechanische Bewegung, Trennen, Positionieren oder Pressen.",
        signals: "Ventilstatus, Endlagen, ggf. Druckwerte.",
        troubleshooting:
          "Druckluftversorgung, Magnetventile, Dichtheit und Endlagensensoren kontrollieren.",
      },
    ],
    highBayTitle: "Hochregallager und wirtschaftliche Analyse",
    highBay: [
      "Jeder Slot ist klickbar: Artikel, Menge, Kosten, Preis und Nachfrage direkt einsehbar.",
      "Lagerwert zeigt die aktuell gebundene Kapitalmenge im Lager.",
      "Monatlicher Rohertrag zeigt, welche Teile wirtschaftlich tragen.",
      "Lagerhueter und Langsamdreher helfen bei Abverkauf, Sortimentsbereinigung oder Ersatzteilstrategie.",
    ],
    troubleshootingTitle: "Typische Probleme und Loesungen",
    troubleshooting: [
      "Komponente offline: Netzwerk, Broker, Topic-Berechtigungen und Stromversorgung pruefen.",
      "Status springt nicht: Richtigen Status-Topic und Payload-Format (JSON) kontrollieren.",
      "Leere Karten/Ansichten: Browser-Cache neu laden, MQTT-Verbindung trennen/neu verbinden.",
      "Falsche Sprache/Theme: In Einstellungen neu waehlen, Speicherung erfolgt automatisch im Browser.",
    ],
    bestPracticesTitle: "Empfohlene Betriebsregeln",
    bestPractices: [
      "MQTT-Topics klar strukturieren: anlage/komponente/status und anlage/komponente/cmd.",
      "Komponenten-ID konsistent halten zwischen SPS/Edge-Geraet und Weboberflaeche.",
      "Lagerdaten mindestens taeglich abgleichen, damit Analysewerte belastbar bleiben.",
      "Bei Produktivbetrieb Dead-Stock-Regeln mit Einkauf/Produktion gemeinsam definieren.",
    ],
  },
  en: {
    title: "System Documentation",
    intro:
      "This page explains sensors, navigation, and the recommended operating flow for daily use.",
    quickStartTitle: "Quick Start (2 minutes)",
    quickStart: [
      "Open Settings, configure the MQTT broker, and connect.",
      "Use Top-Down View to verify live states (Online/Offline, ON/OFF).",
      "Open Component Browser to inspect component details quickly.",
      "In High-Bay Warehouse, click slots to inspect stock and business metrics.",
    ],
    navigationTitle: "Navigation and Usage Concept",
    navigation: [
      "Top-Down View: Live states of the main stations on the line.",
      "High-Bay Warehouse: Slot-level view with inventory and economic indicators.",
      "Component Browser: Category-based list for fast component lookup.",
      "Settings: Theme, language, and MQTT connection parameters.",
      "Documentation: User guide, sensor explanations, and troubleshooting.",
    ],
    mqttTitle: "How to Set Up MQTT Correctly",
    mqtt: [
      "Set host and port to a reachable broker (for example raspberrypi.local:1883).",
      "Enable TLS only if your broker actually provides TLS (commonly port 8883).",
      "After connect, settings are stored and reused automatically.",
      "If no live data arrives, first verify broker reachability, then topics and access rights.",
    ],
    sensorTitle: "Sensors and Components: Meaning",
    sensorHeaderType: "Type",
    sensorHeaderPurpose: "Purpose",
    sensorHeaderSignals: "Typical Signals",
    sensorHeaderTroubleshooting: "Troubleshooting",
    sensors: [
      {
        type: "Inductive Sensor",
        purpose: "Detects metallic workpieces without contact.",
        signals: "Digital ON/OFF, typically 24V switching signal.",
        troubleshooting:
          "Check distance, clean sensor face, verify supply voltage and connectors.",
      },
      {
        type: "Light Sensor / Light Barrier",
        purpose: "Object detection via beam interruption or reflection.",
        signals: "Digital ON/OFF or analog intensity values.",
        troubleshooting:
          "Clean optics, align emitter/receiver, reduce external light interference.",
      },
      {
        type: "RFID Sensor",
        purpose: "Identifies carriers/workpieces via tag IDs.",
        signals: "Read ID, status code, communication status.",
        troubleshooting:
          "Check tag position and distance, consider metal shielding, test bus communication.",
      },
      {
        type: "Conveyor Segment",
        purpose: "Moves material between stations.",
        signals: "ON/OFF state, cycle counters, uptime.",
        troubleshooting:
          "Verify motor control, jams, limit switches, and emergency-stop chain.",
      },
      {
        type: "Pneumatic / Actuator Unit",
        purpose: "Mechanical movement, separation, positioning, or pressing.",
        signals: "Valve status, end positions, optional pressure values.",
        troubleshooting:
          "Check compressed-air supply, solenoid valves, leakage, and end-position sensors.",
      },
    ],
    highBayTitle: "High-Bay Warehouse and Economic Analytics",
    highBay: [
      "Each slot is clickable: item, quantity, costs, price, and demand are visible immediately.",
      "Inventory value shows current capital tied up in stock.",
      "Monthly gross profit highlights components that generate economic value.",
      "Dead stock and slow movers support sell-off, portfolio cleanup, and spare-part strategy.",
    ],
    troubleshootingTitle: "Common Issues and Fixes",
    troubleshooting: [
      "Component offline: Check network, broker, topic permissions, and power supply.",
      "State does not update: Verify status topic and payload format (JSON).",
      "Empty views/cards: Reload browser cache and reconnect MQTT.",
      "Wrong language/theme: Re-select in Settings; values are auto-saved in browser storage.",
    ],
    bestPracticesTitle: "Recommended Operating Rules",
    bestPractices: [
      "Use a clear MQTT topic structure: plant/component/status and plant/component/cmd.",
      "Keep component IDs consistent across PLC/edge device and web UI.",
      "Synchronize warehouse data at least daily to keep analytics reliable.",
      "Define dead-stock policies jointly with purchasing and production teams.",
    ],
  },
  fr: {
    title: "Documentation systeme",
    intro:
      "Cette page explique les capteurs, la navigation et le flux d'utilisation recommande pour l'exploitation quotidienne.",
    quickStartTitle: "Demarrage rapide (2 minutes)",
    quickStart: [
      "Dans Parametres, configurez le broker MQTT puis connectez-vous.",
      "Utilisez la vue de dessus pour verifier les etats en direct (En ligne/Hors ligne, ON/OFF).",
      "Utilisez le navigateur de composants pour ouvrir rapidement les details.",
      "Dans l'entrepot grande hauteur, cliquez sur les emplacements pour voir le stock et les indicateurs economiques.",
    ],
    navigationTitle: "Navigation et logique d'utilisation",
    navigation: [
      "Vue de dessus : etat en direct des stations principales.",
      "Entrepot grande hauteur : vue par emplacement avec stock et indicateurs economiques.",
      "Navigateur de composants : liste par categorie pour retrouver rapidement un composant.",
      "Parametres : theme, langue et configuration MQTT.",
      "Documentation : guide d'utilisation, capteurs et depannage.",
    ],
    mqttTitle: "Configurer MQTT correctement",
    mqtt: [
      "Renseignez un host et un port accessibles (par exemple raspberrypi.local:1883).",
      "Activez TLS uniquement si votre broker le supporte (souvent port 8883).",
      "Apres connexion, les reglages sont sauvegardes et reutilises automatiquement.",
      "Si aucune donnee n'arrive, verifiez d'abord l'accessibilite du broker, puis les topics et droits.",
    ],
    sensorTitle: "Capteurs et composants : signification",
    sensorHeaderType: "Type",
    sensorHeaderPurpose: "Fonction",
    sensorHeaderSignals: "Signaux typiques",
    sensorHeaderTroubleshooting: "Depannage",
    sensors: [
      {
        type: "Capteur inductif",
        purpose: "Detection sans contact de pieces metalliques.",
        signals: "Signal numerique ON/OFF, souvent 24V.",
        troubleshooting:
          "Verifier la distance, nettoyer la face capteur, controler tension d'alimentation et connecteurs.",
      },
      {
        type: "Capteur lumineux / barriere optique",
        purpose: "Detection d'objet par interruption de faisceau ou reflexion.",
        signals: "Signal numerique ON/OFF ou intensite analogique.",
        troubleshooting:
          "Nettoyer l'optique, aligner emetteur/recepteur, limiter la lumiere parasite.",
      },
      {
        type: "Capteur RFID",
        purpose: "Identification de pieces/porteurs par ID de tag.",
        signals: "ID lu, code statut, etat de communication.",
        troubleshooting:
          "Verifier position et distance du tag, tenir compte des ecrans metalliques, tester le bus.",
      },
      {
        type: "Segment convoyeur",
        purpose: "Transport de matiere entre stations.",
        signals: "Etat ON/OFF, compteur de cycles, temps de marche.",
        troubleshooting:
          "Verifier commande moteur, blocages, fins de course et chaine d'arret d'urgence.",
      },
      {
        type: "Unite pneumatique / actionneur",
        purpose: "Mouvement mecanique, separation, positionnement ou pressage.",
        signals: "Etat des vannes, positions de fin de course, eventuellement pression.",
        troubleshooting:
          "Verifier alimentation en air comprime, electrovanne, etancheite et capteurs de fin de course.",
      },
    ],
    highBayTitle: "Entrepot grande hauteur et analyse economique",
    highBay: [
      "Chaque emplacement est cliquable : article, quantite, cout, prix et demande visibles immediatement.",
      "La valeur de stock montre le capital immobilise actuellement.",
      "La marge brute mensuelle met en evidence les composants performants.",
      "Stock mort et rotation lente aident au declassement et au nettoyage du portefeuille.",
    ],
    troubleshootingTitle: "Problemes frequents et solutions",
    troubleshooting: [
      "Composant hors ligne : verifier reseau, broker, droits des topics et alimentation.",
      "Statut non mis a jour : verifier topic de statut et format payload (JSON).",
      "Vues vides : recharger le cache navigateur puis reconnecter MQTT.",
      "Langue/theme incorrects : reselectionner dans Parametres (sauvegarde automatique).",
    ],
    bestPracticesTitle: "Bonnes pratiques d'exploitation",
    bestPractices: [
      "Structurer clairement les topics MQTT : plant/component/status et plant/component/cmd.",
      "Conserver des IDs composants coherents entre PLC/edge et interface web.",
      "Synchroniser les donnees de stock au minimum chaque jour.",
      "Definir les regles de stock mort avec achats et production.",
    ],
  },
};

export default function DocumentationPage() {
  const { language } = useAppPreferences();
  const docs = docsByLanguage[language];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" fontWeight={700}>
        {docs.title}
      </Typography>

      <Alert severity="info">{docs.intro}</Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {docs.quickStartTitle}
          </Typography>
          <List dense disablePadding>
            {docs.quickStart.map((item) => (
              <ListItem key={item} disableGutters>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" }, gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              {docs.navigationTitle}
            </Typography>
            <List dense disablePadding>
              {docs.navigation.map((item) => (
                <ListItem key={item} disableGutters>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              {docs.mqttTitle}
            </Typography>
            <List dense disablePadding>
              {docs.mqtt.map((item) => (
                <ListItem key={item} disableGutters>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {docs.sensorTitle}
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{docs.sensorHeaderType}</TableCell>
                  <TableCell>{docs.sensorHeaderPurpose}</TableCell>
                  <TableCell>{docs.sensorHeaderSignals}</TableCell>
                  <TableCell>{docs.sensorHeaderTroubleshooting}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {docs.sensors.map((sensor) => (
                  <TableRow key={sensor.type}>
                    <TableCell sx={{ fontWeight: 600 }}>{sensor.type}</TableCell>
                    <TableCell>{sensor.purpose}</TableCell>
                    <TableCell>{sensor.signals}</TableCell>
                    <TableCell>{sensor.troubleshooting}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {docs.highBayTitle}
          </Typography>
          <List dense disablePadding>
            {docs.highBay.map((item) => (
              <ListItem key={item} disableGutters>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" }, gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              {docs.troubleshootingTitle}
            </Typography>
            <List dense disablePadding>
              {docs.troubleshooting.map((item) => (
                <ListItem key={item} disableGutters>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              {docs.bestPracticesTitle}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap" }}>
              <Chip label="MQTT" size="small" variant="outlined" />
              <Chip label="Top-Down" size="small" variant="outlined" />
              <Chip label="Warehouse" size="small" variant="outlined" />
              <Chip label="Analytics" size="small" variant="outlined" />
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <List dense disablePadding>
              {docs.bestPractices.map((item) => (
                <ListItem key={item} disableGutters>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
