import type { Project, Resource, ResourceMatch } from "./types";

// Mock 项目数据 —— 后续接入数据库时仅需替换此文件的实现
export const projects: Project[] = [
  {
    id: "smart-course-companion",
    title: "智课伴侣",
    summary: "基于 RAG 的课程知识问答助手，让复习效率翻倍",
    description:
      "将课件、教材、历年题库向量化后构建课程专属知识库，同学用自然语言提问即可获得带出处引用的精准回答。支持按章节刷题、错题归纳与考前重点预测，上线首月覆盖 12 门核心课程。",
    category: "AI 应用",
    team: "星火小组",
    status: "launched",
    techStack: ["Next.js", "RAG", "向量数据库", "GLM-4"],
    progress: 90,
    stars: 128,
    createdAt: "2026-03-12",
    milestones: [
      { title: "完成课件向量化管线", date: "2026-04", done: true },
      { title: "上线 12 门课程知识库", date: "2026-06", done: true },
      { title: "错题归纳功能发布", date: "2026-08", done: true },
      { title: "覆盖全院 40+ 课程", date: "2026-11", done: false },
    ],
  },
  {
    id: "challenge-cup-copilot",
    title: "挑战杯申报 Copilot",
    summary: "LLM 辅助生成挑战杯申报书初稿与答辩模拟",
    description:
      "输入项目基本信息后，AI 依据历届获奖申报书结构自动生成申报书初稿，并对创新点、可行性章节提出修改建议。内置答辩模拟模式，扮演评委针对项目连续追问，帮助团队提前查漏补缺。",
    category: "AI 应用",
    team: "启航小组",
    status: "incubating",
    techStack: ["Next.js", "Prompt 工程", "结构化输出"],
    progress: 65,
    stars: 86,
    createdAt: "2026-05-20",
    milestones: [
      { title: "拆解 30 份获奖申报书结构", date: "2026-06", done: true },
      { title: "申报书初稿生成器内测", date: "2026-08", done: true },
      { title: "答辩模拟模式上线", date: "2026-10", done: false },
      { title: "对接校团委流程系统", date: "2026-12", done: false },
    ],
  },
  {
    id: "volunteer-scheduling",
    title: "志愿汇排班",
    summary: "志愿者智能排班与工时管理平台",
    description:
      "面向校青协的排班系统：活动发起者设定时段与人数需求，算法结合志愿者课表空闲与历史服务时长自动生成排班方案，冲突一键调解，工时自动同步认证。已在 3 场校级活动中试运行。",
    category: "Web 平台",
    team: "微光小组",
    status: "incubating",
    techStack: ["React", "Node.js", "贪心算法"],
    progress: 70,
    stars: 64,
    createdAt: "2026-04-08",
    milestones: [
      { title: "排班算法原型验证", date: "2026-05", done: true },
      { title: "3 场校级活动试运行", date: "2026-09", done: true },
      { title: "工时认证系统对接", date: "2026-11", done: false },
    ],
  },
  {
    id: "library-seat-predictor",
    title: "座位先知",
    summary: "图书馆座位占用预测，告别白跑一趟",
    description:
      "采集图书馆闸机与预约系统历史数据，用时序模型预测未来 2 小时各区域座位空余概率，准确率 87%。配合楼层热力图展示，高峰期同学可提前规划自习去向。",
    category: "数据科学",
    team: "数说小组",
    status: "launched",
    techStack: ["Python", "时序模型", "ECharts"],
    progress: 85,
    stars: 152,
    createdAt: "2026-02-28",
    milestones: [
      { title: "历史数据清洗与建模", date: "2026-03", done: true },
      { title: "预测准确率达 87%", date: "2026-05", done: true },
      { title: "接入图书馆公众号", date: "2026-07", done: true },
      { title: "扩展至自习室与机房", date: "2026-12", done: false },
    ],
  },
  {
    id: "lab-face-access",
    title: "智卫实验室",
    summary: "树莓派人脸识别实验室门禁与安全登记系统",
    description:
      "基于树莓派与摄像头模组搭建低成本门禁终端，人脸识别通过后自动记录进出时间，未登记人员触发告警。配套 Web 后台可查询实验室使用记录，危化品领用联动登记，已在两间实验室部署。",
    category: "硬件 IoT",
    team: "格物小组",
    status: "incubating",
    techStack: ["树莓派", "人脸识别", "MQTT"],
    progress: 75,
    stars: 97,
    createdAt: "2026-03-30",
    milestones: [
      { title: "门禁终端原型点亮", date: "2026-04", done: true },
      { title: "两间实验室部署", date: "2026-07", done: true },
      { title: "危化品登记联动", date: "2026-10", done: false },
    ],
  },
  {
    id: "campus-market",
    title: "二手集市",
    summary: "校园二手交易小程序，毕业季好物不流浪",
    description:
      "微信小程序承载的校内二手市场：拍照一键发布、按宿舍楼定位自提、信用分体系约束交易行为。毕业季单周成交 300+ 单，让学长学姐的好物在校园内循环起来。",
    category: "小程序",
    team: "拾光小组",
    status: "launched",
    techStack: ["Taro", "微信云开发", "信用分体系"],
    progress: 80,
    stars: 110,
    createdAt: "2026-01-15",
    milestones: [
      { title: "小程序首版发布", date: "2026-02", done: true },
      { title: "毕业季活动成交 300+ 单", date: "2026-06", done: true },
      { title: "信用分体系上线", date: "2026-09", done: true },
    ],
  },
  {
    id: "ai-innovation-evaluator",
    title: "科创项目 AI 评估器",
    summary: "多维智能评估科创项目，孵化前先体检",
    description:
      "将项目计划书输入大模型，从创新性、可行性、技术难度、社会价值等维度量化打分，生成雷达图与改进建议清单，帮助团队在立项前发现盲区。本平台 M2 模块的核心能力。",
    category: "AI 应用",
    team: "平台自研",
    status: "incubating",
    techStack: ["Next.js", "GLM-4", "流式输出"],
    progress: 40,
    stars: 45,
    createdAt: "2026-09-01",
    milestones: [
      { title: "评估维度与评分体系设计", date: "2026-09", done: true },
      { title: "流式评估报告上线", date: "2026-10", done: false },
      { title: "对接项目库自动体检", date: "2026-12", done: false },
    ],
  },
  {
    id: "campus-sound-map",
    title: "校园声音地图",
    summary: "采集校园各角落声音，绘制会呼吸的声景地图",
    description:
      "在校园 20 个点位放置低成本录音装置，采集鸟鸣、钟声、人流的日夜变化，生成可拖动播放的声景地图。希望用声音记录校园的另一个维度，形成独特的校园文化档案。",
    category: "数据科学",
    team: "声浪小组",
    status: "idea",
    techStack: ["树莓派", "音频分析", "地图可视化"],
    progress: 10,
    stars: 38,
    createdAt: "2026-09-15",
    milestones: [
      { title: "招募跨学科成员", date: "2026-10", done: false },
      { title: "首批 5 个点位试点", date: "2026-12", done: false },
    ],
  },
];

