import axios, { AxiosError } from "axios";

/**
 * Base URL configuration
 * - Uses localhost in development
 * - Uses environment variable in production
 */
const BASE_URL: string =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"
    : import.meta.env.VITE_BASE_URL || "";

/**
 * Axios instance
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10s timeout
});

/**
 * REQUEST INTERCEPTOR
 * - Attach JWT token automatically
 */
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * - Global error handling
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const status = error.response.status;
      const message =
        (error.response.data as any)?.message || "Something went wrong";

      switch (status) {
        case 400:
          console.error("Bad Request:", message);
          break;

        case 401:
          console.error("Unauthorized - redirecting to login");
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;

        case 403:
          console.error("Forbidden:", message);
          break;

        case 404:
          console.error("Not Found:", message);
          break;

        case 500:
          console.error("Server Error:", message);
          break;

        default:
          console.error(`Error ${status}:`, message);
      }
    } else if (error.request) {
      console.error("Network error: No response from server");
    } else {
      console.error("Axios error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;