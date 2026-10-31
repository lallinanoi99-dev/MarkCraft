// Markcraft app — router, brief, concepts, editor, exports, wallet, claim, verify, gallery.
import { CONFIG, NET, CONTRACT, IS_DEPLOYED, ABI } from "./config.js";
import * as E from "./engine.js";
import { isBlockedBrand } from "./blocklist.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = E.esc;
const svgUrl = (s) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
const short = (a) => (a ? a.slice(0, 6) + "…" + a.slice(-4) : "");
// ethers v6 results are arrays, so `claim.at` would hit Array.prototype.at — read the timestamp by position.
const claimTime = (cl) => cl[5];
const fmtDate = (sec) => new Date(Number(sec) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const clone = (o) => JSON.parse(JSON.stringify(o));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SITE = location.origin + location.pathname;

const store = {
  get(k, d) { try { const v = localStorage.getItem("mc_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("mc_" + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
let toastT;
function toast(msg, ms = 2600) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("show"), ms);
}

const state = {
  brief: store.get("brief", { name: "", tagline: "", what: "", industry: "Other", vibes: [], colours: [], surprise: true }),
  mode: "both",
  concepts: [],
  more: [],
  current: null,
  original: null,
  history: [],
  future: [],
  wallet: { address: null, chainOk: false },
  galleryCid: null,
  claimBusy: false,
};

// =====================================================================
// Router
// =====================================================================
const VIEWS = ["home", "create", "edit", "verify", "mine"];
function parseHash() {
  const h = location.hash.replace(/^#\/?/, "");
  const [path, q = ""] = h.split("?");
  const [view, section] = path.split("/");
  return { view: VIEWS.includes(view) ? view : "home", section, params: new URLSearchParams(q) };
}
function route() {
  const { view, section, params } = parseHash();
  $$(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
  $("#nav").classList.remove("open");
  if (view === "home") {
    if (section) setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" }), 30);
    else window.scrollTo(0, 0);
  } else window.scrollTo(0, 0);
  if (view === "create") initCreate(params);
  if (view === "edit") initEdit();
  if (view === "verify") initVerify(params);
  if (view === "mine") initMine();
}
window.addEventListener("hashchange", route);

// =====================================================================
// Worker API
// =====================================================================
async function api(path, body, timeout = 90000) {
  if (!CONFIG.WORKER_URL || CONFIG.WORKER_URL.includes("YOUR_")) {
    const e = new Error("no_worker"); e.code = "no_worker"; throw e;
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(CONFIG.WORKER_URL + path, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.error || "http_" + r.status); e.code = j.error || "http_" + r.status; throw e; }
    return j;
  } finally { clearTimeout(t); }
}

// =====================================================================
// Brief form (hero card + create page)
// =====================================================================
const EXAMPLES = {
  "Candle shop": { name: "Slow Mornings", tagline: "Hand-poured candles", what: "handmade candles for slow mornings", industry: "Beauty", vibes: ["Organic", "Minimal"] },
  "Pet store": { name: "Pawsome Pantry", tagline: "Treats for good dogs", what: "natural treats and toys for dogs and cats", industry: "Food & drink", vibes: ["Playful"] },
  "Tech startup": { name: "Northwind Labs", tagline: "Data you can trust", what: "AI tools that clean messy spreadsheets", industry: "Tech", vibes: ["Techy", "Bold"] },
};

function briefFormHTML(variant) {
  const b = state.brief;
  const hero = variant === "hero";
  return `
  ${hero ? `<div class="tabs" role="tablist">
    <button type="button" class="tab" data-mode="templates" aria-selected="${state.mode === "templates"}">Templates</button>
    <button type="button" class="tab" data-mode="ai" aria-selected="${state.mode === "ai"}">AI original <span class="new-tag green">NEW</span></button>
    <button type="button" class="tab" data-mode="both" aria-selected="${state.mode === "both"}">Both</button>
  </div>
  <div class="feature-chips"><span class="fchip"><i></i>Editable</span><span class="fchip"><i></i>Brand kit</span><span class="fchip"><i></i>Free daily credits</span></div>` :
  `<div class="lbl" style="margin-bottom:8px">Your brief</div>
   <div class="seg" style="margin-bottom:12px">${["templates", "ai", "both"].map((m) => `<button type="button" data-mode="${m}" aria-pressed="${state.mode === m}">${{ templates: "Templates", ai: "AI original", both: "Both" }[m]}</button>`).join("")}</div>`}
  <div class="input-area">
    <div class="field"><label for="${variant}-name">Brand name *</label>
      <input class="input big" id="${variant}-name" name="name" maxlength="24" required placeholder="e.g. Slow Mornings" value="${esc(b.name)}"></div>
    <div class="field"><label for="${variant}-what">What do you do?</label>
      <textarea class="input" id="${variant}-what" name="what" rows="2" maxlength="120" placeholder="handmade candles for slow mornings">${esc(b.what)}</textarea></div>
    <div class="row">
      <div class="field"><label for="${variant}-ind">Industry</label><select class="input" id="${variant}-ind" name="industry">${E.INDUSTRIES.map((i) => `<option ${i === b.industry ? "selected" : ""}>${i}</option>`).join("")}</select></div>
      <div class="field"><label for="${variant}-tag">Tagline (optional)</label><input class="input" id="${variant}-tag" name="tagline" maxlength="60" value="${esc(b.tagline)}"></div>
    </div>
    <div class="field"><span class="lbl">Vibe · pick up to 2</span><div class="vibes">${E.VIBES.map((v) => `<button type="button" class="vibe" data-vibe="${v}" aria-pressed="${b.vibes.includes(v)}">${v}</button>`).join("")}</div></div>
    <div class="field"><span class="lbl">Colours</span><div class="colour-row">
      <input type="color" class="swatch-in" data-col="0" value="${b.colours[0] || "#EF7B43"}" aria-label="Colour 1">
      <input type="color" class="swatch-in" data-col="1" value="${b.colours[1] || "#274F31"}" aria-label="Colour 2">
      <label class="row" style="gap:6px;font-size:14px"><input type="checkbox" data-surprise ${b.surprise ? "checked" : ""}> Surprise me</label>
    </div></div>
  </div>
  <div class="examples">Try an example: ${Object.keys(EXAMPLES).map((k) => `<button type="button" class="ex" data-ex="${k}">${k}</button>`).join("")}</div>
  <div class="form-msg"></div>
  <div class="tool-actions">
    <label class="btn btn-outline btn-sm" style="cursor:pointer">Upload colours<input type="file" accept="image/*" class="sr" data-upload></label>
    <div style="display:grid;justify-items:end;gap:4px">
      <button type="submit" class="btn btn-green" data-create>Create my logos <span class="chip-arrow"><svg><use href="#i-plane"/></svg></span></button>
      <span class="note">10 free generations per day</span>
    </div>
  </div>`;
}

function readForm(form) {
  const b = state.brief;
  b.name = form.name.value.trim().slice(0, 24);
  b.what = form.what.value.trim().slice(0, 120);
  b.tagline = form.tagline.value.trim().slice(0, 60);
  b.industry = form.industry.value;
  b.surprise = form.querySelector("[data-surprise]").checked;
  b.colours = b.surprise ? [] : $$("[data-col]", form).map((i) => i.value.toUpperCase());
  store.set("brief", b);
}
function validateForm(form) {
  const msg = form.querySelector(".form-msg");
  const btn = form.querySelector("[data-create]");
  const name = form.name.value.trim();
  if (name && isBlockedBrand(name)) {
    msg.innerHTML = `<div class="warn" style="margin-bottom:10px">Let's make something original — try your own brand name.</div>`;
    btn.disabled = true;
  } else {
    msg.innerHTML = "";
    btn.disabled = !name;
  }
}
function mountBriefForm(form) {
  const variant = form.dataset.form;
  form.innerHTML = briefFormHTML(variant);
  validateForm(form);
  form.oninput = (e) => {
    if (e.target.matches("[data-col]")) form.querySelector("[data-surprise]").checked = false;
    readForm(form);
    validateForm(form);
  };
  form.onclick = async (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.mode) { state.mode = t.dataset.mode; mountBriefForm(form); }
    if (t.dataset.vibe) {
      const v = t.dataset.vibe, vs = state.brief.vibes;
      if (vs.includes(v)) vs.splice(vs.indexOf(v), 1);
      else { vs.push(v); if (vs.length > 2) vs.shift(); }
      store.set("brief", state.brief);
      $$("[data-vibe]", form).forEach((b) => b.setAttribute("aria-pressed", vs.includes(b.dataset.vibe)));
    }
    if (t.dataset.ex) {
      Object.assign(state.brief, clone(EXAMPLES[t.dataset.ex]), { colours: [], surprise: true });
      store.set("brief", state.brief);
      mountBriefForm(form);
    }
  };
  form.querySelector("[data-upload]").onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const cols = await E.coloursFromImage(f);
      state.brief.colours = cols;
      state.brief.surprise = false;
      store.set("brief", state.brief);
      mountBriefForm(form);
      toast("Picked " + cols.join(" + ") + " from your image");
    } catch { toast("Couldn't read colours from that image"); }
  };
  form.onsubmit = (e) => {
    e.preventDefault();
    readForm(form);
    if (!state.brief.name || isBlockedBrand(state.brief.name)) return validateForm(form);
    state.pendingGenerate = true;
    if (location.hash.startsWith("#/create")) initCreate(new URLSearchParams());
    else location.hash = "#/create";
  };
}

// =====================================================================
// Concept grid
// =====================================================================
const SKETCH = `<svg class="sketch" viewBox="0 0 160 100" aria-hidden="true">
  <circle class="p1" cx="40" cy="50" r="22"/><path class="p2" d="M28 56q12-26 24-2"/>
  <line class="p3" x1="74" y1="44" x2="140" y2="44"/><line class="p4" x1="74" y1="58" x2="120" y2="58"/>
  <g class="pencil"><path d="M0 0l6-2 22-22 4 4-22 22Z" fill="#EF7B43"/><path d="M0 0l6-2-4-4Z" fill="#4A2308"/></g></svg>`;

function placeholderCard() {
  return `<div class="concept"><div class="stage">${SKETCH}<span class="loading-text">SKETCHING…</span></div>
    <div class="body"><b style="color:#ccc">———</b><p class="muted">Drawing ideas from your brief</p></div></div>`;
}
function isSaved(id) { return store.get("saved", []).some((s) => s.id === id); }

async function cardHTML(c) {
  const r = await E.renderLogo(c);
  return `<div class="concept ${isSaved(c.id) ? "saved" : ""}" data-id="${c.id}">
    <div class="stage"><span class="tag ${c.kind === "custom" ? "ai" : c.kind === "generated" ? "gen" : ""}">${c.kind === "custom" ? "AI ORIGINAL" : c.kind === "generated" ? "GENERATED" : "TEMPLATE"}</span>
      <img src="${svgUrl(r.svg)}" alt="${esc(c.brand)} logo concept: ${esc(c.name)}"></div>
    <div class="body"><b>${esc(c.name)}</b><p>${esc(c.reason)}</p>${c.note ? `<p class="note">${esc(c.note)}</p>` : ""}${r.fallbackFont ? `<p class="note">Font didn't load — showing Inter.</p>` : ""}</div>
    <div class="actions">
      <button class="btn btn-ghost save" type="button" data-act="save">${isSaved(c.id) ? "♥ Saved" : "♡ Save"}</button>
      <button class="btn btn-ghost" type="button" data-act="regen">↻ Regenerate</button>
      <button class="btn btn-ghost" type="button" data-act="more">More like this</button>
      <button class="btn btn-ghost edit" type="button" data-act="edit"><b>Edit →</b></button>
    </div></div>`;
}

async function resolveMark(c) {
  if (c.kind !== "custom") return c;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await api("/logo/mark", { markIdea: c.markIdea || c.name, palette: c.palette, name: c.brand });
      const cl = E.cleanSvg(r.svg);
      if (cl.ok) { c.markSvg = cl.inner; return c; }
    } catch (e) { if (e.code === "no_worker") break; }
  }
  // fall back to a code-generated mark (always valid) so the set stays varied
  c.kind = "generated";
  c.gen = { type: E.GENERATORS[Math.floor(Math.random() * E.GENERATORS.length)].id, seed: Math.floor(Math.random() * 1e6) };
  c.note = "Swapped in a template for this one";
  return c;
}

let genToken = 0;
async function generate() {
  const token = ++genToken;
  const box = $("#concepts"), status = $("#createStatus");
  $("#moreConcepts").innerHTML = "";
  state.more = [];
  box.innerHTML = Array.from({ length: 6 }, placeholderCard).join("");
  status.innerHTML = "";
  await E.loadIcons();
  let concepts, aiOk = true;
  try {
    const plan = await api("/logo/plan", { brief: state.brief, mode: state.mode, count: 6 });
    concepts = plan.concepts.map((p) => E.fromPlan(state.brief, p));
    if (concepts.length < 6) concepts.push(...E.localConcepts(state.brief, 6 - concepts.length));
    E.diversify(state.brief, concepts);
  } catch (e) {
    if (e.code === "blocked_brand") {
      box.innerHTML = "";
      status.innerHTML = `<div class="warn">Let's make something original — try your own brand name.</div>`;
      return;
    }
    aiOk = false;
    concepts = E.localConcepts(state.brief, 6);
    status.innerHTML = `<div class="ok">AI is resting — here are template ideas made from your brief.${e.code === "rate_limited" ? " (You've used today's free AI generations.)" : ""}</div>`;
  }
  if (token !== genToken) return;
  state.concepts = concepts;
  const ready = concepts.map((c) => (aiOk ? resolveMark(c) : Promise.resolve(c)));
  for (let i = 0; i < concepts.length; i++) {
    const c = await ready[i];
    if (token !== genToken) return;
    const html = await cardHTML(c);
    const slot = box.children[i];
    if (slot) slot.outerHTML = html;
    await sleep(140);
  }
  if (E.loadErrors.has("icons")) status.innerHTML += `<div class="warn">Icons failed to load — showing simple shapes.</div>`;
}

