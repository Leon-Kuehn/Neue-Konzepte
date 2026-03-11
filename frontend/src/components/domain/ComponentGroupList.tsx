import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Category, PlantComponent } from "../../types/PlantComponent";
import { StatusChip, OnlineChip } from "../common/StatusChips";

type GroupDefinition = {
  category: Category;
  label: string;
  defaultExpanded?: boolean;
};

const GROUPS: GroupDefinition[] = [
  { category: "conveyor", label: "Conveyors", defaultExpanded: true },
  { category: "rotating-conveyor", label: "Rotating Conveyors", defaultExpanded: true },
  { category: "press", label: "Presses" },
  { category: "inductive-sensor", label: "Inductive Sensors", defaultExpanded: true },
  { category: "rfid-sensor", label: "RFID Sensors", defaultExpanded: true },
  { category: "optical-sensor", label: "Optical Sensors", defaultExpanded: true },
  { category: "pneumatic-unit", label: "Pneumatic Units" },
  { category: "crane", label: "Crane" },
  { category: "storage", label: "Storage" },
  { category: "input", label: "Input", defaultExpanded: true },
];

interface Props {
  components: PlantComponent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  maxHeight?: number | string;
}

export default function ComponentGroupList({
  components,
  selectedId,
  onSelect,
  maxHeight = 360,
}: Props) {
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
                  {group.label}
                </Typography>
                <Chip label={group.items.length} size="small" variant="outlined" />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0.5, pb: 1 }}>
              <List dense disablePadding>
                {group.items.map((component) => {
                  const isSelected = component.id === selectedId;

                  return (
                    <ListItemButton
                      key={component.id}
                      onClick={() => onSelect(component.id)}
                      selected={isSelected}
                      sx={{
                        mb: 0.5,
                        border: isSelected ? "1px solid #E30613" : "1px solid transparent",
                        borderRadius: 1,
                        bgcolor: isSelected ? "rgba(227, 6, 19, 0.08)" : "transparent",
                        alignItems: "flex-start",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {component.name}
                          </Typography>
                        }
                        secondary={
                          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                            <Chip label={component.id} size="small" variant="outlined" />
                            <StatusChip status={component.status} />
                            <OnlineChip online={component.online} />
                          </Stack>
                        }
                      />
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
