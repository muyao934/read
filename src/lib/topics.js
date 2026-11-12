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
      { slug: "rendering-layout", title: "页面怎么画出来：渲染和布局", date: "2026-11-10", type: "concept",
        desc: "从收到 HTML 到第一次显示经过哪几步，什么挡住显示、什么挡住解析；盒模型和外边距合并；Flex 怎么分空间、Grid 的 1fr 为什么会被撑破；改了样式以后哪几步要重做。数字都在本机 Chrome 里实测。",
        lede: "这个站的流程块箭头在 iPad 上伸出了正文栏，卡片网格要写 minmax(0, 1fr)，head 最前面有一段读主题的小脚本。这些都是浏览器怎么画页面的直接后果。这一章从收到 HTML 讲到第一次显示，再讲盒模型、Flex、Grid 怎么算尺寸，以及改了样式以后哪几步要重做。",
        tldr: "浏览器把 HTML 解析成 DOM，算出每个元素的样式，布局算出位置大小，绘制写出指令清单，合成线程变成像素。实测这一页解析只要 2 ms，布局和 PrePaint 要 60 ms。head 里的样式表挡住显示，普通脚本挡住解析还要等前面的样式表；defer、async、module 不挡。box-sizing 默认只算内容；竖直外边距合并取大的。flex: 1 和 grid 的 1fr 都带着“不比内容最小尺寸窄”的底线，长网址能撑破，要写 min-width: 0 或 minmax(0, 1fr)。改 width 要重排但只碰受影响的几个对象；已有的 transform、opacity 改值只走合成。",
        tags: ["渲染", "CSS 布局", "Flex"] },
      { slug: "type-color", title: "排版和颜色", date: "2026-11-10", type: "concept",
        desc: "浏览器一个字一个字地挑字体，中文弯引号为什么落到 Georgia；行高怎么分、为什么写不带单位的倍数；中西文间距、标点挤压、行首行尾禁则在各浏览器的差别；对比度怎么算，HSL 的亮度为什么靠不住；深浅色主题怎么换才不闪。",
        lede: "这个站的样式表里，字体和颜色几乎每一处都写着理由：只把 0–9 换成 Times New Roman，head 最前面放一段读主题的脚本，六种纸色只用于图形。这一章讲背后的机制：字体怎么挑、行高怎么算、中西文混排谁来管，对比度怎么算出来，深浅色主题怎么做才不闪。",
        tldr: "浏览器对每个字按 font-family 的顺序找第一个有它的字体，所以一行里可能有三个字体，中文弯引号会落到排在前面的 Georgia。行高写不带单位的倍数，子元素才会按自己的字号重算；normal 随字体变。中西文之间手打空格最稳：Chrome 默认不自动加，标点挤压只有 Chrome 支持。对比度按相对亮度算，正文要 4.5，图形要 3；HSL 同为 50% 的黄和蓝对白底差了 8 倍。深色主题要在 head 里先写上 data-theme，并写 color-scheme，原生控件才跟着变。",
        tags: ["字体", "对比度", "深色模式"] },
      { slug: "responsive-a11y", title: "适配每台设备、每个人", date: "2026-11-12", type: "concept",
        desc: "手机为什么默认按 980 宽排版，meta viewport 改了什么；断点怎么定，为什么屏幕宽 1px 正文栏反而窄 211；srcset 让 iPhone 少下七成的图；读屏软件读的是无障碍树，键盘只到得了能聚焦的元素；用户调字号、减少动态效果时页面怎么跟着变。",
        lede: "这个站在 iPhone、iPad、Mac 上排得不一样：目录有时在正文侧面，有时横排在正文上面；流程块有时横排，有时竖排。这一章先讲背后的机制：手机怎么决定页面有多宽，断点怎么起作用，图片怎么按屏幕挑。再讲看不见屏幕、不用鼠标的人怎么用同一页：读屏软件读到的是什么，只用键盘能不能走通。最后拿这些办法查一遍这个站，查出了四处真问题。",
        tldr: "手机浏览器默认按 980 宽排版再缩小，16px 的字在 iPhone 上只剩 7px；写上 width=device-width，排版宽度才等于屏幕的 430，断点才起作用。媒体查询看的是整个视口（含滚动条），所以屏幕宽 1px 正文栏可能反而窄 211；组件要随自己的宽度变时用容器查询。srcset 加 sizes 让 iPhone 下 180 KB 而不是 615 KB。读屏软件读的是无障碍树：角色、名字、状态从 HTML 标签来，opacity: 0 的东西照样被读出来；键盘只到得了能聚焦的元素，div 加 onclick 用 Tab 到不了，span 加 role 也不认 Enter。",
        tags: ["响应式", "无障碍", "视口"] },
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
      { slug: "ssh-proxy", title: "SSH 和代理", date: "2026-11-10", type: "concept",
        desc: "SSH 怎么用钥匙登录、靠 known_hosts 防冒充，config 和 IdentitiesOnly 怎么决定用哪把钥匙，端口转发；代理怎么把连接接过去，TUN 和假地址，以及为什么不破坏加密。",
        lede: "上一章实测时，本机查出来的 GitHub 地址是 198.18.x.x，命令行没设代理也走了代理；搭这个站时，换一个 SSH 别名才推送成功。这一章讲背后的两样东西：SSH 怎么认出你是谁、怎么确认服务器是真的，以及代理怎么把连接接过去。",
        tldr: "SSH 登录时，服务器先出示主机密钥，你的电脑和 known_hosts 核对，防冒充；然后你用私钥签名、服务器用公钥验，私钥不出你的电脑。用哪把钥匙由 ~/.ssh/config 决定：别名加 IdentityFile 和 IdentitiesOnly yes，一台电脑才能干净地用两个账号。端口转发让你不开放端口也能用远处的服务。代理软件的 TUN 模式用虚拟网卡和假地址（198.18.x.x）接管所有程序的连接，命令行没设代理也照样走；但加密仍在两头之间，主机密钥照样对得上。",
        tags: ["SSH", "代理", "TUN"] },
      { slug: "linux-server", title: "管一台 Linux 服务器", date: "2026-11-10", type: "concept",
        desc: "内核怎么判断一个进程能不能读一个文件；systemd 怎么让服务崩了重启、开机自启，日志去哪查；Nginx 发静态文件、反向代理，nginx -t 查不出什么；证书怎么申请和续期；钥匙登录、防火墙、自动更新，以及改这些时怎么不把自己锁在外面。",
        lede: "前几章讲的都是怎么连到一台服务器。这一章讲拿到一台 Linux 服务器以后，你得自己管的那些事：一个进程能碰哪些文件，服务怎么崩了自己起来，网站怎么用 Nginx 和免费证书上线，以及怎么守住门而不把自己锁在外面。最后把这个阅读库搬上一台服务器的完整顺序走一遍。",
        tldr: "读一个文件，路径上每层目录都要有 x，文件只用主人、组、其他人里第一组对上的权限，root 不受限制，所以服务用专门的普通用户跑。systemd 按 unit 文件启动服务，Restart=on-failure 崩了重启（默认 10 秒内最多 5 次），enable 才开机自启，输出用 journalctl 查。Nginx 监听 80 和 443，应用只听 127.0.0.1；nginx -t 只查语法，reload 之后还要 curl 一遍。certbot 剩三分之一有效期才续，装好就 dry-run。关密码登录要两项都关，用 sshd -T 看生效的值；ufw 先放行 22 再打开，Docker 发布的端口它挡不住。",
        tags: ["Linux", "systemd", "Nginx"] },
      { slug: "git-github", title: "Git 和 GitHub", date: "2026-11-10", type: "concept",
        desc: "提交是快照，对象按内容的哈希命名，分支是 41 字节的指针；暂存区决定提交带上什么；merge 和 rebase 的区别、改写历史的风险、reflog 找回提交；推送以后 GitHub Actions 怎么构建和发布。",
        lede: "这个阅读库的每一次更新都走同一条路：git add、commit、push，GitHub Actions 构建，发布到 Pages。这一章讲 git 底下的模型：提交、对象、分支、暂存区到底是什么，再从模型推出 merge 和 rebase 的区别、改写历史的风险，以及推送以后 Actions 做了什么。",
        tldr: "提交存的是一份快照：指向一棵树、记着父提交，所有对象都按内容的 SHA-1 命名，改一个字节就是新对象。分支只是一个记着提交哈希的 41 字节文件，HEAD 指向当前分支。提交带上什么由暂存区决定，git add -A 会把所有改动都放进去。merge 保留分叉；rebase 重做提交、哈希全变，所以推出去的别 rebase，要覆盖远程用 --force-with-lease。reset 丢掉的提交 reflog 里还有。推送以后，Actions 的每个 job 跑在新的虚拟机上，build 成功才 deploy。",
        tags: ["Git", "GitHub", "Actions"] },
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
