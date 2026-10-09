import type { ReactNode } from "react";

// 行内 **加粗** 解析
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-slate-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

// 轻量 Markdown 渲染：支持 ## 标题、- 无序列表、1. 有序列表、**加粗**
export default function MarkdownView({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag
        key={`list-${blocks.length}`}
        className={`my-2 space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300 ${
          list.ordered ? "list-decimal" : "list-disc"
        } marker:text-emerald-400`}
      >
        {list.items.map((item, i) => (
          <li key={i}>{renderInline(item, `item-${blocks.length}-${i}`)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (line.startsWith("## ")) {
      flush();
      blocks.push(
        <h3
          key={`h-${idx}`}
          className="mt-5 mb-2 text-base font-semibold text-emerald-300"
        >
          {line.slice(3)}
        </h3>,
      );
    } else if (line.startsWith("- ")) {
      if (!list || list.ordered) {
        flush();
        list = { ordered: false, items: [] };
      }
      list.items.push(line.slice(2));
    } else if (/^\d+\.\s/.test(line)) {
      if (!list || !list.ordered) {
        flush();
        list = { ordered: true, items: [] };
      }
      list.items.push(line.replace(/^\d+\.\s/, ""));
    } else if (line) {
      flush();
      blocks.push(
        <p key={`p-${idx}`} className="my-2 text-sm leading-relaxed text-slate-300">
          {renderInline(line, `p-${idx}`)}
        </p>,
      );
    }
  });
  flush();

  return <div>{blocks}</div>;
}
