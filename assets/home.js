/* 根目录总览页（index.html）的脚本：合并时间轴。
   读两站各自的 data.js（window.CHRONICLE、window.MILESTONES），不复制数据。
   主题切换和 el、sv、fmtDate、fmtUsd 在 shared/base.js，这里从 window.SiteBase 取（2026-11-06 起）。
   必须在 <head> 里、shared/base.js 和各站 data.js 之后同步加载。 */
(function () {
  var C = window.CHRONICLE, M = window.MILESTONES;
  // 主题切换和工具函数在 shared/base.js（2026-11-06 起五处合成一份）
  var SB = window.SiteBase, mountThemeToggle = SB.mountThemeToggle, el = SB.el, sv = SB.sv, fmtDate = SB.fmtDate, fmtUsd = SB.fmtUsd;

  // ---------- 工具 ----------
  function textW(s, fs) {
    var w = 0;
    for (var i = 0; i < s.length; i++) w += s.charCodeAt(i) > 255 ? fs : fs * 0.58;
    return w;
  }
  function overlap(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }
  function byDate(a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }

  // ---------- 三个站的事件合成一张表 ----------
  // 大事记、诈骗站 links 里的事件本来就是被盗站的事件，只从被盗站取一次，不会重复
  var CAT_ORDER = ["tech", "crash", "policy", "culture"];
  // 泳道：大事记四类在上，诈骗站四类合成一条放在最下面
  var LANES = CAT_ORDER.concat(["scam"]);
  var S = window.SCAMS;
  var ITEMS = [];
  if (C) C.events.forEach(function (e) {
    ITEMS.push({ site: "hacks", id: e.id, date: e.date, name: e.name, short: e.short,
      usd: e.lossUsd, prov: !!e.provisional,
      v: e.lossRange || (e.lossUsd == null ? "无可比金额" : "约 " + fmtUsd(e.lossUsd)),
      href: "hacks/events/" + e.id + ".html" });
  });
  if (M) M.events.forEach(function (e) {
    ITEMS.push({ site: "ms", id: e.id, date: e.date, name: e.name, short: e.short,
      cat: e.cat, loss: !!e.scale.loss, pin: !!e.pin, v: e.scale.v,
      meta: M.cats[e.cat].name, href: "milestones/events/" + e.id + ".html" });
  });
  if (S) S.events.forEach(function (e) {
    ITEMS.push({ site: "scams", id: e.id, date: e.date, name: e.name, short: e.short,
      cat: "scam", loss: !!e.scale.loss, pin: !!e.pin, v: e.scale.v,
      meta: S.cats[e.cat].name, href: "scams/events/" + e.id + ".html" });
  });
  ITEMS.sort(byDate);

  // ---------- 合并时间轴 ----------
  // 上半部分：被盗事件，竖线高度是损失（对数刻度，10 万到 100 亿美元）；下半部分：大事记的四条泳道
  // 时间从 2009 年起，和大事记首页一致（大事记有 2009-01-03 的创世区块）
  var T0 = Date.UTC(2009, 0, 1), T1 = Date.UTC(2027, 0, 1), L0 = 5, L1 = 10;
  function tOf(d) { var p = d.split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function axUsd(n) { return n >= 1e8 ? (n / 1e8) + "亿" : (n / 1e4) + "万"; }
  var hz = { marks: [], cur: -1 };

  function drawChart(host) {
    var old = host.querySelector("svg"); if (old) old.remove();
    var W = Math.max(320, host.clientWidth), narrow = W < 640;
    var P = { l: narrow ? 44 : 96, r: 12, t: 30, b: 26 };
    var bandH = narrow ? 180 : 260, gap = 26, laneH = narrow ? 54 : 60;
    var pw = W - P.l - P.r, base = P.t + bandH, lane0 = base + gap;
    var H = lane0 + laneH * LANES.length + P.b;
    var X = function (d) { return P.l + (tOf(d) - T0) / (T1 - T0) * pw; };
    var Y = function (v) { return P.t + (1 - (Math.log10(v) - L0) / (L1 - L0)) * bandH; };
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, tabindex: "0", role: "group",
      "aria-label": "合并时间轴：上半部分是 " + (C ? C.events.length : 0) + " 起被盗事件，下半部分是大事记的四类事件和诈骗与骗局。用左右方向键按日期逐个查看，回车打开详情。" });
    // 上半部分垫被盗站六个时代的底色，上沿 4px 色条（同被盗站地震图）；只是底色，竖线和圆点仍是红色
    if (C && C.eras) C.eras.forEach(function (er) {
      var x0 = X(Math.max(er.from, 2009) + "-01-01"), x1 = X((er.to + 1) + "-01-01");
      svg.appendChild(sv("rect", { x: x0, y: P.t, width: x1 - x0, height: bandH, class: "sz-band tint-" + er.id }));
      svg.appendChild(sv("rect", { x: x0 + 0.5, y: P.t - 4, width: Math.max(0, x1 - x0 - 1), height: 4, class: "sz-cap tint-" + er.id }));
    });
    // 年份网格贯穿上下两部分
    for (var y = 2009; y <= 2026; y++) {
      var gx = X(y + "-01-01");
      svg.appendChild(sv("line", { x1: gx, x2: gx, y1: P.t, y2: H - P.b, class: "sz-grid" }));
      if (y % (narrow ? 4 : 2) === 0) {
        var ty = sv("text", { x: X(y + "-07-01"), y: H - 8, "text-anchor": "middle", class: "sz-ax" });
        ty.textContent = y; svg.appendChild(ty);
      }
    }
    // 金额网格
    for (var k = L0; k <= L1; k++) {
      if (narrow && k % 2 === 0 && k !== L0 && k !== L1) continue;
      var gy = Y(Math.pow(10, k));
      svg.appendChild(sv("line", { x1: P.l, x2: W - P.r, y1: gy, y2: gy, class: k === L0 ? "hm-base" : "sz-grid" }));
      var tl = sv("text", { x: P.l - 8, y: gy + 4, "text-anchor": "end", class: "sz-ax" });
      tl.textContent = axUsd(Math.pow(10, k)); svg.appendChild(tl);
    }
    var bl = sv("text", { x: P.l, y: P.t - 12, class: "hm-band-lab" });
    bl.textContent = "被盗事件（损失金额）"; svg.appendChild(bl);
    var boxes = [{ x: P.l, y: P.t - 26, w: textW(bl.textContent, 13), h: 18 }];
    var laneY = {};
    LANES.forEach(function (c, i) {
      var cy = lane0 + laneH * i + laneH / 2;
      laneY[c] = cy;
      svg.appendChild(sv("line", { x1: P.l, x2: W - P.r, y1: cy, y2: cy, class: "hm-lane-line" }));
      var ll = sv("text", { x: 0, y: cy + 4, class: "hm-lane-lab" });
      ll.textContent = c === "scam" ? (narrow ? "诈骗" : "诈骗与骗局") : M ? (narrow ? M.cats[c].short : M.cats[c].name) : c;
      svg.appendChild(ll);
      // 诈骗站还没有页面时，泳道上写“整理中”
      if (c === "scam" && !(S && S.events.length)) {
        var e0 = sv("text", { x: P.l + 6, y: cy - 9, class: "hm-lane-lab" });
        e0.textContent = "整理中"; svg.appendChild(e0);
      }
    });
    // 事件：按日期排列，方向键也按这个顺序走
    hz.marks = ITEMS.map(function (it) {
      var x = X(it.date), g = sv("g", { class: "hm-mark", "data-id": it.id }), m = { it: it, x: x, g: g };
      if (it.site === "hacks") {
        var has = it.usd != null, top = has ? Y(Math.max(it.usd, 1e5)) : base;
        if (has) g.appendChild(sv("line", { x1: x, x2: x, y1: base, y2: top, class: "hm-spike" + (it.prov ? " prov" : "") }));
        g.appendChild(sv("circle", { cx: x, cy: top, r: has ? 3.5 : 4, class: "hm-dot" + (!has ? " none" : it.prov ? " prov" : "") }));
        boxes.push({ x: x - 5, y: top - 5, w: 10, h: 10 });
        if (has) boxes.push({ x: x - 1.5, y: top, w: 3, h: base - top });
        m.y0 = top; m.y1 = base;
      } else {
        var cy = laneY[it.cat];
        g.appendChild(sv("circle", { cx: x, cy: cy, r: 5.5, class: "hm-ms" + (it.loss ? " loss" : "") }));
        m.y0 = m.y1 = cy;
      }
      svg.appendChild(g);
      return m;
    });
    // 被盗事件：直接标注金额最大的几起，放不下就换到点的左边或上方，再放不下就不标
    var big = hz.marks.filter(function (m) { return m.it.site === "hacks" && m.it.usd != null && !m.it.prov; })
      .sort(function (a, b) { return b.it.usd - a.it.usd; }).slice(0, narrow ? 6 : 12);
    var placed = 0, limit = narrow ? 3 : 8;
    big.forEach(function (m) {
      if (placed >= limit) return;
      var val = fmtUsd(m.it.usd).replace("美元", ""), w = textW(m.it.short + " " + val, 12.5) + 4;
      var cands = [[m.x + 7, m.y0 + 4], [m.x - 7 - w, m.y0 + 4], [m.x - w / 2, m.y0 - 10]];
      for (var c = 0; c < cands.length; c++) {
        var bx = { x: cands[c][0], y: cands[c][1] - 12, w: w, h: 15 };
        if (bx.x < P.l || bx.x + bx.w > W - P.r || bx.y < 0) continue;
        if (boxes.some(function (b) { return overlap(b, bx); })) continue;
        var t = sv("text", { x: bx.x, y: cands[c][1], class: "hm-lab" });
        t.appendChild(document.createTextNode(m.it.short + " "));
        var ts = sv("tspan", { class: "v" }); ts.textContent = val; t.appendChild(ts);
        m.g.appendChild(t);
        boxes.push(bx); placed++;
        break;
      }
    });
    // 大事记：和大事记首页一样，先给 pin 的事件排标签，标签先放点的上方，重叠时放下方，都放不下才省略
    LANES.forEach(function (c) {
      var cy = laneY[c], top = [], bot = [];
      var list = hz.marks.filter(function (m) { return m.it.cat === c; });
      list.filter(function (m) { return m.it.pin; }).concat(list.filter(function (m) { return !m.it.pin; })).forEach(function (m) {
        var w = textW(m.it.short, 12.5), x0 = m.x - w / 2, anchor = "middle", tx = m.x, ly = null;
        if (x0 < P.l) { anchor = "start"; tx = m.x - 4; x0 = tx; }
        else if (x0 + w > W - P.r) { anchor = "end"; tx = m.x + 4; x0 = tx - w; }
        var free = function (occ) { return occ.every(function (r) { return x0 + w + 6 < r[0] || x0 > r[1] + 6; }); };
        if (free(top)) { ly = cy - 11; top.push([x0, x0 + w]); }
        else if (free(bot)) { ly = cy + 22; bot.push([x0, x0 + w]); }
        if (ly === null) return;
        var t = sv("text", { x: tx, y: ly, "text-anchor": anchor, class: "hm-lab" });
        t.textContent = m.it.short;
        m.g.appendChild(t);
      });
    });
    // 透明命中层，让整块区域都能响应指针
    svg.appendChild(sv("rect", { x: 0, y: 0, width: W, height: H, class: "hm-hit" }));
    host.insertBefore(svg, host.firstChild);
    hz.svg = svg; hz.W = W; hz.H = H;
    return svg;
  }

  // 找离指针最近的事件：被盗事件按整根竖线算，竖向距离按 0.6 折算；超过 30px 不算
  function nearest(px, py) {
    var best = -1, bd = Infinity;
    hz.marks.forEach(function (m, i) {
      var dy = py < m.y0 ? m.y0 - py : py > m.y1 ? py - m.y1 : 0;
      var d = Math.abs(px - m.x) + dy * 0.6;
      if (d < bd) { bd = d; best = i; }
    });
    return bd <= 30 ? best : -1;
  }
  function showMark(host, i) {
    var tip = host.querySelector(".tip");
    hz.marks.forEach(function (m, j) { m.g.classList.toggle("hm-on", j === i); });
    hz.cur = i;
    if (i < 0 || !hz.marks[i]) { tip.hidden = true; return; }
    var m = hz.marks[i], it = m.it;
    tip.textContent = "";
    tip.appendChild(el("div", "tv", it.v));
    tip.appendChild(el("div", "tn", it.name));
    tip.appendChild(el("div", "tm", fmtDate(it.date) + "，" + (it.site === "hacks" ? "被盗事件编年史" : (it.site === "scams" ? "诈骗与骗局·" : "大事记·") + it.meta)));
    tip.hidden = false;
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = m.x + 12 + tw > hz.W ? m.x - 12 - tw : m.x + 12;
    var topY = Math.max(0, Math.min(m.y0 - th / 2, hz.H - th));
    tip.style.left = Math.max(0, left) + "px";
    tip.style.top = topY + "px";
  }

  function bindChart(host, svg) {
    var lastPointer = "mouse";
    // 指针位置换算成 SVG 坐标；用 getScreenCTM，页面整体缩放时也能对上
    function local(ev) {
      var m = svg.getScreenCTM();
      if (m) {
        var p = svg.createSVGPoint();
        p.x = ev.clientX; p.y = ev.clientY;
        p = p.matrixTransform(m.inverse());
        return [p.x, p.y];
      }
      var r = svg.getBoundingClientRect();
      return [ev.clientX - r.left, ev.clientY - r.top];
    }
    svg.addEventListener("pointerdown", function (ev) { lastPointer = ev.pointerType; });
    svg.addEventListener("pointermove", function (ev) {
      lastPointer = ev.pointerType;
      if (ev.pointerType === "touch") return;
      var p = local(ev), i = nearest(p[0], p[1]);
      if (i !== hz.cur) showMark(host, i);
      svg.style.cursor = i >= 0 ? "pointer" : "default";
    });
    svg.addEventListener("pointerleave", function () { if (document.activeElement !== svg) showMark(host, -1); });
    svg.addEventListener("click", function (ev) {
      var p = local(ev), i = nearest(p[0], p[1]);
      if (i < 0) { showMark(host, -1); return; }
      // 触屏：第一次点显示信息，再点同一起才打开
      if (lastPointer === "touch" && hz.cur !== i) { showMark(host, i); return; }
      location.href = hz.marks[i].it.href;
    });
    svg.addEventListener("keydown", function (ev) {
      var n = hz.marks.length, i = hz.cur;
      if (!n) return;
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") i = i < 0 ? 0 : Math.min(n - 1, i + 1);
      else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") i = i < 0 ? n - 1 : Math.max(0, i - 1);
      else if (ev.key === "Home") i = 0;
      else if (ev.key === "End") i = n - 1;
      else if (ev.key === "Enter" && i >= 0) { location.href = hz.marks[i].it.href; return; }
      else if (ev.key === "Escape") { showMark(host, -1); return; }
      else return;
      ev.preventDefault(); showMark(host, i);
    });
    // 只有键盘聚焦时才自动显示第一起，鼠标点击带来的聚焦不显示
    svg.addEventListener("focus", function () { if (svg.matches(":focus-visible") && hz.cur < 0) showMark(host, 0); });
    svg.addEventListener("blur", function () { showMark(host, -1); });
  }
  function mountChart() {
    var host = document.getElementById("chart");
    if (!host) return;
    var w0 = 0;
    function draw() { bindChart(host, drawChart(host)); w0 = host.clientWidth; }
    draw();
    if ("ResizeObserver" in window) new ResizeObserver(function () {
      if (Math.abs(host.clientWidth - w0) > 4) { showMark(host, -1); draw(); }
    }).observe(host);
  }

  function fillSlots() {
    var nh = C ? C.events.length : 0, nm = M ? M.events.length : 0, ns = S ? S.events.length : 0;
    var set = function (k, v) { var n = document.querySelector("[data-slot=" + k + "]"); if (n) n.textContent = v; };
    set("total", nh + nm + ns); set("hacks", nh); set("ms", nm); set("sc", ns);
    // 基础知识没有日期，不进时间轴，只在入口卡片上显示章数
    if (window.BASICS) set("bs", window.BASICS.chapters.length);
    set("updated", "被盗事件编年史的数据更新于 " + (C ? fmtDate(C.updated) : "—") +
      "，区块链大事记的数据更新于 " + (M ? fmtDate(M.updated) : "—") +
      "，诈骗与骗局的数据更新于 " + (S ? fmtDate(S.updated) : "—") + "。");
  }

  document.addEventListener("DOMContentLoaded", function () {
    mountThemeToggle();
    fillSlots();
    mountChart();
  });
})();
