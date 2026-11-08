// 阅读库的文章登记表：首页列表、文章页标题区、分类、日期、标签、翻页都读这里。
// 新增一篇：在 src/notes/<slug>.astro 写正文，再在 NOTES 里加一条，slug 和文件名一致。
// 字段缺失、分类或类型写错、文件和登记对不上，构建直接失败（validate）。

// 分类：tint 是纸色 e1…e6（base.css），只用于色条和底色
export const CATS = [
  { id: "tech", name: "技术", tint: "e5", head: "工具、协议、系统是怎么运作的" },
  { id: "work", name: "工作", tint: "e4", head: "做事的方法和流程" },
  { id: "learn", name: "学习", tint: "e2", head: "学科知识和概念" },
  { id: "life", name: "生活", tint: "e6", head: "钱、健康、日常决定" },
];

// 内容类型：决定正文必须有哪几节（按顺序，中间可以加别的节）；need 是这一节必须用到的组件
export const TYPES = {
  concept: {
    name: "概念",
    sections: [
      { id: "why", need: [] },
      { id: "core", need: ["bgrid"] },
      // “怎么运作”必须有分步小动画（2026-11-08 用户：可以交互、有利于理解的内容要做成动画，和 KMS 一章的动画类似）
      { id: "how", need: ["anim"] },
      { id: "example", need: ["code|tbl-wrap"] },
      { id: "pitfalls", need: ["bgrid"] },
      { id: "sources", need: ["sources"] },
    ],
  },
  howto: {
    name: "操作",
    sections: [
      { id: "when", need: [] },
      { id: "prep", need: [] },
      { id: "steps", need: ["steps"] },
      { id: "verify", need: [] },
      { id: "trouble", need: ["tbl-wrap|bgrid"] },
      { id: "sources", need: ["sources"] },
    ],
  },
  compare: {
    name: "对比",
    sections: [
      { id: "what", need: ["bgrid"] },
      { id: "table", need: ["tbl-wrap"] },
      { id: "choose", need: ["vs"] },
      { id: "pitfalls", need: ["bgrid"] },
      { id: "sources", need: ["sources"] },
    ],
  },
};

// 专题在 topics.js

export const NOTES = [
  {
    slug: "2026-11-08-https", date: "2026-11-08", cat: "tech", type: "concept",
    title: "HTTPS 是怎么保证安全的",
    desc: "地址栏的小锁到底保证了什么：一次 TLS 握手怎么在不安全的网络上商量出只有双方知道的密钥，浏览器怎么确认对方是真网站，以及它保证不了什么。",
    lede: "打开一个网站，浏览器和服务器之间隔着路由器、运营商、各种中转。HTTPS 让这条路上的任何人都看不到、改不了你们之间的内容，还能确认对面就是你要找的网站。这篇讲它靠什么做到，以及小锁没保证的事。",
    tldr: "HTTPS = HTTP + TLS。TLS 握手用临时公钥让双方算出同一把会话密钥（中间人只看得到公钥，算不出密钥），用证书和信任链确认对方是真网站，之后所有内容用这把密钥加密。它保护传输过程，不保证网站本身可信。",
    tags: ["HTTPS", "TLS", "证书"],
  },
  {
    slug: "2026-11-08-github-pages", date: "2026-11-08", cat: "tech", type: "howto",
    title: "用 GitHub Pages 发布静态网页",
    desc: "免费账户怎么把一个文件夹变成随时能打开的网址；本地正常、上线 404 的常见原因；一台电脑上用两个 GitHub 账号推送。",
    lede: "把仓库里的 HTML 文件原样放到一个网址上，手机、电脑随时打开。免费、不用服务器，但有几处和本地双击打开不一样。",
    tldr: "免费账户只能从公开仓库发布，发布出去的网站任何人都能看到；网址是 <code>https://用户名.github.io/仓库名/</code>，保存设置后要等一两分钟才能打开。",
    tags: ["GitHub", "Git", "SSH"],
    foot: "GitHub 的界面和账户政策会变，以官方文档为准。",
  },
];

const catOf = (id) => CATS.find((c) => c.id === id);
export { catOf };

export function fmtDate(d) {
  const [y, m, day] = d.split("-");
  return `${y} 年 ${+m} 月 ${+day} 日`;
}

// 新的在前；同一天按标题排
export function sortedNotes() {
  return NOTES.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title, "zh")));
}

// files：src/notes/ 下的文件名（不含 .astro）。登记和文件必须一一对应
export function validate(files) {
  const errs = [], seen = new Set();
  for (const n of NOTES) {
    const id = n.slug || "(缺 slug)";
    for (const k of ["slug", "date", "cat", "type", "title", "desc", "lede", "tldr"]) if (!n[k]) errs.push(`${id} 缺 ${k}`);
    if (n.slug && !/^\d{4}-\d{2}-\d{2}-[a-z0-9]+(-[a-z0-9]+)*$/.test(n.slug)) errs.push(`${id} 的 slug 要是“日期-小写英文短名”`);
    if (n.date && !/^\d{4}-\d{2}-\d{2}$/.test(n.date)) errs.push(`${id} 的 date 要是 YYYY-MM-DD`);
    if (n.slug && n.date && !n.slug.startsWith(n.date)) errs.push(`${id} 的 slug 前缀和 date 不一致`);
    if (!catOf(n.cat)) errs.push(`${id} 的 cat “${n.cat}” 不在 CATS 里`);
    if (!TYPES[n.type]) errs.push(`${id} 的 type “${n.type}” 不在 TYPES 里`);
    if (n.tags && !Array.isArray(n.tags)) errs.push(`${id} 的 tags 要是数组`);
    if (seen.has(n.slug)) errs.push(`${id} 重复登记`);
    seen.add(n.slug);
    if (!files.includes(n.slug)) errs.push(`${id} 没有对应的 src/notes/${n.slug}.astro`);
  }
  for (const f of files) if (!seen.has(f)) errs.push(`src/notes/${f}.astro 没有登记在 src/lib/notes.js`);
  if (errs.length) throw new Error("文章登记有误：\n  " + errs.join("\n  "));
}
