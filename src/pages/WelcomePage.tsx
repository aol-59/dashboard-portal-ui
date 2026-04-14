import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login, isAuthenticated } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import SaudiMapAnimation from "@/components/SaudiMapAnimation";
import AnimatedCharts from "@/components/AnimatedCharts";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) navigate("/portal", { replace: true });
    setTimeout(() => setMounted(true), 100);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[hsl(160,30%,6%)]">
      {/* Layered gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(160,50%,15%)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,hsl(160,40%,10%)_0%,transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,hsl(153,50%,8%)_0%,transparent_40%)]" />
      </div>

      {/* Saudi Arabia map animation */}
      <SaudiMapAnimation />

      {/* Animated charts in background */}
      <AnimatedCharts />

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(153,100%,50%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-6 max-w-2xl transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5 leading-tight">
          {t("app.name")}
        </h1>

        {/* Tagline */}
        <p className="text-white/45 text-lg md:text-xl mb-12 max-w-md leading-relaxed">
          {t("app.tagline")}
        </p>

        {/* Login button with premium glow */}
        <div className="relative group mb-6">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-all duration-700" />
          <Button
            size="lg"
            className="relative gap-3 text-base px-12 h-14 rounded-xl font-semibold shadow-[0_0_30px_hsl(153,100%,30%,0.2)] hover:shadow-[0_0_50px_hsl(153,100%,30%,0.35)] transition-all duration-500 hover:scale-[1.02]"
            onClick={login}
          >
            <LogIn className="h-5 w-5" />
            {t("btn.login")}
          </Button>
        </div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-6 inset-x-0 text-center z-10">
        <p className="text-xs text-white/30">{t("app.agency")}</p>
      </div>
    </div>
  );
}