function findConcept(id) { return [...state.concepts, ...state.more].find((c) => c.id === id); }
async function replaceCard(c) {
  const el = document.querySelector(`.concept[data-id="${c.id}"]`);
  if (el) el.outerHTML = await cardHTML(c);
}

async function onCardAction(e) {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const card = btn.closest(".concept");
  const c = findConcept(card.dataset.id) || store.get("saved", []).find((s) => s.id === card.dataset.id);
  if (!c) return;
  const act = btn.dataset.act;
  if (act === "save") toggleSave(c, card, btn);
  if (act === "edit") openEditor(c);
  if (act === "regen") {
    card.querySelector(".stage").innerHTML = SKETCH;
    if (c.kind === "custom" || (c.markIdea && c.kind !== "generated")) {
      c.kind = "custom"; c.note = "";
      await resolveMark(c);
    } else if (c.kind === "generated") {
      const types = E.GENERATORS.map((g) => g.id);
      const type = Math.random() < 0.3 ? types[Math.floor(Math.random() * types.length)] : c.gen.type;
      c.gen = { type, seed: Math.floor(Math.random() * 1e6) };
      c.palette = E.palettesFor(state.brief)[Math.floor(Math.random() * 3)].colors.slice();
    } else {
      const n = E.localConcepts(state.brief, 1)[0];
      Object.assign(c, { icon: n.icon, kind: n.kind, gen: n.gen, palette: n.palette, layout: n.layout, frame: n.frame, font: n.font, weight: n.weight, textCase: n.textCase, textStyle: n.textStyle, tracking: n.tracking, name: n.name, reason: n.reason });
    }
    await replaceCard(c);
  }
  if (act === "more") moreLike(c);
  if (act === "del") {
    store.set("saved", store.get("saved", []).filter((s) => s.id !== c.id));
    initMine();
  }
}
function toggleSave(c, card, btn) {
  let saved = store.get("saved", []);
  if (saved.some((s) => s.id === c.id)) {
    saved = saved.filter((s) => s.id !== c.id);
    btn.textContent = "♡ Save"; card.classList.remove("saved");
  } else {
    saved.unshift({ ...clone(c), savedAt: Date.now() });
    btn.textContent = "♥ Saved"; card.classList.add("saved");
    toast("Saved to My logos (this browser)");
  }
  store.set("saved", saved.slice(0, 60));
}

async function moreLike(c) {
  const box = $("#moreConcepts");
  box.innerHTML = `<div class="more-row"><h3>More like “${esc(c.name)}”</h3></div>` + Array.from({ length: 3 }, placeholderCard).join("");
  box.scrollIntoView({ behavior: "smooth", block: "start" });
  let list;
  try {
    const seed = `Variations of "${c.name}" (${c.reason}). Same idea; kind=${c.kind}, icon=${c.icon}, generator=${c.gen?.type || "-"}, markIdea=${c.markIdea || "-"}. Each variation changes one thing: colours, layout + name style, or font.`;
    const plan = await api("/logo/plan", { brief: state.brief, mode: state.mode, count: 3, seed });
    list = plan.concepts.slice(0, 3).map((p) => E.fromPlan(state.brief, p));
    list = await Promise.all(list.map(resolveMark));
  } catch {
    list = E.localConcepts(state.brief, 3, c);
  }
  state.more = list;
  const cards = await Promise.all(list.map(cardHTML));
  box.innerHTML = `<div class="more-row"><h3>More like “${esc(c.name)}”</h3></div>` + cards.join("");
}

function initCreate(params) {
  const form = $('form[data-form="create"]');
  if (params?.get("vibe") && E.VIBES.includes(params.get("vibe"))) state.brief.vibes = [params.get("vibe")];
  mountBriefForm(form);
  if (state.pendingGenerate) {
    state.pendingGenerate = false;
    generate();
  } else if (state.concepts.length && !$("#concepts .concept[data-id]")) {
    Promise.all(state.concepts.map(cardHTML)).then((h) => ($("#concepts").innerHTML = h.join("")));
  }
}

