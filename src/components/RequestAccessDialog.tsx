import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useCreateAccessRequest } from "@/hooks/use-access-requests";
import { DynamicIcon } from "@/components/DynamicIcon";
import type { EntitySummary } from "@/lib/api";

interface Props {
  entity: EntitySummary | null;
  onClose: () => void;
}

export function RequestAccessDialog({ entity, onClose }: Props) {
  const { t, language } = useLanguage();
  const [reason, setReason] = useState("");
  const mutation = useCreateAccessRequest();

  const handleSubmit = () => {
    if (!entity) return;
    mutation.mutate(
      { entities: [entity.slug], reason: reason || undefined },
      {
        onSuccess: () => {
          setReason("");
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const name = entity ? (language === "ar" ? entity.name_ar : entity.name) : "";

  return (
    <Dialog open={!!entity} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            {t("request.title")}
          </DialogTitle>
        </DialogHeader>

        {entity && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${entity.color}20` }}
              >
                <DynamicIcon name={entity.icon} className="h-5 w-5" style={{ color: entity.color }} />
              </div>
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-xs text-muted-foreground font-mono mb-1">{entity.display_id || entity.id}</p>
                <p className="text-sm text-muted-foreground">{language === "ar" ? (entity.description_ar || entity.description) : entity.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("request.reason")}</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("request.reason_placeholder")}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("btn.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "..." : t("btn.request_access")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
