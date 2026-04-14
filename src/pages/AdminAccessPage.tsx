import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { usePortalSummary } from "@/hooks/use-portal";
import { useEntityAccess, useGrantEntityAccess, useRevokeEntityAccess } from "@/hooks/use-entity-access";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Trash2, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AdminAccessPage() {
  const { t, language } = useLanguage();
  const { data: summary } = usePortalSummary();
  const entities = summary?.entities || [];
  const [selectedSlug, setSelectedSlug] = useState(entities[0]?.slug || "");
  const [comboOpen, setComboOpen] = useState(false);
  const { data: access, isLoading } = useEntityAccess(selectedSlug);
  const grantAccess = useGrantEntityAccess();
  const revokeAccess = useRevokeEntityAccess();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ user_id: "", role: "viewer" });

  if (!selectedSlug && entities.length > 0) {
    setSelectedSlug(entities[0].slug);
  }

  const selectedEntity = entities.find((e) => e.slug === selectedSlug);
  const selectedLabel = selectedEntity
    ? `${selectedEntity.display_id} — ${language === "ar" ? selectedEntity.name_ar : selectedEntity.name}`
    : t("admin.select_entity");

  const handleGrant = () => {
    grantAccess.mutate({ user_id: form.user_id, entity_slug: selectedSlug, role: form.role }, {
      onSuccess: () => { setAddOpen(false); setForm({ user_id: "", role: "viewer" }); },
    });
  };

  const renderTable = (title: string, users: typeof access extends { owners: infer T } ? T : never) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-20" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">{t("admin.name")}</TableHead>
                <TableHead className="text-center">{t("admin.email")}</TableHead>
                <TableHead className="text-center">{t("admin.department")}</TableHead>
                <TableHead className="text-center">{t("admin.assigned_at")}</TableHead>
                <TableHead className="text-center">{t("admin.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users || []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-center">{u.display_name}</TableCell>
                  <TableCell className="text-center">{u.email}</TableCell>
                  <TableCell className="text-center">{u.department || "—"}</TableCell>
                  <TableCell className="text-center text-sm">{new Date(u.assigned_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => revokeAccess.mutate(u.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t("tooltip.remove")}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {(!users || users.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">{t("portal.no_results")}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("nav.access_mgmt")}</h1>
        <Button onClick={() => setAddOpen(true)} className="gap-2" disabled={!selectedSlug}>
          <Plus className="h-4 w-4" />{t("btn.add_access")}
        </Button>
      </div>

      {/* Entity selector — searchable dropdown */}
      <Popover open={comboOpen} onOpenChange={setComboOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={comboOpen} className="max-w-md w-full justify-between">
            {selectedLabel}
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
          <Command>
            <CommandInput placeholder={t("portal.search")} />
            <CommandList>
              <CommandEmpty>{t("portal.no_results")}</CommandEmpty>
              <CommandGroup>
                {entities.map((e) => {
                  const name = language === "ar" ? e.name_ar : e.name;
                  return (
                    <CommandItem
                      key={e.slug}
                      value={`${e.display_id} ${e.name} ${e.name_ar} ${e.slug}`}
                      onSelect={() => { setSelectedSlug(e.slug); setComboOpen(false); }}
                    >
                      <Check className={cn("me-2 h-4 w-4", selectedSlug === e.slug ? "opacity-100" : "opacity-0")} />
                      <span className="font-mono text-xs me-2 opacity-60">{e.display_id}</span>
                      {name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSlug && (
        <div className="space-y-4">
          {renderTable(t("admin.owners"), access?.owners || [])}
          {renderTable(t("admin.viewers"), access?.viewers || [])}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("btn.add_access")}</DialogTitle>
            <DialogDescription>{t("nav.access_mgmt")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("admin.select_user")} (ID)</Label><Input value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} placeholder="User ID" /></div>
            <div>
              <Label>{t("admin.select_role")}</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">{t("admin.owner")}</SelectItem>
                  <SelectItem value="viewer">{t("admin.viewer")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>{t("btn.cancel")}</Button>
            <Button onClick={handleGrant} disabled={grantAccess.isPending || !form.user_id}>{t("btn.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
