// 内容结构的下限（npm run build 最后一步）：量构建出来的文章和专题章节，缺了该有的部分就列出来。
// 不量字数（2026-11-09 用户：“不要有这种汉字要求的下限，没有任何意义”）。只查几样结构：节、分步动画、误区、来源。
// 达标不等于有深度，深度按 CLAUDE.md“写的内容要有深度”自查。加 --strict 时不达标就退出码 1，构建失败、不发布。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const STRICT = process.argv.includes("--strict");
const MIN = {
  chapter: { secs: 8, anims: 3, pits: 5, srcs: 6 },
  note: { secs: 6, srcs: 5 },
};
const NAME = { secs: "节", anims: "分步动画", pits: "误区", srcs: "来源" };
const sec = (art, id) => (art.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`)) || [""])[0];

function measure(file) {
  const s = fs.readFileSync(file, "utf8");
  if (s.includes('http-equiv="refresh"')) return null;   // 合并掉的旧章节，跳转页
  const art = (s.match(/<article class="article"[^>]*>([\s\S]*)<\/article>/) || [, ""])[1];   // 正文栏带 id="main-content"（“跳到正文”的目标）
  return {
    secs: (art.match(/<section\b/g) || []).length,
    anims: (art.match(/class="anim"/g) || []).length,
    pits: (sec(art, "pitfalls").match(/class="bit"/g) || []).length,
    srcs: (sec(art, "sources").match(/<li>/g) || []).length,
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

let short = 0, n = 0;
for (const f of files.sort()) {
  const rel = path.relative(DIST, f).split(path.sep).join("/");
  if (/^topics\/[^/]+\.html$/.test(rel)) continue;   // 专题首页
  const m = measure(f);
  if (!m) continue;
  n++;
  const min = MIN[rel.startsWith("topics/") ? "chapter" : "note"];
  const miss = Object.keys(min).filter((k) => m[k] < min[k]);
  if (miss.length) short++;
  console.log(`${miss.length ? "缺" : "齐"}  ${rel}  ` + Object.keys(min).map((k) => `${NAME[k]} ${m[k]}${m[k] < min[k] ? `（要 ${min[k]}）` : ""}`).join("  "));
}
console.log(`内容结构：${n} 篇，${short} 篇缺了该有的部分${STRICT ? "" : "（只报告，不影响构建）"}`);
process.exit(STRICT && short ? 1 : 0);
