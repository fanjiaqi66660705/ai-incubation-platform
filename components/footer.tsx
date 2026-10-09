export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:px-6">
        <p className="text-sm text-slate-400">
          科创星火 · AI 科创项目孵化展示平台
        </p>
        <p className="max-w-xl text-xs leading-relaxed text-slate-600">
          用 AI 帮助同学们更好地评估科创项目、检索技术资源 ——
          让每一个好想法都被看见、被评估、被孵化。
        </p>
        <p className="text-xs text-slate-700">
          Next.js · TypeScript · Tailwind CSS · 智谱 GLM
        </p>
      </div>
    </footer>
  );
}
