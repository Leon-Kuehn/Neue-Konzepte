import { Alert, Box, Card, CardContent, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useAppPreferences } from "../context/AppPreferencesContext";

type Content = {
  title: string;
  intro: string;
  operatorTitle: string;
  operatorLines: string[];
  contactTitle: string;
  contactLines: string[];
  responsibilityTitle: string;
  responsibilityText: string;
  noticeTitle: string;
  noticeLines: string[];
};

const byLanguage: Record<"de" | "en" | "fr" | "es", Content> = {
  de: {
    title: "Impressum",
    intro: "Angaben gemäß § 5 DDG für dieses Projektangebot.",
    operatorTitle: "Anbieter",
    operatorLines: [
      "Projekt: Neue Konzepte – IoT Anlagen-Cockpit",
      "Studienprojekt / Demonstrationsanwendung",
      "DHBW Lörrach",
    ],
    contactTitle: "Kontakt",
    contactLines: [
      "E-Mail: info@neue-konzepte.local",
      "Web: https://github.com/Leon-Kuehn/Neue-Konzepte",
    ],
    responsibilityTitle: "Inhaltlich verantwortlich",
    responsibilityText: "Leon Kühn (Projektführung & Website), Daniel Trautwein (Backend, Video, Doku), Alexander Shimaylo (Hardware & IoT-Tests)",
    noticeTitle: "Hinweise",
    noticeLines: [
      "Diese Anwendung dient als Projekt- und Demonstrationsplattform.",
      "Trotz sorgfältiger Pflege können Inhalte unvollständig oder veraltet sein.",
      "Für externe Links sind ausschließlich deren Betreiber verantwortlich.",
    ],
  },
  en: {
    title: "Imprint",
    intro: "Information according to German legal notice requirements for this project.",
    operatorTitle: "Provider",
    operatorLines: [
      "Project: Neue Konzepte – IoT Plant Operations Cockpit",
      "Study project / demonstration application",
      "DHBW Lörrach",
    ],
    contactTitle: "Contact",
    contactLines: [
      "Email: info@neue-konzepte.local",
      "Web: https://github.com/Leon-Kuehn/Neue-Konzepte",
    ],
    responsibilityTitle: "Responsible for content",
    responsibilityText: "Leon Kühn (project lead & website), Daniel Trautwein (backend, video, docs), Alexander Shimaylo (hardware & IoT testing)",
    noticeTitle: "Notes",
    noticeLines: [
      "This application is intended as a project and demonstration platform.",
      "Despite careful maintenance, content may be incomplete or outdated.",
      "External links are the sole responsibility of their respective operators.",
    ],
  },
  fr: {
    title: "Mentions légales",
    intro: "Informations légales pour ce projet.",
    operatorTitle: "Éditeur",
    operatorLines: [
      "Projet : Neue Konzepte – Cockpit des opérations IoT",
      "Projet d'étude / application de démonstration",
      "DHBW Lörrach",
    ],
    contactTitle: "Contact",
    contactLines: [
      "E-mail : info@neue-konzepte.local",
      "Web : https://github.com/Leon-Kuehn/Neue-Konzepte",
    ],
    responsibilityTitle: "Responsable du contenu",
    responsibilityText: "Leon Kühn (pilotage du projet & site web), Daniel Trautwein (backend, vidéo, documentation), Alexander Shimaylo (matériel & tests IoT)",
    noticeTitle: "Remarques",
    noticeLines: [
      "Cette application sert de plateforme de projet et de démonstration.",
      "Malgré un soin particulier, certains contenus peuvent être incomplets ou obsolètes.",
      "Les liens externes relèvent uniquement de la responsabilité de leurs exploitants.",
    ],
  },
  es: {
    title: "Aviso legal",
    intro: "Información legal para este proyecto.",
    operatorTitle: "Proveedor",
    operatorLines: [
      "Proyecto: Neue Konzepte – Panel de Operaciones de Planta IoT",
      "Proyecto académico / aplicación de demostración",
      "DHBW Lörrach",
    ],
    contactTitle: "Contacto",
    contactLines: [
      "Correo: info@neue-konzepte.local",
      "Web: https://github.com/Leon-Kuehn/Neue-Konzepte",
    ],
    responsibilityTitle: "Responsable del contenido",
    responsibilityText: "Leon Kühn (liderazgo del proyecto y web), Daniel Trautwein (backend, video, documentación), Alexander Shimaylo (hardware y pruebas IoT)",
    noticeTitle: "Avisos",
    noticeLines: [
      "Esta aplicación se utiliza como plataforma de proyecto y demostración.",
      "A pesar del cuidado aplicado, el contenido puede estar incompleto o desactualizado.",
      "Los enlaces externos son responsabilidad exclusiva de sus operadores.",
    ],
  },
};

export default function ImprintPage() {
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
            {content.operatorTitle}
          </Typography>
          <List dense disablePadding>
            {content.operatorLines.map((line) => (
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
            {content.contactTitle}
          </Typography>
          <List dense disablePadding>
            {content.contactLines.map((line) => (
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
            {content.responsibilityTitle}
          </Typography>
          <Typography variant="body2">{content.responsibilityText}</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {content.noticeTitle}
          </Typography>
          <List dense disablePadding>
            {content.noticeLines.map((line) => (
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
