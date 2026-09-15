import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import placeholder from "../assets/placeholder.png";

import {
  DeleteOutlined as DeleteIcon,
  VisibilityOutlined as ViewIcon,
  SearchOutlined as SearchIcon,
  ShareOutlined as ShareIcon,
  Add as AddIcon,
  EditOutlined as EditIcon,
} from "@mui/icons-material";

import { deleteUserBackend, fetchUsers } from "../auth/session";
import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";


const normalizeUser = (s = {}) => ({
  ...s,
  id:
    s.id ||
    s.user_id ||
    s.uuid ||
    `USR-${Math.random().toString(36).substr(2, 9)}`,

  name: s.name || s.fullName || s.full_name || "Unknown User",

  id_number: s.id_number ?? s.idNumber ?? "",

  phone_number: s.phone_number ?? "",

  created_at: s.created_at || s.createdAt || new Date().toISOString(),
});

const outfitFont = {
  fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
};

export default function Users() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const [sortBy, setSortBy] = useState("newest");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState("");

  const qrRef = useRef(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const data = await fetchUsers(token);

        const list = data?.user || data || [];

        if (active) {
          setUsers(list.map(normalizeUser));
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to sync users.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [token]);

  // FILTER + SORT
  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase();

    let filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.id_number.toLowerCase().includes(q) ||
        u.phone_number.toLowerCase().includes(q),
    );

    switch (sortBy) {
      case "name-asc":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));

      case "name-desc":
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));

      case "newest":
        return [...filtered].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

      case "oldest":
        return [...filtered].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        );

      case "id-asc":
        return [...filtered].sort((a, b) =>
          a.id_number.localeCompare(b.id_number),
        );

      case "id-desc":
        return [...filtered].sort((a, b) =>
          b.id_number.localeCompare(a.id_number),
        );

      default:
        return filtered;
    }
  }, [users, query, sortBy]);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;

    try {
      await deleteUserBackend(user.id, token);

      setUsers((prev) => prev.filter((u) => u.id !== user.id));

      setToast("User deleted successfully");
    } catch (err) {
      setToast(err.message || "Delete failed");
    }
  };

  const handleUpdate = (user) => {
    navigate(`/dashboard/userManagment/${user.id}`, {
      state: user,
    });
  };

  const handleShareQR = async () => {
    const canvas = qrRef.current;

    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL("image/png");

      const blob = await (await fetch(dataUrl)).blob();

      const file = new File([blob], "qr-code.png", {
        type: "image/png",
      });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "User QR Code",
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${selectedUser?.name || "qr"}-code.png`;
        link.click();

        setToast("Downloaded instead of sharing");
      }
    } catch (err) {
      setToast("Failed to share QR");
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        maxWidth: 1200,
        mx: "auto",
        ...outfitFont,
      }}
    >
      {/* HEADER */}
      <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1.5 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
              letterSpacing: 0.6,
              color: "#004d40",
              fontWeight: 700,
            }}
          >
            User Management
          </Typography>

          <Typography color="text.secondary">
            Manage identity profiles
          </Typography>
        </Box>
      </Stack>

      {/* SEARCH + SORT */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ my: 2 }} alignItems="center">
        <TextField
          placeholder="Search..."
          size="small"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            },
          }}
        />

        <TextField
          select
          size="small"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="newest">Newest</MenuItem>
          <MenuItem value="oldest">Oldest</MenuItem>
          <MenuItem value="name-asc">Name A-Z</MenuItem>
          <MenuItem value="name-desc">Name Z-A</MenuItem>
          <MenuItem value="id-asc">ID ↑</MenuItem>
          <MenuItem value="id-desc">ID ↓</MenuItem>
        </TextField>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dashboard/userManagment")}
          sx={{
            backgroundColor: "#004d40",
            fontFamily: '"Outfit", sans-serif',
            textTransform: "none",
            height: 40,
            px: 2.5,
            fontSize: "0.9rem",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "#00332c" },
          }}
        >
          Register
        </Button>
      </Stack>

      {/* DATAGRID */}
      <Paper sx={{ borderRadius: 1, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ mt: 1, padding: 2, textAlign: "center" }}>
            <CircularProgress size={24} sx={{ color: "black" }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={outfitFont}>
            {error}
          </Alert>
        ) : (
          <DataGrid
            autoHeight
            rows={filteredUsers}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 20, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            columns={[
              {
                field: "name",
                headerName: "User",
                flex: 1,
                minWidth: 180,
                renderCell: ({ row }) => (
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", height: "100%", width: "100%" }}>
                    <Avatar sx={{ bgcolor: "#004d40", ...outfitFont, width: 32, height: 32, fontSize: 14 }}>
                      {row.name[0]}
                    </Avatar>
                    <Typography sx={{ ...outfitFont, fontWeight: 500, fontSize: 14 }}>
                      {row.name}
                    </Typography>
                  </Stack>
                ),
              },
              { field: "id_number", headerName: "Employee ID", flex: 1, minWidth: 130 },
              { field: "cluster", headerName: "Cluster", flex: 1, minWidth: 130 },
              { field: "phone_number", headerName: "Phone Number", flex: 1, minWidth: 140 },
              {
                field: "actions",
                headerName: "Actions",
                width: 130,
                sortable: false,
                align: "right",
                headerAlign: "right",
                renderCell: ({ row }) => (
                  <>
                    <IconButton size="small" onClick={() => setSelectedUser(row)}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleUpdate(row)} sx={{ color: "#004d40" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(row)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                ),
              },
            ]}
            sx={{
              "& .MuiDataGrid-cell": outfitFont,
              "& .MuiDataGrid-columnHeaders": { ...outfitFont, fontWeight: 700 },
              "& .MuiDataGrid-virtualScroller": { overflowX: "hidden" },
              "& .MuiDataGrid-scrollbar--horizontal": { display: "none" },
            }}
          />
        )}
      </Paper>

      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle
          sx={{
            ...outfitFont,
            fontWeight: 700,
          }}
        >
          User Profile
        </DialogTitle>

        <DialogContent>
          {selectedUser && (
            <Stack spacing={3} sx={{ py: 1 }}>
              <Box
                component={"img"}
                src={
                  selectedUser.photo_url == null
                    ? placeholder
                    : selectedUser.photo_url
                } //
                sx={{
                  width: 170,
                  height: 170,
                  borderRadius: 3,
                  objectFit: "cover",
                }}
              />

              <Box sx={{ textAlign: "left" }}>
                <Typography
                  variant="h5"
                  sx={{
                    ...outfitFont,
                    fontWeight: 700,
                  }}
                >
                  {selectedUser.name}
                </Typography>

                <Typography color="text.secondary" sx={outfitFont}>
                  {selectedUser.id_number}
                </Typography>

                <Typography color="text.secondary" sx={outfitFont}>
                  {selectedUser.phone_number}
                </Typography>
              </Box>

              <Card
                sx={{
                  width: "100%",
                  borderRadius: 4,
                }}
              >
                <CardContent>
                  <Typography
                    align="center"
                    gutterBottom
                    sx={{
                      ...outfitFont,
                      fontWeight: 600,
                    }}
                  >
                    Scan QR
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      ...outfitFont,
                      mb: 2,
                    }}
                  >
                    QR Token: {selectedUser.id_number}
                  </Typography>

                  <Box sx={{ textAlign: "center" }}>
                    {selectedUser.id_number ? (
                      <QRCodeCanvas
                        ref={qrRef}
                        value={selectedUser.id_number}
                        size={200}
                        level="H"
                        includeMargin
                      />
                    ) : (
                      <Typography color="error" sx={outfitFont}>
                        Missing QR Token
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            startIcon={<ShareIcon />}
            onClick={handleShareQR}
            sx={{
              ...outfitFont,
              textTransform: "none",
              color: "#004d40",
              fontWeight: 600,
            }}
          >
            Share QR
          </Button>

          <Button
            variant="contained"
            sx={{
              bgcolor: "#004d40",
              ...outfitFont,
              textTransform: "none",
              fontWeight: 600,
            }}
            onClick={() => setSelectedUser(null)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        message={toast}
        autoHideDuration={4000}
        onClose={() => setToast("")}
      />
    </Box>
  );
}
