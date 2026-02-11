"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/context";

export default function PublicRoute({ children }) {
  const { accessToken } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (accessToken) {
        router.push("/dashboard");      
    }
  }, [accessToken, router]);

  return <>{children}</>;
}
