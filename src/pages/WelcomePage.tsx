import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogIn, Sparkles, Shield, BarChart3, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login, isAuthenticated } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import mtLogo from "@/assets/mt-logo.svg";

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

      {/* Animated aurora streaks */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[800px] h-[2px] rotate-[25deg] opacity-[0.08]"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(153,100%,40%), transparent)",
            animation: "aurora 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-[20%] right-1/4 w-[600px] h-[1px] -rotate-[15deg] opacity-[0.06]"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(153,80%,50%), transparent)",
            animation: "aurora 12s ease-in-out infinite 2s",
          }}
        />
        <div
          className="absolute bottom-[30%] left-1/3 w-[500px] h-[1px] rotate-[10deg] opacity-[0.05]"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(153,60%,45%), transparent)",
            animation: "aurora 10s ease-in-out infinite 4s",
          }}
        />
      </div>

      {/* Floating particles */}
      {[
        { top: "12%", left: "18%", size: "3px", delay: "0s", duration: "4s" },
        { top: "28%", left: "78%", size: "2px", delay: "1s", duration: "5s" },
        { top: "65%", left: "12%", size: "2px", delay: "2s", duration: "6s" },
        { top: "45%", left: "85%", size: "3px", delay: "0.5s", duration: "4.5s" },
        { top: "80%", left: "45%", size: "2px", delay: "1.5s", duration: "5.5s" },
        { top: "20%", left: "55%", size: "2px", delay: "3s", duration: "7s" },
        { top: "70%", left: "70%", size: "3px", delay: "2.5s", duration: "4s" },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/40"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `float ${p.duration} ease-in-out infinite ${p.delay}`,
          }}
        />
      ))}

      {/* Soft glow orbs */}
      <div className="absolute top-[-15%] right-[5%] w-[700px] h-[700px] rounded-full bg-primary/[0.04] blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[0%] w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[140px]" />
      <div className="absolute top-[35%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-primary/[0.06] blur-[100px]" />

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
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
        {/* Ministry logo with elegant glow */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-primary/15 blur-3xl rounded-full scale-[2]" />
          <img
            src={mtLogo}
            alt="Ministry of Tourism"
            className="relative h-20 md:h-24 brightness-0 invert opacity-95 drop-shadow-[0_0_30px_hsl(153,100%,40%,0.2)]"
          />
        </div>

        {/* Decorative line */}
        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-10" />

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

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-8 mb-6">
          {[
            { icon: Shield, label: t("app.secure_login") },
            { icon: BarChart3, label: t("app.tagline") && "Analytics" },
            { icon: Globe, label: t("app.tagline") && "Multi-language" },
          ].map(({ icon: Icon, label }, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm"
              style={{
                transitionDelay: `${i * 100 + 500}ms`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(10px)",
                transition: "all 0.6s ease-out",
              }}
            >
              <Icon className="h-3 w-3 text-primary/70" />
              <span className="text-[11px] text-white/35 font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Secure note */}
        <p className="text-[11px] text-white/20 mt-4 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          {t("app.secure_login")}
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes aurora {
          0%, 100% { transform: translateX(-100px) rotate(var(--tw-rotate, 0)); opacity: 0.03; }
          50% { transform: translateX(100px) rotate(var(--tw-rotate, 0)); opacity: 0.1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
