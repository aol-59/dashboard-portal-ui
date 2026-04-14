import { useEffect, useRef } from "react";

// Saudi Arabia outline — denser points for a clearer shape, sequential order for border drawing
const SAUDI_BORDER: [number, number][] = [
  // Northwest (Jordan border) going east
  [0.36, 0.06], [0.38, 0.05], [0.40, 0.04], [0.43, 0.03], [0.46, 0.03],
  [0.49, 0.02], [0.52, 0.02], [0.55, 0.03], [0.58, 0.04], [0.61, 0.05],
  // Northern border (Iraq)
  [0.64, 0.05], [0.67, 0.04], [0.70, 0.05], [0.73, 0.06], [0.76, 0.07],
  [0.79, 0.08], [0.82, 0.08], [0.85, 0.09], [0.88, 0.10], [0.90, 0.12],
  // Northeast (Kuwait/Iraq) curving down
  [0.91, 0.14], [0.92, 0.17], [0.93, 0.20],
  // Eastern coast (Persian Gulf) — detailed
  [0.94, 0.23], [0.95, 0.26], [0.94, 0.29], [0.93, 0.31], [0.91, 0.33],
  [0.90, 0.35], [0.91, 0.37], [0.92, 0.39], [0.93, 0.41], [0.94, 0.43],
  [0.93, 0.45], [0.92, 0.47], [0.91, 0.49], [0.90, 0.51], [0.89, 0.53],
  // Southeast coast (UAE/Oman)
  [0.87, 0.55], [0.85, 0.57], [0.83, 0.59], [0.81, 0.61], [0.80, 0.63],
  [0.79, 0.65], [0.78, 0.67], [0.76, 0.69],
  // Southern (Empty Quarter toward Yemen)
  [0.74, 0.71], [0.72, 0.73], [0.69, 0.75], [0.66, 0.77], [0.63, 0.79],
  [0.60, 0.81], [0.57, 0.83], [0.54, 0.85], [0.51, 0.87], [0.48, 0.89],
  [0.45, 0.90], [0.42, 0.91], [0.39, 0.92], [0.36, 0.93],
  // Southwest (Yemen border going northwest)
  [0.33, 0.93], [0.30, 0.92], [0.27, 0.91], [0.24, 0.89], [0.22, 0.87],
  [0.20, 0.85], [0.18, 0.82], [0.16, 0.79], [0.15, 0.76], [0.13, 0.73],
  [0.12, 0.70],
  // Western coast (Red Sea) going north
  [0.11, 0.67], [0.10, 0.64], [0.10, 0.61], [0.11, 0.58], [0.12, 0.55],
  [0.13, 0.52], [0.14, 0.49], [0.15, 0.46], [0.16, 0.43], [0.17, 0.40],
  [0.18, 0.37], [0.19, 0.34], [0.21, 0.31], [0.23, 0.28], [0.25, 0.25],
  [0.27, 0.22], [0.29, 0.19], [0.31, 0.16], [0.33, 0.13], [0.34, 0.10],
  [0.35, 0.08],
];

// Interior city/region dots
const INTERIOR_DOTS: [number, number][] = [
  [0.60, 0.38], // Riyadh
  [0.88, 0.40], // Dammam
  [0.18, 0.62], // Jeddah
  [0.16, 0.70], // Mecca
  [0.22, 0.82], // Abha
  [0.55, 0.20], // Ha'il
  [0.72, 0.25], // Hafar Al-Batin
  [0.40, 0.35], // Madinah
  [0.50, 0.50], // center
  [0.65, 0.55], // Al Kharj
  [0.45, 0.65], // Wadi Dawasir
  [0.35, 0.50], // Yanbu region
  [0.75, 0.40], // Al Ahsa
  [0.55, 0.70], // Najran approach
  [0.42, 0.42], // Qassim
];

const ALL_DOTS = [...SAUDI_BORDER, ...INTERIOR_DOTS];

function getConnections(dots: [number, number][], maxDist: number) {
  const connections: [number, number][] = [];
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i][0] - dots[j][0];
      const dy = dots[i][1] - dots[j][1];
      if (Math.sqrt(dx * dx + dy * dy) < maxDist) connections.push([i, j]);
    }
  }
  return connections;
}

const interiorConnections = getConnections(ALL_DOTS, 0.13);

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
      time += 0.004;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const mapOffX = w * 0.08;
      const mapOffY = h * 0.03;
      const mapW = w * 0.84;
      const mapH = h * 0.94;

      const toX = (nx: number) => mapOffX + nx * mapW;
      const toY = (ny: number) => mapOffY + ny * mapH;

      // Draw the border outline as a connected path (the key shape)
      ctx.beginPath();
      SAUDI_BORDER.forEach(([x, y], i) => {
        const px = toX(x);
        const py = toY(y);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.strokeStyle = "rgba(16, 185, 129, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Faint fill
      ctx.fillStyle = "rgba(16, 185, 129, 0.015)";
      ctx.fill();

      // Draw interior network connections
      interiorConnections.forEach(([i, j], idx) => {
        const pulse = Math.sin(time * 2 + idx * 0.2) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.02 + pulse * 0.03})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(toX(ALL_DOTS[i][0]), toY(ALL_DOTS[i][1]));
        ctx.lineTo(toX(ALL_DOTS[j][0]), toY(ALL_DOTS[j][1]));
        ctx.stroke();
      });

      // Draw border dots (brighter, define the shape)
      SAUDI_BORDER.forEach(([x, y], i) => {
        const pulse = Math.sin(time * 3 + i * 0.4) * 0.5 + 0.5;
        const px = toX(x);
        const py = toY(y);

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, 5 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.03 + pulse * 0.02})`;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(px, py, 2 + pulse * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.2 + pulse * 0.2})`;
        ctx.fill();
      });

      // Draw interior dots (city markers, slightly bigger)
      INTERIOR_DOTS.forEach(([x, y], i) => {
        const pulse = Math.sin(time * 2.5 + i * 0.8) * 0.5 + 0.5;
        const px = toX(x);
        const py = toY(y);

        // Outer glow ring
        ctx.beginPath();
        ctx.arc(px, py, 8 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.02 + pulse * 0.02})`;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(px, py, 3 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.25 + pulse * 0.25})`;
        ctx.fill();
      });

      // Traveling data pulses along the border
      for (let k = 0; k < 3; k++) {
        const pos = ((time * 8 + k * 30) % SAUDI_BORDER.length);
        const idx = Math.floor(pos);
        const frac = pos - idx;
        const curr = SAUDI_BORDER[idx % SAUDI_BORDER.length];
        const next = SAUDI_BORDER[(idx + 1) % SAUDI_BORDER.length];
        const px = toX(curr[0] + (next[0] - curr[0]) * frac);
        const py = toY(curr[1] + (next[1] - curr[1]) * frac);

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.6)";
        ctx.fill();

        // Trail glow
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
        ctx.fill();
      }

      // Traveling pulses along interior connections
      for (let k = 0; k < 4; k++) {
        const connIdx = Math.floor((time * 12 + k * 19) % interiorConnections.length);
        const [i, j] = interiorConnections[connIdx];
        const t = ((time * 4 + k * 2.7) % 1);
        const px = toX(ALL_DOTS[i][0] + (ALL_DOTS[j][0] - ALL_DOTS[i][0]) * t);
        const py = toY(ALL_DOTS[i][1] + (ALL_DOTS[j][1] - ALL_DOTS[i][1]) * t);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.45)";
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
