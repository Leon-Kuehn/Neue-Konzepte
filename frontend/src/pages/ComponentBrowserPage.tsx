import { useMemo, useState } from "react";
import { Box, Card, CardContent, Divider, Typography, Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ComponentGroupList from "../components/ComponentGroupList";
import ComponentDetails from "../components/ComponentDetails";
import { mockComponents } from "../types/mockData";
import type { PlantComponent } from "../types/PlantComponent";
import { getTopDownComponentIds } from "../entryRoute/componentBindings";
import { useAppPreferences } from "../context/AppPreferencesContext";

export default function ComponentBrowserPage() {
  const { t } = useAppPreferences();
  const topDownComponentIds = useMemo(() => getTopDownComponentIds(), []);
  const [components] = useState<PlantComponent[]>(() =>
    mockComponents.filter((component) => topDownComponentIds.has(component.id))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedComponent = components.find((c) => c.id === selectedId);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" fontWeight={700}>
        {t("componentBrowser.title")}
      </Typography>

      <Card>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            {t("componentBrowser.browseTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t("componentBrowser.browseDescription")}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <ComponentGroupList
            components={components}
            selectedId={selectedId}
            onSelect={setSelectedId}
            maxHeight={520}
          />
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={Boolean(selectedComponent)}
        onClose={() => setSelectedId(null)}
        PaperProps={{ sx: { width: { xs: 320, sm: 380 }, p: 2 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <IconButton size="small" onClick={() => setSelectedId(null)} aria-label={t("common.closeDetails")}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <ComponentDetails component={selectedComponent} />
      </Drawer>
    </Box>
  );
}
