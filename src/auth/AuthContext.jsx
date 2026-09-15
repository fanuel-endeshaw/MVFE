import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextCore";
import { jwtDecode } from "jwt-decode";
// import { BASE_URL } from "../config";
import apiClient from "../api/apiClient";

export const AuthProvider = ({ children }) => {
  const api_base_url = import.meta.env.VITE_BASE_URL;
  // const api_base_url = BASE_URL;
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isTokenValid = (jwt) => {
    try {
      const decoded = jwtDecode(jwt);
      if (!decoded.exp) return false;
      const now = Date.now() / 1000;
      return decoded.exp > now;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (token && isTokenValid(token)) {
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("token");
      setToken(null);
      setIsAuthenticated(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await apiClient.post(`/api/admins/login`, { email, password });
      const data = res.data;

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message || "Login failed." };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
