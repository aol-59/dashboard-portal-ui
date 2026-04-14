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
  admin: { label: "Admin", labelAr: "مسؤول", icon: Shield, color: "text-red-400 border-red-500/30 bg-red-500/10" },
  owner: { label: "Owner", labelAr: "مالك", icon: Crown, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  viewer: { label: "Viewer", labelAr: "مشاهد", icon: Eye, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  pending: { label: "Pending", labelAr: "قيد الانتظار", icon: Clock, color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
  locked: { label: "Locked", labelAr: "مقفل", icon: Lock, color: "text-muted-foreground border-muted/40 bg-muted/20" },
};

type FilterType = "all" | "accessible" | "locked" | "pending";

function getGreeting(lang: string): string {
  const h = new Date().getHours();
  if (lang === "ar") {
    if (h < 12) return "صباح الخير";
    if (h < 17) return "مساء الخير";
    return "مساء الخير";
  }
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
    { label: language === "ar" ? "إجمالي الكيانات" : "Total Entities", value: stats.total, icon: Building2, accentColor: "hsl(var(--primary))" },
    { label: language === "ar" ? "متاح" : "Accessible", value: stats.accessible, icon: CheckCircle2, accentColor: "hsl(142, 76%, 36%)" },
    { label: language === "ar" ? "قيد الانتظار" : "Pending", value: stats.pending, icon: AlertCircle, accentColor: "hsl(38, 92%, 50%)" },
  ];

  return (
    <div className="relative min-h-full space-y-8 pb-8">
      {/* Background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/3 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute -bottom-1/3 -right-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* ── Hero Banner ── */}
      <div
        className={`relative overflow-hidden rounded-3xl transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #059669 100%)",
        }}
      >
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />
        {/* Shimmer sweep */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
              width: "100%",
            }}
          />
        </div>

        <div className="relative z-10 px-8 py-10 sm:px-10 sm:py-12">
          <p className="text-emerald-200/80 text-sm font-medium tracking-wide uppercase mb-2">
            {getGreeting(language)}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
            {summary?.user?.display_name || "—"}
          </h1>
          <p className="text-emerald-100/60 text-base">
            {t("portal.entities")}
          </p>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map((s, i) => (
          <div
            key={s.label}
            className={`relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-xl border border-primary/15 p-6 transition-all duration-600 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{
              transitionDelay: `${200 + i * 120}ms`,
              boxShadow: `0 0 40px -10px ${s.accentColor}20`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center"
                style={{ background: `${s.accentColor}15` }}
              >
                <s.icon className="h-5 w-5" style={{ color: s.accentColor }} />
              </div>
            </div>
            <span className="text-4xl font-bold text-foreground tracking-tight">{s.value}</span>
            <p className="text-sm text-muted-foreground mt-1 font-medium">{s.label}</p>
            {/* Bottom accent */}
            <div
              className="absolute bottom-0 inset-x-0 h-[3px]"
              style={{ background: `linear-gradient(90deg, ${s.accentColor}60, ${s.accentColor}10)` }}
            />
          </div>
        ))}
      </div>

      {/* ── Search + Filters ── */}
      <div
        className={`flex flex-col sm:flex-row gap-4 sm:items-center transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "550ms" }}
      >
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("portal.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-11 rounded-2xl bg-card/50 backdrop-blur-sm border-border/40 h-12 text-base"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
              className={`rounded-full text-xs px-5 h-9 font-medium transition-all duration-200 ${
                filter === f.key
                  ? "shadow-lg shadow-primary/20"
                  : "bg-card/50 backdrop-blur-sm border-border/40 hover:bg-card/80"
              }`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Entity Grid ── */}
      <div className="relative">
        {/* Dot grid behind cards */}
        <div className="absolute inset-0 -z-10 dot-grid-bg rounded-3xl" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEntities.map((entity, idx) => {
            const cfg = statusConfig[entity.access_status] || statusConfig.locked;
            const isLocked = entity.access_status === "locked";
            const isPending = entity.access_status === "pending";
            const isAccessible = hasAccess(entity.access_status);
            const name = language === "ar" ? entity.name_ar : entity.name;
            const desc = language === "ar" ? (entity.description_ar || entity.description) : entity.description;
            const entityColor = isAccessible ? entity.color : "hsl(var(--muted-foreground))";

            return (
              <div
                key={entity.slug}
                className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                  isAccessible
                    ? "bg-card/70 border-border/40 cursor-pointer hover:scale-[1.03] hover:-translate-y-1"
                    : isLocked
                    ? "bg-card/30 border-border/20 opacity-60 hover:opacity-85 cursor-pointer"
                    : "bg-card/40 border-border/20 opacity-70 cursor-default"
                } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  transitionDelay: mounted ? `${600 + idx * 70}ms` : "0ms",
                  transitionDuration: "500ms",
                  ...(isAccessible ? {
                    "--hover-shadow": `0 20px 60px -15px ${entity.color}30`,
                  } as React.CSSProperties : {}),
                }}
                onClick={() => handleCardClick(entity)}
                onMouseEnter={(e) => {
                  if (isAccessible) {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px -15px ${entity.color}35`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${entity.color}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                  (e.currentTarget as HTMLElement).style.borderColor = "";
                }}
              >
                {/* Top gradient border */}
                <div
                  className="h-[3px] w-full"
                  style={{
                    background: isAccessible
                      ? `linear-gradient(90deg, ${entity.color}, ${entity.color}40)`
                      : "hsl(var(--muted))",
                  }}
                />

                {/* Shimmer overlay on hover */}
                {isAccessible && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                    <div
                      className="absolute inset-0 animate-shimmer"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
                      }}
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Icon */}
                  <div className="mb-5">
                    <div
                      className="h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: isAccessible
                          ? `linear-gradient(135deg, ${entity.color}20, ${entity.color}08)`
                          : "hsl(var(--muted))",
                        boxShadow: isAccessible ? `0 0 25px ${entity.color}25` : "none",
                      }}
                    >
                      {isLocked ? (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <DynamicIcon name={entity.icon} className="h-6 w-6" style={{ color: entityColor }} />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-1 tracking-tight">{name}</h3>
                  <span className="text-[11px] text-muted-foreground/60 font-mono">{entity.display_id || entity.id}</span>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-3 leading-relaxed">{desc}</p>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] font-medium ${cfg.color}`}>
                      <cfg.icon className="h-3 w-3 me-1" />
                      {language === "ar" ? cfg.labelAr : cfg.label}
                    </Badge>

                    {isLocked && (
                      <span className="text-xs text-primary font-medium">{t("portal.click_to_request")}</span>
                    )}
                    {isPending && (
                      <span className="text-xs text-yellow-500 font-medium">{t("portal.request_pending")}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredEntities.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          {search || filter !== "all" ? t("portal.no_results") : t("portal.no_entities")}
        </div>
      )}

      <RequestAccessDialog entity={requestEntity} onClose={() => setRequestEntity(null)} />
    </div>
  );
}
