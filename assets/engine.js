// Markcraft logo engine: palettes, template renderer, SVG check & clean, fingerprint, exports.
// Needs globals: opentype (opentype.js), JSZip (for brand kit).

export const FONTS = [
  "Inter", "Manrope", "Space Grotesk", "DM Serif Display", "Playfair Display", "Fraunces",
  "Syne", "Outfit", "Sora", "Bricolage Grotesque", "Pacifico", "Archivo Black",
];
export const FONT_LINKS = Object.fromEntries(
  FONTS.map((f) => [f, "https://fonts.google.com/specimen/" + f.replace(/ /g, "+")])
);
export const VIBES = ["Minimal", "Playful", "Luxury", "Techy", "Organic", "Bold", "Retro"];
export const STYLE_LABELS = [...VIBES, "Classic"]; // uint8 style stored on-chain
export const INDUSTRIES = ["Food & drink", "Tech", "Beauty", "Fashion", "Education", "Health", "Finance", "Creative", "Community", "Other"];
export const LAYOUTS = [
  { id: "icon-left", label: "Icon left" },
  { id: "icon-top", label: "Icon on top" },
  { id: "badge-circle", label: "Badge · circle" },
  { id: "badge-rounded", label: "Badge · rounded" },
  { id: "emblem", label: "Emblem · seal" },
  { id: "wordmark", label: "Wordmark only" },
  { id: "monogram", label: "Monogram only" },
];

export const PALETTES = [
  { vibe: "Minimal", name: "Ink", colors: ["#1A1A1A", "#1A1A1A", "#EF7B43"] },
  { vibe: "Minimal", name: "Slate", colors: ["#2F3A40", "#2F3A40", "#9AA5AB"] },
  { vibe: "Minimal", name: "Fern", colors: ["#3D6146", "#1A1A1A", "#C9D6C3"] },
  { vibe: "Minimal", name: "Cobalt", colors: ["#1C48C9", "#14213D", "#A7C0F2"] },
  { vibe: "Playful", name: "Sherbet", colors: ["#FF6B6B", "#2D2A32", "#FFD93D"] },
  { vibe: "Playful", name: "Grape", colors: ["#7B5CFA", "#22223B", "#FF9F1C"] },
  { vibe: "Playful", name: "Lagoon", colors: ["#00A6A6", "#2B2D42", "#F49D37"] },
  { vibe: "Playful", name: "Bubblegum", colors: ["#E85D9E", "#3A2E39", "#5BC0EB"] },
  { vibe: "Luxury", name: "Champagne", colors: ["#B8925A", "#1E1E1E", "#E8D9BF"] },
  { vibe: "Luxury", name: "Cocoa", colors: ["#4A2308", "#2A1A0F", "#C57E2C"] },
  { vibe: "Luxury", name: "Emerald", colors: ["#1F3B2D", "#14211A", "#C9A86A"] },
  { vibe: "Luxury", name: "Merlot", colors: ["#5B1A33", "#2B0F19", "#D4AF7A"] },
  { vibe: "Techy", name: "Signal", colors: ["#2F6BFF", "#0E1525", "#22D3EE"] },
  { vibe: "Techy", name: "Circuit", colors: ["#7C3AED", "#111827", "#10B981"] },
  { vibe: "Techy", name: "Teal Ops", colors: ["#0EA5A4", "#0B1F2A", "#F97316"] },
  { vibe: "Organic", name: "Moss", colors: ["#5E7D4E", "#2E3B26", "#D9A05B"] },
  { vibe: "Organic", name: "Clay", colors: ["#A0522D", "#3B2A20", "#8DAA7B"] },
  { vibe: "Organic", name: "Forest", colors: ["#3D6146", "#274F31", "#E6B655"] },
  { vibe: "Bold", name: "Poster", colors: ["#EF4423", "#111111", "#FFC300"] },
  { vibe: "Bold", name: "Mono Pop", colors: ["#111111", "#111111", "#EF7B43"] },
  { vibe: "Bold", name: "Electric", colors: ["#0033CC", "#0A0A0A", "#FF3D7F"] },
  { vibe: "Retro", name: "Diner", colors: ["#E07A3F", "#3E2A1E", "#2A9D8F"] },
  { vibe: "Retro", name: "Postcard", colors: ["#D1495B", "#2E3A59", "#EDAE49"] },
  { vibe: "Retro", name: "Caramel", colors: ["#C57E2C", "#4A2308", "#6A994E"] },
];
export const FONT_BY_VIBE = {
  Minimal: ["Inter", "Manrope", "Outfit", "Sora"],
  Playful: ["Pacifico", "Bricolage Grotesque", "Outfit", "Syne"],
  Luxury: ["Playfair Display", "DM Serif Display", "Fraunces"],
  Techy: ["Space Grotesk", "Sora", "Syne", "Inter"],
  Organic: ["Fraunces", "Manrope", "Bricolage Grotesque"],
  Bold: ["Archivo Black", "Syne", "Space Grotesk"],
  Retro: ["Fraunces", "DM Serif Display", "Pacifico", "Archivo Black"],
};
const INDUSTRY_THEME = {
  "Food & drink": ["food"], Tech: ["tech"], Beauty: ["beauty"], Fashion: ["fashion"], Education: ["education"],
  Health: ["health"], Finance: ["finance"], Creative: ["creative"], Community: ["community"], Other: ["shapes", "misc", "nature"],
};
const KEYWORDS = {
  candle: ["flame", "flame-kindling", "sparkle"], candles: ["flame", "flame-kindling"], coffee: ["coffee"], cafe: ["coffee", "croissant"],
  tea: ["cup-soda", "leaf"], bakery: ["croissant", "wheat", "cake"], bread: ["wheat", "croissant"], cake: ["cake", "cake-slice"],
  pet: ["paw-print", "dog", "cat", "bone"], pets: ["paw-print", "dog", "cat"], dog: ["dog", "bone", "paw-print"], cat: ["cat", "paw-print"],
  plant: ["sprout", "leaf"], plants: ["sprout", "leaf", "flower"], garden: ["flower", "sprout", "shrub"], flower: ["flower", "flower-2"],
  morning: ["sunrise", "sun"], mornings: ["sunrise", "sun", "coffee"], sleep: ["moon", "moon-star", "bed"], yoga: ["leaf", "sun", "heart-pulse"],
  fitness: ["dumbbell", "activity", "heart-pulse"], gym: ["dumbbell"], book: ["book-open", "book"], books: ["library", "book-open"],
  music: ["music", "headphones", "disc-3"], photo: ["camera", "aperture"], film: ["film", "clapperboard"], travel: ["plane", "compass", "map"],
  code: ["code-xml", "terminal", "braces"], ai: ["brain-circuit", "sparkles", "bot"], data: ["database", "chart-line"], cloud: ["cloud", "cloud-cog"],
  money: ["coins", "wallet", "piggy-bank"], bank: ["landmark", "vault"], invest: ["trending-up", "chart-line"], school: ["graduation-cap", "school"],
  kids: ["baby", "puzzle", "shapes"], game: ["gamepad-2", "dice-5", "joystick"], games: ["gamepad-2", "dice-5"], ocean: ["waves", "shell", "fish-symbol"],
  sea: ["waves", "sailboat", "anchor"], mountain: ["mountain", "mountain-snow"], hike: ["mountain", "tent", "compass"], wine: ["wine", "grape"],
  beer: ["beer", "hop"], pizza: ["pizza"], ice: ["ice-cream-cone", "snowflake"], skin: ["droplet", "sparkles"], hair: ["scissors", "sparkles"],
  jewelry: ["gem", "crown"], clothes: ["shirt", "tag"], shoes: ["footprints"], care: ["hand-heart", "heart-handshake"], clinic: ["stethoscope", "cross"],
  rocket: ["rocket"], space: ["rocket", "orbit", "moon-star"], community: ["users-round", "handshake"], event: ["party-popper", "calendar"],
  home: ["house", "home", "sofa"], craft: ["scissors", "paintbrush", "pen-tool"], design: ["pen-tool", "palette", "shapes"], art: ["palette", "paintbrush", "brush"],
};
const ADJ = {
  Minimal: ["Quiet", "Simple", "Clean", "Pure"], Playful: ["Happy", "Bouncy", "Sunny", "Little"], Luxury: ["Golden", "Noble", "Velvet", "Grand"],
  Techy: ["Smart", "Bright", "Quantum", "Swift"], Organic: ["Wild", "Rising", "Gentle", "Rooted"], Bold: ["Big", "Loud", "Strong", "True"],
  Retro: ["Vintage", "Classic", "Old-Town", "Lucky"],
};

// ---------- small utils ----------
const r2 = (n) => Math.round(n * 100) / 100;
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pick = (arr, rnd = Math.random) => arr[Math.floor(rnd() * arr.length)];
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const titleCase = (s) => s.replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
export const uid = () => Math.random().toString(36).slice(2, 10);

export function hexToRgb(h) {
  const x = h.replace("#", "");
  const f = x.length === 3 ? x.split("").map((c) => c + c).join("") : x;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
}
export function luminance(h) {
  const [r, g, b] = hexToRgb(h).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const onColor = (bg) => (contrast(bg, "#FFFFFF") >= 3 ? "#FFFFFF" : "#1A1A1A");
const isHex = (s) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s);

// ---------- assets ----------
let ICONS = null, FONT_MANIFEST = null;
const fontCache = new Map();
export const loadErrors = new Set();

export async function loadIcons() {
  if (ICONS) return ICONS;
  try {
    ICONS = await (await fetch("assets/icons.json")).json();
  } catch {
    loadErrors.add("icons");
    ICONS = { icons: { circle: '<circle cx="12" cy="12" r="10" />' }, tags: { circle: ["shapes"] } };
  }
  return ICONS;
}
export const iconNames = () => Object.keys(ICONS?.icons || {});
export const iconTags = (n) => ICONS?.tags?.[n] || [];

