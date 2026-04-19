import { useEffect, useRef } from "react";

const GREEN = "16, 185, 129";
const GOLD = "202, 138, 4";
const BLUE = "59, 130, 246";
const SLATE = "148, 163, 184";
const TEAL = "20, 184, 166";
const PURPLE = "139, 92, 246";

// Helper: draw a dot
function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${color}, ${alpha})`;
  ctx.fill();
}

// Helper: draw a line
function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, alpha: number, width = 1) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = `rgba(${color}, ${alpha})`;
  ctx.lineWidth = width;
  ctx.stroke();
}

// --- Histogram (dots + line outline) ---
function drawHistogram(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const bins = 12;
  const binW = w / bins;
  const colors = [GREEN, GREEN, TEAL, TEAL, GREEN, GOLD, GOLD, GREEN, TEAL, BLUE, GREEN, GREEN];
  const tops: [number, number, string][] = [];
  for (let i = 0; i < bins; i++) {
    const center = bins / 2;
    const dist = Math.abs(i - center) / center;
    const base = (1 - dist * dist) * 0.85;
    const wave = Math.sin(time * 1.5 + i * 0.6) * 0.12;
    const barH = h * Math.max(0.05, base + wave);
    const bx = x + i * binW + binW / 2;
    const by = y + h - barH;
    tops.push([bx, by, colors[i]]);
    // Vertical dotted line for each bar
    const dots = Math.floor(barH / 4);
    for (let d = 0; d < dots; d++) {
      dot(ctx, bx, y + h - d * 4, 0.8, colors[i], alpha * 0.25);
    }
    // Top dot
    dot(ctx, bx, by, 2, colors[i], alpha * 0.5);
  }
  // Connect tops with line
  ctx.beginPath();
  tops.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
  ctx.strokeStyle = `rgba(${GREEN}, ${alpha * 0.3})`;
  ctx.lineWidth = 1;
  ctx.stroke();
  // Base
  line(ctx, x, y + h, x + w, y + h, SLATE, alpha * 0.1, 0.5);
}

// --- Heat Map (dot grid with varying sizes) ---
function drawHeatMap(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const cols = 10, rows = 6;
  const cellW = w / cols, cellH = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const intensity = Math.sin(time * 1.5 + r * 0.9 + c * 0.7) * 0.5 + 0.5;
      const color = intensity < 0.33 ? BLUE : intensity < 0.66 ? GREEN : GOLD;
      const cx = x + c * cellW + cellW / 2;
      const cy = y + r * cellH + cellH / 2;
      dot(ctx, cx, cy, 1 + intensity * 2.5, color, alpha * (0.15 + intensity * 0.25));
    }
  }
}

// --- Pie Chart (radial lines + dots on perimeter) ---
function drawPieChart(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  time: number, alpha: number
) {
  const slices = [0.35, 0.25, 0.2, 0.2];
  const colors = [GREEN, GOLD, BLUE, SLATE];
  let startAngle = -Math.PI / 2 + time * 0.3;

  // Center dot
  dot(ctx, cx, cy, 2, GREEN, alpha * 0.5);

  slices.forEach((slice, i) => {
    const sweep = slice * Math.PI * 2;
    const endAngle = startAngle + sweep;

    // Radial line from center to perimeter at slice boundary
    const lx = cx + Math.cos(startAngle) * r;
    const ly = cy + Math.sin(startAngle) * r;
    line(ctx, cx, cy, lx, ly, colors[i], alpha * 0.3);

    // Dotted arc along perimeter
    const arcDots = Math.max(8, Math.floor(sweep * r / 4));
    for (let d = 0; d <= arcDots; d++) {
      const a = startAngle + (sweep * d) / arcDots;
      const pulse = Math.sin(time * 2 + d * 0.3) * 0.3 + 0.7;
      const dx = cx + Math.cos(a) * r;
      const dy = cy + Math.sin(a) * r;
      dot(ctx, dx, dy, 1.2 * pulse, colors[i], alpha * (0.3 + pulse * 0.2));
    }

    // Inner radial dots showing slice "weight"
    const innerDots = Math.floor(slice * 12) + 2;
    for (let d = 1; d <= innerDots; d++) {
      const a = startAngle + sweep / 2;
      const dr = (r * d) / (innerDots + 1);
      const dx = cx + Math.cos(a) * dr;
      const dy = cy + Math.sin(a) * dr;
      dot(ctx, dx, dy, 1, colors[i], alpha * 0.4);
    }

    startAngle = endAngle;
  });

  // Final closing line
  const lx = cx + Math.cos(startAngle) * r;
  const ly = cy + Math.sin(startAngle) * r;
  line(ctx, cx, cy, lx, ly, colors[0], alpha * 0.3);
}

// --- Bar Chart (vertical dotted lines + top dot) ---
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
    const bx = x + gap + i * (barW + gap) + barW / 2;
    const by = y + h - barH;
    // Vertical dotted line
    const segs = Math.floor(barH / 5);
    for (let s = 0; s < segs; s++) {
      dot(ctx, bx, y + h - s * 5, 0.9, colors[i], alpha * 0.3);
    }
    // Top emphasized dot
    dot(ctx, bx, by, 3, colors[i], alpha * 0.6);
    // Side ticks
    line(ctx, bx - 4, by, bx + 4, by, colors[i], alpha * 0.4);
  }
  line(ctx, x, y + h, x + w, y + h, SLATE, alpha * 0.1, 0.5);
}

// --- Line Chart (already line+dot, refined) ---
function drawLineChart(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const points = 10;
  const stepX = w / (points - 1);
  [{ color: GREEN, offset: 0 }, { color: GOLD, offset: 2 }].forEach(({ color, offset }) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < points; i++) {
      const px = x + i * stepX;
      const wave = Math.sin(time * 1.5 + i * 0.7 + offset) * 0.3 + 0.5;
      const py = y + h - wave * h * 0.8;
      pts.push([px, py]);
    }
    ctx.beginPath();
    pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
    ctx.strokeStyle = `rgba(${color}, ${alpha * 0.35})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    pts.forEach(([px, py], i) => {
      const pulse = Math.sin(time * 3 + i) * 0.5 + 0.5;
      dot(ctx, px, py, 2 + pulse * 1.5, color, alpha * (0.3 + pulse * 0.2));
    });
  });
}

