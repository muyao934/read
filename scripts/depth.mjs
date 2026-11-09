// 内容深度的下限（npm run build 最后一步）：量构建出来的文章和专题章节，不够的列出来。
// 2026-11-09 用户：“写的内容要有深度”。参照 kms.html（正文约 1.1 万汉字、13 节、5 个动画）和币安事件页（约 7700 汉字）。
// 下限只防内容太单薄，达标不等于有深度（见 CLAUDE.md“写的内容要有深度”）。
// 默认只报告；加 --strict 时不达标就退出码 1，构建失败、不发布。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const STRICT = process.argv.includes("--strict");
const MIN = {
  chapter: { secs: 8, anims: 3, pits: 5, srcs: 6, han: 6000 },
  note: { secs: 6, anims: 0, pits: 0, srcs: 5, han: 3000 },
};
const NAME = { secs: "节", anims: "动画", pits: "误区", srcs: "来源", han: "汉字" };

const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const cjk = (s) => (s.match(/[一-鿿]/g) || []).length;
const sec = (art, id) => (art.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`)) || [""])[0];

function measure(file) {
  const s = fs.readFileSync(file, "utf8");
  if (s.includes('http-equiv="refresh"')) return null;   // 合并掉的旧章节，跳转页
  const art = (s.match(/<article class="article">([\s\S]*)<\/article>/) || [, ""])[1];
  // 动画的每一步说明在 data-anim 里，也是读者读到的正文
  const anim = [...art.matchAll(/\sdata-anim="([^"]*)"/g)].map((m) => JSON.parse(unesc(m[1])).s.map((x) => x.c).join("")).join("");
  const text = unesc(art.replace(/\sdata-anim="[^"]*"/g, "").replace(/<[^>]+>/g, ""));
  return {
    secs: (art.match(/<section\b/g) || []).length,
    anims: (art.match(/class="anim"/g) || []).length,
    pits: (sec(art, "pitfalls").match(/class="bit"/g) || []).length,
    srcs: (sec(art, "sources").match(/<li>/g) || []).length,
    han: cjk(text) + cjk(anim),
  };
}

const files = [];
for (const d of ["notes", "topics"]) {
  (function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p); else if (p.endsWith(".html")) files.push(p);
    }
  })(path.join(DIST, d));
}

let short = 0;
for (const f of files.sort()) {
  const rel = path.relative(DIST, f).split(path.sep).join("/");
  if (/^topics\/[^/]+\.html$/.test(rel)) continue;   // 专题首页
  const m = measure(f);
  if (!m) continue;
  const min = MIN[rel.startsWith("topics/") ? "chapter" : "note"];
  const miss = Object.keys(min).filter((k) => m[k] < min[k]);
  if (miss.length) short++;
  const cell = (k) => `${NAME[k]} ${m[k]}${m[k] < min[k] ? `（要 ${min[k]}）` : ""}`;
  console.log(`${miss.length ? "不够" : "达标"}  ${rel}  ` + Object.keys(min).filter((k) => min[k] > 0).map(cell).join("  "));
}
console.log(`内容深度：${files.length ? short : 0} 篇不够下限${STRICT ? "" : "（只报告，不影响构建）"}`);
process.exit(STRICT && short ? 1 : 0);
