import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-saas-project-66sm.onrender.com", // ✅ FIXED
  timeout: 10000,
});

// attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;