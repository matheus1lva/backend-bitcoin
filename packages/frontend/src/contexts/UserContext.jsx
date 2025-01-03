import { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../lib/client";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Restore auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
    }
  }, [user]);

  const updateUser = (newUser, token) => {
    if (newUser && token) {
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", token);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete apiClient.defaults.headers.common["Authorization"];
    }
    setUser(newUser);
  };

  const value = {
    user,
    updateUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
