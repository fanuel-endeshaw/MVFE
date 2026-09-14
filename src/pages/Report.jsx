import {
  Alert,
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  CircularProgress,
  TextField,
  Pagination,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import apiClient from "../api/apiClient";

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

  const columns = [
    { field: "full_name", headerName: "Full Name", flex: 1, minWidth: 150 },
    { field: "id_number", headerName: "Employee ID", flex: 1, minWidth: 130 },
    { field: "cluster", headerName: "Cluster", flex: 1, minWidth: 130 },
    {
      field: "phone_number",
      headerName: "Phone Number",
      flex: 1,
      minWidth: 150,
    },
    { field: "verified_at", headerName: "Verified At", flex: 1, minWidth: 180 },
  ];

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
        endpoint = `/api/history/scans-by-date-range?page=${page}&startDate=${startDate}`;
        if (endDate) {
          endpoint += `&endDate=${endDate}`;
        }
      } else {
        if (endDate) {
          alert("Start date is required.");
          setEndDate("");
          return;
        }
        endpoint = `/api/history/all-scans/${page}`;
      }

      const res = await apiClient.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = res.data;

      const normalized = (result.users || []).map((r, i) => ({
        id: r.id || i,
        full_name: r.user_name || r.full_name || "Unknown",
        id_number: r.id_number || "N/A",
        cluster: r.cluster || "N/A",
        verified_at: formatDateTime(r.verified_at || r.created_at || null),
        phone_number: r.phone_number || "",
      }));
      setData(normalized);
      setPages(result.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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
        let endpoint = `/api/report/download?startDate=${startDate}`;
        if (endDate) endpoint += `&endDate=${endDate}`;

        const res = await apiClient.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = res.data;

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
          const endpoint = `/api/history/all-scans/${currentPage}`;
          const res = await apiClient.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = res.data;

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
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportGroupedByCluster = async () => {
    try {
      // Validate dates exactly like the default report view
      if (!startDate && endDate) {
        alert("Start date is required.");
        return;
      }

      setLoading(true);
      setError("");

      let endpoint = `/api/history/grouped-by-cluster`;
      const queryParams = [];
      if (startDate) queryParams.push(`startDate=${startDate}`);
      if (endDate) queryParams.push(`endDate=${endDate}`);
      if (queryParams.length > 0) endpoint += `?${queryParams.join("&")}`;

      const res = await apiClient.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = res.data;

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
      alert(err.response?.data?.message || err.message || "Failed to generate cluster summary document.");
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
                color: endDate ? "inherit" : "transparent",
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
          disabled={!data.length}
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
            <Box sx={{ width: "100%" }}>
              <DataGrid
                autoHeight
                rows={data}
                columns={columns}
                hideFooter
                disableRowSelectionOnClick
                sx={{
                  "& .MuiDataGrid-cell": outfitFont,
                  "& .MuiDataGrid-columnHeaders": {
                    ...outfitFont,
                    fontWeight: 700,
                  },
                }}
              />
            </Box>

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
