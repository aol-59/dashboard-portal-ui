import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { useAdminUsers, useCreateAdminUser, useUpdateAdminUser, useToggleAdmin } from "@/hooks/use-admin-users";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, ShieldCheck, ShieldOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const { data: users, isLoading } = useAdminUsers();
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const toggleAdminMut = useToggleAdmin();
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<{ id: string; display_name: string; department: string } | null>(null);
  const [form, setForm] = useState({ email: "", display_name: "", department: "" });

  const handleAdd = () => {
    createUser.mutate(form, { onSuccess: () => { setAddOpen(false); setForm({ email: "", display_name: "", department: "" }); } });
  };

  const handleEdit = () => {
    if (!editUser) return;
    updateUser.mutate({ id: editUser.id, display_name: editUser.display_name, department: editUser.department }, {
      onSuccess: () => setEditUser(null),
    });
  };

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("nav.users")}</h1>
        <Button onClick={() => setAddOpen(true)} className="gap-2"><Plus className="h-4 w-4" />{t("btn.add_user")}</Button>
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
            {(users || []).map((u) => (
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
                  <div className="flex items-center gap-2" dir="ltr">
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
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("btn.add_user")}</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("admin.email")}</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>{t("admin.display_name")}</Label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
            <div><Label>{t("admin.department")}</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>{t("btn.cancel")}</Button>
            <Button onClick={handleAdd} disabled={createUser.isPending}>{t("btn.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("btn.edit")}</DialogTitle>
            <DialogDescription>Edit user details</DialogDescription>
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
