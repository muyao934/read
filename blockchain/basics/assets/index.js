/* 区块链基础知识首页：按 data.js 渲染章节列表和篇数。 */
(function () {
  var B = window.BASICS, U = window.BasicsUtil;
  if (!B || !U) return;
  var el = U.el;

  function renderList(host) {
    host.textContent = "";
    // 宽屏两栏按列排：左栏放前一半，右栏放后一半
    host.style.setProperty("--rows", Math.ceil(B.chapters.length / 2));
    B.chapters.forEach(function (c) {
      var li = el("li"), a = el("a", "bs-row" + U.tintOf(c));
      a.href = "chapters/" + c.f + ".html";
      a.appendChild(el("span", "r-no", c.n));
      var main = el("span", "r-main");
      main.appendChild(el("span", "r-name", c.t));
      main.appendChild(el("span", "r-sum", c.d));
      a.appendChild(main);
      li.appendChild(a);
      host.appendChild(li);
    });
  }

  // 主题图例：放在章节列表前，说明章号底色的意思
  function renderLegend(list) {
    if (!B.groups) return;
    var lg = el("p", "bs-legend");
    lg.appendChild(document.createTextNode("章号的底色表示所属主题："));
    Object.keys(B.groups).forEach(function (k) { lg.appendChild(el("span", "tint-" + B.groups[k].tint, B.groups[k].name)); });
    list.parentNode.insertBefore(lg, list);
  }
  // 首页顶栏纸边：四个主题的颜色，宽度按章数比例（和被盗站按时代年数比例一样）
  function topbarStrip() {
    if (!B.groups) return;
    var keys = Object.keys(B.groups), n = B.chapters.length, acc = 0, stops = [];
    keys.forEach(function (k, i) {
      acc += B.chapters.filter(function (c) { return c.g === k; }).length;
      stops.push("var(--" + B.groups[k].tint + ") 0 " + (i === keys.length - 1 ? "100" : (acc / n * 100).toFixed(1)) + "%");
    });
    document.body.style.setProperty("--bs-strip", "linear-gradient(90deg, " + stops.join(", ") + ")");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var list = document.getElementById("chapter-list");
    if (list) { renderList(list); renderLegend(list); }
    topbarStrip();
    var n = document.querySelector("[data-slot=count]");
    if (n) n.textContent = B.chapters.length;
    var u = document.querySelector("[data-slot=updated]");
    if (u) { var p = B.updated.split("-"); u.textContent = "最后更新：" + p[0] + " 年 " + (+p[1]) + " 月 " + (+p[2]) + " 日"; }
  });
})();
