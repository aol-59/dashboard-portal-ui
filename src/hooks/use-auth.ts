import { useQuery } from "@tanstack/react-query";
import { fetchMe, type UserProfile } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

export function useAuth() {
  return useQuery<UserProfile>({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    enabled: isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  });
}
