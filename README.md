# Markcraft

**An AI logo maker that never gives you a broken result.** Describe your brand and get 6 concepts — 4 polished template logos plus 2 original marks drawn by AI. Edit one, preview it on mockups, download a brand kit, and claim proof that you made it on **BOT Chain**.

- Live site: `https://YOUR_DOMAIN` *(fill in after GitHub Pages deploy)*
- Contract (BOT Chain mainnet, chain ID 677): `0x32eadc612ccCA3b5915223033369f5c6cb7422Cb` — https://scan.botchain.ai/address/0x32eadc612ccCA3b5915223033369f5c6cb7422Cb

> A claim proves who registered **this exact file** first, and when. It is **not** a trademark registration. Check trademarks before using a logo commercially.

---

## How it works

1. **Plan** — the brief goes to the Worker (`POST /logo/plan`). Claude returns JSON for 6 concepts: name, reason, kind (`template` | `custom`), icon (from the bundled list only), font (from the 12 curated fonts only), a 3-colour palette, layout and — for custom concepts — a one-line mark idea. The response is schema-checked (structured outputs) and every field is clamped again on the Worker.
2. **Draw** — for each AI original, `POST /logo/mark` asks Claude for one flat SVG mark in `viewBox="0 0 100 100"` (2–3 palette colours, ≤ ~12 shapes, no text, no gradients).
3. **Check & clean** (in the browser, `cleanSvg` in `assets/engine.js`) — see below. On failure: one retry, then a template concept steps in with the note *"Swapped in a template for this one"*.
4. **Render** — templates are built in the browser from Lucide icon paths + text converted to vector paths with opentype.js, so the SVG looks identical everywhere and needs no fonts installed.
5. **Fingerprint** — SHA-256 of the exported SVG (only normalisation: strip BOM, CRLF → LF, trim). The same function runs on the Verify page.

### Variety
- **Generated marks** (`GENERATORS` in `engine.js`): radial burst, Bauhaus tiles, cut monogram, dot-grid letter, striped shape. Drawn by code from the brand name + a seed, so they're always valid and unique; 🎲 *New variation* in the editor changes the seed. They also replace an AI mark that fails its checks.
- **Name styles**: plain, two-tone, mixed weight, stacked. **Emblem layout**: a seal with the name set around the top and the tagline around the bottom.
- **Variety rule**: each set of 6 is picked to differ in mark type, layout, font style (serif / sans / script / display), colour temperature and name style. A generator never repeats in a set, and no layout appears more than twice. AI plans get the same check afterwards (`diversify`).

### Textures
Editor → **Texture** tab: None · Rough edges · Gouache · Watercolour · Risograph · Ink stamp, with a strength slider.
- **Rough edges** re-draws every outline as a slightly wobbly real vector path (`roughen` in `engine.js`). It's deterministic, so it becomes part of the master SVG and its fingerprint.
- **Paint textures** are SVG filters (`applyTexture`). They're added as extra files — `textured/` in the brand kit (SVG + 2048 px PNGs) and *Download → Textured version*. The clean SVG stays the master you claim, because some design apps and print shops ignore SVG filters. Favicons and the app icon stay clean.

If the Worker is down, rate-limited, or not configured, the browser builds 6 template concepts from the brief on its own and shows *"AI is resting — here are template ideas"*.

### How the SVG is cleaned
The AI's SVG is parsed with `DOMParser` and a **new** SVG is rebuilt from scratch:
- **Elements kept:** `svg, g, path, circle, ellipse, rect, polygon, polyline, line`. Anything else is dropped with its whole subtree (`script`, `style`, `text`, `image`, `foreignObject`, `defs`, gradients, nested `svg`, `a`…).
- **Attributes kept:** `d, cx, cy, r, rx, ry, x, y, width, height, points, x1, y1, x2, y2, fill, stroke, stroke-width, stroke-linecap, stroke-linejoin, opacity, transform` (+ `viewBox` on the root). Each value must match a strict pattern: numbers only for geometry, path-command characters only for `d`, `translate/scale/rotate/matrix/skew` only for `transform`, and **hex colours only** (or `none`) for `fill`/`stroke`. Anything containing `url(`, `javascript:`, quotes, `<`, `>` or `;` is dropped. All `on*` event attributes, `style`, `class`, `href`, `filter`, `mask`, `clip-path` are dropped.
- **Rejected if:** > 8 KB, > 40 elements, no shapes left, or the mark is empty / mostly off the 0–100 canvas (measured with `getBBox`).
- The root `viewBox` is mapped onto a 0–100 box with a single `transform`.

Run the tests: open `/tests.html` on the local server — 23 cases (scripts, event handlers, hrefs, gradients, named colours, text/image/foreignObject, oversize, too many elements, off-canvas, malformed XML…).

---

## Project layout

