"use client";

import { useMemo, useState } from "react";
import ProjectCard from "./project-card";
import {
  CATEGORY_META,
  STATUS_META,
  type Project,
  type ProjectCategory,
  type ProjectStatus,
} from "@/lib/types";

const categories = Object.keys(CATEGORY_META) as ProjectCategory[];
const statuses = Object.keys(STATUS_META) as ProjectStatus[];

export default function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "全部">("全部");
  const [status, setStatus] = useState<ProjectStatus | "全部">("全部");

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return projects.filter((p) => {
      const matchKw =
        !kw ||
        p.title.toLowerCase().includes(kw) ||
        p.summary.toLowerCase().includes(kw) ||
        p.techStack.some((t) => t.toLowerCase().includes(kw));
      const matchCat = category === "全部" || p.category === category;
      const matchStatus = status === "全部" || p.status === status;
      return matchKw && matchCat && matchStatus;
    });
  }, [projects, keyword, category, status]);

  const chip = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm transition-colors ${
      active
        ? "bg-emerald-400/15 font-medium text-emerald-300 ring-1 ring-emerald-400/40"
        : "bg-white/5 text-slate-400 ring-1 ring-white/10 hover:text-slate-200"
    }`;

  return (
    <div className="space-y-6">
      {/* 搜索框 */}
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索项目名称、简介或技术栈…"
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-400/50 focus:outline-none"
      />

      {/* 分类筛选 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-slate-500">方向</span>
        <button onClick={() => setCategory("全部")} className={chip(category === "全部")}>
          全部
        </button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={chip(category === c)}>
            {CATEGORY_META[c].icon} {c}
          </button>
        ))}
      </div>

      {/* 状态筛选 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-slate-500">阶段</span>
        <button onClick={() => setStatus("全部")} className={chip(status === "全部")}>
          全部
        </button>
        {statuses.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={chip(status === s)}>
            {STATUS_META[s].label}
          </button>
        ))}
      </div>

      {/* 结果统计 */}
      <p className="text-sm text-slate-500">
        共 {filtered.length} 个项目
        {keyword && `（匹配“${keyword}”）`}
      </p>

      {/* 项目网格 */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-sm text-slate-500">
          没有找到匹配的项目，换个关键词试试？
        </div>
      )}
    </div>
  );
}
