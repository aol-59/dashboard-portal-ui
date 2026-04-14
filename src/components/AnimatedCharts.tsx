import { useEffect, useRef } from "react";

const GREEN = "16, 185, 129";
const GOLD = "202, 138, 4";
const BLUE = "59, 130, 246";

function drawPieChart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  time: number,
  alpha: number
) {
  const slices = [0.35, 0.25, 0.2, 0.2];
  const colors = [GREEN, GOLD, BLUE, "148, 163, 184"];
  let startAngle = -Math.PI / 2 + time * 0.3;

  slices.forEach((slice, i) => {
    const sweepTarget = slice * Math.PI * 2;
    // Animate sweep in
    const progress = Math.min(1, (Math.sin(time + i) * 0.5 + 0.5) * 1.2);
    const sweep = sweepTarget * (0.7 + progress * 0.3);
    const endAngle = startAngle + sweep;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = `rgba(${colors[i]}, ${alpha * (0.15 + progress * 0.1)})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${colors[i]}, ${alpha * 0.3})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    startAngle += sweepTarget;
  });
}

function drawBarChart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  alpha: number
) {
  const bars = 5;
  const gap = w * 0.15;
  const barW = (w - gap * (bars + 1)) / bars;
  const colors = [GREEN, GREEN, GOLD, GREEN, BLUE];

  for (let i = 0; i < bars; i++) {
    const bounce = Math.sin(time * 2 + i * 0.8) * 0.3 + 0.7;
    const barH = h * bounce * (0.4 + (i * 0.12));
    const bx = x + gap + i * (barW + gap);
    const by = y + h - barH;

    // Bar glow
    ctx.fillStyle = `rgba(${colors[i]}, ${alpha * 0.05})`;
    ctx.fillRect(bx - 2, by - 2, barW + 4, barH + 4);

    // Bar
    const gradient = ctx.createLinearGradient(bx, by, bx, by + barH);
    gradient.addColorStop(0, `rgba(${colors[i]}, ${alpha * 0.25})`);
    gradient.addColorStop(1, `rgba(${colors[i]}, ${alpha * 0.08})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(bx, by, barW, barH);

    // Top line
    ctx.strokeStyle = `rgba(${colors[i]}, ${alpha * 0.4})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + barW, by);
    ctx.stroke();
  }
}

function drawLineChart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  alpha: number
) {
  const points = 8;
  const stepX = w / (points - 1);

  // Two lines
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

    // Area fill
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fillStyle = `rgba(${color}, ${alpha * 0.04})`;
    ctx.fill();

    // Dots on points
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

      const alpha = 1;

      // Pie chart - top right area
      drawPieChart(ctx, w * 0.82, h * 0.18, Math.min(w, h) * 0.08, time, alpha);

      // Bar chart - bottom left
      const barW = w * 0.18;
      const barH = h * 0.14;
      drawBarChart(ctx, w * 0.06, h * 0.75, barW, barH, time, alpha);

      // Line chart - bottom right
      const lineW = w * 0.22;
      const lineH = h * 0.12;
      drawLineChart(ctx, w * 0.72, h * 0.78, lineW, lineH, time, alpha);

      // Small pie - top left
      drawPieChart(ctx, w * 0.12, h * 0.2, Math.min(w, h) * 0.05, time + 1, alpha * 0.6);

      // Mini bar chart - mid right
      drawBarChart(ctx, w * 0.85, h * 0.45, w * 0.1, h * 0.08, time + 2, alpha * 0.5);

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
