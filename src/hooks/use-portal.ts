import { useQuery } from "@tanstack/react-query";
import { fetchPortalSummary } from "@/lib/api";

export function usePortalSummary() {
  return useQuery({
    queryKey: ["portal", "summary"],
    queryFn: fetchPortalSummary,
    staleTime: 2 * 60 * 1000,
  });
}
