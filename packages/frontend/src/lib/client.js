import axios from "axios";
const token = localStorage.getItem("token");

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

if (token) {
  apiClient.interceptors.request.use(function (config) {
    const token = localStorage.getItem("token");
    config.headers.Authorization = token ? `Bearer ${token}` : "";
    return config;
  });
}
// Add token to requests if it exists in localStorage

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    // if (error.response?.status === 401) {
    //   localStorage.removeItem("token");
    //   localStorage.removeItem("user");
    //   window.location.href = "/login";
    // }
    return Promise.reject(error);
  }
);
