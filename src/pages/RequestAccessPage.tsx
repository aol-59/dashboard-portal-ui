import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { usePortalSummary } from "@/hooks/use-portal";
import { useCreateAccessRequest } from "@/hooks/use-access-requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicIcon } from "@/components/DynamicIcon";

export default function RequestAccessPage() {
  const { t, language } = useLanguage();
  const { data, isLoading } = usePortalSummary();
  const createRequest = useCreateAccessRequest();
  const [selected, setSelected] = useState<string[]>([]);
  const [reason, setReason] = useState("");

  // In a real scenario, we'd show entities NOT in user's access list.
  // For mock, we show all entities.
  const entities = data?.entities || [];

  const toggle = (slug: string) => {
    setSelected((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    createRequest.mutate({ entities: selected, reason: reason || undefined }, {
      onSuccess: () => { setSelected([]); setReason(""); },
    });
  };

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{t("request.title")}</h1>
      <p className="text-muted-foreground">{t("request.select_entities")}</p>

      <div className="space-y-2">
        {entities.map((entity) => (
          <Card key={entity.slug} className={`cursor-pointer transition-colors ${selected.includes(entity.slug) ? "border-primary bg-accent/30" : ""}`} onClick={() => toggle(entity.slug)}>
            <CardContent className="flex items-center gap-3 py-3">
              <Checkbox checked={selected.includes(entity.slug)} className="direction-ltr" />
              <DynamicIcon name={entity.icon} className="h-5 w-5" style={{ color: entity.color }} />
              <span className="font-medium">{language === "ar" ? entity.name_ar : entity.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Textarea
        placeholder={t("request.reason")}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="max-w-lg"
      />

      <Button onClick={handleSubmit} disabled={selected.length === 0 || createRequest.isPending}>
        {createRequest.isPending ? "..." : t("btn.submit")}
      </Button>
    </div>
  );
}
