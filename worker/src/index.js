// Markcraft Worker — /logo/plan, /logo/mark, /upload
// Secrets: ANTHROPIC_API_KEY, PINATA_JWT. Vars: ALLOWED_ORIGINS (comma list). KV binding: RATE (optional).
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { ICON_NAMES } from "./icons.js";
import { isBlockedBrand } from "./blocklist.js";

const MODEL = "claude-opus-5-5";
const FONTS = [
  "Inter", "Manrope", "Space Grotesk", "DM Serif Display", "Playfair Display", "Fraunces",
  "Syne", "Outfit", "Sora", "Bricolage Grotesque", "Pacifico", "Archivo Black",
];
const LAYOUTS = ["icon-left", "icon-top", "badge-circle", "badge-rounded", "emblem", "wordmark", "monogram"];
const GENERATORS = ["radial", "bauhaus", "monocut", "dotgrid", "stripes"];
const TEXT_STYLES = ["plain", "twotone", "mixed", "stacked"];
const INDUSTRIES = ["Food & drink", "Tech", "Beauty", "Fashion", "Education", "Health", "Finance", "Creative", "Community", "Other"];
const VIBES = ["Minimal", "Playful", "Luxury", "Techy", "Organic", "Bold", "Retro"];
const LIMITS = { plan: 10, mark: 30, upload: 20 };
const HEX = /^#[0-9a-fA-F]{6}$/;

// ---------- helpers ----------
function cors(req, env) {
  const origin = req.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const ok = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : allowed[0] || "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
const json = (data, status, headers) =>
  new Response(JSON.stringify(data), { status, headers: { ...headers, "Content-Type": "application/json" } });

async function rateLimit(env, req, kind) {
  if (!env.RATE) return true; // no KV bound → no limit (dev)
  const ip = req.headers.get("CF-Connecting-IP") || "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const key = `${kind}:${day}:${ip}`;
  const n = parseInt((await env.RATE.get(key)) || "0", 10);
  if (n >= LIMITS[kind]) return false;
  await env.RATE.put(key, String(n + 1), { expirationTtl: 60 * 60 * 26 });
  return true;
}

const clip = (s, n) => String(s ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

function readBrief(b) {
  const brief = {
    name: clip(b.name, 24),
    tagline: clip(b.tagline, 60),
    what: clip(b.what, 120),
    industry: INDUSTRIES.includes(b.industry) ? b.industry : "Other",
    vibes: (Array.isArray(b.vibes) ? b.vibes : []).filter((v) => VIBES.includes(v)).slice(0, 2),
    colours: (Array.isArray(b.colours) ? b.colours : []).filter((c) => HEX.test(c)).slice(0, 2),
  };
  if (!brief.name) throw new Error("Brand name is required");
  return brief;
}

// ---------- AI ----------
const PlanSchema = z.object({
  concepts: z.array(
    z.object({
      name: z.string(),
      reason: z.string(),
      kind: z.enum(["template", "generated", "custom"]),
      generator: z.string(),
      textStyle: z.string(),
      icon: z.string(),
      font: z.string(),
      palette: z.array(z.string()),
      layout: z.string(),
      markIdea: z.string(),
    })
  ),
});

const SPLIT = { both: [4, 2], templates: [6, 0], ai: [2, 4] };

function planPrompt(brief, count, seed, mode) {
  const [t, c] = SPLIT[mode] || SPLIT.both;
  return `You are a senior brand designer. Plan ${count} distinct logo concepts for this brief.

Brief:
- Brand name: ${brief.name}
- Tagline: ${brief.tagline || "(none)"}
- What they do: ${brief.what || "(not given)"}
- Industry: ${brief.industry}
- Vibe: ${brief.vibes.join(", ") || "designer's choice"}
- Preferred colours: ${brief.colours.join(", ") || "surprise me"}
${seed ? `- Direction: ${seed}` : ""}

Rules:
- ${count === 6 ? `Exactly ${t} concepts with kind "template" then ${c} with kind "custom".` : "Keep the same kind and core idea as the direction; vary colours, layout, font and mark."}
- Concepts that are not "custom" are either "template" (an icon from the list) or "generated" (a geometric mark drawn by code). Make at least 2 of them "generated" when there are 3 or more.
- "template" concepts: "icon" MUST be one name from the allowed icon list; set "markIdea" to "" and "generator" to "".
- "generated" concepts: "generator" MUST be one of: radial (repeating burst/flower/sun), bauhaus (geometric tiles), monocut (layered initials), dotgrid (first letter in dots), stripes (striped retro shape). Use different generators. Set "markIdea" to "" and "icon" to the closest allowed icon.
- "custom" concepts: "markIdea" describes one simple flat geometric mark (max ~12 shapes, no text, no gradients) in one sentence, naming a drawing style (single continuous line, negative space, overlapping translucent shapes, grid-based, or cut paper); set "icon" to the closest allowed icon anyway and "generator" to "".
- "textStyle" MUST be one of: plain, twotone (second word or first letter in the mark colour), mixed (first word bold, rest regular), stacked (two lines; only for names with 2+ words).
- Make the set varied: no two concepts should share the same layout, font style (serif / sans / script / display) AND text style.
- "font" MUST be one of: ${FONTS.join(", ")}.
- "layout" MUST be one of: ${LAYOUTS.join(", ")}. Vary layouts across concepts.
- "palette": exactly 3 hex colours like #1A1A1A — [primary mark colour, text colour, accent]. All must read well on white. If preferred colours were given, use them.
- "name": a 2–3 word evocative concept name. "reason": one short sentence (max 14 words) linking the idea to the brief.
- Never reference or imitate famous brands, existing logos, mascots or characters.
- Simple, readable, works at 16px.

Allowed icons: ${ICON_NAMES.join(", ")}`;
}

function markPrompt(idea, palette, brandName) {
  return `Draw one flat, geometric logo mark as SVG for the brand "${brandName}".
Idea: ${idea}

Rules:
- Output ONLY the SVG, starting with <svg and ending with </svg>. No markdown, no commentary.
- Root: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">.
- Use only these elements: g, path, circle, ellipse, rect, polygon, polyline, line.
- Use only these colours (hex fill/stroke): ${palette.join(", ")}. 2–3 colours total.
- Max 12 shapes. No text, no gradients, no filters, no masks, no clip paths, no images, no style or class attributes.
- Keep the mark centred inside 8..92 on both axes. Bold, simple, recognisable at 32px.
- Must be original — never copy an existing logo, brand, mascot or character.`;
}

async function aiPlan(env, brief, count, seed, mode) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    output_config: { effort: "low", format: zodOutputFormat(PlanSchema) },
    messages: [{ role: "user", content: planPrompt(brief, count, seed, mode) }],
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("plan_unavailable");
  const icons = new Set(ICON_NAMES);
  return res.parsed_output.concepts.slice(0, count).map((c) => ({
    name: clip(c.name, 40),
    reason: clip(c.reason, 120),
    kind: ["custom", "generated"].includes(c.kind) ? c.kind : "template",
    generator: GENERATORS.includes(c.generator) ? c.generator : "",
    textStyle: TEXT_STYLES.includes(c.textStyle) ? c.textStyle : "plain",
    icon: icons.has(c.icon) ? c.icon : ICON_NAMES[0],
    font: FONTS.includes(c.font) ? c.font : "Inter",
    palette: (c.palette || []).filter((h) => HEX.test(h)).slice(0, 3),
    layout: LAYOUTS.includes(c.layout) ? c.layout : "icon-left",
    markIdea: clip(c.markIdea, 200),
  }));
}

async function aiMark(env, idea, palette, brandName) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 6000,
    output_config: { effort: "low" },
    messages: [{ role: "user", content: markPrompt(idea, palette, brandName) }],
  });
  if (res.stop_reason === "refusal") throw new Error("mark_unavailable");
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const m = text.match(/<svg[\s\S]*?<\/svg>/i);
  if (!m) throw new Error("no_svg");
  if (m[0].length > 8192) throw new Error("svg_too_large");
  return m[0]; // the browser runs the full check & clean before use
}

