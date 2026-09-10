import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 6 },
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          borderRadius: 8,
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e0e0e0",
        }}
      >
        <Stack
          spacing={3}
          sx={{ alignItems: "center", justifyContent: "center" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "rgba(0, 51, 44, 0.05)",
              color: "#00332c",

              overflow: "hidden",
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 40 }} />
          </Box>

          <Stack spacing={1} alignItems="center">
            <Typography
              variant="h1"
              fontWeight={900}
              sx={{ color: "#00332c", lineHeight: 1, fontSize: "4.5rem" }}
            >
              404
            </Typography>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Page Not Found
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 360, mx: "auto" }}
            >
              The page you are looking for might have been removed, had its name
              changed, or is temporarily unavailable.
            </Typography>
          </Stack>

          <Button
            variant="contained"
            disableElevation
            onClick={() => navigate("/dashboard")}
            sx={{
              backgroundColor: "#00332c",
              color: "#ffffff",
              px: 4,
              py: 1.2,
              borderRadius: 20,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              transition: "all 0.2s ease-in-out",
              width: "100%",
              maxWidth: 320,
              "&:hover": {
                backgroundColor: "#004d43",
                transform: "translateY(-1px)",
                boxShadow: "0px 4px 12px rgba(0, 51, 44, 0.2)",
              },
            }}
          >
            Return to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
