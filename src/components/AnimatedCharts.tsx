import { useEffect, useRef } from "react";

const GREEN = "16, 185, 129";
const GOLD = "202, 138, 4";
const BLUE = "59, 130, 246";
const SLATE = "148, 163, 184";
const TEAL = "20, 184, 166";
const PURPLE = "139, 92, 246";
const ROSE = "244, 63, 94";

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
  ctx.fillStyle = `rgba(${GREEN}, ${alpha * 0.3})`;
  ctx.font = `bold ${outerR * 0.35}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.round(68 + Math.sin(time) * 5)}%`, cx, cy);
}

// --- Heat Map ---
function drawHeatMap(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const cols = 8, rows = 5;
  const cellW = w / cols, cellH = h / rows, gap = 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const intensity = Math.sin(time * 1.5 + r * 0.9 + c * 0.7) * 0.5 + 0.5;
      const color = intensity < 0.33 ? BLUE : intensity < 0.66 ? GREEN : GOLD;
      ctx.fillStyle = `rgba(${color}, ${alpha * (0.05 + intensity * 0.18)})`;
      const rx = x + c * cellW + gap, ry = y + r * cellH + gap;
      const rw = cellW - gap * 2, rh = cellH - gap * 2, rad = 3;
      ctx.beginPath();
      ctx.moveTo(rx + rad, ry);
      ctx.lineTo(rx + rw - rad, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
      ctx.lineTo(rx + rw, ry + rh - rad);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
      ctx.lineTo(rx + rad, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
      ctx.lineTo(rx, ry + rad);
      ctx.quadraticCurveTo(rx, ry, rx + rad, ry);
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
  const bars = 5, gap = w * 0.12;
  const barW = (w - gap * (bars + 1)) / bars;
  const colors = [GREEN, TEAL, GOLD, GREEN, BLUE];
  for (let i = 0; i < bars; i++) {
    const bounce = Math.sin(time * 2 + i * 0.8) * 0.3 + 0.7;
    const barH = h * bounce * (0.4 + i * 0.12);
    const bx = x + gap + i * (barW + gap);
    const by = y + h - barH;
    const grad = ctx.createLinearGradient(bx, by, bx, by + barH);
    grad.addColorStop(0, `rgba(${colors[i]}, ${alpha * 0.22})`);
    grad.addColorStop(1, `rgba(${colors[i]}, ${alpha * 0.06})`);
    ctx.fillStyle = grad;
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
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
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

// --- Radial Bar Chart ---
function drawRadialBar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  time: number, alpha: number
) {
  const bars = 5;
  const barWidth = r / (bars + 1);
  const colors = [GREEN, GOLD, BLUE, TEAL, PURPLE];
  for (let i = 0; i < bars; i++) {
    const radius = barWidth * (i + 1.5);
    const progress = Math.sin(time * 1.2 + i * 0.9) * 0.3 + 0.65;
    const sweep = Math.PI * 2 * progress;
    const startAngle = -Math.PI / 2;
    // Track bg
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${colors[i]}, ${alpha * 0.04})`;
    ctx.lineWidth = barWidth * 0.6;
    ctx.stroke();
    // Active arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + sweep);
    ctx.strokeStyle = `rgba(${colors[i]}, ${alpha * 0.2})`;
    ctx.lineWidth = barWidth * 0.6;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.lineCap = "butt";
    // End dot
    const ex = cx + Math.cos(startAngle + sweep) * radius;
    const ey = cy + Math.sin(startAngle + sweep) * radius;
    ctx.beginPath();
    ctx.arc(ex, ey, barWidth * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${colors[i]}, ${alpha * 0.4})`;
    ctx.fill();
  }
}

// --- Grouped Bar Chart ---
function drawGroupedBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const groups = 4;
  const barsPerGroup = 3;
  const groupGap = w * 0.08;
  const groupW = (w - groupGap * (groups + 1)) / groups;
  const barW = groupW / barsPerGroup - 1;
  const colors = [GREEN, GOLD, BLUE];
  for (let g = 0; g < groups; g++) {
    const gx = x + groupGap + g * (groupW + groupGap);
    for (let b = 0; b < barsPerGroup; b++) {
      const bounce = Math.sin(time * 1.8 + g * 0.7 + b * 1.1) * 0.25 + 0.7;
      const barH = h * bounce * (0.5 + b * 0.15);
      const bx = gx + b * (barW + 1);
      const by = y + h - barH;
      const grad = ctx.createLinearGradient(bx, by, bx, by + barH);
      grad.addColorStop(0, `rgba(${colors[b]}, ${alpha * 0.22})`);
      grad.addColorStop(1, `rgba(${colors[b]}, ${alpha * 0.05})`);
      ctx.fillStyle = grad;
      ctx.fillRect(bx, by, barW, barH);
    }
  }
  // Base line
  ctx.strokeStyle = `rgba(${SLATE}, ${alpha * 0.1})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();
}

// --- Box Chart (Box & Whisker) ---
function drawBoxChart(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const boxes = 5;
  const gap = w * 0.1;
  const boxW = (w - gap * (boxes + 1)) / boxes;
  const colors = [GREEN, TEAL, GOLD, BLUE, PURPLE];
  for (let i = 0; i < boxes; i++) {
    const bx = x + gap + i * (boxW + gap);
    const mid = Math.sin(time * 1.3 + i * 0.8) * 0.15 + 0.5;
    const q1 = mid + 0.08 + Math.sin(time + i) * 0.03;
    const q3 = mid - 0.08 - Math.sin(time + i * 1.5) * 0.03;
    const wHi = q3 - 0.1;
    const wLo = q1 + 0.1;
    const median = mid + Math.sin(time * 2 + i) * 0.02;
    // Whisker line
    ctx.strokeStyle = `rgba(${colors[i]}, ${alpha * 0.15})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx + boxW / 2, y + wHi * h);
    ctx.lineTo(bx + boxW / 2, y + wLo * h);
    ctx.stroke();
    // Whisker caps
    const capW = boxW * 0.5;
    ctx.beginPath();
    ctx.moveTo(bx + boxW / 2 - capW / 2, y + wHi * h);
    ctx.lineTo(bx + boxW / 2 + capW / 2, y + wHi * h);
    ctx.moveTo(bx + boxW / 2 - capW / 2, y + wLo * h);
    ctx.lineTo(bx + boxW / 2 + capW / 2, y + wLo * h);
    ctx.stroke();
    // Box
    const boxTop = y + q3 * h;
    const boxH = (q1 - q3) * h;
    ctx.fillStyle = `rgba(${colors[i]}, ${alpha * 0.1})`;
    ctx.fillRect(bx, boxTop, boxW, boxH);
    ctx.strokeStyle = `rgba(${colors[i]}, ${alpha * 0.2})`;
    ctx.strokeRect(bx, boxTop, boxW, boxH);
    // Median line
    ctx.strokeStyle = `rgba(${colors[i]}, ${alpha * 0.35})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx, y + median * h);
    ctx.lineTo(bx + boxW, y + median * h);
    ctx.stroke();
  }
}

// --- Semicircle Donut ---
function drawSemicircleDonut(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  time: number, alpha: number
) {
  const innerR = r * 0.55;
  const slices = [0.3, 0.25, 0.2, 0.25];
  const colors = [GREEN, GOLD, TEAL, BLUE];
  let startAngle = Math.PI; // start from left
  slices.forEach((slice, i) => {
    const sweep = slice * Math.PI; // only semicircle
    const progress = Math.min(1, (Math.sin(time * 0.9 + i * 1.3) * 0.5 + 0.5) * 1.1);
    const endAngle = startAngle + sweep * (0.7 + progress * 0.3);
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = `rgba(${colors[i]}, ${alpha * (0.12 + progress * 0.12)})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${colors[i]}, ${alpha * 0.2})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    startAngle += sweep;
  });
  // Center value
  ctx.fillStyle = `rgba(${GREEN}, ${alpha * 0.3})`;
  ctx.font = `bold ${r * 0.3}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.round(74 + Math.sin(time * 1.5) * 8)}`, cx, cy - r * 0.1);
}

