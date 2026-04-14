import { useEffect, useRef } from "react";

const GREEN = "16, 185, 129";
const GOLD = "202, 138, 4";
const BLUE = "59, 130, 246";
const SLATE = "148, 163, 184";
const TEAL = "20, 184, 166";

// --- Donut Chart ---
function drawDonutChart(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, outerR: number,
  time: number, alpha: number
) {
  const innerR = outerR * 0.55;
  const slices = [0.30, 0.25, 0.22, 0.23];
  const colors = [GREEN, GOLD, BLUE, TEAL];
  let startAngle = -Math.PI / 2 + time * 0.2;

  slices.forEach((slice, i) => {
    const sweep = slice * Math.PI * 2;
    const progress = Math.min(1, (Math.sin(time * 0.8 + i * 1.2) * 0.5 + 0.5) * 1.1);
    const endAngle = startAngle + sweep * (0.75 + progress * 0.25);

    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, endAngle);
    ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = `rgba(${colors[i]}, ${alpha * (0.12 + progress * 0.12)})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${colors[i]}, ${alpha * 0.25})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    startAngle += sweep;
  });

  // Center value text
  ctx.fillStyle = `rgba(${GREEN}, ${alpha * 0.3})`;
  ctx.font = `bold ${outerR * 0.35}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const val = Math.round(68 + Math.sin(time) * 5);
  ctx.fillText(`${val}%`, cx, cy);
}

// --- Heat Map ---
function drawHeatMap(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const cols = 8;
  const rows = 5;
  const cellW = w / cols;
  const cellH = h / rows;
  const gap = 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const intensity = (Math.sin(time * 1.5 + r * 0.9 + c * 0.7) * 0.5 + 0.5);
      const cx = x + c * cellW;
      const cy = y + r * cellH;

      // Color interpolation: low=blue, mid=green, high=gold
      let color: string;
      if (intensity < 0.33) {
        color = BLUE;
      } else if (intensity < 0.66) {
        color = GREEN;
      } else {
        color = GOLD;
      }

      const cellAlpha = alpha * (0.05 + intensity * 0.18);
      ctx.fillStyle = `rgba(${color}, ${cellAlpha})`;

      // Rounded rect
      const rx = cx + gap;
      const ry = cy + gap;
      const rw = cellW - gap * 2;
      const rh = cellH - gap * 2;
      const radius = 3;
      ctx.beginPath();
      ctx.moveTo(rx + radius, ry);
      ctx.lineTo(rx + rw - radius, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
      ctx.lineTo(rx + rw, ry + rh - radius);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
      ctx.lineTo(rx + radius, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
      ctx.lineTo(rx, ry + radius);
      ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// --- Pie Chart ---
function drawPieChart(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  time: number, alpha: number
) {
  const slices = [0.35, 0.25, 0.2, 0.2];
  const colors = [GREEN, GOLD, BLUE, SLATE];
  let startAngle = -Math.PI / 2 + time * 0.3;

  slices.forEach((slice, i) => {
    const sweep = slice * Math.PI * 2;
    const progress = Math.min(1, (Math.sin(time + i) * 0.5 + 0.5) * 1.2);
    const endAngle = startAngle + sweep * (0.7 + progress * 0.3);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = `rgba(${colors[i]}, ${alpha * (0.12 + progress * 0.08)})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${colors[i]}, ${alpha * 0.25})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    startAngle += sweep;
  });
}

// --- Bar Chart ---
function drawBarChart(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const bars = 5;
  const gap = w * 0.12;
  const barW = (w - gap * (bars + 1)) / bars;
  const colors = [GREEN, TEAL, GOLD, GREEN, BLUE];

  for (let i = 0; i < bars; i++) {
    const bounce = Math.sin(time * 2 + i * 0.8) * 0.3 + 0.7;
    const barH = h * bounce * (0.4 + i * 0.12);
    const bx = x + gap + i * (barW + gap);
    const by = y + h - barH;

    const gradient = ctx.createLinearGradient(bx, by, bx, by + barH);
    gradient.addColorStop(0, `rgba(${colors[i]}, ${alpha * 0.22})`);
    gradient.addColorStop(1, `rgba(${colors[i]}, ${alpha * 0.06})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(bx, by, barW, barH);

    ctx.strokeStyle = `rgba(${colors[i]}, ${alpha * 0.35})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + barW, by);
    ctx.stroke();
  }
}

// --- Line Chart ---
function drawLineChart(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const points = 8;
  const stepX = w / (points - 1);

  [{ color: GREEN, offset: 0 }, { color: GOLD, offset: 2 }].forEach(({ color, offset }) => {
    ctx.beginPath();
    const pts: [number, number][] = [];
    for (let i = 0; i < points; i++) {
      const px = x + i * stepX;
      const wave = Math.sin(time * 1.5 + i * 0.7 + offset) * 0.3 + 0.5;
      const py = y + h - wave * h * 0.8;
      pts.push([px, py]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = `rgba(${color}, ${alpha * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fillStyle = `rgba(${color}, ${alpha * 0.03})`;
    ctx.fill();

    pts.forEach(([px, py], i) => {
      const pulse = Math.sin(time * 3 + i) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(px, py, 2 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${alpha * (0.2 + pulse * 0.2)})`;
      ctx.fill();
    });
  });
}

export default function AnimatedCharts() {
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
      time += 0.008;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const s = Math.min(w, h);

      // Donut chart — top right
      drawDonutChart(ctx, w * 0.84, h * 0.16, s * 0.07, time, 1);

      // Heat map — top left
      drawHeatMap(ctx, w * 0.03, h * 0.08, w * 0.16, h * 0.1, time, 1);

      // Pie chart — bottom center-left
      drawPieChart(ctx, w * 0.14, h * 0.55, s * 0.045, time + 1, 0.7);

      // Bar chart — bottom left
      drawBarChart(ctx, w * 0.04, h * 0.78, w * 0.16, h * 0.12, time, 1);

      // Line chart — bottom right
      drawLineChart(ctx, w * 0.74, h * 0.80, w * 0.2, h * 0.1, time, 1);

      // Second heat map — mid right  
      drawHeatMap(ctx, w * 0.82, h * 0.42, w * 0.13, h * 0.08, time + 2, 0.6);

      // Mini donut — left mid
      drawDonutChart(ctx, w * 0.08, h * 0.35, s * 0.035, time + 3, 0.5);

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
      style={{ opacity: 0.7 }}
    />
  );
}
