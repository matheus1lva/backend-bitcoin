import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/client";

export const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear Authorization header
    delete apiClient.defaults.headers.common["Authorization"];

    // Dispatch storage event to update state in current window
    window.dispatchEvent(new Event("storage"));

    // Redirect to login
    navigate("/login");
  }, [navigate]);

  return null;
};