async function fontManifest() {
  if (!FONT_MANIFEST) FONT_MANIFEST = await (await fetch("assets/fonts.json")).json();
  return FONT_MANIFEST;
}
export async function fontWeights(family) {
  const m = await fontManifest();
  return Object.keys(m[family] || {}).map(Number);
}
/** Returns { font, family, fallback } — falls back to the nearest weight, then to Inter. */
export async function getFont(family, weight = 400) {
  const key = family + ":" + weight;
  if (fontCache.has(key)) return fontCache.get(key);
  const p = (async () => {
    try {
      const m = await fontManifest();
      const ws = m[family];
      if (!ws) throw new Error("unknown font");
      const w = ws[weight] ? weight : Number(Object.keys(ws)[0]);
      const buf = await (await fetch(ws[w])).arrayBuffer();
      return { font: opentype.parse(buf), family, weight: w, fallback: false };
    } catch (e) {
      loadErrors.add(family);
      if (family === "Inter") throw e;
      const fb = await getFont("Inter", weight);
      return { ...fb, fallback: true };
    }
  })();
  fontCache.set(key, p);
  return p;
}

// ---------- text → paths ----------
function layoutText(font, text, size, trackingEm, x0, baseline) {
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(text);
  let x = x0, d = "";
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  glyphs.forEach((g, i) => {
    const p = g.getPath(x, baseline, size);
    const bb = p.getBoundingBox();
    if (p.commands.length && isFinite(bb.x1)) {
      d += p.toPathData(2);
      minX = Math.min(minX, bb.x1); minY = Math.min(minY, bb.y1);
      maxX = Math.max(maxX, bb.x2); maxY = Math.max(maxY, bb.y2);
    }
    x += (g.advanceWidth || 0) * scale;
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale + trackingEm * size;
  });
  const capH = ((font.tables.os2 && font.tables.os2.sCapHeight) || font.ascender * 0.7) * scale;
  if (!isFinite(minX)) { minX = x0; maxX = x0; minY = baseline - capH; maxY = baseline; }
  return { d, width: x - x0, capH, bbox: { minX, minY, maxX, maxY } };
}
function measureText(font, text, size, trackingEm) {
  return layoutText(font, text, size, trackingEm, 0, 0);
}
function applyCase(s, mode) {
  if (mode === "upper") return s.toUpperCase();
  if (mode === "lower") return s.toLowerCase();
  if (mode === "title") return titleCase(s.toLowerCase());
  return s;
}
const initials = (name) => {
  const w = name.trim().split(/\s+/).filter(Boolean);
  return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || "M")[0]).toUpperCase();
};

// ---------- generated marks ----------
// Small code recipes that draw an original mark from the brand name + a seed. Always valid SVG.
export const GENERATORS = [
  { id: "radial", label: "Radial", noun: "Bloom", reason: "A repeating burst built from your name — reads as a flower, sun or seal." },
  { id: "bauhaus", label: "Bauhaus", noun: "Tiles", reason: "Bold geometric tiles in your palette — a pattern no one else has." },
  { id: "monocut", label: "Monogram", noun: "Monogram", reason: "Your initials, cut and layered into a compact mark." },
  { id: "dotgrid", label: "Dot grid", noun: "Pixel", reason: "Your first letter drawn in dots — crisp, techy and great at small sizes." },
  { id: "stripes", label: "Stripes", noun: "Bands", reason: "A striped shape with a retro, sporty rhythm." },
];
const GEN_BY_VIBE = {
  Minimal: ["bauhaus", "monocut", "radial"], Playful: ["radial", "bauhaus", "dotgrid"], Luxury: ["monocut", "radial"],
  Techy: ["dotgrid", "bauhaus", "stripes"], Organic: ["radial", "stripes"], Bold: ["stripes", "bauhaus", "monocut"],
  Retro: ["stripes", "monocut", "radial"],
};
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seedStr) {
  let a = hashStr(seedStr);
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const circlePath = (cx, cy, r) => `M${r2(cx - r)} ${r2(cy)}A${r2(r)} ${r2(r)} 0 1 0 ${r2(cx + r)} ${r2(cy)}A${r2(r)} ${r2(r)} 0 1 0 ${r2(cx - r)} ${r2(cy)}Z`;
const readable = (h) => contrast(h, "#FFFFFF") >= 1.8;

function genRadial(R, cm, ca) {
  const n = pick([6, 8, 10, 12], R);
  const petal = pick(["ellipse", "drop", "bar", "circle"], R);
  const two = R() < 0.6;
  const ro = 8 + R() * 8;
  const len = 46 - ro - 2;
  let s = "";
  for (let i = 0; i < n; i++) {
    const col = two && i % 2 ? ca : cm;
    const rot = `rotate(${r2((360 / n) * i)} 50 50)`;
    const w = Math.min(len * 0.42, (Math.PI * 2 * (ro + len / 2)) / n * 0.55);
    if (petal === "ellipse") s += `<ellipse cx="50" cy="${r2(50 - ro - len / 2)}" rx="${r2(w / 2)}" ry="${r2(len / 2)}" fill="${col}" opacity="0.9" transform="${rot}"/>`;
    else if (petal === "bar") s += `<rect x="${r2(50 - w / 4)}" y="${r2(50 - ro - len)}" width="${r2(w / 2)}" height="${r2(len)}" rx="${r2(w / 4)}" fill="${col}" transform="${rot}"/>`;
    else if (petal === "circle") s += `<circle cx="50" cy="${r2(50 - ro - len * 0.62)}" r="${r2(Math.min(w * 0.6, len * 0.38))}" fill="${col}" transform="${rot}"/>`;
    else {
      const t = 50 - ro - len, b = 50 - ro, hw = w / 2;
      s += `<path d="M50 ${r2(b)}C${r2(50 + hw)} ${r2(b - len * 0.35)} ${r2(50 + hw * 0.7)} ${r2(t)} 50 ${r2(t)}C${r2(50 - hw * 0.7)} ${r2(t)} ${r2(50 - hw)} ${r2(b - len * 0.35)} 50 ${r2(b)}Z" fill="${col}" opacity="0.92" transform="${rot}"/>`;
    }
  }
  if (R() < 0.75) s += `<circle cx="50" cy="50" r="${r2(Math.max(ro - 2, 5))}" fill="${two ? cm : ca}"/>`;
  return s;
}

function genBauhaus(R, cm, ct, ca) {
  const g = R() < 0.55 ? 2 : 3;
  const gap = R() < 0.5 ? 0 : 3;
  const s = (100 - gap * (g - 1)) / g;
  const cols = [cm, ca, ct].filter((c, i, a) => a.indexOf(c) === i);
  let out = "", used = new Set();
  for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) {
    const x = i * (s + gap), y = j * (s + gap), cx = x + s / 2, cy = y + s / 2;
    const type = pick(["quarter", "quarter", "half", "circle", "triangle", "square"], R);
    let col = pick(cols, R);
    if (i === g - 1 && j === g - 1 && used.size < 2) col = [...cols].find((c) => !used.has(c)) || col;
    used.add(col);
    const rot = `rotate(${Math.floor(R() * 4) * 90} ${r2(cx)} ${r2(cy)})`;
    if (R() < 0.35) {
      const bg = cols.find((c) => c !== col) || ca;
      out += `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(s)}" height="${r2(s)}" fill="${bg}"/>`;
    }
    if (type === "quarter") out += `<path d="M${r2(x)} ${r2(y)}L${r2(x + s)} ${r2(y)}A${r2(s)} ${r2(s)} 0 0 1 ${r2(x)} ${r2(y + s)}Z" fill="${col}" transform="${rot}"/>`;
    else if (type === "half") out += `<path d="M${r2(x)} ${r2(y + s)}A${r2(s / 2)} ${r2(s / 2)} 0 0 1 ${r2(x + s)} ${r2(y + s)}Z" fill="${col}" transform="${rot}"/>`;
    else if (type === "circle") out += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(s * 0.44)}" fill="${col}"/>`;
    else if (type === "triangle") out += `<polygon points="${r2(x)},${r2(y)} ${r2(x + s)},${r2(y)} ${r2(x)},${r2(y + s)}" fill="${col}" transform="${rot}"/>`;
    else out += `<rect x="${r2(x + s * 0.12)}" y="${r2(y + s * 0.12)}" width="${r2(s * 0.76)}" height="${r2(s * 0.76)}" rx="${r2(s * 0.12)}" fill="${col}"/>`;
  }
  return out;
}

function genStripes(R, cm, ca) {
  const shape = pick(["circle", "circle", "arch", "diamond"], R);
  const bands = pick([4, 5, 6, 7], R);
  const diag = R() < 0.35;
  const mode = pick(["sunset", "solid", "alt"], R);
  const top = 6, bottom = 94, H = bottom - top;
  const gap = H * (0.06 + R() * 0.04);
  const h = (H - gap * (bands - 1)) / bands;
  const hw = (y) => {
    if (shape === "circle") return Math.sqrt(Math.max(0, 44 * 44 - (y - 50) * (y - 50)));
    if (shape === "diamond") return Math.max(0, 44 - Math.abs(y - 50));
    return y < 50 ? Math.sqrt(Math.max(0, 44 * 44 - (50 - y) * (50 - y))) : 44; // arch
  };
  let s = "";
  for (let i = 0; i < bands; i++) {
    const y0 = top + i * (h + gap), y1 = y0 + h;
    const w = Math.min(hw(y0), hw(y1), hw((y0 + y1) / 2));
    if (w < 3) continue;
    const col = mode === "solid" ? cm : mode === "alt" ? (i % 2 ? ca : cm) : i >= bands / 2 ? ca : cm;
    s += `<rect x="${r2(50 - w)}" y="${r2(y0)}" width="${r2(w * 2)}" height="${r2(h)}" rx="${r2(Math.min(h / 2, 4))}" fill="${col}"/>`;
  }
  if (mode === "solid") s += `<circle cx="${r2(50 + 30 * (R() < 0.5 ? -1 : 1))}" cy="18" r="9" fill="${ca}"/>`;
  return diag ? `<g transform="rotate(-35 50 50)">${s}</g>` : s;
}

