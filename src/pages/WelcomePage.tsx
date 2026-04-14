import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login, isAuthenticated } from "@/lib/auth";
import { useLanguage } from "@/lib/language";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (isAuthenticated()) navigate("/portal", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
          <LayoutDashboard className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          {t("app.name")}
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          {t("app.tagline")}
        </p>
        <Button size="lg" className="gap-2 text-base px-8 h-12" onClick={login}>
          <LogIn className="h-5 w-5" />
          {t("btn.login")}
        </Button>
        <p className="text-xs text-muted-foreground mt-6">{t("app.secure_login")}</p>
      </div>
    </div>
  );
}