// =====================================================================
// Editor
// =====================================================================
function openEditor(c) {
  state.current = clone(c);
  state.original = clone(c);
  state.history = [];
  state.future = [];
  store.set("current", state.current);
  location.hash = "#/edit";
}
function initEdit() {
  if (!state.current) {
    const saved = store.get("current", null);
    if (saved) { state.current = saved; state.original = clone(saved); }
  }
  const has = !!state.current;
  $("#editEmpty").classList.toggle("hidden", has);
  $("#editorGrid").classList.toggle("hidden", !has);
  if (!has) return;
  $("#editTitle").textContent = state.current.brand;
  $("#claimMsg").innerHTML = "";
  buildPanel();
  renderPreview();
}
function update(patch, { record = true, panel = false } = {}) {
  if (record) { state.history.push(clone(state.current)); if (state.history.length > 80) state.history.shift(); state.future = []; }
  Object.assign(state.current, patch);
  store.set("current", state.current);
  if (panel) buildPanel();
  schedulePreview();
}
let pvT;
function schedulePreview() { clearTimeout(pvT); pvT = setTimeout(renderPreview, 60); }

let previewToken = 0;
async function renderPreview() {
  const c = state.current;
  if (!c) return;
  const tok = ++previewToken;
  const ex = await E.buildExports(c);
  if (tok !== previewToken) return;
  state.exports = ex;
  $("#canvas").innerHTML = `<img src="${svgUrl(ex.texturedSvg || ex.svg)}" alt="${esc(c.brand)} logo">`;
  $("#dlTextured").classList.toggle("hidden", !ex.texturedSvg);
  $("#editTitle").textContent = c.brand;
  renderMockups(ex);
  const warns = [];
  if (E.contrast(c.palette[1], "#FFFFFF") < 3 && !["badge-circle", "badge-rounded", "monogram"].includes(c.layout)) warns.push("Text colour is hard to read on white — try a darker text colour.");
  if (E.contrast(c.palette[0], "#FFFFFF") < 1.6) warns.push("The mark colour is very light on white.");
  if (ex.fallbackFont) warns.push(`${c.font} didn't load — showing Inter instead.`);
  $("#editWarn").innerHTML = warns.map((w) => `<div class="warn" style="margin:10px 0">${esc(w)}</div>`).join("");
  const hash = await E.sha256Hex(ex.svg);
  if (tok !== previewToken) return;
  state.hash = hash;
  $("#hashLine").textContent = "Fingerprint (SHA-256 of the SVG): " + hash + " — any edit creates a new one.";
  $("#undoBtn").disabled = !state.history.length;
  $("#redoBtn").disabled = !state.future.length;
}

function renderMockups(ex) {
  // textured mockups where texture shines; the app icon stays clean
  const logo = svgUrl(ex.texturedSvg || ex.svg), dark = svgUrl(ex.texturedDarkSvg || ex.darkSvg);
  const mark = svgUrl(ex.texturedMarkSvg || ex.markSvg), cleanMark = svgUrl(ex.markSvg);
  const [cm] = state.current.palette;
  const items = [
    ["BUSINESS CARD", `<div style="position:absolute;inset:14% 12%;background:#fff;border-radius:6px;box-shadow:0 6px 16px rgba(0,0,0,.12);display:grid;place-items:center"><img src="${logo}" alt="" style="max-width:70%;max-height:45%"><div style="position:absolute;left:10%;bottom:12%;width:30%;height:3px;background:${cm};opacity:.6"></div></div>`, "#E9E4DC"],
    ["APP ICON", `<div style="width:34%;aspect-ratio:1;border-radius:22%;background:#fff;box-shadow:0 6px 16px rgba(0,0,0,.18);display:grid;place-items:center;overflow:hidden"><img src="${cleanMark}" alt="" style="max-width:100%;max-height:100%"></div>`, "linear-gradient(135deg,#B3D7F6,#ECC0FB)"],
    ["WEBSITE HEADER", `<div style="position:absolute;inset:16% 8% auto;height:22%;background:#fff;border-radius:6px;display:flex;align-items:center;justify-content:space-between;padding:0 6%;box-shadow:0 2px 6px rgba(0,0,0,.08)"><img src="${logo}" alt="" style="max-height:60%;max-width:40%"><span style="display:flex;gap:6px">${"<i style='width:16px;height:3px;background:#ccc;display:block'></i>".repeat(3)}</span></div><div style="position:absolute;left:8%;right:8%;top:48%;height:8%;background:#E8E4DD;border-radius:3px"></div><div style="position:absolute;left:8%;width:50%;top:62%;height:6%;background:#EEEAE3;border-radius:3px"></div>`, "#F8F7F5"],
    ["T-SHIRT", `<svg viewBox="0 0 100 80" style="position:absolute;inset:6% 18%;width:64%;height:88%"><path d="M30 6 18 10 4 26l12 10 6-6v46h56V30l6 6 12-10-14-16-12-4c-2 6-10 10-20 10S32 12 30 6Z" fill="#fff" stroke="#ddd"/></svg><img src="${logo}" alt="" style="position:relative;max-width:26%;max-height:20%;top:-6%">`, "#D9E4D2"],
    ["SOCIAL PROFILE", `<div style="width:40%;aspect-ratio:1;border-radius:50%;background:#fff;border:3px solid #fff;box-shadow:0 0 0 2px ${cm};display:grid;place-items:center;overflow:hidden"><img src="${mark}" alt="" style="max-width:70%;max-height:70%"></div>`, "#FBE890"],
    ["DARK BACKGROUND", `<img src="${dark}" alt="">`, "#1A1A1A"],
  ];
  $("#mockups").innerHTML = items.map(([cap, inner, bg], i) => `<div class="mock" data-mock="${i}" style="background:${bg}">${inner}<span class="cap" ${i === 5 ? 'style="color:#aaa"' : ""}>${cap}</span></div>`).join("");
}