// 5×7 dot font for the dot-grid generator
const DOTS = {
  A: ".###.#...##...######...##...##...#", B: "####.#...##...#####.#...##...#####.", C: ".###.#...##....#....#....#...#.###.",
  D: "####.#...##...##...##...##...#####.", E: "######....#....####.#....#....#####", F: "######....#....####.#....#....#....",
  G: ".###.#...##....#.####...##...#.####", H: "#...##...##...#######...##...##...#", I: ".###...#....#....#....#....#...###.",
  J: "..###...#....#....#....#.#..#..##..", K: "#...##..#.#.#..##...#.#..#..#.#...#", L: "#....#....#....#....#....#....#####",
  M: "#...###.###.#.##.#.##...##...##...#", N: "#...##...###..##.#.##..###...##...#", O: ".###.#...##...##...##...##...#.###.",
  P: "####.#...##...#####.#....#....#....", Q: ".###.#...##...##...##.#.##..#..##.#", R: "####.#...##...#####.#.#..#..#.#...#",
  S: ".#####....#.....###.....#....#####.", T: "#####..#....#....#....#....#....#..", U: "#...##...##...##...##...##...#.###.",
  V: "#...##...##...##...##...#.#.#...#..", W: "#...##...##...##.#.##.#.##.#..#.#.", X: "#...##...#.#.#...#...#.#.#...##...#",
  Y: "#...##...#.#.#...#....#....#....#..", Z: "#####....#...#...#...#...#....#####", 0: ".###.#...##..###.#.###..##...#.###.",
  1: "..#...##....#....#....#....#...###.", 2: ".###.#...#....#...#...#...#...#####", 3: "####.....#....#.###.....#....#####.",
  4: "...#...##..#.#.#..#.#####...#....#.", 5: "######....####.....#....##...#.###.", 6: ".###.#....#....####.#...##...#.###.",
  7: "#####....#...#...#...#....#....#...", 8: ".###.#...##...#.###.#...##...#.###.", 9: ".###.#...##...#.####....#....#.###.",
};
function genDotgrid(R, brand, cm, ca) {
  const ch = ((brand || "M").toUpperCase().match(/[A-Z0-9]/) || ["M"])[0];
  const bits = DOTS[ch] || DOTS.M;
  const cell = 12.5, ox = 50 - cell * 2.5, oy = 50 - cell * 3.5;
  const style = pick(["round", "round", "square", "led"], R);
  const accents = new Set();
  const on = [...bits].map((b, i) => (b === "#" ? i : -1)).filter((i) => i >= 0);
  for (let k = 0; k < Math.min(3, on.length); k++) accents.add(pick(on, R));
  let s = "";
  [...bits].forEach((b, i) => {
    const cx = ox + (i % 5) * cell + cell / 2, cy = oy + Math.floor(i / 5) * cell + cell / 2;
    if (b !== "#") {
      if (style === "led") s += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(cell * 0.38)}" fill="${cm}" opacity="0.14"/>`;
      return;
    }
    const col = accents.has(i) ? ca : cm;
    if (style === "square") s += `<rect x="${r2(cx - cell * 0.4)}" y="${r2(cy - cell * 0.4)}" width="${r2(cell * 0.8)}" height="${r2(cell * 0.8)}" rx="${r2(cell * 0.12)}" fill="${col}"/>`;
    else s += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(cell * 0.42)}" fill="${col}"/>`;
  });
  return s;
}

function genMonocut(R, brand, font, cm, ca) {
  if (!font) return genBauhaus(R, cm, cm, ca);
  const ini = initials(brand || "M");
  const variant = pick(ini.length > 1 ? ["shadow", "overlap", "framed", "disc"] : ["shadow", "framed", "disc", "overlap"], R);
  const fit = (text, box) => {
    const m = measureText(font, text, 100, 0);
    const w = m.bbox.maxX - m.bbox.minX, h = m.bbox.maxY - m.bbox.minY || m.capH;
    const k = Math.min(box / Math.max(w, 1), box / Math.max(h, 1));
    const size = 100 * k;
    const mm = measureText(font, text, size, 0);
    const x = 50 - (mm.bbox.minX + mm.bbox.maxX) / 2, base = 50 - (mm.bbox.minY + mm.bbox.maxY) / 2;
    return (dx = 0, dy = 0) => layoutText(font, text, size, 0, x + dx, base + dy).d;
  };
  if (variant === "shadow") {
    const d = fit(ini, 70);
    return `<path fill="${ca}" d="${d(5, 5)}"/><path fill="${cm}" d="${d()}"/>`;
  }
  if (variant === "framed") {
    const d = fit(ini, 52);
    return `<rect x="6" y="6" width="88" height="88" rx="${pick([12, 22, 44], R)}" fill="none" stroke="${cm}" stroke-width="6"/><path fill="${cm}" d="${d(0, -4)}"/><rect x="34" y="78" width="32" height="5" rx="2.5" fill="${ca}"/>`;
  }
  if (variant === "disc") {
    const d = fit(ini, 54), on = onColor(cm);
    return `<circle cx="50" cy="50" r="46" fill="${cm}"/><circle cx="${pick([78, 22], R)}" cy="22" r="11" fill="${ca}"/><path fill="${on}" d="${d()}"/>`;
  }
  // overlap: two letters (or letter + disc) layered with transparency
  if (ini.length > 1) {
    const a = fit(ini[0], 66), b = fit(ini[1], 66);
    return `<path fill="${cm}" opacity="0.92" d="${a(-14, 0)}"/><path fill="${ca}" opacity="0.88" d="${b(14, 0)}"/>`;
  }
  const d = fit(ini, 64);
  return `<circle cx="62" cy="58" r="32" fill="${ca}"/><path fill="${cm}" opacity="0.94" d="${d(-6, 0)}"/>`;
}

/** Inner content (0..100) for a generated mark. */
function generatedInner(c, colors, font) {
  const [cm, ct, ca0] = colors;
  const ca = readable(ca0) || c.gen?.type === "bauhaus" ? ca0 : cm;
  const R = rng(`${c.brand}|${c.gen?.type}|${c.gen?.seed || 0}`);
  switch (c.gen?.type) {
    case "radial": return genRadial(R, cm, ca);
    case "bauhaus": return genBauhaus(R, cm, ct, ca0);
    case "stripes": return genStripes(R, cm, ca);
    case "dotgrid": return genDotgrid(R, c.brand, cm, ca);
    default: return genMonocut(R, c.brand, font, cm, ca);
  }
}

// ---------- marks ----------
/** Mark content inside a 0..100 box. */
function markInner(c, colors, font) {
  const [cm, , ca] = colors;
  if (c.kind === "custom" && c.markSvg) return c.markSvg;
  if (c.kind === "generated") return generatedInner(c, colors, font);
  const icon = ICONS.icons[c.icon] || ICONS.icons.circle || "";
  const sw = c.strokeWidth || 2;
  const stroke = (col, t) =>
    `<g fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" transform="${t}">${icon}</g>`;
  if (c.frame === "circle")
    return `<circle cx="50" cy="50" r="50" fill="${cm}"/>` + stroke(onColor(cm), "translate(22 22) scale(2.3333)");
  if (c.frame === "square")
    return `<rect width="100" height="100" rx="24" fill="${cm}"/>` + stroke(onColor(cm), "translate(22 22) scale(2.3333)");
  if (c.frame === "accent")
    return `<circle cx="58" cy="42" r="34" fill="${ca}"/>` + stroke(cm, "translate(6 6) scale(3.6667)");
  return stroke(cm, "translate(4 4) scale(3.8333)");
}
const placeMark = (inner, x, y, s) => `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s / 100 * 10000) / 10000})">${inner}</g>`;

function darkColors(colors) {
  return colors.map((h) => (luminance(h) < 0.12 ? "#F8F7F5" : h));
}
function recolorDark(svgInner) {
  return svgInner.replace(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g, (h) => (luminance(h) < 0.12 ? "#F8F7F5" : h));
}

// ---------- name styles ----------
export const TEXT_STYLES = [
  { id: "plain", label: "Plain" },
  { id: "twotone", label: "Two-tone" },
  { id: "mixed", label: "Mixed weight" },
  { id: "stacked", label: "Stacked" },
];
/** Split the brand name into lines of coloured/weighted runs. */
function nameLines(c, name, fonts, colors) {
  const [cm, ct, ca] = colors;
  const accent = cm !== ct && contrast(cm, "#FFFFFF") >= 2.2 ? cm : contrast(ca, "#FFFFFF") >= 2.2 ? ca : ct;
  const words = name.split(/\s+/).filter(Boolean);
  const plain = [[{ text: name, font: fonts.main, color: ct }]];
  const style = c.textStyle || "plain";
  const twotone = () =>
    words.length > 1
      ? [[{ text: words[0] + " ", font: fonts.main, color: ct }, { text: words.slice(1).join(" "), font: fonts.main, color: accent }]]
      : [[{ text: name[0], font: fonts.main, color: accent }, { text: name.slice(1), font: fonts.main, color: ct }]];
  if (style === "twotone") return twotone();
  if (style === "mixed") {
    if (words.length < 2 || fonts.bold === fonts.reg) return twotone();
    return [[{ text: words[0] + " ", font: fonts.bold, color: ct }, { text: words.slice(1).join(" "), font: fonts.reg, color: ct }]];
  }
  if (style === "stacked" && words.length > 1) {
    let best = 1, diff = Infinity;
    for (let k = 1; k < words.length; k++) {
      const d = Math.abs(words.slice(0, k).join(" ").length - words.slice(k).join(" ").length);
      if (d < diff) { diff = d; best = k; }
    }
    return [
      [{ text: words.slice(0, best).join(" "), font: fonts.main, color: ct }],
      [{ text: words.slice(best).join(" "), font: fonts.main, color: accent === ct ? ct : accent }],
    ];
  }
  return plain;
}
/** Lay out lines of runs. align: "left" | "center". Returns paths + bbox + metrics. */
function layoutLines(lines, size, tracking, align, x, top) {
  const parts = [];
  let bb = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const capH = measureText(lines[0][0].font, "H", size, 0).capH;
  const lineGap = size * 0.24;
  let baseline = top + capH, maxW = 0;
  lines.forEach((line, li) => {
    const widths = line.map((r) => measureText(r.font, r.text, size, tracking).width);
    const w = widths.reduce((a, b) => a + b, 0);
    maxW = Math.max(maxW, w);
    let cx = align === "center" ? x - w / 2 : x;
    line.forEach((r, i) => {
      const t = layoutText(r.font, r.text, size, tracking, cx, baseline);
      if (t.d) {
        parts.push(`<path fill="${r.color}" d="${t.d}"/>`);
        bb = { minX: Math.min(bb.minX, t.bbox.minX), minY: Math.min(bb.minY, t.bbox.minY), maxX: Math.max(bb.maxX, t.bbox.maxX), maxY: Math.max(bb.maxY, t.bbox.maxY) };
      }
      cx += widths[i] + (i < line.length - 1 ? tracking * size : 0);
    });
    if (li < lines.length - 1) baseline += capH + lineGap;
  });
  if (!isFinite(bb.minX)) bb = { minX: x, minY: top, maxX: x, maxY: top + capH };
  return { parts, bbox: bb, width: maxW, capH, lastBaseline: baseline, height: baseline - top };
}

