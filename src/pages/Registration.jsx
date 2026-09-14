import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";

import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import { useAuth } from "../auth/useAuth";

export default function Registration() {
  const apiBaseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { token } = useAuth();

  const isEditMode = !!id;
  const editUser = location.state;

  const fileInputRef = useRef(null);

  const [registrationError, setRegistrationError] = useState("");
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // 💡 NEW: State to hold database clusters and loading feedback
  const [dbClusters, setDbClusters] = useState([]);
  const [clustersLoading, setClustersLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    id_number: "",
    phone_number: "",
    address: "",
    photo: "",
    photoFile: null,
    cluster: "",
  });

  // ==========================
  // 💡 NEW: FETCH CLUSTERS FROM DB
  // ==========================
  useEffect(() => {
    const fetchClusters = async () => {
      setClustersLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/api/users/clusters`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to load clusters: ${res.status}`);
        }

        const data = await res.json();

        // Ensure data maps cleanly to an array structure.
        // Adjust if your API returns the array wrapped inside an object property like data.clusters
        if (Array.isArray(data)) {
          setDbClusters(data);
        } else if (data && Array.isArray(data.clusters)) {
          setDbClusters(data.clusters);
        }
      } catch (err) {
        console.error("Error retrieving dynamic clusters:", err);
        setRegistrationError("Could not retrieve active operational clusters.");
      } finally {
        setClustersLoading(false);
      }
    };

    if (token) {
      fetchClusters();
    }
  }, [apiBaseUrl, token]);

  // ==========================
  // LOAD USER DATA
  // ==========================
  useEffect(() => {
    if (isEditMode && editUser) {
      setForm({
        fullName: editUser.name || "",
        id_number: editUser.id_number || "",
        phone_number: editUser.phone_number || "",
        address: editUser.address || "",
        photo: editUser.photo_url || "",
        cluster: editUser.cluster || "",
        photoFile: null,
      });
    }
  }, [isEditMode, editUser]);

  const handleRemovePhoto = () => {
    setForm((prev) => ({
      ...prev,
      photo: "",
      photoFile: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sanitizeInput = (field, value) => {
    let cleaned = value;
    cleaned = cleaned.replace(/^\s+/g, "");

    if (field === "fullName") {
      cleaned = cleaned.replace(/\s{2,}/g, " ");
      cleaned = cleaned.replace(/[^a-zA-Z\s]/g, "");
      cleaned = cleaned.slice(0, 50);
    }

    if (field === "id_number") {
      cleaned = cleaned.replace(/\s/g, "");
      cleaned = cleaned.replace(/[^a-zA-Z0-9-_]/g, "");
      cleaned = cleaned.slice(0, 30);
    }

    if (field === "phone_number") {
      cleaned = cleaned.replace(/[^\d]/g, "");
      cleaned = cleaned.slice(0, 13);
    }

    if (field === "address") {
      cleaned = cleaned.replace(/\s{2,}/g, " ");
      cleaned = cleaned.slice(0, 200);
    }

    return cleaned;
  };

  const handleChange = (field) => (e) => {
    const value = sanitizeInput(field, e.target.value);
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResult = () => {
    setRegistrationError("");
    setForm({
      fullName: "",
      id_number: "",
      phone_number: "",
      address: "",
      photo: "",
      cluster: "",
      photoFile: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setRegistrationError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setRegistrationError("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        photo: reader.result,
        photoFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (form.fullName.trim().length < 3)
      return "Full name must be at least 3 characters.";
    if (!form.id_number.trim()) return "Employee ID is required.";
    if (form.id_number.length < 4) return "Employee ID is too short.";
    if (form.phone_number && form.phone_number.length < 10)
      return "Phone number is invalid.";
    if (form.address.trim().length > 0 && form.address.trim().length < 3)
      return "Address is too short.";
    if (!form.cluster || form.cluster === "" || form.cluster === "none") {
      return "Please select a valid operational cluster.";
    }
    return null;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setRegistrationError("");

    const validationError = validateForm();
    if (validationError) {
      setRegistrationError(validationError);
      return;
    }

    setRegistrationLoading(true);

    try {
      const payload = new FormData();
      payload.append("full_name", form.fullName.trim());
      payload.append("id_number", form.id_number.trim());
      payload.append("phone_number", form.phone_number.trim());
      payload.append("address", form.address.trim());
      payload.append("cluster", form.cluster.trim());

      if (form.photoFile) {
        payload.append("photo", form.photoFile);
      }
      payload.append("photo_url", form.photo ? editUser?.photo_url || "" : "");

      const endpoint = isEditMode
        ? `${apiBaseUrl}/api/users/update/${id}`
        : `${apiBaseUrl}/api/users/register`;

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Request failed");
      }
      alert(
        isEditMode
          ? "User updated successfully!"
          : "User registered successfully!",
      );
      navigate("/dashboard/users");
    } catch (err) {
      setRegistrationError(err.message);
    } finally {
      setRegistrationLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, fontFamily: '"Outfit", sans-serif' }}>
      <Box sx={{ maxWidth: 900 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Outfit", "Inter", "Segoe UI", sans-serif',
            letterSpacing: 0.6,
            color: "#004d40",
            fontWeight: 700,
          }}
          mb={3}
        >
          {isEditMode ? "Update User" : "New User Registration"}
        </Typography>

        <Box component="form" sx={{ mt: 2 }} onSubmit={handleCreateUser}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            {/* LEFT */}
            <Paper
              sx={{
                flex: 7,
                p: 3,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
                {registrationError && (
                  <Alert
                    severity="error"
                    sx={{ fontFamily: '"Outfit", sans-serif' }}
                  >
                    {registrationError}
                  </Alert>
                )}

                {/* FULL NAME */}
                <TextField
                  label="Full Name"
                  required
                  fullWidth
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  inputProps={{ maxLength: 50 }}
                  InputLabelProps={{
                    sx: { fontFamily: '"Outfit", sans-serif' },
                  }}
                  InputProps={{ sx: { fontFamily: '"Outfit", sans-serif' } }}
                />

                {/* EMPLOYEE ID */}
                <TextField
                  label="Employee ID"
                  required
                  fullWidth
                  value={form.id_number}
                  onChange={handleChange("id_number")}
                  inputProps={{ maxLength: 30 }}
                  InputLabelProps={{
                    sx: { fontFamily: '"Outfit", sans-serif' },
                  }}
                  InputProps={{ sx: { fontFamily: '"Outfit", sans-serif' } }}
                />

                {/* PHONE */}
                <TextField
                  label="Phone Number"
                  fullWidth
                  required
                  value={form.phone_number}
                  onChange={handleChange("phone_number")}
                  inputProps={{ inputMode: "numeric", maxLength: 13 }}
                  InputLabelProps={{
                    sx: { fontFamily: '"Outfit", sans-serif' },
                  }}
                  InputProps={{ sx: { fontFamily: '"Outfit", sans-serif' } }}
                />

                {/* CLUSTER SELECTION CONTROL */}
                <FormControl fullWidth disabled={clustersLoading}>
                  <InputLabel
                    id="cluster-select-label"
                    shrink
                    sx={{ fontFamily: '"Outfit", sans-serif' }}
                  >
                    {clustersLoading ? "Loading Clusters..." : "Cluster"}
                  </InputLabel>
                  <Select
                    labelId="cluster-select-label"
                    id="cluster-select"
                    value={form.cluster}
                    label="Cluster"
                    onChange={handleChange("cluster")}
                    displayEmpty
                    // 💡 UPDATED: Targets dbClusters context array for value matching dynamically
                    renderValue={(selected) => {
                      if (!selected || selected === "" || selected === "none") {
                        return (
                          <span style={{ color: "#999" }}>
                            Select a cluster...
                          </span>
                        );
                      }

                      // Handles both string identification or unique database identifiers matching (id / _id)
                      const matchedCluster = dbClusters.find(
                        (c) =>
                          c.id === selected ||
                          c._id === selected ||
                          c.cluster_name === selected,
                      );

                      return matchedCluster
                        ? matchedCluster.cluster_name || matchedCluster.name
                        : selected;
                    }}
                    sx={{
                      fontFamily: '"Outfit", sans-serif',
                      textTransform: "none",
                    }}
                  >
                    <MenuItem value="none">
                      <em>None</em>
                    </MenuItem>

                    {/* 💡 UPDATED: Dynamically parsing matching cluster rows from backend */}
                    {dbClusters.map((cluster) => {
                      // Fallback support for generic database tracking models (id, _id, cluster_name)
                      const optionValue =
                        cluster.cluster_name || cluster.id || cluster._id;
                      const optionDisplay =
                        cluster.cluster_name || cluster.name;

                      return (
                        <MenuItem
                          key={cluster._id || cluster.id || optionValue}
                          value={optionValue}
                        >
                          {optionDisplay}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                {/* ADDRESS */}
                <TextField
                  multiline
                  rows={3}
                  label="Address"
                  fullWidth
                  value={form.address}
                  onChange={handleChange("address")}
                  inputProps={{ maxLength: 200 }}
                  InputLabelProps={{
                    sx: { fontFamily: '"Outfit", sans-serif' },
                  }}
                  InputProps={{ sx: { fontFamily: '"Outfit", sans-serif' } }}
                />

                {/* BUTTONS */}
                <Box mt="auto">
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleResult}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        color: "#004d40",
                        borderColor: "#004d40",
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: 600,
                      }}
                    >
                      Clear
                    </Button>

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={registrationLoading}
                      startIcon={
                        registrationLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : isEditMode ? (
                          <EditOutlinedIcon />
                        ) : (
                          <PersonAddAlt1Icon />
                        )
                      }
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        backgroundColor: "#004d40",
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: 600,
                        "&:hover": { backgroundColor: "#00352d" },
                      }}
                    >
                      {registrationLoading
                        ? "Processing..."
                        : isEditMode
                          ? "Update User"
                          : "Complete"}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* RIGHT */}
            <Paper
              sx={{
                flex: 5,
                p: 3,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                mb={2}
                sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 500 }}
              >
                Employee Photo (Optional)
              </Typography>

              <Box
                sx={{
                  flexGrow: 1,
                  border: "2px dashed #cbd5e1",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  minHeight: 250,
                  overflow: "hidden",
                }}
              >
                {form.photo ? (
                  <Box
                    component="img"
                    src={form.photo}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <UploadFileOutlinedIcon
                    sx={{ fontSize: 50, color: "#004d40" }}
                  />
                )}
              </Box>

              <Button
                component="label"
                variant="outlined"
                fullWidth
                sx={{
                  color: "#004d40",
                  borderColor: "#004d40",
                  textTransform: "none",
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 600,
                }}
                startIcon={<UploadFileOutlinedIcon />}
              >
                {isEditMode ? "Change Photo" : "Upload Photo"}
                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </Button>
              {form.photo && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRemovePhoto}
                  sx={{ minWidth: 55, borderRadius: 2, mt: 1 }}
                >
                  Remove Photo
                </Button>
              )}
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
