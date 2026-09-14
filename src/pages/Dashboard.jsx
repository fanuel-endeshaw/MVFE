import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
// import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
// import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlinedIcon";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
// import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const drawerWidth = 220;

export default function Dashboard() {
  const { logout } = useAuth();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        path: "/dashboard",
        icon: <DashboardOutlinedIcon sx={{ color: "black" }} />,
      },
      {
        id: "users",
        label: "Employees",
        path: "/dashboard/users",
        icon: <GroupOutlinedIcon sx={{ color: "black" }} />,
      },
      {
        id: "userManagment",
        label: "User Managment",
        path: "/dashboard/userManagment",
        icon: <PersonAddAlt1OutlinedIcon sx={{ color: "black" }} />,
      },
      // {
      //   id: "cluster",
      //   label: "New Cluster",
      //   path: "/dashboard/cluster",
      //   icon: <GroupsOutlinedIcon sx={{ color: "black" }} />,
      // },
      {
        id: "todayScanned",
        label: "Today scanned",
        path: "/dashboard/today-scanned",
        icon: <QrCodeScannerIcon sx={{ color: "black" }} />,
      },
      {
        id: "report",
        label: "Report",
        path: "/dashboard/report",
        icon: <SummarizeOutlinedIcon sx={{ color: "black" }} />,
      },
    ],
    [],
  );

  const activeTab = useMemo(() => {
    if (pathname.startsWith("/dashboard/users")) return "users";
    if (pathname.startsWith("/dashboard/userManagment")) return "userManagment";
    if (pathname.startsWith("/dashboard/today-scanned")) return "todayScanned";
    if (pathname.startsWith("/dashboard/report")) return "report";
    // if (pathname.startsWith("/dashboard/cluster")) return "cluster";
    return "overview";
  }, [pathname]);

  const handleNavChange = (path) => {
    setMobileDrawerOpen(false);
    navigate(path);
  };

  const navigationContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: "#004d40",
        height: "100vh",
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
            letterSpacing: 0.6,
            // lineSpacing: 0.2,
            color: "#ffffffff",
            fontSize: 34,
          }}
        >
          MIG Verify
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontWeight: 500, color: "white", mt: 1 }}
        >
          ADMIN CONTROL
        </Typography>
      </Box>
      <List sx={{ marginTop: 5 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={activeTab === item.id}
            onClick={() => handleNavChange(item.path)}
            sx={{
              marginTop: 1,
              color: "white",
              "&.Mui-selected": {
                borderLeft: "7px solid #ffffffff",
                bgcolor: "#ffffff59",
              },
              "&:hover": {
                bgcolor: "#ffffff25", // Faint white background on hover
                // color: "#ffffff",
              },
            }}
          >
            <ListItemIcon sx={{ "& svg": { color: "#ffffffff !important" } }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              sx={{
                "& .MuiListItemText-primary": {
                  fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
                  color: "#ffffffff",
                },
              }}
              primary={item.label}
            />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: "auto", p: 2 }}>
        <Button
          fullWidth
          startIcon={<LogoutOutlinedIcon />}
          onClick={logout}
          sx={{ color: "white" }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          display: { xs: "block", md: "none" },
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileDrawerOpen(true)}
            sx={{ mr: 1 }}
          >
            <MenuOutlinedIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Lilita One", "Inter", "Segoe UI", sans-serif',
              letterSpacing: 0.4,
            }}
          >
            MIG Verify
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          display: { xs: "none", md: "block" },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: 0,
          },
        }}
      >
        {navigationContent}
      </Drawer>

      <Drawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        variant="temporary"
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: Math.min(drawerWidth, 260),
            boxSizing: "border-box",
          },
        }}
      >
        {navigationContent}
      </Drawer>

      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
        {isMobile ? <Toolbar /> : null}
        <Outlet />
      </Box>
    </Box>
  );
}
