/* 区块链基础知识：所有页面共用的脚本。
   1. 主题切换和 el 在 shared/base.js，这里从 window.SiteBase 取（2026-11-06 起）
   2. 详情页：按 <body data-id> 从 data.js 渲染目录（取每节的短标签）和上一章 / 下一章
   3. window.Guide：分步小动画引擎和素材（chip、blk、mount），各章页尾的内联脚本调用它
   必须在 <head> 里、shared/base.js 和 data.js 之后同步加载：Guide 在页内脚本运行前就定义好。
   小动画引擎原样取自 qtum-bridge guide 的 guide.js。 */
(function () {
  var B = window.BASICS;
  // 主题切换和工具函数在 shared/base.js（2026-11-06 起五处合成一份）
  var SB = window.SiteBase, mountThemeToggle = SB.mountThemeToggle, el = SB.el;

  // ---------- 工具 ----------
  // 章号 → “入门”“第 01 章”“第 03 章附页”
  function label(c) {
    if (c.n === "入门") return "入门";
    if (c.n.slice(-1) === "+") return "第 " + c.n.slice(0, -1) + " 章附页";
    return "第 " + c.n + " 章";
  }
  // 章所属主题的纸色 class（共用层的 tint-e1…e6）
  function tintOf(c) { var g = B && B.groups && B.groups[c.g]; return g ? " tint-" + g.tint : ""; }
  window.BasicsUtil = { el: el, label: label, tintOf: tintOf, mountThemeToggle: mountThemeToggle };

  // ---------- 详情页：目录 ----------
  // 各节标题是 h2.eyebrow（短标签，2026-11-06 起升成标题），目录用它；没有时退回 h2
  function renderToc(host, article) {
    host.textContent = "";
    host.appendChild(el("p", null, "本章内容"));
    var ol = el("ol");
    var links = [];
    article.querySelectorAll(":scope > section[id]").forEach(function (s) {
      var lab = s.querySelector(":scope > .eyebrow") || s.querySelector(":scope > h2");
      if (!lab) return;
      var li = el("li"), a = el("a", null, lab.textContent.trim());
      a.href = "#" + s.id;
      li.appendChild(a); ol.appendChild(li); links.push([s, a]);
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

  // ---------- 详情页：上一章 / 下一章 ----------
  function renderPager(host, i) {
    host.textContent = "";
    var list = B.chapters;
    function link(c, k, cls) {
      var a = el("a", cls);
      a.href = c.f + ".html";
      a.appendChild(el("span", "k", k + "（" + label(c) + "）"));
      a.appendChild(document.createTextNode(c.t));
      return a;
    }
    if (list[i - 1]) host.appendChild(link(list[i - 1], "上一章", "prev"));
    if (list[i + 1]) host.appendChild(link(list[i + 1], "下一章", "next"));
  }

  function initDetail() {
    var id = document.body.getAttribute("data-id");
    if (!id || !B) return;
    var i = B.chapters.map(function (c) { return c.f; }).indexOf(id);
    if (i < 0) return;
    // 顶栏纸边、案卷号、目录当前项用本章主题的颜色；案卷号写“主题 · 第 NN 章”，插在标题前
    var c = B.chapters[i], g = B.groups && B.groups[c.g];
    if (g) {
      document.body.classList.add("tinted", "tint-" + g.tint);
      var h1 = document.querySelector(".case-head h1");
      if (h1 && !document.querySelector(".case-head .case-no")) h1.parentNode.insertBefore(el("p", "case-no", g.name + " · " + label(c)), h1);
    }
    var q = function (s) { return document.querySelector("[data-slot=" + s + "]"); };
    var art = document.querySelector(".bs-article");
    if (q("toc") && art) renderToc(q("toc"), art);
    if (q("pager")) renderPager(q("pager"), i);
  }

  // ---------- 详情页：表格列宽（2026-11-06 用户：表格自适应成总行数最少） ----------
  // 浏览器的 auto 布局按内容长短分列宽，不管各行折几行。这里把每格在一组候选列宽下实际排一次，
  // 量出高度，再找总高度最小的分法，用 <colgroup> 按百分比写回。
  // 有合并单元格的表格不处理；最后实际排一次，不比原来矮就还原成浏览器的分法。
  function fitTable(t) {
    var rows = Array.prototype.slice.call(t.rows);
    if (!rows.length || t.querySelector("[colspan],[rowspan]")) return;
    var n = rows[0].cells.length;
    if (n < 2 || rows.some(function (r) { return r.cells.length !== n; })) return;
    var old = t.querySelector(":scope > colgroup.fit");
    if (old) old.remove();
    t.style.tableLayout = "";
    var W = t.clientWidth;
    if (!W) return;   // 藏在收起的 <details> 里，展开时再算
    var before = t.offsetHeight;
    var cur = Array.prototype.map.call(rows[0].cells, function (c) { return c.getBoundingClientRect().width; });
    // 看不见的副本，挂在格子里，字体和 white-space 跟着格子走。
    // 副本内容取自 x.html（挂副本之前存下的原始内容）：直接复制 c.innerHTML 会把已挂的副本也复制进去，
    // 一格排 40 档就是 2^40 倍，渲染进程内存耗尽崩溃（2026-11-06 kms.html 出过）
    var probes = [];
    function probe(c, html, width) {
      var d = document.createElement("div");
      d.style.cssText = "position:absolute;left:-99999px;top:0;visibility:hidden;width:" + width;
      d.innerHTML = html;
      c.appendChild(d); probes.push(d);
      return d;
    }
    function clear() { probes.forEach(function (d) { d.remove(); }); probes = []; }
    // 第一轮：每格最窄能缩到多宽（min-content）、排成一行多宽（max-content）
    var cells = [];
    rows.forEach(function (r, ri) {
      Array.prototype.forEach.call(r.cells, function (c, ci) {
        var html = c.innerHTML;
        cells.push({ r: ri, c: ci, el: c, html: html, pMin: probe(c, html, "min-content"), pMax: probe(c, html, "max-content") });
      });
    });
    cells.forEach(function (x) {
      var cs = getComputedStyle(x.el);
      x.padH = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      x.padV = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderBottomWidth || 0);
      x.min = Math.ceil(x.pMin.getBoundingClientRect().width + x.padH);
      x.full = Math.ceil(x.pMax.getBoundingClientRect().width + x.padH) + 1;
      x.h1 = x.pMax.getBoundingClientRect().height;
    });
    clear();
    // 每列的下限、上限和候选宽度：均匀取约 40 档，再加上每格恰好排成一行的宽度
    var lo = [], hi = [], grid = [];
    for (var j = 0; j < n; j++) { lo[j] = 0; hi[j] = 0; }
    cells.forEach(function (x) { lo[x.c] = Math.max(lo[x.c], x.min); hi[x.c] = Math.max(hi[x.c], x.full); });
    var sumLo = lo.reduce(function (s, v) { return s + v; }, 0);
    if (sumLo > W) return;
    for (j = 0; j < n; j++) {
      var top = Math.max(lo[j], Math.min(hi[j], W - sumLo + lo[j])), step = Math.max(8, (top - lo[j]) / 40), g = [];
      for (var v = lo[j]; v < top; v += step) g.push(Math.round(v));
      g.push(top);
      cells.forEach(function (x) { if (x.c === j && x.full > lo[j] && x.full <= top) g.push(x.full); });
      grid[j] = g.sort(function (a, b) { return a - b; }).filter(function (v, k, arr) { return !k || v !== arr[k - 1]; });
    }
    // 第二轮：每格在本列每个候选宽度下实际排一次，记下高度
    cells.forEach(function (x) {
      x.g = grid[x.c].filter(function (w) { return w < x.full; });
      x.pp = x.g.map(function (w) { return probe(x.el, x.html, Math.max(1, w - x.padH) + "px"); });
    });
    cells.forEach(function (x) { x.h = x.pp.map(function (d) { return d.getBoundingClientRect().height; }); x.pp = null; });
    clear();
    // 列宽 w 下这一格的高度：取不超过 w 的最大一档（偏保守，最后会实际排一次核对）
    function hAt(x, w) {
      if (w >= x.full) return x.h1;
      var k = x.g.length - 1;
      while (k > 0 && x.g[k] > w) k--;
      return x.h[k] != null ? x.h[k] : x.h1;
    }
    // 先只看总高度；第二步在高度不增加的前提下，让折行的格子更少（短标签不被白白挤成两行）
    function cost(ws, wt) {
      var rowH = [], extra = 0, h = 0;
      cells.forEach(function (x) {
        var v = hAt(x, ws[x.c]);
        extra += v - x.h1;
        v += x.padV;
        if (!(rowH[x.r] >= v)) rowH[x.r] = v;
      });
      rowH.forEach(function (v) { h += v; });
      return h + extra * wt;
    }
    // 两列一组互相让宽度，直到哪一对都再降不下来
    function search(ws, wt) {
      var best = cost(ws, wt);
      for (var round = 0; round < 12; round++) {
        var moved = false;
        for (var p = 0; p < n; p++) for (var q = p + 1; q < n; q++) {
          var S = ws[p] + ws[q], tries = grid[p].slice();
          grid[q].forEach(function (v) { tries.push(S - v); });
          tries.forEach(function (x) {
            if (x < lo[p] || S - x < lo[q]) return;
            var t2 = ws.slice(); t2[p] = x; t2[q] = S - x;
            var c2 = cost(t2, wt);
            if (c2 < best - 0.0005) { best = c2; ws = t2; moved = true; }
          });
        }
        if (!moved) break;
      }
      return ws;
    }
    // 两个起点：按内容长短比例分，和浏览器原来的分法
    var sumHi = hi.reduce(function (s, v) { return s + v; }, 0) || 1;
    var starts = [lo.map(function (v, k) { return v + (W - sumLo) * hi[k] / sumHi; })];
    var curSum = cur.reduce(function (s, v) { return s + v; }, 0);
    if (curSum > 0 && cur.every(function (v, k) { return v * W / curSum >= lo[k]; })) starts.push(cur.map(function (v) { return v * W / curSum; }));
    var cands = [];
    starts.forEach(function (st) { var r1 = search(st, 0); cands.push(search(r1, 0.001), r1); });
    // 每个候选实际排一次，按量出来的高度选；一样高时选排在前面的（第二步的结果，折行更少）
    var cg = document.createElement("colgroup");
    cg.className = "fit";
    for (var k = 0; k < n; k++) cg.appendChild(document.createElement("col"));
    t.insertBefore(cg, t.firstChild);
    t.style.tableLayout = "fixed";
    function apply(ws) { ws.forEach(function (w, k) { cg.children[k].style.width = (w / W * 100).toFixed(3) + "%"; }); }
    var pick = null, pickH = before - 0.5;
    cands.forEach(function (c) { apply(c); var h = t.offsetHeight; if (h < pickH) { pick = c; pickH = h; } });
    if (!pick) { cg.remove(); t.style.tableLayout = ""; return; }
    apply(pick);
  }
  function fitTables(root) {
    (root || document).querySelectorAll(".bs-article table").forEach(fitTable);
  }

  document.addEventListener("DOMContentLoaded", function () {
    mountThemeToggle();
    initDetail();
    if (!document.querySelector(".bs-article table")) return;
    // 等字体就位再量，不然宽度会偏
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitTables(); });
    else fitTables();
    var timer;
    window.addEventListener("resize", function () { clearTimeout(timer); timer = setTimeout(function () { fitTables(); }, 150); });
    // 收起的 <details> 里的表格量不到宽度，展开时再算（toggle 不冒泡，用捕获）
    document.addEventListener("toggle", function (e) { if (e.target.open) fitTables(e.target); }, true);
  });
})();

