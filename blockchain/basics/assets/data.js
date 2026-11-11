/* 区块链基础知识：章节目录（唯一数据源）。
   首页列表、详情页的面包屑和上一章 / 下一章都读这里；根目录总览页读 chapters.length。
   f：chapters/ 下的文件名（不含 .html），n：章号，t：标题，d：一句话说明，g：所属主题（groups 的键）。
   groups：四个主题，tint 是共用层的纸色 e1…e6，用在首页列表、顶栏纸边、各章的案卷号和目录当前项。
   内容整理自 qtum-bridge 项目的 guide（2026-10-27 核查），2026-11-06 并入本项目。 */
window.BASICS = {
  updated: "2026-11-06",
  groups: {
    base:   { name: "基础词与稳定币", tint: "e2" },
    chain:  { name: "链与合约", tint: "e5" },
    bridge: { name: "跨链", tint: "e3" },
    sec:    { name: "安全与签名", tint: "e4" }
  },
  chapters: [
    { f: "basics",    n: "入门", t: "零碎知识点", d: "稳定币、地址、gas、确认数、授权、多签、代理合约等基础词" , g: "base" },
    { f: "qtum",      n: "01", t: "Qtum 与 UTXO", d: "比特币的记账方式上怎么跑 EVM；“EVM 兼容”到底兼容到哪一层" , g: "chain" },
    { f: "usdc",      n: "02", t: "USDC 合约与 Circle", d: "FiatToken 的角色与铸币额度、冻结、原生与桥接 USDC" , g: "base" },
    { f: "bridges",   n: "03", t: "跨链桥：谱系与签名验证", d: "谁来证明、怎么验签、防重放、为什么老出事" , g: "bridge" },
    { f: "atlas",     n: "03+", t: "跨链方案图鉴", d: "LayerZero、Wormhole、Axelar、Hyperlane、Across 等逐个拆开；哪条链、哪个代币用哪种" , g: "bridge" },
    { f: "cctp-ccip", n: "04", t: "CCTP 与 CCIP 深入", d: "消息格式、验签、Fast Transfer、CCIP 2.0 组件、代币池、限速与费用" , g: "bridge" },
    { f: "ethereum",  n: "05", t: "Ethereum：PoS 与最终性", d: "验证者、slot 与 epoch、最终性、罚没、EIP-1559 与 blob；桥该等多少确认" , g: "chain" },
    { f: "l2",        n: "06", t: "L2：Base 与 OP Mainnet", d: "链下执行 + 以太坊上的一组合约；Base 没有自己的币" , g: "chain" },
    { f: "bsc",       n: "07", t: "BNB Smart Chain", d: "PoSA 与 45 / 21 个验证者、快速最终性、销毁、Binance-Peg 资产、opBNB" , g: "chain" },
    { f: "bitcoin",   n: "08", t: "Bitcoin", d: "工作量证明、分叉与 6 个确认、Script 的边界、地址与升级、BTC 跨链" , g: "chain" },
    { f: "evm",       n: "09", t: "智能合约与 EVM", d: "字节码与存储、部署与地址、ABI、事件、gas、EVM 版本与“等价 / 兼容”" , g: "chain" },
    { f: "audit",     n: "10", t: "跨链安全审计", d: "什么是审计、谁有资格做、怎么做；链下与运营审计、CCSS；怎么读报告；核对链上代码" , g: "sec" },
    { f: "gateway",   n: "11", t: "EthGateway", d: "托管桥以太坊侧的网关合约：热余额上限、同笔转冷、放款限额、先取消再退款、不可升级" , g: "sec" },
    { f: "kms",       n: "12", t: "KMS 签名：原理与落地", d: "运营地址的私钥放在 AWS KMS 里：KMS 签什么、不签什么；DER、低位 s、v；以太坊和 Qtum 的交易怎么签；签名前核对什么、账本怎么保证只签一次、权限怎么锁住、钥匙怎么换；在 Sepolia 和 Qtum 测试网上用 KMS 实际签名" , g: "sec" }
  ]
};