/** Text set along a circle. side "top" reads clockwise over the top, "bottom" reads left→right under it. */
function arcText(font, text, size, trackingEm, radius, side, color) {
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(text);
  const adv = glyphs.map((g, i) => (g.advanceWidth || 0) * scale + (i < glyphs.length - 1 ? font.getKerningValue(g, glyphs[i + 1]) * scale + trackingEm * size : 0));
  const total = adv.reduce((a, b) => a + b, 0);
  let pos = 0, out = "";
  glyphs.forEach((g, i) => {
    const w = (g.advanceWidth || 0) * scale;
    const center = pos + w / 2;
    pos += adv[i];
    const p = g.getPath(-w / 2, 0, size);
    if (!p.commands.length) return;
    const ang = ((center - total / 2) / radius) * (180 / Math.PI) * (side === "top" ? 1 : -1);
    out += `<path transform="rotate(${r2(ang)}) translate(0 ${r2(side === "top" ? -radius : radius)})" d="${p.toPathData(2)}"/>`;
  });
  return { svg: `<g fill="${color}">${out}</g>`, total };
}

// ---------- the renderer ----------
/**
 * concept: { brand, tagline, kind: template|generated|custom, icon, gen:{type,seed}, markSvg, font, weight,
 *            tracking, textCase, textStyle, showTagline, palette:[mark,text,accent], layout, frame,
 *            markScale, markX, markY, strokeWidth }
 * returns { svg, width, height, fallbackFont }
 */
export async function renderLogo(c, opts = {}) {
  await loadIcons();
  const dark = !!opts.dark;
  const colors = dark ? darkColors(c.palette) : c.palette.slice();
  const [cm, ct, ca] = colors;
  const cc = dark && c.kind === "custom" && c.markSvg ? { ...c, markSvg: recolorDark(c.markSvg) } : c;
  const fName = await getFont(c.font, c.weight || 400);
  const fTag = await getFont(c.font, 400);
  const fBold = await getFont(c.font, 700);
  const fonts = { main: fName.font, reg: fTag.font, bold: fBold.font };
  const tracking = (c.tracking || 0) / 100;
  const name = applyCase(c.brand || "Brand", c.textCase);
  const tagline = c.showTagline && c.tagline ? (c.textCase === "upper" ? c.tagline.toUpperCase() : c.tagline) : "";
  const NS = 72, TS = 22;
  const ms = c.markScale || 1, mx = c.markX || 0, my = c.markY || 0;
  const parts = [];
  let bb = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const grow = (b) => {
    bb.minX = Math.min(bb.minX, b.minX); bb.minY = Math.min(bb.minY, b.minY);
    bb.maxX = Math.max(bb.maxX, b.maxX); bb.maxY = Math.max(bb.maxY, b.maxY);
  };
  const addText = (t, color) => { if (t.d) parts.push(`<path fill="${color}" d="${t.d}"/>`); grow(t.bbox); };
  const addBlock = (blk) => { parts.push(...blk.parts); grow(blk.bbox); };
  const addMark = (x, y, s) => { parts.push(placeMark(markInner(cc, colors, fonts.main), x, y, s)); grow({ minX: x, minY: y, maxX: x + s, maxY: y + s }); };

  const lines = nameLines(c, name, fonts, colors);
  const mName = measureText(fName.font, name, NS, tracking);
  const mTag = tagline ? measureText(fTag.font, tagline, TS, Math.max(tracking, 0.02)) : null;
  const capH = mName.capH;
  const tagGap = 18;
  const nameH = capH + (lines.length - 1) * (capH + NS * 0.24);
  const blockH = nameH + (mTag ? tagGap + mTag.capH : 0);
  const L = c.layout || "icon-left";

  if (L === "icon-left") {
    const s = Math.max(blockH * (c.kind === "template" && c.frame === "none" ? 1.3 : 1.55), c.kind === "template" ? 92 : 108) * ms;
    const tx = s + s * 0.26;
    const top = -blockH / 2;
    addMark(mx, -s / 2 + my, s);
    const blk = layoutLines(lines, NS, tracking, "left", tx, top);
    addBlock(blk);
    if (mTag) addText(layoutText(fTag.font, tagline, TS, Math.max(tracking, 0.02), tx, blk.lastBaseline + tagGap + mTag.capH), ct);
  } else if (L === "icon-top") {
    const s = 120 * ms;
    addMark(-s / 2 + mx, -s - 28 + my, s);
    const blk = layoutLines(lines, NS, tracking, "center", 0, 0);
    addBlock(blk);
    if (mTag) addText(layoutText(fTag.font, tagline, TS, Math.max(tracking, 0.02), -mTag.width / 2, blk.lastBaseline + tagGap + mTag.capH), ct);
  } else if (L === "badge-circle" || L === "badge-rounded") {
    const D = 300;
    const fill = cm, on = onColor(fill);
    const shape = L === "badge-circle"
      ? `<circle cx="0" cy="0" r="${D / 2}" fill="${fill}"/><circle cx="0" cy="0" r="${D / 2 - 10}" fill="none" stroke="${on}" stroke-opacity="0.35" stroke-width="2"/>`
      : `<rect x="${-D / 2}" y="${-D / 2}" width="${D}" height="${D}" rx="54" fill="${fill}"/><rect x="${-D / 2 + 10}" y="${-D / 2 + 10}" width="${D - 20}" height="${D - 20}" rx="46" fill="none" stroke="${on}" stroke-opacity="0.35" stroke-width="2"/>`;
    parts.push(shape);
    grow({ minX: -D / 2, minY: -D / 2, maxX: D / 2, maxY: D / 2 });
    const s = 96 * ms;
    let inner;
    if ((cc.kind === "custom" && cc.markSvg) || cc.kind === "generated") inner = `<circle cx="50" cy="50" r="58" fill="#FFFFFF"/>` + markInner(cc, colors, fonts.main);
    else inner = markInner({ ...cc, frame: "none" }, [on, on, on]);
    parts.push(placeMark(inner, -s / 2 + mx, -s / 2 - 40 + my, s));
    const maxW = D * 0.72;
    const k = Math.min(1, maxW / Math.max(mName.width, 1));
    const size = NS * 0.62 * Math.min(1, k / 0.62);
    const mm = measureText(fName.font, name, size, tracking);
    const t = layoutText(fName.font, name, size, tracking, -mm.width / 2, 40 + mm.capH);
    if (t.d) parts.push(`<path fill="${on}" d="${t.d}"/>`);
    if (mTag) {
      const ts = Math.min(16, (D * 0.6) / Math.max(mTag.width / TS, 1));
      const mt = measureText(fTag.font, tagline, ts, 0.06);
      const tt = layoutText(fTag.font, tagline, ts, 0.06, -mt.width / 2, 40 + mm.capH + 16 + mt.capH);
      if (tt.d) parts.push(`<path fill="${on}" fill-opacity="0.85" d="${tt.d}"/>`);
    }
  } else if (L === "emblem") {
    // seal: a filled ring with the name set around the top and the tagline around the bottom
    const R = 170, band = 54, Rin = R - band;
    const fill = cm, on = onColor(fill);
    parts.push(`<path fill="${fill}" fill-rule="evenodd" d="${circlePath(0, 0, R)}${circlePath(0, 0, Rin)}"/>`);
    parts.push(`<circle cx="0" cy="0" r="${Rin - 9}" fill="none" stroke="${fill}" stroke-width="3"/>`);
    grow({ minX: -R, minY: -R, maxX: R, maxY: R });
    const ringText = (text, maxDeg, side, sizeK) => {
      const capRatio = measureText(fName.font, "H", 100, 0).capH / 100;
      let size = (band * sizeK) / capRatio;
      const tr = 0.14;
      const rb = side === "top" ? Rin + (band - size * capRatio) / 2 : Rin + (band + size * capRatio) / 2;
      const maxLen = (maxDeg * Math.PI) / 180 * rb;
      const w = measureText(fName.font, text, size, tr).width;
      if (w > maxLen) size *= maxLen / w;
      const rb2 = side === "top" ? Rin + (band - size * capRatio) / 2 : Rin + (band + size * capRatio) / 2;
      return arcText(side === "top" ? fName.font : fTag.font, text, size, tr, rb2, side, on).svg;
    };
    parts.push(ringText((c.brand || "Brand").toUpperCase(), 150, "top", 0.42));
    if (tagline) parts.push(ringText(tagline.toUpperCase(), 110, "bottom", 0.3));
    else parts.push(`<g fill="${on}">${[-14, 0, 14].map((a) => `<circle cx="0" cy="${Rin + band / 2}" r="4" transform="rotate(${a})"/>`).join("")}</g>`);
    parts.push(`<g fill="${on}"><circle cx="${-(Rin + band / 2)}" cy="0" r="5"/><circle cx="${Rin + band / 2}" cy="0" r="5"/></g>`);
    const s = Rin * 1.22 * ms;
    let inner = markInner(cc.kind === "template" ? { ...cc, frame: cc.frame === "none" ? "none" : cc.frame } : cc, colors, fonts.main);
    parts.push(placeMark(inner, -s / 2 + mx, -s / 2 + my, s));
  } else if (L === "wordmark") {
    const blk = layoutLines(lines, NS, tracking, "left", 0, 0);
    addBlock(blk);
    const dot = capH * 0.2;
    const lastW = blk.bbox.maxX;
    parts.push(`<rect x="${r2(lastW + dot * 0.7)}" y="${r2(blk.lastBaseline - dot)}" width="${r2(dot)}" height="${r2(dot)}" rx="${r2(dot * 0.2)}" fill="${ca}"/>`);
    grow({ minX: 0, minY: 0, maxX: lastW + dot * 1.7, maxY: blk.lastBaseline });
    if (mTag) addText(layoutText(fTag.font, tagline, TS, Math.max(tracking, 0.02), 0, blk.lastBaseline + tagGap + mTag.capH), ct);
  } else {
    // monogram
    const D = 220, fill = cm, on = onColor(fill);
    parts.push(`<circle cx="0" cy="0" r="${D / 2}" fill="${fill}"/><circle cx="0" cy="0" r="${D / 2 + 9}" fill="none" stroke="${ca}" stroke-width="4"/>`);
    grow({ minX: -D / 2 - 11, minY: -D / 2 - 11, maxX: D / 2 + 11, maxY: D / 2 + 11 });
    const ini = initials(c.brand || "M");
    const mi = measureText(fName.font, ini, 100, 0);
    const k = Math.min(1, (D * 0.6) / Math.max(mi.width, 1));
    const size = 100 * k;
    const m2 = measureText(fName.font, ini, size, 0);
    const t = layoutText(fName.font, ini, size, 0, -m2.width / 2, m2.capH / 2);
    if (t.d) parts.push(`<path fill="${on}" d="${t.d}"/>`);
  }

  const pad = Math.max(bb.maxX - bb.minX, bb.maxY - bb.minY) * 0.08 + 8;
  const vx = r2(bb.minX - pad), vy = r2(bb.minY - pad);
  const vw = r2(bb.maxX - bb.minX + pad * 2), vh = r2(bb.maxY - bb.minY + pad * 2);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${Math.round(vw)}" height="${Math.round(vh)}">` +
    `<title>${esc(c.brand || "Logo")}</title>` + parts.join("") + `</svg>`;
  const out = c.texture === "rough" && typeof document !== "undefined"
    ? roughen(svg, `${c.brand}|rough|${c.gen?.seed || 0}`, c.textureStrength ?? 0.6)
    : svg;
  return { svg: out, width: vw, height: vh, fallbackFont: fName.fallback };
}

