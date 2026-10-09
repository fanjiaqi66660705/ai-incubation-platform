import type { Metadata } from "next";
import EvaluateClient from "@/components/evaluate-client";

export const metadata: Metadata = {
  title: "AI 项目评估",
  description:
    "AI 从创新性、可行性、技术难度、社会价值、完成度五维量化评估科创项目，生成雷达图与孵化改进建议。",
};

export default function EvaluatePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI 项目评估引擎</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          粘贴项目计划书，AI 评审将从五个维度量化打分，并给出一份可执行的孵化改进建议
          —— 立项之前，先给项目做一次专业体检。
        </p>
      </div>
      <EvaluateClient />
    </div>
  );
}
