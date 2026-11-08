// 构建后核对区块链专题没有被改动（npm run build 最后一步，GitHub Actions 里也跑）：
// dist/blockchain/ 下的每个文件，和 git 里 blockchain/ 的同名文件逐字节一致（比 git blob 哈希），不多不少。
// 用户确认过的区块链页面必须原样保留，不一致就构建失败、不发布。
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist");
const blob = (buf) => crypto.createHash("sha1").update(`blob ${buf.length}\0`).update(buf).digest("hex");

const tracked = new Map();
for (const rec of execFileSync("git", ["ls-files", "-s", "-z", "--", "blockchain"], { cwd: ROOT }).toString("utf8").split("\0").filter(Boolean)) {
  const [meta, file] = rec.split("\t");
  tracked.set(file, meta.split(" ")[1]);
}
const errs = [];
for (const [file, sha] of tracked) {
  const p = path.join(OUT, file);
  if (!fs.existsSync(p)) errs.push(`缺少 ${file}`);
  else if (blob(fs.readFileSync(p)) !== sha) errs.push(`${file} 和 git 里的不一致`);
}
(function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else { const rel = path.relative(OUT, p).split(path.sep).join("/"); if (!tracked.has(rel)) errs.push(`多出来的 ${rel}`); }
  }
})(path.join(OUT, "blockchain"));

if (errs.length) { console.log("FAIL 区块链专题和 git 里的不一致：\n  " + errs.slice(0, 20).join("\n  ")); process.exit(1); }
console.log(`区块链专题：${tracked.size} 个文件和 git 里逐字节一致`);
