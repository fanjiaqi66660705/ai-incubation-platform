import Link from "next/link";
import { getAllProjects, getFeaturedProjects } from "@/lib/data";
import ProjectCard from "@/components/project-card";

const capabilities = [
  {
    icon: "🧭",
    title: "项目展示中心",
    desc: "项目卡片墙、详情页与多维筛选，让每个科创项目都被看见。",
    live: true,
  },
  {
    icon: "🤖",
    title: "AI 项目评估引擎",
    desc: "粘贴计划书，AI 从创新性、可行性等 5 个维度打分，生成雷达图与改进建议。",
    live: true,
  },
  {
    icon: "🔍",
    title: "AI 技术资源检索",
    desc: "用自然语言检索开源项目、数据集、竞赛与教程，对话式交互直达目标资源。",
    live: true,
  },
  {
    icon: "🌱",
    title: "孵化路线图",
    desc: "从创意到路演的完整生命周期展示，里程碑节点清晰可追踪。",
    soon: true,
  },
];

export default function HomePage() {
  const projects = getAllProjects();
  const featured = getFeaturedProjects(3);
  const launched = projects.filter((p) => p.status === "launched").length;
  const incubating = projects.filter((p) => p.status === "incubating").length;
  const totalStars = projects.reduce((sum, p) => sum + p.stars, 0);

  return (
    <div>
      {/* Hero */}
      <section className="hero-grid relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-1.5 text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            AI 驱动的校内科创孵化平台
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            让科创项目
            <span className="text-gradient">被看见、被评估、被孵化</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400">
            用 AI 技术帮助同学们更好地评估科创项目、检索技术资源。
            从一个想法到站上路演舞台，星火与你同行。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/projects"
              className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-semibold text-[#070b14] transition-opacity hover:opacity-90"
            >
              浏览项目 →
            </Link>
            <Link
              href="/evaluate"
              className="rounded-xl border border-white/10 px-6 py-3 text-sm text-slate-300 transition-colors hover:border-emerald-400/30 hover:text-emerald-300"
            >
              试试 AI 项目评估
            </Link>
          </div>

          {/* 统计条 */}
          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: projects.length, label: "在校项目" },
              { value: incubating, label: "孵化中" },
              { value: launched, label: "已上线" },
              { value: `${totalStars}+`, label: "累计 Star" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5"
              >
                <p className="text-2xl font-bold text-emerald-300 tabular-nums">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 平台能力 */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          平台核心能力
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          项目展示已上线，AI 引擎正在火速赶来
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className={`rounded-2xl border p-6 transition-colors ${
                c.live
                  ? "border-emerald-400/25 bg-emerald-400/[0.04]"
                  : "border-white/8 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{c.icon}</span>
                {c.live ? (
                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300 ring-1 ring-emerald-400/30">
                    已上线
                  </span>
                ) : (
                  <span className="rounded-full bg-violet-400/10 px-2 py-0.5 text-xs text-violet-300 ring-1 ring-violet-400/30">
                    即将上线
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-semibold text-slate-100">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 精选项目 */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">精选项目</h2>
            <p className="mt-2 text-sm text-slate-500">
              社区里最受关注的科创项目
            </p>
          </div>
          <Link
            href="/projects"
            className="text-sm text-emerald-300 transition-colors hover:text-emerald-200"
          >
            查看全部 →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-emerald-400/[0.06] via-transparent to-cyan-400/[0.06] px-8 py-14 text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            有想法？让它在这里发芽
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            无论是课程作业的延伸、竞赛项目的孵化，还是天马行空的原型验证，
            都值得一个被认真对待的舞台。
          </p>
        </div>
      </section>
    </div>
  );
}