function buildPanel() {
  const c = state.current;
  // ---- Mark tab
  const sliders = `
    <div class="slider"><span>Mark size</span><input type="range" min="0.6" max="1.6" step="0.05" value="${c.markScale}" data-k="markScale"><span class="mono">${Math.round(c.markScale * 100)}%</span></div>
    <div class="slider"><span>Move X</span><input type="range" min="-30" max="30" step="1" value="${c.markX}" data-k="markX"><span class="mono">${c.markX}</span></div>
    <div class="slider"><span>Move Y</span><input type="range" min="-30" max="30" step="1" value="${c.markY}" data-k="markY"><span class="mono">${c.markY}</span></div>`;
  const kindSeg = `<div class="field"><span class="lbl">Mark type</span><div class="seg" id="kindSeg">
      <button type="button" data-kind="template" aria-pressed="${c.kind === "template"}">Icon</button>
      <button type="button" data-kind="generated" aria-pressed="${c.kind === "generated"}">Generated</button>
      ${c.markSvg ? `<button type="button" data-kind="custom" aria-pressed="${c.kind === "custom"}">AI original</button>` : ""}</div></div>`;
  if (c.kind === "generated") {
    $("#tabMark").innerHTML = `${kindSeg}
      <div class="field"><span class="lbl">Generator</span><div class="seg" data-seg="genType">${E.GENERATORS.map((g) => `<button type="button" data-v="${g.id}" aria-pressed="${c.gen?.type === g.id}">${g.label}</button>`).join("")}</div></div>
      <button class="btn btn-outline" type="button" id="newSeedBtn">🎲 New variation</button>
      <p class="muted" style="font-size:13px;margin:0">${esc((E.GENERATORS.find((g) => g.id === c.gen?.type) || {}).reason || "")}</p>
      ${sliders}`;
  } else if (c.kind === "custom") {
    $("#tabMark").innerHTML = `${kindSeg}
      <div class="ok">This mark was drawn by AI from the idea: <i>${esc(c.markIdea || c.name)}</i></div>
      <button class="btn btn-outline" type="button" id="redrawBtn">↻ Redraw mark</button>
      <button class="btn btn-ghost btn-sm" type="button" id="toTemplate">Use a template icon instead</button>
      ${sliders}`;
  } else {
    $("#tabMark").innerHTML = `${kindSeg}
      <div class="field"><label for="iconSearch">Search icons</label><input class="input" id="iconSearch" placeholder="leaf, coffee, rocket…"></div>
      <div class="icon-grid" id="iconGrid"></div>
      <div class="field"><span class="lbl">Container</span><div class="seg" data-seg="frame">${["none", "circle", "square", "accent"].map((f) => `<button type="button" data-v="${f}" aria-pressed="${c.frame === f}">${f[0].toUpperCase() + f.slice(1)}</button>`).join("")}</div></div>
      <div class="field"><span class="lbl">Line weight</span><div class="seg" data-seg="strokeWidth">${[1.5, 2, 2.5, 3].map((w) => `<button type="button" data-v="${w}" aria-pressed="${c.strokeWidth === w}">${w}</button>`).join("")}</div></div>
      ${sliders}`;
    fillIconGrid("");
  }
  // ---- Text tab
  E.fontWeights(c.font).then((ws) => {
    $("#tabText").innerHTML = `
      <div class="field"><label for="edName">Brand name</label><input class="input" id="edName" maxlength="24" value="${esc(c.brand)}"></div>
      <div class="field"><label for="edTag">Tagline</label><input class="input" id="edTag" maxlength="60" value="${esc(c.tagline)}"></div>
      <label class="row" style="font-size:14px;gap:8px"><input type="checkbox" id="edShowTag" ${c.showTagline ? "checked" : ""}> Show tagline</label>
      <div class="field"><span class="lbl">Name style</span><div class="seg" data-seg="textStyle">${E.TEXT_STYLES.map((t) => `<button type="button" data-v="${t.id}" aria-pressed="${(c.textStyle || "plain") === t.id}">${t.label}</button>`).join("")}</div></div>
      <div class="field"><span class="lbl">Font</span><div class="font-list">${E.FONTS.map((f) => `<button type="button" data-font="${f}" aria-pressed="${c.font === f}" style="font-family:'${f}'">${f}</button>`).join("")}</div></div>
      <div class="field"><span class="lbl">Weight</span><div class="seg" data-seg="weight">${ws.map((w) => `<button type="button" data-v="${w}" aria-pressed="${c.weight === w}">${w === 700 ? "Bold" : "Regular"}</button>`).join("")}</div></div>
      <div class="slider"><span>Spacing</span><input type="range" min="-6" max="30" step="1" value="${c.tracking}" data-k="tracking"><span class="mono">${c.tracking}</span></div>
      <div class="field"><span class="lbl">Case</span><div class="seg" data-seg="textCase">${[["asis", "As typed"], ["upper", "UPPER"], ["lower", "lower"], ["title", "Title"]].map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${c.textCase === v}">${l}</button>`).join("")}</div></div>`;
  });
  // ---- Colour tab
  const labels = ["Mark", "Text", "Accent"];
  $("#tabColour").innerHTML = `
    <div class="field"><span class="lbl">Palettes</span><div class="pal-grid">${E.PALETTES.map((p, i) => `<button type="button" data-pal="${i}" title="${p.vibe} · ${p.name}">${p.colors.map((h) => `<span style="background:${h}"></span>`).join("")}</button>`).join("")}</div></div>
    <div class="field"><span class="lbl">Custom</span>${c.palette.map((h, i) => `<label class="row" style="gap:10px;font-size:14px"><input type="color" class="swatch-in" data-pc="${i}" value="${h}"> ${labels[i]} <span class="mono muted">${h.toUpperCase()}</span></label>`).join("")}</div>
    <div id="contrastBox"></div>`;
  const ratio = E.contrast(c.palette[1], "#FFFFFF");
  $("#contrastBox").innerHTML = ratio < 4.5
    ? `<div class="warn">Text contrast ${ratio.toFixed(1)}:1 on white — ${ratio < 3 ? "hard to read" : "OK for large text only"}.</div>`
    : `<div class="ok">Text contrast ${ratio.toFixed(1)}:1 on white ✓ AA</div>`;
  // ---- Layout tab
  const mini = {
    "icon-left": '<rect x="4" y="10" width="20" height="20" rx="4" fill="#EF7B43"/><rect x="30" y="14" width="36" height="7" rx="2" fill="#1A1A1A"/><rect x="30" y="24" width="24" height="4" rx="2" fill="#aaa"/>',
    "icon-top": '<rect x="25" y="2" width="20" height="20" rx="4" fill="#EF7B43"/><rect x="15" y="26" width="40" height="7" rx="2" fill="#1A1A1A"/>',
    "badge-circle": '<circle cx="35" cy="20" r="18" fill="#EF7B43"/><rect x="24" y="22" width="22" height="4" rx="2" fill="#fff"/>',
    "badge-rounded": '<rect x="17" y="2" width="36" height="36" rx="9" fill="#EF7B43"/><rect x="24" y="22" width="22" height="4" rx="2" fill="#fff"/>',
    emblem: '<circle cx="35" cy="20" r="18" fill="#EF7B43"/><circle cx="35" cy="20" r="11" fill="#fff"/><circle cx="35" cy="20" r="6" fill="#1A1A1A"/>',
    wordmark: '<rect x="6" y="14" width="52" height="10" rx="2" fill="#1A1A1A"/><rect x="61" y="19" width="5" height="5" fill="#EF7B43"/>',
    monogram: '<circle cx="35" cy="20" r="17" fill="#1A1A1A"/><text x="35" y="26" font-size="16" text-anchor="middle" fill="#fff" font-family="serif">M</text>',
  };
  $("#tabLayout").innerHTML = `<div class="layout-grid">${E.LAYOUTS.map((l) => `<button type="button" data-layout="${l.id}" aria-pressed="${c.layout === l.id}"><svg viewBox="0 0 70 40">${mini[l.id]}</svg>${l.label}</button>`).join("")}</div>
    <p class="muted" style="font-size:13px;margin:0">Badge, emblem and monogram use the mark colour as the background. The emblem sets your name around the top and the tagline around the bottom.</p>`;
  buildTextureTab();
}

// Texture tab: small live previews of each texture on the current logo
let texToken = 0;
async function buildTextureTab() {
  const c = state.current;
  const tok = ++texToken;
  const cur = c.texture || "none";
  const strength = c.textureStrength ?? 0.6;
  $("#tabTexture").innerHTML = `
    <div class="tex-grid">${E.TEXTURES.map((t) => `<button type="button" data-texture="${t.id}" aria-pressed="${cur === t.id}"><img alt="" data-tex-prev="${t.id}">${t.label}</button>`).join("")}</div>
    <p class="muted" style="font-size:13px;margin:0" id="texNote">${esc(E.TEXTURES.find((t) => t.id === cur).note)}</p>
    <div class="slider ${cur === "none" ? "hidden" : ""}" id="texStrength"><span>Strength</span><input type="range" min="0.1" max="1" step="0.05" value="${strength}" data-k="textureStrength"><span class="mono">${Math.round(strength * 100)}%</span></div>
    <div class="ok" style="font-size:13px">Paint textures are added as extra files (PNG + SVG). Your clean SVG stays the master file you download and claim.</div>`;
  for (const t of E.TEXTURES) {
    if (tok !== texToken) return;
    const v = { ...c, texture: t.id };
    const svg = t.id === "none" ? (await E.renderLogo(v)).svg : t.id === "rough" ? (await E.renderLogo(v)).svg : E.applyTexture((await E.renderLogo({ ...v, texture: "none" })).svg, v);
    const img = document.querySelector(`[data-tex-prev="${t.id}"]`);
    if (img) img.src = svgUrl(svg);
  }
}

function fillIconGrid(q) {
  const grid = $("#iconGrid");
  if (!grid) return;
  const names = E.iconNames().filter((n) => !q || n.includes(q) || E.iconTags(n).some((t) => t.includes(q)));
  const ICONS_INNER = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconCache[n] || ""}</svg>`;
  grid.innerHTML = names.slice(0, 240).map((n) => `<button type="button" data-icon="${n}" title="${n}" aria-pressed="${state.current.icon === n}">${ICONS_INNER(n)}</button>`).join("") || `<p class="muted">No icons match.</p>`;
}
let iconCache = {};

function bindPanel() {
  const panel = $("#panel");
  panel.addEventListener("click", async (e) => {
    const t = e.target.closest("button");
    if (!t || !state.current) return;
    if (t.dataset.ptab) {
      $$("[data-ptab]", panel).forEach((b) => b.setAttribute("aria-selected", b === t));
      $$("[data-ptab-body]", panel).forEach((b) => b.classList.toggle("active", b.dataset.ptabBody === t.dataset.ptab));
      return;
    }
    if (t.dataset.icon) { update({ icon: t.dataset.icon }); $$("[data-icon]", panel).forEach((b) => b.setAttribute("aria-pressed", b === t)); }
    if (t.dataset.kind) {
      const k = t.dataset.kind, c = state.current;
      const patch = { kind: k };
      if (k === "generated" && !c.gen) patch.gen = { type: "radial", seed: Math.floor(Math.random() * 1e6) };
      if (k !== "template" && (c.layout === "wordmark" || c.layout === "monogram")) patch.layout = "icon-left";
      return update(patch, { panel: true });
    }
    if (t.id === "newSeedBtn") return update({ gen: { ...state.current.gen, seed: Math.floor(Math.random() * 1e6) } });
    const seg = t.closest("[data-seg]");
    if (seg && t.dataset.v && seg.dataset.seg === "genType") {
      update({ gen: { type: t.dataset.v, seed: state.current.gen?.seed || 1 } }, { panel: true });
      return;
    }
    if (seg && t.dataset.v) {
      const k = seg.dataset.seg;
      const v = ["strokeWidth", "weight"].includes(k) ? Number(t.dataset.v) : t.dataset.v;
      update({ [k]: v });
      $$("button", seg).forEach((b) => b.setAttribute("aria-pressed", b === t));
    }
    if (t.dataset.font) {
      const ws = await E.fontWeights(t.dataset.font);
      update({ font: t.dataset.font, weight: ws.includes(state.current.weight) ? state.current.weight : ws[0] }, { panel: true });
      $$("[data-ptab]", panel).find((b) => b.dataset.ptab === "text").click();
    }
    if (t.dataset.pal) update({ palette: E.PALETTES[t.dataset.pal].colors.slice() }, { panel: true });
    if (t.dataset.texture) {
      update({ texture: t.dataset.texture });
      $$("[data-texture]", panel).forEach((b) => b.setAttribute("aria-pressed", b === t));
      $("#texNote").textContent = E.TEXTURES.find((x) => x.id === t.dataset.texture).note;
      $("#texStrength").classList.toggle("hidden", t.dataset.texture === "none");
      return;
    }
    if (t.dataset.layout) { update({ layout: t.dataset.layout }); $$("[data-layout]", panel).forEach((b) => b.setAttribute("aria-pressed", b === t)); }
    if (t.id === "toTemplate") update({ kind: "template", frame: "circle" }, { panel: true });
    if (t.id === "redrawBtn") {
      t.disabled = true; t.textContent = "Drawing…";
      const c = clone(state.current);
      await resolveMark(c);
      if (c.kind === "custom") update({ markSvg: c.markSvg }, { panel: true });
      else { toast("AI couldn't draw a clean mark — try again or use a template icon"); t.disabled = false; t.textContent = "↻ Redraw mark"; }
    }
  });
  panel.addEventListener("input", (e) => {
    const t = e.target;
    if (!state.current) return;
    if (t.id === "iconSearch") return fillIconGrid(t.value.trim().toLowerCase());
    if (t.dataset.k) {
      const v = Number(t.value);
      t.nextElementSibling.textContent = ["markScale", "textureStrength"].includes(t.dataset.k) ? Math.round(v * 100) + "%" : v;
      return update({ [t.dataset.k]: v }, { record: false });
    }
    if (t.dataset.pc !== undefined) {
      const p = state.current.palette.slice();
      p[t.dataset.pc] = t.value.toUpperCase();
      t.parentElement.querySelector(".mono").textContent = t.value.toUpperCase();
      return update({ palette: p }, { record: false });
    }
    if (t.id === "edName") {
      const v = t.value.slice(0, 24);
      if (isBlockedBrand(v)) return toast("Let's make something original — try your own brand name.");
      return update({ brand: v || "Brand" }, { record: false });
    }
    if (t.id === "edTag") return update({ tagline: t.value }, { record: false });
    if (t.id === "edShowTag") return update({ showTagline: t.checked });
  });
  // one undo step per slider drag / text edit
  panel.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.k || t.dataset.pc !== undefined || t.id === "edName" || t.id === "edTag") {
      state.history.push(clone(state.lastCommitted || state.original));
      state.future = [];
      state.lastCommitted = clone(state.current);
      if (t.dataset.pc !== undefined) buildPanel();
      renderPreview();
    }
  });
  panel.addEventListener("focusin", () => { state.lastCommitted = clone(state.current); });
}
function undo() {
  if (!state.history.length) return;
  state.future.push(clone(state.current));
  state.current = state.history.pop();
  store.set("current", state.current);
  buildPanel(); renderPreview();
}
function redo() {
  if (!state.future.length) return;
  state.history.push(clone(state.current));
  state.current = state.future.pop();
  store.set("current", state.current);
  buildPanel(); renderPreview();
}

