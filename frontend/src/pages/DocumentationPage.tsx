import {
  Alert,
  Box,
  Button,
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
import "../entryRoute/EntryRouteMap.css";
import { BallLoaderIcon } from "../entryRoute/icons/BallLoaderIcon";
import { ConveyorBeltIcon } from "../entryRoute/icons/ConveyorBeltIcon";
import { DeviceSquareIcon } from "../entryRoute/icons/DeviceSquareIcon";
import { HighBayStorageIcon } from "../entryRoute/icons/HighBayStorageIcon";
import { InductiveSensorIcon } from "../entryRoute/icons/InductiveSensorIcon";
import { InputStationIcon } from "../entryRoute/icons/InputStationIcon";
import { LightBarrierIcon } from "../entryRoute/icons/LightBarrierIcon";
import { DepositPlaceIcon } from "../entryRoute/icons/DepositPlaceIcon";
import { PusherIcon } from "../entryRoute/icons/PusherIcon";
import { RfidSensorIcon } from "../entryRoute/icons/RfidSensorIcon";
import { RotatingConveyorIcon } from "../entryRoute/icons/RotatingConveyorIcon";
import { useAppPreferences } from "../context/AppPreferencesContext";

type AppLang = "de" | "en" | "fr";

type SensorDoc = {
  type: string;
  purpose: string;
  signals: string;
  troubleshooting: string;
};

type ComponentBrief = {
  key: string;
  category: string;
  role: "sensor" | "actuator";
  count: number;
  iconId:
    | "input-station"
    | "conveyor-belt"
    | "rotating-conveyor"
    | "ball-loader"
    | "inductive-sensor"
    | "rfid-sensor"
    | "lightbarrier-sensor"
    | "device-square"
    | "highbay-storage"
    | "pusher"
    | "deposit-place";
  direction?: "left" | "right";
  animated?: boolean;
  moduleSheets?: string[];
  labels: Record<AppLang, string>;
  summaries: Record<AppLang, string>;
  signals: Record<AppLang, string>;
};

const componentSectionText: Record<
  AppLang,
  {
    title: string;
    intro: string;
    roleSensor: string;
    roleActuator: string;
    countLabel: string;
    categoryLabel: string;
    signalsLabel: string;
    datasheetButton: string;
  }
> = {
  de: {
    title: "Einzelkomponenten: Kurzfassung",
    intro:
      "Alle in der App verwendeten Komponententypen mit Kurzbeschreibung und animierter Vorschau.",
    roleSensor: "Sensor",
    roleActuator: "Aktor",
    countLabel: "Anzahl",
    categoryLabel: "Kategorie",
    signalsLabel: "Typische Signale",
    datasheetButton: "Datenblatt",
  },
  en: {
    title: "Individual Components: Quick Reference",
    intro:
      "All component types used in the app, with short descriptions and animated previews.",
    roleSensor: "Sensor",
    roleActuator: "Actuator",
    countLabel: "Count",
    categoryLabel: "Category",
    signalsLabel: "Typical Signals",
    datasheetButton: "Datasheet",
  },
  fr: {
    title: "Composants Individuels : Resume",
    intro:
      "Tous les types de composants utilises dans l'application avec resume et apercu anime.",
    roleSensor: "Capteur",
    roleActuator: "Actionneur",
    countLabel: "Quantite",
    categoryLabel: "Categorie",
    signalsLabel: "Signaux typiques",
    datasheetButton: "Fiche",
  },
};

const allDatasheets = {
  standard: [
    "221001_data.pdf", "221002_data.pdf", "221011_data.pdf", "221012_data.pdf",
    "221018_data.pdf", "221022_data.pdf", "221024_data.pdf", "221026_data.pdf",
    "221029_data.pdf", "221032_data.pdf",
  ],
  kombi: [
    "224001_data.pdf", "224002_data.pdf", "224003_data.pdf", "224004_data.pdf",
    "224005_data.pdf", "224006_data.pdf", "224007_data.pdf",
  ],
  kompakt: [
    "226001_data.pdf", "226003_data.pdf", "226005_data.pdf", "226006_data.pdf",
  ],
};

const datasheetSectionText: Record<AppLang, { title: string; standard: string; kombi: string; kompakt: string }> = {
  de: { title: "Datenblätter", standard: "Standardmodule (221xxx)", kombi: "Kombinationsmodule (224xxx)", kompakt: "Kompaktmodule (226xxx)" },
  en: { title: "Datasheets", standard: "Standard Modules (221xxx)", kombi: "Combination Modules (224xxx)", kompakt: "Compact Modules (226xxx)" },
  fr: { title: "Fiches techniques", standard: "Modules standard (221xxx)", kombi: "Modules combinés (224xxx)", kompakt: "Modules compacts (226xxx)" },
};

const componentBriefs: ComponentBrief[] = [
  {
    key: "input",
    category: "input",
    role: "sensor",
    count: 1,
    iconId: "input-station",
    animated: true,
    moduleSheets: ["224001_data.pdf"],
    labels: {
      de: "Input-Station",
      en: "Input Station",
      fr: "Station d'entree",
    },
    summaries: {
      de: "Startpunkt des Materialflusses mit Erfassung der ankommenden Werkstuecke.",
      en: "Start point of the material flow with incoming workpiece detection.",
      fr: "Point de depart du flux materiel avec detection des pieces entrantes.",
    },
    signals: {
      de: "Startfreigabe, Werkstueck erkannt, Stationsstatus",
      en: "Start enable, workpiece detected, station status",
      fr: "Autorisation de depart, piece detectee, statut station",
    },
  },
  {
    key: "conveyor",
    category: "conveyor",
    role: "actuator",
    count: 14,
    iconId: "conveyor-belt",
    direction: "left",
    animated: true,
    moduleSheets: ["221001_data.pdf"],
    labels: {
      de: "Foerderband",
      en: "Conveyor Belt",
      fr: "Convoyeur",
    },
    summaries: {
      de: "Linearer Transport zwischen Stationen mit taktgenauer Materialweitergabe.",
      en: "Linear transport between stations with cycle-accurate material handover.",
      fr: "Transport lineaire entre stations avec transfert cadence du materiel.",
    },
    signals: {
      de: "Motor ON/OFF, Taktzaehler, Laufzeit",
      en: "Motor ON/OFF, cycle counter, runtime",
      fr: "Moteur ON/OFF, compteur de cycles, temps de marche",
    },
  },
  {
    key: "rotating-conveyor",
    category: "rotating-conveyor",
    role: "actuator",
    count: 3,
    iconId: "rotating-conveyor",
    direction: "right",
    animated: true,
    moduleSheets: ["221018_data.pdf"],
    labels: {
      de: "Drehfoerderband",
      en: "Rotating Conveyor",
      fr: "Convoyeur rotatif",
    },
    summaries: {
      de: "Richtet den Materialfluss um und verteilt Werkstuecke auf verschiedene Strecken.",
      en: "Redirects material flow and distributes workpieces to different paths.",
      fr: "Redirige le flux materiel et distribue les pieces sur plusieurs voies.",
    },
    signals: {
      de: "Drehrichtung, Endlage, Betriebsstatus",
      en: "Rotation direction, end position, operation state",
      fr: "Sens de rotation, position finale, etat de service",
    },
  },
  {
    key: "pneumatic-unit",
    category: "pneumatic-unit",
    role: "actuator",
    count: 5,
    iconId: "ball-loader",
    animated: true,
    moduleSheets: ["224005_data.pdf"],
    labels: {
      de: "Pneumatik-Einheit",
      en: "Pneumatic Unit",
      fr: "Unite pneumatique",
    },
    summaries: {
      de: "Fuehrt mechanische Hub-, Trenn- oder Positionierbewegungen aus.",
      en: "Performs mechanical lifting, separating, or positioning movements.",
      fr: "Execute des mouvements mecaniques de levage, separation ou positionnement.",
    },
    signals: {
      de: "Ventilstatus, Endlage, Druckzustand",
      en: "Valve state, end position, pressure state",
      fr: "Etat vanne, position finale, etat de pression",
    },
  },
  {
    key: "press",
    category: "press",
    role: "actuator",
    count: 3,
    iconId: "pusher",
    moduleSheets: ["221029_data.pdf", "224002_data.pdf"],
    labels: {
      de: "Pressmodul",
      en: "Press Module",
      fr: "Module de presse",
    },
    summaries: {
      de: "Bearbeitet oder trennt Werkstuecke durch geregelte Hubbewegung.",
      en: "Processes or separates workpieces through controlled stroke movement.",
      fr: "Traite ou separe les pieces par mouvement de course controle.",
    },
    signals: {
      de: "Hub aus/ein, Endschalter, Zykluszaehler",
      en: "Stroke extend/retract, end switch, cycle counter",
      fr: "Course sortie/rentree, fin de course, compteur",
    },
  },
  {
    key: "inductive-sensor",
    category: "inductive-sensor",
    role: "sensor",
    count: 19,
    iconId: "inductive-sensor",
    animated: true,
    labels: {
      de: "Induktivsensor",
      en: "Inductive Sensor",
      fr: "Capteur inductif",
    },
    summaries: {
      de: "Erkennt metallische Objekte beruehrungslos entlang der Transportstrecke.",
      en: "Detects metallic objects contactlessly along the transport line.",
      fr: "Detecte sans contact des objets metalliques le long de la ligne.",
    },
    signals: {
      de: "Digital ON/OFF, Schaltabstand erreicht",
      en: "Digital ON/OFF, switching distance reached",
      fr: "Numerique ON/OFF, distance de commutation atteinte",
    },
  },
  {
    key: "rfid-sensor",
    category: "rfid-sensor",
    role: "sensor",
    count: 5,
    iconId: "rfid-sensor",
    animated: true,
    labels: {
      de: "RFID-Sensor",
      en: "RFID Sensor",
      fr: "Capteur RFID",
    },
    summaries: {
      de: "Liest Werkstueck- oder Traeger-IDs fuer Verfolgung und Routing.",
      en: "Reads workpiece or carrier IDs for tracking and routing.",
      fr: "Lit les IDs des pieces/porteurs pour suivi et routage.",
    },
    signals: {
      de: "Tag-ID, Lesestatus, Kommunikationszustand",
      en: "Tag ID, read status, communication state",
      fr: "ID tag, statut de lecture, etat communication",
    },
  },
  {
    key: "optical-sensor",
    category: "optical-sensor",
    role: "sensor",
    count: 1,
    iconId: "lightbarrier-sensor",
    animated: true,
    labels: {
      de: "Lichtschranke",
      en: "Optical Barrier",
      fr: "Barriere optique",
    },
    summaries: {
      de: "Erkennt Objekte ueber Unterbrechung oder Reflexion eines Lichtsignals.",
      en: "Detects objects by light beam interruption or reflection.",
      fr: "Detecte les objets via interruption ou reflexion du faisceau lumineux.",
    },
    signals: {
      de: "Lichtsignal frei/belegt, Schaltsignal",
      en: "Beam clear/blocked, switching signal",
      fr: "Faisceau libre/coupe, signal de commutation",
    },
  },
  {
    key: "crane",
    category: "crane",
    role: "actuator",
    count: 1,
    iconId: "device-square",
    labels: {
      de: "Kran / Lift",
      en: "Crane / Lift",
      fr: "Grue / Lift",
    },
    summaries: {
      de: "Vertikales Handling fuer Ein- und Auslagerbewegungen im Lagerbereich.",
      en: "Vertical handling for storage and retrieval movements in the warehouse.",
      fr: "Manutention verticale pour mouvements de stockage et destockage.",
    },
    signals: {
      de: "Position X/Z, Fahrstatus, Endlage",
      en: "Position X/Z, motion status, end position",
      fr: "Position X/Z, etat mouvement, position finale",
    },
  },
  {
    key: "storage",
    category: "storage",
    role: "actuator",
    count: 1,
    iconId: "highbay-storage",
    moduleSheets: ["224007_data.pdf"],
    labels: {
      de: "Hochregallager",
      en: "High-Bay Storage",
      fr: "Entrepot grande hauteur",
    },
    summaries: {
      de: "Slot-basierte Lagerung mit Bestands-, Kosten- und Nachfragebezug.",
      en: "Slot-based storage with stock, cost, and demand context.",
      fr: "Stockage par emplacements avec contexte stock, cout et demande.",
    },
    signals: {
      de: "Slot belegt/frei, Einlagerung, Auslagerung",
      en: "Slot occupied/free, store command, retrieve command",
      fr: "Emplacement occupe/libre, commande stockage, commande sortie",
    },
  },
];

function renderBriefIcon(component: ComponentBrief) {
  const sharedProps = {
    className: "hotspot__icon",
    width: "100%",
    height: "100%",
    preserveAspectRatio: "xMidYMid meet" as const,
  };

  switch (component.iconId) {
    case "input-station":
      return <InputStationIcon {...sharedProps} active={true} />;
    case "conveyor-belt":
      return <ConveyorBeltIcon {...sharedProps} direction={component.direction ?? "left"} />;
    case "rotating-conveyor":
      return <RotatingConveyorIcon {...sharedProps} direction={component.direction ?? "left"} />;
    case "ball-loader":
      return <BallLoaderIcon {...sharedProps} active={true} />;
    case "inductive-sensor":
      return <InductiveSensorIcon {...sharedProps} active={true} />;
    case "rfid-sensor":
      return <RfidSensorIcon {...sharedProps} active={true} />;
    case "lightbarrier-sensor":
      return <LightBarrierIcon {...sharedProps} active={true} />;
    case "device-square":
      return <DeviceSquareIcon {...sharedProps} />;
    case "highbay-storage":
      return <HighBayStorageIcon {...sharedProps} active={true} />;
    case "pusher":
      return <PusherIcon {...sharedProps} active={true} />;
    case "deposit-place":
      return <DepositPlaceIcon {...sharedProps} active={true} />;
    default:
      return <DeviceSquareIcon {...sharedProps} />;
  }
}

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
  const sectionText = componentSectionText[language];

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
            {sectionText.title}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {sectionText.intro}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
                xl: "1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            {componentBriefs.map((component) => (
              <Card key={component.key} variant="outlined">
                <CardContent>
                  <Box
                    className={`hotspot ${component.animated ? "hotspot--on" : "hotspot--off"}`}
                    aria-label={component.labels[language]}
                    sx={{
                      width: "100%",
                      height: 120,
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {renderBriefIcon(component)}
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                    <Chip
                      size="small"
                      label={component.role === "sensor" ? sectionText.roleSensor : sectionText.roleActuator}
                      color={component.role === "sensor" ? "primary" : "secondary"}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${sectionText.countLabel}: ${component.count}`}
                    />
                  </Stack>

                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                    {component.labels[language]}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {component.summaries[language]}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>{sectionText.categoryLabel}:</strong> {component.category}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>{sectionText.signalsLabel}:</strong> {component.signals[language]}
                  </Typography>
                  {component.moduleSheets && component.moduleSheets.length > 0 && (
                    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                      {component.moduleSheets.map((sheet) => (
                        <Button
                          key={`${component.key}-${sheet}`}
                          size="small"
                          variant="outlined"
                          href={`/static/modules/${sheet}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {sectionText.datasheetButton}: {sheet.replace("_data.pdf", "")}
                        </Button>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>

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

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            {datasheetSectionText[language].title}
          </Typography>

          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            {datasheetSectionText[language].standard}
          </Typography>
          <Stack direction="row" sx={{ mb: 2.5, flexWrap: "wrap", gap: 1 }}>
            {allDatasheets.standard.map((sheet) => (
              <Button
                key={sheet}
                size="small"
                variant="outlined"
                href={`/static/modules/${sheet}`}
                target="_blank"
                rel="noreferrer"
              >
                {sheet.replace("_data.pdf", "")}
              </Button>
            ))}
          </Stack>

          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            {datasheetSectionText[language].kombi}
          </Typography>
          <Stack direction="row" sx={{ mb: 2.5, flexWrap: "wrap", gap: 1 }}>
            {allDatasheets.kombi.map((sheet) => (
              <Button
                key={sheet}
                size="small"
                variant="outlined"
                href={`/static/modules/${sheet}`}
                target="_blank"
                rel="noreferrer"
              >
                {sheet.replace("_data.pdf", "")}
              </Button>
            ))}
          </Stack>

          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            {datasheetSectionText[language].kompakt}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
            {allDatasheets.kompakt.map((sheet) => (
              <Button
                key={sheet}
                size="small"
                variant="outlined"
                href={`/static/modules/${sheet}`}
                target="_blank"
                rel="noreferrer"
              >
                {sheet.replace("_data.pdf", "")}
              </Button>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
