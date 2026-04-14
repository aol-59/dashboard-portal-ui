import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { useAccessRequests, useUpdateAccessRequest } from "@/hooks/use-access-requests";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

export default function AccessRequestsPage() {
  const { t } = useLanguage();
  const { data: requests, isLoading } = useAccessRequests();
  const updateRequest = useUpdateAccessRequest();
  const [tab, setTab] = useState("all");

  const filtered = (requests || []).filter((r) => tab === "all" || r.status.toLowerCase() === tab);

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("access.title")}</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">{t("access.all")}</TabsTrigger>
          <TabsTrigger value="pending">{t("access.pending")}</TabsTrigger>
          <TabsTrigger value="approved">{t("access.approved")}</TabsTrigger>
          <TabsTrigger value="rejected">{t("access.rejected")}</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("access.requester")}</TableHead>
                  <TableHead>{t("access.entity")}</TableHead>
                  <TableHead>{t("access.reason")}</TableHead>
                  <TableHead>{t("access.status")}</TableHead>
                  <TableHead>{t("access.date")}</TableHead>
                  <TableHead>{t("access.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{req.requester_name}</div>
                        <div className="text-xs text-muted-foreground">{req.requester_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{req.entity_slug}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{req.reason || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[req.status] || "secondary"}>{req.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {req.status === "Pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-primary h-8 w-8 p-0" onClick={() => updateRequest.mutate({ id: req.id, status: "Approved" })}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => updateRequest.mutate({ id: req.id, status: "Rejected" })}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No requests found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
