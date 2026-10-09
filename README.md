# 科创星火 — AI 科创项目孵化展示平台

用 AI 技术帮助同学评估科创项目、检索技术资源的校内科创孵化平台。

## 核心功能

| 模块 | 说明 |
|------|------|
| 项目展示中心 | 项目卡片墙、详情页、多维筛选与搜索 |
| AI 项目评估引擎 | 五维量化评分（创新性/可行性/技术难度/社会价值/完成度）+ 雷达图 + 流式孵化建议 |
| AI 技术资源检索 | 自然语言对话式检索开源项目、数据集、竞赛、教程，流式推荐解读 |

## 技术栈

- **框架**：Next.js 15 (App Router, Turbopack) + React 19 + TypeScript
- **样式**：Tailwind CSS v4，深色科技感主题
- **AI**：智谱 GLM-4 Flash（OpenAI 兼容端点），SSE 流式输出
- **图表**：Recharts 雷达图
- **部署**：Vercel

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量（可选，留空自动进入演示模式）
cp .env.example .env.local
# 编辑 .env.local，填入 ZHIPU_API_KEY

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看。

## 演示模式

不配置 `ZHIPU_API_KEY` 时，平台自动进入演示模式：

- **AI 评估**：基于文本特征的确定性评分 + 打字机效果的模拟流式建议
- **资源检索**：本地关键词加权检索 + 模板化推荐解读

演示模式下所有交互流程、UI 动效、数据展示完整可用，适合无网/无 Key 场景演示。

## 部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 导入该仓库
3. 在 Project Settings → Environment Variables 中添加：
   - `ZHIPU_API_KEY` = 你的智谱 API Key（可选，不填则为演示模式）
4. 点击 Deploy

## 项目结构

```
app/
  ├── page.tsx              # 首页
  ├── projects/             # 项目展示（列表 + 详情）
  ├── evaluate/             # AI 评估引擎
  ├── resources/            # AI 资源检索
  └── api/
      ├── evaluate/         # 评估 SSE 接口
      └── search/           # 检索 SSE 接口
components/                 # 可复用组件
lib/
  ├── types.ts              # 类型定义
  ├── data.ts               # Mock 数据与本地检索
  └── glm.ts                # GLM API 封装
```

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `ZHIPU_API_KEY` | 否 | 智谱 GLM API Key，留空进入演示模式 |