/** Square mark-only SVG (for favicons / app icons). */
export async function renderMarkSquare(c, opts = {}) {
  await loadIcons();
  const colors = opts.dark ? darkColors(c.palette) : c.palette;
  if ((c.layout === "wordmark" || c.layout === "monogram") && c.kind !== "generated") {
    const r = await renderLogo({ ...c, layout: "monogram" }, opts);
    return r.svg;
  }
  let inner;
  if (c.kind === "custom" && c.markSvg) inner = `<rect width="100" height="100" rx="22" fill="#FFFFFF"/>` + placeMark(c.markSvg, 6, 6, 88);
  else if (c.kind === "generated") {
    const f = (await getFont(c.font, c.weight || 400)).font;
    inner = `<rect width="100" height="100" rx="22" fill="#FFFFFF"/>` + placeMark(markInner(c, colors, f), 10, 10, 80);
  } else inner = markInner({ ...c, frame: c.frame === "none" || !c.frame ? "square" : c.frame }, colors);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${inner}</svg>`;
}

// ---------- concepts (local / fallback) ----------
function iconsForBrief(brief) {
  const names = iconNames();
  const themes = INDUSTRY_THEME[brief.industry] || INDUSTRY_THEME.Other;
  const words = `${brief.what || ""} ${brief.name || ""}`.toLowerCase().match(/[a-z]+/g) || [];
  const hits = [];
  for (const w of words) {
    (KEYWORDS[w] || []).forEach((n) => names.includes(n) && hits.push(n));
    if (w.length > 3) names.filter((n) => n.split("-").includes(w)).forEach((n) => hits.push(n));
  }
  const themed = names.filter((n) => iconTags(n).some((t) => themes.includes(t)));
  return [...new Set([...shuffle(hits), ...shuffle(themed), ...shuffle(names)])];
}
export function palettesFor(brief) {
  if (brief.colours && brief.colours.length) {
    const [a, b] = brief.colours;
    const text = luminance(a) < 0.2 ? a : "#1A1A1A";
    const base = { vibe: "Custom", name: "Yours", colors: [a, text, b || "#EF7B43"] };
    return [base, { ...base, colors: [b || a, text, a] }, ...shuffle(PALETTES.filter((p) => brief.vibes?.includes(p.vibe)))];
  }
  const vibes = brief.vibes && brief.vibes.length ? brief.vibes : [pick(VIBES)];
  return [...shuffle(PALETTES.filter((p) => vibes.includes(p.vibe))), ...shuffle(PALETTES)];
}
function fontsFor(brief) {
  const vibes = brief.vibes && brief.vibes.length ? brief.vibes : VIBES;
  return [...new Set([...shuffle(vibes.flatMap((v) => FONT_BY_VIBE[v] || [])), ...shuffle(FONTS)])];
}

export function baseConcept(brief, partial) {
  return {
    id: uid(), brand: brief.name, tagline: brief.tagline || "", kind: "template", icon: "circle", markSvg: "",
    markIdea: "", gen: null, font: "Inter", weight: 700, tracking: 0, textCase: "asis", textStyle: "plain",
    showTagline: !!brief.tagline, palette: ["#1A1A1A", "#1A1A1A", "#EF7B43"], layout: "icon-left", frame: "none",
    markScale: 1, markX: 0, markY: 0, strokeWidth: 2, texture: "none", textureStrength: 0.6, name: "Concept", reason: "", note: "",
    vibe: (brief.vibes && brief.vibes[0]) || "", ...partial,
  };
}

// ---------- variety ----------
const FONT_CLASS = {
  "DM Serif Display": "serif", "Playfair Display": "serif", Fraunces: "serif", Pacifico: "script",
  "Archivo Black": "display", Syne: "display", "Bricolage Grotesque": "display",
  Inter: "sans", Manrope: "sans", "Space Grotesk": "sans", Outfit: "sans", Sora: "sans",
};
const SINGLE_WEIGHT = ["Pacifico", "DM Serif Display", "Archivo Black"];
function hueTemp(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d < 0.12) return "neutral";
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return h < 75 || h >= 300 ? "warm" : h >= 150 && h < 290 ? "cool" : "green";
}
const layoutFamily = (l) => (l.startsWith("badge") ? "badge" : l);
export function markType(c) {
  if (c.kind === "custom") return "ai";
  if (c.kind === "generated") return c.gen?.type || "generated";
  if (c.layout === "wordmark" || c.layout === "monogram") return c.layout;
  return "icon";
}
function features(c) {
  return { mark: markType(c), layout: layoutFamily(c.layout), font: FONT_CLASS[c.font] || "sans", temp: hueTemp(c.palette[0]), style: c.textStyle || "plain" };
}
const W = { mark: 3, layout: 2, font: 2, temp: 1, style: 1 };
function distance(a, b) {
  const fa = features(a), fb = features(b);
  return Object.keys(W).reduce((d, k) => d + (fa[k] === fb[k] ? 0 : W[k]), 0);
}
/** Greedy pick: each next concept is the one most different from those already chosen. */
function pickDiverse(pool, n, chosen = []) {
  const out = chosen.slice();
  const rest = pool.slice();
  while (out.length < n && rest.length) {
    let best = 0, bestScore = -1;
    rest.forEach((c, i) => {
      // hard limits: each generator at most once, each layout family at most twice
      const f = features(c);
      if (c.kind === "generated" && out.some((o) => features(o).mark === f.mark)) return;
      if (out.filter((o) => features(o).layout === f.layout).length >= 2) return;
      const score = out.length ? Math.min(...out.map((o) => distance(o, c))) + Math.random() * 0.5 : Math.random();
      if (score > bestScore) { bestScore = score; best = i; }
    });
    if (bestScore < 0) best = 0; // nothing passes the limits — take the next one anyway
    out.push(rest.splice(best, 1)[0]);
  }
  return out;
}
function fixFont(c) {
  if (SINGLE_WEIGHT.includes(c.font)) c.weight = 400;
  if (c.font === "Pacifico") { c.textCase = "asis"; if (c.textStyle === "mixed") c.textStyle = "twotone"; }
  return c;
}
function gensFor(brief) {
  const vibes = brief.vibes && brief.vibes.length ? brief.vibes : VIBES;
  return [...new Set([...shuffle(vibes.flatMap((v) => GEN_BY_VIBE[v] || [])), ...shuffle(GENERATORS.map((g) => g.id))])];
}
const LAYOUT_IDS = ["icon-left", "icon-top", "badge-circle", "badge-rounded", "emblem", "wordmark", "monogram"];

/** One random template/generated concept for the brief. */
function randomConcept(brief, ctx, i) {
  const vibe = (brief.vibes && brief.vibes[0]) || pick(VIBES);
  const isGen = i % 5 === 1 || i % 5 === 3 || Math.random() < 0.15;
  const gen = isGen ? { type: ctx.gens[Math.floor(Math.random() * ctx.gens.length)], seed: Math.floor(Math.random() * 1e6) } : null;
  const icon = ctx.icons[i % ctx.icons.length];
  let layout = pick(LAYOUT_IDS);
  if (isGen && (layout === "wordmark" || layout === "monogram")) layout = pick(["icon-left", "icon-top", "emblem"]);
  const words = (brief.name || "").trim().split(/\s+/).length;
  const genInfo = gen && GENERATORS.find((g) => g.id === gen.type);
  const noun = genInfo ? genInfo.noun : titleCase(icon.split("-")[0]);
  return fixFont(baseConcept(brief, {
    kind: isGen ? "generated" : "template",
    gen,
    icon,
    font: ctx.fonts[(i * 3 + Math.floor(Math.random() * 3)) % ctx.fonts.length],
    palette: ctx.pals[i % ctx.pals.length].colors.slice(),
    layout,
    frame: pick(["none", "none", "circle", "square", "accent"]),
    textCase: pick(["asis", "asis", "upper", "lower"]),
    textStyle: pick(words > 1 ? ["plain", "twotone", "mixed", "stacked"] : ["plain", "plain", "twotone"]),
    tracking: pick([0, 0, 2, 6, -2]),
    name: `${pick(ADJ[vibe] || ADJ.Minimal)} ${noun}`,
    reason: genInfo ? genInfo.reason : `A ${noun.toLowerCase()} mark for ${brief.what ? brief.what.slice(0, 50) : brief.name}.`,
  }));
}

/** Variations of one concept, each changing one thing (colour, layout + name style, font + mark). */
function variationsOf(brief, base, n, ctx) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const c = { ...JSON.parse(JSON.stringify(base)), id: uid(), note: "" };
    const step = i % 3;
    if (step === 0) {
      c.palette = (ctx.pals.find((p) => p.colors.join() !== base.palette.join()) || ctx.pals[0]).colors.slice();
      c.name = base.name + " · new colours";
    } else if (step === 1) {
      c.layout = pick(LAYOUT_IDS.filter((l) => l !== base.layout && !(base.kind !== "template" && (l === "wordmark" || l === "monogram"))));
      c.textStyle = pick(TEXT_STYLES.map((t) => t.id).filter((t) => t !== base.textStyle));
      c.name = base.name + " · new layout";
    } else {
      c.font = pick(FONTS.filter((f) => FONT_CLASS[f] !== FONT_CLASS[base.font]));
      if (c.kind === "generated") c.gen = { ...c.gen, seed: Math.floor(Math.random() * 1e6) };
      else if (c.kind === "template") c.icon = pick(ctx.icons.slice(0, 12).filter((x) => x !== base.icon)) || c.icon;
      c.name = base.name + " · new type";
    }
    c.palette = c.palette.slice();
    out.push(fixFont(c));
  }
  return out;
}

/** n template concepts made fully in the browser, picked to be as different as possible. */
export function localConcepts(brief, n = 6, base = null) {
  const ctx = { icons: iconsForBrief(brief), pals: palettesFor(brief), fonts: fontsFor(brief), gens: gensFor(brief) };
  if (base) return variationsOf(brief, base, n, ctx);
  const pool = Array.from({ length: n * 6 }, (_, i) => randomConcept(brief, ctx, i));
  return pickDiverse(pool, n);
}

/**
 * Make an AI-planned set varied: when two concepts look alike, change the later one's layout,
 * font style or name style; make sure at least one generated mark is in a set with templates.
 */
export function diversify(brief, concepts, { allowGenerated = true } = {}) {
  const ctx = { icons: iconsForBrief(brief), pals: palettesFor(brief), fonts: fontsFor(brief), gens: gensFor(brief) };
  const words = (brief.name || "").trim().split(/\s+/).length;
  const templates = concepts.filter((c) => c.kind === "template");
  if (allowGenerated && templates.length >= 3 && !concepts.some((c) => c.kind === "generated")) {
    const t = templates[templates.length - 1];
    const g = GENERATORS.find((x) => x.id === ctx.gens[0]);
    Object.assign(t, { kind: "generated", gen: { type: g.id, seed: Math.floor(Math.random() * 1e6) }, reason: g.reason });
    if (t.layout === "wordmark" || t.layout === "monogram") t.layout = "icon-left";
  }
  const done = [];
  for (const c of concepts) {
    for (let tries = 0; tries < 6 && done.some((o) => distance(o, c) < 4); tries++) {
      const twin = done.find((o) => distance(o, c) < 4);
      const fa = features(twin), fb = features(c);
      if (fa.layout === fb.layout) {
        const usedL = new Set(done.map((o) => layoutFamily(o.layout)));
        const opts = LAYOUT_IDS.filter((l) => !usedL.has(layoutFamily(l)) && !(c.kind !== "template" && (l === "wordmark" || l === "monogram")));
        if (opts.length) c.layout = pick(opts);
      } else if (fa.font === fb.font) {
        const usedF = new Set(done.map((o) => FONT_CLASS[o.font]));
        const f = ctx.fonts.find((x) => !usedF.has(FONT_CLASS[x])) || pick(FONTS);
        c.font = f; c.weight = 700; fixFont(c);
      } else if (fa.style === fb.style) {
        c.textStyle = pick(TEXT_STYLES.map((t) => t.id).filter((t) => t !== fa.style && (words > 1 || t !== "stacked")));
      } else {
        c.palette = pick(ctx.pals).colors.slice();
      }
    }
    done.push(c);
  }
  return concepts;
}

/** Normalise an AI plan concept into a renderable concept. */
export function fromPlan(brief, p) {
  const names = iconNames();
  const pal = (p.palette || []).filter(isHex);
  const fallbackPal = palettesFor(brief)[0].colors;
  const palette = [pal[0] || fallbackPal[0], pal[1] || fallbackPal[1], pal[2] || fallbackPal[2]];
  if (contrast(palette[1], "#FFFFFF") < 3) palette[1] = "#1A1A1A";
  const font = FONTS.includes(p.font) ? p.font : "Inter";
  const kind = p.kind === "custom" ? "custom" : p.kind === "generated" ? "generated" : "template";
  const genId = GENERATORS.some((g) => g.id === p.generator) ? p.generator : gensFor(brief)[0];
  let layout = LAYOUTS.some((l) => l.id === p.layout) ? p.layout : "icon-left";
  if (kind !== "template" && (layout === "wordmark" || layout === "monogram")) layout = "icon-left";
  return fixFont(baseConcept(brief, {
    kind,
    gen: kind === "generated" ? { type: genId, seed: Math.floor(Math.random() * 1e6) } : null,
    icon: names.includes(p.icon) ? p.icon : iconsForBrief(brief)[0],
    markIdea: p.markIdea || "",
    font,
    weight: 700,
    textCase: pick(["asis", "asis", "upper"]),
    textStyle: TEXT_STYLES.some((t) => t.id === p.textStyle) ? p.textStyle : "plain",
    palette,
    layout,
    frame: kind === "template" ? pick(["none", "none", "circle", "square", "accent"]) : "none",
    name: p.name || "Concept",
    reason: p.reason || "",
  }));
}

// ---------- SVG check & clean ----------
const ALLOWED_EL = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "polygon", "polyline", "line"]);
const SHAPES = new Set(["path", "circle", "ellipse", "rect", "polygon", "polyline", "line"]);
const NUM = /^-?(\d+\.?\d*|\.\d+)(e-?\d+)?(px)?$/i;
const ATTR_RULES = {
  d: (v) => /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]*$/.test(v) && v.length < 6000,
  points: (v) => /^[0-9eE.,\s+-]*$/.test(v),
  fill: (v) => v === "none" || isHex(v),
  stroke: (v) => v === "none" || isHex(v),
  "stroke-linecap": (v) => /^(butt|round|square)$/.test(v),
  "stroke-linejoin": (v) => /^(miter|round|bevel)$/.test(v),
  transform: (v) => /^(\s*(translate|scale|rotate|matrix|skewX|skewY)\(\s*[-0-9eE.,\s]*\)\s*,?)+\s*$/.test(v),
};
for (const a of ["cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "x1", "y1", "x2", "y2", "stroke-width", "opacity"]) ATTR_RULES[a] = (v) => NUM.test(v);
const ALLOWED_ATTR = new Set(Object.keys(ATTR_RULES));

/**
 * Check & clean an AI-drawn SVG mark. Rebuilds a new SVG from scratch, keeping only allowed
 * elements/attributes. Returns { ok:true, inner } (content mapped to a 0..100 box) or { ok:false, reason }.
 */
export function cleanSvg(raw, { measure = true } = {}) {
  if (typeof raw !== "string" || !raw.trim()) return { ok: false, reason: "empty" };
  if (new Blob([raw]).size > 8192) return { ok: false, reason: "too_large" };
  let doc;
  try {
    doc = new DOMParser().parseFromString(raw, "image/svg+xml");
  } catch {
    return { ok: false, reason: "parse_error" };
  }
  if (doc.getElementsByTagName("parsererror").length) return { ok: false, reason: "parse_error" };
  const root = doc.documentElement;
  if (!root || root.localName !== "svg") return { ok: false, reason: "not_svg" };

  let count = 0, shapes = 0;
  const cleanAttrs = (el) => {
    const out = [];
    for (const a of Array.from(el.attributes)) {
      const n = a.name, v = a.value.trim();
      if (!ALLOWED_ATTR.has(n)) continue; // drops on*, style, class, href, xlink:href, id, filter, mask…
      if (/url\(|javascript:|expression|[<>"'`;]/i.test(v)) continue;
      if (!ATTR_RULES[n](v)) continue;
      out.push(`${n}="${v.replace(/px$/i, "")}"`);
    }
    return out;
  };
  const walk = (el) => {
    let s = "";
    for (const ch of Array.from(el.children)) {
      const tag = ch.localName;
      if (!ALLOWED_EL.has(tag) || tag === "svg") continue; // whole subtree dropped (script, style, text, image, foreignObject, defs…)
      count++;
      if (SHAPES.has(tag)) shapes++;
      const attrs = cleanAttrs(ch);
      const kids = tag === "g" ? walk(ch) : "";
      if (tag === "g" && !kids) continue;
      s += kids ? `<${tag}${attrs.length ? " " + attrs.join(" ") : ""}>${kids}</${tag}>` : `<${tag}${attrs.length ? " " + attrs.join(" ") : ""}/>`;
    }
    return s;
  };
  const body = walk(root);
  if (count > 40) return { ok: false, reason: "too_many_elements" };
  if (!shapes || !body) return { ok: false, reason: "empty" };

  // map the root viewBox onto 0..100
  let vb = (root.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
  if (vb.length !== 4 || vb.some((n) => !isFinite(n)) || vb[2] <= 0 || vb[3] <= 0) {
    const w = parseFloat(root.getAttribute("width")) || 100, h = parseFloat(root.getAttribute("height")) || 100;
    vb = [0, 0, w, h];
  }
  const rootAttrs = cleanAttrs(root).filter((a) => !/^(width|height|x|y|transform)=/.test(a));
  const k = 100 / Math.max(vb[2], vb[3]);
  const ox = (100 - vb[2] * k) / 2, oy = (100 - vb[3] * k) / 2;
  const needsMap = !(vb[0] === 0 && vb[1] === 0 && vb[2] === 100 && vb[3] === 100);
  const tf = needsMap ? ` transform="translate(${r2(ox - vb[0] * k)} ${r2(oy - vb[1] * k)}) scale(${r2(k * 1000) / 1000})"` : "";
  const inner = tf || rootAttrs.length ? `<g${tf}${rootAttrs.length ? " " + rootAttrs.join(" ") : ""}>${body}</g>` : body;

  if (measure && typeof document !== "undefined") {
    const box = measureBox(inner);
    if (box) {
      const area = box.width * box.height;
      if (box.width < 4 && box.height < 4) return { ok: false, reason: "empty" };
      const ix = Math.max(0, Math.min(100, box.x + box.width) - Math.max(0, box.x));
      const iy = Math.max(0, Math.min(100, box.y + box.height) - Math.max(0, box.y));
      if (area > 0 && (ix * iy) / area < 0.6) return { ok: false, reason: "off_canvas" };
    }
  }
  return { ok: true, inner, count };
}
function measureBox(inner) {
  try {
    const ns = "http://www.w3.org/2000/svg";
    const s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "0 0 100 100");
    s.setAttribute("width", "100"); s.setAttribute("height", "100");
    s.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden";
    const g = document.createElementNS(ns, "g");
    // inner was rebuilt from allowed parts only, so parsing it again is safe
    const frag = new DOMParser().parseFromString(`<svg xmlns="${ns}">${inner}</svg>`, "image/svg+xml").documentElement;
    Array.from(frag.childNodes).forEach((n) => g.appendChild(document.importNode(n, true)));
    s.appendChild(g);
    document.body.appendChild(s);
    const b = g.getBBox();
    s.remove();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  } catch {
    return null;
  }
}

