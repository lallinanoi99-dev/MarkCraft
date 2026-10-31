// Local test for MarkcraftClaims: node contracts/test-claims.mjs contracts/MarkcraftClaims.sol assets/config.js
// Needs: npm i solc@0.8.24 ganache@7.9.2 ethers@6.13.4
import fs from "node:fs";
import solc from "solc";
import ganache from "ganache";
import { ethers } from "ethers";
const src = fs.readFileSync(process.argv[2], "utf8");
const cfg = fs.readFileSync(process.argv[3], "utf8");
const ABI = eval("[" + cfg.split("export const ABI = [")[1].split("];")[0] + "]"); // front-end ABI
const out = JSON.parse(solc.compile(JSON.stringify({ language: "Solidity", sources: { "M.sol": { content: src } },
  settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "paris", outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } } })));
const errs = (out.errors || []).filter((e) => e.severity === "error");
(out.errors || []).forEach((e) => console.log(e.severity, e.formattedMessage.split("\n")[0]));
if (errs.length) process.exit(1);
const art = out.contracts["M.sol"].MarkcraftClaims;
const provider = new ethers.BrowserProvider(ganache.provider({ logging: { quiet: true }, chain: { hardfork: "shanghai" } }));
const [a, b] = await Promise.all([provider.getSigner(0), provider.getSigner(1)]);
const f = new ethers.ContractFactory(art.abi, art.evm.bytecode.object, a);
const c0 = await f.deploy(); await c0.waitForDeployment();
const addr = await c0.getAddress();
const c = new ethers.Contract(addr, ABI, a); // use the front-end ABI
const h = (s) => ethers.keccak256(ethers.toUtf8Bytes(s));
const ok = (cond, msg) => { console.log((cond ? "PASS " : "FAIL ") + msg); if (!cond) process.exitCode = 1; };
const expectRevert = async (p, name, msg) => { try { await p; ok(false, msg); } catch (e) { const n = e.revert?.name || (e.data && c.interface.parseError(e.data)?.name) || e.shortMessage; ok(String(n).includes(name), msg + " (" + n + ")"); } };

ok((await c.total()) === 0n, "total starts at 0");
let rc = await (await c.claim(h("logo1"), "Slow Mornings", 0, "")).wait();
const ev = rc.logs.map((l) => { try { return c.interface.parseLog(l); } catch { return null; } }).find((x) => x?.name === "Claimed");
ok(ev && ev.args.id === 1n, "first claim gets id 1 and emits Claimed");
await (await c.connect(b).claim(h("logo2"), "Pawsome", 1, "bafyTESTCID")).wait();
ok((await c.total()) === 2n, "total = 2");
await expectRevert(c.connect(b).claim.staticCall(h("logo1"), "Copycat", 0, ""), "AlreadyClaimed", "same hash cannot be claimed twice");
await expectRevert(c.claim.staticCall(ethers.ZeroHash, "X", 0, ""), "EmptyHash", "zero hash rejected");
await expectRevert(c.claim.staticCall(h("l3"), "", 0, ""), "BadBrand", "empty brand rejected");
await expectRevert(c.claim.staticCall(h("l4"), "x".repeat(49), 0, ""), "BadBrand", "brand > 48 bytes rejected");
await expectRevert(c.claim.staticCall(h("l5"), "ok", 16, ""), "BadStyle", "style > 15 rejected");
const g = await c.getClaim(2n); console.log("struct:", g.creator, await b.getAddress(), g.brand, g.cid, g.style, g.at);
ok(g.creator === (await b.getAddress()) && g.brand === "Pawsome" && g.cid === "bafyTESTCID" && Number(g.style) === 1 && g[5] > 0n, "getClaim returns full struct");
const [id, cl] = await c.claimOfHash(h("logo1"));
ok(id === 1n && cl.brand === "Slow Mornings", "claimOfHash finds claim");
const [none] = await c.claimOfHash(h("nope"));
ok(none === 0n, "claimOfHash returns 0 when unknown");
ok((await c.claimsOf(await a.getAddress())).map(Number).join() === "1", "claimsOf creator");
await (await c.claim(h("logo3"), "Third", 2, "bafyTHIRD")).wait();
const [gids, items] = await c.getGallery(0n, 10n);
ok(gids.map(Number).join() === "3,2" && items[0].cid === "bafyTHIRD", "getGallery newest-first, only with cid");
const [g2] = await c.getGallery(1n, 10n);
ok(g2.map(Number).join() === "2", "getGallery offset");
const [g3] = await c.getGallery(5n, 10n);
ok(g3.length === 0, "getGallery past end is empty");
await expectRevert(c.getClaim(0n), "NotFound", "getClaim(0) NotFound");
await expectRevert(c.getClaim(99n), "NotFound", "getClaim(99) NotFound");
console.log("bytecode bytes:", art.evm.bytecode.object.length / 2);
