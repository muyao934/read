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
  { id: "bridge-hacks", title: "跨链桥被盗", sub: "每一起的原因", tint: "e5",
    desc: "历史上的跨链桥被盗事件，按“哪一个检查没做、哪把钥匙怎么丢的”分类拆开，给正在做桥的人当对照表",
    lede: "跨链桥把多条链的资产锁在少数合约和少数签名者手里，验证环节的任何疏漏都会变成一次清空。这个专题一起一起地拆：这座桥靠谁来证明“对面链上真的发生了充值”、哪一步没检查、攻击者传了什么、多久才发现、事后怎么修。按原因分章，每章先讲机制，再走完整的案例。事实以官方复盘、安全公司分析、合约源码和链上数据为准，查不到的地方写明查不到。",
    chapters: [
      { slug: "gonka-bridge", title: "Gonka：钥匙是真的，问题出在造钥匙", date: "2026-11-19", type: "concept",
        desc: "2026-11-18 的事故。新闻说“攻击者更换了签名密钥”，但把链上数据和 Gonka 链自己的记录逐字节比过之后，那把钥匙是真造出来的、合约每项校验都正常：攻击者作为合法参与者，在 DKG 里发了一条“在 12 个位置恰好等于零”的曲线，让 12 个诚实节点连“我反对”都说不出口。",
        lede: "2026 年 11 月 18 日，Gonka 的以太坊跨链桥被提走约 88.5 万美元稳定币，另外凭空铸出 2,200 万枚 WGNK。金额在跨链桥事故里排不上号，但手法是新的：不打合约、不偷私钥，而是在“一群人合作造钥匙”的过程里下毒。这一章从链上数据和源码出发，还原它是怎么做到的，以及为什么以太坊一侧的合约“完全正确”却没能挡住。",
        tldr: "门限签名里没有一把完整私钥可偷，钥匙只以碎片形式分散在 19 个节点手上。攻击者上一轮先加入、不动手，第二轮作为发牌人交了一条在 12 个位置恰好等于零的曲线：收到零的节点签不出有效签名，而提交“我验证过了 / 我投诉谁”这份报告<b>必须</b>用自己的份额签名，于是 12 个受害者在链上表现为“缺席”，而共识代码把缺席直接跳过、不算反对票。剩下 7 个节点的碎片正好 51 片，等于判定门槛，恶意曲线被算进正式群公钥。36 秒后池子被提干——以太坊一侧没有限额、延迟、对账或暂停开关。",
        tags: ["跨链桥", "BLS 门限签名", "DKG"] },
      { slug: "forged-messages", title: "伪造跨链消息：谁发的、从哪来的没校验",
        desc: "待写（10 起）。目标链只检查“签名对不对”，没检查“这条消息是谁发的、从哪条通道来的”。深写：KelpDAO 的 1-of-1 验证者被污染 RPC（2026-04，约 2.92 亿美元）、Ankr 把一笔已兑付的充值改写成 5 张提款回执（2026-11）、Across 的 relayer 垫付了 1,627 笔伪造的 Solana 充值（2026-07，约 450 万美元）。清单：zkLink Nova 已认证消息哈希没清掉（2026-10）、Demex 伪造代币部署报告（2026-09）、CrossCurve 的 ReceiverAxelar 没验来源（2026-02）、GriffinAI 的 LayerZero peer 配错（2025-09）、NoOnes（2025-01）、Fegex 伪造 Wormhole 消息（2024-12）、pNetwork 伪造 peg-out 日志（2021-10）。" },
      { slug: "signature-checks", title: "签名校验：验了签名，却没验对的东西",
        desc: "待写（8 起）。签名本身是真的、算法也没错，但哈希里少了一项，或者验的不是该验的那个对象。深写：Wormhole 在 Solana 一侧没核对 instruction sysvar（2022-02，约 3.26 亿美元）、Orbit Bridge（2023-12，约 8,170 万美元）、Wanchain 把 14 个变长字段不加分隔符拼接导致签名可挪用（2026-07，约 1,000 万美元）。清单：Multichain 的 permit 没验签（2023-02）、ChainSwap 两次绕过授权（2021-07）、Adshares 的铸币 EOA 签了不存在的交易（2026-05）、Port3 的 mint 没验签且 owner 没设（2025-11）。" },
      { slug: "proof-checks", title: "证明校验：默克尔、轻客户端、ZK 和 TEE",
        desc: "待写（18 起，本专题最大的一类）。桥要凭“证明”确认对面发生了什么，而证明的校验最容易写错。深写：BNB Token Hub 的 IAVL 默克尔证明缺陷（2022-10，名义约 5.7 亿美元，停链 8 小时）、Nomad 把零值根设成可信、数百个地址复制攻击交易（2022-08，约 1.86 亿美元）、Verus 两次（2026-05 和 2026-07，合计约 1,900 万美元，同一漏洞没修）。清单：Hyperbridge 挑战期为 0（2026-04）、Taiko 的 SGX 私钥泄露在 GitHub（2026-06）、Syscoin 两套实现解析不一致（2026-06）、Aztec 两次（2026-06）、ZKSwap 的 verifyExitProof 根本没验（2025-07）、Alephium 打断节点连接触发回退验证（2026-05）、TAC 没校验 jetton wallet 的 code hash（2026-05）、Payy 的批次里夹带提款（2026-09）、Poly Network 第二次（2023-07）、Vara（2026-10）、Veil Cash 与 FOOM Cash 的 Groth16 参数配错（2026-02、2026-03）、Tales of Elleria（2023-04）。" },
      { slug: "input-checks", title: "没检查输入：旧函数、零地址、负数、长度",
        desc: "待写（9 起）。最朴素的一类，也最容易在加新功能时重犯。深写：Qubit 的旧 deposit 函数没删、ETH 用零地址表示（2022-01，约 8,000 万美元）、WAX 的 max_fee 没校验非负、填负数让扣款变零（2026-10）、Socket / Bungee 的 swapExtraData 没校验（2024-01，约 330 万美元，700 多个用户）。清单：Meter 的另一个 deposit 变体（2022-02）、Numbers Protocol 的 permit 权限过大（2022-11）、warp.green 的 Chia 侧模块（2026-08）、Coreum（2026-08）、NEAR Intents 的 Omni 与合约交互（2026-10）、XDX Swap（2021-07）。" },
      { slug: "keys", title: "钥匙：被盗、集中，以及密码学实现出错",
        desc: "待写（17 起，金额最高的一类，合计约 9.9 亿美元）。不是合约漏洞，是钥匙被拿到或本来就集中在一处。深写：Ronin 9 个验证者里 5 个（2022-03，约 6.24 亿美元，假招聘钓鱼加一项早该撤销的代签授权）、Multichain 名义 MPC 实际钥匙全在 CEO 一人手里（2023-07，约 1.26 亿美元）、Anyswap V3 两笔交易签名 R 值相同被反推出私钥（2021-07，约 790 万美元）。清单：Harmony Horizon 的 2/5 门槛（2022-06，约 1 亿美元）、HTX 与 Heco 桥同日失守（2023-11）、AFX 7 个验证者里 5 把（2026-07，约 2,415 万美元）、Gravity（2026-05）、IoTeX 社工后恶意升级（2026-02）、Shibarium 闪电贷凑质押权重（2025-09）、Seedify（2025-09）、Fetch.ai 单个 authorizer 的签名就是全部授权（2026-09）、Zilliqa（2026-10）、Echo（2026-05）、Rubic（2022-11）、QANX（2022-05）、Stake DAO（2026-05）、DIMO（2025-11）。" },
      { slug: "upgrade-config", title: "升级、初始化和配置",
        desc: "待写（12 起）。代码本身没错，是部署、升级、改配置的时候出的事。深写：Poly Network 的跨链消息能调到换签名人的函数、函数选择器撞车（2021-08，约 6.11 亿美元）、Ronin 桥升级漏调初始化函数（2024-08，约 1,200 万美元，每日限额在这里起了作用）、The Sandbox 用 approveAndCall 劫持 LayerZero delegate 权限（2026-08）。清单：Kinto 的未初始化代理（2025-07）、Aethir 与 Syndicate 的 admin / 升级权限（2026-04）、ForceBridge 特权函数没访问控制（2025-06）、XBridge 的 listToken 没保护（2024-04）、ChainConnect（2026-07）、Crosswise（2022-01）、ChainSwap 第三次（2021-11）、Poly Network 第三次（2024-08，根因未公开）。另附未遂案例：Wormhole 未初始化实现合约（2022-02，白帽发现，赏金 1,000 万美元）。" },
      { slug: "accounting", title: "两条链的账没对上：无抵押铸币",
        desc: "待写（12 起）。目标链以为对面收到了钱，其实没有；或者放款一侧没有独立核对。深写：Liquid Network 范围证明缓存键碰撞凭空铸 L-BTC、再经 SideSwap 赎回真实比特币（2026-09，约 3.2 亿美元）、Axelar–Secret 自建单验证者链开假 IBC 通道（2026-06，约 467 万美元，7 天后才发现）、Allbridge 把“Circle 给通用 CCTP 消息做过证明”当成“USDC 真的转了”（2026-08）。清单：Nomic 的 nBTC 双花（2026-09）、Secret Network 与 Namada（2026-06）、Oraichain（2026-08）、Symbiosis（2026-09）、MAP Protocol 的 keccak256(abi.encodePacked) 碰撞（2026-05）、DGLD（2026-02）、DefiChain 的手续费计价（2022-01）、Harmony 跨分片收据重复处理（2026-08）。" },
      { slug: "liquidity-bridges", title: "流动性型桥：兑换、退款和池子",
        desc: "待写（11 起）。这类桥不搬资产，由做市方或节点垫付，攻击面在兑换数学和退款流程上，不在消息验证上。深写：THORChain 的 GG20 门限签名缺陷、新轮换进来的恶意节点（2026-05，约 1,070 万美元）、Chainflip 的 TRON 兑换指令取自 memo、已签名交易可换 memo 导致同一笔充值付两次（2026-09）、Maya Protocol 的多个 bug 叠加（2026-08）。清单：THORChain 2021 年三次（06-29、07-15、07-22，合计约 1,335 万美元）、Allbridge Core 两次池子定价（2023-04、2026-07）、Nerve / Synapse 的 MetaPool（2021-11、2021-12）、FilDA 的废弃池子（2023-04）。" },
      { slug: "periphery", title: "桥的周边：路由、前端、域名和 solver",
        desc: "待写（13 起）。桥的核心合约没被攻破，攻击面在它旁边——而用户的钱一样会丢。深写：Li.Fi 的新 facet 抽走无限授权（2024-07，约 973 万美元，153 个钱包）、Garden 两次（2025-10 约 1,140 万美元 solver 被攻破、2026-07 链下数据库被写入假记录）、Across 的域名注册商 Namecheap 被社工（2026-11）。清单：冒充 GIWA 的假桥（2026-09，约 208 万美元）、402bridge 私钥存在服务器上（2025-10）、ALEX / XLink 钓鱼（2024-05）、Hector 的 beta 合约无限授权（2023-06）、Rubic 的任意外部调用（2022-12）、pNetwork 的 pGALA 治理钥匙泄露（2022-11）、Celer cBridge 的 DNS 劫持（2022-08）、ZetaChain 的 GatewayZEVM（2026-04）、BarnBridge 的恶意治理提案（2026-07）。" },
      { slug: "defense", title: "造桥的人怎么防",
        desc: "待写。把前面每一类对应到具体的防线，并说清每道防线防得住什么、防不住什么：限额与限速（Wormhole Governor、CCIP 的 Risk Management Network、IBC 限速、ERC-7281 给每座桥设铸币额度）、延迟与挑战期、暂停与安全委员会、多重独立验证（LayerZero DVN 的 X-of-Y-of-N、Hyperlane ISM）、储备对账与供应上限、稳定币发行方冻结、监控与自动暂停、密钥保管（HSM / KMS / MPC / 多签的差别与门槛怎么定）。再附一张“本专题全部 111 起 × 当时有没有这几道闸”的对照表，以及被白帽先发现的未遂案例（Polygon、Optimism、Arbitrum、Rainbow Bridge、Cosmos IBC Dragonberry）。" },
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
        lede: "这个站在 iPhone、iPad、Mac 上排得不一样：目录有时在正文侧面，有时横排在正文上面；流程块有时横排，有时竖排。这一章先讲背后的机制：手机怎么决定页面有多宽，断点怎么起作用，图片怎么按屏幕挑。再讲看不见屏幕、不用鼠标的人怎么用同一页：读屏软件读到的是什么，只用键盘能不能走通。最后拿这些办法查一遍这个站，查出四处真问题，改了三处，改完再查一遍。",
        tldr: "手机浏览器默认按 980 宽排版再缩小，16px 的字在 iPhone 上只剩 7px；写上 width=device-width，排版宽度才等于屏幕的 430，断点才起作用。媒体查询看的是整个视口（含滚动条），所以屏幕宽 1px 正文栏可能反而窄 211；组件要随自己的宽度变时用容器查询。srcset 加 sizes 让 iPhone 下 180 KB 而不是 615 KB。读屏软件读的是无障碍树：角色、名字、状态从 HTML 标签来，opacity: 0 的东西照样被读出来；键盘只到得了能聚焦的元素，div 加 onclick 用 Tab 到不了，span 加 role 也不认 Enter。",
        tags: ["响应式", "无障碍", "视口"] },
      { slug: "graphics-motion", title: "图和动画", date: "2026-11-12", type: "concept",
        desc: "viewBox 怎么把图里的坐标换成屏幕像素，字为什么跟着变大变小；6 种 SVG 写法里哪几种会跟着主题变色；SVG 和 Canvas 各在多少个图形时撑不住；过渡每一帧的值怎么算、什么时候不播；主线程被占住 1.2 秒时，哪种动画还在动。",
        lede: "这个站的示意图最宽只放到“viewBox 宽 × 16/14”，图里不准写颜色；第 1 章说动画该用 transform，可这个站自己的分步动画用的是 left。这一章讲图和动画背后的机制：SVG 的坐标怎么变成像素、怎么跟着主题变色、什么时候该用 Canvas；过渡的每一帧怎么算，动画为什么会卡、卡在哪个线程上。最后回答这个站的动画该不该改。",
        tldr: "SVG 里的坐标、字号、线宽都是 viewBox 单位，显示宽 ÷ viewBox 宽就是缩放比例，字和线一起变，所以图要限最宽、窄屏限最小宽度。内联 SVG 用 class 加 CSS 变量就能随主题变色；img 引入的 SVG 拿不到页面的变量，但页面写了 color-scheme 时，它里面的 prefers-color-scheme 会跟着变。图形上万时 SVG 撑不住，Canvas 照样满帧，代价是读屏读不到。过渡要有“上一次的值”才会播。主线程被占住 1.2 秒，left 动画和用 rAF 改的 transform 都停住，只有 CSS 声明的 transform 照常动。这个站的动画每帧约 1 毫秒，不用改。",
        tags: ["SVG", "CSS 动画", "合成线程"] },
      { slug: "components-video", title: "组件化，以及用组件做视频", date: "2026-11-12", type: "concept",
        desc: "这个站的组件怎么在构建时检查、输出 HTML；React 改一行数据时动了几处 DOM，key 为什么不能用下标；页面在构建时、服务器上、浏览器里生成各差多少；Remotion 怎么把组件逐帧截图拼成视频，为什么每一帧只能由帧号决定。",
        lede: "搭这个阅读库时要的是“像 React 那样的组件”，最后用的是 Astro。这一章从这个选择讲起：组件到底是什么，React 怎么在数据变化时更新页面，页面在哪里生成有什么差别；再讲 Remotion 怎么用 React 组件做视频。最后把第 4 章的一个分步动画，用同一份数据做成了一段视频。",
        tldr: "组件是“props 进、界面出”的函数。这个站的 13 个组件只在构建时运行，先检查 props，错了就不发布，读者拿到的是纯 HTML，每页只有 3.6 KB 脚本。React 的组件一直活着：数据一变就重跑函数，和上一次比，只改有差别的 DOM，改一行动 1 处；key 用下标时插一行要改 1000 处，输入框的内容还会挂到别的行上。服务端渲染出字快，但要等 hydrate 才能点。Remotion 用帧号渲染组件、在无头浏览器里逐帧截图、FFmpeg 编码；标签页并行、不按顺序，所以画面只能由帧号算，CSS 动画的结果会随并发数变。",
        tags: ["组件", "React", "Remotion"] },
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
