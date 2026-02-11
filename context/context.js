"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

// Create Context
const AppContext = createContext();

// Provider Component
export const AppProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  
  // Load user info & token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("actUser");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser) setUserInfo(JSON.parse(storedUser));
    if (storedToken) setAccessToken(storedToken);
  }, []);

  // Update user and save in localStorage
  const updateUserInfo = (user) => {
    setUserInfo(user);
    localStorage.setItem("actUser", JSON.stringify(user));
  };
  // Update access token and sync to localStorage
  const updateAccessToken = (token) => {
    setAccessToken(token);
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  };

  // Logout and clear storage
  const logout = () => {
    setUserInfo(null);
    setAccessToken(null);
    localStorage.removeItem("actUser");
    localStorage.removeItem("accessToken");
    router.push("/");
  };

  return (
    <AppContext.Provider
      value={{
        pathname,
        userInfo,
        accessToken,
        setUserInfo: updateUserInfo,
        setAccessToken: updateAccessToken,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for easy access
export const useAppContext = () => useContext(AppContext);
