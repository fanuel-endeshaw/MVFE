import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Pagination,
  Stack,
  Alert,
} from "@mui/material";
// import { BASE_URL } from "../config";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";

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
  const [page, setPage] = useState(1);

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

        const res = await fetch(
          // "http://192.168.1.79:5000/api/history/today-scans",
          `${BASE_URL}/api/history/today-scans`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await res.json();

        // console.log(result);

        if (!res.ok) {
          throw new Error(result.message || "Failed to fetch");
        }

        const normalized = (result.users || result || []).map((s, i) => ({
          id: s.id || i,
          user_name: s.user_name || s.name || "Unknown",
          phone_number: s.phone_number || "N/A",
          id_number: s.id_number || "N/A",
          cluster: s.cluster || "N/A",
          verified_at: s.verified_at || s.created_at || "-",
        }));
        console.log(normalized);
        if (active) setData(normalized);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchScanned();

    return () => {
      active = false;
    };
  }, [token]);

  // paginations

  const paginatedData = useMemo(() => {
    return data.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  }, [data, page]);

  // console.log("*****************paginated****************");
  // console.log(paginatedData);
  // console.log("*****************paginated****************");
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

        {/* TABLE */}
        {!error && data.length > 0 && (
          <>
            <TableContainer sx={{ mt: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        ...outfitFont,
                        fontWeight: 700,
                      }}
                    >
                      Full Name
                    </TableCell>

                    <TableCell
                      sx={{
                        ...outfitFont,
                        fontWeight: 700,
                      }}
                    >
                      Employee ID
                    </TableCell>
                    <TableCell
                      sx={{
                        ...outfitFont,
                        fontWeight: 700,
                      }}
                    >
                      Phone number
                    </TableCell>
                    <TableCell
                      sx={{
                        ...outfitFont,
                        fontWeight: 700,
                      }}
                    >
                      cluster
                    </TableCell>

                    <TableCell
                      sx={{
                        ...outfitFont,
                        fontWeight: 700,
                      }}
                    >
                      Scanned At
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedData.map((row) => (
                    <TableRow hover key={row.id}>
                      <TableCell sx={outfitFont}>{row.user_name}</TableCell>

                      <TableCell sx={outfitFont}>{row.id_number}</TableCell>
                      <TableCell sx={outfitFont}>{row.phone_number}</TableCell>
                      <TableCell sx={outfitFont}>{row.cluster}</TableCell>

                      <TableCell sx={outfitFont}>
                        {formatDateTime(row.verified_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* PAGINATION */}
            <Stack
              direction="row"
              // justifyContent="space-between"
              sx={{
                padding: 1,
                alignItems: "center",
                // justifyContent: "center",
              }}
            >
              <Typography variant="caption">Total: {data.length}</Typography>

              <Pagination
                count={Math.ceil(data.length / ROWS_PER_PAGE)}
                page={page}
                onChange={(_, v) => setPage(v)}
              />
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
}
