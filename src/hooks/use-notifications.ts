import { useQuery } from "@tanstack/react-query";
import { fetchNotificationCount, fetchNotifications } from "@/lib/api";

export function useNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "count"],
    queryFn: fetchNotificationCount,
    refetchInterval: 30000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });
}
