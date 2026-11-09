// 专题登记表：阅读库首页的专题卡片、专题首页（topics/<id>.html）的章节列表、章节页（topics/<id>/<slug>.html）都读这里。
// 每章三种状态：
//   已写   src/topics/<id>/<slug>.astro 存在；要有 date、type、title、desc、lede、tldr（和文章同样的字段，type 决定必备的节）
//   链接   link 指向已有文章（notes/<slug>.html），不重复写；不能同时有文件
//   待写   只有 title 和 desc（这一章要讲什么）
// 登记写错、文件和登记对不上，构建直接失败。
import { NOTES, TYPES } from "./notes.js";
import { url } from "./url.js";

export const TOPICS = [
  { id: "blockchain", title: "区块链", tint: "e1", href: "blockchain/index.html",
    desc: "被盗事件编年史、大事记、诈骗与骗局，以及读懂这些事件要用的基础知识" },
  { id: "ai-coding", title: "AI 编程", sub: "Claude Code", tint: "e3",
    desc: "从大模型怎么生成代码讲起，到 Claude Code 的上下文、记忆、权限、技能和子代理",
    lede: "从大模型怎么生成代码讲起，到 Claude Code 的上下文、记忆、权限、技能和子代理。目标是弄清它为什么会这样做，从而知道怎么用好它。",
    chapters: [
      { slug: "llm-basics", title: "大模型怎么写代码", date: "2026-11-08", type: "concept",
        desc: "token、上下文窗口、为什么会编造：模型一个 token 一个 token 地写，只看得到上下文里的内容，信息缺了就用“最像”的补上。",
        lede: "用 Claude Code 时那些“它怎么又这样”：忘了前面说的事、编了一个不存在的函数、说改好了其实没好，大多能从大模型的工作原理找到原因。这一章讲三件事：它怎么一段一段写出代码，它此刻看得到什么，它为什么会编造。",
        tldr: "大模型每次只预测下一个 token，写出的每一段都接回上下文，当作下一步的输入。它只看得到上下文窗口里的内容，信息缺了不会停下，而是补上“最像”的内容，这就是编造。所以要挑好放进上下文的东西，并用测试和实测验证它的结论。",
        tags: ["LLM", "token", "上下文"] },
      { slug: "agent-loop", title: "Agent 是什么", date: "2026-11-08", type: "concept",
        desc: "模型自己不会读文件、跑命令：它说要调用什么工具，Claude Code 去执行，结果再送回来，循环到做完。",
        lede: "上一章说大模型只会一个 token 一个 token 地写字，可 Claude Code 能读文件、改代码、跑测试。这一章讲中间那一层：模型说要用什么工具，谁去执行，结果怎么回到模型手里，循环什么时候结束。",
        tldr: "模型不直接执行任何东西，只输出一段 tool_use，说要调用哪个工具、参数是什么。Claude Code 查过权限后去执行，把结果作为 tool_result 送回模型。这样一轮一轮循环，直到模型不再调用工具、直接给出回答。每一轮的调用和结果都留在上下文里。",
        tags: ["Agent", "工具调用", "Claude Code"] },
      { slug: "context-memory", title: "上下文和记忆", date: "2026-11-08", type: "concept",
        desc: "每次会话都从空白开始，能带到下一次的只有 CLAUDE.md 和自动记忆；聊久了会自动压缩，只在对话里说过的要求可能丢掉。",
        lede: "前两章说过，模型只看得到上下文里的内容，而上下文每次会话都从空白开始。这一章讲 Claude Code 靠什么记住东西：你写的 CLAUDE.md、它自己记的自动记忆，以及上下文快满时的自动压缩会留下什么、丢掉什么。",
        tldr: "新会话开始时，Claude Code 先把 CLAUDE.md（从当前目录往上找到的）和自动记忆装进上下文。聊久了上下文快满，它会把旧对话压缩成摘要：CLAUDE.md 和记忆从磁盘重读，但只在对话里说过的要求可能丢掉。所以长期要遵守的写进 CLAUDE.md，必须做到的做成检查。",
        tags: ["CLAUDE.md", "记忆", "压缩"] },
      { slug: "clear-requests", title: "把需求说清楚", date: "2026-11-08", type: "howto",
        desc: "它看不到的要你说：现象、位置、约束、怎样算做完。说清楚一次，比纠正三次省事。",
        lede: "前三章讲了模型怎么工作、它看得到什么。这一章讲你能做的最有用的一件事：把它看不到的信息告诉它。说清楚一次，通常比纠正三次省事。",
        tldr: "它读代码很快，但读不到仓库里没有的东西：你看到的现象、你要的范围、只在你脑子里的决定、怎样算做完。动手前把这几样说清楚，最好再给一个能跑出“通过 / 不通过”的检查。纠正两次还不对，就 <code>/clear</code>，把学到的写进一条新说明。",
        tags: ["需求", "提示", "Claude Code"] },
      { slug: "plan-verify", title: "先计划再动手", desc: "plan mode，以及怎么让它自己验证结果" },
      { slug: "skills", title: "Skills、斜杠命令和插件", desc: "把常用的做法打包成一句话就能调用的命令" },
      { slug: "permissions-hooks", title: "权限和 hooks", desc: "auto mode 为什么会拦、允许规则怎么配、hooks 能做什么" },
      { slug: "mcp", title: "MCP", desc: "接入外部工具和数据的统一协议" },
      { slug: "subagents", title: "子代理和工作流", desc: "并行分工、各自的上下文，以及成本" },
      { slug: "security", title: "安全", desc: "提示注入、不可信内容、密钥别进上下文" },
    ] },
  { id: "frontend", title: "前端与设计", sub: "从浏览器到动画", tint: "e4",
    desc: "浏览器怎么画出页面，排版、颜色、布局、响应式、动画和组件化",
    lede: "从浏览器怎么画出页面讲起，到排版、颜色、布局、响应式、动画和组件化。这个站本身就是例子。",
    chapters: [
      { slug: "rendering", title: "浏览器怎么画出页面", desc: "HTML、CSS、JS 从下载到显示经过了什么" },
      { slug: "typography", title: "排版", desc: "字体、字号、行高、中英文混排、齐线数字" },
      { slug: "color", title: "颜色", desc: "对比度、语义色、深浅色主题" },
      { slug: "layout", title: "布局", desc: "盒模型、Flex、Grid" },
      { slug: "responsive", title: "响应式", desc: "断点和视口：同一页在 iPhone、iPad、Mac 上怎么排" },
      { slug: "svg", title: "SVG 和示意图", desc: "viewBox、缩放、让图跟着主题变色" },
      { slug: "animation", title: "动画", desc: "transition、transform，以及怎么不卡" },
      { slug: "components", title: "组件化", desc: "React 和 Astro 的思路，静态站点怎么生成" },
      { slug: "a11y", title: "可访问性", desc: "语义标签、键盘操作、读屏软件" },
      { slug: "remotion", title: "用代码做视频", desc: "Remotion：用 React 组件生成视频" },
    ] },
  { id: "network", title: "网络与服务器", sub: "从一次请求到部署上线", tint: "e6",
    desc: "打开一个网页经过了什么，DNS、SSH、代理、Linux 服务器、部署和安全",
    lede: "从打开一个网页经过了什么讲起，到 DNS、SSH、代理、Linux 服务器、部署上线和服务器安全。",
    chapters: [
      { slug: "web-request", title: "打开一个网页经过了什么", desc: "DNS、TCP、TLS、HTTP 依次做了什么" },
      { slug: "dns", title: "DNS", desc: "域名怎么变成 IP，缓存和记录类型" },
      { slug: "ip-ports", title: "IP、端口、NAT 和防火墙", desc: "一台机器上的服务怎么被找到、被挡住" },
      { slug: "https", title: "HTTPS 和证书", desc: "握手、会话密钥、信任链，以及小锁没保证的事", link: "notes/2026-11-08-https.html" },
      { slug: "ssh", title: "SSH", desc: "密钥、config、端口转发、一台电脑用多个账号" },
      { slug: "proxy", title: "代理", desc: "正向和反向代理；开了代理后为什么会解析出奇怪的 IP" },
      { slug: "linux-basics", title: "Linux 服务器基础", desc: "用户、权限、进程、systemd、日志" },
      { slug: "deploy", title: "部署一个网站", desc: "VPS、Nginx、证书自动续期" },
      { slug: "git-github", title: "Git 和 GitHub 进阶", desc: "分支、rebase、Actions" },
      { slug: "github-pages", title: "用 GitHub Pages 发布网页", desc: "免费发布静态网页，上线 404 的常见原因", link: "notes/2026-11-08-github-pages.html" },
      { slug: "server-security", title: "服务器安全", desc: "密钥登录、防火墙、及时更新" },
    ] },
];