// 查询函数：模拟数据库查询接口
export function getAllProjects(): Project[] {
  return projects;
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getFeaturedProjects(count = 3): Project[] {
  return [...projects].sort((a, b) => b.stars - a.stars).slice(0, count);
}

// ============ 技术资源库 ============

// Mock 资源数据 —— 后续接入数据库 / 爬虫时仅需替换此文件的实现
export const resources: Resource[] = [
  {
    id: "langchain-chatchat",
    title: "LangChain-Chatchat",
    description:
      "基于 LangChain 与国产大模型的本地知识库问答开源项目，支持文档上传、向量检索与引用溯源，是搭建 RAG 应用的入门首选模板。",
    category: "开源项目",
    tags: ["RAG", "知识库", "大模型", "LangChain", "问答系统"],
    url: "https://github.com/chatchat-space/Langchain-Chatchat",
    stars: 32000,
    updatedAt: "2026-09-20",
  },
  {
    id: "chatgpt-on-wechat",
    title: "chatgpt-on-wechat",
    description:
      "基于大模型的微信对话机器人开源项目，支持个人微信、公众号与企业微信接入，可快速为社团、项目组搭建 AI 客服与答疑助手。",
    category: "开源项目",
    tags: ["微信", "机器人", "大模型", "对话"],
    url: "https://github.com/zhayujie/chatgpt-on-wechat",
    stars: 30000,
    updatedAt: "2026-08-15",
  },
  {
    id: "taro",
    title: "Taro 多端开发框架",
    description:
      "京东开源的开放式跨端跨框架解决方案，一套 React 代码同时编译到微信 / 支付宝 / 抖音小程序与 H5，校园小程序项目的主力框架。",
    category: "开源项目",
    tags: ["小程序", "跨端", "React", "前端"],
    url: "https://taro.zone/",
    stars: 35000,
    updatedAt: "2026-09-28",
  },
  {
    id: "ultralytics",
    title: "Ultralytics YOLO",
    description:
      "最流行的目标检测开源框架 YOLOv8/YOLO11，提供预训练模型与极简训练接口，行人检测、垃圾分类、工业质检等视觉项目开箱即用。",
    category: "开源项目",
    tags: ["计算机视觉", "目标检测", "YOLO", "深度学习"],
    url: "https://github.com/ultralytics/ultralytics",
    stars: 33000,
    updatedAt: "2026-10-01",
  },
  {
    id: "tianchi-datasets",
    title: "阿里天池数据集",
    description:
      "阿里云天池开放平台提供的工业界真实数据集，覆盖电商、金融、交通、医疗等领域，配套历年竞赛赛题与开源 Baseline 代码。",
    category: "数据集",
    tags: ["数据科学", "机器学习", "竞赛数据", "真实场景"],
    url: "https://tianchi.aliyun.com/dataset",
    stars: 8600,
    updatedAt: "2026-09-10",
  },
  {
    id: "kaggle-datasets",
    title: "Kaggle 数据集",
    description:
      "全球最大的数据科学社区数据集市场，超过 30 万个公开数据集，附带海量 Kernel 分析笔记，是数据类科创项目的素材宝库。",
    category: "数据集",
    tags: ["数据科学", "机器学习", "数据分析", "Python"],
    url: "https://www.kaggle.com/datasets",
    stars: 12000,
    updatedAt: "2026-09-25",
  },
  {
    id: "clue-benchmark",
    title: "CLUE 中文语言理解基准",
    description:
      "中文 NLP 领域权威评测基准与数据集集合，涵盖文本分类、阅读理解、情感分析等任务，中文 NLP 课程设计与竞赛常用数据源。",
    category: "数据集",
    tags: ["NLP", "中文", "大模型", "评测"],
    url: "https://www.cluebenchmarks.com/",
    stars: 5400,
    updatedAt: "2026-07-30",
  },
  {
    id: "challenge-cup",
    title: "挑战杯 全国大学生课外学术科技作品竞赛",
    description:
      "被誉为中国大学生科技创新的奥林匹克，两年一届，分自然科学论文、哲学社会科学调查、科技发明制作三类，校赛通常在每年 3-4 月启动。",
    category: "竞赛",
    tags: ["综合类", "科研", "含金量高", "校内选拔"],
    url: "https://www.tiaozhanbei.net/",
    stars: 9800,
    updatedAt: "2026-09-05",
  },
  {
    id: "internet-plus",
    title: "中国国际大学生创新大赛（原互联网+）",
    description:
      "国内覆盖面最大的大学生创新创业赛事，设高教主赛道、红旅赛道与产业命题赛道，适合已有原型或落地数据的团队冲击奖项。",
    category: "竞赛",
    tags: ["创业", "综合类", "含金量高", "路演"],
    url: "https://cy.ncss.cn/",
    stars: 9500,
    updatedAt: "2026-09-12",
  },
  {
    id: "mathorcup-modeling",
    title: "全国大学生数学建模竞赛",
    description:
      "每年 9 月举办的经典赛事（高教社杯），三人组队三天完成建模、求解与论文写作，是锻炼数据分析与论文写作能力的入门竞赛。",
    category: "竞赛",
    tags: ["数学建模", "数据科学", "论文", "组队"],
    url: "http://www.mcm.edu.cn/",
    stars: 8900,
    updatedAt: "2026-08-20",
  },
  {
    id: "kaggle-competitions",
    title: "Kaggle 竞赛",
    description:
      "全球数据科学竞赛平台，从入门级的 Titanic 到奖金丰厚的 Featured 赛，配有公开数据集与大神方案复盘，刷赛经历是简历硬通货。",
    category: "竞赛",
    tags: ["数据科学", "机器学习", "国际赛事"],
    url: "https://www.kaggle.com/competitions",
    stars: 7800,
    updatedAt: "2026-10-02",
  },
  {
    id: "d2l-zh",
    title: "《动手学深度学习》",
    description:
      "李沐教授主讲的免费深度学习课程，理论配 PyTorch 可运行代码，B 站有完整中文视频，零基础入门 AI 的最优路径之一。",
    category: "教程",
    tags: ["深度学习", "PyTorch", "入门", "免费课程"],
    url: "https://zh.d2l.ai/",
    stars: 21000,
    updatedAt: "2026-09-18",
  },
  {
    id: "cs50",
    title: "CS50 计算机科学导论",
    description:
      "哈佛大学王牌计算机入门课程，覆盖 C、Python、SQL、Web 开发与算法思维，中英字幕齐全，适合非科班同学补齐计算机基础。",
    category: "教程",
    tags: ["计算机基础", "入门", "Web", "免费课程"],
    url: "https://cs50.harvard.edu/x/",
    stars: 18000,
    updatedAt: "2026-09-01",
  },
  {
    id: "zhipu-open",
    title: "智谱 AI 开放平台",
    description:
      "国产大模型 GLM 系列开放平台，glm-4-flash 模型提供免费调用额度，OpenAI 兼容接口，学生项目接入大模型能力的最短路径。",
    category: "工具平台",
    tags: ["大模型", "API", "免费额度", "GLM"],
    url: "https://open.bigmodel.cn/",
    stars: 7200,
    updatedAt: "2026-10-05",
  },
  {
    id: "coze",
    title: "扣子 Coze AI Bot 平台",
    description:
      "字节跳动推出的零代码 AI Bot 搭建平台，拖拉拽即可组装知识库问答、工作流与插件，不懂代码也能快速验证 AI 应用创意。",
    category: "工具平台",
    tags: ["零代码", "大模型", "原型验证", "Bot"],
    url: "https://www.coze.cn/",
    stars: 6800,
    updatedAt: "2026-09-22",
  },
];

// 领域关键词词表：演示模式下用它从自然语言问题中提取检索词
const SEARCH_VOCAB = [
  "大模型", "LLM", "RAG", "知识库", "问答", "机器人", "微信", "小程序",
  "跨端", "前端", "React", "Web", "计算机视觉", "目标检测", "YOLO",
  "深度学习", "机器学习", "NLP", "中文", "数据科学", "数据分析", "数据集",
  "Python", "建模", "数学建模", "论文", "竞赛", "挑战杯", "互联网+",
  "创新创业", "路演", "组队", "入门", "课程", "教程", "免费", "零基础",
  "API", "零代码", "原型", "开源", "AI", "Bot", "PyTorch",
];

function extractTerms(query: string): string[] {
  const lower = query.toLowerCase();
  const terms = new Set<string>();
  for (const word of SEARCH_VOCAB) {
    if (lower.includes(word.toLowerCase())) terms.add(word.toLowerCase());
  }
  // 补充英文/数字词与 2-4 字中文片段，覆盖词表外的表达
  for (const m of lower.matchAll(/[a-z0-9+#.]{2,}/g)) terms.add(m[0]);
  return [...terms];
}

// 关键词匹配检索：真实模型不可用时（演示模式）的本地检索实现
export function searchResources(query: string, limit = 4): ResourceMatch[] {
  const terms = extractTerms(query);
  const lower = query.toLowerCase();

  const matches = resources
    .map((resource) => {
      const tagsText = resource.tags.join(" ").toLowerCase();
      const titleText = resource.title.toLowerCase();
      const descText = resource.description.toLowerCase();
      const categoryText = resource.category.toLowerCase();

      let raw = 0;
      const hitTags: string[] = [];
      for (const term of terms) {
        if (tagsText.includes(term)) {
          raw += 12;
          const tag = resource.tags.find((t) => t.toLowerCase().includes(term));
          if (tag && !hitTags.includes(tag)) hitTags.push(tag);
        } else if (titleText.includes(term)) {
          raw += 8;
        } else if (descText.includes(term)) {
          raw += 4;
        } else if (categoryText.includes(term)) {
          raw += 6;
        }
      }
      // 问题中直接点名分类时给予加成，例如「有哪些竞赛」
      if (categoryText.length > 0 && lower.includes(resource.category)) raw += 10;

      return { resource, raw, hitTags };
    })
    .filter((m) => m.raw > 0)
    .sort((a, b) => b.raw - a.raw || b.resource.stars - a.resource.stars)
    .slice(0, limit);

  const max = matches[0]?.raw ?? 1;
  return matches.map(({ resource, raw, hitTags }) => ({
    resource,
    score: Math.min(96, 60 + Math.round((raw / max) * 36)),
    reason:
      hitTags.length > 0
        ? `标签「${hitTags.slice(0, 2).join("、")}」与你的需求直接相关`
        : "内容主题与你的问题高度重合",
  }));
}

export function getResourceById(id: string): Resource | undefined {
  return resources.find((r) => r.id === id);
}
