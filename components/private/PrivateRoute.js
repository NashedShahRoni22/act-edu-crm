"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/context";

export default function PrivateRoute({ children }) {
  const { accessToken } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/");
      }
    }
  }, [accessToken, router]);

  if (!accessToken) return null;

  return <>{children}</>;
}
