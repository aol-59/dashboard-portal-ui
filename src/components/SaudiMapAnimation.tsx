import { useEffect, useRef } from "react";

// Real Saudi Arabia border coordinates (normalized 0-1, from GeoJSON)
const SAUDI_BORDER: [number, number][] = [
  [0.387, 1.0], [0.381, 0.973], [0.367, 0.954], [0.363, 0.929], [0.339, 0.906],
  [0.313, 0.853], [0.3, 0.802], [0.267, 0.758], [0.246, 0.748], [0.214, 0.687],
  [0.209, 0.643], [0.211, 0.606], [0.184, 0.536], [0.161, 0.511], [0.136, 0.498],
  [0.12, 0.462], [0.123, 0.448], [0.109, 0.415], [0.095, 0.401], [0.077, 0.354],
  [0.048, 0.303], [0.024, 0.259], [0.0, 0.259], [0.007, 0.225], [0.01, 0.203],
  [0.015, 0.177], [0.068, 0.187], [0.089, 0.168], [0.1, 0.145], [0.137, 0.136],
  [0.144, 0.115], [0.16, 0.105], [0.113, 0.041], [0.208, 0.01], [0.217, 0.0],
  [0.274, 0.017], [0.345, 0.061], [0.479, 0.189], [0.567, 0.194], [0.61, 0.2],
  [0.622, 0.23], [0.655, 0.228], [0.674, 0.283], [0.697, 0.297], [0.705, 0.319],
  [0.738, 0.346], [0.741, 0.372], [0.736, 0.393], [0.742, 0.414], [0.756, 0.432],
  [0.762, 0.453], [0.769, 0.468], [0.783, 0.481], [0.797, 0.476], [0.806, 0.501],
  [0.808, 0.515], [0.826, 0.579], [0.969, 0.611], [0.978, 0.598], [1.0, 0.643],
  [0.968, 0.769], [0.826, 0.832], [0.689, 0.857], [0.644, 0.885], [0.61, 0.951],
  [0.588, 0.962], [0.576, 0.941], [0.558, 0.944], [0.512, 0.938], [0.503, 0.931],
  [0.448, 0.933], [0.435, 0.939], [0.416, 0.922], [0.403, 0.953], [0.408, 0.98],
  [0.387, 1.0],
];

// Interpolate extra dots along the border for denser dot coverage
function interpolateBorder(pts: [number, number][], density: number): [number, number][] {
  const result: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.round(dist * density));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      result.push([x1 + dx * t, y1 + dy * t]);
    }
  }
  result.push(pts[pts.length - 1]);
  return result;
}

const BORDER_DOTS = interpolateBorder(SAUDI_BORDER, 200);

// Interior city dots
const CITY_DOTS: { pos: [number, number]; name: string }[] = [
  { pos: [0.62, 0.35], name: "Riyadh" },
  { pos: [0.82, 0.55], name: "Dammam" },
  { pos: [0.15, 0.52], name: "Jeddah" },
  { pos: [0.14, 0.58], name: "Mecca" },
  { pos: [0.30, 0.85], name: "Abha" },
  { pos: [0.35, 0.15], name: "Tabuk" },
  { pos: [0.22, 0.30], name: "Madinah" },
  { pos: [0.50, 0.20], name: "Ha'il" },
  { pos: [0.70, 0.30], name: "Buraydah" },
  { pos: [0.60, 0.70], name: "Najran" },
];

// Interior network points
const INTERIOR_DOTS: [number, number][] = [
  ...CITY_DOTS.map(c => c.pos),
  [0.45, 0.45], [0.55, 0.55], [0.40, 0.65], [0.70, 0.50],
  [0.35, 0.35], [0.50, 0.30], [0.65, 0.45], [0.30, 0.55],
  [0.55, 0.75], [0.75, 0.65], [0.45, 0.80], [0.60, 0.25],
];

function getConnections(dots: [number, number][], maxDist: number) {
  const conns: [number, number][] = [];
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i][0] - dots[j][0];
      const dy = dots[i][1] - dots[j][1];
      if (Math.sqrt(dx * dx + dy * dy) < maxDist) conns.push([i, j]);
    }
  }
  return conns;
}

