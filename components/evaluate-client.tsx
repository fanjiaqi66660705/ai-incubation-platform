"use client";

import { useRef, useState } from "react";
import {
  DIMENSION_META,
  type EvaluationResult,
  type EvaluationSource,
} from "@/lib/types";
import ScoreRadar from "./score-radar";
import MarkdownView from "./markdown-view";
import { evaluateLocally } from "@/lib/client-local";

const EXAMPLE_BRIEF = `项目名称：智课伴侣
我们计划开发一个基于 RAG 的课程知识问答助手。同学们把课件、教材和历年题库上传后，系统自动切块向量化构建课程专属知识库，用自然语言提问即可获得带出处引用的回答。
目标用户是校内备考同学，计划先在 3 门专业课试点，两个月内覆盖 10 门课程。
主要功能包括：课程知识库问答、按章节刷题、错题自动归纳、考前重点预测。
技术栈为 Next.js + 向量数据库 + GLM 大模型，团队 4 人，希望帮助同学提升复习效率、减少重复答疑负担。`;

type Phase = "idle" | "scoring" | "advising" | "done" | "error";

const gradeColor: Record<string, string> = {
  S: "text-emerald-300 ring-emerald-400/40",
  A: "text-cyan-300 ring-cyan-400/40",
  B: "text-amber-300 ring-amber-400/40",
  C: "text-slate-400 ring-slate-400/40",
};

export default function EvaluateClient() {
  const [brief, setBrief] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [advice, setAdvice] = useState("");
  const [source, setSource] = useState<EvaluationSource | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const reset = () => {
    setResult(null);
    setAdvice("");
    setSource(null);
    setError("");
  };

  const stop = () => {
    abortRef.current?.abort();
    setPhase((p) => (p === "done" ? p : "idle"));
  };

  const submit = async () => {
    if (brief.trim().length < 20) {
      setError("请至少输入 20 个字的项目描述");
      return;
    }
    reset();
    setPhase("scoring");
    // 中止可能存在的旧请求，防止重复点击产生孤儿流
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // 静态导出版（GitHub Pages）无服务端接口，直接在浏览器本地运行演示逻辑
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1") {
      setSource("demo");
      await evaluateLocally(
        brief,
        {
          onScore: (r) => {
            setResult(r);
            setPhase("advising");
          },
          onDelta: (t) => setAdvice((prev) => prev + t),
        },
        controller.signal,
      );
      if (!controller.signal.aborted) setPhase("done");
      return;
    }

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `请求失败（${res.status}）`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const evt of events) {
          const eventLine = evt.split("\n").find((l) => l.startsWith("event: "));
          const dataLine = evt.split("\n").find((l) => l.startsWith("data: "));
          if (!eventLine || !dataLine) continue;
          const event = eventLine.slice(7);
          const data = JSON.parse(dataLine.slice(6)) as Record<string, unknown>;

          if (event === "meta") {
            setSource(data.source as EvaluationSource);
          } else if (event === "score") {
            setResult(data as unknown as EvaluationResult);
            setPhase("advising");
          } else if (event === "delta") {
            setAdvice((prev) => prev + (data.text as string));
          } else if (event === "error") {
            throw new Error((data.message as string) ?? "评估失败");
          } else if (event === "done") {
            setPhase("done");
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setPhase("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "发生未知错误");
      setPhase("error");
    }
  };

  const loading = phase === "scoring" || phase === "advising";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* 左侧输入 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">
            项目计划书 / 项目描述
          </label>
          <button
            onClick={() => setBrief(EXAMPLE_BRIEF)}
            className="text-xs text-emerald-300/80 transition-colors hover:text-emerald-300"
          >
            填入示例
          </button>
        </div>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          disabled={loading}
          placeholder="粘贴你的科创项目计划书，或描述项目背景、目标用户、核心功能与技术方案…"
          className="h-80 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-emerald-400/50 focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>{brief.length} 字（建议 200 字以上，评分更准）</span>
        </div>
        {error && phase === "error" && (
          <p className="rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-300 ring-1 ring-red-400/20">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-sm font-semibold text-[#070b14] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {phase === "scoring"
              ? "AI 正在分析项目…"
              : phase === "advising"
                ? "正在生成孵化建议…"
                : "开始 AI 评估"}
          </button>
          {loading && (
            <button
              onClick={stop}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 transition-colors hover:text-slate-200"
            >
              停止
            </button>
          )}
        </div>
      </div>

      {/* 右侧结果 */}
      <div className="min-h-[500px] rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        {!result && phase === "scoring" && (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 text-slate-500">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
            <p className="text-sm">AI 评审正在阅读你的计划书…</p>
          </div>
        )}

        {!result && phase !== "scoring" && (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 text-center">
            <span className="text-5xl">📋</span>
            <p className="text-sm text-slate-400">评估报告将在这里生成</p>
            <p className="max-w-xs text-xs leading-relaxed text-slate-600">
              五个维度量化打分、能力雷达图，以及一份可执行的孵化改进建议
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-7">
            {/* 来源与总分 */}
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-1 text-xs ring-1 ${
                  source === "glm"
                    ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30"
                    : "bg-amber-400/10 text-amber-300 ring-amber-400/30"
                }`}
              >
                {source === "glm" ? "GLM-4 实时评估" : "演示模式 · 配置 Key 后启用真实模型"}
              </span>
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.03] text-xl font-bold ring-2 ${gradeColor[result.grade]}`}
              >
                {result.grade}
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-emerald-300 tabular-nums">
                {result.overall}
              </span>
              <span className="text-sm text-slate-500">综合得分 / 100</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">{result.summary}</p>

            {/* 雷达图 */}
            <ScoreRadar result={result} />

            {/* 维度明细 */}
            <div className="space-y-3">
              {result.dimensions.map((d) => (
                <div key={d.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">
                      {DIMENSION_META[d.key].label}
                    </span>
                    <span className="tabular-nums text-slate-400">{d.score}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{d.reason}</p>
                </div>
              ))}
            </div>

            {/* 流式建议 */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                🌱 孵化导师建议
                {phase === "advising" && (
                  <span className="h-3.5 w-1.5 animate-pulse bg-emerald-400" />
                )}
              </h3>
              {advice ? <MarkdownView content={advice} /> : (
                <p className="text-xs text-slate-600">建议生成中…</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
