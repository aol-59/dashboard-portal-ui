import { useEffect, useRef } from "react";

// Saudi Arabia outline as dot coordinates (normalized 0-1)
const SAUDI_DOTS: [number, number][] = [
  // Northern border
  [0.42, 0.05], [0.47, 0.04], [0.52, 0.03], [0.57, 0.04], [0.62, 0.06],
  [0.67, 0.05], [0.72, 0.07], [0.77, 0.09], [0.82, 0.08], [0.87, 0.10],
  [0.90, 0.13], [0.92, 0.17],
  // Eastern coast (Persian Gulf)
  [0.93, 0.22], [0.94, 0.27], [0.92, 0.32], [0.90, 0.35], [0.91, 0.38],
  [0.93, 0.42], [0.92, 0.46], [0.90, 0.50], [0.88, 0.53],
  // Southeast (UAE/Oman border area)
  [0.86, 0.56], [0.84, 0.59], [0.82, 0.62], [0.80, 0.65], [0.78, 0.68],
  // Southern coast (Arabian Sea / Yemen border)
  [0.75, 0.72], [0.72, 0.75], [0.68, 0.78], [0.64, 0.80], [0.60, 0.82],
  [0.55, 0.85], [0.50, 0.88], [0.45, 0.90], [0.40, 0.92], [0.35, 0.93],
  // Southwest (Yemen border going up)
  [0.30, 0.92], [0.26, 0.90], [0.22, 0.87], [0.19, 0.84], [0.16, 0.80],
  [0.14, 0.76], [0.12, 0.72],
  // Western coast (Red Sea)
  [0.11, 0.67], [0.10, 0.62], [0.12, 0.57], [0.13, 0.52], [0.15, 0.47],
  [0.17, 0.42], [0.19, 0.37], [0.21, 0.32], [0.24, 0.27], [0.27, 0.22],
  [0.30, 0.18], [0.33, 0.14], [0.36, 0.10], [0.39, 0.07],
  // Interior dots for connections
  [0.45, 0.30], [0.55, 0.35], [0.65, 0.30], [0.50, 0.50], [0.60, 0.45],
  [0.40, 0.55], [0.55, 0.60], [0.70, 0.45], [0.45, 0.70], [0.35, 0.40],
  [0.50, 0.20], [0.65, 0.55], [0.30, 0.60], [0.75, 0.35], [0.40, 0.40],
  // City approximate positions
  [0.62, 0.38], // Riyadh
  [0.88, 0.40], // Dammam
  [0.20, 0.60], // Jeddah
  [0.18, 0.68], // Mecca
  [0.30, 0.78], // Abha
];

// Generate connections between nearby dots
function getConnections(dots: [number, number][], maxDist: number) {
  const connections: [number, number][] = [];
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i][0] - dots[j][0];
      const dy = dots[i][1] - dots[j][1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) connections.push([i, j]);
    }
  }
  return connections;
}

const connections = getConnections(SAUDI_DOTS, 0.14);

export default function SaudiMapAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };
    resize();
    window.addEventListener("resize", resize);

    let time = 0;

    const draw = () => {
      time += 0.005;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const mapOffX = w * 0.05;
      const mapOffY = h * 0.05;
      const mapW = w * 0.9;
      const mapH = h * 0.9;

      // Draw connections
      connections.forEach(([i, j], idx) => {
        const pulse = Math.sin(time * 2 + idx * 0.3) * 0.5 + 0.5;
        const alpha = 0.03 + pulse * 0.04;
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mapOffX + SAUDI_DOTS[i][0] * mapW, mapOffY + SAUDI_DOTS[i][1] * mapH);
        ctx.lineTo(mapOffX + SAUDI_DOTS[j][0] * mapW, mapOffY + SAUDI_DOTS[j][1] * mapH);
        ctx.stroke();
      });

      // Draw dots
      SAUDI_DOTS.forEach(([x, y], i) => {
        const pulse = Math.sin(time * 3 + i * 0.5) * 0.5 + 0.5;
        const px = mapOffX + x * mapW;
        const py = mapOffY + y * mapH;
        const radius = 2 + pulse * 1.5;

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.03 + pulse * 0.03})`;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.15 + pulse * 0.2})`;
        ctx.fill();
      });

      // Traveling data pulse along connections
      for (let k = 0; k < 5; k++) {
        const connIdx = Math.floor((time * 10 + k * 17) % connections.length);
        const [i, j] = connections[connIdx];
        const t = ((time * 3 + k * 2.3) % 1);
        const px = mapOffX + (SAUDI_DOTS[i][0] + (SAUDI_DOTS[j][0] - SAUDI_DOTS[i][0]) * t) * mapW;
        const py = mapOffY + (SAUDI_DOTS[i][1] + (SAUDI_DOTS[j][1] - SAUDI_DOTS[i][1]) * t) * mapH;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.5)";
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}