// ---------- downloads ----------
async function doDownload(kind) {
  const c = state.current;
  if (!c) return;
  const ex = state.exports || (await E.buildExports(c));
  const s = E.slug(c.brand);
  try {
    if (kind === "svg") E.download(`${s}-logo.svg`, ex.svg, "image/svg+xml");
    if (kind.startsWith("png")) { const w = Number(kind.slice(3)); E.download(`${s}-logo-${w}.png`, await E.svgToPng(ex.svg, w)); }
    if (kind === "dark") { E.download(`${s}-logo-dark.svg`, ex.darkSvg, "image/svg+xml"); E.download(`${s}-logo-dark-1024.png`, await E.svgToPng(ex.darkSvg, 1024)); }
    if (kind === "textured" && ex.texturedSvg) {
      E.download(`${s}-logo-${c.texture}.svg`, ex.texturedSvg, "image/svg+xml");
      E.download(`${s}-logo-${c.texture}-2048.png`, await E.svgToPng(ex.texturedSvg, 2048));
    }
    if (kind === "favicon") { E.download("favicon-32.png", await E.svgToPng(ex.markSvg, 32, 32)); E.download("apple-touch-icon-180.png", await E.svgToPng(ex.markSvg, 180, 180, "#FFFFFF")); }
    if (kind === "zip") {
      toast("Building your brand kit…");
      E.download(`${s}-brand-kit.zip`, await E.brandKitZip(c));
    }
    toast("Downloaded · check trademarks before using a logo commercially");
  } catch (err) {
    console.error(err);
    toast("Download failed — please try again");
  }
}

// =====================================================================
// Wallet + contract
// =====================================================================
const HEX_CHAIN = "0x" + NET.chainId.toString(16);
let readProvider, readC;
function reader() {
  if (!IS_DEPLOYED || !window.ethers) return null;
  if (!readC) {
    readProvider = new ethers.JsonRpcProvider(NET.rpc, NET.chainId, { staticNetwork: true });
    readC = new ethers.Contract(CONTRACT, ABI, readProvider);
  }
  return readC;
}
function walletUI() {
  const b = $("#walletBtn");
  if (!window.ethereum) { b.textContent = "Install MetaMask"; return; }
  if (!state.wallet.address) { b.textContent = "Connect wallet"; return; }
  if (!state.wallet.chainOk) { b.textContent = "Switch to BOT Chain"; return; }
  b.innerHTML = `<span class="dot"></span>${short(state.wallet.address)}`;
}
async function ensureChain() {
  try {
    await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: HEX_CHAIN }] });
  } catch (e) {
    if (e.code === 4902 || e?.data?.originalError?.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{ chainId: HEX_CHAIN, chainName: NET.chainName, rpcUrls: [NET.rpc], blockExplorerUrls: [NET.explorer], nativeCurrency: NET.currency }],
      });
    } else throw e;
  }
  const id = await ethereum.request({ method: "eth_chainId" });
  state.wallet.chainOk = parseInt(id, 16) === NET.chainId;
  walletUI();
  return state.wallet.chainOk;
}
async function connect() {
  if (!window.ethereum) { window.open("https://metamask.io/download/", "_blank", "noopener"); return false; }
  const [addr] = await ethereum.request({ method: "eth_requestAccounts" });
  state.wallet.address = addr;
  await ensureChain();
  walletUI();
  return true;
}
async function refreshWallet() {
  if (!window.ethereum) return walletUI();
  try {
    const [addr] = await ethereum.request({ method: "eth_accounts" });
    state.wallet.address = addr || null;
    const id = await ethereum.request({ method: "eth_chainId" });
    state.wallet.chainOk = parseInt(id, 16) === NET.chainId;
  } catch { /* ignore */ }
  walletUI();
}
if (window.ethereum) {
  ethereum.on?.("accountsChanged", refreshWallet);
  ethereum.on?.("chainChanged", refreshWallet);
}

// ---------- claim ----------
function claimMsg(html) { $("#claimMsg").innerHTML = html; }
async function claim({ skipGallery = false, retryUpload = false } = {}) {
  if (state.claimBusy || !state.current) return;
  const c = state.current;
  if (!IS_DEPLOYED) return claimMsg(`<div class="warn">The claims contract isn't deployed yet. Downloads still work.</div>`);
  if (!window.ethereum) return claimMsg(`<div class="warn">Install MetaMask to claim. <a href="https://metamask.io/download/" target="_blank" rel="noopener">Get MetaMask ↗</a> — creating and downloads still work without it.</div>`);
  state.claimBusy = true;
  const btn = $("#claimBtn");
  btn.disabled = true;
  try {
    if (!state.wallet.address) await connect();
    if (!(await ensureChain())) throw Object.assign(new Error("wrong_network"), { code: "wrong_network" });
    const ex = await E.buildExports(c);
    const hash = await E.sha256Hex(ex.svg);
    const [existing] = await reader().claimOfHash(hash);
    if (existing > 0n) {
      return claimMsg(`<div class="warn">This exact logo was claimed as <a href="#/verify?claim=${existing}">#${existing}</a>. Edit anything to make a new version.</div>`);
    }
    let cid = "";
    if ($("#galleryChk").checked && !skipGallery) {
      if (state.galleryCid && state.galleryCid.hash === hash && !retryUpload) cid = state.galleryCid.cid;
      else {
        claimMsg(`<div class="ok">Uploading to the public gallery (IPFS)…</div>`);
        try {
          cid = (await api("/upload", { svg: ex.svg, name: c.brand }, 30000)).cid || "";
          if (!cid) throw new Error("no cid");
          state.galleryCid = { hash, cid };
        } catch {
          return claimMsg(`<div class="warn">Gallery upload failed.</div>
            <div class="row" style="margin-top:8px"><button class="btn btn-outline btn-sm" type="button" data-claim="retry">Retry upload</button>
            <button class="btn btn-peach btn-sm" type="button" data-claim="nogallery">Claim without gallery</button></div>`);
        }
      }
    }
    const signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
    const contract = new ethers.Contract(CONTRACT, ABI, signer);
    const style = E.VIBES.indexOf(c.vibe) >= 0 ? E.VIBES.indexOf(c.vibe) : 7;
    claimMsg(`<div class="ok">Confirm in MetaMask…</div>`);
    // Contract limit is 48 *bytes* (UTF-8), so trim by bytes without splitting a character.
    let brand = c.brand.trim();
    while (new TextEncoder().encode(brand).length > 48) brand = [...brand].slice(0, -1).join("");
    const tx = await contract.claim(hash, brand, style, cid);
    claimMsg(`<div class="ok">Transaction pending… <a href="${NET.explorer}/tx/${tx.hash}" target="_blank" rel="noopener">view ↗</a></div>`);
    const rc = await tx.wait();
    if (rc.status !== 1) throw new Error("tx_failed");
    let id = null;
    for (const log of rc.logs) {
      try { const p = contract.interface.parseLog(log); if (p?.name === "Claimed") id = p.args.id; } catch { /* other log */ }
    }
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const link = `${SITE}#/verify?claim=${id}`;
    const mine = store.get("claims", []);
    mine.unshift({ id: String(id), brand: c.brand, hash, at: Date.now(), tx: tx.hash });
    store.set("claims", mine);
    state.claimedSvg = ex.svg;
    claimMsg(`<div class="cert"><div class="mono">CERTIFICATE OF CLAIM · BOT CHAIN</div>
      <div class="big">Claimed #${id} · ${date}</div>
      <div>“${esc(c.brand)}” by ${short(state.wallet.address)}</div>
      <div class="mono">${hash}</div>
      <div class="row" style="margin-top:6px">
        <button class="btn btn-peach btn-sm" type="button" data-copy="${esc(link)}">Copy proof link</button>
        <button class="btn btn-outline btn-sm" type="button" data-claim="dlclaimed">Download claimed SVG</button>
        <a class="btn btn-ghost btn-sm" style="color:#fff" href="${NET.explorer}/tx/${tx.hash}" target="_blank" rel="noopener">Explorer ↗</a></div></div>
      <p class="muted" style="font-size:13px;margin:8px 0 0">Keep this exact SVG file — any change creates a new fingerprint.</p>`);
    loadCount();
  } catch (e) {
    console.error(e);
    const code = e?.code || e?.info?.error?.code;
    const reason = e?.revert?.name || e?.reason || "";
    if (code === "ACTION_REJECTED" || code === 4001) claimMsg(`<div class="warn">Transaction rejected in MetaMask.</div><button class="btn btn-outline btn-sm" type="button" data-claim="retry" style="margin-top:8px">Try again</button>`);
    else if (code === "wrong_network") claimMsg(`<div class="warn">Please switch to BOT Chain to claim.</div><button class="btn btn-outline btn-sm" type="button" data-claim="retry" style="margin-top:8px">Switch to BOT Chain</button>`);
    else if (reason === "AlreadyClaimed") claimMsg(`<div class="warn">This exact logo was just claimed by someone else. Edit anything to make a new version.</div>`);
    else claimMsg(`<div class="warn">Transaction failed${e?.shortMessage ? ": " + esc(e.shortMessage) : ""}.</div><button class="btn btn-outline btn-sm" type="button" data-claim="retry" style="margin-top:8px">Try again</button>`);
  } finally {
    state.claimBusy = false;
    btn.disabled = false;
  }
}

