// 分步小动画的素材（取自区块链基础知识的 Guide.chip 和各章的 lbl），返回 HTML 字符串，
// 放进 <Anim data> 的 it[].h 和 s[].set[id].h。颜色只能用语义色，写错了构建失败。
const COLORS = ["--accent", "--warn", "--ok", "--muted", "--doubt"];
function color(c) {
  if (!COLORS.includes(c)) throw new Error(`小动画素材的颜色只能是 ${COLORS.join(" / ")}，不能是 ${c}`);
  return c;
}
// 圆角标签：--accent 蓝（当前、推荐）、--warn 红（风险）、--ok 绿（成功）、--muted 灰；ex = "out" 是描边样式
export const chip = (t, c = "--muted", ex = "") => `<span class="ch ${ex}" style="--c:var(${color(c)})">${t}</span>`;
// 说明文字：c = "m" 灰、"w" 红、"g" 绿
export const lbl = (t, c = "") => `<div class="lbl ${c}">${t}</div>`;
// 方块（区块、数据包）和圆形钥匙
export const blk = (t) => `<div class="blk">${t}</div>`;
export const key = (t, on = true) => `<span class="keyi${on ? " on" : ""}">${t}</span>`;
