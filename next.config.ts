import type { NextConfig } from "next";

// STATIC_EXPORT=1 时构建纯静态版本（用于 GitHub Pages 部署）：
// - output: "export" 生成 out/ 静态文件
// - basePath 对应 GitHub Pages 项目站点路径 /ai-incubation-platform
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      basePath: "/ai-incubation-platform",
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
