/* 区块链被盗事件编年史：所有页面共用的脚本。
   1. 主题切换和 el、sv、fmtDate、fmtUsd 在 shared/base.js，这里从 window.SiteBase 取（2026-11-06 起）
   2. 详情页：按 <body data-id> 从 data.js 渲染案卷编号、案情要素、编年小条、目录、上一篇/下一篇
   必须在 <head> 里、shared/base.js 和 data.js 之后同步加载。 */
(function () {
  var C = window.CHRONICLE;
  // 主题切换和工具函数在 shared/base.js（2026-11-06 起五处合成一份）
  var SB = window.SiteBase, mountThemeToggle = SB.mountThemeToggle, el = SB.el, sv = SB.sv, fmtDate = SB.fmtDate, fmtUsd = SB.fmtUsd;

  // ---------- 格式化 ----------
  function caseNo(i) { return "编年第 " + String(i + 1).padStart(2, "0") + " 号"; }
  // 详情页之间、详情页与首页之间的相对路径
  function hrefOf(e, fromIndex) { return (fromIndex ? "events/" : "") + e.id + ".html"; }

  // 日期 → 2010-01-01 至 2027-01-01 之间的比例
  var T0 = Date.UTC(2010, 0, 1), T1 = Date.UTC(2027, 0, 1);
  function timeFrac(d) {
    var p = d.split("-");
    return (Date.UTC(+p[0], +p[1] - 1, +p[2]) - T0) / (T1 - T0);
  }
  // 损失 → 0..1（对数刻度，10 万美元到 100 亿美元）
  function lossFrac(n) {
    if (!n) return 0;
    var v = (Math.log10(n) - 5) / 5;
    return Math.max(0, Math.min(1, v));
  }

  // 列表和图上显示的金额：未确认事件显示区间
  function lossLabel(e) { return e.lossRange || (e.lossUsd == null ? "无可比金额" : "约 " + fmtUsd(e.lossUsd)); }

  window.ChronicleUtil = { fmtUsd: fmtUsd, lossLabel: lossLabel, fmtDate: fmtDate, caseNo: caseNo, hrefOf: hrefOf,
    el: el, sv: sv, timeFrac: timeFrac, lossFrac: lossFrac, mountThemeToggle: mountThemeToggle };
  // ---------- 详情页：案情要素 ----------
  function renderFacts(host, e) {
    host.textContent = "";
    var lossBox = el("div", "facts-loss");
    lossBox.appendChild(el("div", "k", e.provisional ? "报道金额（未确认）" : "损失（事发时价值）"));
    var main = e.lossUsd == null ? null : "约 " + fmtUsd(e.lossUsd);
    lossBox.appendChild(el("div", "v", e.lossRange || main || "无可比金额"));
    // lossText 里常带着和大字相同的美元数，去掉重复的部分，只留原生币种等补充信息
    var sub = e.lossText || "";
    if (main) {
      sub = sub.replace("（" + main + "）", "");
      if (sub.indexOf(main) === 0) sub = sub.slice(main.length).replace(/^[，、\s]+/, "").replace(/^（(.*)）$/, "$1");
    }
    if (sub) lossBox.appendChild(el("div", "sub", sub));
    host.appendChild(lossBox);

    var dl = el("dl");
    function row(k, v, cls) {
      var d = el("div");
      d.appendChild(el("dt", null, k));
      var dd = el("dd", cls || null, v);
      d.appendChild(dd);
      dl.appendChild(d);
      return dd;
    }
    row("时间", fmtDate(e.date));
    row("受害方类型", C.victims[e.victim]);
    row("链", e.chain);
    row("攻击手法", C.vectors[e.vector]);
    row("攻击者", e.attacker + (e.dprk === "confirmed" ? "（官方认定朝鲜）" : e.dprk === "suspected" ? "（疑似朝鲜）" : ""));
    var st = row("处置结果", C.statuses[e.status], "status " + e.status);
    st.appendChild(el("span", null, "。" + e.outcome));
    host.appendChild(dl);
  }

  // ---------- 详情页：编年小条 ----------
  function renderStrip(host, cur) {
    host.textContent = "";
    var W = 1000, H = 44, BASE = 40;
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", role: "img",
      "aria-label": "本案在 " + C.events.length + " 起事件中的位置，横轴为时间，竖线越高损失越大" });
    svg.appendChild(sv("line", { x1: 0, x2: W, y1: BASE, y2: BASE, class: "base", "vector-effect": "non-scaling-stroke" }));
    C.events.forEach(function (e) {
      var x = timeFrac(e.date) * W;
      var h = 6 + lossFrac(e.lossUsd) * 30;
      var a = sv("a", { href: hrefOf(e, false) });
      var t = sv("title", {});
      t.textContent = e.name + "，" + e.date + "，" + (e.lossUsd ? "约 " + fmtUsd(e.lossUsd) : "无可比金额");
      a.appendChild(t);
      a.appendChild(sv("rect", { x: x - 4, y: 0, width: 8, height: H, fill: "transparent" }));
      a.appendChild(sv("line", { x1: x, x2: x, y1: BASE, y2: BASE - h, class: "tick" + (e.id === cur.id ? " cur" : ""),
        "vector-effect": "non-scaling-stroke" }));
      svg.appendChild(a);
    });
    host.appendChild(svg);
    var cap = el("div", "cap");
    cap.appendChild(el("span", null, "2010"));
    cap.appendChild(el("span", null, "红线为本案，越高损失越大"));
    cap.appendChild(el("span", null, "2026"));
    host.appendChild(cap);
  }

  // ---------- 详情页：上一篇 / 下一篇 ----------
  function renderPager(host, i) {
    host.textContent = "";
    var prev = C.events[i - 1], next = C.events[i + 1];
    function link(e, label, cls) {
      var a = el("a", cls);
      a.href = hrefOf(e, false);
      a.appendChild(el("span", "k", label + "（" + e.date.slice(0, 4) + " 年）"));
      a.appendChild(document.createTextNode(e.name));
      return a;
    }
    if (prev) host.appendChild(link(prev, "上一起", "prev"));
    if (next) host.appendChild(link(next, "下一起", "next"));
  }

  // ---------- 详情页：目录 ----------
  function renderToc(host, article) {
    host.textContent = "";
    host.appendChild(el("p", null, "本页内容"));
    var ol = el("ol");
    var links = [];
    article.querySelectorAll("section[id] > h2").forEach(function (h) {
      var li = el("li"), a = el("a", null, h.textContent);
      a.href = "#" + h.parentNode.id;
      li.appendChild(a); ol.appendChild(li); links.push([h.parentNode, a]);
    });
    host.appendChild(ol);
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (p) { p[1].classList.toggle("on", p[0] === en.target); });
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    links.forEach(function (p) { io.observe(p[0]); });
  }

  function initDetail() {
    var id = document.body.getAttribute("data-id");
    if (!id || !C) return;
    var i = C.events.findIndex(function (e) { return e.id === id; });
    if (i < 0) return;
    var e = C.events[i];
    // 按事发年份找到所在时代，页面带上 tint-eN：顶栏色条、案卷号、目录当前项用这个时代的颜色
    var y = +e.date.slice(0, 4);
    var er = (C.eras || []).filter(function (x) { return y >= x.from && y <= x.to; })[0];
    if (er) document.body.classList.add("tinted", "tint-" + er.id);
    var q = function (s) { return document.querySelector("[data-slot=" + s + "]"); };
    if (q("caseno")) q("caseno").textContent = caseNo(i) + "（共 " + C.events.length + " 起）";
    if (q("facts")) renderFacts(q("facts"), e);
    if (q("strip")) renderStrip(q("strip"), e);
    if (q("pager")) renderPager(q("pager"), i);
    var art = document.querySelector(".article");
    if (q("toc") && art) renderToc(q("toc"), art);
  }

  document.addEventListener("DOMContentLoaded", function () {
    mountThemeToggle();
    initDetail();
  });
})();
