import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  Stack,
  Paper,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
} from "@mui/material";
import { useAuth } from "../auth/useAuth";
import HubIcon from "@mui/icons-material/Hub";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"; // Uncomment if needed

// Adjust this base URL to match your backend environment configuration
const API_BASE_URL = "http://localhost:5000/api";

export default function NewCluster() {
  // 1. Database State Management
  const [clusters, setClusters] = useState([]);
  const [clusterName, setClusterName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { token } = useAuth();

  // 2. Fetch clusters on Component Mount
  const fetchAvailableClusters = async () => {
    try {
      setError("");
      // Add authentication token headers if your verifyAdmin middleware checks authorization headers
      // const token = localStorage.getItem("token");

      const response = await apiClient.get(`/api/users/clusters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      // Maps your backend response: { message: "...", clusters: [...] }
      setClusters(data.clusters || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAvailableClusters();
  }, []);

  // 3. Register Cluster Event Handler
  const handleAddCluster = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = clusterName.trim();

    if (!cleanName) {
      setError("Cluster Name is strictly required.");
      return;
    }

    try {
      setIsLoading(true);

      // const token = localStorage.getItem("token");

      // Payload maps directly to your backend controller structural expectation: { cluster_name }
      const response = await apiClient.post(`/api/users/clusters`, { cluster_name: cleanName }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      setSuccess(`Successfully registered ${cleanName}!`);
      setClusterName(""); // Clear field on success

      // Refresh the UI list with latest database rows
      fetchAvailableClusters();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Note: Delete route doesn't exist on backend yet, keeping UI structure placeholder
  const handleDelete = (id) => {
    setError(
      "Delete cluster functionality is not implemented on the backend yet.",
    );
  };

  return (
    <Box sx={{ p: 2, fontFamily: '"Outfit", sans-serif' }}>
      <Box sx={{ maxWidth: 1200 }}>
        {/* PAGE HEADER */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
            letterSpacing: 0.6,
            color: "#004d40",
            fontWeight: 700,
            mb: 2,
          }}
          mb={3}
        >
          Cluster Management
        </Typography>

        {/* MESSAGES/ALERTS */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, fontFamily: '"Outfit", sans-serif' }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2, fontFamily: '"Outfit", sans-serif' }}
          >
            {success}
          </Alert>
        )}

        {/* SPLIT VIEW LAYOUT */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={3}
          alignItems="stretch"
        >
          {/* LEFT COLUMN: ADD CLUSTER FORM */}
          <Paper
            component="form"
            onSubmit={handleAddCluster}
            sx={{
              flex: 4,
              p: 3,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              height: "fit-content",
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#004d40", fontWeight: 600, mb: -1 }}
            >
              Add New Cluster Group
            </Typography>

            <TextField
              label="Cluster Name"
              placeholder="e.g., Cluster E (Asia-East)"
              required
              fullWidth
              disabled={isLoading}
              value={clusterName}
              onChange={(e) => setClusterName(e.target.value)}
              InputLabelProps={{ sx: { fontFamily: '"Outfit", sans-serif' } }}
              InputProps={{ sx: { fontFamily: '"Outfit", sans-serif' } }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={<HubIcon />}
              sx={{
                backgroundColor: "#004d40",
                fontFamily: '"Outfit", sans-serif',
                textTransform: "none",
                py: 1.2,
                fontSize: "1rem",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#00332c" },
              }}
            >
              {isLoading ? "Registering..." : "Register Cluster"}
            </Button>
          </Paper>

          {/* RIGHT COLUMN: REVIEWS CURRENT REGISTERED CLUSTERS */}
          <Paper sx={{ flex: 6, p: 3, borderRadius: 2 }}>
            <Typography
              variant="h6"
              sx={{ color: "#004d40", fontWeight: 600, mb: 2 }}
            >
              Clusters ({clusters.length})
            </Typography>

            <TableContainer
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                // backgroundColor: "red",
              }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <Typography component="th" sx={{ display: "none" }} />
                    <TableCell
                      sx={{
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: "bold",
                      }}
                    >
                      Cluster Name
                    </TableCell>
                    {/* <TableCell
                      sx={{
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: "bold",
                      }}
                    >
                      Database Row ID
                    </TableCell> */}
                    <TableCell
                      align="center"
                      sx={{
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: "bold",
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clusters.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align="center"
                        sx={{
                          fontFamily: '"Outfit", sans-serif',
                          py: 4,
                          color: "#888",
                        }}
                      >
                        No clusters added yet. Complete the form to establish
                        one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    clusters.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ minWidth: 200 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontFamily: '"Outfit", sans-serif',
                              fontWeight: 500,
                            }}
                          >
                            {row.cluster_name || row.name}
                          </Typography>
                        </TableCell>
                        {/* <TableCell>
                          <Chip
                            label={`ID: ${row.id}`}
                            size="small"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 600,
                              backgroundColor: "#e0f2f1",
                              color: "#004d40",
                            }}
                          />
                        </TableCell> */}
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleDelete(row.id)}
                            color="error"
                            size="small"
                          >
                            {/* <DeleteOutlineIcon /> */}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