// --- Radial Bar (dotted concentric arcs) ---
function drawRadialBar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  time: number, alpha: number
) {
  const bars = 5;
  const colors = [GREEN, GOLD, BLUE, TEAL, PURPLE];
  for (let i = 0; i < bars; i++) {
    const radius = (r / (bars + 1)) * (i + 1.5);
    const progress = Math.sin(time * 1.2 + i * 0.9) * 0.3 + 0.65;
    const sweep = Math.PI * 2 * progress;
    const startAngle = -Math.PI / 2;
    // Dotted active arc
    const dots = Math.floor(sweep * radius / 4);
    for (let d = 0; d <= dots; d++) {
      const a = startAngle + (sweep * d) / dots;
      const dx = cx + Math.cos(a) * radius;
      const dy = cy + Math.sin(a) * radius;
      dot(ctx, dx, dy, 1.3, colors[i], alpha * 0.35);
    }
    // End line tick
    const ex = cx + Math.cos(startAngle + sweep) * radius;
    const ey = cy + Math.sin(startAngle + sweep) * radius;
    dot(ctx, ex, ey, 2.5, colors[i], alpha * 0.55);
  }
  dot(ctx, cx, cy, 2, GREEN, alpha * 0.5);
}

// --- Grouped Bar (dotted columns) ---
function drawGroupedBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const groups = 4;
  const barsPerGroup = 3;
  const groupGap = w * 0.08;
  const groupW = (w - groupGap * (groups + 1)) / groups;
  const barW = groupW / barsPerGroup;
  const colors = [GREEN, GOLD, BLUE];
  for (let g = 0; g < groups; g++) {
    const gx = x + groupGap + g * (groupW + groupGap);
    for (let b = 0; b < barsPerGroup; b++) {
      const bounce = Math.sin(time * 1.8 + g * 0.7 + b * 1.1) * 0.25 + 0.7;
      const barH = h * bounce * (0.5 + b * 0.15);
      const bx = gx + b * barW + barW / 2;
      const by = y + h - barH;
      const segs = Math.floor(barH / 5);
      for (let s = 0; s < segs; s++) {
        dot(ctx, bx, y + h - s * 5, 0.8, colors[b], alpha * 0.3);
      }
      dot(ctx, bx, by, 2.5, colors[b], alpha * 0.55);
    }
  }
  line(ctx, x, y + h, x + w, y + h, SLATE, alpha * 0.1, 0.5);
}

// --- Box Chart (dot whiskers + line median) ---
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
    const cx = bx + boxW / 2;
    const mid = Math.sin(time * 1.3 + i * 0.8) * 0.15 + 0.5;
    const q1 = mid + 0.12;
    const q3 = mid - 0.12;
    const wHi = q3 - 0.12;
    const wLo = q1 + 0.12;
    const median = mid;
    // Whisker dotted line
    const whiskerH = (wLo - wHi) * h;
    const segs = Math.floor(whiskerH / 4);
    for (let s = 0; s < segs; s++) {
      dot(ctx, cx, y + wHi * h + s * 4, 0.8, colors[i], alpha * 0.25);
    }
    // Caps as dots
    dot(ctx, cx, y + wHi * h, 2, colors[i], alpha * 0.4);
    dot(ctx, cx, y + wLo * h, 2, colors[i], alpha * 0.4);
    // Box corners as dots
    dot(ctx, bx, y + q3 * h, 1.5, colors[i], alpha * 0.4);
    dot(ctx, bx + boxW, y + q3 * h, 1.5, colors[i], alpha * 0.4);
    dot(ctx, bx, y + q1 * h, 1.5, colors[i], alpha * 0.4);
    dot(ctx, bx + boxW, y + q1 * h, 1.5, colors[i], alpha * 0.4);
    // Box outline lines
    line(ctx, bx, y + q3 * h, bx + boxW, y + q3 * h, colors[i], alpha * 0.25);
    line(ctx, bx, y + q1 * h, bx + boxW, y + q1 * h, colors[i], alpha * 0.25);
    line(ctx, bx, y + q3 * h, bx, y + q1 * h, colors[i], alpha * 0.25);
    line(ctx, bx + boxW, y + q3 * h, bx + boxW, y + q1 * h, colors[i], alpha * 0.25);
    // Median line
    line(ctx, bx, y + median * h, bx + boxW, y + median * h, colors[i], alpha * 0.5, 1.2);
  }
}

