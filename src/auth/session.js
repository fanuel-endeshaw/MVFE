// ==========================
// CONFIG
// ==========================
// import { BASE_URL } from "../config";
// const API_BASE_URL = "http://192.168.1.79:5000";
// const API_BASE_URL = BASE_URL;
import apiClient from "../api/apiClient";
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const TOKEN_KEY = "id_verify_token";

// ==========================
// AUTH (BACKEND)
// ==========================

export async function loginWithBackend(email, password) {
  try {
    const res = await apiClient.post(`/api/admins/login`, { email, password });
    
    const data = res.data;

    // ✅ Save token
    localStorage.setItem(TOKEN_KEY, data.token);

    return {
      success: true,
      token: data.token,
    };
  } catch (error) {
    // console.error(error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Server error",
    };
  }
}

// ==========================
// SESSION HANDLING
// ==========================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}

// ==========================
// HEADER BUILDER
// ==========================

// export function buildHeaders(extraHeaders = {}) {
//   const token = getToken();
//   console.log("Building headers with token:", token);

//   return {
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...extraHeaders,
//   };
// }
// const buildHeaders = (extraHeaders = {}) => ({
//   Authorization: `Bearer ${token}`,
//   ...extraHeaders,
// });

// ==========================
// USERS (BACKEND)
// ==========================

export async function fetchUsers(token) {
  try {
    const res = await apiClient.get(`/api/users/fetch`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    // console.error(error);
    return [];
  }
}
export async function fetchCount(token) {
  try {
    const res = await apiClient.get(`/api/history/today-scans`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.count;
  } catch (error) {
    // console.error(error);
    return [];
  }
}

// ==========================
// CREATE USER (WITH IMAGE)
// ==========================

export async function createUserBackend(form, token) {
  const formData = new FormData();

  formData.append("full_name", form.fullName);
  formData.append("id_number", form.id_number);
  formData.append("date_of_birth", form.dateOfBirth);
  formData.append("address", form.address);

  if (form.photoFile) {
    formData.append("photo", form.photoFile);
  }

  try {
    const res = await apiClient.post(`/api/users/register`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Failed to create user");
  }
}

export async function deleteUserBackend(id_number, token) {
  try {
    const res = await apiClient.delete(`/api/users/${id_number}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Delete failed");
  }
}

// ==========================
// JWT DECODE
// ==========================
export function decodeToken() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    // console.error("Invalid token", error);
    return null;
  }
}
