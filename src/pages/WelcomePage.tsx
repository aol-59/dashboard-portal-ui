import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogIn, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login, isAuthenticated } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import SaudiMapAnimation from "@/components/SaudiMapAnimation";
import AnimatedCharts from "@/components/AnimatedCharts";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (isAuthenticated()) navigate("/portal", { replace: true });
    setTimeout(() => setMounted(true), 100);
    const onMove = (e: MouseEvent) => {
      setMouse({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[hsl(160,40%,4%)]">
      {/* Aurora gradient mesh */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, hsl(153,90%,30%,0.25) 0%, transparent 45%)`,
          }}
        />
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-[hsl(153,90%,30%)] opacity-[0.18] blur-[140px] animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[hsl(170,80%,35%)] opacity-[0.15] blur-[130px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(43,90%,50%)] opacity-[0.06] blur-[120px]" />
      </div>

      {/* Saudi map + animated charts */}
      <SaudiMapAnimation />
      <AnimatedCharts />

      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(153,100%,50%) 1px, transparent 1px), linear-gradient(90deg, hsl(153,100%,50%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[hsl(153,100%,60%)]"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              opacity: 0.3 + ((i * 7) % 30) / 100,
              animation: `float-up ${8 + (i % 6)}s linear infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float-up {
          0% { transform: translateY(20px); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
        @keyframes scan-line {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 40px hsl(153,100%,40%,0.3), 0 0 80px hsl(153,100%,40%,0.15); }
          50% { box-shadow: 0 0 60px hsl(153,100%,40%,0.5), 0 0 120px hsl(153,100%,40%,0.25); }
        }
        @keyframes border-rotate {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-6 max-w-3xl transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        {/* Status pill */}
        <div
          className={`mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(153,100%,40%,0.3)] bg-[hsl(153,80%,10%,0.4)] backdrop-blur-md transition-all duration-1000 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(153,100%,50%)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(153,100%,50%)]" />
          </span>
          <span className="text-xs font-medium text-[hsl(153,80%,80%)] tracking-wider uppercase">
            {language === "ar" ? "نظام مباشر" : "System Online"}
          </span>
          <Sparkles className="h-3 w-3 text-[hsl(43,90%,60%)]" />
        </div>

        {/* Title with gradient */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(0,0%,100%) 0%, hsl(153,80%,85%) 50%, hsl(170,70%,75%) 100%)",
            }}
          >
            {t("app.name")}
          </span>
        </h1>

        {/* Decorative line */}
        <div className="relative w-24 h-px mb-6 overflow-hidden bg-gradient-to-r from-transparent via-[hsl(153,100%,50%,0.6)] to-transparent">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
            style={{ animation: "scan-line 3s ease-in-out infinite" }}
          />
        </div>

        {/* Tagline */}
        <p className="text-white/55 text-lg md:text-xl mb-12 max-w-xl leading-relaxed font-light">
          {t("app.tagline")}
        </p>

        {/* CTA */}
        <div className="relative group">
          <div
            className="absolute -inset-[2px] rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
            style={{
              background:
                "linear-gradient(90deg, hsl(153,100%,40%), hsl(170,80%,45%), hsl(43,90%,55%), hsl(153,100%,40%))",
              backgroundSize: "200% 100%",
              animation: "border-rotate 4s linear infinite",
            }}
          />
          <Button
            size="lg"
            onClick={login}
            className="relative gap-3 text-base px-12 h-14 rounded-2xl font-semibold bg-[hsl(160,40%,8%)] hover:bg-[hsl(160,40%,10%)] text-white border-0 transition-all duration-300 group-hover:scale-[1.02]"
            style={{ animation: "glow-pulse 3s ease-in-out infinite" }}
          >
            <LogIn className="h-5 w-5" />
            {t("btn.login")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
          </Button>
        </div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-6 inset-x-0 text-center z-10">
        <p className="text-xs text-white/30 tracking-wide">{t("app.agency")}</p>
      </div>

      {/* Corner accents */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-[hsl(153,100%,40%,0.3)]" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-[hsl(153,100%,40%,0.3)]" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-[hsl(153,100%,40%,0.3)]" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-[hsl(153,100%,40%,0.3)]" />
    </div>
  );
}
