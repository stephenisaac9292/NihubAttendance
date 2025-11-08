"use client";
import { createContext, useState, useEffect } from "react";
// 1. IMPORT your official auth functions
import { setAuth, getUser, getToken, logout as authLogout } from "@/utils/auth";

export const Rolecontex = createContext();

export const RoleProvider = ({ children }) => {
  const [Role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 2. USE your auth functions to read from LocalStorage
    const initAuth = () => {
        const user = getUser();
        const storedToken = getToken();

        if (user?.role && storedToken) {
          console.log("✅ Restored session for:", user.role);
          setRole(user.role);
          setToken(storedToken);
        } else {
          console.log("ℹ️ No valid session found");
        }
        setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = (user, apiToken) => {
    // 3. CRITICAL: Use setAuth to save.
    // Your setAuth function is: setAuth(token, user)
    // So we pass the token first, then the user.
    setAuth(apiToken, user); 
    
    // 4. Update React state
    setRole(user.role);
    setToken(apiToken);
  };

  const logout = () => {
    // 5. USE your auth function to clear LocalStorage
    authLogout();
    
    // 6. Clear React state
    setRole(null);
    setToken(null);
    
    // 7. Redirect to login
    window.location.href = "/AdminLogin";
  };

  return (
    <Rolecontex.Provider value={{ Role, token, isLoading, login, logout }}>
      {children}
    </Rolecontex.Provider>
  );
};