// ---------- routes ----------
export default {
  async fetch(req, env) {
    const h = cors(req, env);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    const url = new URL(req.url);
    if (req.method !== "POST") return json({ error: "not_found" }, 404, h);

    try {
      if (url.pathname === "/logo/plan") {
        const body = await req.json().catch(() => ({}));
        const brief = readBrief(body.brief || {});
        if (isBlockedBrand(brief.name)) return json({ error: "blocked_brand" }, 400, h);
        if (!(await rateLimit(env, req, "plan"))) return json({ error: "rate_limited" }, 429, h);
        const count = body.count === 3 ? 3 : 6;
        const seed = clip(body.seed, 300);
        const mode = ["both", "templates", "ai"].includes(body.mode) ? body.mode : "both";
        const concepts = await aiPlan(env, brief, count, seed, mode);
        return json({ concepts }, 200, h);
      }

      if (url.pathname === "/logo/mark") {
        const body = await req.json().catch(() => ({}));
        const idea = clip(body.markIdea, 200);
        const name = clip(body.name, 24);
        const palette = (Array.isArray(body.palette) ? body.palette : []).filter((c) => HEX.test(c)).slice(0, 3);
        if (!idea || !palette.length) return json({ error: "bad_input" }, 400, h);
        if (isBlockedBrand(name)) return json({ error: "blocked_brand" }, 400, h);
        if (!(await rateLimit(env, req, "mark"))) return json({ error: "rate_limited" }, 429, h);
        const svg = await aiMark(env, idea, palette, name || "the brand");
        return json({ svg }, 200, h);
      }

      if (url.pathname === "/upload") {
        if (!env.PINATA_JWT) return json({ error: "upload_disabled" }, 503, h);
        if (!(await rateLimit(env, req, "upload"))) return json({ error: "rate_limited" }, 429, h);
        const body = await req.json().catch(() => ({}));
        const svg = String(body.svg || "");
        if (!svg.startsWith("<svg") || svg.length > 64 * 1024) return json({ error: "bad_svg" }, 400, h);
        const form = new FormData();
        form.append("file", new Blob([svg], { type: "image/svg+xml" }), `${clip(body.name, 24) || "logo"}.svg`);
        form.append("network", "public");
        const r = await fetch("https://uploads.pinata.cloud/v3/files", {
          method: "POST",
          headers: { Authorization: `Bearer ${env.PINATA_JWT}` },
          body: form,
        });
        if (!r.ok) return json({ error: "upload_failed" }, 502, h);
        const out = await r.json();
        return json({ cid: out?.data?.cid }, 200, h);
      }

      return json({ error: "not_found" }, 404, h);
    } catch (e) {
      const msg = String(e?.message || e);
      if (msg === "Brand name is required") return json({ error: "bad_input", message: msg }, 400, h);
      if (e instanceof Anthropic.RateLimitError) return json({ error: "ai_busy" }, 503, h);
      if (e instanceof Anthropic.APIError) return json({ error: "ai_error" }, 502, h);
      return json({ error: "ai_error", message: msg.slice(0, 120) }, 502, h);
    }
  },
};
