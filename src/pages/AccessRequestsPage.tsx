import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { useAccessRequests, useUpdateAccessRequest } from "@/hooks/use-access-requests";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

const statusTranslation: Record<string, string> = {
  Pending: "access.pending",
  Approved: "access.approved",
  Rejected: "access.rejected",
};

export default function AccessRequestsPage() {
  const { t, isRTL } = useLanguage();
  const { data: requests, isLoading } = useAccessRequests();
  const updateRequest = useUpdateAccessRequest();
  const [tab, setTab] = useState("all");

  const filtered = (requests || []).filter((r) => tab === "all" || r.status.toLowerCase() === tab);

  const tabs = [
    { key: "all", label: t("access.all") },
    { key: "pending", label: t("access.pending") },
    { key: "approved", label: t("access.approved") },
    { key: "rejected", label: t("access.rejected") },
  ];

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("access.title")}</h1>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {tabs.map((f) => (
          <Button
            key={f.key}
            variant={tab === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(f.key)}
            className="text-xs"
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">{t("access.requester")}</TableHead>
              <TableHead className="text-center">{t("access.entity")}</TableHead>
              <TableHead className="text-center">{t("access.reason")}</TableHead>
              <TableHead className="text-center">{t("access.status")}</TableHead>
              <TableHead className="text-center">{t("access.date")}</TableHead>
              <TableHead className="text-center">{t("access.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="text-center">
                  <div>
                    <div className="font-medium">{req.requester_name}</div>
                    <div className="text-xs text-muted-foreground">{req.requester_email}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center capitalize">{req.entity_slug}</TableCell>
                <TableCell className="text-center max-w-[200px] truncate">{req.reason || "—"}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={statusVariant[req.status] || "secondary"}>
                    {t(statusTranslation[req.status] || req.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-sm">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-center">
                  {req.status === "Pending" && (
                    <div className="flex gap-1 justify-center" dir="ltr">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-primary h-8 w-8 p-0" onClick={() => updateRequest.mutate({ id: req.id, status: "Approved" })}>
                            <Check className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("tooltip.approve")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => updateRequest.mutate({ id: req.id, status: "Rejected" })}>
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("tooltip.reject")}</TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("portal.no_results")}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
