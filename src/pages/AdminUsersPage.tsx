import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { useAdminUsers, useUpdateAdminUser, useToggleAdmin } from "@/hooks/use-admin-users";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Pencil, ShieldCheck, ShieldOff, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const { data: users, isLoading } = useAdminUsers();
  const updateUser = useUpdateAdminUser();
  const toggleAdminMut = useToggleAdmin();
  const [editUser, setEditUser] = useState<{ id: string; display_name: string; department: string } | null>(null);
  const [search, setSearch] = useState("");

  const handleEdit = () => {
    if (!editUser) return;
    updateUser.mutate({ id: editUser.id, display_name: editUser.display_name, department: editUser.department }, {
      onSuccess: () => setEditUser(null),
    });
  };

  const filtered = (users || []).filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.display_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q) ||
      String(u.id).includes(q)
    );
  });

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("nav.users")}</h1>
      <p className="text-sm text-muted-foreground">{t("admin.users_desc")}</p>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("admin.search_users")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">{t("admin.name")}</TableHead>
              <TableHead className="text-center">{t("admin.email")}</TableHead>
              <TableHead className="text-center">{t("admin.department")}</TableHead>
              <TableHead className="text-center">{t("admin.role")}</TableHead>
              <TableHead className="text-center">{t("admin.status")}</TableHead>
              <TableHead className="text-center">{t("admin.last_login")}</TableHead>
              <TableHead className="text-center">{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-center">{u.display_name}</TableCell>
                <TableCell className="text-center">{u.email}</TableCell>
                <TableCell className="text-center">{u.department || "—"}</TableCell>
                <TableCell className="text-center">{u.is_admin && <Badge>{t("admin.admin")}</Badge>}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={u.is_active ? "default" : "secondary"}>{u.is_active ? t("admin.active") : t("admin.inactive")}</Badge>
                </TableCell>
                <TableCell className="text-center text-sm">{u.last_login ? new Date(u.last_login).toLocaleDateString() : "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 justify-center" dir="ltr">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div><Switch checked={u.is_active} onCheckedChange={(checked) => updateUser.mutate({ id: u.id, is_active: checked })} /></div>
                      </TooltipTrigger>
                      <TooltipContent>{u.is_active ? t("tooltip.deactivate") : t("tooltip.activate")}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditUser({ id: u.id, display_name: u.display_name, department: u.department || "" })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t("tooltip.edit")}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleAdminMut.mutate({ id: u.id, is_admin: !u.is_admin })}>
                          {u.is_admin ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{u.is_admin ? t("tooltip.remove_admin") : t("tooltip.make_admin")}</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t("portal.no_results")}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("btn.edit")}</DialogTitle>
            <DialogDescription>{t("admin.edit_desc")}</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div><Label>{t("admin.display_name")}</Label><Input value={editUser.display_name} onChange={(e) => setEditUser({ ...editUser, display_name: e.target.value })} /></div>
              <div><Label>{t("admin.department")}</Label><Input value={editUser.department} onChange={(e) => setEditUser({ ...editUser, department: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>{t("btn.cancel")}</Button>
            <Button onClick={handleEdit} disabled={updateUser.isPending}>{t("btn.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
