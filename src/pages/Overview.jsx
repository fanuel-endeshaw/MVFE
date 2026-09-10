import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { fetchCount, fetchUsers } from "../auth/session";
import { useAuth } from "../auth/useAuth";
import AppShortcutOutlinedIcon from "@mui/icons-material/AppShortcutOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

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

        // const data2 = await fetchCount(token);

        // console.log(data2);

        // setTodayScans(data2);
        const data2 = await fetchCount(token);

        // console.log("TODAY SCANS:", data2);

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

  // const todayScans = useMemo(
  //   () => users.reduce((total, item) => total + (item.scans || 0), 0),
  //   [users],
  // );

  const totalUsers = users.length;

  return (
    <Stack
      spacing={8}
      sx={{
        // justifyContent: "space-between",
        alignItems: "center",
        height: "90vh",
        // bgcolor: "red",
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
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {[
              { label: "Total Employees", value: totalUsers || 0 },
              { label: "Today Scans", value: todayScans || 0 },
              // check
              // future cards can be added .
            ].map((card) => (
              <Grid key={card.label} xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
                      }}
                    >
                      {card.label}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      {card.value}
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
        sx={{
          border: "1px dashed #004d40",
          backgroundColor: "#f0f7f6",
          // height: "100%",
          height: 150,
          display: "flex",
          alignItems: "center",
          position: "absolute",
          bottom: 10,
          right: 10,
        }}
      >
        <CardContent sx={{ width: "100%" }}>
          <Stack
            direction="row"
            spacing={2}
            // alignItems="center"
            sx={{ mb: 2, alignItems: "center" }}
          >
            <AppShortcutOutlinedIcon sx={{ color: "#004d40", fontSize: 40 }} />
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
                  fontWeight: 600,
                  color: "#004d40",
                }}
              >
                Verifier App
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
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
            sx={{
              backgroundColor: "#004d40",
              fontFamily: '"Outfit", sans-serif',
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              py: 1,
              "&:hover": { backgroundColor: "#00332c" },
            }}
          >
            Download APK
          </Button>
        </CardContent>
      </Card>
    </Stack>
  );
}
