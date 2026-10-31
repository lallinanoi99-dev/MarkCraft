// Builds assets/icons.json + assets/fonts/*.woff + worker/src/icons.js from downloaded packages.
// Usage: node scripts/build-assets.mjs <dir-with-extracted-npm-packs>
import fs from "node:fs";
import path from "node:path";

const PKGS = process.argv[2];
if (!PKGS) throw new Error("pass the folder with extracted lucide-static and @fontsource packs");
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const find = (prefix) => {
  const d = fs.readdirSync(PKGS).find((n) => n.startsWith(prefix) && !n.endsWith(".tgz"));
  if (!d) throw new Error("missing " + prefix);
  return path.join(PKGS, d, "package");
};

// ---------- icons ----------
const THEMES = {
  food: "coffee cup-soda wine beer martini croissant cake cake-slice cookie ice-cream-cone pizza sandwich salad soup utensils chef-hat cherry apple citrus grape banana carrot wheat egg fish beef popcorn candy lollipop donut milk cooking-pot glass-water hop bean leafy-green drumstick torus",
  nature: "leaf leaf-sprout sprout flower flower-2 trees tree-pine tree-deciduous palmtree sun sunrise sunset moon cloud cloud-sun snowflake mountain mountain-snow waves droplet droplets flame wind rainbow shell feather bird bug rabbit squirrel turtle cat dog fish-symbol paw-print bone clover shrub vegan earth globe orbit tent",
  tech: "cpu code code-xml terminal laptop monitor smartphone tablet server database cloud-cog wifi bluetooth radio satellite rocket bot brain-circuit circuit-board binary braces bug-off git-branch git-merge network webhook zap plug battery-charging cable chip qr-code scan-line mouse-pointer-click cursor-arrow-rays command keyboard layers layout-grid boxes package component blocks workflow app-window",
  beauty: "sparkles sparkle gem crown heart heart-handshake flower-2 scissors brush paintbrush spray-can droplet sun-medium star star-half moon-star wand-sparkles hand-heart smile glasses shirt gift ribbon venus",
  fashion: "shirt scissors ruler tag tags shopping-bag shopping-cart store gem watch glasses footprints umbrella crown",
  education: "book book-open book-marked library graduation-cap pencil pen-tool pen-line notebook-pen school backpack lightbulb lamp-desk microscope telescope atom flask-conical calculator globe-2 languages puzzle shapes presentation award medal trophy",
  health: "heart-pulse activity stethoscope pill syringe cross hospital ambulance bandage dumbbell bike footprints apple brain leaf baby hand-heart shield-plus thermometer smile salad",
  finance: "wallet coins banknote piggy-bank landmark chart-line chart-bar chart-pie trending-up trending-down receipt calculator credit-card badge-dollar-sign hand-coins scale vault briefcase building building-2 handshake shield-check lock key",
  creative: "palette paintbrush brush pen-tool pencil-ruler camera aperture film clapperboard music music-2 headphones mic guitar piano drum disc-3 image frame feather type spline shapes wand pen-nib",
  community: "users user-round users-round handshake heart-handshake message-circle messages-square megaphone home house flag map map-pin compass calendar party-popper hand smile-plus globe vote tent-tree church landmark",
  shapes: "circle square triangle hexagon octagon pentagon diamond star heart shield badge infinity hash at-sign asterisk plus x arrow-up-right chevrons-right move-up-right zap target crosshair focus orbit atom spline signature anchor key lock-keyhole box cube cone cylinder pyramid torus",
  travel: "plane car bus train-front ship sailboat bike map compass luggage hotel tent mountain palmtree anchor caravan fuel",
  misc: "sun-moon flame-kindling bell clock hourglass timer infinity send paper-plane mail inbox phone camera search eye fingerprint scan-face sticker smile laugh dice-5 gamepad-2 joystick ticket store shopping-basket truck package-check recycle factory hammer wrench drill paint-roller sofa lamp bed bath key-round",
};
const lucide = find("lucide-static");
const iconDir = path.join(lucide, "icons");
const icons = {};
const tags = {};
for (const [theme, list] of Object.entries(THEMES)) {
  for (const name of list.split(/\s+/)) {
    const f = path.join(iconDir, name + ".svg");
    if (!fs.existsSync(f)) continue;
    if (!icons[name]) {
      const svg = fs.readFileSync(f, "utf8");
      const inner = svg
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/^[\s\S]*?<svg[^>]*>/, "")
        .replace(/<\/svg>[\s\S]*$/, "")
        .replace(/\s+/g, " ")
        .replace(/> </g, "><")
        .trim();
      icons[name] = inner;
      tags[name] = [];
    }
    if (!tags[name].includes(theme)) tags[name].push(theme);
  }
}
const names = Object.keys(icons);
const lic = fs.readFileSync(path.join(lucide, "LICENSE"), "utf8");
fs.mkdirSync(path.join(ROOT, "assets"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "assets/icons.json"),
  JSON.stringify({ source: "Lucide (lucide.dev) — ISC License", viewBox: "0 0 24 24", style: "stroke", icons, tags })
);
fs.writeFileSync(path.join(ROOT, "assets/LUCIDE-LICENSE.txt"), lic);
fs.writeFileSync(
  path.join(ROOT, "worker/src/icons.js"),
  "// Generated by scripts/build-assets.mjs — allowed icon names for the plan prompt\nexport const ICON_NAMES = " +
    JSON.stringify(names) + ";\n"
);
console.log("icons:", names.length);

// ---------- fonts ----------
const FONTS = {
  "Inter": ["inter", [400, 700]],
  "Manrope": ["manrope", [400, 700]],
  "Space Grotesk": ["space-grotesk", [400, 700]],
  "DM Serif Display": ["dm-serif-display", [400]],
  "Playfair Display": ["playfair-display", [400, 700]],
  "Fraunces": ["fraunces", [400, 700]],
  "Syne": ["syne", [400, 700]],
  "Outfit": ["outfit", [400, 700]],
  "Sora": ["sora", [400, 700]],
  "Bricolage Grotesque": ["bricolage-grotesque", [400, 700]],
  "Pacifico": ["pacifico", [400]],
  "Archivo Black": ["archivo-black", [400]],
};
const outDir = path.join(ROOT, "assets/fonts");
fs.mkdirSync(outDir, { recursive: true });
const manifest = {};
for (const [family, [slug, weights]] of Object.entries(FONTS)) {
  const pkg = find("fontsource-" + slug + "-");
  manifest[family] = {};
  for (const w of weights) {
    const src = path.join(pkg, "files", `${slug}-latin-${w}-normal.woff`);
    if (!fs.existsSync(src)) { console.warn("missing", src); continue; }
    const dst = `${slug}-${w}.woff`;
    fs.copyFileSync(src, path.join(outDir, dst));
    manifest[family][w] = "assets/fonts/" + dst;
  }
  const licFile = ["LICENSE", "LICENSE.md", "OFL.txt"].map((n) => path.join(pkg, n)).find(fs.existsSync);
  if (licFile) fs.copyFileSync(licFile, path.join(outDir, `${slug}-LICENSE.txt`));
}
fs.writeFileSync(path.join(ROOT, "assets/fonts.json"), JSON.stringify(manifest, null, 1));
console.log("fonts:", Object.keys(manifest).length);