// ---------- textures ----------
export const TEXTURES = [
  { id: "none", label: "None", note: "Clean, flat vector." },
  { id: "rough", label: "Rough edges", note: "Hand-cut, slightly wobbly outlines. Changes the vector itself, so it's part of your master SVG and works in any app." },
  { id: "gouache", label: "Gouache", note: "Flat paint with rough edges, soft streaks and paper grain." },
  { id: "watercolour", label: "Watercolour", note: "Bleeding edges, darker rims where the paint pools, uneven pigment." },
  { id: "riso", label: "Risograph", note: "Grainy print with a slightly misaligned second pass." },
  { id: "stamp", label: "Ink stamp", note: "Worn, speckled ink like a rubber stamp." },
];
export const isPaintTexture = (t) => ["gouache", "watercolour", "riso", "stamp"].includes(t);
const r4 = (n) => Math.round(n * 10000) / 10000;
/** Alpha mask from noise: mostly opaque, with holes where the noise is above t. */
const grain = (freq, seed, t, k, octaves = 2, name = "gA") =>
  `<feTurbulence type="fractalNoise" baseFrequency="${r4(freq / k)}" numOctaves="${octaves}" seed="${seed}" result="${name}n"/>` +
  `<feColorMatrix in="${name}n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -7 ${r2(7 * t + 1)}" result="${name}"/>`;

