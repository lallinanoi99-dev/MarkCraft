import { cleanSvg, sha256Hex } from "./assets/engine.js";
const S = (body, vb = "0 0 100 100") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const many = (n) => Array.from({ length: n }, (_, i) => `<circle cx="${10 + (i % 8) * 10}" cy="${10 + Math.floor(i / 8) * 10}" r="3" fill="#123456"/>`).join("");
const cases = [
  ["valid simple mark", S('<circle cx="50" cy="50" r="30" fill="#EF7B43"/><rect x="40" y="20" width="20" height="60" fill="#1A1A1A"/>'), true],
  ["script element removed", S('<script>alert(1)</script><circle cx="50" cy="50" r="30" fill="#EF7B43"/>'), true, (r) => !r.inner.includes("script")],
  ["onload / onclick attributes removed", S('<circle onload="alert(1)" onclick="x()" cx="50" cy="50" r="30" fill="#EF7B43"/>'), true, (r) => !/on(load|click)/.test(r.inner)],
  ["style element + style attr removed", S('<style>*{fill:red}</style><circle style="fill:url(#x)" cx="50" cy="50" r="30" fill="#000000"/>'), true, (r) => !r.inner.includes("style")],
  ["href / xlink:href removed", '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100"><a href="javascript:alert(1)"><circle cx="50" cy="50" r="30"/></a><circle xlink:href="#a" cx="50" cy="50" r="20" fill="#111111"/></svg>', true, (r) => !/href|javascript/.test(r.inner)],
  ["url(...) fill dropped (gradient)", S('<defs><linearGradient id="g"/></defs><circle cx="50" cy="50" r="30" fill="url(#g)"/>'), true, (r) => !r.inner.includes("url(") && !r.inner.includes("linearGradient")],
  ["named colour dropped (hex only)", S('<circle cx="50" cy="50" r="30" fill="red" stroke="#00ff00"/>'), true, (r) => !r.inner.includes("red") && r.inner.includes("#00ff00")],
  ["text element removed → empty", S('<text x="10" y="50">Hi</text>'), false],
  ["image element removed → empty", S('<image href="https://x.y/a.png" width="100" height="100"/>'), false],
  ["foreignObject removed", S('<foreignObject width="100" height="100"><div xmlns="http://www.w3.org/1999/xhtml">x</div></foreignObject><circle cx="50" cy="50" r="30" fill="#EF7B43"/>'), true, (r) => !r.inner.includes("foreign")],
  ["nested svg removed → empty", S(S('<circle cx="50" cy="50" r="30"/>')), false],
  ["bad path data dropped", S('<path d="M10 10 L 90 90 Z; alert(1)" fill="#000000"/><circle cx="50" cy="50" r="10" fill="#000000"/>'), true, (r) => !r.inner.includes("alert")],
  ["over 8 KB rejected", S(`<path d="M0 0 ${"L 50 50 ".repeat(1200)}Z" fill="#000000"/>`), false],
  ["over 40 elements rejected", S(many(41)), false],
  ["40 elements accepted", S(many(40)), true],
  ["empty svg rejected", S(""), false],
  ["off-canvas mark rejected", S('<circle cx="400" cy="400" r="30" fill="#EF7B43"/>'), false],
  ["viewBox 0 0 24 24 mapped to 100", S('<circle cx="12" cy="12" r="10" fill="#EF7B43"/>', "0 0 24 24"), true, (r) => r.inner.includes("scale(4.16")],
  ["malformed XML rejected", '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50"', false],
  ["not an svg root rejected", '<html><body><svg></svg></body></html>', false],
  ["CSS injection in transform dropped", S('<g transform="translate(10 10); background:url(x)"><circle cx="50" cy="50" r="30" fill="#EF7B43"/></g>'), true, (r) => !r.inner.includes("background")],
  ["filter / mask / clip-path removed", S('<circle filter="url(#f)" mask="url(#m)" clip-path="url(#c)" cx="50" cy="50" r="30" fill="#EF7B43"/>'), true, (r) => !/filter|mask|clip/.test(r.inner)],
];
const rows = document.getElementById("rows");
let pass = 0;
for (const [name, svg, expectOk, check] of cases) {
  const r = cleanSvg(svg);
  const ok = r.ok === expectOk && (!check || !r.ok || check(r));
  if (ok) pass++;
  rows.insertAdjacentHTML("beforeend", `<tr><td>${name}</td><td>${expectOk ? "accept" : "reject"}</td><td>${r.ok ? "accept" : "reject: " + r.reason}<br><code>${(r.inner || "").slice(0, 160).replace(/</g, "&lt;")}</code></td><td class="${ok ? "pass" : "fail"}">${ok ? "PASS" : "FAIL"}</td></tr>`);
}
// fingerprint normalisation
const h1 = await sha256Hex("<svg/>\r\n"), h2 = await sha256Hex("<svg/>");
const fpOk = h1 === h2;
if (fpOk) pass++;
rows.insertAdjacentHTML("beforeend", `<tr><td>fingerprint ignores CRLF / trailing newline</td><td>equal</td><td><code>${h1.slice(0, 18)}…</code></td><td class="${fpOk ? "pass" : "fail"}">${fpOk ? "PASS" : "FAIL"}</td></tr>`);
const total = cases.length + 1;
document.getElementById("sum").innerHTML = `<b class="${pass === total ? "pass" : "fail"}">${pass} / ${total} passed</b>`;
window.__testResult = { pass, total };
