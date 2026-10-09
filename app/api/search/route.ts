import { NextResponse } from "next/server";
import { resources, searchResources } from "@/lib/data";
import {
  matchResourcesWithGLM,
  streamSearchSummary,
  buildDemoSummary,
} from "@/lib/glm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 将演示解读切成小块，模拟流式打字机效果
const DEMO_CHUNK_SIZE = 4;
const DEMO_CHUNK_DELAY = 14;

export async function POST(request: Request) {
  let query = "";
  try {
    const body = (await request.json()) as { query?: string };
    query = (body.query ?? "").trim();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  if (query.length < 4) {
    return NextResponse.json(
      { error: "问题过短，请至少输入 4 个字描述你的需求" },
      { status: 400 },
    );
  }
  if (query.length > 500) {
    return NextResponse.json({ error: "问题超过 500 字限制" }, { status: 400 });
  }

  const signal = request.signal;
  const hasKey = Boolean(process.env.ZHIPU_API_KEY);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        // 1. 匹配资源（真实模型 / 本地关键词检索）
        const matches = hasKey
          ? await matchResourcesWithGLM(query, resources, signal)
          : searchResources(query);
        send("meta", { source: hasKey ? "glm" : "demo" });
        send("results", { matches });

        // 2. 流式推荐解读
        if (hasKey) {
          for await (const text of streamSearchSummary(query, matches, signal)) {
            send("delta", { text });
          }
        } else {
          const demo = buildDemoSummary(query, matches);
          for (let i = 0; i < demo.length; i += DEMO_CHUNK_SIZE) {
            if (signal.aborted) break;
            send("delta", { text: demo.slice(i, i + DEMO_CHUNK_SIZE) });
            await new Promise((r) => setTimeout(r, DEMO_CHUNK_DELAY));
          }
        }

        send("done", { ok: true });
      } catch (err) {
        send("error", {
          message: err instanceof Error ? err.message : "检索过程发生未知错误",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
