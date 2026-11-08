/* 区块链大事记：所有页面共用的脚本。
   1. 主题切换和 el、sv、fmtDate 在 shared/base.js，这里从 window.SiteBase 取（2026-11-06 起）
   2. 详情页：按 <body data-id> 从 data.js 渲染篇号、事件要素、四类小条、目录、同类上一篇/下一篇
   必须在 <head> 里、shared/base.js 和 data.js 之后同步加载。 */
(function () {
  var M = window.MILESTONES;
  // 主题切换和工具函数在 shared/base.js（2026-11-06 起五处合成一份）
  var SB = window.SiteBase, mountThemeToggle = SB.mountThemeToggle, el = SB.el, sv = SB.sv, fmtDate = SB.fmtDate;
  var CAT_ORDER = ["tech", "crash", "policy", "culture"];
  // 四类的纸色（共用层的 tint-e1…e6）：首页泳道底色、分类列表、详情页顶栏纸边、案卷号和目录当前项
  var CAT_TINT = { tech: "e5", crash: "e1", policy: "e4", culture: "e6" };
  function tintOf(c) { return CAT_TINT[c] ? " tint-" + CAT_TINT[c] : ""; }

  // ---------- 工具 ----------
  // 日期 → 2009-01-01 至 2027-01-01 之间的比例（从比特币创世区块所在的 2009 年算起）
  var T0 = Date.UTC(2009, 0, 1), T1 = Date.UTC(2027, 0, 1);
  function timeFrac(d) {
    var p = d.split("-");
    return (Date.UTC(+p[0], +p[1] - 1, +p[2]) - T0) / (T1 - T0);
  }
  function byDate(a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }
  function inCat(c) { return M.events.filter(function (e) { return e.cat === c; }).sort(byDate); }
  // 详情页之间、详情页与首页之间的相对路径
  function hrefOf(e, fromIndex) { return (fromIndex ? "events/" : "") + e.id + ".html"; }

  window.MilestoneUtil = { el: el, sv: sv, fmtDate: fmtDate, timeFrac: timeFrac, inCat: inCat, hrefOf: hrefOf,
    byDate: byDate, CAT_ORDER: CAT_ORDER, tintOf: tintOf, T0: T0, T1: T1, mountThemeToggle: mountThemeToggle };

  // ---------- 详情页：事件要素 ----------
  function renderFacts(host, e) {
    host.textContent = "";
    // 规模不是损失时（如技术、监管类）大字不用红色
    var box = el("div", "facts-loss" + (e.scale.loss ? "" : " ms-neutral"));
    box.appendChild(el("div", "k", e.scale.k));
    box.appendChild(el("div", "v", e.scale.v));
    if (e.scale.sub) box.appendChild(el("div", "sub", e.scale.sub));
    host.appendChild(box);
    var dl = el("dl");
    function row(k, v, cls) {
      var d = el("div", cls || null);
      d.appendChild(el("dt", null, k));
      d.appendChild(el("dd", null, v));
      dl.appendChild(d);
    }
    e.facts.forEach(function (f) { row(f[0], f[1]); });
    // “结局”只用于崩盘类；技术、监管、文化类的事件没有终局，改称“后续”
    row(e.cat === "crash" ? "结局" : "后续", e.outcome, "ms-wide");
    host.appendChild(dl);
  }

  // ---------- 详情页：四类小条（本篇在全部事件中的位置） ----------
  function renderStrip(host, cur) {
    host.textContent = "";
    host.classList.add("ms-strip");
    CAT_ORDER.forEach(function (c) {
      var lane = el("div", "ms-lane" + (c === cur.cat ? " on" : ""));
      lane.appendChild(el("span", "ms-lab", M.cats[c].short));
      var track = el("span", "ms-track");
      inCat(c).forEach(function (e) {
        var a = el("a", "ms-tick" + (e.id === cur.id ? " cur" : "") + (e.scale.loss ? " loss" : ""));
        a.href = hrefOf(e, false);
        a.title = e.name + "，" + e.date;
        a.setAttribute("aria-label", e.name + "，" + e.date);
        a.style.left = (timeFrac(e.date) * 100) + "%";
        track.appendChild(a);
      });
      lane.appendChild(track);
      host.appendChild(lane);
    });
    var cap = el("div", "cap");
    cap.appendChild(el("span", null, "2009"));
    cap.appendChild(el("span", null, "四行是四类事件，粗线为本篇"));
    cap.appendChild(el("span", null, "2026"));
    host.appendChild(cap);
  }

  // ---------- 详情页：同类上一篇 / 下一篇 ----------
  function renderPager(host, e) {
    host.textContent = "";
    var list = inCat(e.cat), i = list.indexOf(e);
    function link(x, label, cls) {
      var a = el("a", cls);
      a.href = hrefOf(x, false);
      a.appendChild(el("span", "k", label + "（" + x.date.slice(0, 4) + " 年）"));
      a.appendChild(document.createTextNode(x.name));
      return a;
    }
    if (list[i - 1]) host.appendChild(link(list[i - 1], "同类上一篇", "prev"));
    if (list[i + 1]) host.appendChild(link(list[i + 1], "同类下一篇", "next"));
    if (list.length < 2) {
      var a = el("a", "prev");
      a.href = "../index.html#cat-" + e.cat;
      a.appendChild(el("span", "k", "返回总览"));
      a.appendChild(document.createTextNode("查看四类事件的全部列表"));
      host.appendChild(a);
    }
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
    if (!id || !M) return;
    var e = M.events.filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    if (CAT_TINT[e.cat]) document.body.classList.add("tinted", "tint-" + CAT_TINT[e.cat]);
    var q = function (s) { return document.querySelector("[data-slot=" + s + "]"); };
    var list = inCat(e.cat);
    if (q("caseno")) q("caseno").textContent = M.cats[e.cat].name + "第 " + String(list.indexOf(e) + 1).padStart(2, "0") +
      " 篇（本类已收录 " + list.length + " 篇）";
    if (q("facts")) renderFacts(q("facts"), e);
    if (q("strip")) renderStrip(q("strip"), e);
    if (q("pager")) renderPager(q("pager"), e);
    var art = document.querySelector(".article");
    if (q("toc") && art) renderToc(q("toc"), art);
  }

  document.addEventListener("DOMContentLoaded", function () {
    mountThemeToggle();
    initDetail();
  });
})();
