import type { Metadata } from "next";
import ResourceSearch from "@/components/resource-search";

export const metadata: Metadata = {
  title: "AI 技术资源检索",
  description:
    "用自然语言检索开源项目、数据集、竞赛与教程，AI 对话式交互直达目标资源。",
};

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI 技术资源检索</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          不用翻收藏夹，也不用记关键词 ——
          用一句自然语言描述你的需求，AI 从开源项目、数据集、竞赛、教程与工具平台中精准匹配，并给出推荐解读。
        </p>
      </div>
      <ResourceSearch />
    </div>
  );
}
