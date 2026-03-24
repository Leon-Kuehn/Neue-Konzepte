import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  Drawer,
  IconButton,
  Chip,
  Stack,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ComponentGroupList from "../components/ComponentGroupList";
import ComponentDetails from "../components/ComponentDetails";
import KpiSummaryBar from "../components/KpiSummaryBar";
import { getTopDownComponentIds } from "../entryRoute/componentBindings";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { useLiveComponents } from "../hooks/useLiveComponents";
import { useComponentHistory, useComponentStats, useLatestSensorData } from "../hooks/useSensorData";
import type { SensorData } from "../services/sensorDataApi";

export default function ComponentBrowserPage() {
  const { t } = useAppPreferences();
  const navigate = useNavigate();
  const { components: liveComponents } = useLiveComponents();
  const topDownComponentIds = useMemo(() => getTopDownComponentIds(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [connectivityFilter, setConnectivityFilter] = useState<"all" | "online" | "offline">("all");
  const [activityFilter, setActivityFilter] = useState<"all" | "on" | "off">("all");

  const components = useMemo(
    () => liveComponents.filter((component) => topDownComponentIds.has(component.id)),
    [liveComponents, topDownComponentIds],
  );

  const latestStoredQuery = useLatestSensorData({
    refetchInterval: 15_000,
  });

  const selectedStatsQuery = useComponentStats(selectedId ?? undefined, {
    enabled: Boolean(selectedId),
    refetchInterval: 30_000,
  });

  const selectedHistoryQuery = useComponentHistory(
    selectedId ?? undefined,
    { limit: 120 },
    {
      enabled: Boolean(selectedId),
      refetchInterval: 15_000,
    },
  );

  const latestStoredByComponent = useMemo(() => {
    const byComponent = new Map<string, SensorData>();
    for (const row of latestStoredQuery.data ?? []) {
      if (!byComponent.has(row.componentId)) {
        byComponent.set(row.componentId, row);
      }
    }
    return byComponent;
  }, [latestStoredQuery.data]);

  const filteredComponents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return components.filter((component) => {
      const matchesQuery =
        query.length === 0 ||
        component.name.toLowerCase().includes(query) ||
        component.id.toLowerCase().includes(query) ||
        component.category.toLowerCase().includes(query);

      const matchesConnectivity =
        connectivityFilter === "all" ||
        (connectivityFilter === "online" ? component.online : !component.online);

      const matchesActivity =
        activityFilter === "all" || component.status === activityFilter;

      return matchesQuery && matchesConnectivity && matchesActivity;
    });
  }, [activityFilter, components, connectivityFilter, searchTerm]);

  const selectedComponent = filteredComponents.find((component) => component.id === selectedId) ?? null;
  const selectedStoredEntry = selectedId ? latestStoredByComponent.get(selectedId) : undefined;
  const onlineCount = filteredComponents.filter((component) => component.online).length;
  const activeCount = filteredComponents.filter((component) => component.status === "on").length;

  useEffect(() => {
    if (!selectedId) return;
    const stillVisible = filteredComponents.some((component) => component.id === selectedId);
    if (!stillVisible) setSelectedId(null);
  }, [filteredComponents, selectedId]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" fontWeight={700}>
        {t("componentBrowser.title")}
      </Typography>

      <KpiSummaryBar
        items={[
          { label: t("plant.kpiTotalComponents"), value: `${filteredComponents.length}/${components.length}` },
          { label: t("plant.kpiOnlineComponents"), value: `${onlineCount}` },
          { label: t("plant.kpiActiveComponents"), value: `${activeCount}` },
          { label: t("group.storage"), value: `${filteredComponents.filter((component) => component.category === "storage").length}` },
        ]}
      />

      <Card>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            {t("componentBrowser.browseTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t("componentBrowser.browseDescription")}
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.5 }}>
            <TextField
              size="small"
              label={t("componentBrowser.search")}
              placeholder={t("componentBrowser.searchPlaceholder")}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              sx={{ minWidth: { xs: "100%", md: 280 } }}
            />

            <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {t("componentBrowser.connectivity")}
              </Typography>
              <Chip
                label={t("componentBrowser.filterAll")}
                size="small"
                color={connectivityFilter === "all" ? "primary" : "default"}
                variant={connectivityFilter === "all" ? "filled" : "outlined"}
                onClick={() => setConnectivityFilter("all")}
              />
              <Chip
                label={t("componentDetails.online")}
                size="small"
                color={connectivityFilter === "online" ? "success" : "default"}
                variant={connectivityFilter === "online" ? "filled" : "outlined"}
                onClick={() => setConnectivityFilter("online")}
              />
              <Chip
                label={t("componentDetails.offline")}
                size="small"
                color={connectivityFilter === "offline" ? "warning" : "default"}
                variant={connectivityFilter === "offline" ? "filled" : "outlined"}
                onClick={() => setConnectivityFilter("offline")}
              />
            </Stack>

            <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {t("componentBrowser.activity")}
              </Typography>
              <Chip
                label={t("componentBrowser.filterAll")}
                size="small"
                color={activityFilter === "all" ? "primary" : "default"}
                variant={activityFilter === "all" ? "filled" : "outlined"}
                onClick={() => setActivityFilter("all")}
              />
              <Chip
                label={t("status.on")}
                size="small"
                color={activityFilter === "on" ? "success" : "default"}
                variant={activityFilter === "on" ? "filled" : "outlined"}
                onClick={() => setActivityFilter("on")}
              />
              <Chip
                label={t("status.off")}
                size="small"
                color={activityFilter === "off" ? "warning" : "default"}
                variant={activityFilter === "off" ? "filled" : "outlined"}
                onClick={() => setActivityFilter("off")}
              />
            </Stack>
          </Stack>

          <Divider sx={{ mb: 1 }} />

          {filteredComponents.length === 0 ? (
            <Box sx={{ py: 4 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                {t("componentBrowser.noResults")}
              </Typography>
            </Box>
          ) : (
            <ComponentGroupList
              components={filteredComponents}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onShowInTopDown={(componentId) => navigate("/plant", { state: { showComponentId: componentId } })}
              maxHeight={520}
            />
          )}
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={Boolean(selectedComponent)}
        onClose={() => setSelectedId(null)}
        PaperProps={{ sx: { width: { xs: 320, sm: 380 }, p: 2 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {selectedComponent?.name ?? t("componentDetails.liveStatus")}
          </Typography>
          <IconButton size="small" onClick={() => setSelectedId(null)} aria-label={t("common.closeDetails")}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 1.5 }} />
        <ComponentDetails
          component={selectedComponent ?? undefined}
          latestStoredEntry={selectedStoredEntry}
          latestStoredLoading={latestStoredQuery.isLoading}
          latestStoredError={latestStoredQuery.error?.message}
          stats={selectedStatsQuery.data}
          statsLoading={selectedStatsQuery.isLoading}
          statsError={selectedStatsQuery.error?.message}
          history={selectedHistoryQuery.data}
          historyLoading={selectedHistoryQuery.isLoading}
          historyError={selectedHistoryQuery.error?.message}
        />
      </Drawer>
    </Box>
  );
}
