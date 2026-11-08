/* 阅读库的脚本：首页和全部文章共用。必须在 <head> 里、notes/data.js 之前同步加载，主题才能在绘制前生效。
   - 主题：localStorage 键 chronicle-theme，和 blockchain/ 下各站共用，切换后各页一致
   - 首页（body.lib-home）：按 window.LIBRARY 生成专题卡片、分类按钮和文章列表，支持搜索和按分类筛选
   - 文章页（body.note-page）：按文件名在 LIBRARY.notes 里找到本文，填分类、日期、标签，生成目录和翻页 */
(function () {
  var KEY = "chronicle-theme";
  var THEME_LABEL = { auto: "主题：跟随系统", light: "主题：浅色", dark: "主题：深色" };
  function readTheme() { try { return localStorage.getItem(KEY) || "auto"; } catch (e) { return "auto"; } }
  function applyTheme(t) {
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
  }
  applyTheme(readTheme());

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function fmtDate(d) { var p = d.split("-"); return p[0] + " 年 " + (+p[1]) + " 月 " + (+p[2]) + " 日"; }

  function mountThemeToggle() {
    var slot = document.querySelector("[data-slot=theme]");
    if (!slot) return;
    var btn = el("button", "theme-toggle"), cur = readTheme();
    btn.type = "button";
    btn.textContent = THEME_LABEL[cur];
    btn.addEventListener("click", function () {
      cur = cur === "auto" ? "light" : cur === "light" ? "dark" : "auto";
      try { localStorage.setItem(KEY, cur); } catch (e) { /* 隐私模式下写不进去也没关系 */ }
      applyTheme(cur);
      btn.textContent = THEME_LABEL[cur];
    });
    slot.replaceWith(btn);
  }

  // read.js 在 data.js 之前加载，所以等 DOMContentLoaded 时再读 window.LIBRARY
  var LIB = { cats: [], topics: [], notes: [] };
  function catOf(id) { for (var i = 0; i < LIB.cats.length; i++) if (LIB.cats[i].id === id) return LIB.cats[i]; return null; }
  // 新的在前；同一天按标题排
  function sorted() { return LIB.notes.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title, "zh"); }); }

  // ---------- 首页 ----------
  function initHome() {
    var topics = document.getElementById("topics");
    LIB.topics.forEach(function (t) {
      var li = el("li"), a = el("a", "tint-" + t.tint);
      a.href = t.href;
      a.appendChild(el("b", null, t.title));
      a.appendChild(el("span", "d", t.desc));
      li.appendChild(a); topics.appendChild(li);
    });

    var cats = document.getElementById("cats"), list = document.getElementById("list");
    var count = document.getElementById("count"), q = document.getElementById("q");
    var cur = (location.hash.match(/^#cat=(\w+)$/) || [])[1] || "all";
    var btns = [];
    [{ id: "all", name: "全部" }].concat(LIB.cats).forEach(function (c) {
      var b = el("button", c.tint ? "tint-" + c.tint : null, c.name);
      b.type = "button"; b.dataset.cat = c.id;
      b.addEventListener("click", function () {
        cur = c.id;
        history.replaceState(null, "", cur === "all" ? location.pathname : "#cat=" + cur);
        render();
      });
      btns.push(b); cats.appendChild(b);
    });
    q.addEventListener("input", render);

    function render() {
      var kw = q.value.trim().toLowerCase(), shown = 0;
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.cat === cur ? "true" : "false"); });
      list.textContent = "";
      sorted().forEach(function (n) {
        if (cur !== "all" && n.cat !== cur) return;
        var hay = [n.title, n.desc].concat(n.tags || []).join(" ").toLowerCase();
        if (kw && hay.indexOf(kw) < 0) return;
        var c = catOf(n.cat), li = el("li"), a = el("a", c ? "tint-" + c.tint : null);
        a.href = "notes/" + n.f + ".html";
        var t = el("time", null, fmtDate(n.date)); t.dateTime = n.date;
        a.appendChild(t);
        a.appendChild(el("span", "t", n.title));
        a.appendChild(el("span", "d", n.desc));
        var m = el("span", "m");
        if (c) m.appendChild(el("span", "tag", c.name));
        (n.tags || []).forEach(function (g) { m.appendChild(el("span", "tag", g)); });
        a.appendChild(m);
        li.appendChild(a); list.appendChild(li); shown++;
      });
      count.textContent = "共 " + LIB.notes.length + " 篇" + (shown === LIB.notes.length ? "" : "，显示 " + shown + " 篇");
      if (!shown) list.appendChild(el("li", "lib-empty", "没有符合条件的文章。"));
    }
    render();
  }

  // ---------- 文章页 ----------
  function initNote() {
    var f = decodeURIComponent(location.pathname.split("/").pop().replace(/\.html$/, ""));
    var all = sorted(), i = -1;
    for (var k = 0; k < all.length; k++) if (all[k].f === f) i = k;
    var n = all[i];
    if (n) {
      var c = catOf(n.cat);
      if (c) document.body.classList.add("tinted", "tint-" + c.tint);
      var meta = document.querySelector("[data-slot=meta]");
      if (meta) {
        if (c) meta.appendChild(el("span", "cat", c.name));
        var t = el("time", null, fmtDate(n.date)); t.dateTime = n.date; meta.appendChild(t);
        (n.tags || []).forEach(function (g) { meta.appendChild(el("span", "tag", g)); });
      }
      var pager = document.querySelector("[data-slot=pager]");
      if (pager) {
        // all 是新的在前：上一篇是更早的，下一篇是更新的
        var prev = all[i + 1], next = all[i - 1];
        if (prev) pager.appendChild(pageLink(prev, "上一篇（更早）", "prev"));
        if (next) pager.appendChild(pageLink(next, "下一篇（更新）", "next"));
        if (!prev && !next) pager.hidden = true;
      }
    }
    renderToc();
  }
  function pageLink(n, k, cls) {
    var a = el("a", cls); a.href = n.f + ".html";
    a.appendChild(el("span", "k", k)); a.appendChild(document.createTextNode(n.title));
    return a;
  }
  // 目录：取正文里每个带 id 的 section 的 h2；data-short 可以给一个更短的目录名
  function renderToc() {
    var toc = document.querySelector("[data-slot=toc]");
    if (!toc) return;
    var secs = document.querySelectorAll(".article > section[id]");
    if (!secs.length) { toc.hidden = true; return; }
    toc.appendChild(el("p", null, "本文内容"));
    var ol = el("ol"), links = {};
    secs.forEach(function (s) {
      var h = s.querySelector("h2"), a = el("a", null, s.dataset.short || (h ? h.textContent : s.id));
      a.href = "#" + s.id; links[s.id] = a;
      var li = el("li"); li.appendChild(a); ol.appendChild(li);
    });
    toc.appendChild(ol);
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        for (var id in links) links[id].classList.toggle("on", id === e.target.id);
      });
    }, { rootMargin: "-72px 0px -70% 0px" });
    secs.forEach(function (s) { io.observe(s); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.LIBRARY) LIB = window.LIBRARY;
    mountThemeToggle();
    var y = document.querySelector("[data-slot=year]");
    if (y) y.textContent = new Date().getFullYear();
    if (document.body.classList.contains("lib-home")) initHome();
    if (document.body.classList.contains("note-page")) initNote();
  });
})();
