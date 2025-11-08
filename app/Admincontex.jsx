"use client";
import { createContext, useState, useEffect } from "react";

export const Rolecontex = createContext();

export const RoleProvider = ({ children }) => {
  const [Role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  // 1. NEW: Start as true because we are checking storage first thing
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("userRole");
      const storedToken = localStorage.getItem("userToken");
      
      if (storedRole && storedToken) {
        setRole(storedRole);
        setToken(storedToken);
      }
    }
    // 2. NEW: We are done checking, turn off loading
    setIsLoading(false);
  }, []);

  const login = (user, apiToken) => {
    // ... (keep existing validation checks) ...
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userToken", apiToken);
    setRole(user.role);
    setToken(apiToken);
  };

  const logout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userToken");
    setRole(null);
    setToken(null);
  };

  return (
    // 3. NEW: Pass isLoading to the rest of the app
    <Rolecontex.Provider value={{ Role, token, isLoading, login, logout }}>
      {children}
    </Rolecontex.Provider>
  );
};