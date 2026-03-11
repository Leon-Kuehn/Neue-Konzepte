import { Typography, type TypographyProps } from "@mui/material";

interface PageHeaderProps extends Omit<TypographyProps, "variant" | "fontWeight"> {
  children: React.ReactNode;
}

export default function PageHeader({ children, ...rest }: PageHeaderProps) {
  return (
    <Typography variant="h4" fontWeight={700} gutterBottom {...rest}>
      {children}
    </Typography>
  );
}
