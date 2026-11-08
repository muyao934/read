/* 首页：损失地震图、关键数字、统计图、按时代分组的事件列表与筛选。
   依赖 data.js（window.CHRONICLE）和 page.js（window.ChronicleUtil）。 */
(function () {
  var C = window.CHRONICLE, U = window.ChronicleUtil;
  var EV = C.events;
  var el = U.el, sv = U.sv;

  function yearOf(e) { return +e.date.slice(0, 4); }
  function eraOfYear(y) {
    for (var i = 0; i < C.eras.length; i++) if (y >= C.eras[i].from && y <= C.eras[i].to) return C.eras[i];
    return null;
  }
  function eraOf(e) { return eraOfYear(yearOf(e)); }
  // 时代着色用的 class：tint-e1…tint-e6，颜色定义在 style.css
  function tintOf(er) { return er ? " tint-" + er.id : ""; }
  // 计入合计的事件：有金额且不是“未确认”
  function counted(e) { return e.lossUsd != null && !e.provisional; }
  function sum(list) { return list.filter(counted).reduce(function (a, e) { return a + e.lossUsd; }, 0); }
  // 坐标轴上的金额：10万 / 1亿 / 10亿
  function axUsd(n) {
    if (n >= 1e8) return (n / 1e8) + "亿";
    if (n >= 1e4) return (n / 1e4) + "万";
    return String(n);
  }
  // 粗略估算文字宽度（中文按 1 个字号，其余按 0.58 个字号）
  function textW(s, fs) {
    var w = 0;
    for (var i = 0; i < s.length; i++) w += /[　-鿿＀-￯]/.test(s[i]) ? fs : fs * 0.58;
    return w;
  }
  function overlap(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }

  // ---------- 关键数字 ----------
  function renderKpis() {
    var host = document.getElementById("kpis");
    if (!host) return;
    var total = sum(EV);
    var dprk = sum(EV.filter(function (e) { return e.dprk; }));
    var dprkN = EV.filter(function (e) { return e.dprk; }).length;
    var made = EV.filter(function (e) { return e.status === "recovered" || e.status === "compensated"; }).length;
    var prov = EV.filter(function (e) { return e.provisional; });
    var items = [
      [EV.length + " 起", "收录事件，" + C.eras[0].from + "–" + C.eras[C.eras.length - 1].to + " 年"],
      ["约 " + U.fmtUsd(total), "合计损失（事发时价值）" + (prov.length ? "，不含未确认的" + prov.map(function (e) { return e.short; }).join("、") : "")],
      [Math.round(dprk / total * 100) + "%", dprkN + " 起与朝鲜相关的事件占合计损失的比例"],
      [made + " 起", "资金基本追回或用户获得赔付，占 " + Math.round(made / EV.length * 100) + "%"]
    ];
    host.textContent = "";
    items.forEach(function (it) {
      var d = el("div", "kpi");
      d.appendChild(el("div", "v", it[0]));
      d.appendChild(el("div", "k", it[1]));
      host.appendChild(d);
    });
  }
  // ---------- 损失地震图 ----------
  var T0 = Date.UTC(2010, 0, 1), T1 = Date.UTC(2027, 0, 1), L0 = 5, L1 = 10; // 时间范围；金额 10^5–10^10 美元
  var sz = { marks: [], cur: -1 };
  function tOf(d) { var p = d.split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }

  function drawSeismo(host, animate) {
    var old = host.querySelector("svg"); if (old) old.remove();
    var W = Math.max(300, host.clientWidth), narrow = W < 640;
    var H = narrow ? 260 : 360, M = { l: 52, r: 8, t: 30, b: 26 };
    var pw = W - M.l - M.r, ph = H - M.t - M.b;
    var X = function (t) { return M.l + (t - T0) / (T1 - T0) * pw; };
    var Y = function (v) { return M.t + (1 - (Math.log10(v) - L0) / (L1 - L0)) * ph; };
    var base = M.t + ph;
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, tabindex: "0", role: "group",
      "aria-label": "损失地震图：" + EV.length + " 起事件按时间排列，竖线高度表示损失。用左右方向键逐个查看，回车打开详情。" });
    var boxes = [];
    // 时代底色与名称
    C.eras.forEach(function (er, i) {
      var x0 = X(Date.UTC(er.from, 0, 1)), x1 = X(Date.UTC(er.to + 1, 0, 1));
      svg.appendChild(sv("rect", { x: x0, y: M.t, width: x1 - x0, height: ph, class: "sz-band" + tintOf(er) }));
      svg.appendChild(sv("rect", { x: x0 + 0.5, y: M.t - 4, width: Math.max(0, x1 - x0 - 1), height: 4, class: "sz-cap" + tintOf(er) }));
      var name = textW(er.name, 12) + 8 <= x1 - x0 ? er.name : textW(er.short, 12) + 8 <= x1 - x0 ? er.short : "";
      if (!name) return;
      var t = sv("text", { x: x0 + 4, y: M.t - 10, class: "sz-band-t" }); t.textContent = name; svg.appendChild(t);
      boxes.push({ x: x0 + 4, y: M.t - 24, w: textW(name, 12), h: 16 });
    });
    // 金额网格（对数）
    for (var k = L0; k <= L1; k++) {
      if (narrow && k % 2 === 0 && k !== L0 && k !== L1) continue;
      var y = Y(Math.pow(10, k));
      svg.appendChild(sv("line", { x1: M.l, x2: W - M.r, y1: y, y2: y, class: k === L0 ? "sz-base" : "sz-grid" }));
      var tl = sv("text", { x: M.l - 8, y: y + 4, "text-anchor": "end", class: "sz-ax" }); tl.textContent = axUsd(Math.pow(10, k)); svg.appendChild(tl);
    }
    // 年份
    for (var yr = 2010; yr <= 2026; yr += narrow ? 4 : 2) {
      var tx = sv("text", { x: X(Date.UTC(yr, 6, 1)), y: H - 6, "text-anchor": "middle", class: "sz-ax" });
      tx.textContent = String(yr); svg.appendChild(tx);
    }
    // 事件
    sz.marks = EV.map(function (e, i) {
      var x = X(tOf(e.date)), has = e.lossUsd != null, top = has ? Y(e.lossUsd) : base;
      var g = sv("g", { class: "sz-mark" + tintOf(eraOf(e)) });
      var delay = animate ? (i * 18) + "ms" : null;
      if (has) {
        var ln = sv("line", { x1: x, x2: x, y1: base, y2: top, class: "sz-spike" + (e.provisional ? " prov" : "") });
        if (delay) ln.style.animationDelay = delay;
        g.appendChild(ln);
      }
      var dot = sv("circle", { cx: x, cy: top, r: has ? 3.5 : 4, class: "sz-dot" + (!has ? " none" : e.provisional ? " prov" : "") });
      if (delay) dot.style.animationDelay = (i * 18 + 420) + "ms";
      g.appendChild(dot);
      svg.appendChild(g);
      // 点和整根竖线都算作占位，标注不能压在别的竖线上
      boxes.push({ x: x - 5, y: top - 5, w: 10, h: 10 });
      if (has) boxes.push({ x: x - 1.5, y: top, w: 3, h: base - top });
      return { e: e, x: x, top: top, g: g };
    });
    // 直接标注金额最大的几起；放不下就换到点的左边或上方，再放不下就不标
    var top = EV.map(function (e, i) { return i; }).filter(function (i) { return EV[i].lossUsd != null; })
      .sort(function (a, b) { return EV[b].lossUsd - EV[a].lossUsd; }).slice(0, narrow ? 6 : 12);
    var placed = 0, limit = narrow ? 4 : 8;
    top.forEach(function (i) {
      if (placed >= limit) return;
      var m = sz.marks[i], e = m.e;
      var val = (e.lossRange || U.fmtUsd(e.lossUsd)).replace("美元", "");
      var w = textW(e.short + " " + val, 12.5) + 4;
      var cands = [[m.x + 7, m.top + 4], [m.x - 7 - w, m.top + 4], [m.x - w / 2, m.top - 10]];
      for (var c = 0; c < cands.length; c++) {
        var bx = { x: cands[c][0], y: cands[c][1] - 12, w: w, h: 15 };
        if (bx.x < M.l || bx.x + bx.w > W - M.r || bx.y < 0) continue;
        if (boxes.some(function (b) { return overlap(b, bx); })) continue;
        var t = sv("text", { x: bx.x, y: cands[c][1], class: "sz-lab" });
        t.appendChild(document.createTextNode(e.short + " "));
        var ts = sv("tspan", { class: "v" }); ts.textContent = val; t.appendChild(ts);
        svg.appendChild(t);
        boxes.push(bx);
        placed++;
        break;
      }
    });
    // 透明命中层，让整块区域都能响应指针
    svg.appendChild(sv("rect", { x: 0, y: 0, width: W, height: H, class: "sz-hit" }));
    host.insertBefore(svg, host.firstChild);
    sz.svg = svg; sz.W = W; sz.H = H; sz.base = base;
    bindSeismo(host, svg);
  }

  // 找离指针最近的事件：横向距离为主，纵向离竖线越远代价越大
  function nearest(px, py) {
    var best = -1, bd = Infinity;
    sz.marks.forEach(function (m, i) {
      var dy = py < m.top ? m.top - py : py > sz.base ? py - sz.base : 0;
      var d = Math.abs(px - m.x) + dy * 0.6;
      if (d < bd || (d === bd && best >= 0 && m.top > sz.marks[best].top)) { bd = d; best = i; }
    });
    return bd <= 40 ? best : -1;
  }

  function showMark(host, i) {
    var tip = host.querySelector(".tip");
    sz.marks.forEach(function (m, j) { m.g.classList.toggle("sz-on", j === i); });
    sz.cur = i;
    if (i < 0) { tip.hidden = true; return; }
    var m = sz.marks[i], e = m.e;
    tip.textContent = "";
    tip.appendChild(el("div", "tv", U.lossLabel(e)));
    tip.appendChild(el("div", "tn", e.name));
    tip.appendChild(el("div", "tm", U.fmtDate(e.date) + "，" + C.vectors[e.vector]));
    tip.hidden = false;
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = m.x + 12 + tw > sz.W ? m.x - 12 - tw : m.x + 12;
    var topY = Math.max(0, Math.min(m.top - th / 2, sz.H - th));
    tip.style.left = Math.max(0, left) + "px";
    tip.style.top = topY + "px";
  }

  function bindSeismo(host, svg) {
    var lastPointer = "mouse";
    function local(ev) { var r = svg.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
    svg.addEventListener("pointermove", function (ev) {
      lastPointer = ev.pointerType;
      if (ev.pointerType === "touch") return;
      var p = local(ev); showMark(host, nearest(p[0], p[1]));
      svg.style.cursor = sz.cur >= 0 ? "pointer" : "default";
    });
    svg.addEventListener("pointerleave", function () { if (document.activeElement !== svg) showMark(host, -1); });
    svg.addEventListener("click", function (ev) {
      var p = local(ev), i = nearest(p[0], p[1]);
      if (i < 0) { showMark(host, -1); return; }
      // 触屏：第一次点显示信息，再点同一起才打开
      if (lastPointer === "touch" && sz.cur !== i) { showMark(host, i); return; }
      location.href = U.hrefOf(sz.marks[i].e, true);
    });
    svg.addEventListener("pointerdown", function (ev) { lastPointer = ev.pointerType; });
    svg.addEventListener("keydown", function (ev) {
      var n = sz.marks.length, i = sz.cur;
      if (ev.key === "ArrowRight") i = i < 0 ? 0 : Math.min(n - 1, i + 1);
      else if (ev.key === "ArrowLeft") i = i < 0 ? n - 1 : Math.max(0, i - 1);
      else if (ev.key === "Home") i = 0;
      else if (ev.key === "End") i = n - 1;
      else if (ev.key === "Enter" && i >= 0) { location.href = U.hrefOf(sz.marks[i].e, true); return; }
      else if (ev.key === "Escape") { showMark(host, -1); return; }
      else return;
      ev.preventDefault(); showMark(host, i);
    });
    // 只有键盘聚焦时才自动显示第一起，鼠标点击带来的聚焦不显示
    svg.addEventListener("focus", function () { if (svg.matches(":focus-visible") && sz.cur < 0) showMark(host, 0); });
    svg.addEventListener("blur", function () { showMark(host, -1); });
  }

  function mountSeismo() {
    var host = document.getElementById("seismo");
    if (!host) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) { host.classList.add("anim"); setTimeout(function () { host.classList.remove("anim"); }, 2600); }
    drawSeismo(host, !reduce);
    var lastW = host.clientWidth;
    if ("ResizeObserver" in window) new ResizeObserver(function () {
      if (Math.abs(host.clientWidth - lastW) < 8) return;
      lastW = host.clientWidth; drawSeismo(host, false);
    }).observe(host);
  }
  // ---------- 每年被盗金额 ----------
  function yearSums() {
    var out = [];
    for (var y = 2010; y <= 2026; y++) {
      var list = EV.filter(function (e) { return yearOf(e) === y; });
      out.push({ y: y, v: sum(list), n: list.length, list: list });
    }
    return out;
  }
  function niceMax(v) { var step = 10e8; return Math.max(step, Math.ceil(v / step) * step); }
  function barPath(x, yTop, w, yBase) {
    var r = Math.min(4, w / 2, yBase - yTop);
    if (r <= 0) return "";
    return "M" + x + "," + yBase + " V" + (yTop + r) + " Q" + x + "," + yTop + " " + (x + r) + "," + yTop +
      " H" + (x + w - r) + " Q" + (x + w) + "," + yTop + " " + (x + w) + "," + (yTop + r) + " V" + yBase + " Z";
  }

  function renderYearChart() {
    var card = document.getElementById("ch-year");
    if (!card) return;
    var host = card.querySelector(".plot"), tip = card.querySelector(".tip");
    host.textContent = "";
    var data = yearSums();
    var W = Math.max(280, host.clientWidth), H = 240, M = { l: 40, r: 6, t: 22, b: 24 };
    var pw = W - M.l - M.r, ph = H - M.t - M.b;
    var max = niceMax(Math.max.apply(null, data.map(function (d) { return d.v; })));
    var band = pw / data.length, bw = Math.max(4, Math.min(24, band - 4));
    var Y = function (v) { return M.t + (1 - v / max) * ph; };
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img",
      "aria-label": "每年被盗金额柱状图，详细数字见下方统计表" });
    for (var g = 0; g <= max; g += max / 4) {
      var gy = Y(g);
      svg.appendChild(sv("line", { x1: M.l, x2: W - M.r, y1: gy, y2: gy, class: g === 0 ? "ch-base" : "ch-grid" }));
      var gl = sv("text", { x: M.l - 6, y: gy + 4, "text-anchor": "end", class: "ch-ax" }); gl.textContent = String(g / 1e8); svg.appendChild(gl);
    }
    var labelled = data.slice().sort(function (a, b) { return b.v - a.v; }).slice(0, 4).map(function (d) { return d.y; });
    data.forEach(function (d, i) {
      var cx = M.l + band * i + band / 2, x = cx - bw / 2, yTop = Y(d.v);
      var bar = sv("path", { d: barPath(x, yTop, bw, Y(0)), class: "ch-bar yr" + tintOf(eraOfYear(d.y)) });
      var hit = sv("rect", { x: M.l + band * i, y: M.t, width: band, height: ph, class: "ch-hit" });
      svg.appendChild(bar); svg.appendChild(hit);
      if ((d.y - 2010) % (band < 30 ? 4 : 2) === 0) { var yl = sv("text", { x: cx, y: H - 6, "text-anchor": "middle", class: "ch-ax" }); yl.textContent = String(d.y); svg.appendChild(yl); }
      if (labelled.indexOf(d.y) >= 0 && d.v > 0) {
        var vl = sv("text", { x: cx, y: yTop - 6, "text-anchor": "middle", class: "ch-val" });
        vl.textContent = (d.v / 1e8).toFixed(d.v >= 1e9 ? 0 : 1); svg.appendChild(vl);
      }
      hit.addEventListener("pointerenter", function () {
        bar.classList.add("on");
        tip.textContent = "";
        tip.appendChild(el("div", "tv", d.v ? "约 " + U.fmtUsd(d.v) : "无"));
        tip.appendChild(el("div", "tn", d.y + " 年，" + d.n + " 起"));
        var names = d.list.map(function (e) { return e.short + (e.provisional ? "（未确认，未计入）" : ""); }).join("、");
        if (names) tip.appendChild(el("div", "tm", names));
        tip.hidden = false;
        var tw = tip.offsetWidth, left = host.offsetLeft + cx + 10;
        if (left + tw > card.clientWidth) left = host.offsetLeft + cx - 10 - tw;
        tip.style.left = Math.max(0, left) + "px";
        tip.style.top = (host.offsetTop + Math.max(0, yTop - 30)) + "px";
      });
      hit.addEventListener("pointerleave", function () { bar.classList.remove("on"); tip.hidden = true; });
    });
    host.appendChild(svg);
    // 脚注：说明特大事件和未确认事件对柱子的影响
    var notes = [];
    EV.filter(function (e) { return e.disputed && counted(e) && e.lossUsd >= 1e9; }).forEach(function (e) {
      notes.push(yearOf(e) + " 年的柱子主要来自 " + e.short + "（约 " + U.fmtUsd(e.lossUsd) + "，归属有争议）");
    });
    EV.filter(function (e) { return e.provisional; }).forEach(function (e) {
      notes.push(yearOf(e) + " 年不含" + e.short + "（报道金额 " + (e.lossRange || U.fmtUsd(e.lossUsd)) + "，未确认）");
    });
    card.querySelector(".foot").textContent = notes.join("；") + (notes.length ? "。" : "");
  }
  // ---------- 按攻击手法 ----------
  function vectorRows() {
    return Object.keys(C.vectors).map(function (k) {
      var list = EV.filter(function (e) { return e.vector === k; });
      return { k: k, name: C.vectors[k], v: sum(list), n: list.length };
    }).filter(function (r) { return r.n > 0; }).sort(function (a, b) { return b.v - a.v || b.n - a.n; });
  }

  function renderVectorChart() {
    var card = document.getElementById("ch-vector");
    if (!card) return;
    var host = card.querySelector(".plot");
    host.textContent = "";
    var rows = vectorRows();
    var W = Math.max(280, host.clientWidth), LW = 128, RW = 92, rowH = 30, bh = 14;
    var H = rows.length * rowH + 4, pw = W - LW - RW;
    var max = Math.max.apply(null, rows.map(function (r) { return r.v; })) || 1;
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img",
      "aria-label": "按攻击手法统计的被盗金额条形图，数字直接标在条形右侧" });
    svg.appendChild(sv("line", { x1: LW, x2: LW, y1: 0, y2: H, class: "ch-base" }));
    rows.forEach(function (r, i) {
      var y = i * rowH + (rowH - bh) / 2, w = Math.max(r.v ? 2 : 0, r.v / max * pw);
      var lab = sv("text", { x: LW - 8, y: y + bh - 2, "text-anchor": "end", class: "ch-lab" });
      lab.textContent = r.name; svg.appendChild(lab);
      if (w > 0) {
        var r4 = Math.min(4, w / 2), x0 = LW, y0 = y, y1 = y + bh, x1 = LW + w;
        svg.appendChild(sv("path", { class: "ch-bar", d: "M" + x0 + "," + y0 + " H" + (x1 - r4) + " Q" + x1 + "," + y0 + " " + x1 + "," + (y0 + r4) +
          " V" + (y1 - r4) + " Q" + x1 + "," + y1 + " " + (x1 - r4) + "," + y1 + " H" + x0 + " Z" }));
      }
      var val = sv("text", { x: LW + w + 6, y: y + bh - 2, class: "ch-val" });
      val.textContent = (r.v ? (r.v / 1e8).toFixed(r.v >= 1e9 ? 0 : 1) + " 亿" : "—") + "，" + r.n + " 起";
      svg.appendChild(val);
    });
    host.appendChild(svg);
  }

  // ---------- 朝鲜相关 ----------
  function renderDprk() {
    var host = document.getElementById("ch-dprk");
    if (!host) return;
    var total = sum(EV);
    var conf = EV.filter(function (e) { return e.dprk === "confirmed"; });
    var susp = EV.filter(function (e) { return e.dprk === "suspected"; });
    var vc = sum(conf), vs = sum(susp);
    host.textContent = "";
    var left = el("div");
    left.appendChild(el("h3", null, "朝鲜相关事件的份额"));
    left.appendChild(el("p", "sub", "占本站收录事件合计损失的比例"));
    left.appendChild(el("div", "big", Math.round((vc + vs) / total * 100) + "%"));
    var meter = el("div", "meter");
    meter.setAttribute("role", "img");
    meter.setAttribute("aria-label", "官方认定 " + Math.round(vc / total * 100) + "%，疑似 " + Math.round(vs / total * 100) + "%");
    var m1 = el("i", "m1"); m1.style.width = (vc / total * 100) + "%";
    var m2 = el("i", "m2"); m2.style.width = (vs / total * 100) + "%";
    meter.appendChild(m1); meter.appendChild(m2);
    left.appendChild(meter);
    var lg = el("div", "legend");
    lg.appendChild(el("span", "l1", "官方认定 " + conf.length + " 起，约 " + U.fmtUsd(vc)));
    lg.appendChild(el("span", "l2", "疑似 " + susp.length + " 起，约 " + U.fmtUsd(vs)));
    lg.appendChild(el("span", null, "其他"));
    left.appendChild(lg);
    host.appendChild(left);
    var right = el("div");
    right.appendChild(el("p", null, "从 2018 年前后起，朝鲜黑客逐渐成为单一最大的盗币来源。目标从交易所热钱包，转向跨链桥的验证者、多签的签名人和钱包服务商的员工；多数案例靠的是假招聘、恶意软件和被篡改的签名界面，而不是合约漏洞。"));
    var chips = el("p", "r-tags");
    conf.concat(susp).sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (e) {
      var a = el("a", "tag" + (e.dprk === "confirmed" ? " dp" : ""), e.short + " " + yearOf(e));
      a.href = U.hrefOf(e, true);
      chips.appendChild(a);
    });
    right.appendChild(chips);
    host.appendChild(right);
  }

  // ---------- 统计表（图表的文字版） ----------
  function table(head, rows, numCols) {
    var t = el("table", "data"), tr = el("tr");
    head.forEach(function (h, i) { tr.appendChild(el("th", numCols.indexOf(i) >= 0 ? "n" : null, h)); });
    var th = el("thead"); th.appendChild(tr); t.appendChild(th);
    var tb = el("tbody");
    rows.forEach(function (r) {
      var row = el("tr");
      r.forEach(function (c, i) { row.appendChild(el("td", numCols.indexOf(i) >= 0 ? "n" : null, c)); });
      tb.appendChild(row);
    });
    t.appendChild(tb);
    return t;
  }
  function renderStatTable() {
    var host = document.getElementById("stat-table");
    if (!host) return;
    host.textContent = "";
    host.appendChild(table(["年份", "事件数", "合计金额", "其中最大的一起"], yearSums().filter(function (d) { return d.n; }).map(function (d) {
      var big = d.list.filter(counted).sort(function (a, b) { return b.lossUsd - a.lossUsd; })[0];
      return [String(d.y), String(d.n), d.v ? "约 " + U.fmtUsd(d.v) : "—", big ? big.short + "（约 " + U.fmtUsd(big.lossUsd) + "）" : "—"];
    }), [1, 2]));
    host.appendChild(table(["攻击手法", "事件数", "合计金额"], vectorRows().map(function (r) {
      return [r.name, String(r.n), r.v ? "约 " + U.fmtUsd(r.v) : "—"];
    }), [1, 2]));
  }
  // ---------- 编年：筛选与列表 ----------
  var F = { vector: "", victim: "", dprk: false, q: "" };
  function match(e) {
    if (F.vector && e.vector !== F.vector) return false;
    if (F.victim && e.victim !== F.victim) return false;
    if (F.dprk && !e.dprk) return false;
    if (F.q) {
      var hay = [e.name, e.short, e.summary, e.chain, e.attacker, e.note, e.id].join(" ").toLowerCase();
      if (hay.indexOf(F.q.toLowerCase()) < 0) return false;
    }
    return true;
  }

  function rowOf(e, idx) {
    var li = el("li"), a = el("a", "row");
    a.href = U.hrefOf(e, true);
    a.appendChild(el("span", "r-no", String(idx + 1).padStart(2, "0")));
    a.appendChild(el("span", "r-date", e.date));
    var main = el("span", "r-main");
    main.appendChild(el("span", "r-name", e.name));
    main.appendChild(el("span", "r-sum", e.summary));
    var tags = el("span", "r-tags");
    tags.appendChild(el("span", "tag", C.vectors[e.vector]));
    tags.appendChild(el("span", "tag", C.victims[e.victim]));
    if (e.dprk) tags.appendChild(el("span", "tag dp", e.dprk === "confirmed" ? "朝鲜（官方认定）" : "朝鲜（疑似）"));
    if (e.milestone) tags.appendChild(el("span", "tag ms", "里程碑"));
    if (e.provisional) tags.appendChild(el("span", "tag pv", "金额未确认"));
    main.appendChild(tags);
    a.appendChild(main);
    var loss = el("span", "r-loss" + (e.lossUsd == null ? " none" : ""), U.lossLabel(e));
    loss.appendChild(el("span", "st status " + e.status, C.statuses[e.status]));
    a.appendChild(loss);
    li.appendChild(a);
    return li;
  }

  function renderChronicle() {
    var host = document.getElementById("eras");
    if (!host) return;
    host.textContent = "";
    var shown = 0;
    C.eras.forEach(function (er) {
      var all = EV.filter(function (e) { return eraOf(e) === er; });
      var vis = all.filter(match);
      shown += vis.length;
      var sec = el("section", "era" + tintOf(er));
      sec.id = "era-" + er.id;
      var head = el("div", "era-head");
      var l = el("div");
      l.appendChild(el("p", "yrs", er.from === er.to ? er.from + " 年" : er.from + "–" + er.to + " 年"));
      l.appendChild(el("h3", null, er.name));
      var hasProv = all.some(function (e) { return e.provisional; });
      l.appendChild(el("p", "meta", all.length + " 起，合计约 " + U.fmtUsd(sum(all)) + (hasProv ? "（不含未确认事件）" : "")));
      head.appendChild(l);
      head.appendChild(el("p", "story", er.text));
      sec.appendChild(head);
      if (vis.length) {
        var ol = el("ol", "ledger");
        vis.forEach(function (e) { ol.appendChild(rowOf(e, EV.indexOf(e))); });
        sec.appendChild(ol);
      } else {
        sec.appendChild(el("p", "era-empty", "这一时期没有符合筛选条件的事件。"));
      }
      host.appendChild(sec);
    });
    var cnt = document.getElementById("f-count");
    if (cnt) cnt.textContent = "显示 " + shown + " / " + EV.length + " 起";
    var reset = document.getElementById("f-reset");
    if (reset) reset.hidden = !(F.vector || F.victim || F.dprk || F.q);
  }

  function setupFilters() {
    var fv = document.getElementById("f-vector"), fw = document.getElementById("f-victim");
    var fd = document.getElementById("f-dprk"), fq = document.getElementById("f-q"), fr = document.getElementById("f-reset");
    if (!fv) return;
    function fill(sel, map, key) {
      Object.keys(map).forEach(function (k) {
        var n = EV.filter(function (e) { return e[key] === k; }).length;
        if (!n) return;
        var o = el("option", null, map[k] + "（" + n + "）"); o.value = k; sel.appendChild(o);
      });
    }
    fill(fv, C.vectors, "vector");
    fill(fw, C.victims, "victim");
    fv.addEventListener("change", function () { F.vector = fv.value; renderChronicle(); });
    fw.addEventListener("change", function () { F.victim = fw.value; renderChronicle(); });
    fd.addEventListener("change", function () { F.dprk = fd.checked; renderChronicle(); });
    fq.addEventListener("input", function () { F.q = fq.value.trim(); renderChronicle(); });
    fr.addEventListener("click", function () {
      F = { vector: "", victim: "", dprk: false, q: "" };
      fv.value = ""; fw.value = ""; fd.checked = false; fq.value = "";
      renderChronicle();
    });
  }

  // ---------- 启动 ----------
  function init() {
    var cnt = document.querySelector("[data-slot=count]");
    if (cnt) cnt.textContent = String(EV.length);
    var up = document.querySelector("[data-slot=updated]");
    if (up) up.textContent = "资料更新至 " + U.fmtDate(C.updated) + "。";
    renderKpis();
    mountSeismo();
    renderYearChart();
    renderVectorChart();
    renderDprk();
    renderStatTable();
    setupFilters();
    renderChronicle();
    var card = document.getElementById("ch-year"), lastW = card ? card.clientWidth : 0;
    if (card && "ResizeObserver" in window) new ResizeObserver(function () {
      if (Math.abs(card.clientWidth - lastW) < 8) return;
      lastW = card.clientWidth; renderYearChart(); renderVectorChart();
    }).observe(card);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
