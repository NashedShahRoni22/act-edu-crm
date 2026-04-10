import { useAppContext } from "@/context/context";
import { fetchWithToken } from "@/helpers/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function LeadForms() {
  const { accessToken } = useAppContext();
  // Fetch lead forms fields
  const { data, isLoading, error } = useQuery({
    queryKey: ["/lead-forms/placeholders", accessToken],
    queryFn: fetchWithToken,
    enabled: !!accessToken,
  });
  console.log(data);
  return <div>LeadForms</div>;
}
