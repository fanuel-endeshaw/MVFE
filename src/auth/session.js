// ==========================
// CONFIG
// ==========================
// import { BASE_URL } from "../config";
// const API_BASE_URL = "http://192.168.1.79:5000";
// const API_BASE_URL = BASE_URL;
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const TOKEN_KEY = "id_verify_token";

// ==========================
// AUTH (BACKEND)
// ==========================

export async function loginWithBackend(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admins/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || "Login failed" };
    }

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
      error: "Server error",
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
    const res = await fetch(`${API_BASE_URL}/api/users/fetch`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch users");
    }

    return data;
  } catch (error) {
    // console.error(error);
    return [];
  }
}
export async function fetchCount(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/history/today-scans`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch users");
    }

    return data.count;
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

  const res = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: "POST",
    // No Content-Type header for FormData
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create user");
  }

  return data;
}

export async function deleteUserBackend(id_number, token) {
  const res = await fetch(`${API_BASE_URL}/api/users/${id_number}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Delete failed");
  }

  return data;
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