// =====================================================================
// Verify
// =====================================================================
function proofCard(id, cl, extra = "") {
  const img = cl.cid ? `<img src="${CONFIG.IPFS_GATEWAY}${esc(cl.cid)}" alt="${esc(cl.brand)} logo">` : `<p class="muted" style="text-align:center">Image not in the public gallery.<br>Drop the SVG above to check it.</p>`;
  return `<div class="proof"><div class="img">${img}</div><dl>
    <dt>Claim</dt><dd><b>#${id}</b> ${extra}</dd>
    <dt>Brand</dt><dd>${esc(cl.brand)}</dd>
    <dt>Style</dt><dd class="mono">${E.STYLE_LABELS[Number(cl.style)] || "—"}</dd>
    <dt>Creator</dt><dd class="mono"><a href="${NET.explorer}/address/${cl.creator}" target="_blank" rel="noopener">${cl.creator}</a></dd>
    <dt>Date</dt><dd>${fmtDate(claimTime(cl))}</dd>
    <dt>Fingerprint</dt><dd class="mono" style="font-size:13px">${cl.svgHash}</dd>
    <dt>Chain</dt><dd>${NET.chainName} · chain ID ${NET.chainId}</dd>
  </dl><div style="padding:0 20px 20px" class="row"><button class="btn btn-peach btn-sm" type="button" data-copy="${SITE}#/verify?claim=${id}">Copy proof link</button>
  <a class="btn btn-outline btn-sm" href="${NET.explorer}/address/${CONTRACT}" target="_blank" rel="noopener">Contract ↗</a></div></div>`;
}
async function initVerify(params) {
  const out = $("#verifyResult");
  const id = params.get("claim");
  out.innerHTML = "";
  if (!id) return;
  if (!IS_DEPLOYED || !window.ethers) return (out.innerHTML = `<div class="warn">The claims contract isn't deployed yet.</div>`);
  if (!/^\d+$/.test(id)) return (out.innerHTML = `<div class="warn">Claim not found.</div>`);
  out.innerHTML = `<div class="ok">Looking up claim #${id}…</div>`;
  try {
    const cl = await reader().getClaim(BigInt(id));
    out.innerHTML = proofCard(id, cl);
  } catch {
    out.innerHTML = `<div class="warn">Claim not found.</div>`;
  }
}
async function verifyFile(file) {
  const out = $("#verifyResult");
  if (!file) return;
  if (file.size > 1024 * 1024) return (out.innerHTML = `<div class="warn">That file is too large to be a Markcraft SVG.</div>`);
  const text = await file.text();
  const hash = await E.sha256Hex(text);
  if (!IS_DEPLOYED || !window.ethers) return (out.innerHTML = `<div class="warn">Fingerprint: <span class="mono">${hash}</span><br>The claims contract isn't deployed yet, so it can't be looked up.</div>`);
  out.innerHTML = `<div class="ok">Checking BOT Chain…</div>`;
  try {
    const [id, cl] = await reader().claimOfHash(hash);
    if (id > 0n) {
      out.innerHTML = `<div class="ok" style="margin-bottom:12px;font-size:16px">✓ Matches claim #${id} for “${esc(cl.brand)}” by ${short(cl.creator)}, ${fmtDate(claimTime(cl))}</div>` + proofCard(String(id), cl, '<span class="orange">· exact match</span>');
    } else {
      out.innerHTML = `<div class="warn">No claim for this exact file (any change creates a new fingerprint).</div><p class="mono muted" style="font-size:12px;word-break:break-all">${hash}</p>`;
    }
  } catch {
    out.innerHTML = `<div class="warn">Couldn't reach BOT Chain. Please try again.</div>`;
  }
}

