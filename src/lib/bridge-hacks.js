// 跨链桥被盗专题的事件清单：专题首页的时间轴（泳道）和按章分组的事件表都读这里。
//
// 口径：2021 年起、和跨链桥有关的被盗事件，不设金额门槛（用户 2026-11-19 选定：目的是学原因，不是统计金额）。
// ch 是归到哪一章，章节目录在 src/lib/topics.js 的 bridge-hacks，按“哪一个检查没做”分，不按桥的类型分。
//
// 【数据还没核实】date、name、loss 来自 DefiLlama 的 hacks 汇总（2026-11-19 下载），只用来搭目录：
// 日期可能差一两天，金额口径各家不一，行末注释里的 technique 是它给的标签，归类时参考过但不一定准。
// 写每章时要逐起用一手来源（官方复盘、安全公司分析、链上数据）重新核实，核实过的把 ok: true 加上。
// 已核实：2026-11-18 Gonka（见第 1 章“怎么核实的”一节）。
export const EVENTS = [
  { date: "2021-06-29", name: "THORChain DEX", short: "THORChain", loss: 350000, ch: 9 },   // Bridge Logic Flaw
  { date: "2021-07-02", name: "ChainSwap", short: "ChainSwap", loss: 800000, ch: 3 },   // Bridge Logic Flaw
  { date: "2021-07-02", name: "XDX Swap", short: "XDX Swap", loss: 176000, ch: 5 },   // Bridge Logic Flaw
  { date: "2021-07-10", name: "Multichain", short: "Multichain", loss: 7900000, ch: 6 },   // Weak Key Generation
  { date: "2021-07-11", name: "ChainSwap Bridge", short: "ChainSwap", loss: 4400000, ch: 3 },   // Bridge Logic Flaw
  { date: "2021-07-15", name: "THORChain DEX", short: "THORChain", loss: 5000000, ch: 9 },   // Bridge Logic Flaw
  { date: "2021-07-22", name: "THORChain DEX", short: "THORChain", loss: 8000000, ch: 9 },   // Withdrawal Logic Flaw
  { date: "2021-08-10", name: "Poly Network", short: "Poly", loss: 611000000, ch: 7 },   // Improper Access Control
  { date: "2021-10-04", name: "pNetwork", short: "pNetwork", loss: 13000000, ch: 2 },   // Spoofed Event Log
  { date: "2021-11-07", name: "ChainSwap", short: "ChainSwap", loss: 4400000, ch: 7 },   // Caller Impersonation
  { date: "2021-11-15", name: "Nerve", short: "Nerve", loss: 537000, ch: 9 },   // Swap Logic Flaw
  { date: "2021-12-14", name: "NerveBridge", short: "NerveBridge", loss: 537000, ch: 9 },   // Swap Logic Flaw
  { date: "2022-01-02", name: "DefiChain", short: "DefiChain", loss: null, ch: 8 },   // Incorrect Fee Accounting
  { date: "2022-01-18", name: "Crosswise", short: "Crosswise", loss: 879000, ch: 7 },   // Improper Access Control
  { date: "2022-01-28", name: "Qubit", short: "Qubit", loss: 80000000, ch: 5 },   // Missing Input Validation
  { date: "2022-02-02", name: "Portal", short: "Wormhole", loss: 326000000, ch: 3 },   // Signature Verification Flaw
  { date: "2022-02-06", name: "Meter", short: "Meter", loss: 7700000, ch: 5 },   // Missing Input Validation
  { date: "2022-03-23", name: "Ronin Bridge", short: "Ronin", loss: 624000000, ch: 6 },   // Validator Key Compromised
  { date: "2022-05-18", name: "QANX Bridge", short: "QANX", loss: 707000, ch: 6 },   // Private Key Compromised
  { date: "2022-06-23", name: "Harmony Bridge", short: "Harmony", loss: 100000000, ch: 6 },   // Validator Key Compromised
  { date: "2022-08-01", name: "Nomad", short: "Nomad", loss: 190000000, ch: 4 },   // Forged Proof
  { date: "2022-08-18", name: "Celer cBridge", short: "Celer cBridge", loss: 240000, ch: 10 },   // DNS Hijack
  { date: "2022-10-06", name: "Binance Bridge", short: "BNB Bridge", loss: 570000000, ch: 4 },   // Proof Verifier Bug
  { date: "2022-11-02", name: "Rubic", short: "Rubic", loss: 1200000, ch: 6 },   // Private Key Compromised
  { date: "2022-11-03", name: "pNetwork", short: "pNetwork", loss: 4300000, ch: 10 },   // Key Leaked via Infrastructure
  { date: "2022-11-23", name: "Numbers Protocol", short: "Numbers", loss: 13836, ch: 5 },   // Bridge Logic Flaw
  { date: "2022-12-25", name: "Rubic", short: "Rubic", loss: 1410000, ch: 10 },   // Arbitrary External Call
  { date: "2023-02-15", name: "Multichain", short: "Multichain", loss: 130000, ch: 3 },   // Signature Verification Flaw
  { date: "2023-04-02", name: "Allbridge Core", short: "Allbridge", loss: 573000, ch: 9 },   // Swap Logic Flaw
  { date: "2023-04-20", name: "Tales of Elleria", short: "Elleria", loss: 280000, ch: 4 },   // Forged Proof
  { date: "2023-04-23", name: "FilDA", short: "FilDA", loss: 700000, ch: 9 },   // Bridge Logic Flaw
  { date: "2023-06-02", name: "Hector Lending", short: "Hector Lending", loss: 653000, ch: 10 },   // Token Approval Abuse
  { date: "2023-07-02", name: "Poly Network", short: "Poly", loss: 5000000, ch: 4 },   // Forged Proof
  { date: "2023-07-07", name: "Multichain", short: "Multichain", loss: 126000000, ch: 6 },   // Validator Key Compromised
  { date: "2023-11-22", name: "Heco Bridge", short: "Heco 桥", loss: 86600000, ch: 6 },   // Hot Wallet Key Compromised
  { date: "2023-12-31", name: "Orbit Bridge", short: "Orbit", loss: 81700000, ch: 3 },   // Signature Verification Flaw
  { date: "2024-01-16", name: "Bungee", short: "Socket", loss: 3300000, ch: 5 },   // Missing Input Validation
  { date: "2024-04-24", name: "XBridge", short: "XBridge", loss: 1440000, ch: 7 },   // Improper Access Control
  { date: "2024-05-16", name: "ALEX", short: "ALEX", loss: 4300000, ch: 10 },   // Phishing
  { date: "2024-07-16", name: "LiFi Finance", short: "Li.Fi", loss: 9730000, ch: 10 },   // Token Approval Abuse
  { date: "2024-08-06", name: "Ronin Bridge", short: "Ronin", loss: 12000000, ch: 7 },   // Uninitialized Proxy
  { date: "2024-08-12", name: "PolyNetwork", short: "PolyNetwork", loss: 5000000, ch: 7 },   // Unknown
  { date: "2024-12-29", name: "Fegex", short: "Fegex", loss: 1070000, ch: 2 },   // Cross-Chain Message Spoofing
  { date: "2025-01-01", name: "NoOnes", short: "NoOnes", loss: 7900000, ch: 2 },   // Cross-Chain Message Spoofing
  { date: "2025-06-06", name: "ForceBridge", short: "ForceBridge", loss: 3900000, ch: 7 },   // Improper Access Control
  { date: "2025-07-09", name: "ZKSwap", short: "ZKSwap", loss: 5000000, ch: 4 },   // Forged Proof
  { date: "2025-07-10", name: "Kinto Bridge", short: "Kinto", loss: 1550000, ch: 7 },   // Uninitialized Proxy
  { date: "2025-09-13", name: "Shibarium", short: "Shibarium", loss: 4100000, ch: 6 },   // Validator Key Compromised
  { date: "2025-09-23", name: "Seedify", short: "Seedify", loss: 1200000, ch: 6 },   // Private Key Compromised
  { date: "2025-09-24", name: "GriffinAI", short: "GriffinAI", loss: 3000000, ch: 2 },   // Cross-Chain Message Spoofing
  { date: "2025-10-27", name: "402bridge", short: "402bridge", loss: 17693, ch: 10 },   // Key Stored Publicly
  { date: "2025-10-30", name: "Garden", short: "Garden", loss: 11400000, ch: 10 },   // Key Leaked via Infrastructure
  { date: "2025-11-07", name: "DIMO", short: "DIMO", loss: 40000, ch: 6 },   // Deployer Key Compromised
  { date: "2025-11-23", name: "Port3 Network", short: "Port3", loss: 166000, ch: 3 },   // Infinite Mint
  { date: "2026-02-01", name: "CrossCurve", short: "CrossCurve", loss: 3000000, ch: 2 },   // Cross-Chain Message Spoofing
  { date: "2026-02-21", name: "IoTeX", short: "IoTeX", loss: 4400000, ch: 6 },   // Validator Key Compromised
  { date: "2026-02-21", name: "Veil Cash", short: "Veil Cash", loss: 5000, ch: 4 },   // Proof Verifier Bug
  { date: "2026-02-23", name: "DGLD", short: "DGLD", loss: 250000, ch: 8 },   // Infinite Mint
  { date: "2026-03-02", name: "FOOM Cash", short: "FOOM Cash", loss: 2260000, ch: 4 },   // Forged Proof
  { date: "2026-04-09", name: "Aethir", short: "Aethir", loss: 400000, ch: 7 },   // Improper Access Control
  { date: "2026-04-12", name: "Hyperbridge", short: "Hyperbridge", loss: 2500000, ch: 4 },   // Forged Proof
  { date: "2026-04-18", name: "Kelp", short: "KelpDAO", loss: 293000000, ch: 2 },   // Cross-Chain Message Spoofing
  { date: "2026-04-27", name: "ZetaChain", short: "ZetaChain", loss: 333868, ch: 10 },   // Token Approval Abuse
  { date: "2026-04-29", name: "Syndicate", short: "Syndicate", loss: 380000, ch: 7 },   // Bridge Logic Flaw
  { date: "2026-05-11", name: "TAC Protocol", short: "TAC", loss: 2854486, ch: 4 },   // Proof Verifier Bug
  { date: "2026-05-15", name: "THORChain DEX", short: "THORChain", loss: 10700000, ch: 1 },   // Bridge Logic Flaw
  { date: "2026-05-16", name: "Adshares", short: "Adshares", loss: 628000, ch: 3 },   // Forged Proof
  { date: "2026-05-17", name: "Verus-Ethereum Bridge", short: "Verus", loss: 11500000, ch: 4 },   // Forged Proof
  { date: "2026-05-18", name: "Echo Bridge", short: "Echo", loss: 821000, ch: 6 },   // Private Key Compromised
  { date: "2026-05-20", name: "MAP Protocol", short: "MAP", loss: 110000, ch: 8 },   // Infinite Mint
  { date: "2026-05-27", name: "Stake DAO Yield", short: "Stake DAO", loss: 91000, ch: 6 },   // Deployer Key Compromised
  { date: "2026-05-30", name: "Alephium Bridge", short: "Alephium", loss: 815000, ch: 4 },   // Forged Proof
  { date: "2026-05-30", name: "Gravity Bridge", short: "Gravity", loss: 5400000, ch: 6 },   // Validator Key Compromised
  { date: "2026-06-07", name: "Syscoin Bridge", short: "Syscoin", loss: 10000000, ch: 4 },   // Forged Proof
  { date: "2026-06-10", name: "Axelar Secret IBC Bridge", short: "Axelar–Secret", loss: 4670000, ch: 8 },   // Unbacked Cross-Chain Mint
  { date: "2026-06-14", name: "Aztec Connect", short: "Aztec", loss: 2100000, ch: 4 },   // Forged Proof
  { date: "2026-06-17", name: "Aztec Bridge", short: "Aztec", loss: 2000000, ch: 4 },   // Bridge Logic Flaw
  { date: "2026-06-19", name: "Namada Shielded Pools", short: "Namada", loss: 600000, ch: 8 },   // Unbacked Cross-Chain Mint
  { date: "2026-06-19", name: "Secret Network", short: "Secret", loss: 4670000, ch: 8 },   // Unbacked Cross-Chain Mint
  { date: "2026-06-21", name: "Taiko Bridge", short: "Taiko", loss: 1700000, ch: 4 },   // Forged Proof
  { date: "2026-07-14", name: "BarnBridge", short: "BarnBridge", loss: 776000, ch: 10 },   // Malicious Proposal
  { date: "2026-07-17", name: "Across", short: "Across", loss: 4500000, ch: 2 },   // Spoofed Event Log
  { date: "2026-07-19", name: "Allbridge Core", short: "Allbridge", loss: 1650000, ch: 9 },   // Withdrawal Logic Flaw
  { date: "2026-07-21", name: "Wanchain", short: "Wanchain", loss: 10000000, ch: 3 },   // Signature Verification Flaw
  { date: "2026-07-22", name: "AFX Bridge", short: "AFX", loss: 24150000, ch: 6 },   // Validator Key Compromised
  { date: "2026-07-22", name: "Verus-Ethereum Bridge", short: "Verus", loss: 7530000, ch: 4 },   // Forged Proof
  { date: "2026-07-26", name: "ChainConnect", short: "ChainConnect", loss: 650000, ch: 7 },   // Improper Access Control
  { date: "2026-07-26", name: "Garden", short: "Garden", loss: 450000, ch: 10 },   // Database Breach
  { date: "2026-08-08", name: "Oraichain", short: "Oraichain", loss: 1000000, ch: 8 },   // Unbacked Cross-Chain Mint
  { date: "2026-08-09", name: "Coreum Bridge", short: "Coreum", loss: 200000, ch: 5 },   // Bridge Logic Flaw
  { date: "2026-08-11", name: "Harmony Bridge", short: "Harmony", loss: 3200000, ch: 8 },   // Bridge Logic Flaw
  { date: "2026-08-18", name: "Maya Protocol", short: "Maya", loss: 1700000, ch: 9 },   // Withdrawal Logic Flaw
  { date: "2026-08-19", name: "Allbridge", short: "Allbridge", loss: 191000, ch: 8 },   // Bridge Logic Flaw
  { date: "2026-08-22", name: "The Sandbox", short: "The Sandbox", loss: 675000, ch: 7 },   // Improper Access Control
  { date: "2026-08-23", name: "warp.green", short: "warp.green", loss: 93000, ch: 5 },   // Bridge Logic Flaw
  { date: "2026-09-06", name: "Liquid Network", short: "Liquid", loss: 320000000, ch: 8 },   // Unbacked Cross-Chain Mint
  { date: "2026-09-09", name: "Nomic", short: "Nomic", loss: 3150000, ch: 8 },   // Unbacked Cross-Chain Mint
  { date: "2026-09-10", name: "Symbiosis", short: "Symbiosis", loss: 336000, ch: 8 },   // Unbacked Cross-Chain Mint
  { date: "2026-09-12", name: "Chainflip AMM", short: "Chainflip", loss: 736442, ch: 9 },   // Bridge Logic Flaw
  { date: "2026-09-19", name: "Fetch.ai", short: "Fetch.ai", loss: 1530000, ch: 6 },   // Private Key Compromised
  { date: "2026-09-24", name: "Payy Network", short: "Payy", loss: 1828589, ch: 4 },   // Bridge Logic Flaw
  { date: "2026-09-25", name: "Demex Perp", short: "Demex", loss: 191929, ch: 2 },   // Cross-Chain Message Spoofing
  { date: "2026-09-27", name: "Fake GIWA Bridge", short: "假 GIWA", loss: 2080000, ch: 10 },   // Impersonation Scam
  { date: "2026-10-01", name: "NEAR Intents", short: "NEAR Intents", loss: 3800000, ch: 5 },   // Bridge Logic Flaw
  { date: "2026-10-19", name: "Vara Bridge", short: "Vara", loss: 12776, ch: 4 },   // Proof Verifier Bug
  { date: "2026-10-22", name: "WAX Multi-Chain Bridge", short: "WAX", loss: 90500, ch: 5 },   // Missing Input Validation
  { date: "2026-10-27", name: "Zilliqa X-Bridge", short: "Zilliqa X-Bri…", loss: null, ch: 6 },   // Private Key Compromised
  { date: "2026-10-28", name: "zkLink Nova", short: "zkLink Nova", loss: 783100, ch: 2 },   // Cross-Chain Message Spoofing
  { date: "2026-11-09", name: "Ankr Bridge", short: "Ankr", loss: 304500, ch: 2 },   // Cross-Chain Message Spoofing
  { date: "2026-11-10", name: "Across", short: "Across", loss: null, ch: 10 },   // DNS Hijack
  { date: "2026-11-18", name: "Gonka AI", short: "Gonka", loss: 1050000, ch: 1 },   // Bridge Logic Flaw
];

