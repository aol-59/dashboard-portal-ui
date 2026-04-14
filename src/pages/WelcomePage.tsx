import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LayoutDashboard, LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login, isAuthenticated } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import mtLogo from "@/assets/mt-logo.svg";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (isAuthenticated()) navigate("/portal", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[hsl(160,30%,8%)]">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(160,40%,12%)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(160,30%,10%)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(160,25%,8%)_0%,transparent_50%)]" />
      </div>

      {/* Floating particles */}
      <div className="absolute top-[15%] left-[20%] w-1 h-1 rounded-full bg-primary/30 animate-pulse" />
      <div className="absolute top-[30%] right-[25%] w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse [animation-delay:1s]" />
      <div className="absolute bottom-[25%] left-[30%] w-1 h-1 rounded-full bg-primary/25 animate-pulse [animation-delay:2s]" />
      <div className="absolute top-[60%] right-[15%] w-1 h-1 rounded-full bg-primary/20 animate-pulse [animation-delay:0.5s]" />
      <div className="absolute bottom-[40%] left-[10%] w-1.5 h-1.5 rounded-full bg-primary/15 animate-pulse [animation-delay:1.5s]" />

      {/* Soft glow orbs */}
      <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[100px]" />
      <div className="absolute bottom-[-15%] left-[5%] w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-primary/[0.05] blur-[80px]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(160,40%,50%) 1px, transparent 1px), linear-gradient(90deg, hsl(160,40%,50%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl">
        {/* Logo with glow */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
          <div className="relative h-24 w-24 rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-[0_0_40px_hsl(160,40%,40%,0.15)]">
            <LayoutDashboard className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* Ministry logo */}
        <img
          src={mtLogo}
          alt="Ministry of Tourism"
          className="h-14 mb-8 brightness-0 invert opacity-90"
        />

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5 leading-tight">
          {t("app.name")}
        </h1>

        {/* Tagline */}
        <p className="text-white/50 text-lg md:text-xl mb-10 max-w-md leading-relaxed">
          {t("app.tagline")}
        </p>

        {/* Login button with glow */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-primary/30 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          <Button
            size="lg"
            className="relative gap-3 text-base px-10 h-14 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
            onClick={login}
          >
            <LogIn className="h-5 w-5" />
            {t("btn.login")}
          </Button>
        </div>

        {/* Secure login note */}
        <p className="text-xs text-white/30 mt-8 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          {t("app.secure_login")}
        </p>
      </div>
    </div>
  );
}
