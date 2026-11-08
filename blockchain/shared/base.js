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

  window.SiteBase = { readTheme: readTheme, applyTheme: applyTheme, mountThemeToggle: mountThemeToggle,
    el: el, sv: sv, fmtDate: fmtDate, fmtUsd: fmtUsd };
})();
