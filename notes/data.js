/* 阅读库的文章目录，唯一数据源：首页列表、文章页的分类 / 日期 / 标签 / 翻页都从这里读。
   新增一篇：在 notes/ 下写 <f>.html，再在 notes 数组里加一条，f 和文件名（不含 .html）一致。
   f 用“日期-英文短名”，只用小写字母、数字和连字符（GitHub Pages 区分大小写）。
   cat 只能是 cats 里的 id；tint 是纸色 e1…e6，见 assets/read.css。 */
window.LIBRARY = {
  cats: [
    { id: "tech", name: "技术", tint: "e5" },
    { id: "work", name: "工作", tint: "e4" },
    { id: "learn", name: "学习", tint: "e2" },
    { id: "life", name: "生活", tint: "e6" }
  ],
  topics: [
    { title: "区块链", href: "blockchain/index.html", tint: "e1",
      desc: "被盗事件编年史、大事记、诈骗与骗局，以及读懂这些事件要用的基础知识" }
  ],
  notes: [
    { f: "2026-11-08-github-pages", date: "2026-11-08", cat: "tech",
      title: "用 GitHub Pages 发布静态网页",
      desc: "免费账户怎么把一个文件夹变成随时能打开的网址；本地正常、上线 404 的常见原因；一台电脑上用两个 GitHub 账号推送。",
      tags: ["GitHub", "Git", "SSH"] }
  ]
};
