import { Box, Card, CardContent, Typography } from "@mui/material";

export type KpiSummaryItem = {
  label: string;
  value: string;
  hint?: string;
};

interface KpiSummaryBarProps {
  items: KpiSummaryItem[];
}

export default function KpiSummaryBar({ items }: KpiSummaryBarProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
        },
      }}
    >
      {items.map((item) => (
        <Card key={item.label} variant="outlined" sx={{ height: "100%" }}>
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.15 }}>
              {item.value}
            </Typography>
            {item.hint && (
              <Typography variant="caption" color="text.secondary">
                {item.hint}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
