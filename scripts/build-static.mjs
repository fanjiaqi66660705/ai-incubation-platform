// GitHub Pages 静态构建脚本：
// API 路由（app/api）无法在纯静态环境运行，构建前临时移出，结束后自动恢复
import { existsSync, renameSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const apiDir = path.join(root, "app", "api");
const backupDir = path.join(root, ".api-backup");

if (existsSync(apiDir)) {
  renameSync(apiDir, backupDir);
  console.log("[build-static] 已临时移出 app/api 目录");
}

let exitCode = 0;
try {
  const result = spawnSync("npx.cmd", ["next", "build"], {
    stdio: "inherit",
    cwd: root,
    env: {
      ...process.env,
      STATIC_EXPORT: "1",
      NEXT_PUBLIC_STATIC_EXPORT: "1",
    },
  });
  exitCode = result.status ?? 1;
} finally {
  // 先恢复目录再退出（process.exit 会跳过 finally，因此退出放到最后）
  if (existsSync(backupDir)) {
    renameSync(backupDir, apiDir);
    console.log("[build-static] 已恢复 app/api 目录");
  }
}

if (exitCode !== 0) {
  process.exit(exitCode);
}

// GitHub Pages 默认用 Jekyll 处理，会忽略 _next 目录，必须加 .nojekyll
writeFileSync(path.join(root, "out", ".nojekyll"), "");
console.log("\n[build-static] 完成：out/ 目录已生成（含 .nojekyll）");
