"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithToken, postWithToken } from "@/helpers/api";
import { toast } from "react-hot-toast";

// Create Context
const AppContext = createContext();

// Provider Component
export const AppProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
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

  // Fetch unread notifications with 1 minute refetch interval
  const notificationsQuery = useQuery({
    queryKey: ["/notifications", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
    refetchInterval: 60000, // Refetch every 1 minute
    refetchOnWindowFocus: false,
  });

  // Handle paginated response structure
  const notifications = notificationsQuery.data?.data?.data || [];

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      return postWithToken(
        `/notifications/${notificationId}/read`,
        fd,
        accessToken
      );
    },
    onSuccess: (res) => {
      if (res?.status === "success") {
        queryClient.invalidateQueries({
          queryKey: ["/notifications", accessToken],
        });
        toast.success(res.message || "Notification marked as read");
      } else {
        toast.error(res?.message || "Failed to mark as read");
      }
    },
    onError: () => toast.error("Failed to mark as read"),
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      return postWithToken(
        `/notifications/mark-all-read`,
        fd,
        accessToken
      );
    },
    onSuccess: (res) => {
      if (res?.status === "success") {
        queryClient.invalidateQueries({
          queryKey: ["/notifications", accessToken],
        });
        toast.success(res.message || "All notifications marked as read");
      } else {
        toast.error(res?.message || "Failed to mark all as read");
      }
    },
    onError: () => toast.error("Failed to mark all as read"),
  });

  return (
    <AppContext.Provider
      value={{
        pathname,
        userInfo,
        accessToken,
        setUserInfo: updateUserInfo,
        setAccessToken: updateAccessToken,
        logout,
        // Notification properties
        notifications,
        notificationsQuery,
        markAsReadMutation,
        markAllAsReadMutation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for easy access
export const useAppContext = () => useContext(AppContext);
