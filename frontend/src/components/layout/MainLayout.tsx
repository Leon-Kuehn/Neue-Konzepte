import { useState } from "react";
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

const DRAWER_WIDTH = 240;

const navItems = [
  { label: "Plant Overview", path: "/plant", icon: <FactoryIcon /> },
  { label: "Component Browser", path: "/components", icon: <FactoryIcon /> },
  { label: "MQTT Settings", path: "/mqtt", icon: <SettingsInputAntennaIcon /> },
];

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) setDrawerOpen(false);
  };

  const drawerContent = (
    <Box sx={{ mt: 8 }}>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleNav(item.path)}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "rgba(227, 6, 19, 0.08)",
                borderRight: "3px solid #E30613",
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? "#E30613" : undefined }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: "#E30613",
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
            IoT Plant Admin
          </Typography>
          <Typography variant="body2" sx={{ ml: 2, opacity: 0.85 }}>
            DHBW Lörrach
          </Typography>
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
    </Box>
  );
}