// --- Radial Histogram (dotted radial spokes) ---
function drawRadialHistogram(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  time: number, alpha: number
) {
  const bins = 24;
  const innerR = r * 0.3;
  const angleStep = (Math.PI * 2) / bins;
  const colors = [GREEN, TEAL, GOLD, BLUE, PURPLE];

  for (let i = 0; i < bins; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const base = 0.4 + Math.sin(i * 1.3 + 0.5) * 0.3;
    const wave = Math.sin(time * 1.8 + i * 0.5) * 0.2;
    const barR = innerR + (r - innerR) * Math.max(0.1, base + wave);
    const color = colors[i % colors.length];

    // Dotted spoke
    const spokeLen = barR - innerR;
    const dots = Math.floor(spokeLen / 4);
    for (let d = 0; d < dots; d++) {
      const dr = innerR + d * 4;
      const dx = cx + Math.cos(angle) * dr;
      const dy = cy + Math.sin(angle) * dr;
      dot(ctx, dx, dy, 0.9, color, alpha * 0.3);
    }
    // Outer dot
    const ex = cx + Math.cos(angle) * barR;
    const ey = cy + Math.sin(angle) * barR;
    dot(ctx, ex, ey, 1.8, color, alpha * 0.5);
  }

  // Inner ring as dotted circle
  const ringDots = 32;
  for (let i = 0; i < ringDots; i++) {
    const a = (i / ringDots) * Math.PI * 2;
    dot(ctx, cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR, 0.7, GREEN, alpha * 0.2);
  }
}

// --- Connected Scatter (lines + dots — keep as is, refine) ---
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
  ctx.beginPath();
  pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
  ctx.strokeStyle = `rgba(${PURPLE}, ${alpha * 0.25})`;
  ctx.lineWidth = 1;
  ctx.stroke();
  pts.forEach(([px, py], i) => {
    const pulse = Math.sin(time * 2.5 + i * 0.8) * 0.5 + 0.5;
    const size = 2.5 + pulse * 2;
    dot(ctx, px, py, size, i % 2 === 0 ? PURPLE : TEAL, alpha * (0.3 + pulse * 0.2));
  });
}

// --- Stream Graph → Multi-line dot trails ---
function drawStreamGraph(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, alpha: number
) {
  const layers = 4;
  const points = 14;
  const stepX = w / (points - 1);
  const colors = [GREEN, GOLD, BLUE, TEAL];

  for (let l = 0; l < layers; l++) {
    const pts: [number, number][] = [];
    for (let i = 0; i < points; i++) {
      const px = x + i * stepX;
      const baseline = y + h * 0.5 + (l - layers / 2) * h * 0.12;
      const wave = Math.sin(time * (0.8 + l * 0.3) + i * 0.5 + l * 1.5) * h * 0.08;
      pts.push([px, baseline + wave]);
    }
    ctx.beginPath();
    pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
    ctx.strokeStyle = `rgba(${colors[l]}, ${alpha * 0.25})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    pts.forEach(([px, py]) => dot(ctx, px, py, 1.5, colors[l], alpha * 0.4));
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
      drawHeatMap(ctx, w * 0.02, h * 0.04, w * 0.14, h * 0.08, time, 1);
      drawRadialBar(ctx, w * 0.28, h * 0.1, s * 0.06, time, 0.9);
      drawRadialHistogram(ctx, w * 0.86, h * 0.14, s * 0.07, time, 1);
      drawHistogram(ctx, w * 0.62, h * 0.04, w * 0.16, h * 0.1, time + 1, 0.9);

      // === MIDDLE ROW ===
      drawPieChart(ctx, w * 0.08, h * 0.4, s * 0.06, time + 1, 0.85);
      drawConnectedScatter(ctx, w * 0.78, h * 0.35, w * 0.18, h * 0.1, time, 0.8);
      drawStreamGraph(ctx, w * 0.02, h * 0.55, w * 0.18, h * 0.1, time, 0.75);
      drawBoxChart(ctx, w * 0.82, h * 0.52, w * 0.14, h * 0.12, time, 0.7);

      // === BOTTOM ROW ===
      drawGroupedBar(ctx, w * 0.03, h * 0.78, w * 0.18, h * 0.12, time, 1);
      drawLineChart(ctx, w * 0.76, h * 0.80, w * 0.2, h * 0.1, time, 1);
      drawBarChart(ctx, w * 0.25, h * 0.82, w * 0.14, h * 0.1, time + 2, 0.7);
      drawRadialHistogram(ctx, w * 0.55, h * 0.86, s * 0.035, time + 3, 0.5);

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
      style={{ opacity: 0.75 }}
    />
  );
}
