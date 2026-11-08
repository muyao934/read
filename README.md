# 阅读库

工作、学习、生活中遇到的新东西，每篇把一个问题讲清楚：先给结论，再讲原理和例子，最后列出来源。

**在线阅读：<https://muyao934.github.io/read/>**

内容由 AI 协助整理。涉及版本、价格、政策的说法以每篇的成文日期为准。

## 内容

| 栏目 | 说明 |
|---|---|
| [文章](https://muyao934.github.io/read/) | 按技术、工作、学习、生活分类，每篇一个主题 |
| [区块链专题](https://muyao934.github.io/read/blockchain/index.html) | 被盗事件编年史、大事记、诈骗与骗局、基础知识 |

## 目录

```
src/
├── notes/<日期-英文短名>.astro   每篇文章的正文
├── lib/notes.js                 文章登记表：标题、日期、分类、类型、摘要
├── components/                  正文组件：卡片、提示框、流程、步骤、表格、代码、时间线、示意图、小动画、来源
├── layouts/                     页面外壳：顶栏、标题区、目录、翻页、页脚
├── pages/                       首页和文章页的路由
└── styles/                      样式（base.css 和区块链专题共用同一套设计）
blockchain/                      区块链专题，纯静态 HTML，构建时原样复制
scripts/                         构建时的检查
```

## 新增一篇文章

1. 在 `src/notes/` 下新建 `<日期-英文短名>.astro`，正文只用 `src/components/` 里的组件。
2. 在 `src/lib/notes.js` 的 `NOTES` 里登记：标题、日期、分类、类型（概念 / 操作 / 对比）、摘要、导语、一句话结论。
3. 运行 `npm run build`。正文写法不对、少了这种类型要求的节、登记和文件对不上，构建都会失败。
4. 推送到 `main`，GitHub Actions 会自动构建并发布。

示范文章：[HTTPS 是怎么保证安全的](src/notes/2026-11-08-https.astro)。

## 命令

需要 Node 22（版本见 `.nvmrc`）。

```sh
npm ci            # 安装依赖
npm run dev       # 本地预览：http://localhost:4321/read/
npm run build     # 正文检查 → 构建到 dist/ → 核对区块链专题和 git 里逐字节一致
```
