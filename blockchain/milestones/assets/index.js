/* 区块链大事记：首页脚本。四条泳道、分类列表、收录篇数和更新日期，全部从 data.js 渲染。 */
(function () {
  var M = window.MILESTONES, U = window.MilestoneUtil;
  if (!M || !U) return;
  var el = U.el, sv = U.sv;

  // 估算文字宽度：中文按一个字号宽，其余按 0.58 个字号宽
  function textW(s, fs) {
    var w = 0;
    for (var i = 0; i < s.length; i++) w += s.charCodeAt(i) > 255 ? fs : fs * 0.58;
    return w;
  }

  // ---------- 四条泳道 ----------
  // 一条泳道上的点：本站的事件，加上 links 里详写在被盗站的事件（名称、日期、金额读被盗站的 data.js）
  var C = window.CHRONICLE;
  function laneItems(c) {
    var out = U.inCat(c).map(function (e) {
      return { id: e.id, date: e.date, short: e.short, name: e.name, v: e.scale.v, cat: c,
        loss: e.scale.loss, pin: !!e.pin, ext: false, href: U.hrefOf(e, true) };
    });
    (M.links || []).forEach(function (l) {
      var h = C && C.events.filter(function (x) { return x.id === l.id; })[0];
      if (l.cat !== c || !h) return;
      out.push({ id: h.id, date: h.date, short: h.short, name: h.name, v: h.lossText, cat: c,
        loss: false, pin: !!l.pin, ext: true, href: "../hacks/events/" + h.id + ".html" });
    });
    return out.sort(U.byDate);
  }
  // 标签占用的横向区间；和已占的任一区间相距不到 6px 就算重叠
  function free(occ, a, b) {
    return occ.every(function (r) { return b + 6 < r[0] || a > r[1] + 6; });
  }
  var lz = { marks: [], cur: -1 };
  function drawLanes(host) {
    var old = host.querySelector("svg");
    if (old) old.remove();
    var W = Math.max(320, host.clientWidth), narrow = W < 560;
    var P = { l: narrow ? 44 : 96, r: 16, t: 10, b: 26 }, laneH = narrow ? 54 : 60;
    var H = P.t + laneH * 4 + P.b, pw = W - P.l - P.r;
    var X = function (d) { return P.l + U.timeFrac(d) * pw; };
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img", tabindex: "0",
      "aria-label": "四类事件在 2009 年到 2026 年间的分布。用左右方向键逐个查看，回车打开" });
    // 每条泳道一段纸色底色，左沿 4px 色条（和被盗站地震图的时代底色一样）
    U.CAT_ORDER.forEach(function (c, li) {
      var y0 = P.t + laneH * li + 1, h = laneH - 2;
      svg.appendChild(sv("rect", { x: P.l, y: y0, width: pw, height: h, class: "sz-band" + U.tintOf(c) }));
      svg.appendChild(sv("rect", { x: P.l - 4, y: y0, width: 4, height: h, class: "sz-cap" + U.tintOf(c) }));
    });
    for (var y = 2010; y <= 2026; y++) {
      var gx = P.l + (Date.UTC(y, 0, 1) - U.T0) / (U.T1 - U.T0) * pw;
      svg.appendChild(sv("line", { x1: gx, x2: gx, y1: P.t, y2: H - P.b, class: "sz-grid" }));
      if (y % (narrow ? 4 : 2) === 0) {
        var t = sv("text", { x: gx, y: H - 8, "text-anchor": "middle", class: "sz-ax" });
        t.textContent = y;
        svg.appendChild(t);
      }
    }
    lz.marks = [];
    U.CAT_ORDER.forEach(function (c, li) {
      // 点在泳道里居中，上下各留一排标签的位置
      var cy = P.t + laneH * li + laneH / 2;
      svg.appendChild(sv("line", { x1: P.l, x2: W - P.r, y1: cy, y2: cy, class: "ms-lane-line" }));
      var lab = sv("text", { x: 0, y: cy + 4, class: "ms-lane-lab" });
      lab.textContent = narrow ? M.cats[c].short : M.cats[c].name;
      svg.appendChild(lab);
      var list = laneItems(c);
      if (!list.length) {
        var e0 = sv("text", { x: P.l + 6, y: cy - 9, class: "ms-lane-empty" });
        e0.textContent = "整理中";
        svg.appendChild(e0);
      }
      // 先给 pin 的事件排标签，再按日期排其余的。标签先放在点的上方，和上排已有的标签重叠时放到点的下方，
      // 上下都放不下才省略（悬停仍能看到名称）。靠边时改为左对齐或右对齐
      var top = [], bot = [], lab = {};
      list.filter(function (it) { return it.pin; }).concat(list.filter(function (it) { return !it.pin; }))
        .forEach(function (it) {
          var cx = X(it.date), w = textW(it.short, 12.5), x0 = cx - w / 2, anchor = "middle", tx = cx, ly = null;
          if (x0 < P.l) { anchor = "start"; tx = cx - 4; x0 = tx; }
          else if (x0 + w > W - P.r) { anchor = "end"; tx = cx + 4; x0 = tx - w; }
          if (free(top, x0, x0 + w)) { ly = cy - 11; top.push([x0, x0 + w]); }
          else if (free(bot, x0, x0 + w)) { ly = cy + 22; bot.push([x0, x0 + w]); }
          if (ly !== null) lab[it.id] = { x: tx, y: ly, anchor: anchor };
        });
      list.forEach(function (it) {
        // 红点只给金额是损失的事件（scale.loss），和事件要素里大字的颜色一致；被盗站的事件画成空心点
        var cx = X(it.date), g = sv("g", { class: "ms-mark" + (it.loss ? " loss" : "") + (it.ext ? " ext" : ""), "data-id": it.id });
        g.appendChild(sv("circle", { cx: cx, cy: cy, r: 5.5, class: "ms-dot" }));
        var p = lab[it.id];
        if (p) {
          var tl = sv("text", { x: p.x, y: p.y, "text-anchor": p.anchor, class: "ms-mark-lab" });
          tl.textContent = it.short;
          g.appendChild(tl);
        }
        svg.appendChild(g);
        lz.marks.push({ e: it, x: cx, y: cy, g: g });
      });
    });
    host.appendChild(svg);
    return svg;
  }

  function showMark(host, i) {
    lz.cur = i;
    lz.marks.forEach(function (m, j) { m.g.classList.toggle("on", j === i); });
    var tip = host.querySelector(".tip");
    if (!tip) return;
    if (i < 0 || !lz.marks[i]) { tip.hidden = true; return; }
    var m = lz.marks[i], e = m.e;
    tip.textContent = "";
    tip.appendChild(el("div", "tv", e.v));
    tip.appendChild(el("div", "tn", e.name));
    tip.appendChild(el("div", "tm", U.fmtDate(e.date) + "，" + M.cats[e.cat].name + (e.ext ? "；详写在被盗事件编年史" : "")));
    tip.hidden = false;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.min(Math.max(0, m.x - w / 2), host.clientWidth - w);
    var top = m.y - h - 16;
    if (top < 0) top = m.y + 14;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  function order() {
    return lz.marks.map(function (m, i) { return i; })
      .sort(function (a, b) { return U.byDate(lz.marks[a].e, lz.marks[b].e); });
  }
  function nearest(px, py) {
    var best = -1, bd = 24 * 24;
    lz.marks.forEach(function (m, i) {
      var d = (m.x - px) * (m.x - px) + (m.y - py) * (m.y - py);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }
  function bindLanes(host, svg) {
    // 指针位置换算成 SVG 坐标。用 getScreenCTM，页面整体缩放时（ms.css 在很宽的窗口里放大页面）也能对上
    function local(ev) {
      var m = svg.getScreenCTM();
      if (m) {
        var p = svg.createSVGPoint();
        p.x = ev.clientX; p.y = ev.clientY;
        p = p.matrixTransform(m.inverse());
        return [p.x, p.y];
      }
      var r = svg.getBoundingClientRect(), k = r.width ? svg.viewBox.baseVal.width / r.width : 1;
      return [(ev.clientX - r.left) * k, (ev.clientY - r.top) * k];
    }
    svg.addEventListener("pointermove", function (ev) {
      var p = local(ev), i = nearest(p[0], p[1]);
      if (i !== lz.cur) showMark(host, i);
      svg.style.cursor = i >= 0 ? "pointer" : "default";
    });
    svg.addEventListener("pointerleave", function () { if (document.activeElement !== svg) showMark(host, -1); });
    svg.addEventListener("click", function (ev) {
      var p = local(ev), i = nearest(p[0], p[1]);
      if (i >= 0) location.href = lz.marks[i].e.href;
    });
    svg.addEventListener("keydown", function (ev) {
      var o = order(), pos = o.indexOf(lz.cur);
      if (!o.length) return;
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") { ev.preventDefault(); showMark(host, o[Math.min(o.length - 1, pos + 1)]); }
      else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") { ev.preventDefault(); showMark(host, o[Math.max(0, pos - 1)]); }
      else if (ev.key === "Enter" && lz.cur >= 0) location.href = lz.marks[lz.cur].e.href;
      else if (ev.key === "Escape") showMark(host, -1);
    });
    svg.addEventListener("focus", function () {
      if (svg.matches(":focus-visible") && lz.cur < 0 && lz.marks.length) showMark(host, order()[0]);
    });
    svg.addEventListener("blur", function () { showMark(host, -1); });
  }
  function mountLanes() {
    var host = document.getElementById("lanes");
    if (!host) return;
    var w0 = 0;
    function draw() { bindLanes(host, drawLanes(host)); w0 = host.clientWidth; }
    draw();
    if ("ResizeObserver" in window) new ResizeObserver(function () {
      if (Math.abs(host.clientWidth - w0) > 4) { showMark(host, -1); draw(); }
    }).observe(host);
  }

  // ---------- 分类列表 ----------
  function rowOf(e, n) {
    var li = el("li"), a = el("a", "row");
    a.href = U.hrefOf(e, true);
    a.appendChild(el("span", "r-no", String(n).padStart(2, "0")));
    a.appendChild(el("span", "r-date", e.date));
    var main = el("span", "r-main");
    main.appendChild(el("span", "r-name", e.name));
    main.appendChild(el("span", "r-sum", e.summary));
    var tags = el("span", "r-tags");
    (e.tags || []).forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
    if (M.cats[e.cat].depth === "brief") tags.appendChild(el("span", "tag", "简版"));
    if (e.ongoing) tags.appendChild(el("span", "tag pv", "仍在发展"));
    main.appendChild(tags);
    a.appendChild(main);
    a.appendChild(el("span", "r-loss" + (e.scale.loss ? "" : " ms-neutral"), e.scale.v));
    li.appendChild(a);
    return li;
  }
  function renderCats() {
    var host = document.getElementById("cat-list");
    if (!host) return;
    host.textContent = "";
    U.CAT_ORDER.forEach(function (c) {
      var cat = M.cats[c], list = U.inCat(c);
      var sec = el("section", "era" + U.tintOf(c));
      sec.id = "cat-" + c;
      var head = el("div", "era-head"), l = el("div");
      l.appendChild(el("p", "yrs", cat.depth === "deep" ? "深度版" : "简版"));
      l.appendChild(el("h3", null, cat.name));
      l.appendChild(el("p", "meta", list.length ? "已收录 " + list.length + " 篇" : "整理中"));
      head.appendChild(l);
      head.appendChild(el("p", "story", cat.text));
      sec.appendChild(head);
      if (list.length) {
        var ol = el("ol", "ledger");
        list.forEach(function (e, i) { ol.appendChild(rowOf(e, i + 1)); });
        sec.appendChild(ol);
      } else {
        sec.appendChild(el("p", "era-empty", "这一类的页面还在写。"));
      }
      host.appendChild(sec);
    });
  }

  function fillSlots() {
    var n = document.querySelector("[data-slot=count]");
    if (n) n.textContent = M.events.length;
    var u = document.querySelector("[data-slot=updated]");
    if (u) u.textContent = "数据更新于 " + U.fmtDate(M.updated) + "。";
  }

  fillSlots();
  mountLanes();
  renderCats();
})();