// 已写章节的正文：src/topics/<id>/<slug>.astro
const BODIES = import.meta.glob("../topics/*/*.astro", { eager: true });
const key = (id, slug) => `../topics/${id}/${slug}.astro`;
export const bodyOf = (id, slug) => BODIES[key(id, slug)].default;

// 带上章号、状态和链接；链接只给已写和链接两种，待写的没有
export function chaptersOf(t) {
  return t.chapters.map((c, i) => {
    const written = key(t.id, c.slug) in BODIES;
    return { ...c, n: i + 1, status: written ? "written" : c.link ? "link" : "todo",
      href: written ? url(`topics/${t.id}/${c.slug}.html`) : c.link ? url(c.link) : null };
  });
}

function validate() {
  const errs = [], ids = new Set(), noteHrefs = new Set(NOTES.map((n) => `notes/${n.slug}.html`)), used = new Set();
  for (const t of TOPICS) {
    if (!t.id || ids.has(t.id)) errs.push(`专题 id “${t.id}” 缺失或重复`);
    ids.add(t.id);
    if (!/^e[1-6]$/.test(t.tint)) errs.push(`${t.id} 的 tint 不是 e1…e6`);
    if (!t.title || !t.desc) errs.push(`${t.id} 缺 title 或 desc`);
    if (!t.chapters) { if (!t.href) errs.push(`${t.id} 要么有 chapters，要么有 href`); continue; }
    if (!t.lede) errs.push(`${t.id} 缺 lede`);
    const slugs = new Set();
    for (const c of t.chapters) {
      const id = `${t.id}/${c.slug}`, written = key(t.id, c.slug) in BODIES;
      if (!c.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.slug)) errs.push(`${id} 的 slug 要是小写英文短名`);
      if (slugs.has(c.slug)) errs.push(`${id} 重复`);
      slugs.add(c.slug); used.add(key(t.id, c.slug));
      if (!c.title || !c.desc) errs.push(`${id} 缺 title 或 desc`);
      if (written) {
        for (const k of ["date", "type", "lede", "tldr"]) if (!c[k]) errs.push(`${id} 已经写了，要有 ${k}`);
        if (c.type && !TYPES[c.type]) errs.push(`${id} 的 type “${c.type}” 不在 TYPES 里`);
        if (c.date && !/^\d{4}-\d{2}-\d{2}$/.test(c.date)) errs.push(`${id} 的 date 要是 YYYY-MM-DD`);
        if (c.link) errs.push(`${id} 已经写了正文，不能再有 link`);
      }
      if (c.link && !noteHrefs.has(c.link)) errs.push(`${id} 的 link “${c.link}” 不是已有文章`);
    }
  }
  for (const k of Object.keys(BODIES)) if (!used.has(k)) errs.push(`${k.replace("../", "src/")} 没有登记在 src/lib/topics.js`);
  if (errs.length) throw new Error("专题登记有误：\n  " + errs.join("\n  "));
}
validate();
