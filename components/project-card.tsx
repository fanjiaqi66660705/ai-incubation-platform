import { CATEGORY_META, STATUS_META } from "@/lib/types";
import type { Project } from "@/lib/types";
import Link from "next/link";

export default function ProjectCard({ project }: { project: Project }) {
  const meta = CATEGORY_META[project.category];
  const status = STATUS_META[project.status];

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition-all hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.05]"
    >
      {/* 渐变头图区 */}
      <div
        className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${meta.gradient}`}
      >
        <span className="text-5xl transition-transform duration-300 group-hover:scale-110">
          {meta.icon}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs ring-1 ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{project.category}</span>
          <span>·</span>
          <span>{project.team}</span>
        </div>
        <h3 className="text-base font-semibold text-slate-100 transition-colors group-hover:text-emerald-300">
          {project.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
          {project.summary}
        </p>

        <div className="mt-1 flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-400"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-3 pt-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-slate-500">
            {project.progress}%
          </span>
          <span className="text-xs text-slate-500">★ {project.stars}</span>
        </div>
      </div>
    </Link>
  );
}
