// 项目状态：构想中 → 孵化中 → 已上线
export type ProjectStatus = "idea" | "incubating" | "launched";

// 项目里程碑
export interface Milestone {
  title: string;
  date: string;
  done: boolean;
}

// 科创项目
export interface Project {
  id: string;
  title: string;
  summary: string; // 一句话简介（卡片用）
  description: string; // 详细介绍（详情页用）
  category: ProjectCategory;
  team: string;
  status: ProjectStatus;
  techStack: string[];
  progress: number; // 0-100
  stars: number;
  createdAt: string; // ISO 日期
  milestones: Milestone[];
}

export type ProjectCategory =
  | "AI 应用"
  | "Web 平台"
  | "小程序"
  | "硬件 IoT"
  | "数据科学";

// 分类元信息（图标、渐变色）
export const CATEGORY_META: Record<
  ProjectCategory,
  { icon: string; gradient: string }
> = {
  "AI 应用": { icon: "🤖", gradient: "from-emerald-500/30 to-teal-500/10" },
  "Web 平台": { icon: "🌐", gradient: "from-cyan-500/30 to-blue-500/10" },
  小程序: { icon: "📱", gradient: "from-violet-500/30 to-fuchsia-500/10" },
  "硬件 IoT": { icon: "🔧", gradient: "from-amber-500/30 to-orange-500/10" },
  数据科学: { icon: "📊", gradient: "from-sky-500/30 to-indigo-500/10" },
};

// 状态元信息
export const STATUS_META: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  idea: {
    label: "构想中",
    className: "bg-amber-400/10 text-amber-300 ring-amber-400/30",
  },
  incubating: {
    label: "孵化中",
    className: "bg-cyan-400/10 text-cyan-300 ring-cyan-400/30",
  },
  launched: {
    label: "已上线",
    className: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30",
  },
};

// ============ AI 项目评估 ============

// 评估维度
export type DimensionKey =
  | "innovation"
  | "feasibility"
  | "techDifficulty"
  | "socialValue"
  | "completeness";

export const DIMENSION_META: Record<DimensionKey, { label: string; hint: string }> = {
  innovation: { label: "创新性", hint: "选题与方案的新颖程度" },
  feasibility: { label: "可行性", hint: "资源、周期与落地把握" },
  techDifficulty: { label: "技术难度", hint: "技术栈深度与挑战性" },
  socialValue: { label: "社会价值", hint: "解决的问题与受益面" },
  completeness: { label: "完成度", hint: "计划完整性与规划清晰度" },
};

// 单个维度评分
export interface DimensionScore {
  key: DimensionKey;
  score: number; // 0-100
  reason: string;
}

// 结构化评估结果
export interface EvaluationResult {
  overall: number; // 总分 0-100
  grade: string; // 等级：S/A/B/C
  summary: string; // 总体评语
  dimensions: DimensionScore[];
}

// 评估来源（真实模型 / 演示降级）
export type EvaluationSource = "glm" | "demo";

// ============ AI 技术资源检索 ============

// 资源分类
export type ResourceCategory = "开源项目" | "数据集" | "竞赛" | "教程" | "工具平台";

export const RESOURCE_CATEGORY_META: Record<
  ResourceCategory,
  { icon: string; className: string }
> = {
  开源项目: {
    icon: "📦",
    className: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30",
  },
  数据集: {
    icon: "🗂️",
    className: "bg-sky-400/10 text-sky-300 ring-sky-400/30",
  },
  竞赛: {
    icon: "🏆",
    className: "bg-amber-400/10 text-amber-300 ring-amber-400/30",
  },
  教程: {
    icon: "📚",
    className: "bg-violet-400/10 text-violet-300 ring-violet-400/30",
  },
  工具平台: {
    icon: "🛠️",
    className: "bg-cyan-400/10 text-cyan-300 ring-cyan-400/30",
  },
};

// 技术资源
export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  tags: string[];
  url: string;
  stars: number; // 关注度（社区 Star / 热度）
  updatedAt: string; // ISO 日期
}

// 一条匹配结果：资源 + 匹配度 + 推荐理由
export interface ResourceMatch {
  resource: Resource;
  score: number; // 匹配度 0-100
  reason: string;
}

// 检索来源（真实模型 / 演示降级）
export type SearchSource = "glm" | "demo";
