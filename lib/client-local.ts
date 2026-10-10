import { DEMO_ADVICE, buildDemoSummary, getDemoEvaluation } from "./glm";
import { searchResources } from "./data";
import type { EvaluationResult, ResourceMatch } from "./types";

// 将整段文本切成小块，模拟打字机流式输出；支持 AbortSignal 中断
async function streamText(
  text: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  chunkSize = 4,
  delayMs = 14,
) {
  for (let i = 0; i < text.length; i += chunkSize) {
    if (signal?.aborted) return;
    onChunk(text.slice(i, i + chunkSize));
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 纯静态环境（GitHub Pages）无服务端接口，
// 在浏览器本地运行演示评估逻辑（与服务端无 Key 降级同一套算法）
export async function evaluateLocally(
  brief: string,
  handlers: {
    onScore: (result: EvaluationResult) => void;
    onDelta: (text: string) => void;
  },
  signal?: AbortSignal,
) {
  await sleep(1500); // 模拟 AI 阅读计划书的耗时
  if (signal?.aborted) return;
  handlers.onScore(getDemoEvaluation(brief));
  await streamText(DEMO_ADVICE, handlers.onDelta, signal);
}

// 纯静态环境下的本地资源检索：关键词加权匹配 + 推荐解读
export async function searchLocally(
  query: string,
  handlers: {
    onResults: (matches: ResourceMatch[]) => void;
    onDelta: (text: string) => void;
  },
  signal?: AbortSignal,
) {
  await sleep(900); // 模拟检索耗时
  if (signal?.aborted) return;
  const matches = searchResources(query);
  handlers.onResults(matches);
  await streamText(buildDemoSummary(query, matches), handlers.onDelta, signal);
}
