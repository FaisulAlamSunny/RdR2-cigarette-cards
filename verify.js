// Acceptance checks. Usage: node verify.js [path-to-spec.txt]
const fs = require("fs"), path = require("path");
globalThis.window = globalThis;
require("./cards-data.js");
const D = globalThis.RDR2_DATA;
let fail = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };

ok(D.sets.length === 12, "12 sets");
ok(D.sets.every(s => s.cards.length === 12), "every set has exactly 12 cards");
ok(D.cards.length === 144, "total 144 cards");
ok(new Set(D.cards.map(c => c.id)).size === 144, "all IDs unique");
ok(D.cards.every(c => c.front && c.back && c.thumb && c.original), "front/back/thumb/original paths on every card");
ok(D.cards.every(c => c.region && c.pickup), "region + pickup on every card");
ok(D.cards.every(c => c.orientation === D.sets.find(s => s.slug === c.setSlug).orientation), "card orientation = set orientation");
ok(D.cards.every(c => new Set([c.thumb, c.front, c.back, c.original]).size === 4), "four distinct asset paths per card");
ok(D.cards.every(c => c.back.includes("/backs/") && c.original.includes("/originals/")), "backs/originals use correct folders");
ok(D.cards.find(c => c.id === "famous-gunslingers-05-flaco-hernandez").slug === "famous-gunslingers-05-flaco-hernandez", "example download filename");
const ex = D.cards.find(c => c.id === "famous-gunslingers-05-flaco-hernandez");
console.log("   e.g.", ex.thumb, "|", ex.original);

// Compare against the supplied spec, line by line
const specPath = process.argv[2] || "/mnt/user-data/uploads/attachment.txt";
if (fs.existsSync(specPath)) {
  const lines = fs.readFileSync(specPath, "utf8").split(/\r?\n/);
  const start = lines.findIndex(l => l.startsWith("## 20."));
  const spec = []; let set = null;
  for (let i = start; i < lines.length; i++) {
    const l = lines[i];
    let m;
    if ((m = l.match(/^### (\d+)\. (.+) \((Vertical|Horizontal)\)\s*$/))) { set = { n: +m[1], name: m[2], o: m[3].toLowerCase(), cards: [] }; spec.push(set); }
    else if ((m = l.match(/^\d+\. \*\*(.+)\*\*\s*$/))) { set.cards.push({ name: m[1] }); }
    else if ((m = l.match(/Region \/ Landmark: (.+)$/))) { set.cards[set.cards.length - 1].region = m[1].trim(); }
    else if ((m = l.match(/Exact pickup instructions: (.+)$/))) { set.cards[set.cards.length - 1].pickup = m[1].trim(); }
  }
  ok(spec.length === 12 && spec.every(s => s.cards.length === 12), "spec parsed: 12 sets x 12 cards");
  let mism = 0;
  spec.forEach((s, si) => {
    const ds = D.sets[si];
    if (ds.name !== s.name || ds.orientation !== s.o) { mism++; console.log("  set mismatch", s.name, ds.name); }
    s.cards.forEach((c, ci) => {
      const d = ds.cards[ci];
      if (d[0] !== c.name || d[1] !== c.region || d[2] !== c.pickup) { mism++; console.log("  card mismatch", s.name, ci + 1, c, d); }
    });
  });
  ok(mism === 0, "dataset matches Section 20 exactly (names, order, region, pickup, orientation)");
} else console.log("SKIP spec comparison (file not found)");

// Static layout / behaviour checks
const css = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
ok(/\.grid\.is-vertical \{ grid-template-columns: repeat\(4/.test(css), "desktop portrait = 4 per row");
ok(/\.grid\.is-horizontal \{ grid-template-columns: repeat\(3/.test(css), "desktop landscape = 3 per row");
ok(/max-width: 640px\) \{[\s\S]*?\.grid\.is-vertical, \.grid\.is-horizontal \{ grid-template-columns: minmax\(0, 1fr\)/.test(css), "mobile portrait = 1/row, landscape = single stacked column");
ok(/object-fit: contain/.test(css) && !/object-fit: (cover|fill)/.test(css), "object-fit: contain only");
ok(/prefers-reduced-motion: reduce/.test(css), "reduced-motion handled");
const backSrcWrites = (js.match(/back\.src\s*=/g) || []).length;
const inFlip = js.slice(js.indexOf("function flip()"), js.indexOf("function download()"));
ok(backSrcWrites === 2 && (inFlip.match(/back\.src\s*=/g) || []).length === 2, "HD back src assigned only inside flip()");
ok(!/c\.back|\.back\b/.test(js.replace(inFlip, "").replace(/faceBack|face-back|fetchedBacks/g, "")), "no other code references a back path");
ok(/S\.list = bySet\[c\.setSlug\]/.test(js) && /S\.list\.length/.test(js), "Previous/Next uses the active set's list");
ok(/setLocation\(false\)[\s\S]{0,60}else closeViewer/.test(js), "Escape closes location first, then modal");
ok(!/\.innerHTML\s*=.*pickup|innerHTML.*c\.region/.test(js), "location text never goes through innerHTML");
process.exit(fail ? 1 : 0);
