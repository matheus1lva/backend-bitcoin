import axios from "axios";

const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const apiClient = axios.create({
  baseURL: import.meta.env.API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearAuth();
      // Use history API instead of direct window.location manipulation
      if (window.location.pathname !== "/login") {
        window.history.pushState({}, "", "/login");
        // Dispatch an event to notify the app of the navigation
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }
    return Promise.reject(error);
  }
);
