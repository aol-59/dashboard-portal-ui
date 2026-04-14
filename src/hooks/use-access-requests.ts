import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAccessRequests, createAccessRequest, updateAccessRequest } from "@/lib/api";
import { toast } from "sonner";

export function useAccessRequests() {
  return useQuery({ queryKey: ["access-requests"], queryFn: fetchAccessRequests });
}

export function useCreateAccessRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAccessRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["access-requests"] });
      qc.invalidateQueries({ queryKey: ["portal", "summary"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Access request submitted");
    },
    onError: () => toast.error("Failed to submit request"),
  });
}

export function useUpdateAccessRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Approved" | "Rejected" }) => updateAccessRequest(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["access-requests"] });
      qc.invalidateQueries({ queryKey: ["portal", "summary"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Request updated");
    },
    onError: () => toast.error("Failed to update request"),
  });
}
