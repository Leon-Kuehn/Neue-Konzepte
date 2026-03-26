import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Category, PlantComponent } from "../types/PlantComponent";
import { useAppPreferences } from "../context/AppPreferencesContext";
import type { TranslationKey } from "../i18n";
import LiveStatusChips from "./LiveStatusChips";
import ComponentCategoryIcon from "./ComponentCategoryIcon";

type GroupDefinition = {
  category: Category;
  labelKey: TranslationKey;
  defaultExpanded?: boolean;
};

const GROUPS: GroupDefinition[] = [
  { category: "conveyor", labelKey: "group.conveyor", defaultExpanded: true },
  { category: "rotating-conveyor", labelKey: "group.rotating-conveyor", defaultExpanded: true },
  { category: "press", labelKey: "group.press" },
  { category: "pusher", labelKey: "group.pusher", defaultExpanded: true },
  { category: "inductive-sensor", labelKey: "group.inductive-sensor", defaultExpanded: true },
  { category: "rfid-sensor", labelKey: "group.rfid-sensor", defaultExpanded: true },
  { category: "optical-sensor", labelKey: "group.optical-sensor", defaultExpanded: true },
  { category: "pneumatic-unit", labelKey: "group.pneumatic-unit" },
  { category: "crane", labelKey: "group.crane" },
  { category: "storage", labelKey: "group.storage" },
  { category: "deposit-place", labelKey: "group.deposit-place", defaultExpanded: true },
  { category: "input", labelKey: "group.input", defaultExpanded: true },
];

interface Props {
  components: PlantComponent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onShowInTopDown?: (id: string) => void;
  maxHeight?: number | string;
}

export default function ComponentGroupList({
  components,
  selectedId,
  onSelect,
  onShowInTopDown,
  maxHeight = 360,
}: Props) {
  const { t } = useAppPreferences();
  const [expanded, setExpanded] = useState<string[]>(
    GROUPS.filter((g) => g.defaultExpanded).map((g) => g.category)
  );

  const grouped = useMemo(() => {
    const byCategory = new Map<Category, PlantComponent[]>();
    GROUPS.forEach((g) => byCategory.set(g.category, []));

    components.forEach((component) => {
      byCategory.get(component.category)?.push(component);
    });

    return GROUPS.map((group) => ({
      ...group,
      items: byCategory.get(group.category) ?? [],
    })).filter((group) => group.items.length > 0);
  }, [components]);

  useEffect(() => {
    if (!selectedId) return;
    const selected = components.find((c) => c.id === selectedId);
    if (!selected) return;

    setExpanded((prev) =>
      prev.includes(selected.category) ? prev : [...prev, selected.category]
    );
  }, [components, selectedId]);

  return (
    <Box sx={{ maxHeight, overflowY: "auto", pr: 0.5 }}>
      {grouped.map((group) => {
        const isExpanded = expanded.includes(group.category);

        return (
          <Accordion
            key={group.category}
            expanded={isExpanded}
            disableGutters
            onChange={(_, nextExpanded) => {
              setExpanded((prev) =>
                nextExpanded
                  ? [...prev, group.category]
                  : prev.filter((item) => item !== group.category)
              );
            }}
            sx={{
              mb: 1,
              border: "1px solid #ececec",
              borderRadius: "8px !important",
              boxShadow: "none",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ minHeight: 42, "& .MuiAccordionSummary-content": { my: 0.5 } }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" fontWeight={700}>
                  {t(group.labelKey)}
                </Typography>
                <Chip label={group.items.length} size="small" variant="outlined" />
                <Chip
                  label={`${group.items.filter((item) => item.online).length} ${t("componentDetails.online")}`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0.5, pb: 1 }}>
              <List dense disablePadding>
                {group.items.map((component) => {
                  const isSelected = component.id === selectedId;
                  const lastChanged = new Date(component.lastChanged).toLocaleString();

                  return (
                    <ListItemButton
                      key={component.id}
                      onClick={() => onSelect(component.id)}
                      selected={isSelected}
                      sx={{
                        mb: 0.75,
                        border: "1px solid",
                        borderColor: isSelected ? "primary.main" : "transparent",
                        borderRadius: 1.5,
                        bgcolor: isSelected ? "action.selected" : "transparent",
                        alignItems: "stretch",
                        px: 1,
                        py: 0.75,
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <Box sx={{ display: "grid", gridTemplateColumns: "56px minmax(0, 1fr)", gap: 1, width: "100%" }}>
                        <Box
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            bgcolor: "background.paper",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: 42,
                            overflow: "hidden",
                          }}
                        >
                          <ComponentCategoryIcon category={component.category} active={component.status === "on"} />
                        </Box>

                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                              <Typography variant="body2" fontWeight={700}>
                                {component.name}
                              </Typography>
                              <Chip label={t(group.labelKey)} size="small" variant="outlined" />
                            </Stack>
                          }
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 0.35 }}>
                              <Typography variant="caption" color="text.secondary">
                                {component.id}
                              </Typography>
                              <LiveStatusChips status={component.status} online={component.online} />
                              <Typography variant="caption" color="text.secondary">
                                {t("componentDetails.lastChanged")}: {lastChanged}
                              </Typography>
                              {onShowInTopDown && (
                                <Box>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      onShowInTopDown(component.id);
                                    }}
                                  >
                                    {t("componentBrowser.showInTopDown")}
                                  </Button>
                                </Box>
                              )}
                            </Stack>
                          }
                        />
                      </Box>
                    </ListItemButton>
                  );
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
