import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Lock, Clock, Shield, Eye, Crown, Building2, CheckCircle2, AlertCircle } from "lucide-react";
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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function PortalPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: summary } = usePortalSummary();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [requestEntity, setRequestEntity] = useState<EntitySummary | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    if (!summary?.entities) return { total: 0, accessible: 0, pending: 0 };
    return {
      total: summary.entities.length,
      accessible: summary.entities.filter(e => ["admin", "owner", "viewer"].includes(e.access_status)).length,
      pending: summary.entities.filter(e => e.access_status === "pending").length,
    };
  }, [summary?.entities]);

  const filteredEntities = useMemo(() => {
    if (!summary?.entities) return [];
    let list = summary.entities;
    if (filter === "accessible") list = list.filter(e => ["admin", "owner", "viewer"].includes(e.access_status));
    else if (filter === "locked") list = list.filter(e => e.access_status === "locked");
    else if (filter === "pending") list = list.filter(e => e.access_status === "pending");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) || e.name_ar.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) || (e.display_id && e.display_id.toLowerCase().includes(q)) ||
        String(e.id).includes(q)
      );
    }
    return list;
  }, [summary?.entities, search, filter]);

  const handleCardClick = (entity: EntitySummary) => {
    if (entity.access_status === "locked") setRequestEntity(entity);
    else if (entity.access_status !== "pending") navigate(`/dashboard/${entity.slug}`);
  };

  const hasAccess = (status: string) => ["admin", "owner", "viewer"].includes(status);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t("portal.filter_all") },
    { key: "accessible", label: t("portal.filter_accessible") },
    { key: "locked", label: t("portal.filter_locked") },
    { key: "pending", label: t("portal.filter_pending") },
  ];

  const statCards = [
    { label: "Total Entities", value: stats.total, icon: Building2, gradient: "from-primary/20 to-primary/5" },
    { label: "Accessible", value: stats.accessible, icon: CheckCircle2, gradient: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Pending", value: stats.pending, icon: AlertCircle, gradient: "from-yellow-500/20 to-yellow-500/5" },
  ];

  return (
    <div className="relative min-h-full space-y-8">
      {/* Subtle background mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Hero Section */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        <div className="relative z-10">
          <p className="text-sm font-medium text-primary/70 mb-1">{getGreeting()}</p>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {summary?.user?.display_name || "—"}
          </h1>
          <p className="text-muted-foreground text-sm">{t("portal.entities")}</p>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 mt-6 grid grid-cols-3 gap-4">
          {statCards.map((s, i) => (
            <div
              key={s.label}
              className={`rounded-xl bg-gradient-to-br ${s.gradient} backdrop-blur-sm border border-white/10 dark:border-white/5 p-4 transition-all duration-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${150 + i * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div
        className={`flex flex-col sm:flex-row gap-3 sm:items-center transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "400ms" }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("portal.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9 rounded-xl bg-background/60 backdrop-blur-sm border-border/50 h-11"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
              className={`rounded-full text-xs px-4 transition-all duration-200 ${
                filter !== f.key ? "bg-background/60 backdrop-blur-sm border-border/50" : ""
              }`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Entity Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredEntities.map((entity, idx) => {
          const cfg = statusConfig[entity.access_status] || statusConfig.locked;
          const isLocked = entity.access_status === "locked";
          const isPending = entity.access_status === "pending";
          const isAccessible = hasAccess(entity.access_status);
          const name = language === "ar" ? entity.name_ar : entity.name;
          const desc = language === "ar" ? (entity.description_ar || entity.description) : entity.description;

          return (
            <div
              key={entity.slug}
              className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                isAccessible
                  ? "bg-card/80 border-border/50 cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30"
                  : isLocked
                  ? "bg-card/40 border-border/30 opacity-70 hover:opacity-90 cursor-pointer"
                  : "bg-card/50 border-border/30 opacity-80 cursor-default"
              } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{
                transitionDelay: mounted ? `${500 + idx * 80}ms` : "0ms",
                transitionDuration: "500ms",
              }}
              onClick={() => handleCardClick(entity)}
            >
              {/* Left accent bar */}
              <div
                className="absolute start-0 top-0 bottom-0 w-1 rounded-s-2xl transition-all duration-300"
                style={{
                  background: isAccessible
                    ? `linear-gradient(to bottom, ${entity.color}, ${entity.color}80)`
                    : "hsl(var(--muted))",
                }}
              />

              <div className="p-5 ps-6">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: isAccessible
                        ? `linear-gradient(135deg, ${entity.color}30, ${entity.color}10)`
                        : "hsl(var(--muted))",
                    }}
                  >
                    {isLocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <DynamicIcon name={entity.icon} className="h-5 w-5" style={{ color: entity.color }} />
                    )}
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
                    <cfg.icon className="h-3 w-3 me-1" />
                    {language === "ar" ? cfg.labelAr : cfg.label}
                  </Badge>
                </div>

                <h3 className="text-base font-semibold text-foreground mb-0.5">{name}</h3>
                <span className="text-[11px] text-muted-foreground font-mono">{entity.display_id || entity.id}</span>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{desc}</p>

                {isLocked && (
                  <p className="text-xs text-primary mt-3 font-medium">{t("portal.click_to_request")}</p>
                )}
                {isPending && (
                  <p className="text-xs text-yellow-500 mt-3 font-medium">{t("portal.request_pending")}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredEntities.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          {search || filter !== "all" ? t("portal.no_results") : t("portal.no_entities")}
        </div>
      )}

      <RequestAccessDialog entity={requestEntity} onClose={() => setRequestEntity(null)} />
    </div>
  );
}