// 时间轴的两端：按整年取，左右各留一点余量
export const T0 = Date.UTC(2021, 0, 1), T1 = Date.UTC(2027, 0, 1);
export const frac = (d) => Math.min(1, Math.max(0, (Date.parse(d) - T0) / (T1 - T0)));

// 金额写成中文：3.26 亿美元、1,200 万美元、88 万美元
export function fmtLoss(n) {
  if (n == null) return "金额未公开";
  const f = (v, d) => v.toLocaleString("en-US", { maximumFractionDigits: d });
  if (n >= 1e8) return `${f(n / 1e8, 2)} 亿美元`;
  if (n >= 1e4) return `${f(n / 1e4, n >= 1e6 ? 0 : 1)} 万美元`;
  return `${f(n, 0)} 美元`;
}

export const ofChapter = (ch) => EVENTS.filter((e) => e.ch === ch);
export const sumLoss = (list) => list.reduce((s, e) => s + (e.loss || 0), 0);

function validate() {
  const errs = [], seen = new Set();
  for (const e of EVENTS) {
    const id = `${e.date} ${e.name}`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || "")) errs.push(`${id} 的 date 要是 YYYY-MM-DD`);
    for (const k of ["name", "short"]) if (!e[k]) errs.push(`${id} 缺 ${k}`);
    if ([...(e.short || "")].length > 14) errs.push(`${id} 的 short 超过 14 个字`);
    if (!(e.loss === null || (typeof e.loss === "number" && e.loss > 0))) errs.push(`${id} 的 loss 要是正数或 null`);
    if (!(Number.isInteger(e.ch) && e.ch >= 1)) errs.push(`${id} 的 ch 要是章号`);
    if (seen.has(id)) errs.push(`${id} 重复`);
    seen.add(id);
  }
  if (errs.length) throw new Error("跨链桥事件清单有误：\n  " + errs.join("\n  "));
}
validate();
