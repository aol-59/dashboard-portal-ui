import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminUsers, createAdminUser, updateAdminUser, toggleAdmin } from "@/lib/api";
import { toast } from "sonner";

export function useAdminUsers() {
  return useQuery({ queryKey: ["admin", "users"], queryFn: fetchAdminUsers });
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("User created"); },
    onError: () => toast.error("Failed to create user"),
  });
}

export function useUpdateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; display_name?: string; department?: string; is_active?: boolean }) =>
      updateAdminUser(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("User updated"); },
    onError: () => toast.error("Failed to update user"),
  });
}

export function useToggleAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_admin }: { id: string; is_admin: boolean }) => toggleAdmin(id, is_admin),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("Admin status updated"); },
    onError: () => toast.error("Failed to update admin status"),
  });
}
