"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { dashboardKeys } from "../api/keys";
import type { DashboardStats } from "../server/stats";

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => apiFetch<DashboardStats>("/api/admin/stats"),
    // New contact messages arrive without any admin action, so poll gently.
    refetchInterval: 60_000,
  });
}
