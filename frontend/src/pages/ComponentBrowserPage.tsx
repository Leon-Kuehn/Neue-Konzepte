import { useState } from "react";
import { Box, Card, CardContent, Divider, Typography, Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ComponentGroupList from "../components/ComponentGroupList";
import ComponentDetails from "../components/ComponentDetails";
import { mockComponents } from "../types/mockData";
import type { PlantComponent } from "../types/PlantComponent";

export default function ComponentBrowserPage() {
  const [components] = useState<PlantComponent[]>(mockComponents);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedComponent = components.find((c) => c.id === selectedId);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" fontWeight={700}>
        Component Browser
      </Typography>

      <Card>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            Browse Components
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Click a row to open the details drawer. This view is dedicated to tiles and lists to keep the map clean.
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
          <IconButton size="small" onClick={() => setSelectedId(null)} aria-label="Close details">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <ComponentDetails component={selectedComponent} />
      </Drawer>
    </Box>
  );
}
