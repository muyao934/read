/* 四个板块和总览页共用的脚本（2026-11-06 起；原来在五个脚本里各写一份）。
   1. 主题切换（跟随系统 / 浅色 / 深色），记在 localStorage 的 chronicle-theme 里，各板块之间切换时保持一致
   2. 工具函数：el（建元素）、sv（建 SVG 元素）、fmtDate（日期）、fmtUsd（美元金额）
   通过 window.SiteBase 给各站的 page.js、index.js 和总览页的 home.js 用。
   必须在 <head> 里、本站 data.js 和脚本之前同步加载，这样主题能在页面绘制前生效。 */
(function () {
  var KEY = "chronicle-theme";
  var THEME_LABEL = { auto: "主题：跟随系统", light: "主题：浅色", dark: "主题：深色" };

  // ---------- 主题 ----------
  function readTheme() {
    try { return localStorage.getItem(KEY) || "auto"; } catch (e) { return "auto"; }
  }
  function applyTheme(t) {
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
  }
  applyTheme(readTheme()); // 在绘制前生效，避免闪烁

  // 把 [data-slot=theme] 换成主题按钮；切换后发 chronicle:theme 事件，需要重画的图可以监听
  function mountThemeToggle() {
    var slot = document.querySelector("[data-slot=theme]");
    if (!slot) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    var cur = readTheme();
    btn.textContent = THEME_LABEL[cur];
    btn.addEventListener("click", function () {
      cur = cur === "auto" ? "light" : cur === "light" ? "dark" : "auto";
      try { localStorage.setItem(KEY, cur); } catch (e) { /* 隐私模式下写不进去也没关系 */ }
      applyTheme(cur);
      btn.textContent = THEME_LABEL[cur];
      document.dispatchEvent(new CustomEvent("chronicle:theme"));
    });
    slot.replaceWith(btn);
  }

  // ---------- 工具 ----------
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  var SVGNS = "http://www.w3.org/2000/svg";
  function sv(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  // 2022-11-08 → “2022 年 11 月 8 日”
  function fmtDate(d) {
    var p = d.split("-");
    return p[0] + " 年 " + (+p[1]) + " 月 " + (+p[2]) + " 日";
  }
  // 美元金额 → “14.6 亿美元” / “6,000 万美元” / “95 万美元”；没有金额时是“—”
  function fmtUsd(n) {
    if (n == null) return "—";
    if (n >= 1e8) {
      var y = n / 1e8;
      var s = y >= 100 ? y.toFixed(0) : y >= 10 ? y.toFixed(1) : y.toFixed(2);
      return s.replace(/\.?0+$/, "") + " 亿美元";
    }
    if (n >= 1e4) return Math.round(n / 1e4).toLocaleString("zh-CN") + " 万美元";
    return Math.round(n).toLocaleString("zh-CN") + " 美元";
  }

  // ---------- 示意图：字不比正文大 ----------
  // 图按正文栏宽度等比缩放，栏越宽字越大，MacBook 宽度下主文字有 17–20px（2026-11-08 用户：图里的字太大了，要和正文一样大）。
  // 按 viewBox 宽度和图里最大的字号算出最宽，让主文字最大显示成正文字号；各站样式原有的最宽（大事记、诈骗站 900px）更窄时不动。
  // 宽屏时图在框里居中；窄屏仍按样式里的最小宽度在框里横向滑动。只改 .diagram 和 .svgscroll 里的图，首页的统计图不受影响
  function fitDiagrams() {
    var body = parseFloat(getComputedStyle(document.body).fontSize) || 16;
    // 不用 svg[viewBox] 选择器：SVG 上大小写混合的属性名用属性选择器匹配不可靠，改为在下面读 viewBox
    document.querySelectorAll(".diagram svg, .svgscroll svg").forEach(function (svg) {
      var vb = svg.viewBox && svg.viewBox.baseVal, big = 0;
      if (!vb || !vb.width) return;
      svg.querySelectorAll("text").forEach(function (t) { big = Math.max(big, parseFloat(getComputedStyle(t).fontSize) || 0); });
      if (!big) return;
      var w = vb.width * body / big, mx = getComputedStyle(svg).maxWidth;
      // 只认 px：base.css 的 max-width: 100% 读出来是 "100%"，parseFloat 会误当成 100px
      if (/px$/.test(mx) && parseFloat(mx) <= w) return;
      svg.style.maxWidth = Math.round(w) + "px";
      svg.style.marginLeft = svg.style.marginRight = "auto";
    });
  }
  document.addEventListener("DOMContentLoaded", fitDiagrams);

  window.SiteBase = { readTheme: readTheme, applyTheme: applyTheme, mountThemeToggle: mountThemeToggle,
    el: el, sv: sv, fmtDate: fmtDate, fmtUsd: fmtUsd, fitDiagrams: fitDiagrams };
})();
