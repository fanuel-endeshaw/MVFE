import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { decodeToken } from "../auth/session";

export default function AdminProfile() {
  const admin = decodeToken();

  // fallback if token missing
  const name = admin?.name || admin?.full_name || "Admin User";
  const email = admin?.email || "No email";
  const role = admin?.role || "System Administrator";

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Admin Profile
        </Typography>

        <Typography color="text.secondary">
          Access identity and account details for the signed-in administrator.
        </Typography>

        <Divider />

        {/* HEADER */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "primary.main",
              fontSize: 24,
            }}
          >
            {name?.charAt(0).toUpperCase()}
          </Avatar>

          <Box>
            <Typography variant="h6" fontWeight={700}>
              {name}
            </Typography>
            <Typography color="text.secondary">{email}</Typography>
          </Box>
        </Stack>

        {/* DETAILS */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Role
                </Typography>
                <Typography fontWeight={700}>{role}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Token Expiry
                </Typography>
                <Typography fontWeight={700}>
                  {admin?.exp
                    ? new Date(admin.exp * 1000).toLocaleString()
                    : "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
}
