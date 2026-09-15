import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Stack,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
// import { BASE_URL } from "../config";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import apiClient from "../api/apiClient";

const ROWS_PER_PAGE = 10;
const outfitFont = {
  fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
};

export default function TodayScanned() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  // const BASE_URL = process.env.BASE_URL;
  // console.log(BASE_URL);
  const { token } = useAuth();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const columns = [
    { field: "user_name", headerName: "Full Name", flex: 1, minWidth: 150 },
    { field: "id_number", headerName: "Employee ID", flex: 1, minWidth: 130 },
    { field: "phone_number", headerName: "Phone number", flex: 1, minWidth: 150 },
    { field: "cluster", headerName: "cluster", flex: 1, minWidth: 130 },
    { field: "verified_at", headerName: "Scanned At", flex: 1, minWidth: 180 },
  ];

  //dateformat
  const formatDateTime = (dateString) => {
    if (!dateString || dateString === "-") return "-";

    const date = new Date(dateString);

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  //fetching logic (be)
  useEffect(() => {
    let active = true;

    const fetchScanned = async () => {
      try {
        setLoading(true);

        const res = await apiClient.get(
          `/api/history/today-scans`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = res.data;

        const normalized = (result.users || result || []).map((s, i) => ({
          id: s.id || i,
          user_name: s.user_name || s.name || "Unknown",
          phone_number: s.phone_number || "N/A",
          id_number: s.id_number || "N/A",
          cluster: s.cluster || "N/A",
          verified_at: formatDateTime(s.verified_at || s.created_at || "-"),
        }));
        console.log(normalized);
        if (active) setData(normalized);
      } catch (err) {
        if (active) setError(err.response?.data?.message || err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchScanned();

    return () => {
      active = false;
    };
  }, [token]);

  // ==========================

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h4"
        sx={{
          fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
          letterSpacing: 0.6,
          color: "#004d40",
          fontWeight: 700,
        }}
        mb={2}
      >
        Today Scanned Users
      </Typography>

      <Paper>
        {/* LOADING */}
        {loading && (
          <Stack
            direction="row"
            sx={{ padding: 2, mt: 1, alignItems: "center" }}
            spacing={1}
          >
            <CircularProgress sx={{ color: "black" }} size={18} />
            <Typography variant="caption" sx={{ ...outfitFont }}>
              Fetching data...
            </Typography>
          </Stack>
        )}

        {/* ERROR */}
        {error && (
          <Alert sx={{ padding: 1, mt: 1 }} severity="error">
            {error}
          </Alert>
        )}

        {/* EMPTY */}
        {!loading && !error && data.length === 0 && (
          <Box sx={{ padding: 2, mt: 1, textAlign: "center" }}>
            <Typography color="text.secondary" sx={{ ...outfitFont }}>
              No scans found for today
            </Typography>
          </Box>
        )}

        {/* DATAGRID */}
        {!error && data.length > 0 && (
          <Box sx={{ width: "100%", mt: 1 }}>
            <DataGrid
              autoHeight
              rows={data}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: ROWS_PER_PAGE },
                },
              }}
              pageSizeOptions={[5, 10, 20]}
              disableRowSelectionOnClick
              sx={{
                "& .MuiDataGrid-cell": outfitFont,
                "& .MuiDataGrid-columnHeaders": { ...outfitFont, fontWeight: 700 },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
