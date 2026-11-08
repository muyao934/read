// Astro 配置：站点发布在 https://muyao934.github.io/read/，每页输出成 <路径>.html，和改版前的网址一致。
// blockchain/ 是原样保留的区块链专题（纯静态 HTML，用户确认过的页面），不经过 Astro：
//   构建时把 git 跟踪的 blockchain/ 文件原样复制进 dist/blockchain/，scripts/verify-blockchain.mjs 逐字节核对；
//   npm run dev 时由下面的中间件直接读源文件。
import { defineConfig } from "astro/config";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const BASE = "/read";

// 只取 git 跟踪的文件：blockchain/tools/、CLAUDE.md 等被 .gitignore 排除的不会发布
function trackedBlockchainFiles() {
  return execFileSync("git", ["ls-files", "-z", "--", "blockchain"], { cwd: ROOT }).toString("utf8").split("\0").filter(Boolean);
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
};

function blockchainPassthrough() {
  return {
    name: "blockchain-passthrough",
    hooks: {
      "astro:server:setup": ({ server }) => {
        const files = new Set(trackedBlockchainFiles());
        server.middlewares.use((req, res, next) => {
          let p = decodeURIComponent((req.url || "").split("?")[0]);
          if (!p.startsWith(BASE + "/blockchain/")) return next();
          p = p.slice(BASE.length + 1);
          if (p.endsWith("/")) p += "index.html";
          if (!files.has(p)) return next();   // 只回应 git 跟踪的文件，路径穿越不会命中
          res.setHeader("Content-Type", MIME[path.extname(p)] || "application/octet-stream");
          res.end(fs.readFileSync(path.join(ROOT, p)));
        });
      },
      "astro:build:done": ({ dir }) => {
        const out = fileURLToPath(dir);
        for (const f of trackedBlockchainFiles()) {
          const to = path.join(out, f);
          fs.mkdirSync(path.dirname(to), { recursive: true });
          fs.copyFileSync(path.join(ROOT, f), to);
        }
      },
    },
  };
}

export default defineConfig({
  site: "https://muyao934.github.io",
  base: BASE,
  trailingSlash: "ignore",
  build: { format: "file", inlineStylesheets: "never" },
  compressHTML: false,   // 代码块里的换行和缩进要原样保留
  integrations: [blockchainPassthrough()],
});
