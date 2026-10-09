import {
  DIMENSION_META,
  type DimensionKey,
  type DimensionScore,
  type EvaluationResult,
  type Resource,
  type ResourceMatch,
} from "./types";
import { getResourceById, searchResources } from "./data";

const GLM_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const MODEL = "glm-4-flash";

// 评估系统提示词：要求严格输出 JSON
const SCORE_SYSTEM_PROMPT = `你是资深科创项目评审专家，长期负责"挑战杯""互联网+"等科创竞赛的项目评审。
请从以下 5 个维度评估用户给出的科创项目计划书，每个维度打 0-100 的整数分：
- innovation：创新性，选题与方案的新颖程度
- feasibility：可行性，资源、周期与落地把握
- techDifficulty：技术难度，技术栈深度与挑战性
- socialValue：社会价值，解决的问题与受益面
- completeness：完成度，计划完整性与规划清晰度

评分标准：90+ 卓越，75-89 优秀，60-74 合格，40-59 偏弱，<40 不足。
总分 overall 为五维平均分（四舍五入）。
等级 grade：overall>=90 为 S，>=80 为 A，>=65 为 B，否则为 C。

必须只输出一个 JSON 对象，不要输出任何额外文字，格式：
{"overall":number,"grade":"S","summary":"50字以内的总体评语","dimensions":[{"key":"innovation","score":80,"reason":"20字内打分理由"}, ...其余四个维度...]}`;

const ADVICE_SYSTEM_PROMPT = `你是科创项目孵化导师。请根据用户的科创项目计划书与评分结果，给出一份具体、可执行的孵化改进建议。
要求：
1. 用 Markdown 输出，包含"核心优势""关键风险""下一步行动清单（3-5条，每条标明建议周期）"三部分；
2. 建议要落到校内科创的真实场景（组队、资源、竞赛节奏、技术选型），不要空泛口号；
3. 语言简练有力，总字数 400 字以内。`;

interface GLMMessage {
  role: "system" | "user";
  content: string;
}