/** SVG filter for a paint texture. k scales the effect to the drawing size (1 ≈ a 700-unit logo). */
function textureFilter(type, strength, seed, k) {
  const s = Math.min(1, Math.max(0.1, strength));
  const F = (f) => r4(f / k), D = (d) => r2(d * k);
  let body = "";
  if (type === "gouache") {
    body =
      `<feTurbulence type="fractalNoise" baseFrequency="${F(0.035)}" numOctaves="3" seed="${seed}" result="n"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="n" scale="${D(3 + 5 * s)}" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
      `<feTurbulence type="fractalNoise" baseFrequency="${F(0.012)} ${F(0.09)}" numOctaves="2" seed="${seed + 1}" result="b"/>` +
      `<feColorMatrix in="b" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 ${r2(-1.6 * s)} ${r2(0.75 * s)}" result="hl"/>` +
      `<feComposite in="hl" in2="d" operator="in" result="hl2"/>` +
      `<feMerge result="paint"><feMergeNode in="d"/><feMergeNode in="hl2"/></feMerge>` +
      grain(0.9, seed + 2, 0.86 - 0.1 * s, k) +
      `<feComposite in="paint" in2="gA" operator="in"/>`;
  } else if (type === "watercolour") {
    body =
      `<feTurbulence type="fractalNoise" baseFrequency="${F(0.018)}" numOctaves="4" seed="${seed}" result="n"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="n" scale="${D(6 + 10 * s)}" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
      `<feGaussianBlur in="d" stdDeviation="${D(0.4 + 0.6 * s)}" result="soft"/>` +
      // uneven pigment: alpha follows a slow noise
      `<feTurbulence type="fractalNoise" baseFrequency="${F(0.03)}" numOctaves="3" seed="${seed + 1}" result="p"/>` +
      `<feColorMatrix in="p" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${r2(2.2 * s)} 0 0 0 ${r2(0.95 - 1.25 * s)}" result="pa"/>` +
      `<feColorMatrix in="soft" type="matrix" values="0.82 0 0 0 0.18  0 0.82 0 0 0.18  0 0 0.82 0 0.18  0 0 0 1 0" result="tint"/>` +
      `<feComposite in="tint" in2="pa" operator="in" result="wash"/>` +
      // darker rim where the paint pools at the edge
      `<feMorphology in="soft" operator="erode" radius="${D(1.2 + 1.4 * s)}" result="er"/>` +
      `<feComposite in="soft" in2="er" operator="out" result="edge"/>` +
      `<feColorMatrix in="edge" type="matrix" values="0.5 0 0 0 0  0 0.5 0 0 0  0 0 0.5 0 0  0 0 0 ${r2(0.55 + 0.35 * s)} 0" result="rim"/>` +
      `<feMerge result="wc"><feMergeNode in="wash"/><feMergeNode in="rim"/></feMerge>` +
      grain(0.6, seed + 2, 0.84, k) +
      `<feComposite in="wc" in2="gA" operator="in"/>`;
  } else if (type === "riso") {
    body =
      grain(1.1, seed, 0.72 - 0.12 * s, k, 2) +
      `<feComposite in="SourceGraphic" in2="gA" operator="in" result="ink"/>` +
      `<feOffset in="ink" dx="${D(1.5 + 2.5 * s)}" dy="${D(-1 - 1.5 * s)}" result="off"/>` +
      `<feColorMatrix in="off" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.4 0" result="ghost"/>` +
      `<feMerge><feMergeNode in="ghost"/><feMergeNode in="ink"/></feMerge>`;
  } else if (type === "stamp") {
    body =
      `<feTurbulence type="fractalNoise" baseFrequency="${F(0.06)}" numOctaves="2" seed="${seed}" result="n"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="n" scale="${D(2 + 2.5 * s)}" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
      grain(0.3, seed + 1, 0.7 - 0.12 * s, k, 3, "gB") +
      `<feComposite in="d" in2="gB" operator="in" result="worn"/>` +
      grain(1.3, seed + 2, 0.74 - 0.08 * s, k, 1) +
      `<feComposite in="worn" in2="gA" operator="in"/>`;
  }
  return `<filter id="mc-tx" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">${body}</filter>`;
}

/** Wrap any Markcraft SVG in a paint texture. Returns the SVG unchanged for none / rough. */
export function applyTexture(svg, c) {
  if (!isPaintTexture(c.texture)) return svg;
  const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1]?.split(/\s+/).map(Number) || [0, 0, 700, 700];
  const k = Math.max(vb[2], vb[3]) / 700;
  const seed = hashStr(`${c.brand}|${c.texture}`) % 997;
  const open = `<defs>${textureFilter(c.texture, c.textureStrength ?? 0.6, seed, k)}</defs><g filter="url(#mc-tx)">`;
  const i = svg.indexOf("</title>");
  const at = i >= 0 ? i + 8 : svg.indexOf(">") + 1;
  return svg.slice(0, at) + open + svg.slice(at, svg.lastIndexOf("</svg>")) + "</g></svg>";
}

/** Split path data into absolute subpaths. */
function absoluteSubpaths(d) {
  const toks = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [];
  const N = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
  const subs = [];
  let cur = null, cx = 0, cy = 0, sx = 0, sy = 0, i = 0, cmd = "";
  while (i < toks.length) {
    if (/^[a-z]$/i.test(toks[i])) cmd = toks[i++];
    const C = cmd.toUpperCase(), rel = cmd !== C, n = N[C];
    if (C === "Z") { if (cur) { cur.d += "Z"; cur.closed = true; } cx = sx; cy = sy; cmd = ""; continue; }
    if (!n || i + n > toks.length) break;
    const a = toks.slice(i, i + n).map(Number);
    i += n;
    const X = (v) => (rel ? v + cx : v), Y = (v) => (rel ? v + cy : v);
    if (C === "M") {
      cx = X(a[0]); cy = Y(a[1]); sx = cx; sy = cy;
      cur = { d: `M${cx} ${cy}`, closed: false };
      subs.push(cur);
      cmd = rel ? "l" : "L";
      continue;
    }
    if (!cur) { cur = { d: `M${cx} ${cy}`, closed: false }; subs.push(cur); }
    if (C === "L" || C === "T") { const x = X(a[0]), y = Y(a[1]); cur.d += `${C}${x} ${y}`; cx = x; cy = y; }
    else if (C === "H") { cx = rel ? cx + a[0] : a[0]; cur.d += `L${cx} ${cy}`; }
    else if (C === "V") { cy = rel ? cy + a[0] : a[0]; cur.d += `L${cx} ${cy}`; }
    else if (C === "C") { cur.d += `C${X(a[0])} ${Y(a[1])} ${X(a[2])} ${Y(a[3])} ${X(a[4])} ${Y(a[5])}`; cx = X(a[4]); cy = Y(a[5]); }
    else if (C === "S" || C === "Q") { cur.d += `${C}${X(a[0])} ${Y(a[1])} ${X(a[2])} ${Y(a[3])}`; const nx = X(a[2]), ny = Y(a[3]); cx = nx; cy = ny; }
    else if (C === "A") { const x = X(a[5]), y = Y(a[6]); cur.d += `A${a[0]} ${a[1]} ${a[2]} ${a[3]} ${a[4]} ${x} ${y}`; cx = x; cy = y; }
  }
  return subs;
}

/**
 * Rough edges: re-draws every outline as a slightly wobbly line, in real vector paths.
 * Deterministic for the same concept, so the master SVG keeps one fingerprint.
 */