// =====================================================================
// My logos
// =====================================================================
async function initMine() {
  const saved = store.get("saved", []);
  const box = $("#savedList");
  if (!saved.length) box.innerHTML = `<div class="empty-box" style="grid-column:1/-1;margin:0">Nothing saved yet. Press ♡ on a concept to keep it here.</div>`;
  else {
    const cards = await Promise.all(saved.map(async (c) => (await cardHTML(c)).replace('data-act="more"', 'data-act="del"').replace("More like this", "Remove")));
    box.innerHTML = cards.join("");
  }
  const mc = $("#myClaims");
  const local = store.get("claims", []);
  let ids = [];
  if (state.wallet.address && reader()) {
    try { ids = (await reader().claimsOf(state.wallet.address)).map(String); } catch { /* offline */ }
  }
  const all = [...new Set([...ids, ...local.map((l) => l.id)])];
  if (!all.length) {
    mc.innerHTML = `<div class="empty-box" style="margin:0">${state.wallet.address ? "No claims from this wallet yet." : 'Connect your wallet to see your claims. <button class="btn btn-outline btn-sm" type="button" data-connect>Connect wallet</button>'}</div>`;
    return;
  }
  mc.innerHTML = `<div class="gallery-grid" style="margin-top:0">${all.map((id) => {
    const l = local.find((x) => x.id === id);
    return `<a class="g-card" href="#/verify?claim=${id}"><div class="meta"><b>${esc(l?.brand || "Claim")}</b><span>CLAIM #${id}${l ? " · " + new Date(l.at).toLocaleDateString() : ""}</span></div></a>`;
  }).join("")}</div>`;
}

// =====================================================================
// Home page builders
// =====================================================================
const SAMPLE = (brand, partial) => E.baseConcept({ name: brand, tagline: partial.tagline || "" }, partial);
const SAMPLES = {
  Minimal: SAMPLE("Slow Mornings", { icon: "sunrise", font: "Manrope", weight: 700, palette: ["#1A1A1A", "#1A1A1A", "#EF7B43"], layout: "icon-left", frame: "none", textCase: "asis" }),
  Playful: SAMPLE("Pawsome", { icon: "paw-print", font: "Pacifico", weight: 400, palette: ["#FF6B6B", "#2D2A32", "#FFD93D"], layout: "icon-left", frame: "circle" }),
  Luxury: SAMPLE("Maison Ora", { kind: "generated", gen: { type: "monocut", seed: 5 }, font: "Playfair Display", weight: 400, palette: ["#B8925A", "#1E1E1E", "#E8D9BF"], layout: "icon-top", textCase: "upper", tracking: 12 }),
  Techy: SAMPLE("Northwind", { kind: "generated", gen: { type: "dotgrid", seed: 3 }, icon: "brain-circuit", font: "Space Grotesk", weight: 700, palette: ["#2F6BFF", "#0E1525", "#22D3EE"], layout: "icon-left" }),
  Organic: SAMPLE("Fern & Fig", { kind: "generated", gen: { type: "radial", seed: 7 }, icon: "sprout", font: "Fraunces", weight: 400, palette: ["#5E7D4E", "#2E3B26", "#D9A05B"], layout: "icon-left", textStyle: "twotone" }),
  Bold: SAMPLE("LOUD", { icon: "zap", font: "Archivo Black", weight: 400, palette: ["#EF4423", "#111111", "#FFC300"], layout: "wordmark" }),
  Retro: SAMPLE("Lucky Diner", { kind: "generated", gen: { type: "stripes", seed: 11 }, tagline: "Burgers & shakes", showTagline: true, icon: "coffee", font: "DM Serif Display", weight: 400, palette: ["#E07A3F", "#3E2A1E", "#2A9D8F"], layout: "emblem" }),
  Monogram: SAMPLE("Quiet Studio", { font: "Fraunces", weight: 700, palette: ["#274F31", "#1A1A1A", "#E6B655"], layout: "monogram" }),
};
const logoImg = async (c, alt) => `<img src="${svgUrl((await E.renderLogo(c)).svg)}" alt="${esc(alt || c.brand + " example logo")}">`;

const STEPS = [
  { t: "Simple", h: "Works at 16 pixels", p: "A good logo survives a browser tab and an app icon. Markcraft keeps marks to a few bold shapes, so they stay crisp from favicon to billboard.", art: "step-simple.svg", ui: "Contrast ✓ AA" },
  { t: "Memorable", h: "One clear idea", p: "The best marks say one thing well. Every concept comes with a name and a one-line reason, so you can tell at a glance what idea it carries.", art: "step-memorable.svg", ui: "1 idea · 3 colours" },
  { t: "Yours", h: "Editable files + proof", p: "Download real vector files you can edit anywhere, then claim the exact file on BOT Chain — a public, timestamped record that you made it first.", art: "step-yours.svg", ui: "Claimed #24 ✓" },
];
function renderStepper(open = 0) {
  $("#stepper").innerHTML = STEPS.map((s, i) => i === open
    ? `<div class="step-panel"><div class="art"><img class="paint" src="assets/art/${s.art}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"><div class="float-ui"><span class="orange">●</span>${esc(s.ui)}</div></div>
       <div class="content"><div class="num">0${i + 1}</div><h3 style="font-size:34px">${s.t} — ${s.h}</h3><p>${s.p}</p>
       <div><button class="btn btn-green" type="button" data-step="${(i + 1) % 3}">Next <span class="chip-arrow"><svg><use href="#i-plane"/></svg></span></button></div></div></div>`
    : `<button class="step-tab" type="button" data-step="${i}"><span class="n">0${i + 1}</span><span class="t">${s.t}</span></button>`).join("");
}

async function buildHome() {
  renderStepper(0);
  $("#stepper").onclick = (e) => { const b = e.target.closest("[data-step]"); if (b) renderStepper(Number(b.dataset.step)); };

  // styles
  const styleCards = await Promise.all(["Minimal", "Playful", "Luxury", "Techy"].map(async (v) => {
    const pals = E.PALETTES.filter((p) => p.vibe === v).length, fonts = E.FONT_BY_VIBE[v].length;
    return `<a class="style-card" href="#/create?vibe=${v}"><div class="top"><span>${v.toUpperCase()}</span><span>↗</span></div>
      <h3>${{ Minimal: "Quiet & clean", Playful: "Bright & friendly", Luxury: "Refined & rare", Techy: "Sharp & smart" }[v]}</h3>
      <div class="logo-box">${await logoImg(SAMPLES[v])}</div>
      <div class="meta orange">${pals} palettes · ${fonts} fonts</div><div class="meta muted">📅 Updated Oct 2026</div></a>`;
  }));
  $("#styleCards").innerHTML = styleCards.join("");
  const n = E.iconNames().length;
  const more = [
    ["Organic", "vibe=Organic", 3 * 3 * 6], ["Bold", "vibe=Bold", 3 * 3 * 6], ["Retro", "vibe=Retro", 3 * 4 * 6],
    ["Monogram", "", 24 * 12], ["Badge", "", 24 * 12 * 2], ["Wordmark", "", 24 * 12],
    ["Emblem", "", 24 * 12], ["Handwritten", "", 24 * 6], ["Geometric", "", E.iconNames().filter((x) => E.iconTags(x).includes("shapes")).length * 24],
  ];
  $("#moreStyles").innerHTML = more.map(([l, q, c]) => `<a href="#/create${q ? "?" + q : ""}"><span>${l}</span><span class="muted">${c}</span></a>`).join("");
  $("#styleMenu").innerHTML = E.VIBES.map((v) => `<a href="#/create?vibe=${v}">${v}</a>`).join("");

  // product cards
  const minis = await Promise.all(["Minimal", "Playful", "Luxury", "Techy", "Organic", "Retro"].map((v) => logoImg(SAMPLES[v])));
  $("#miniGrid").innerHTML = minis.map((m) => `<div>${m}</div>`).join("");
  const ex = await E.buildExports({ ...SAMPLES.Organic, layout: "icon-left", frame: "circle" });
  $("#overlap").innerHTML = `
    <div style="left:0;top:10px;width:60%;height:120px"><img src="${svgUrl(ex.svg)}" alt="" style="max-height:100%"></div>
    <div style="right:0;top:60px;width:44%;height:110px;background:#1A1A1A"><img src="${svgUrl(ex.darkSvg)}" alt="" style="max-height:100%"></div>
    <div style="left:16%;bottom:0;width:30%;aspect-ratio:1;border-radius:22%"><img src="${svgUrl(ex.markSvg)}" alt="" style="max-height:100%"></div>`;

  // how it works
  const shots = [
    `<div style="width:90%;display:grid;gap:6px"><div style="background:#F3F3F3;border-radius:6px;padding:8px;font:400 18px var(--serif)">Slow Mornings</div><div style="background:#F3F3F3;border-radius:6px;padding:8px;font-size:12px;color:#777">handmade candles for slow mornings</div><div style="display:flex;gap:4px"><span class="vibe" aria-pressed="true" style="font-size:11px">Organic</span><span class="vibe" style="font-size:11px">Minimal</span></div></div>`,
    `<div class="mini-grid" style="width:100%">${minis.slice(0, 6).map((m) => `<div style="box-shadow:0 0 0 1px #eee">${m}</div>`).join("")}</div>`,
    `<div style="width:100%;display:grid;grid-template-columns:1.4fr 1fr;gap:8px;height:100%"><div style="display:grid;place-items:center;background:#FAF9F6;border-radius:6px">${await logoImg(SAMPLES.Organic)}</div><div style="display:grid;gap:5px;align-content:start">${["Mark", "Text", "Colour", "Layout"].map((t) => `<div style="font:500 10px var(--mono);border:1px solid #eee;border-radius:4px;padding:5px">${t.toUpperCase()}</div>`).join("")}</div></div>`,
    `<div style="width:100%;display:grid;gap:8px"><div class="files" style="font-size:11px">${["logo.svg", "brand-kit.zip"].map((f) => `<div style="background:#F3F3F3;border:0"><span>${f}</span><span>↓</span></div>`).join("")}</div><div class="cert" style="padding:10px"><div class="mono" style="font-size:10px">CLAIMED ON BOT CHAIN</div><div style="font:400 18px var(--serif)">Claim #1 · Oct 27, 2026</div></div></div>`,
  ];
  $("#howGrid").innerHTML = [["Describe", "Brand name, one line about what you do, a vibe or two."], ["Pick a concept", "6 concepts appear one by one — templates and AI originals."], ["Edit & preview", "Swap icons, fonts, colours, layouts. See it on mockups."], ["Download & claim", "Get the brand kit, then claim proof on BOT Chain."]]
    .map(([h, p], i) => `<div class="how-step"><div class="n">0${i + 1}</div><h3>${h}</h3><p>${p}</p><div class="how-shot">${shots[i]}</div></div>`).join("");

  // made for
  const MF = [
    ["Founders", "Ship a credible brand on day one — then refine it when you raise.", "Techy"],
    ["Creators", "A mark for your channel, newsletter and merch that's actually yours.", "Playful"],
    ["Small shops", "From the shop sign to the sticker on every bag, one consistent look.", "Retro"],
    ["Hackathon teams", "A logo before the first commit, and proof of when you made it.", "Bold"],
    ["Communities", "Badges and emblems that look great on a Discord icon and a T-shirt.", "Organic"],
  ];
  const mfPanel = async (i) => {
    const [who, line, vibe] = MF[i];
    const c = SAMPLES[vibe];
    $("#mfPanel").innerHTML = `<div><span class="label-chip label-butter">${who}</span><p style="margin-top:16px">${line}</p><a class="btn btn-primary" href="#/create?vibe=${vibe}">Start a ${vibe.toLowerCase()} logo <svg class="plane"><use href="#i-plane"/></svg></a></div>
      <div class="kit-card"><div class="lg">${await logoImg(c)}</div>
      <div class="kit-row">${c.palette.map((h) => `<span class="sw" style="background:${h}"></span>${h}`).join(" ")}</div>
      <div class="kit-row">FONT · ${c.font.toUpperCase()}</div><div class="kit-row muted">SVG · PNG · FAVICON · COLOURS · BRAND SHEET</div></div>`;
    $$("#mfTabs .mf-tab").forEach((b, j) => b.setAttribute("aria-selected", i === j));
  };
  $("#mfTabs").innerHTML = MF.map(([w], i) => `<button class="mf-tab" role="tab" type="button" data-mf="${i}" aria-selected="${i === 0}">${w}</button>`).join("");
  $("#mfTabs").onclick = (e) => { const b = e.target.closest("[data-mf]"); if (b) mfPanel(Number(b.dataset.mf)); };
  mfPanel(0);

  // FAQ
  const FAQ = [
    ["Is it free?", "Yes. You get 10 free AI generations per day, and template concepts, editing and every download are always free. Claiming costs only a small BOT Chain network fee."],
    ["Do I own my logo?", "You own what you make. Fonts are Google Fonts under the SIL Open Font License and icons are Lucide (ISC licence) — both allow commercial use in logos. The AI marks are generated for you and are yours to use."],
    ["Can I use it commercially?", "Usually yes, but always check trademarks first: search your country's trademark office (for example USPTO, EUIPO or WIPO's Global Brand Database) for similar names and marks in your industry. A Markcraft claim is not a trademark."],
    ["What's the difference between Template and AI original?", "Templates combine a hand-picked open-licence icon, a curated font and palette with tested layout rules — always clean. AI originals are new geometric marks the AI writes as SVG; each one is cleaned and checked, and if it fails a template steps in."],
    ["Which files do I get?", "SVG (text converted to paths), transparent PNGs at 512, 1024 and 2048 px, a dark version, favicons (32 + 180 px), colours.txt with HEX/RGB, font names and links, and a one-page brand sheet — all in one brand kit ZIP."],
    ["What goes on BOT Chain?", "Only a fingerprint (SHA-256) of your exact SVG file, the brand name, a style label, your wallet address and the time. Optionally, an IPFS link if you choose the public gallery. It proves who registered that exact file first and when."],
    ["Is my logo public?", "Only if you tick “Show in public gallery” when claiming. Otherwise just the fingerprint is on-chain — nobody can rebuild your logo from it. Saved concepts stay in your browser; your brief is sent to our AI Worker only to generate concepts and is not stored."],
    ["Do I need a wallet?", "Only to claim. Creating, editing, downloading and verifying all work without a wallet."],
  ];
  $("#faqList").innerHTML = FAQ.map(([q, a], i) => `<details data-i="${i}"><summary><span class="n">${String(i + 1).padStart(3, "0")}</span><span class="q">${q}</span><span class="pm">+</span></summary><div class="a">${a}</div></details>`).join("");
}

