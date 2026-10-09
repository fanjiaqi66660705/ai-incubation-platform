import { NextResponse } from "next/server";
import {
  getEvaluation,
  streamAdvice,
  getDemoEvaluation,
  DEMO_ADVICE,
} from "@/lib/glm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 将演示建议切成小块，模拟流式打字机效果
const DEMO_CHUNK_SIZE = 4;
const DEMO_CHUNK_DELAY = 14;

export async function POST(request: Request) {
  let brief = "";
  try {
    const body = (await request.json()) as { brief?: string };
    brief = (body.brief ?? "").trim();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  if (brief.length < 20) {
    return NextResponse.json(
      { error: "项目计划书内容过短，请至少输入 20 个字" },
      { status: 400 },
    );
  }
  if (brief.length > 8000) {
    return NextResponse.json({ error: "内容超过 8000 字限制" }, { status: 400 });
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
        // 1. 结构化评分（真实模型 / 演示降级）
        const evaluation = hasKey
          ? await getEvaluation(brief, signal)
          : getDemoEvaluation(brief);
        send("meta", { source: hasKey ? "glm" : "demo" });
        send("score", evaluation);

        // 2. 流式改进建议
        if (hasKey) {
          for await (const text of streamAdvice(brief, evaluation, signal)) {
            send("delta", { text });
          }
        } else {
          for (let i = 0; i < DEMO_ADVICE.length; i += DEMO_CHUNK_SIZE) {
            if (signal.aborted) break;
            send("delta", { text: DEMO_ADVICE.slice(i, i + DEMO_CHUNK_SIZE) });
            await new Promise((r) => setTimeout(r, DEMO_CHUNK_DELAY));
          }
        }

        send("done", { ok: true });
      } catch (err) {
        send("error", {
          message: err instanceof Error ? err.message : "评估过程发生未知错误",
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
