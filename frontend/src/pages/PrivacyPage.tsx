import { Alert, Box, Card, CardContent, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useAppPreferences } from "../context/AppPreferencesContext";

type Content = {
  title: string;
  intro: string;
  dataTitle: string;
  dataLines: string[];
  purposeTitle: string;
  purposeLines: string[];
  retentionTitle: string;
  retentionLines: string[];
  rightsTitle: string;
  rightsLines: string[];
};

const byLanguage: Record<"de" | "en" | "fr" | "es", Content> = {
  de: {
    title: "Datenschutzerklärung",
    intro: "Diese Seite informiert über die Verarbeitung personenbezogener Daten innerhalb dieser Projektanwendung.",
    dataTitle: "Welche Daten verarbeitet werden",
    dataLines: [
      "Lokale Einstellungen im Browser (z. B. Theme, Sprache, Accessibility).",
      "Technische Verbindungsdaten für MQTT-Konfigurationen, wenn durch Nutzende eingegeben.",
      "System-/Simulationsdaten zur Darstellung von Komponenten- und Lagerzuständen.",
    ],
    purposeTitle: "Zwecke der Verarbeitung",
    purposeLines: [
      "Bereitstellung und Betrieb der Visualisierung und Steuerungsoberflächen.",
      "Speicherung benutzerbezogener UI-Einstellungen für bessere Bedienbarkeit.",
      "Analyse und Nachvollziehbarkeit von Simulationsereignissen im Projektkontext.",
    ],
    retentionTitle: "Speicherdauer",
    retentionLines: [
      "Browser-Einstellungen bleiben lokal gespeichert, bis sie im Browser gelöscht werden.",
      "Projektbezogene Backend-/Simulationsdaten werden nur so lange gespeichert, wie es für den Projektbetrieb erforderlich ist.",
    ],
    rightsTitle: "Betroffenenrechte",
    rightsLines: [
      "Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung im Rahmen der gesetzlichen Vorgaben.",
      "Anfragen können über die im Impressum genannte Kontaktadresse gestellt werden.",
    ],
  },
  en: {
    title: "Privacy Policy",
    intro: "This page explains how personal data is processed within this project application.",
    dataTitle: "What data is processed",
    dataLines: [
      "Local browser settings (e.g., theme, language, accessibility).",
      "Technical connection data for MQTT configurations when entered by users.",
      "System/simulation data used to display component and warehouse states.",
    ],
    purposeTitle: "Purpose of processing",
    purposeLines: [
      "Providing and operating visualization and control interfaces.",
      "Storing user-related UI preferences to improve usability.",
      "Analysis and traceability of simulation events in the project context.",
    ],
    retentionTitle: "Data retention",
    retentionLines: [
      "Browser settings remain stored locally until deleted in the browser.",
      "Project-related backend/simulation data is stored only as long as required for project operation.",
    ],
    rightsTitle: "Data subject rights",
    rightsLines: [
      "Access, correction, deletion, and restriction of processing according to legal requirements.",
      "Requests can be sent using the contact details listed in the imprint page.",
    ],
  },
  fr: {
    title: "Politique de confidentialité",
    intro: "Cette page explique le traitement des données personnelles dans cette application de projet.",
    dataTitle: "Données traitées",
    dataLines: [
      "Paramètres locaux du navigateur (par ex. thème, langue, accessibilité).",
      "Données techniques de connexion pour les configurations MQTT saisies par les utilisateurs.",
      "Données système/simulation utilisées pour l'affichage des états composants et entrepôt.",
    ],
    purposeTitle: "Finalités du traitement",
    purposeLines: [
      "Fournir et exploiter les interfaces de visualisation et de contrôle.",
      "Enregistrer les préférences d'interface pour améliorer l'ergonomie.",
      "Analyser et tracer les événements de simulation dans le cadre du projet.",
    ],
    retentionTitle: "Durée de conservation",
    retentionLines: [
      "Les paramètres du navigateur restent stockés localement jusqu'à suppression par l'utilisateur.",
      "Les données backend/simulation du projet ne sont conservées que pendant la durée nécessaire au fonctionnement du projet.",
    ],
    rightsTitle: "Droits des personnes concernées",
    rightsLines: [
      "Droit d'accès, de rectification, d'effacement et de limitation du traitement selon les obligations légales.",
      "Les demandes peuvent être envoyées via les coordonnées figurant dans les mentions légales.",
    ],
  },
  es: {
    title: "Política de privacidad",
    intro: "Esta página explica cómo se tratan los datos personales dentro de esta aplicación del proyecto.",
    dataTitle: "Qué datos se procesan",
    dataLines: [
      "Configuraciones locales del navegador (p. ej., tema, idioma, accesibilidad).",
      "Datos técnicos de conexión para configuraciones MQTT cuando son introducidos por usuarios.",
      "Datos del sistema/simulación para mostrar estados de componentes y del almacén.",
    ],
    purposeTitle: "Finalidad del tratamiento",
    purposeLines: [
      "Proveer y operar interfaces de visualización y control.",
      "Guardar preferencias de UI del usuario para mejorar la usabilidad.",
      "Analizar y trazar eventos de simulación en el contexto del proyecto.",
    ],
    retentionTitle: "Conservación de datos",
    retentionLines: [
      "Las configuraciones del navegador permanecen localmente hasta que se eliminen en el navegador.",
      "Los datos de backend/simulación del proyecto se conservan solo el tiempo necesario para la operación del proyecto.",
    ],
    rightsTitle: "Derechos del titular de datos",
    rightsLines: [
      "Acceso, rectificación, supresión y limitación del tratamiento según los requisitos legales.",
      "Las solicitudes pueden enviarse mediante los datos de contacto indicados en el aviso legal.",
    ],
  },
};

export default function PrivacyPage() {
  const { language } = useAppPreferences();
  const content = byLanguage[language === "de" || language === "fr" || language === "es" ? language : "en"];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" fontWeight={700}>
        {content.title}
      </Typography>

      <Alert severity="info">{content.intro}</Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {content.dataTitle}
          </Typography>
          <List dense disablePadding>
            {content.dataLines.map((line) => (
              <ListItem key={line} disableGutters>
                <ListItemText primary={line} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {content.purposeTitle}
          </Typography>
          <List dense disablePadding>
            {content.purposeLines.map((line) => (
              <ListItem key={line} disableGutters>
                <ListItemText primary={line} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {content.retentionTitle}
          </Typography>
          <List dense disablePadding>
            {content.retentionLines.map((line) => (
              <ListItem key={line} disableGutters>
                <ListItemText primary={line} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {content.rightsTitle}
          </Typography>
          <List dense disablePadding>
            {content.rightsLines.map((line) => (
              <ListItem key={line} disableGutters>
                <ListItemText primary={line} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