// ---------- 分步小动画引擎（取自 guide.js，逻辑未改） ----------
window.Guide = (() => {
  // 小动画素材
  const chip = (t, c, ex = '') => `<span class="ch ${ex}" style="--c:var(${c})">${t}</span>`;
  const blk = (t, ex = '') => `<div class="blk ${ex}">${t}</div>`;

  // 小动画数据格式：
  // b = 区域框 [id, x, y, w, h, 标签]（百分比）；it = 元素 {id, h: html, x, y, hide}
  // s = 每一步，增量修改：{c: 说明, set: {元素id: {x, y, h, hide}}, lit: [框id], bad: [框id]}
  // 由页尾的内联脚本调用，那时 .anim 节点都已解析
  function mount(A){
    // 从第 0 步累加到第 i 步算出每个元素的状态，所以前进、后退、重置都一致
    document.querySelectorAll('.anim[data-anim]').forEach(host => {
      const d = A[host.dataset.anim]; if (!d) return;
      host.innerHTML = `<div class="mini" style="height:${d.h}px"></div>
        <div class="mctl"><button class="btn ghost" data-a="prev">上一步</button><button class="btn" data-a="next">下一步</button>
        <button class="btn ghost" data-a="play">播放</button><span class="prog"></span></div>
        <p class="mcap" aria-live="polite"></p>`;
      const stage = host.querySelector('.mini'), cap = host.querySelector('.mcap'), pg = host.querySelector('.prog');
      const bP = host.querySelector('[data-a=prev]'), bN = host.querySelector('[data-a=next]'), bPl = host.querySelector('[data-a=play]');
      const boxes = {}, items = {};
      d.b.forEach(([id, x, y, w, h, t]) => {
        const e = document.createElement('div'); e.className = 'bx';
        Object.assign(e.style, {left:x + '%', top:y + '%', width:w + '%', height:h + '%'});
        if (t) e.innerHTML = `<span>${t}</span>`;
        stage.appendChild(e); boxes[id] = e;
      });
      d.it.forEach(o => { const e = document.createElement('div'); e.className = 'it'; stage.appendChild(e); items[o.id] = e; });
      let i = 0, tm = null;
      function show(){
        const stt = {}; d.it.forEach(o => stt[o.id] = {x:o.x, y:o.y, h:o.h, hide:!!o.hide});
        for (let k = 0; k <= i; k++) { const set = d.s[k].set || {}; for (const id in set) Object.assign(stt[id], set[id]); }
        for (const id in stt) {
          const e = items[id], v = stt[id];
          if (e.dataset.h !== v.h) { e.innerHTML = v.h; e.dataset.h = v.h; }
          e.style.left = v.x + '%'; e.style.top = v.y + '%';
          e.classList.toggle('hide', !!v.hide);
        }
        const st = d.s[i];
        for (const id in boxes) { boxes[id].classList.toggle('lit', (st.lit || []).includes(id)); boxes[id].classList.toggle('bad', (st.bad || []).includes(id)); }
        cap.textContent = st.c;
        pg.textContent = `${i + 1} / ${d.s.length}`;
        bP.disabled = i === 0;
        bN.textContent = i === d.s.length - 1 ? '重来' : '下一步';
      }
      const stop = () => { clearInterval(tm); tm = null; bPl.textContent = '播放'; };
      bN.addEventListener('click', () => { stop(); i = i === d.s.length - 1 ? 0 : i + 1; show(); });
      bP.addEventListener('click', () => { stop(); i = Math.max(0, i - 1); show(); });
      bPl.addEventListener('click', () => {
        if (tm) return stop();
        if (i === d.s.length - 1) i = 0;
        bPl.textContent = '暂停'; show();
        tm = setInterval(() => { if (i >= d.s.length - 1) return stop(); i++; show(); }, 3200);
      });
      show();
    });
  }
  return {chip, blk, mount};
})();
