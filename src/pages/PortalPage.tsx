import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/language";
import { usePortalSummary } from "@/hooks/use-portal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicIcon } from "@/components/DynamicIcon";
import { KeyRound } from "lucide-react";

export default function PortalPage() {
  const { t, language } = useLanguage();
  const { data, isLoading, error, refetch } = usePortalSummary();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-destructive">Failed to load dashboard data</p>
        <Button onClick={() => refetch()}>{t("btn.retry")}</Button>
      </div>
    );
  }

  const user = data?.user;
  const entities = data?.entities || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("welcome.greeting")}, {user?.display_name} 👋</h1>
        <p className="text-muted-foreground">{t("portal.entities")}</p>
      </div>

      {entities.length === 0 ? (
        <Card className="max-w-md mx-auto text-center py-12">
          <CardContent className="space-y-4">
            <KeyRound className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">{t("welcome.no_entities")}</h2>
            <p className="text-muted-foreground">{t("welcome.no_entities_desc")}</p>
            <Button onClick={() => navigate("/portal/request-access")}>{t("btn.request_access")}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {entities.map((entity) => (
            <Card
              key={entity.slug}
              className="cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden"
              onClick={() => navigate(`/dashboard/${entity.slug}`)}
            >
              <div className="absolute top-0 inset-x-0 h-1" style={{ backgroundColor: entity.color }} />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${entity.color}20` }}>
                    <DynamicIcon name={entity.icon} className="h-5 w-5" style={{ color: entity.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{language === "ar" ? entity.name_ar : entity.name}</CardTitle>
                    <CardDescription className="text-xs capitalize">{entity.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{entity.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
