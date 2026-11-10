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
      // 2026-11-09 用户：每章内容太少，合并。原 01+02 → 第 1 章，原 03+04 → 第 2 章，原 05 + 子代理 → 第 3 章
      { slug: "llm-basics", title: "大模型和 Agent 怎么工作", date: "2026-11-09", type: "concept",
        desc: "模型一个 token 一个 token 地写，只看得到上下文，缺了信息就补“最像”的；Claude Code 把它包成一个循环：模型说要调用什么工具，Claude Code 去执行，结果送回来，直到做完。",
        lede: "用 Claude Code 时那些“它怎么又这样”，大多能从两件事找到原因：大模型怎么一段一段写出东西、此刻看得到什么；以及 Claude Code 怎么把只会写字的模型，变成能读文件、改代码、跑测试的 agent。这一章先讲模型，再讲 agent 循环。",
        tldr: "大模型每次只预测下一个 token，只看得到上下文窗口里的内容，信息缺了就补上“最像”的，这就是编造。它自己不执行任何东西：要读文件、跑命令时，它输出一段 tool_use，Claude Code 查过权限后去执行，再把结果作为 tool_result 送回。这样一轮轮循环，直到它不再调用工具，每一轮都留在上下文里。所以要挑好放进上下文的东西，并用实测验证它的结论。",
        tags: ["LLM", "Agent", "工具调用"] },
      { slug: "context-memory", title: "上下文、记忆和怎么提需求", date: "2026-11-09", type: "concept",
        desc: "每次会话从空白开始，能带到下一次的只有 CLAUDE.md、规则和自动记忆，聊久了还会压缩；这一次任务才有的信息要你说清楚：现象、位置、约束、怎样算做完。",
        lede: "上一章说模型只看得到上下文里的内容。这一章讲两件相关的事：Claude Code 靠什么记住东西（CLAUDE.md、规则、自动记忆，以及上下文快满时的压缩会留下什么），和你该怎么把它看不到的信息说清楚。说清楚一次，通常比纠正三次省事。",
        tldr: "新会话开始时，Claude Code 把 CLAUDE.md 和自动记忆装进上下文；聊久了旧对话被压缩成摘要，只在对话里说过的要求可能丢掉，所以长期要遵守的写进 CLAUDE.md，必须做到的做成检查。它读代码很快，但读不到你看到的现象、你要的范围、只在你脑子里的决定、怎样算做完：动手前说清楚这几样，再给一个能跑的检查。纠正两次还不对，就 <code>/clear</code> 重说。",
        tags: ["CLAUDE.md", "记忆", "需求"] },
      { slug: "plan-verify", title: "计划、验证和分工", date: "2026-11-09", type: "concept",
        desc: "两种返工：方向错了、没真做完。动手前用 plan mode 出计划，动手后给一个能跑的检查；大范围的搜索、互不依赖的调查交给子代理，长输出不进主对话。",
        lede: "第 1 章说 agent 会一轮轮循环到做完，可“做完”由谁判断？这一章讲三件事：动手前先让它出计划，你看过再改；动手后给它一个能跑的检查，让它自己判断做没做完；以及什么时候把活分给子代理。",
        tldr: "plan mode 里它只读文件、跑探索用的命令，把计划写给你看，你批准之前不改源码，这时改方向最便宜。动手以后给它一个能跑出“通过 / 不通过”的检查，它会自己改、自己查、修到通过，再贴出证据；必须跑的检查做成 Stop hook 或 CI。子代理在自己的上下文里干活、只交回摘要，适合并行的调查、很长的输出和不带偏见的审查，代价是额外的用量。",
        tags: ["plan mode", "验证", "子代理"] },
      { slug: "extend", title: "扩展能力：Skills、插件和 MCP", date: "2026-11-09", type: "concept",
        desc: "skill 把常用的做法存成一个文件，平时只有描述占上下文；插件把一整套打包，启用了就一直在；MCP 把外部系统包成工具。碰到什么情况加什么，以及装多了会怎样。",
        lede: "前三章讲的都是 Claude Code 自带的能力。这一章讲三种往上加东西的办法：skill 把常用的做法存起来，插件把别人做好的一整套装进来，MCP 把外部系统接进来。它们什么时候进上下文、占多少地方、以谁的身份运行各不一样，这决定了该用哪一个。",
        tldr: "skill 是一个装着 SKILL.md 的文件夹：平时只有名字和描述在上下文里，你输入 /名字 或它对上描述时，全文才装进对话并一直留着。插件把 skill、子代理、hooks、MCP 打包成一个整体，启用后每次会话都在、以你的身份运行。MCP 服务器把数据库、Slack 这类外部系统包成工具，平时只占工具名。碰到具体情况再加：同一段话反复敲就写成 skill，要外部数据就接 MCP，第二个仓库要同样配置就打包成插件。",
        tags: ["Skills", "插件", "MCP"] },
      { slug: "permissions-security", title: "权限、hooks 和安全", date: "2026-11-09", type: "concept",
        desc: "一次工具调用要过几道关：PreToolUse hook、deny › ask › allow 的权限规则、权限模式（auto mode 的分类器），开了沙箱还在沙箱里跑。每一道拦得住什么、拦不住什么，以及提示注入和密钥。",
        lede: "Claude 每做一件事，执行之前都要过几道关。这一章讲清楚每一道关由谁决定：规则怎么写、auto mode 的分类器拦什么、hooks 怎么做到每次都执行、沙箱隔离什么；以及读到的内容里夹带指令时，哪一层能挡住，密钥和个人信息怎么不出仓库。",
        tldr: "一次工具调用依次过：PreToolUse hook（退出码 2 当场拦住，排在规则前面）、权限规则（固定按 deny、ask、allow 查，第一个匹配的说了算）、权限模式（auto mode 由一个看不到工具结果的分类器审查）。规则只认命令原文，换个写法就过去了；真正由操作系统强制的边界是沙箱。auto mode 减少提示但不保证安全。提示注入可能来自它读到的任何内容，所以防线不能只靠模型的判断。",
        tags: ["权限", "hooks", "安全"] },
    ],
    // 合并掉的旧章节：网址保留成跳转页，跳到合并后的章节和对应的一节
    moved: [
      { from: "agent-loop", to: "llm-basics", hash: "agent" },
      { from: "clear-requests", to: "context-memory", hash: "ask" },
    ] },
  { id: "frontend", title: "前端与设计", sub: "从浏览器到动画", tint: "e4",
    desc: "浏览器怎么画出页面，排版、颜色、布局、响应式、动画和组件化",
    lede: "从浏览器怎么画出页面讲起，到排版、颜色、布局、响应式、动画和组件化。这个站本身就是例子。",
    chapters: [
      { slug: "rendering-layout", title: "页面怎么画出来：渲染和布局", desc: "HTML、CSS、JS 从下载到显示经过了什么；盒模型、Flex、Grid" },
      { slug: "type-color", title: "排版和颜色", desc: "字体、字号、行高、中英文混排、齐线数字；对比度、语义色、深浅色主题" },
      { slug: "responsive-a11y", title: "适配每台设备、每个人", desc: "断点和视口，同一页在 iPhone、iPad、Mac 上怎么排；语义标签、键盘操作、读屏软件" },
      { slug: "graphics-motion", title: "图和动画", desc: "SVG 的 viewBox 和缩放、让图跟着主题变色；transition、transform，以及怎么不卡" },
      { slug: "components-video", title: "组件化，以及用组件做视频", desc: "React 和 Astro 的思路、静态站点怎么生成；Remotion 用 React 组件生成视频" },
    ] },
  { id: "network", title: "网络与服务器", sub: "从一次请求到部署上线", tint: "e6",
    desc: "打开一个网页经过了什么，DNS、SSH、代理、Linux 服务器、部署和安全",
    lede: "从打开一个网页经过了什么讲起，到 DNS、SSH、代理、Linux 服务器、部署上线和服务器安全。",
    chapters: [
      { slug: "web-request", title: "打开一个网页经过了什么", date: "2026-11-10", type: "concept",
        desc: "DNS 把域名变成 IP，IP 和端口找到服务，NAT 和防火墙决定连不连得上，再依次经过 TCP、TLS、HTTP；每一步花几个来回，以及本站的实测数据。",
        lede: "在地址栏敲一个网址、回车，一秒左右页面就出来了。这一章跟着这一次请求走一遍：DNS 怎么把域名变成 IP，包怎么找到那台机器上的那个服务，NAT 和防火墙为什么让外面连不进来，TCP、TLS、HTTP 各花几个来回，以及为什么第二次打开更快。",
        tldr: "打开一个新网站，先查 DNS 把域名变成 IP（解析器一层层问根、顶级域、权威服务器，答案按 TTL 缓存），再 TCP 握手、TLS 握手、发 HTTP 请求，各一个来回，所以离服务器越远越慢，带宽省不掉这几个来回。之后的请求复用同一条连接，省掉握手。家里的电脑在 NAT 后面，能连出去，外面默认连不进来；一个服务谁连得上，还要看它监听在哪个地址。",
        tags: ["DNS", "TCP", "HTTP"] },
      { slug: "https", title: "HTTPS 和证书", desc: "握手、会话密钥、信任链，以及小锁没保证的事", link: "notes/2026-11-08-https.html" },
      { slug: "ssh-proxy", title: "SSH 和代理", desc: "密钥、config、端口转发、一台电脑用多个账号；正向和反向代理，开了代理后为什么会解析出奇怪的 IP" },
      { slug: "linux-server", title: "管一台 Linux 服务器", desc: "用户、权限、进程、systemd、日志；用 Nginx 部署网站、证书自动续期；密钥登录、防火墙、及时更新" },
      { slug: "git-github", title: "Git 和 GitHub", desc: "分支、rebase、Actions" },
      { slug: "github-pages", title: "用 GitHub Pages 发布网页", desc: "免费发布静态网页，上线 404 的常见原因", link: "notes/2026-11-08-github-pages.html" },
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
    // 合并掉的旧章节：网址保留成跳转页（pages/topics/[topic]/[slug].astro），跳到合并后的章节
    for (const m of t.moved || []) {
      if (slugs.has(m.from)) errs.push(`${t.id}/${m.from} 已经是章节，不能再是跳转`);
      if (!(key(t.id, m.to) in BODIES)) errs.push(`${t.id}/${m.from} 跳到的 ${m.to} 不是已写的章节`);
    }
  }
  for (const k of Object.keys(BODIES)) if (!used.has(k)) errs.push(`${k.replace("../", "src/")} 没有登记在 src/lib/topics.js`);
  if (errs.length) throw new Error("专题登记有误：\n  " + errs.join("\n  "));
}
validate();