const interiorConns = getConnections(INTERIOR_DOTS, 0.22);

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
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      // Center the map with proper aspect ratio
      const mapScale = Math.min(cw * 0.75, ch * 0.85);
      const mapOffX = (cw - mapScale) / 2;
      const mapOffY = (ch - mapScale) / 2 + ch * 0.02;

      const toX = (nx: number) => mapOffX + nx * mapScale;
      const toY = (ny: number) => mapOffY + ny * mapScale;

      // 1. Faint filled shape
      ctx.beginPath();
      SAUDI_BORDER.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(toX(x), toY(y));
        else ctx.lineTo(toX(x), toY(y));
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(16, 185, 129, 0.012)";
      ctx.fill();

      // 2. Interior network connections
      interiorConns.forEach(([i, j], idx) => {
        const pulse = Math.sin(time * 1.5 + idx * 0.4) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.03 + pulse * 0.04})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(toX(INTERIOR_DOTS[i][0]), toY(INTERIOR_DOTS[i][1]));
        ctx.lineTo(toX(INTERIOR_DOTS[j][0]), toY(INTERIOR_DOTS[j][1]));
        ctx.stroke();
      });

      // 3. Border dots — the main shape
      BORDER_DOTS.forEach(([x, y], i) => {
        const pulse = Math.sin(time * 3 + i * 0.15) * 0.5 + 0.5;
        const px = toX(x);
        const py = toY(y);

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, 4 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.02 + pulse * 0.02})`;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(px, py, 1.5 + pulse * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.18 + pulse * 0.18})`;
        ctx.fill();
      });

      // 4. Connect adjacent border dots with faint lines
      for (let i = 0; i < BORDER_DOTS.length - 1; i++) {
        const pulse = Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.04 + pulse * 0.04})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(toX(BORDER_DOTS[i][0]), toY(BORDER_DOTS[i][1]));
        ctx.lineTo(toX(BORDER_DOTS[i + 1][0]), toY(BORDER_DOTS[i + 1][1]));
        ctx.stroke();
      }

      // 5. City dots (larger, with glow rings)
      CITY_DOTS.forEach(({ pos: [x, y] }, i) => {
        const pulse = Math.sin(time * 2 + i * 1.2) * 0.5 + 0.5;
        const px = toX(x);
        const py = toY(y);

        // Outer ring
        ctx.beginPath();
        ctx.arc(px, py, 10 + pulse * 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.04 + pulse * 0.04})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Inner glow
        ctx.beginPath();
        ctx.arc(px, py, 6 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.03 + pulse * 0.03})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(px, py, 3 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.3 + pulse * 0.3})`;
        ctx.fill();
      });

      // 6. Traveling pulses along border
      for (let k = 0; k < 4; k++) {
        const pos = ((time * 15 + k * (BORDER_DOTS.length / 4)) % BORDER_DOTS.length);
        const idx = Math.floor(pos);
        const frac = pos - idx;
        const curr = BORDER_DOTS[idx % BORDER_DOTS.length];
        const next = BORDER_DOTS[(idx + 1) % BORDER_DOTS.length];
        const px = toX(curr[0] + (next[0] - curr[0]) * frac);
        const py = toY(curr[1] + (next[1] - curr[1]) * frac);

        // Trail glow
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
        ctx.fill();

        // Bright dot
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.7)";
        ctx.fill();
      }

      // 7. Data pulses along interior connections
      for (let k = 0; k < 3; k++) {
        const connIdx = Math.floor((time * 10 + k * 13) % interiorConns.length);
        const [i, j] = interiorConns[connIdx];
        const t = ((time * 3 + k * 2.1) % 1);
        const px = toX(INTERIOR_DOTS[i][0] + (INTERIOR_DOTS[j][0] - INTERIOR_DOTS[i][0]) * t);
        const py = toY(INTERIOR_DOTS[i][1] + (INTERIOR_DOTS[j][1] - INTERIOR_DOTS[i][1]) * t);
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
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
