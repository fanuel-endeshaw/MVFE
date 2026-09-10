import {
  Alert,
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  Pagination,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

const outfitFont = {
  fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
};

export default function Report() {
  const { token } = useAuth();

  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================
  // FETCH REPORT
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
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      let endpoint = "";

      if (startDate) {
        endpoint = `${apiBaseUrl}/api/history/scans-by-date-range?page=${page}&startDate=${startDate}`;
        if (endDate) {
          endpoint += `&endDate=${endDate}`;
        }
      } else {
        if (endDate) {
          alert("Start date is required.");
          setEndDate("");
          return;
        }
        endpoint = `${apiBaseUrl}/api/history/all-scans/${page}`;
      }

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch report");
      }

      // console.log("time");
      // console.log(result.users);
      // console.log("time");
      const normalized = (result.users || []).map((r, i) => ({
        id: r.id || i,
        full_name: r.user_name || r.full_name || "Unknown",
        id_number: r.id_number || "N/A",
        cluster: r.cluster || "N/A",
        verified_at: r.verified_at || r.created_at || null,
        phone_number: r.phone_number || "",
      }));
      console.log("time");
      console.log(normalized);
      console.log("time");
      setData(normalized);
      setPages(result.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [page, startDate, endDate]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // STANDARD EXPORT
  const exportToExcel = async () => {
    try {
      setLoading(true);
      let allRows = [];

      if (startDate) {
        let endpoint = `${apiBaseUrl}/api/report/download?startDate=${startDate}`;
        if (endDate) endpoint += `&endDate=${endDate}`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        if (!res.ok) throw new Error(result.message || "Export failed");

        allRows = (result.users || []).map((r, i) => ({
          No: i + 1,
          Full_Name: r.user_name || r.full_name || "Unknown",
          Employee_ID: r.id_number || "N/A",
          Cluster: r.cluster || "N/A",
          Phone_Number: r.phone_number || "",
          Verified_At: r.verified_at
            ? new Date(r.verified_at).toLocaleString()
            : "Not Verified",
        }));
      } else {
        for (let currentPage = 1; currentPage <= page; currentPage++) {
          const endpoint = `${apiBaseUrl}/api/history/all-scans/${currentPage}`;
          const res = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await res.json();

          if (!res.ok) throw new Error(result.message || "Export failed");

          const normalized = (result.users || []).map((r, i) => ({
            No: allRows.length + i + 1,
            Full_Name: r.user_name || r.full_name || "Unknown",
            Employee_ID: r.id_number || "N/A",
            Cluster: r.cluster || "N/A",
            Phone_Number: r.phone_number || "",
            Verified_At: r.verified_at
              ? new Date(r.verified_at).toLocaleString()
              : "Not Verified",
          }));
          allRows = [...allRows, ...normalized];
        }
      }

      const worksheet = XLSX.utils.json_to_sheet(allRows);
      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 30 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 28 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const file = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      let fileName = `reports-page-1-to-${page}.xlsx`;
      if (startDate && endDate)
        fileName = `reports-${startDate}-to-${endDate}.xlsx`;
      else if (startDate) fileName = `reports-from-${startDate}.xlsx`;

      saveAs(file, fileName);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  //MATCHED EXPORT: EXACT FORMAT MATCHING
  // const exportGroupedByCluster = async () => {
  //   try {
  //     setLoading(true);
  //     setError("");

  //     let endpoint = `${apiBaseUrl}/api/history/grouped-by-cluster`;
  //     const queryParams = [];
  //     if (startDate) queryParams.push(`startDate=${startDate}`);
  //     if (endDate) queryParams.push(`endDate=${endDate}`);
  //     if (queryParams.length > 0) endpoint += `?${queryParams.join("&")}`;

  //     const res = await fetch(endpoint, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const result = await res.json();

  //     if (!res.ok)
  //       throw new Error(result.message || "Failed to fetch cluster groupings");

  //     const reportMatrix = [];

  //     // Column Headers Row Matching Structure
  //     reportMatrix.push([
  //       "Full Name",
  //       "Employee ID",
  //       "Cluster",
  //       "Phone Number",
  //       "Verified At",
  //     ]);

  //     result.clusters.forEach((block) => {
  //       block.records.forEach((row) => {
  //         reportMatrix.push([
  //           row.full_name,
  //           row.id_number,
  //           block.clusterName,
  //           row.phone_number,
  //           row.verified_at
  //             ? new Date(row.verified_at).toLocaleString()
  //             : "Not Verified",
  //         ]);
  //       });

  //       // SubTotal matching format (SubTotal in Phone Number, count value in Verified At)
  //       reportMatrix.push(["", "", "", "SubTotal", block.subtotal]);

  //       // Empty spacer row line
  //       reportMatrix.push(["", "", "", "", ""]);
  //     });

  //     // Grand Total matching format (Grand Total in Phone Number, aggregate count in Verified At)
  //     reportMatrix.push(["", "", "", "Grand Total", result.grandTotal]);

  //     const worksheet = XLSX.utils.aoa_to_sheet(reportMatrix);

  //     worksheet["!cols"] = [
  //       { wch: 30 }, // Full Name
  //       { wch: 20 }, // Employee ID
  //       { wch: 20 }, // Cluster
  //       { wch: 20 }, // Phone Number
  //       { wch: 28 }, // Verified At
  //     ];

  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(
  //       workbook,
  //       worksheet,
  //       "Detailed Cluster Summary",
  //     );

  //     const excelBuffer = XLSX.write(workbook, {
  //       bookType: "xlsx",
  //       type: "array",
  //     });
  //     const fileBlob = new Blob([excelBuffer], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });

  //     saveAs(fileBlob, "Detailed-Cluster-Report.xlsx");
  //   } catch (err) {
  //     alert(err.message || "Failed to generate cluster document summary.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // UPDATED EXPORT: CLUSTER SUMMARY WITH DYNAMIC FILENAME & DATE VALIDATION
  const exportGroupedByCluster = async () => {
    try {
      // Validate dates exactly like the default report view
      if (!startDate && endDate) {
        alert("Start date is required.");
        return;
      }

      setLoading(true);
      setError("");

      let endpoint = `${apiBaseUrl}/api/history/grouped-by-cluster`;
      const queryParams = [];
      if (startDate) queryParams.push(`startDate=${startDate}`);
      if (endDate) queryParams.push(`endDate=${endDate}`);
      if (queryParams.length > 0) endpoint += `?${queryParams.join("&")}`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (!res.ok)
        throw new Error(result.message || "Failed to fetch cluster groupings");

      const reportMatrix = [];

      // Column Headers Row Layout
      reportMatrix.push([
        "Full Name",
        "Employee ID",
        "Cluster",
        "Phone Number",
        "Verified At",
      ]);

      result.clusters.forEach((block) => {
        block.records.forEach((row) => {
          reportMatrix.push([
            row.full_name,
            row.id_number,
            block.clusterName,
            row.phone_number,
            row.verified_at
              ? new Date(row.verified_at).toLocaleString()
              : "Not Verified",
          ]);
        });

        // SubTotal alignment row matching your requested output
        reportMatrix.push(["", "", "", "SubTotal", block.subtotal]);

        // Empty visual spacer row line
        reportMatrix.push(["", "", "", "", ""]);
      });

      // Grand Total calculation summary line
      reportMatrix.push(["", "", "", "Grand Total", result.grandTotal]);

      const worksheet = XLSX.utils.aoa_to_sheet(reportMatrix);

      worksheet["!cols"] = [
        { wch: 30 }, // Full Name
        { wch: 20 }, // Employee ID
        { wch: 20 }, // Cluster
        { wch: 20 }, // Phone Number
        { wch: 28 }, // Verified At
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Detailed Cluster Summary",
      );

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const fileBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Dynamic filename logic matching your default export conventions
      let exportFileName = "Detailed-Cluster-Report.xlsx";
      if (startDate && endDate) {
        exportFileName = `Detailed-Cluster-Report-${startDate}-to-${endDate}.xlsx`;
      } else if (startDate) {
        exportFileName = `Detailed-Cluster-Report-from-${startDate}.xlsx`;
      }

      saveAs(fileBlob, exportFileName);
    } catch (err) {
      alert(err.message || "Failed to generate cluster summary document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* TITLE */}
      <Typography
        variant="h4"
        sx={{
          fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
          letterSpacing: 0.6,
          color: "#004d40",
          fontWeight: 700,
          mb: 2,
        }}
      >
        Reports
      </Typography>

      {/* FILTERS AND ACTIONS BAR */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={3}
        alignItems={{ sm: "center" }}
        useFlexGap
        flexWrap="wrap"
      >
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => {
            setPage(1);
            setStartDate(e.target.value);
          }}
          InputLabelProps={{ shrink: true }}
          slotProps={{
            htmlInput: { max: new Date().toLocaleDateString("en-CA") },
          }}
          sx={{
            minWidth: 200,
            // height: 15,

            "& input": {
              ...outfitFont,
            },

            "& label": {
              ...outfitFont,
            },

            "& input::-webkit-datetime-edit-month-field, & input::-webkit-datetime-edit-day-field, & input::-webkit-datetime-edit-year-field, & input::-webkit-datetime-edit-text":
              {
                color: startDate ? "inherit" : "transparent",
              },

            "&:focus-within input::-webkit-datetime-edit-month-field, &:focus-within input::-webkit-datetime-edit-day-field, &:focus-within input::-webkit-datetime-edit-year-field, &:focus-within input::-webkit-datetime-edit-text":
              {
                color: "inherit",
              },
          }}
        />

        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => {
            setPage(1);
            setEndDate(e.target.value);
          }}
          InputLabelProps={{ shrink: true }}
          slotProps={{
            htmlInput: { max: new Date().toLocaleDateString("en-CA") },
          }}
          sx={{
            minWidth: 200,

            "& input": {
              ...outfitFont,
            },

            "& label": {
              ...outfitFont,
            },

            "& input::-webkit-datetime-edit-month-field, & input::-webkit-datetime-edit-day-field, & input::-webkit-datetime-edit-year-field, & input::-webkit-datetime-edit-text":
              {
                color: startDate ? "inherit" : "transparent",
              },

            "&:focus-within input::-webkit-datetime-edit-month-field, &:focus-within input::-webkit-datetime-edit-day-field, &:focus-within input::-webkit-datetime-edit-year-field, &:focus-within input::-webkit-datetime-edit-text":
              {
                color: "inherit",
              },
          }}
        />

        <Button
          variant="outlined"
          onClick={clearFilters}
          sx={{
            color: "black",
            borderColor: "black",
            height: 56,
            textTransform: "none",
            fontWeight: 600,
            ...outfitFont,
            "&:hover": {
              borderColor: "black",
              backgroundColor: "rgba(0,0,0,0.05)",
            },
          }}
        >
          Clear Filters
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={exportToExcel}
          disabled={!data.length}
          sx={{
            height: 56,
            textTransform: "none",
            fontWeight: 600,
            ...outfitFont,
          }}
        >
          Export Excel
        </Button>

        <Button
          variant="contained"
          onClick={exportGroupedByCluster}
          sx={{
            height: 56,
            backgroundColor: "#004d40",
            textTransform: "none",
            fontWeight: 600,
            ...outfitFont,
            "&:hover": { backgroundColor: "#00332c" },
          }}
        >
          Detailed Report by Cluster
        </Button>
      </Stack>

      {/* TABLE VIEW */}
      <Paper sx={{ borderRadius: 1, mt: 1, overflow: "hidden" }}>
        {loading && (
          <Stack direction="row" spacing={1} sx={{ p: 2 }}>
            <CircularProgress size={18} sx={{ color: "black" }} />
            <Typography variant="caption" sx={outfitFont}>
              Loading report...
            </Typography>
          </Stack>
        )}

        {error && (
          <Alert sx={{ p: 2 }} severity="error">
            {error}
          </Alert>
        )}

        {!loading && data.length === 0 && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary" sx={outfitFont}>
              No records found
            </Typography>
          </Box>
        )}

        {data.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...outfitFont, fontWeight: 700 }}>
                      Full Name
                    </TableCell>
                    <TableCell sx={{ ...outfitFont, fontWeight: 700 }}>
                      Employee ID
                    </TableCell>
                    <TableCell sx={{ ...outfitFont, fontWeight: 700 }}>
                      Cluster
                    </TableCell>
                    <TableCell sx={{ ...outfitFont, fontWeight: 700 }}>
                      Phone Number
                    </TableCell>
                    <TableCell sx={{ ...outfitFont, fontWeight: 700 }}>
                      Verified At
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={outfitFont}>{row.full_name}</TableCell>
                      <TableCell sx={outfitFont}>{row.id_number}</TableCell>
                      <TableCell sx={outfitFont}>{row.cluster}</TableCell>
                      <TableCell sx={outfitFont}>{row.phone_number}</TableCell>
                      <TableCell sx={outfitFont}>
                        {/* {row.scanned_at
                          ? new Date(row.scanned_at).toLocaleString()
                          : "Not Verified"} */}
                        {formatDateTime(row.verified_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction="row" justifyContent="flex-end" sx={{ p: 1 }}>
              <Pagination
                count={pages}
                page={page}
                onChange={(_, value) => setPage(value)}
              />
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
}
