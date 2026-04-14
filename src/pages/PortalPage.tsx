import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Lock, Clock, Shield, Eye, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { usePortalSummary } from "@/hooks/use-portal";
import { DynamicIcon } from "@/components/DynamicIcon";
import { RequestAccessDialog } from "@/components/RequestAccessDialog";
import type { EntitySummary } from "@/lib/api";

const statusConfig = {
  admin: { label: "Admin", labelAr: "مسؤول", icon: Shield, color: "bg-red-500/10 text-red-500 border-red-500/20" },
  owner: { label: "Owner", labelAr: "مالك", icon: Crown, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  viewer: { label: "Viewer", labelAr: "مشاهد", icon: Eye, color: "bg-green-500/10 text-green-500 border-green-500/20" },
  pending: { label: "Pending", labelAr: "قيد الانتظار", icon: Clock, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  locked: { label: "Locked", labelAr: "مقفل", icon: Lock, color: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20" },
};

type FilterType = "all" | "accessible" | "locked" | "pending";

export default function PortalPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: summary } = usePortalSummary();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [requestEntity, setRequestEntity] = useState<EntitySummary | null>(null);

  const filteredEntities = useMemo(() => {
    if (!summary?.entities) return [];
    let list = summary.entities;

    if (filter === "accessible") {
      list = list.filter((e) => ["admin", "owner", "viewer"].includes(e.access_status));
    } else if (filter === "locked") {
      list = list.filter((e) => e.access_status === "locked");
    } else if (filter === "pending") {
      list = list.filter((e) => e.access_status === "pending");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.name_ar.toLowerCase().includes(q) ||
          e.slug.toLowerCase().includes(q) ||
          (e.display_id && e.display_id.toLowerCase().includes(q)) ||
          String(e.id).includes(q)
      );
    }

    return list;
  }, [summary?.entities, search, filter]);

  const handleCardClick = (entity: EntitySummary) => {
    if (entity.access_status === "locked") {
      setRequestEntity(entity);
    } else if (entity.access_status !== "pending") {
      navigate(`/dashboard/${entity.slug}`);
    }
  };

  const hasAccess = (status: string) => ["admin", "owner", "viewer"].includes(status);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t("portal.filter_all") },
    { key: "accessible", label: t("portal.filter_accessible") },
    { key: "locked", label: t("portal.filter_locked") },
    { key: "pending", label: t("portal.filter_pending") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {t("welcome.greeting")}, {summary?.user?.display_name}
        </h1>
        <p className="text-muted-foreground">{t("portal.entities")}</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("portal.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
              className="text-xs"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Entity Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredEntities.map((entity) => {
          const cfg = statusConfig[entity.access_status] || statusConfig.locked;
          const isLocked = entity.access_status === "locked";
          const isPending = entity.access_status === "pending";
          const isAccessible = hasAccess(entity.access_status);
          const name = language === "ar" ? entity.name_ar : entity.name;
          const desc = language === "ar" ? (entity.description_ar || entity.description) : entity.description;

          return (
            <Card
              key={entity.slug}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                isAccessible ? "cursor-pointer" : ""
              } ${isLocked ? "opacity-70 hover:opacity-90 cursor-pointer" : ""} ${
                isPending ? "opacity-80 cursor-default" : ""
              }`}
              onClick={() => handleCardClick(entity)}
            >
              <div
                className="absolute top-0 inset-x-0 h-1"
                style={{ backgroundColor: isAccessible ? entity.color : "hsl(var(--muted))" }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: isAccessible ? `${entity.color}20` : "hsl(var(--muted))",
                      }}
                    >
                      {isLocked ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <DynamicIcon name={entity.icon} className="h-5 w-5" style={{ color: entity.color }} />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{name}</CardTitle>
                      <span className="text-xs text-muted-foreground font-mono">{entity.display_id || entity.id}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                    <cfg.icon className="h-3 w-3 me-1" />
                    {language === "ar" ? cfg.labelAr : cfg.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{desc}</p>
                {isLocked && (
                  <p className="text-xs text-primary mt-2 font-medium">{t("portal.click_to_request")}</p>
                )}
                {isPending && (
                  <p className="text-xs text-yellow-500 mt-2 font-medium">{t("portal.request_pending")}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEntities.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {search || filter !== "all" ? t("portal.no_results") : t("portal.no_entities")}
        </div>
      )}

      <RequestAccessDialog entity={requestEntity} onClose={() => setRequestEntity(null)} />
    </div>
  );
}
