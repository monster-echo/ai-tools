# ai stools — AI 工具超集

ai stools 是一个会不断添新 AI 能力的集合项目。我们希望把所有好用的功能放到一起，大家可以方便地阅读、尝试、整合，形成一个长期可迭代的平台。

## 核心流程

1. 选择一个 AI 能力，在 `features/` 下创建自己的文件夹。
2. 在功能文件夹里写清流程、场景、输入输出以及调用方式；也别忘了附上一份原型图或交互草图。
3. 用 HTML 原型或 shadcn/ui 快速搭页面，把体验呈现在最小可交付的形式上。

每个能力都应该能独立描述，这样我们才能快速上新、快速复用，也方便和外部夥伴、用户对齐。

## 目录约定

所有能力都放在 `features/` 目录下，每个子目录包含：

- `readme.md`：功能说明，场景，输入输出，积分或计费策略（如果有）。
- `prototype.*`：原型图（PNG/SVG/HTML 均可），让交互可视化。
- `notes.md`（可选）：记录接口、权责、技术选型等补充说明。

示例结构：

```text
features/
  └─ smart-summary/
      ├─ readme.md
      ├─ prototype-template.html
      └─ notes.md
```

每个子目录也可以加上截图、录屏、Figma 链接等，确保这个功能模块自成体系。

## 技术概览

- **Next.js + App Router**：作为前端骨架，管理 Landing Page、体验页与控制台。
- **shadcn/ui + Radix + Tailwind**：提供统一的 UI 组件，让 prototype 快速可用。
- **Clerk**：做登录与用户身份，未来可接积分与会员系统。
- **Zustand**：管理前端状态，尤其是积分、调用记录、功能配置等。
- **Prisma + PostgreSQL**：存储会员、功能配置与使用记录，保障数据一致性。

## 参与方式

- fork 项目，基于现有结构创建新的 feature 文件夹。
- 每位能力 owner 负责自己 README 与原型文档的维护。
- 需要讨论接口或后台流程时，在 `notes.md` 里同步，方便后续整合。

通过这样的方式，ai stools 不仅是一套工具集合，更是一个可以被多人同时打理的创作空间。