export function roughen(svg, seedStr, strength = 0.6) {
  const ns = "http://www.w3.org/2000/svg";
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none";
  const live = document.importNode(new DOMParser().parseFromString(svg, "image/svg+xml").documentElement, true);
  host.appendChild(live);
  document.body.appendChild(host);
  try {
    const vb = (live.getAttribute("viewBox") || "0 0 100 100").split(/\s+/).map(Number);
    const rootK = (parseFloat(live.getAttribute("width")) || vb[2]) / vb[2];
    const R = rng(seedStr);
    const amp = 0.4 + 1.9 * Math.min(1, Math.max(0.1, strength)); // in logo units
    const GEOM = ["d", "cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "points", "x1", "y1", "x2", "y2"];
    for (const el of Array.from(live.querySelectorAll("path,circle,ellipse,rect,polygon,polyline,line"))) {
      const m = el.getCTM();
      const sc = (m ? Math.hypot(m.a, m.b) : 1) / rootK || 1;
      const tag = el.localName;
      const subs = tag === "path" ? absoluteSubpaths(el.getAttribute("d") || "") : [{ el, closed: !["line", "polyline"].includes(tag) }];
      let out = "";
      for (const sp of subs) {
        let g = sp.el;
        if (!g) { g = document.createElementNS(ns, "path"); g.setAttribute("d", sp.d); el.parentNode.appendChild(g); }
        let L = 0;
        try { L = g.getTotalLength(); } catch { L = 0; }
        if (L > 0) {
          const Lw = L * sc;
          const n = Math.min(700, Math.max(sp.closed ? 10 : 3, Math.ceil(Lw / 2.2)));
          const pts = [];
          const cnt = sp.closed ? n : n + 1;
          for (let i = 0; i < cnt; i++) { const p = g.getPointAtLength((L * i) / n); pts.push([p.x, p.y]); }
          // long gentle waves + a little finer wobble; small shapes (tagline letters) wobble less
          const cyc1 = Math.max(1, Math.round(Lw / (30 + R() * 20))), cyc2 = Math.max(2, Math.round(Lw / (11 + R() * 5)));
          const ph1 = R() * 6.28, ph2 = R() * 6.28, a = Math.min(amp, 0.3 + Lw / 110) / sc;
          const moved = pts.map((p, i) => {
            const prev = pts[(i - 1 + pts.length) % pts.length], next = pts[(i + 1) % pts.length];
            const a0 = sp.closed || i > 0 ? prev : p, b0 = sp.closed || i < pts.length - 1 ? next : p;
            let tx = b0[0] - a0[0], ty = b0[1] - a0[1];
            const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
            const u = i / n;
            const off = a * (0.75 * Math.sin(6.2832 * cyc1 * u + ph1) + 0.25 * Math.sin(6.2832 * cyc2 * u + ph2)) * (sp.closed ? 1 : Math.min(1, i, pts.length - 1 - i));
            return [p[0] - ty * off, p[1] + tx * off];
          });
          out += "M" + moved.map((p) => `${r2(p[0])} ${r2(p[1])}`).join("L") + (sp.closed ? "Z" : "");
        }
        if (!sp.el) g.remove();
      }
      if (!out) continue;
      const np = document.createElementNS(ns, "path");
      for (const at of Array.from(el.attributes)) if (!GEOM.includes(at.name)) np.setAttribute(at.name, at.value);
      np.setAttribute("d", out);
      el.replaceWith(np);
    }
    return new XMLSerializer().serializeToString(live);
  } finally {
    host.remove();
  }
}

// ---------- fingerprint ----------
export const normaliseSvg = (s) => String(s).replace(/^﻿/, "").replace(/\r\n?/g, "\n").trim();
export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normaliseSvg(text)));
  return "0x" + Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- exports ----------
export function svgToPng(svg, width, height = null, bg = null) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    img.onload = () => {
      const ratio = img.naturalHeight / img.naturalWidth || 1;
      const w = width, h = height || Math.round(width * ratio);
      const cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      const ctx = cv.getContext("2d");
      if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
      const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      URL.revokeObjectURL(url);
      cv.toBlob((b) => (b ? resolve(b) : reject(new Error("png failed"))), "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image load failed")); };
    img.src = url;
  });
}
export function download(name, data, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
export const slug = (s) => String(s || "logo").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "logo";

export function coloursTxt(c) {
  const labels = ["Mark / primary", "Text", "Accent"];
  return (
    `${c.brand} — brand colours\n\n` +
    c.palette.map((h, i) => `${labels[i].padEnd(16)} ${h.toUpperCase()}   RGB ${hexToRgb(h).join(", ")}`).join("\n") +
    `\n\nFont: ${c.font} (${c.weight})\n${FONT_LINKS[c.font]}\nLicence: SIL Open Font License 1.1\n` +
    `\nMade with Markcraft. Check trademarks before using a logo commercially.\n`
  );
}

async function brandSheet(c, svg, darkSvg, markSvg) {
  const W = 1600, H = 1000;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d");
  const load = (s) => new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i); i.onerror = rej;
    i.src = URL.createObjectURL(new Blob([s], { type: "image/svg+xml" }));
  });
  x.fillStyle = "#F8F7F5"; x.fillRect(0, 0, W, H);
  x.fillStyle = "#1A1A1A"; x.font = "600 22px 'IBM Plex Mono', monospace";
  x.fillText("BRAND SHEET", 64, 80);
  x.font = "400 54px Newsreader, Georgia, serif";
  x.fillText(c.brand, 64, 140);
  x.fillStyle = "#FFFFFF"; x.fillRect(64, 190, 900, 460);
  x.fillStyle = "#1A1A1A"; x.fillRect(1000, 190, 536, 220);
  x.fillStyle = "#FFFFFF"; x.fillRect(1000, 430, 536, 220);
  const [a, b, m] = await Promise.all([load(svg), load(darkSvg), load(markSvg)]);
  const fit = (img, bx, by, bw, bh) => {
    const s = Math.min(bw / img.naturalWidth, bh / img.naturalHeight);
    x.drawImage(img, bx + (bw - img.naturalWidth * s) / 2, by + (bh - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
  };
  fit(a, 124, 250, 780, 340);
  fit(b, 1040, 220, 456, 160);
  fit(m, 1208, 460, 120, 160);
  c.palette.forEach((h, i) => {
    const bx = 64 + i * 310;
    x.fillStyle = h; x.fillRect(bx, 700, 290, 150);
    x.fillStyle = "#1A1A1A"; x.font = "500 22px 'IBM Plex Mono', monospace";
    x.fillText(h.toUpperCase(), bx, 885);
    x.fillStyle = "#777777"; x.fillText("RGB " + hexToRgb(h).join(" "), bx, 915);
  });
  x.fillStyle = "#1A1A1A"; x.font = "500 22px 'IBM Plex Mono', monospace";
  x.fillText("TYPEFACE", 1000, 720);
  x.font = "400 40px Newsreader, Georgia, serif";
  x.fillText(c.font, 1000, 770);
  x.fillStyle = "#777777"; x.font = "400 20px 'IBM Plex Sans', sans-serif";
  x.fillText("SIL Open Font License · " + FONT_LINKS[c.font].replace("https://", ""), 1000, 810);
  x.fillText("Made with Markcraft · check trademarks before commercial use", 1000, 915);
  [a, b, m].forEach((i) => URL.revokeObjectURL(i.src));
  return new Promise((res) => cv.toBlob(res, "image/png"));
}

/** Builds every export file. svg is the exact file that gets fingerprinted/claimed. */
export async function buildExports(c) {
  const main = await renderLogo(c);
  const dark = await renderLogo(c, { dark: true });
  const mark = await renderMarkSquare(c);
  const paint = isPaintTexture(c.texture);
  return {
    svg: main.svg, darkSvg: dark.svg, markSvg: mark, fallbackFont: main.fallbackFont,
    // paint textures are extra versions; the clean (or rough-edged) svg stays the master
    texturedSvg: paint ? applyTexture(main.svg, c) : null,
    texturedDarkSvg: paint ? applyTexture(dark.svg, c) : null,
    texturedMarkSvg: paint ? applyTexture(mark, c) : null,
  };
}
export async function brandKitZip(c) {
  const { svg, darkSvg, markSvg, texturedSvg, texturedDarkSvg } = await buildExports(c);
  const s = slug(c.brand);
  const zip = new JSZip();
  zip.file(`${s}-logo.svg`, svg);
  zip.file(`${s}-logo-dark.svg`, darkSvg);
  zip.file(`${s}-mark.svg`, markSvg);
  for (const w of [512, 1024, 2048]) zip.file(`png/${s}-logo-${w}.png`, await svgToPng(svg, w));
  zip.file(`png/${s}-logo-dark-1024.png`, await svgToPng(darkSvg, 1024));
  zip.file(`favicon/favicon-32.png`, await svgToPng(markSvg, 32, 32));
  zip.file(`favicon/apple-touch-icon-180.png`, await svgToPng(markSvg, 180, 180, "#FFFFFF"));
  if (texturedSvg) {
    const t = c.texture;
    zip.file(`textured/${s}-logo-${t}.svg`, texturedSvg);
    zip.file(`textured/${s}-logo-${t}-2048.png`, await svgToPng(texturedSvg, 2048));
    zip.file(`textured/${s}-logo-${t}-dark-2048.png`, await svgToPng(texturedDarkSvg, 2048));
  }
  zip.file("colours.txt", coloursTxt(c));
  zip.file("brand-sheet.png", await brandSheet(c, svg, darkSvg, markSvg));
  zip.file(
    "README.txt",
    `${c.brand} brand kit — made with Markcraft\n\n` +
      `${s}-logo.svg is the master file. Its SHA-256 fingerprint is what you can claim on BOT Chain;\n` +
      `any edit (even one colour) creates a new fingerprint.\n\n` +
      (isPaintTexture(c.texture) ? `textured/ has the ${c.texture} version as PNG (print, social) and SVG (web). Some design apps ignore SVG filters — use the PNG there.\n\n` : "") +
      `Icons: Lucide (ISC). Fonts: Google Fonts (SIL OFL 1.1).\nCheck trademarks before using a logo commercially.\n`
  );
  return zip.generateAsync({ type: "blob" });
}

/** Dominant colours from an image file (for "Upload colours"). */
export function coloursFromImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = 64; cv.height = 64;
      const x = cv.getContext("2d");
      x.drawImage(img, 0, 0, 64, 64);
      const d = x.getImageData(0, 0, 64, 64).data;
      const buckets = new Map();
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 128) continue;
        const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        if (max - min < 28 && (max > 225 || max < 35)) continue; // skip near white/black greys
        const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
        const e = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0, sat: max - min };
        e.n++; e.r += r; e.g += g; e.b += b;
        buckets.set(key, e);
      }
      const top = [...buckets.values()].sort((a, b) => b.n * (1 + b.sat / 255) - a.n * (1 + a.sat / 255));
      const hex = (e) => "#" + [e.r, e.g, e.b].map((v) => Math.round(v / e.n).toString(16).padStart(2, "0")).join("").toUpperCase();
      const out = [];
      for (const e of top) {
        const h = hex(e);
        if (!out.length || contrast(out[0], h) > 1.6) out.push(h);
        if (out.length === 2) break;
      }
      URL.revokeObjectURL(img.src);
      out.length ? resolve(out) : reject(new Error("no colours"));
    };
    img.onerror = () => reject(new Error("bad image"));
    img.src = URL.createObjectURL(file);
  });
}
