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
import { useMemo } from "react";
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
import { useLiveComponents } from "../hooks/useLiveComponents";
import { getTopDownComponentIds } from "../entryRoute/componentBindings";

type AppLang = "de" | "en" | "fr" | "es";

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
      "Alle in der App verwendeten Komponententypen mit Kurzbeschreibung und animierter Vorschau. Anzahl und Sichtbarkeit werden automatisch aus der Top-Down-Ansicht synchronisiert.",
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
      "All component types used in the app, with short descriptions and animated previews. Counts and visibility are synchronized with the Top-Down view.",
    roleSensor: "Sensor",
    roleActuator: "Actuator",
    countLabel: "Count",
    categoryLabel: "Category",
    signalsLabel: "Typical Signals",
    datasheetButton: "Datasheet",
  },
  es: {
    title: "Componentes Individuales: Referencia Rápida",
    intro:
      "Todos los tipos de componentes usados en la aplicación, con descripciones cortas y vistas previas animadas. Los conteos y la visibilidad se sincronizan con la Vista Superior.",
    roleSensor: "Sensor",
    roleActuator: "Actuador",
    countLabel: "Cantidad",
    categoryLabel: "Categoría",
    signalsLabel: "Señales típicas",
    datasheetButton: "Ficha técnica",
  },
  fr: {
    title: "Composants Individuels : Résumé",
    intro:
      "Tous les types de composants utilisés dans l'application avec résumé et aperçu animé. Les quantités et la visibilité sont synchronisées avec la vue de dessus.",
    roleSensor: "Capteur",
    roleActuator: "Actionneur",
    countLabel: "Quantité",
    categoryLabel: "Catégorie",
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
  es: { title: "Hojas de datos", standard: "Módulos estándar (221xxx)", kombi: "Módulos combinados (224xxx)", kompakt: "Módulos compactos (226xxx)" },
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
      es: "Estación de entrada",
      fr: "Station d'entrée",
    },
    summaries: {
      de: "Startpunkt des Materialflusses mit Erfassung der ankommenden Werkstücke.",
      en: "Start point of the material flow with incoming workpiece detection.",
      es: "Punto de inicio del flujo de materiales con detección de piezas entrantes.",
      fr: "Point de départ du flux matériel avec détection des pièces entrantes.",
    },
    signals: {
      de: "Startfreigabe, Werkstück erkannt, Stationsstatus",
      en: "Start enable, workpiece detected, station status",
      es: "Permiso de inicio, pieza detectada, estado de la estación",
      fr: "Autorisation de départ, pièce détectée, statut station",
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
      de: "Förderband",
      en: "Conveyor Belt",
      es: "Cinta transportadora",
      fr: "Convoyeur",
    },
    summaries: {
      de: "Linearer Transport zwischen Stationen mit taktgenauer Materialweitergabe.",
      en: "Linear transport between stations with cycle-accurate material handover.",
      es: "Transporte lineal entre estaciones con transferencia de material sincronizada por ciclo.",
      fr: "Transport lineaire entre stations avec transfert cadence du materiel.",
    },
    signals: {
      de: "Motor ON/OFF, Taktzähler, Laufzeit",
      en: "Motor ON/OFF, cycle counter, runtime",
      es: "Motor ON/OFF, contador de ciclos, tiempo de funcionamiento",
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
      de: "Drehförderband",
      en: "Rotating Conveyor",
      es: "Transportador giratorio",
      fr: "Convoyeur rotatif",
    },
    summaries: {
      de: "Richtet den Materialfluss um und verteilt Werkstücke auf verschiedene Strecken.",
      en: "Redirects material flow and distributes workpieces to different paths.",
      es: "Redirige el flujo de material y distribuye piezas a diferentes rutas.",
      fr: "Redirige le flux matériel et distribue les pièces sur plusieurs voies.",
    },
    signals: {
      de: "Drehrichtung, Endlage, Betriebsstatus",
      en: "Rotation direction, end position, operation state",
      es: "Dirección de giro, posición final, estado operativo",
      fr: "Sens de rotation, position finale, etat de service",
    },
  },
  {
    key: "pneumatic-unit",
    category: "pneumatic-unit",
    role: "actuator",
    count: 6,
    iconId: "ball-loader",
    animated: true,
    moduleSheets: ["224005_data.pdf"],
    labels: {
      de: "Pneumatik-Einheit",
      en: "Pneumatic Unit",
      es: "Unidad neumática",
      fr: "Unité pneumatique",
    },
    summaries: {
      de: "Führt mechanische Hub-, Trenn- oder Positionierbewegungen aus.",
      en: "Performs mechanical lifting, separating, or positioning movements.",
      es: "Realiza movimientos mecánicos de elevación, separación o posicionamiento.",
      fr: "Exécute des mouvements mécaniques de levage, séparation ou positionnement.",
    },
    signals: {
      de: "Ventilstatus, Endlage, Druckzustand",
      en: "Valve state, end position, pressure state",
      es: "Estado de válvula, posición final, estado de presión",
      fr: "Etat vanne, position finale, etat de pression",
    },
  },
  {
    key: "pusher",
    category: "pusher",
    role: "actuator",
    count: 2,
    iconId: "pusher",
    moduleSheets: ["224002_data.pdf"],
    labels: {
      de: "Pusher",
      en: "Pusher",
      es: "Empujador",
      fr: "Poussoir",
    },
    summaries: {
      de: "Seitliches Ausschleusen oder Positionieren von Werkstücken auf der Strecke.",
      en: "Performs lateral transfer or positioning of workpieces on the line.",
      es: "Realiza transferencia lateral o posicionamiento de piezas en la línea.",
      fr: "Assure le transfert latéral ou le positionnement des pièces sur la ligne.",
    },
    signals: {
      de: "Ausfahren, Einfahren, Endlage, Taktzähler",
      en: "Extend, retract, end position, cycle counter",
      es: "Extender, retraer, posición final, contador de ciclos",
      fr: "Sortie, rentrée, position finale, compteur de cycles",
    },
  },
  {
    key: "inductive-sensor",
    category: "inductive-sensor",
    role: "sensor",
    count: 18,
    iconId: "inductive-sensor",
    animated: true,
    labels: {
      de: "Induktivsensor",
      en: "Inductive Sensor",
      es: "Sensor inductivo",
      fr: "Capteur inductif",
    },
    summaries: {
      de: "Erkennt metallische Objekte berührungslos entlang der Transportstrecke.",
      en: "Detects metallic objects contactlessly along the transport line.",
      es: "Detecta objetos metálicos sin contacto a lo largo de la línea de transporte.",
      fr: "Détecte sans contact des objets métalliques le long de la ligne.",
    },
    signals: {
      de: "Digital ON/OFF, Schaltabstand erreicht",
      en: "Digital ON/OFF, switching distance reached",
      es: "Digital ON/OFF, distancia de conmutación alcanzada",
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
      es: "Sensor RFID",
      fr: "Capteur RFID",
    },
    summaries: {
      de: "Liest Werkstück- oder Träger-IDs für Verfolgung und Routing.",
      en: "Reads workpiece or carrier IDs for tracking and routing.",
      es: "Lee IDs de piezas o portadores para seguimiento y enrutamiento.",
      fr: "Lit les IDs des pieces/porteurs pour suivi et routage.",
    },
    signals: {
      de: "Tag-ID, Lesestatus, Kommunikationszustand",
      en: "Tag ID, read status, communication state",
      es: "ID de etiqueta, estado de lectura, estado de comunicación",
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
      es: "Barrera óptica",
      fr: "Barriere optique",
    },
    summaries: {
      de: "Erkennt Objekte über Unterbrechung oder Reflexion eines Lichtsignals.",
      en: "Detects objects by light beam interruption or reflection.",
      es: "Detecta objetos por interrupción o reflexión del haz de luz.",
      fr: "Détecte les objets via interruption ou réflexion du faisceau lumineux.",
    },
    signals: {
      de: "Lichtsignal frei/belegt, Schaltsignal",
      en: "Beam clear/blocked, switching signal",
      es: "Haz libre/ocupado, señal de conmutación",
      fr: "Faisceau libre/coupe, signal de commutation",
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
      es: "Almacén de gran altura",
      fr: "Entrepôt grande hauteur",
    },
    summaries: {
      de: "Slot-basierte Lagerung mit Bestands-, Kosten- und Nachfragebezug.",
      en: "Slot-based storage with stock, cost, and demand context.",
      es: "Almacenamiento por slots con contexto de inventario, costo y demanda.",
      fr: "Stockage par emplacements avec contexte stock, cout et demande.",
    },
    signals: {
      de: "Slot belegt/frei, Einlagerung, Auslagerung",
      en: "Slot occupied/free, store command, retrieve command",
      es: "Slot ocupado/libre, comando de almacenar, comando de retirar",
      fr: "Emplacement occupe/libre, commande stockage, commande sortie",
    },
  },
  {
    key: "deposit-place",
    category: "deposit-place",
    role: "actuator",
    count: 2,
    iconId: "deposit-place",
    moduleSheets: ["224002_data.pdf"],
    labels: {
      de: "Ablageplatz",
      en: "Deposit Place",
      es: "Puesto de depósito",
      fr: "Poste de dépôt",
    },
    summaries: {
      de: "Definierter Übergabepunkt für Ablage, Pufferung und Weitertransport.",
      en: "Defined transfer point for placement, buffering, and downstream transport.",
      es: "Punto de transferencia definido para depósito, buffer y transporte posterior.",
      fr: "Point de transfert défini pour dépôt, tamponnage et transport aval.",
    },
    signals: {
      de: "Belegt/Frei, Ablage freigegeben, Übergabe bestätigt",
      en: "Occupied/free, placement enabled, handover confirmed",
      es: "Ocupado/libre, depósito habilitado, transferencia confirmada",
      fr: "Occupé/libre, dépôt autorisé, transfert confirmé",
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
  projectTitle: string;
  projectDescription: string;
  projectRepositoryLabel: string;
  projectRepositoryUrl: string;
  teamTitle: string;
  teamMembers: string[];
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

const docsByLanguage: Record<"de" | "en" | "fr" | "es", DocsContent> = {
  de: {
    title: "System-Dokumentation",
    intro:
      "Diese Seite erklärt Sensorik, Navigation und den optimalen Bedienablauf für den täglichen Betrieb.",
    projectTitle: "Projektursprung",
    projectDescription:
      "Diese Website basiert auf dem initialen GitHub-Projekt von Neue Konzepte.",
    projectRepositoryLabel: "GitHub-Projekt anzeigen",
    projectRepositoryUrl: "https://github.com/Leon-Kuehn/Neue-Konzepte",
    teamTitle: "Entwicklerteam",
    teamMembers: [
      "Leon Kühn: Design, Website-Umsetzung und Projektführung.",
      "Daniel Trautwein: Backend, Video und Dokumentation.",
      "Alexander Shimaylo: Hardware und IoT-Tests.",
    ],
    quickStartTitle: "Schnellstart (2 Minuten)",
    quickStart: [
      "In Einstellungen den MQTT-Broker eintragen und verbinden.",
      "In Top-Down-Ansicht den Live-Status prüfen (Online/Offline, ON/OFF).",
      "Komponentenbrowser nutzen, um schnell Details zu einer Komponente zu sehen.",
      "Im Hochregallager Slot anklicken, Inhalt prüfen und Analysekarte auswerten.",
    ],
    navigationTitle: "Navigation und Bedienkonzept",
    navigation: [
      "Top-Down-Ansicht: Live-Status aller relevanten Stationen auf der Strecke.",
      "Hochregallager: Slot-für-Slot-Ansicht mit Lagerinhalt und wirtschaftlicher Bewertung.",
      "Komponentenbrowser: Strukturierte Liste nach Kategorien mit schneller Detailsuche.",
      "Einstellungen: Theme, Sprache und MQTT-Verbindungsparameter.",
      "Dokumentation: Bedienhilfe, Sensorerklärungen und Troubleshooting.",
    ],
    mqttTitle: "MQTT-Verbindung richtig einrichten",
    mqtt: [
      "Host und Port auf den erreichbaren Broker setzen (z. B. raspberrypi.local:1883).",
      "TLS nur aktivieren, wenn dein Broker auch wirklich TLS anbietet (typisch Port 8883).",
      "Nach Connect wird die Verbindung gespeichert und bei erneutem Aufruf wiederverwendet.",
      "Wenn keine Live-Daten kommen, zuerst Broker erreichbar? Dann Topics und Rechte prüfen.",
    ],
    sensorTitle: "Sensoren und Komponenten: Bedeutung",
    sensorHeaderType: "Typ",
    sensorHeaderPurpose: "Aufgabe",
    sensorHeaderSignals: "Typische Signale",
    sensorHeaderTroubleshooting: "Fehlersuche",
    sensors: [
      {
        type: "Induktivsensor",
        purpose: "Erkennung metallischer Werkstücke ohne Berührung.",
        signals: "Digital ON/OFF, meist 24V Schaltsignal.",
        troubleshooting:
          "Abstand prüfen, Sensorfläche reinigen, Versorgungsspannung und Stecker kontrollieren.",
      },
      {
        type: "Lichtsensor / Lichtschranke",
        purpose: "Objekterkennung über Lichtstrahl oder Reflexion.",
        signals: "Digital ON/OFF oder analoger Intensitätswert.",
        troubleshooting:
          "Optik reinigen, Ausrichtung Sender/Empfänger prüfen, Fremdlichtquellen minimieren.",
      },
      {
        type: "RFID-Sensor",
        purpose: "Identifikation von Werkstücken/Trägern per Tag-ID.",
        signals: "Gelesene ID, Statuscode, Kommunikationszustand.",
        troubleshooting:
          "Tag-Position und Abstand prüfen, Abschirmung durch Metall beachten, Bus-Kommunikation testen.",
      },
      {
        type: "Förderband-Segment",
        purpose: "Materialtransport zwischen Stationen.",
        signals: "Status ON/OFF, Zykluszähler, Laufzeit.",
        troubleshooting:
          "Motoransteuerung, Blockaden, Endschalter und Not-Aus-Kette prüfen.",
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
      "Lagerhüter und Langsamdreher helfen bei Abverkauf, Sortimentsbereinigung oder Ersatzteilstrategie.",
    ],
    troubleshootingTitle: "Typische Probleme und Lösungen",
    troubleshooting: [
      "Komponente offline: Netzwerk, Broker, Topic-Berechtigungen und Stromversorgung prüfen.",
      "Status springt nicht: Richtigen Status-Topic und Payload-Format (JSON) kontrollieren.",
      "Leere Karten/Ansichten: Browser-Cache neu laden, MQTT-Verbindung trennen/neu verbinden.",
      "Falsche Sprache/Theme: In Einstellungen neu wählen, Speicherung erfolgt automatisch im Browser.",
    ],
    bestPracticesTitle: "Empfohlene Betriebsregeln",
    bestPractices: [
      "MQTT-Topics klar strukturieren: anlage/komponente/status und anlage/komponente/cmd.",
      "Komponenten-ID konsistent halten zwischen SPS/Edge-Gerät und Weboberfläche.",
      "Lagerdaten mindestens täglich abgleichen, damit Analysewerte belastbar bleiben.",
      "Bei Produktivbetrieb Dead-Stock-Regeln mit Einkauf/Produktion gemeinsam definieren.",
    ],
  },
  en: {
    title: "System Documentation",
    intro:
      "This page explains sensors, navigation, and the recommended operating flow for daily use.",
    projectTitle: "Project Origin",
    projectDescription: "This website is based on the initial Neue Konzepte GitHub project.",
    projectRepositoryLabel: "Open GitHub project",
    projectRepositoryUrl: "https://github.com/Leon-Kuehn/Neue-Konzepte",
    teamTitle: "Development Team",
    teamMembers: [
      "Leon Kühn: Design, website implementation, and project leadership.",
      "Daniel Trautwein: Backend, video, and documentation.",
      "Alexander Shimaylo: Hardware and IoT testing.",
    ],
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
  es: {
    title: "Documentación del Sistema",
    intro:
      "Esta página explica sensores, navegación y el flujo de operación recomendado para el uso diario.",
    projectTitle: "Origen del proyecto",
    projectDescription:
      "Este sitio web se basa en el proyecto inicial de GitHub de Neue Konzepte.",
    projectRepositoryLabel: "Abrir proyecto en GitHub",
    projectRepositoryUrl: "https://github.com/Leon-Kuehn/Neue-Konzepte",
    teamTitle: "Equipo de desarrollo",
    teamMembers: [
      "Leon Kühn: diseño, implementación del sitio web y liderazgo del proyecto.",
      "Daniel Trautwein: backend, video y documentación.",
      "Alexander Shimaylo: hardware y pruebas IoT.",
    ],
    quickStartTitle: "Inicio rápido (2 minutos)",
    quickStart: [
      "Abre Configuración, configura el broker MQTT y conecta.",
      "Usa la Vista Superior para verificar estados en vivo (En línea/Fuera de línea, ON/OFF).",
      "Abre el Navegador de Componentes para inspeccionar detalles rápidamente.",
      "En el Almacén de Gran Altura, haz clic en los slots para inspeccionar stock y métricas de negocio.",
    ],
    navigationTitle: "Navegación y concepto de uso",
    navigation: [
      "Vista Superior: estados en vivo de las estaciones principales de la línea.",
      "Almacén de Gran Altura: vista por slot con inventario e indicadores económicos.",
      "Navegador de Componentes: lista por categorías para búsqueda rápida.",
      "Configuración: tema, idioma y parámetros de conexión MQTT.",
      "Documentación: guía de usuario, explicación de sensores y solución de problemas.",
    ],
    mqttTitle: "Cómo configurar MQTT correctamente",
    mqtt: [
      "Configura host y puerto hacia un broker accesible (por ejemplo raspberrypi.local:1883).",
      "Activa TLS solo si tu broker realmente ofrece TLS (normalmente puerto 8883).",
      "Después de conectar, la configuración se guarda y reutiliza automáticamente.",
      "Si no llegan datos en vivo, primero verifica acceso al broker, luego topics y permisos.",
    ],
    sensorTitle: "Sensores y componentes: significado",
    sensorHeaderType: "Tipo",
    sensorHeaderPurpose: "Propósito",
    sensorHeaderSignals: "Señales típicas",
    sensorHeaderTroubleshooting: "Resolución de problemas",
    sensors: [
      {
        type: "Sensor inductivo",
        purpose: "Detecta piezas metálicas sin contacto.",
        signals: "ON/OFF digital, normalmente señal de 24V.",
        troubleshooting:
          "Comprueba distancia, limpia la cara del sensor, verifica alimentación y conectores.",
      },
      {
        type: "Sensor de luz / barrera óptica",
        purpose: "Detección de objetos por interrupción o reflexión del haz.",
        signals: "ON/OFF digital o valores analógicos de intensidad.",
        troubleshooting:
          "Limpia la óptica, alinea emisor/receptor y reduce interferencias de luz externa.",
      },
      {
        type: "Sensor RFID",
        purpose: "Identifica portadores/piezas mediante IDs de etiqueta.",
        signals: "ID leída, código de estado, estado de comunicación.",
        troubleshooting:
          "Comprueba posición y distancia de la etiqueta, ten en cuenta apantallamiento metálico y prueba el bus.",
      },
      {
        type: "Segmento transportador",
        purpose: "Mueve material entre estaciones.",
        signals: "Estado ON/OFF, contadores de ciclo, tiempo de funcionamiento.",
        troubleshooting:
          "Verifica control de motor, atascos, finales de carrera y cadena de paro de emergencia.",
      },
      {
        type: "Unidad neumática / actuador",
        purpose: "Movimiento mecánico, separación, posicionamiento o prensado.",
        signals: "Estado de válvulas, posiciones finales, valores de presión opcionales.",
        troubleshooting:
          "Comprueba aire comprimido, electroválvulas, fugas y sensores de fin de carrera.",
      },
    ],
    highBayTitle: "Almacén de gran altura y analítica económica",
    highBay: [
      "Cada slot es clicable: artículo, cantidad, costos, precio y demanda visibles inmediatamente.",
      "El valor de inventario muestra el capital actualmente inmovilizado.",
      "El beneficio bruto mensual destaca los componentes con mayor valor económico.",
      "Stock muerto y baja rotación ayudan a liquidación, limpieza de portafolio y estrategia de repuestos.",
    ],
    troubleshootingTitle: "Problemas comunes y soluciones",
    troubleshooting: [
      "Componente fuera de línea: revisa red, broker, permisos de topics y alimentación.",
      "El estado no se actualiza: verifica topic de estado y formato de payload (JSON).",
      "Vistas/tarjetas vacías: recarga caché del navegador y reconecta MQTT.",
      "Idioma/tema incorrecto: vuelve a seleccionar en Configuración; se guarda automáticamente en el navegador.",
    ],
    bestPracticesTitle: "Reglas de operación recomendadas",
    bestPractices: [
      "Usa una estructura clara de topics MQTT: plant/component/status y plant/component/cmd.",
      "Mantén IDs de componentes consistentes entre PLC/dispositivo edge y la interfaz web.",
      "Sincroniza datos de almacén al menos a diario para mantener analíticas confiables.",
      "Define políticas de stock muerto junto con compras y producción.",
    ],
  },
  fr: {
    title: "Documentation système",
    intro:
      "Cette page explique les capteurs, la navigation et le flux d'utilisation recommandé pour l'exploitation quotidienne.",
    projectTitle: "Origine du projet",
    projectDescription:
      "Ce site web est basé sur le projet GitHub initial Neue Konzepte.",
    projectRepositoryLabel: "Ouvrir le projet GitHub",
    projectRepositoryUrl: "https://github.com/Leon-Kuehn/Neue-Konzepte",
    teamTitle: "Équipe de développement",
    teamMembers: [
      "Leon Kühn : design, implémentation du site web et pilotage du projet.",
      "Daniel Trautwein : backend, video et documentation.",
      "Alexander Shimaylo : matériel et tests IoT.",
    ],
    quickStartTitle: "Démarrage rapide (2 minutes)",
    quickStart: [
      "Dans Paramètres, configurez le broker MQTT puis connectez-vous.",
      "Utilisez la vue de dessus pour vérifier les états en direct (En ligne/Hors ligne, ON/OFF).",
      "Utilisez le navigateur de composants pour ouvrir rapidement les détails.",
      "Dans l'entrepôt grande hauteur, cliquez sur les emplacements pour voir le stock et les indicateurs économiques.",
    ],
    navigationTitle: "Navigation et logique d'utilisation",
    navigation: [
      "Vue de dessus : état en direct des stations principales.",
      "Entrepôt grande hauteur : vue par emplacement avec stock et indicateurs économiques.",
      "Navigateur de composants : liste par catégorie pour retrouver rapidement un composant.",
      "Paramètres : thème, langue et configuration MQTT.",
      "Documentation : guide d'utilisation, capteurs et depannage.",
    ],
    mqttTitle: "Configurer MQTT correctement",
    mqtt: [
      "Renseignez un host et un port accessibles (par exemple raspberrypi.local:1883).",
      "Activez TLS uniquement si votre broker le supporte (souvent port 8883).",
      "Après connexion, les réglages sont sauvegardés et réutilisés automatiquement.",
      "Si aucune donnée n'arrive, vérifiez d'abord l'accessibilité du broker, puis les topics et droits.",
    ],
    sensorTitle: "Capteurs et composants : signification",
    sensorHeaderType: "Type",
    sensorHeaderPurpose: "Fonction",
    sensorHeaderSignals: "Signaux typiques",
    sensorHeaderTroubleshooting: "Depannage",
    sensors: [
      {
        type: "Capteur inductif",
        purpose: "Détection sans contact de pièces métalliques.",
        signals: "Signal numérique ON/OFF, souvent 24V.",
        troubleshooting:
          "Verifier la distance, nettoyer la face capteur, controler tension d'alimentation et connecteurs.",
      },
      {
        type: "Capteur lumineux / barrière optique",
        purpose: "Detection d'objet par interruption de faisceau ou reflexion.",
        signals: "Signal numérique ON/OFF ou intensité analogique.",
        troubleshooting:
          "Nettoyer l'optique, aligner émetteur/récepteur, limiter la lumière parasite.",
      },
      {
        type: "Capteur RFID",
        purpose: "Identification de pieces/porteurs par ID de tag.",
        signals: "ID lu, code statut, état de communication.",
        troubleshooting:
          "Vérifier position et distance du tag, tenir compte des écrans métalliques, tester le bus.",
      },
      {
        type: "Segment convoyeur",
        purpose: "Transport de matiere entre stations.",
        signals: "État ON/OFF, compteur de cycles, temps de marche.",
        troubleshooting:
          "Verifier commande moteur, blocages, fins de course et chaine d'arret d'urgence.",
      },
      {
        type: "Unité pneumatique / actionneur",
        purpose: "Mouvement mécanique, séparation, positionnement ou pressage.",
        signals: "État des vannes, positions de fin de course, éventuellement pression.",
        troubleshooting:
          "Verifier alimentation en air comprime, electrovanne, etancheite et capteurs de fin de course.",
      },
    ],
    highBayTitle: "Entrepôt grande hauteur et analyse économique",
    highBay: [
      "Chaque emplacement est cliquable : article, quantité, coût, prix et demande visibles immédiatement.",
      "La valeur de stock montre le capital immobilisé actuellement.",
      "La marge brute mensuelle met en évidence les composants performants.",
      "Stock mort et rotation lente aident au déclassement et au nettoyage du portefeuille.",
    ],
    troubleshootingTitle: "Problèmes fréquents et solutions",
    troubleshooting: [
      "Composant hors ligne : verifier reseau, broker, droits des topics et alimentation.",
      "Statut non mis a jour : verifier topic de statut et format payload (JSON).",
      "Vues vides : recharger le cache navigateur puis reconnecter MQTT.",
      "Langue/thème incorrects : sélectionner à nouveau dans Paramètres (sauvegarde automatique).",
    ],
    bestPracticesTitle: "Bonnes pratiques d'exploitation",
    bestPractices: [
      "Structurer clairement les topics MQTT : plant/component/status et plant/component/cmd.",
      "Conserver des IDs composants cohérents entre PLC/edge et interface web.",
      "Synchroniser les données de stock au minimum chaque jour.",
      "Definir les regles de stock mort avec achats et production.",
    ],
  },
};

export default function DocumentationPage() {
  const { language } = useAppPreferences();
  const { components } = useLiveComponents();
  const docsLanguage: AppLang = language === "de" || language === "fr" || language === "es" ? language : "en";
  const docs = docsByLanguage[docsLanguage];
  const sectionText = componentSectionText[docsLanguage];
  const topDownComponentIds = useMemo(() => getTopDownComponentIds(), []);

  const synchronizedComponentBriefs = useMemo(() => {
    const relevantComponents = components.filter((component) => topDownComponentIds.has(component.id));
    const categoryCounts = new Map<string, number>();

    for (const component of relevantComponents) {
      categoryCounts.set(component.category, (categoryCounts.get(component.category) ?? 0) + 1);
    }

    return componentBriefs
      .map((brief) => ({
        ...brief,
        count: categoryCounts.get(brief.category) ?? 0,
      }))
      .filter((brief) => brief.count > 0);
  }, [components, topDownComponentIds]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" fontWeight={700}>
        {docs.title}
      </Typography>

      <Alert severity="info">{docs.intro}</Alert>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" }, gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              {docs.projectTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {docs.projectDescription}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              href={docs.projectRepositoryUrl}
              target="_blank"
              rel="noreferrer"
            >
              {docs.projectRepositoryLabel}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              {docs.teamTitle}
            </Typography>
            <List dense disablePadding>
              {docs.teamMembers.map((member) => (
                <ListItem key={member} disableGutters>
                  <ListItemText primary={member} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

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
            {synchronizedComponentBriefs.map((component) => (
              <Card key={component.key} variant="outlined">
                <CardContent>
                  <Box
                    className="hotspot hotspot--on"
                    aria-label={component.labels[docsLanguage]}
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
                    {component.labels[docsLanguage]}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {component.summaries[docsLanguage]}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>{sectionText.categoryLabel}:</strong> {component.category}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>{sectionText.signalsLabel}:</strong> {component.signals[docsLanguage]}
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
            {datasheetSectionText[docsLanguage].title}
          </Typography>

          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            {datasheetSectionText[docsLanguage].standard}
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
            {datasheetSectionText[docsLanguage].kombi}
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
            {datasheetSectionText[docsLanguage].kompakt}
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