async function callGLM(messages: GLMMessage[], signal?: AbortSignal) {
  const res = await fetch(GLM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.4 }),
    signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GLM 接口错误 ${res.status}: ${detail.slice(0, 200)}`);
  }
  return res;
}

// 清洗模型输出：提取 JSON、兜底字段、约束分数范围
function normalizeEvaluation(raw: unknown): EvaluationResult {
  const obj = (typeof raw === "object" && raw ? raw : {}) as Record<
    string,
    unknown
  >;
  const rawDims = Array.isArray(obj.dimensions) ? obj.dimensions : [];
  const dims: DimensionScore[] = (
    Object.keys(DIMENSION_META) as DimensionKey[]
  ).map((key) => {
    const found = rawDims.find(
      (d: unknown) =>
        typeof d === "object" && d !== null && (d as Record<string, unknown>).key === key,
    ) as Record<string, unknown> | undefined;
    const score = Number(found?.score);
    return {
      key,
      score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 60,
      reason: typeof found?.reason === "string" ? found.reason : "模型未给出理由",
    };
  });
  const overall = Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length);
  const grade = overall >= 90 ? "S" : overall >= 80 ? "A" : overall >= 65 ? "B" : "C";
  return {
    overall,
    grade,
    summary: typeof obj.summary === "string" ? obj.summary : "该项目具备一定基础，建议聚焦核心优势继续打磨。",
    dimensions: dims,
  };
}

// 非流式获取结构化评分
export async function getEvaluation(
  brief: string,
  signal?: AbortSignal,
): Promise<EvaluationResult> {
  const res = await callGLM(
    [
      { role: "system", content: SCORE_SYSTEM_PROMPT },
      { role: "user", content: brief },
    ],
    signal,
  );
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "{}";
  const jsonStart = content.indexOf("{");
  const jsonEnd = content.lastIndexOf("}");
  const parsed = JSON.parse(
    jsonStart >= 0 && jsonEnd > jsonStart
      ? content.slice(jsonStart, jsonEnd + 1)
      : content,
  );
  return normalizeEvaluation(parsed);
}

// 流式获取改进建议：async generator 逐段 yield 文本
export async function* streamAdvice(
  brief: string,
  evaluation: EvaluationResult,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const scoreText = evaluation.dimensions
    .map((d) => `${DIMENSION_META[d.key].label} ${d.score} 分`)
    .join("，");
  const res = await callGLM(
    [
      { role: "system", content: ADVICE_SYSTEM_PROMPT },
      {
        role: "user",
        content: `项目计划书：\n${brief}\n\n当前评分：${scoreText}。总体评语：${evaluation.summary}`,
      },
    ],
    signal,
  );

  const body = res.body;
  if (!body) throw new Error("GLM 未返回流");

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        const text = json.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        // 跳过不完整分片
      }
    }
  }
}

// ============ 无 Key 演示降级 ============

// 基于文本特征生成确定性的演示评分，保证无 Key 也能完整演示
export function getDemoEvaluation(brief: string): EvaluationResult {
  const len = brief.length;
  const hasTech = /(AI|人工智能|模型|算法|小程序|App|硬件|传感器|平台|数据)/.test(brief);
  const hasPlan = /(计划|阶段|目标|用户|需求|方案|上线|测试)/.test(brief);
  const hasValue = /(帮助|解决|社会|公益|志愿|校园|同学|效率|服务)/.test(brief);

  const base = Math.min(72, 50 + Math.floor(len / 30));
  const dims: DimensionScore[] = [
    {
      key: "innovation",
      score: Math.min(92, base + (hasTech ? 14 : 0)),
      reason: hasTech ? "结合 AI 技术，切入点较新颖" : "方案形态较常见，差异化待加强",
    },
    {
      key: "feasibility",
      score: Math.min(90, base + (hasPlan ? 12 : -4)),
      reason: hasPlan ? "有明确规划，落地路径较清晰" : "缺少阶段规划，落地风险偏高",
    },
    {
      key: "techDifficulty",
      score: Math.min(88, base + (hasTech ? 10 : 2)),
      reason: hasTech ? "技术栈有一定深度与挑战" : "技术难度适中，亮点不突出",
    },
    {
      key: "socialValue",
      score: Math.min(93, base + (hasValue ? 15 : 3)),
      reason: hasValue ? "面向真实需求，受益场景明确" : "价值阐述不足，需讲清受众",
    },
    {
      key: "completeness",
      score: Math.min(86, base + (hasPlan ? 10 : -8) + (len > 200 ? 6 : 0)),
      reason: len > 200 ? "计划书要素较完整" : "内容偏简略，关键信息待补充",
    },
  ];
  const overall = Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length);
  return {
    overall,
    grade: overall >= 90 ? "S" : overall >= 80 ? "A" : overall >= 65 ? "B" : "C",
    summary: "演示模式评分：项目基础不错，聚焦核心场景后有望冲击竞赛奖项。",
    dimensions: dims,
  };
}

export const DEMO_ADVICE = `## 核心优势

项目方向契合校内科创热点，技术选型具备一定前沿性，若能把计划书描述的真实用户痛点再收紧，故事线会更有说服力。

## 关键风险

- **范围偏大**：计划书涉及的功能点较多，学生团队周期内难以全部交付；
- **验证不足**：目前缺少目标用户的访谈或试用数据，评委容易质疑需求真实性。

## 下一步行动清单

1. **1 周内**：访谈 5-8 位目标同学，把需求收敛为一个最高频场景；
2. **2 周内**：完成可点击的最小原型，招募 10 人内测并记录反馈；
3. **1 个月内**：打磨技术验证 Demo，跑通最核心的一条使用链路；
4. **持续**：按竞赛节奏倒排里程碑，申报书用"数据 + 故事"双线呈现。`;

// ============ AI 技术资源检索 ============

const SEARCH_SYSTEM_PROMPT = `你是科创资源推荐助手，服务对象是准备科创项目的大学生。
平台资源目录会以 JSON 数组给出，每项包含 id、title、category、tags、description。
请根据用户的自然语言需求，从目录中挑选最相关的 2-4 项资源。

