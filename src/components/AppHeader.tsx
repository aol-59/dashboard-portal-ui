import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Globe, LogOut, Bell, Settings, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import mtLogo from "@/assets/mt-logo.svg";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/lib/language";
import { useTheme } from "@/lib/dark-mode";
import { useAuth } from "@/hooks/use-auth";
import { useNotificationCount, useNotifications } from "@/hooks/use-notifications";
import { logout } from "@/lib/auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function formatHijriDate(date: Date, lang: string): string {
  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA-u-ca-islamic-umalqura" : "en-US-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

function formatGregorianDate(date: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function AppHeader() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { data: user } = useAuth();
  const { data: countData } = useNotificationCount();
  const { data: notifications } = useNotifications();
  const now = useCurrentTime();

  const count = countData?.count ?? 0;
  const isAdminOrOwner = user?.is_admin || (user?.owned_entities && user.owned_entities.length > 0);

  const initials = user?.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const roleName = user?.is_admin
    ? (language === "ar" ? "مدير النظام" : "System Admin")
    : (language === "ar" ? "مستخدم" : "User");

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return language === "ar" ? "الآن" : "just now";
    if (mins < 60) return language === "ar" ? `منذ ${mins} دقيقة` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return language === "ar" ? `منذ ${hrs} ساعة` : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return language === "ar" ? `منذ ${days} يوم` : `${days}d ago`;
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 shrink-0">
      {/* Left: Sidebar trigger + Logo + App name */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <img src={mtLogo} alt="Logo" className="h-10 hidden sm:block dark:brightness-0 dark:invert" />
        <div className="hidden lg:block">
          <span className="font-bold text-base text-foreground">{t("app.name")}</span>
        </div>
      </div>

      {/* Center: Date + Time */}
      <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatHijriDate(now, language)}</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-xs">{formatGregorianDate(now, language)}</span>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono">{formatTime(now, language)}</span>
        </div>
      </div>

      {/* Right: Actions + User */}
      <div className="flex items-center gap-1">
        {/* Notification Bell */}
        {isAdminOrOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Bell className="h-4 w-4" />
                {count > 0 && (
                  <Badge className="absolute -top-1 -end-1 h-4 min-w-4 flex items-center justify-center p-0 text-[9px] bg-destructive text-destructive-foreground">
                    {count > 99 ? "99+" : count}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>{t("notifications.title")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications && notifications.length > 0 ? (
                <>
                  {notifications.slice(0, 5).map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex flex-col items-start gap-1 cursor-pointer"
                      onClick={() => navigate("/portal/access-requests")}
                    >
                      <span className="text-sm font-medium">
                        {n.requester_name} → {language === "ar" ? n.entity_name_ar : n.entity_name}
                      </span>
                      {n.reason && (
                        <span className="text-xs text-muted-foreground line-clamp-1">{n.reason}</span>
                      )}
                      <span className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
                    </DropdownMenuItem>
                  ))}
                  {notifications.length > 5 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-center text-sm text-primary cursor-pointer"
                        onClick={() => navigate("/portal/access-requests")}
                      >
                        {t("notifications.view_all")}
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              ) : (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  {t("notifications.empty")}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{theme === "dark" ? t("theme.light") : t("theme.dark")}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLanguage(language === "en" ? "ar" : "en")}>
              <Globe className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("lang.toggle")}</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* User profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto py-1 px-2 gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start text-start">
                <span className="text-sm font-medium leading-tight">{user?.display_name}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{roleName}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.display_name}</span>
                <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="h-4 w-4 me-2" />
              {t("btn.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
