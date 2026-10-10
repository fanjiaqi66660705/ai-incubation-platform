"use client";

import { useRef, useState } from "react";
import {
  RESOURCE_CATEGORY_META,
  type ResourceMatch,
  type SearchSource,
} from "@/lib/types";
import MarkdownView from "./markdown-view";
import { searchLocally } from "@/lib/client-local";

const EXAMPLE_QUERIES = [
  "我想做一个课程知识库问答项目，有什么开源项目可以参考？",
  "零基础想学深度学习，推荐一些入门教程",
  "明年想打比赛，有哪些含金量高的科创竞赛？",
  "做数据分析项目，去哪里找真实数据集？",
];

interface Round {
  id: number;
  query: string;
  source: SearchSource | null;
  matches: ResourceMatch[];
  summary: string;
  status: "searching" | "answering" | "done" | "error";
  error?: string;
}

function formatStars(stars: number): string {
  return stars >= 10000 ? `${(stars / 10000).toFixed(1)}w` : `${stars}`;
}

export default function ResourceSearch() {
  const [query, setQuery] = useState("");
  const [rounds, setRounds] = useState<Round[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const idRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const activeRound = rounds.find((r) => r.status === "searching" || r.status === "answering");
  const loading = Boolean(activeRound);

  const updateRound = (id: number, patch: Partial<Round>) => {
    setRounds((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  };

  const stop = () => {
    abortRef.current?.abort();
    if (activeRound) updateRound(activeRound.id, { status: "done" });
  };

  const submit = async (raw?: string) => {
    const q = (raw ?? query).trim();
    if (loading) return;
    if (q.length < 4) return;

    setQuery("");
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const id = ++idRef.current;
    setRounds((prev) => [
      ...prev,
      { id, query: q, source: null, matches: [], summary: "", status: "searching" },
    ]);
    scrollToBottom();

    // 静态导出版（GitHub Pages）无服务端接口，直接在浏览器本地检索
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1") {
      await searchLocally(
        q,
        {
          onResults: (matches) => {
            updateRound(id, { source: "demo", matches, status: "answering" });
            scrollToBottom();
          },
          onDelta: (t) =>
            setRounds((prev) =>
              prev.map((r) =>
                r.id === id ? { ...r, summary: r.summary + t } : r,
              ),
            ),
        },
        controller.signal,
      );
      updateRound(id, { status: "done" });
      return;
    }

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
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
            updateRound(id, { source: data.source as SearchSource });
          } else if (event === "results") {
            updateRound(id, {
              matches: (data.matches as ResourceMatch[]) ?? [],
              status: "answering",
            });
            scrollToBottom();
          } else if (event === "delta") {
            setRounds((prev) =>
              prev.map((r) =>
                r.id === id ? { ...r, summary: r.summary + (data.text as string) } : r,
              ),
            );
          } else if (event === "error") {
            throw new Error((data.message as string) ?? "检索失败");
          } else if (event === "done") {
            updateRound(id, { status: "done" });
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        updateRound(id, { status: "done" });
        return;
      }
      updateRound(id, {
        status: "error",
        error: err instanceof Error ? err.message : "发生未知错误",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 对话区 */}
      {rounds.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-6 py-14 text-center">
          <span className="text-5xl">🔍</span>
          <p className="mt-4 text-sm text-slate-400">
            用一句自然语言描述你的需求，AI 帮你从资源库中精准匹配
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-600">
            开源项目、数据集、竞赛、教程、工具平台 —— 试试下面的示例问题，或直接输入你的想法
          </p>
          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => submit(q)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-slate-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {rounds.map((round) => (
            <div key={round.id} className="space-y-4">
              {/* 用户提问 */}
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 px-4 py-2.5 text-sm text-slate-200 ring-1 ring-emerald-400/20">
                  {round.query}
                </p>
              </div>

              {/* AI 回答 */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    ✨ 资源推荐
                    {(round.status === "searching" || round.status === "answering") && (
                      <span className="h-3.5 w-1.5 animate-pulse bg-emerald-400" />
                    )}
                  </h3>
                  {round.source && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ring-1 ${
                        round.source === "glm"
                          ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30"
                          : "bg-amber-400/10 text-amber-300 ring-amber-400/30"
                      }`}
                    >
                      {round.source === "glm"
                        ? "GLM-4 语义检索"
                        : "演示模式 · 配置 Key 后启用语义检索"}
                    </span>
                  )}
                </div>

                {round.status === "searching" && (
                  <div className="flex items-center gap-3 py-6 text-slate-500">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
                    <p className="text-sm">AI 正在资源库中检索匹配…</p>
                  </div>
                )}

                {round.status === "error" && (
                  <p className="rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-300 ring-1 ring-red-400/20">
                    {round.error}
                  </p>
                )}

                {round.matches.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {round.matches.map((m) => {
                      const meta = RESOURCE_CATEGORY_META[m.resource.category];
                      return (
                        <a
                          key={m.resource.id}
                          href={m.resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group rounded-xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:border-emerald-400/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1 ${meta.className}`}
                            >
                              {meta.icon} {m.resource.category}
                            </span>
                            <span className="shrink-0 text-xs font-semibold text-emerald-300 tabular-nums">
                              {m.score}% 匹配
                            </span>
                          </div>
                          <h4 className="mt-2.5 font-semibold text-slate-100 transition-colors group-hover:text-emerald-300">
                            {m.resource.title}
                            <span className="ml-1.5 text-xs text-slate-600 transition-colors group-hover:text-emerald-400">
                              ↗
                            </span>
                          </h4>
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {m.resource.description}
                          </p>
                          <p className="mt-2.5 rounded-lg bg-emerald-400/[0.06] px-2.5 py-1.5 text-xs leading-relaxed text-emerald-200/80 ring-1 ring-emerald-400/10">
                            💡 {m.reason}
                          </p>
                          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
                            <div className="flex flex-wrap gap-1.5">
                              {m.resource.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-white/5 px-2 py-0.5"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span className="shrink-0 tabular-nums">
                              ⭐ {formatStars(m.resource.stars)}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}

                {round.summary && (
                  <div className="mt-4 border-t border-white/5 pt-4">
                    <MarkdownView content={round.summary} />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* 输入区 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="sticky bottom-4 flex gap-3 rounded-2xl border border-white/10 bg-[#0a0f1c]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          placeholder="描述你的需求，例如：想做一个校园小程序，需要什么技术？"
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-400/50 focus:outline-none disabled:opacity-60"
        />
        {loading ? (
          <button
            type="button"
            onClick={stop}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
          >
            停止
          </button>
        ) : (
          <button
            type="submit"
            disabled={query.trim().length < 4}
            className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-[#070b14] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            发送
          </button>
        )}
      </form>
    </div>
  );
}