必须只输出一个 JSON 对象，不要输出任何额外文字，格式：
{"matches":[{"id":"目录中的资源id","reason":"25字内推荐理由，要点明与用户需求的关联","score":85}]}
score 为 0-100 的匹配度整数，按 score 从高到低排序。若确实没有相关资源，输出 {"matches":[]}。`;

const SEARCH_SUMMARY_PROMPT = `你是科创资源推荐助手。根据用户的需求与已匹配到的资源列表，写一段 150 字以内的推荐解读。
要求：
1. 用 Markdown 输出，先用一句话概括推荐思路，再用有序列表逐项说明每项资源最适合解决什么；
2. 结尾给出一个"建议先从哪一项开始"的行动建议；
3. 语言简练，面向准备科创项目的大学生。`;

interface RawMatch {
  id?: unknown;
  reason?: unknown;
  score?: unknown;
}

// 让 GLM 从资源目录中挑选匹配项；解析失败或无命中时回退本地关键词检索
export async function matchResourcesWithGLM(
  query: string,
  catalog: Resource[],
  signal?: AbortSignal,
): Promise<ResourceMatch[]> {
  const catalogText = JSON.stringify(
    catalog.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      tags: r.tags,
      description: r.description,
    })),
  );

  const res = await callGLM(
    [
      { role: "system", content: SEARCH_SYSTEM_PROMPT },
      { role: "user", content: `资源目录：\n${catalogText}\n\n用户需求：${query}` },
    ],
    signal,
  );
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "{}";
  const jsonStart = content.indexOf("{");
  const jsonEnd = content.lastIndexOf("}");
  const parsed = JSON.parse(
    jsonStart >= 0 && jsonEnd > jsonStart
      ? content.slice(jsonStart, jsonEnd + 1)
      : content,
  ) as { matches?: RawMatch[] };

  const matches = (Array.isArray(parsed.matches) ? parsed.matches : [])
    .map((m): ResourceMatch | null => {
      const resource = typeof m.id === "string" ? getResourceById(m.id) : undefined;
      if (!resource) return null;
      const score = Number(m.score);
      return {
        resource,
        score: Number.isFinite(score)
          ? Math.max(0, Math.min(100, Math.round(score)))
          : 70,
        reason:
          typeof m.reason === "string" && m.reason
            ? m.reason
            : "与你的需求相关",
      };
    })
    .filter((m): m is ResourceMatch => m !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  // 模型无命中时回退本地检索，保证页面始终有结果
  return matches.length > 0 ? matches : searchResources(query);
}

// 流式生成推荐解读
export async function* streamSearchSummary(
  query: string,
  matches: ResourceMatch[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const matchText = matches
    .map(
      (m, i) =>
        `${i + 1}. ${m.resource.title}（${m.resource.category}）：${m.reason}`,
    )
    .join("\n");
  const res = await callGLM(
    [
      { role: "system", content: SEARCH_SUMMARY_PROMPT },
      {
        role: "user",
        content: `用户需求：${query}\n\n匹配到的资源：\n${matchText}`,
      },
    ],
    signal,
  );

  const body = res.body;
  if (!body) throw new Error("GLM 未返回流");

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        const text = json.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        // 跳过不完整分片
      }
    }
  }
}

// 演示模式下根据匹配结果拼出推荐解读文案
export function buildDemoSummary(query: string, matches: ResourceMatch[]): string {
  if (matches.length === 0) {
    return `## 推荐解读\n\n暂时没有检索到与「${query.slice(0, 30)}」高度相关的资源，可以换一种描述方式，例如点明方向（AI / 小程序 / 数据）、场景或目标竞赛。`;
  }
  const top = matches[0];
  const list = matches
    .map(
      (m, i) =>
        `${i + 1}. **${m.resource.title}**（${m.resource.category}）：${m.reason}`,
    )
    .join("\n");
  return `## 推荐解读

针对你的需求，从资源库中匹配到 ${matches.length} 项高相关资源：

${list}

建议先从 **${top.resource.title}** 入手——它与你的需求匹配度最高（${top.score} 分），跑通后再按需扩展到其余资源。`;
}