```
index.html            single page: home (10 sections) + #/create, #/edit, #/verify, #/mine
404.html              GitHub Pages redirect: /verify?claim=24 → /#/verify?claim=24
assets/
  config.js           ← contract address, Worker URL, network (one place to edit)
  app.js              router, brief, concept grid, editor, mockups, wallet, claim, verify, gallery
  engine.js           palettes, renderer (opentype.js text→paths), cleanSvg, SHA-256, exports, brand kit ZIP
  blocklist.js        famous-brand block list (copy of worker/src/blocklist.js)
  icons.json          328 Lucide icons (generated)
  fonts/ fonts.json fonts.css   12 OFL fonts as WOFF (generated)
  art/                original painted SVG illustrations
contracts/
  MarkcraftClaims.sol the claims contract
  test-claims.mjs     local test (solc + ganache), 17 checks
worker/
  src/index.js        /logo/plan, /logo/mark, /upload
  src/blocklist.js    brand block list
  src/icons.js        allowed icon names (generated)
scripts/build-assets.mjs   rebuilds icons.json, fonts and worker/src/icons.js
tests.html / tests.js       SVG check & clean tests
```

## Run locally

```bash
python3 -m http.server 5173
```
Open http://localhost:5173. Without a Worker URL the app runs in template-only mode, which is handy for UI work. Tests: http://localhost:5173/tests.html

## Deploy

### 1. Contract (Remix)
1. Open https://remix.ethereum.org, paste `contracts/MarkcraftClaims.sol`, compile with **0.8.24**, optimizer on (200). If the chain rejects the deploy with an invalid-opcode error, set **EVM version → paris** under Advanced.
2. Testnet first: MetaMask network *BOT Chain Testnet* — chain ID **968**, RPC `https://rpc.bohr.life`, explorer `https://scan.bohr.life`. Deploy, then set `NETWORK: "testnet"` and `TESTNET_CONTRACT_ADDRESS` in `assets/config.js` and try a full claim → verify.
3. Mainnet: chain ID **677**, RPC `https://rpc.botchain.ai`, explorer `https://scan.botchain.ai`. Deploy, paste the address into `CONTRACT_ADDRESS`, set `NETWORK: "mainnet"`, and add it to the top of this README.
4. Optional: verify the source on scan.botchain.ai.

Local contract test (needs `npm i solc@0.8.24 ganache@7.9.2 ethers@6.13.4` in any folder):
```bash
node contracts/test-claims.mjs contracts/MarkcraftClaims.sol assets/config.js
```

### 2. Worker (Cloudflare)
```bash
cd worker
npm install
npx wrangler kv namespace create RATE        # paste the id into wrangler.toml and uncomment the block
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put PINATA_JWT           # for the optional public gallery (IPFS)
npx wrangler deploy
```
Set `ALLOWED_ORIGINS` in `wrangler.toml` to your site's origin(s) and paste the Worker URL into `WORKER_URL` in `assets/config.js`. If you already have the shared Week 1 Worker, copy the three routes and the two helper files into it instead.

Limits per IP per day: 10 plans, 30 marks, 20 uploads. Inputs are capped (name 24, tagline 60, what 120, ≤ 2 vibes/colours). Famous brand names are refused. Claude refusals and API errors return an error, and the browser falls back to templates.

### 3. Site (GitHub Pages)
Push the repo, enable Pages (branch `main`, root). Add your custom domain in Settings → Pages (and a `CNAME` file). Then fill in `GITHUB_URL` in `config.js`.

## Contract

```solidity
struct Claim { address creator; bytes32 svgHash; string brand; uint8 style; string cid; uint64 at; }
function claim(bytes32 svgHash, string brand, uint8 style, string cid) returns (uint256 id)
getClaim(id) · claimOfHash(hash) · claimsOf(creator) · getGallery(from, count) · galleryCount() · total()
event Claimed(uint256 indexed id, address indexed creator, bytes32 svgHash, string brand)
```
- One claim per exact file hash (first come). IDs start at 1 (`0` = no claim).
- Brand 1–48 bytes, `style` 0–15 (0–6 = Minimal … Retro, 7 = Classic), `cid` ≤ 100 bytes and may be empty (not in the gallery).
- No tokens, no payments, no admin.

## Before launch — to-do
- [x] Deploy contract to mainnet and fill in `config.js` + this README
- [ ] Deploy the Worker, set secrets, KV and `ALLOWED_ORIGINS`
- [ ] Replace `assets/botchain-logo.svg` with the official BOT Chain logo
- [ ] Confirm the native-currency symbol for BOT Chain in `config.js` (used when MetaMask adds the network)
- [ ] Set `GITHUB_URL`, custom domain, demo clip, X post tagging @BOTChain_ai

## Licences
Code: MIT. Icons: Lucide (ISC). Fonts: SIL OFL 1.1. See [CREDITS.md](CREDITS.md).
