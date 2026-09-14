import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useEffect, useState } from "react";
import { fetchCount, fetchUsers } from "../auth/session";
import { useAuth } from "../auth/useAuth";
import AppShortcutOutlinedIcon from "@mui/icons-material/AppShortcutOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined";

export default function Overview() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [todayScans, setTodayScans] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const handleDownloadAPK = () => {
    // Replace with your actual hosted APK location or endpoint route
    const apkUrl = "/downloads/mig-verify-verifier.apk";

    const link = document.createElement("a");
    link.href = apkUrl;
    link.setAttribute("download", "MIG_Verify_Verifier.apk");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    const loadUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchUsers(token);
        const list = data?.user || data || [];
        if (mounted) setUsers(list);

        const data2 = await fetchCount(token);

        // handle different API response structures
        const count = data2 ?? data2?.todayScans ?? data2?.total ?? 0;

        setTodayScans(Number(count));
      } catch (e) {
        if (mounted) {
          setError(e?.message || "Failed to load overview data.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [token]);

  const totalUsers = users.length;

  return (
    <Stack
      spacing={8}
      sx={{
        alignItems: "center",
        height: "90vh",
      }}
    >
      <Box>
        <Typography
          variant="h4"
          fontWeight={600}
          sx={{
            fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
            letterSpacing: 0.6,
            color: "#004d40",
            fontWeight: 700,
          }}
        >
          System Overview
        </Typography>

        {loading ? (
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", mt: 2 }}
          >
            <CircularProgress color="#004d40" size={24} />
            <Typography
              color="text.secondary"
              sx={{ fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif' }}
            >
              Loading...
            </Typography>
          </Stack>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {[
              {
                label: "Total Employees",
                value: totalUsers || 0,
                icon: (
                  <GroupOutlinedIcon sx={{ color: "#004d40", fontSize: 26 }} />
                ),
                accentColor: "#004d40",
                bgGradient:
                  "linear-gradient(135deg, rgba(0, 77, 64, 0.06) 0%, rgba(0, 77, 64, 0.01) 100%)",
              },
              {
                label: "Today Scans",
                value: todayScans || 0,
                icon: (
                  <QrCodeScannerOutlinedIcon
                    sx={{ color: "#2e7d32", fontSize: 26 }}
                  />
                ),
                accentColor: "#2e7d32",
                bgGradient:
                  "linear-gradient(135deg, rgba(46, 125, 50, 0.06) 0%, rgba(46, 125, 50, 0.01) 100%)",
              },
            ].map((card) => (
              <Grid key={card.label} item xs={12} sm={6} lg={5}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    background: card.bgGradient,
                    border: "1px solid",
                    borderColor: alpha(card.accentColor, 0.15),
                    position: "relative",
                    overflow: "hidden",
                    backdropFilter: "blur(6px)",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: alpha(card.accentColor, 0.35),
                      boxShadow: `0 10px 24px -4px ${alpha(card.accentColor, 0.15)}`,
                    },
                    //   "&::before": {
                    //     content: '""',
                    //     position: "absolute",
                    //     top: 0,
                    //     left: 0,
                    //     width: "100%",
                    //     height: "3px",
                    //     backgroundColor: card.accentColor,
                    //   },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      mb={2}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: alpha(card.accentColor, 0.1),
                          border: `1px solid ${alpha(card.accentColor, 0.18)}`,
                        }}
                      >
                        {card.icon}
                      </Box>
                    </Stack>
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                        mb: 0.5,
                      }}
                    >
                      {card.label}
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
                        fontWeight: 800,
                        color: card.accentColor,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {card.value.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/*  */}

      <Card
        elevation={0}
        sx={{
          border: "1px dashed #004d40",
          backgroundColor: "#f0f7f6",
          // border: "1px solid",
          // borderColor: alpha("#004d40", 0.2),
          // background:
          //   "linear-gradient(135deg, rgba(240, 247, 246, 0.95) 0%, rgba(224, 242, 241, 0.5) 100%)",
          // backdropFilter: "blur(8px)",
          // borderRadius: 4,
          height: 150,
          display: "flex",
          alignItems: "center",
          position: "absolute",
          bottom: 10,
          right: 10,
          boxShadow: "0 8px 20px rgba(0, 77, 64, 0.08)",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 12px 28px rgba(0, 77, 64, 0.14)",
            borderColor: alpha("#004d40", 0.35),
          },
        }}
      >
        <CardContent sx={{ width: "100%" }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 2, alignItems: "center" }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha("#004d40", 0.1),
                border: `1px solid ${alpha("#004d40", 0.15)}`,
              }}
            >
              <AppShortcutOutlinedIcon
                sx={{ color: "#004d40", fontSize: 26 }}
              />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
                  fontWeight: 700,
                  color: "#004d40",
                  lineHeight: 1.2,
                }}
              >
                Verifier App
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
                  fontSize: "0.75rem",
                  display: "block",
                  mt: 0.25,
                }}
              >
                Scan & verify identities on mobile devices
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            fullWidth
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={handleDownloadAPK}
            disableElevation
            sx={{
              backgroundColor: "#004d40",
              fontFamily: '"Outfit", sans-serif',
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              py: 1,
              boxShadow: "0 4px 12px rgba(0, 77, 64, 0.25)",
              "&:hover": {
                backgroundColor: "#00332c",
                boxShadow: "0 6px 16px rgba(0, 77, 64, 0.35)",
              },
            }}
          >
            Download APK
          </Button>
        </CardContent>
      </Card>
    </Stack>
  );
}