// --- Connected Scatter Plot ---
function drawConnectedScatter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const points = 10;
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const px = x + (i / (points - 1)) * w;
    const py = y + h * 0.5 + Math.sin(time * 1.2 + i * 1.1) * h * 0.35;
    pts.push([px, py]);
  }
  // Connecting lines
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = `rgba(${PURPLE}, ${alpha * 0.2})`;
  ctx.lineWidth = 1;
  ctx.stroke();
  // Scatter dots with varying sizes
  pts.forEach(([px, py], i) => {
    const pulse = Math.sin(time * 2.5 + i * 0.8) * 0.5 + 0.5;
    const size = 3 + pulse * 3 + (i % 3) * 1.5;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${i % 2 === 0 ? PURPLE : TEAL}, ${alpha * (0.1 + pulse * 0.15)})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${i % 2 === 0 ? PURPLE : TEAL}, ${alpha * 0.25})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });
}

// --- Stream Graph ---
function drawStreamGraph(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const layers = 4;
  const points = 12;
  const stepX = w / (points - 1);
  const colors = [GREEN, GOLD, BLUE, TEAL];

  for (let l = layers - 1; l >= 0; l--) {
    const topPts: [number, number][] = [];
    const botPts: [number, number][] = [];
    for (let i = 0; i < points; i++) {
      const px = x + i * stepX;
      const baseline = y + h * 0.5;
      let stackUp = 0;
      let stackDown = 0;
      for (let s = 0; s <= l; s++) {
        const amplitude = h * (0.06 + s * 0.03);
        const wave = Math.sin(time * (0.8 + s * 0.3) + i * 0.5 + s * 1.5) * amplitude;
        if (wave > 0) stackUp += wave; else stackDown += wave;
      }
      topPts.push([px, baseline - stackUp]);
      botPts.push([px, baseline - stackDown]);
    }
    // Draw filled stream layer
    ctx.beginPath();
    topPts.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    for (let i = botPts.length - 1; i >= 0; i--) {
      ctx.lineTo(botPts[i][0], botPts[i][1]);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(${colors[l]}, ${alpha * 0.08})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${colors[l]}, ${alpha * 0.15})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
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

      // === TOP ROW ===
      // Heat map — top left
      drawHeatMap(ctx, w * 0.02, h * 0.04, w * 0.14, h * 0.08, time, 1);

      // Radial bar — top center-left
      drawRadialBar(ctx, w * 0.28, h * 0.1, s * 0.06, time, 0.8);

      // Donut chart — top right
      drawDonutChart(ctx, w * 0.86, h * 0.14, s * 0.06, time, 1);

      // Semicircle donut — top center-right
      drawSemicircleDonut(ctx, w * 0.70, h * 0.10, s * 0.055, time + 1, 0.8);

      // === MIDDLE ROW ===
      // Pie chart — mid left
      drawPieChart(ctx, w * 0.08, h * 0.38, s * 0.04, time + 1, 0.6);

      // Connected scatter — mid right
      drawConnectedScatter(ctx, w * 0.78, h * 0.35, w * 0.18, h * 0.1, time, 0.7);

      // Stream graph — mid center
      drawStreamGraph(ctx, w * 0.02, h * 0.55, w * 0.18, h * 0.1, time, 0.7);

      // Box chart — mid far right
      drawBoxChart(ctx, w * 0.82, h * 0.52, w * 0.14, h * 0.12, time, 0.6);

      // === BOTTOM ROW ===
      // Grouped bar — bottom left
      drawGroupedBar(ctx, w * 0.03, h * 0.78, w * 0.18, h * 0.12, time, 1);

      // Line chart — bottom right
      drawLineChart(ctx, w * 0.76, h * 0.80, w * 0.2, h * 0.1, time, 1);

      // Bar chart — bottom center-left
      drawBarChart(ctx, w * 0.25, h * 0.82, w * 0.14, h * 0.1, time + 2, 0.6);

      // Mini donut — bottom center
      drawDonutChart(ctx, w * 0.55, h * 0.88, s * 0.03, time + 3, 0.4);

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
