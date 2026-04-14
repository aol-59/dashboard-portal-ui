import { Home, KeyRound, ClipboardList, Users, ShieldCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/lib/language";
import { usePortalSummary } from "@/hooks/use-portal";
import { DynamicIcon } from "@/components/DynamicIcon";
import mtLogo from "@/assets/mt-logo.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { t, language } = useLanguage();
  const { data: summary } = usePortalSummary();
  const location = useLocation();
  const isAdmin = summary?.user?.is_admin ?? false;

  const portalItems = [
    { title: t("nav.home"), url: "/portal", icon: Home },
    { title: t("nav.request_access"), url: "/portal/request-access", icon: KeyRound },
  ];

  const adminItems = [
    { title: t("nav.users"), url: "/admin/users", icon: Users },
    { title: t("nav.access_mgmt"), url: "/admin/access", icon: ShieldCheck },
    { title: t("nav.access_requests"), url: "/portal/access-requests", icon: ClipboardList },
  ];

  return (
    <Sidebar collapsible="icon" side={language === "ar" ? "right" : "left"}>
      <SidebarHeader className="flex items-center justify-center py-4">
        <img src={mtLogo} alt="Ministry of Tourism" className={collapsed ? "h-6" : "h-10"} style={{ filter: "brightness(0) invert(1)" }} />
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.portal")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {portalItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
                      <item.icon className="h-4 w-4 me-2" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {summary?.entities && summary.entities.filter(e => ["admin","owner","viewer"].includes(e.access_status)).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav.dashboards")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {summary.entities.filter(e => ["admin","owner","viewer"].includes(e.access_status)).map((entity) => (
                  <SidebarMenuItem key={entity.slug}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/dashboard/${entity.slug}`}
                        className="hover:bg-accent/50"
                        activeClassName="bg-accent text-accent-foreground font-medium"
                      >
                        <DynamicIcon name={entity.icon} className="h-4 w-4 me-2" style={{ color: entity.color }} />
                        {!collapsed && <span>{language === "ar" ? entity.name_ar : entity.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav.admin")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
                        <item.icon className="h-4 w-4 me-2" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
