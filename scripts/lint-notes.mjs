// 文章正文的静态检查（npm run build 第一步，GitHub Actions 里也跑）：保证每篇“只是内容不同”
//   - 只从 ../components/index.js 和 ../lib/anim.js 导入
//   - 正文顶层只有 <Section>，不嵌套；组件只用 index.js 里导出的
//   - 普通标签只用 p ul ol li b strong em code a br h3；表格行只在 <Table> 里，<svg> 只在 <Diagram> 里
//   - 不写 style、class（SVG 的语义类和数字列 class="n" 除外）、颜色、字号、尺寸、事件属性
//   - 链接不以 / 开头；正文不用“左边 / 右边”指代卡片和图
// 节是否齐全、顺序、每节用到的组件，由 src/layouts/Article.astro 在构建时查
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "src/notes");
const IMPORTS = new Set(["../components/index.js", "../lib/anim.js"]);
const COMPONENTS = new Set(fs.readFileSync(path.join(ROOT, "src/components/index.js"), "utf8").match(/as (\w+) \}/g).map((s) => s.slice(3, -2)));
const HTML = new Set(["p", "ul", "ol", "li", "b", "strong", "em", "code", "a", "br", "h3"]);
const ROWS = new Set(["tr", "th", "td"]);
const SVG = new Set(["svg", "defs", "marker", "path", "rect", "line", "text", "tspan", "g", "circle", "polyline", "polygon"]);
const SVG_CLS = new Set(["d-box", "d-line", "d-head", "d-t", "b", "s", "m", "atk", "def", "ok", "doubt", "soft", "dash", "halo"]);
const BAD_ATTR = /\s(style|fill|stroke|stroke-width|stroke-dasharray|color|bgcolor|align|font-family|font-size|font-weight|opacity|on\w+)\s*=/i;

let errs = 0;
const err = (f, m) => { errs++; console.log(`FAIL src/notes/${f}: ${m}`); };

// 把 {…} 表达式换成 {}，表达式里的字符串单独检查
function splitExpr(s) {
  let out = "", expr = "", depth = 0;
  for (const ch of s) {
    if (ch === "{") { if (depth++ === 0) { out += "{"; continue; } }
    if (ch === "}" && depth > 0) { if (--depth === 0) { out += "}"; continue; } }
    if (depth) expr += ch; else out += ch;
  }
  return [out, expr];
}

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".astro")).sort()) {
  const src = fs.readFileSync(path.join(DIR, f), "utf8");
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) { err(f, "要以 --- frontmatter --- 开头"); continue; }
  const [, front, rawBody] = m;
  for (const im of front.matchAll(/\bfrom\s+["']([^"']+)["']/g)) if (!IMPORTS.has(im[1])) err(f, `不能从 ${im[1]} 导入，只能用 ${[...IMPORTS].join("、")}`);
  const [body, expr] = splitExpr(rawBody.replace(/<!--[\s\S]*?-->/g, ""));
  for (const [where, s] of [["frontmatter", front], ["组件参数", expr]]) {
    if (/\b(style|class)\s*=/.test(s)) err(f, `${where}的字符串里写了 style= 或 class=，版面只能由组件决定`);
    if (/<\s*(script|style|div|span|section|table|img|iframe|font)\b/i.test(s)) err(f, `${where}的字符串里有 <script> <div> <span> <table> 这类标签，只能用 b、code、a、br 等行内标签`);
  }
  const stack = [];
  for (const t of body.matchAll(/<(\/?)([A-Za-z][\w.-]*)((?:\s[^>]*?)?)(\/?)>/g)) {
    const [, close, name, attrs, self] = t, low = name.toLowerCase(), inSvg = stack.includes("svg"), top = stack[stack.length - 1];
    if (close) {
      const i = stack.lastIndexOf(name);
      if (i < 0) err(f, `多余的 </${name}>`); else stack.length = i;
      continue;
    }
    if (!stack.length && name !== "Section") err(f, `正文顶层只能是 <Section>，这里是 <${name}>`);
    if (name === "Section" && stack.includes("Section")) err(f, "Section 不能嵌套");
    if (/^[A-Z]/.test(name)) { if (!COMPONENTS.has(name)) err(f, `没有 <${name}> 这个组件，可用的见 src/components/index.js`); }
    else if (inSvg || low === "svg") {
      if (!SVG.has(low)) err(f, `SVG 里不能用 <${low}>`);
      if (low === "svg" && top !== "Diagram") err(f, "<svg> 要直接放在 <Diagram> 里");
    } else if (ROWS.has(low)) { if (!stack.includes("Table")) err(f, `<${low}> 只能放在 <Table> 里`); }
    else if (!HTML.has(low)) err(f, `不能直接写 <${low}>，用组件（表格用 <Table>，提示用 <Note>，卡片用 <Card>）`);
    if (BAD_ATTR.test(attrs)) err(f, `<${name}> 写了样式、颜色、字号或事件属性`);
    const cls = (attrs.match(/\sclass="([^"]*)"/) || [])[1];
    if (cls != null) {
      if (inSvg) cls.split(/\s+/).filter(Boolean).forEach((c) => { if (!SVG_CLS.has(c)) err(f, `SVG 的 class “${c}” 不是语义类（d-box d-line d-head d-t 和修饰 ${[...SVG_CLS].slice(4).join(" ")}）`); });
      else if (!((low === "td" || low === "th") && cls === "n")) err(f, `<${name}> 不能写 class（只有表格数字列可以写 class="n"）`);
    }
    if (/\s(width|height)\s*=/.test(attrs) && (!inSvg || low === "svg")) err(f, `<${name}> 写了 width / height`);
    if (low === "svg") for (const a of ["viewBox", "role=\"img\"", "aria-label"]) if (!attrs.includes(a)) err(f, `<svg> 要有 ${a}`);
    const href = (attrs.match(/\shref="([^"]*)"/) || [])[1];
    if (href && href.startsWith("/")) err(f, `链接 ${href} 以 / 开头，在 Pages 上会指到域名根目录`);
    if (!self && !["br", "path", "rect", "line", "circle", "polyline", "polygon"].includes(low)) stack.push(name);
  }
  if (stack.length) err(f, `有没闭合的 <${stack.join("> <")}>`);
  const text = body.replace(/<svg[\s\S]*?<\/svg>/g, "");
  if (/(左边|右边|左侧|右侧)的?(卡片|框|表格?|图)/.test(text + expr)) err(f, "正文用“左边 / 右边”指代卡片或图，手机上它们是上下排的");
}
console.log(`正文检查：${fs.readdirSync(DIR).filter((x) => x.endsWith(".astro")).length} 篇，${errs} 处错误`);
process.exit(errs ? 1 : 0);
