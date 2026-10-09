import type { Metadata } from "next";
import { getAllProjects } from "@/lib/data";
import ProjectExplorer from "@/components/project-explorer";

export const metadata: Metadata = {
  title: "项目展示",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">项目展示</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          校内科创项目一览：从灵感到落地的每一步，都被平台记录与展示。
        </p>
      </div>
      <ProjectExplorer projects={projects} />
    </div>
  );
}
