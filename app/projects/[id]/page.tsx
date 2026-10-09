import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById, getAllProjects } from "@/lib/data";
import { CATEGORY_META, STATUS_META } from "@/lib/types";
import ProjectCard from "@/components/project-card";

// 预渲染所有项目详情页
export function generateStaticParams() {
  return getAllProjects().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);
  return { title: project ? project.title : "项目不存在" };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  const meta = CATEGORY_META[project.category];
  const status = STATUS_META[project.status];
  const related = getAllProjects()
    .filter((p) => p.id !== project.id && p.category === project.category)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* 返回 */}
      <Link
        href="/projects"
        className="text-sm text-slate-500 transition-colors hover:text-emerald-300"
      >
        ← 返回项目列表
      </Link>

      {/* 头部 */}
      <div
        className={`mt-6 flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} border border-white/8`}
      >
        <span className="text-6xl">{meta.icon}</span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
        <span
          className={`rounded-full px-2.5 py-1 text-xs ring-1 ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
        <span>{project.category}</span>
        <span>团队：{project.team}</span>
        <span>创建于 {project.createdAt}</span>
        <span>★ {project.stars}</span>
      </div>

      {/* 简介 + 进度 */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold">项目简介</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            {project.description}
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">孵化进度</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-300 tabular-nums">
              {project.progress}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="pt-2">
            <h3 className="mb-2 text-sm font-medium text-slate-300">技术栈</h3>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 里程碑时间线 */}
      <div className="mt-12">
        <h2 className="mb-6 text-lg font-semibold">孵化里程碑</h2>
        <ol className="relative space-y-6 border-l border-white/10 pl-6">
          {project.milestones.map((m) => (
            <li key={m.title} className="relative">
              <span
                className={`absolute -left-[31px] top-1 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-[#070b14] ${
                  m.done ? "bg-emerald-400" : "bg-slate-600"
                }`}
              />
              <p
                className={`text-sm font-medium ${
                  m.done ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {m.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                {m.date}
                {m.done ? " · 已完成" : " · 进行中"}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* 相关项目 */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-5 text-lg font-semibold">同类项目</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