// ---------- gallery / strip / count ----------
async function loadGallery() {
  const box = $("#galleryBox"), strip = $("#stripBox");
  const c = reader();
  if (!c) { box.innerHTML = `<div class="empty-box">The gallery fills up once the claims contract is live. <a href="#/create">Make a logo →</a></div>`; return; }
  try {
    const [ids, items] = await c.getGallery(0n, 24n);
    if (!ids.length) { box.innerHTML = `<div class="empty-box">No public logos yet — yours could be the first. <a href="#/create">Create a logo →</a></div>`; return; }
    const cards = ids.map((id, i) => {
      const it = items[i];
      return `<a class="g-card" href="#/verify?claim=${id}"><div class="img"><img loading="lazy" src="${CONFIG.IPFS_GATEWAY}${esc(it.cid)}" alt="${esc(it.brand)} logo"></div>
        <div class="meta"><b>${esc(it.brand)}</b><span>${E.STYLE_LABELS[Number(it.style)] || "—"} · CLAIM #${id} · ${fmtDate(claimTime(it)).toUpperCase()}</span></div></a>`;
    });
    box.innerHTML = `<div class="gallery-grid">${cards.join("")}</div>`;
    const imgs = ids.map((id, i) => `<a href="#/verify?claim=${id}"><img src="${CONFIG.IPFS_GATEWAY}${esc(items[i].cid)}" alt="${esc(items[i].brand)}"></a>`).join("");
    strip.innerHTML = `<div class="marquee"><div class="marquee-track">${imgs}${imgs}</div></div>`;
  } catch {
    box.innerHTML = `<div class="empty-box">Couldn't reach BOT Chain right now.</div>`;
  }
}
async function loadCount() {
  const c = reader();
  if (!c) return;
  try { $("#claimCount").textContent = String(await c.total()); } catch { /* offline */ }
}

// =====================================================================
// Global wiring
// =====================================================================
function wire() {
  $("#burger").onclick = () => $("#nav").classList.toggle("open");
  $("#walletBtn").onclick = async () => {
    try {
      if (!window.ethereum) return window.open("https://metamask.io/download/", "_blank", "noopener");
      if (!state.wallet.address) await connect();
      else if (!state.wallet.chainOk) await ensureChain();
      else toast("Connected: " + state.wallet.address);
    } catch (e) { toast(e?.code === 4001 ? "Request rejected" : "Couldn't connect wallet"); }
  };
  document.addEventListener("click", async (e) => {
    const copy = e.target.closest("[data-copy]");
    if (copy) { try { await navigator.clipboard.writeText(copy.dataset.copy); toast("Copied"); } catch { toast(copy.dataset.copy); } }
    const cl = e.target.closest("[data-claim]");
    if (cl) {
      const a = cl.dataset.claim;
      if (a === "retry") claim({ retryUpload: true });
      if (a === "nogallery") claim({ skipGallery: true });
      if (a === "dlclaimed" && state.claimedSvg) E.download(`${E.slug(state.current.brand)}-logo-claimed.svg`, state.claimedSvg, "image/svg+xml");
    }
    if (e.target.closest("[data-connect]")) { try { await connect(); initMine(); } catch { /* rejected */ } }
    const faq = e.target.closest("[data-faq]");
    if (faq) setTimeout(() => { const d = $(`#faqList details[data-i="${faq.dataset.faq}"]`); if (d) { d.open = true; d.scrollIntoView({ block: "center" }); } }, 80);
    const dd = $("#dlDrop");
    if (!e.target.closest("#dlDrop")) dd.classList.remove("open");
  });
  ["#concepts", "#moreConcepts", "#savedList"].forEach((s) => $(s).addEventListener("click", onCardAction));
  $("#dlBtn").onclick = () => $("#dlDrop").classList.toggle("open");
  $("#dlDrop .menu").onclick = (e) => { const b = e.target.closest("[data-dl]"); if (b) { $("#dlDrop").classList.remove("open"); doDownload(b.dataset.dl); } };
  $("#undoBtn").onclick = undo;
  $("#redoBtn").onclick = redo;
  $("#resetBtn").onclick = () => { if (state.original) { state.history.push(clone(state.current)); state.current = clone(state.original); buildPanel(); renderPreview(); } };
  // Shortcut: open the Texture tab and bring the panel into view (it sits far below on narrow screens).
  $("#textureJumpBtn").onclick = () => {
    $('#panel [data-ptab="texture"]').click();
    $("#panel").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $("#saveEditBtn").onclick = () => {
    const c = state.current;
    let saved = store.get("saved", []).filter((s) => s.id !== c.id);
    saved.unshift({ ...clone(c), savedAt: Date.now() });
    store.set("saved", saved.slice(0, 60));
    toast("Saved to My logos");
  };
  $("#claimBtn").onclick = () => claim();
  document.addEventListener("keydown", (e) => {
    if (!$("#view-edit").classList.contains("active") || e.target.matches("input,textarea")) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    if (e.key === "Escape") $("#modal").classList.remove("open");
  });
  $("#mockups").onclick = (e) => {
    const m = e.target.closest(".mock");
    if (!m) return;
    $("#modalBody").innerHTML = m.outerHTML;
    $("#modal").classList.add("open");
  };
  $("#modalClose").onclick = () => $("#modal").classList.remove("open");
  $("#modal").onclick = (e) => { if (e.target.id === "modal") $("#modal").classList.remove("open"); };
  bindPanel();

  // verify drop zone
  const drop = $("#drop");
  ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", (e) => verifyFile(e.dataTransfer.files[0]));
  $("#verifyFile").onchange = (e) => verifyFile(e.target.files[0]);

  // footer
  $("#explorerBtn").href = `${NET.explorer}/address/${CONTRACT}`;
  $("#addrShort").textContent = IS_DEPLOYED ? `chain ID ${NET.chainId} · ${short(CONTRACT)}` : `chain ID ${NET.chainId} · not deployed yet`;
  $("#copyAddr").onclick = async () => { try { await navigator.clipboard.writeText(CONTRACT); toast("Contract address copied"); } catch { toast(CONTRACT); } };
  $("#ghLink").href = CONFIG.GITHUB_URL;
  $("#xLink").href = CONFIG.X_URL;
  $$("#footCols .foot-col h4").forEach((h) => (h.onclick = () => h.parentElement.classList.toggle("open")));
}

async function main() {
  wire();
  mountBriefForm($('form[data-form="hero"]'));
  if (!window.opentype) toast("A script failed to load — refresh the page", 6000);
  const icons = await E.loadIcons();
  iconCache = icons.icons;
  route();
  refreshWallet();
  buildHome()
    .then(() => { const { view, section } = parseHash(); if (view === "home" && section) document.getElementById(section)?.scrollIntoView(); })
    .catch((e) => console.error(e));
  loadGallery();
  loadCount();
}
main();
