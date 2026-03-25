import axios from "axios";

function getAuthToken() {
  return (
    import.meta.env.VITE_API_TOKEN ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("apiToken") ||
    ""
  );
}

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://e-commerce-api-v2.nt.azimumarov.uz/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 10000),
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);
