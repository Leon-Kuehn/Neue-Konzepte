import { useState } from "react";
import type { ReactNode } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FactoryIcon from "@mui/icons-material/Factory";
import SettingsInputAntennaIcon from "@mui/icons-material/SettingsInputAntenna";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import DescriptionIcon from "@mui/icons-material/Description";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useAppPreferences } from "../context/AppPreferencesContext";
import BackendStatus from "./BackendStatus";
import SimulationStatusChip from "./SimulationStatusChip";
import OllamaAssistantButton from "./OllamaAssistantButton";
import OllamaAssistantPanel from "./OllamaAssistantPanel";

const DRAWER_WIDTH = 240;

export default function MainLayout() {
  const theme = useTheme();
  const { t } = useAppPreferences();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: t("nav.topDownView"), path: "/plant", icon: <FactoryIcon /> },
    { label: t("nav.componentBrowser"), path: "/components", icon: <FactoryIcon /> },
    { label: t("nav.highBayStorage"), path: "/hochregallager", icon: <ViewModuleIcon /> },
    { label: t("nav.plantControl"), path: "/plant-control", icon: <PlayCircleOutlineIcon /> },
    { label: t("nav.documentation"), path: "/docs", icon: <DescriptionIcon /> },
  ];

  const settingsNavItem = {
    label: t("nav.settings"),
    path: "/mqtt",
    icon: <SettingsInputAntennaIcon />,
  };

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) setDrawerOpen(false);
  };

  const renderNavItem = (item: { label: string; path: string; icon: ReactNode }) => (
    <ListItemButton
      key={item.path}
      selected={location.pathname === item.path}
      onClick={() => handleNav(item.path)}
      sx={{
        "&.Mui-selected": {
          backgroundColor: "action.selected",
          borderRight: "3px solid",
          borderRightColor: "primary.main",
        },
      }}
    >
      <ListItemIcon sx={{ color: location.pathname === item.path ? "primary.main" : undefined }}>
        {item.icon}
      </ListItemIcon>
      <ListItemText primary={item.label} />
    </ListItemButton>
  );

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar />
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <List>{navItems.map((item) => renderNavItem(item))}</List>
        <List sx={{ mt: "auto", pb: 2 }}>{renderNavItem(settingsNavItem)}</List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: "primary.main",
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <FactoryIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
            {t("app.title")}
          </Typography>
          <Typography
            variant="body2"
            component="a"
            href="https://dhbw-loerrach.de/home"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              ml: 2,
              opacity: 0.85,
              color: "inherit",
              textDecoration: "none",
              cursor: "pointer",
              "&:hover": {
                textDecoration: "underline",
                opacity: 1,
              },
            }}
          >
            {t("app.subtitle")}
          </Typography>
          <Box sx={{ ml: "auto" }}>
            <SimulationStatusChip />
            <BackendStatus />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Navigation */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: isMobile ? 0 : undefined,
          maxWidth: "100%",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>

      <OllamaAssistantButton
        open={assistantOpen}
        onToggle={() => setAssistantOpen((current) => !current)}
      />
      <OllamaAssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </Box>
  );
}
