import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

export default apiClient;
