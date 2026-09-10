import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import midrocLogo from "../assets/midroc_logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const validateForm = () => {
    let valid = true;

    const newErrors = {
      email: "",
      password: "",
    };

    // EMAIL VALIDATION
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    }

    // PASSWORD VALIDATION
    if (!form.password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!validateForm()) return;

    setLoading(true);

    const result = await login(form.email.trim(), form.password.trim());

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        background: "linear-gradient(45deg, #004d40 55%, #D4AF37 45%)",
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 420,
          borderRadius: 3,
        }}
      >
        <Stack spacing={2}>
          {/* HEADER */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <img
              src={midrocLogo}
              alt="Midroc Logo"
              style={{ width: 120, height: 60 }}
            />

            <Typography
              variant="h5"
              fontWeight={500}
              sx={{
                // fontFamily: '"Lilita One", "Inter", sans-serif',
                fontFamily: '"Outfit", "Inter", sans-serif',
                letterSpacing: 0.4,
                // color: "#004d40",
              }}
            >
              MIG ID Verification
            </Typography>
          </Stack>

          {/* SUBTEXT */}
          <Typography
            color="text.secondary"
            sx={{
              fontFamily: '"Outfit", "Inter", sans-serif',
            }}
          >
            Sign in to access registration and identity verification records.
          </Typography>

          {/* ERROR ALERT */}
          {error ? <Alert severity="error">{error}</Alert> : null}

          {/* FORM */}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {/* EMAIL FIELD */}
              <TextField
                fullWidth
                label="Email Address"
                placeholder="Enter your email address"
                type="email"
                value={form.email}
                error={!!errors.email}
                helperText={errors.email}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: '"Outfit", "Inter", sans-serif',
                  },

                  "& .MuiInputLabel-root": {
                    fontFamily: '"Outfit", "Inter", sans-serif',
                  },

                  "& .MuiFormHelperText-root": {
                    fontFamily: '"Outfit", "Inter", sans-serif',
                  },
                }}
              />

              {/* PASSWORD FIELD */}
              <TextField
                fullWidth
                label="Password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                error={!!errors.password}
                helperText={errors.password}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: '"Outfit", "Inter", sans-serif',
                  },

                  "& .MuiInputLabel-root": {
                    fontFamily: '"Outfit", "Inter", sans-serif',
                  },

                  "& .MuiFormHelperText-root": {
                    fontFamily: '"Outfit", "Inter", sans-serif',
                  },
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* BUTTON */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  bgcolor: "#004d40",
                  fontFamily: '"Outfit", "Inter", sans-serif',
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.4,

                  "&:hover": {
                    bgcolor: "#00352c",
                  },
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
