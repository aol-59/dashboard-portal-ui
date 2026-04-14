import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEntityAccess, grantEntityAccess, revokeEntityAccess } from "@/lib/api";
import { toast } from "sonner";

export function useEntityAccess(slug: string) {
  return useQuery({ queryKey: ["entity-access", slug], queryFn: () => fetchEntityAccess(slug), enabled: !!slug });
}

export function useGrantEntityAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: grantEntityAccess,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["entity-access"] }); qc.invalidateQueries({ queryKey: ["portal", "summary"] }); toast.success("Access granted"); },
    onError: () => toast.error("Failed to grant access"),
  });
}

export function useRevokeEntityAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeEntityAccess,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["entity-access"] }); qc.invalidateQueries({ queryKey: ["portal", "summary"] }); toast.success("Access revoked"); },
    onError: () => toast.error("Failed to revoke access"),
  });
}
