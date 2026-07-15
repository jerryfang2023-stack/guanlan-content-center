window.CONTENT_FACTORY_IMAGE_MANIFEST = Object.freeze({
  schemaVersion: 1,
  provider: "codex-imagegen",
  generatedAt: "2026-07-12T00:00:00.000Z",
  tasks: {
    "codex-topic-001-cover-v1": {
      id: "codex-topic-001-cover-v1",
      topicId: "topic-001",
      role: "cover",
      slotId: "cover",
      provider: "codex-imagegen",
      briefSnapshot: "封面：观澜蓝业务入口地图，搜索、官网、内容、客服、私信五个入口汇入一张收入漏斗表。",
      titleSnapshot: "老板真正该焦虑的，不是模型，而是客户入口正在被 AI 改写",
      promptSnapshot: "观澜蓝业务入口地图：五个客户入口汇入可衡量的收入漏斗；左侧留标题安全区；无文字、Logo、机器人和赛博光效。",
      status: "ready",
      attempt: 1,
      assetIds: ["asset-topic-001-cover-v1"],
      createdAt: "2026-07-12T00:00:00.000Z",
      updatedAt: "2026-07-12T00:00:00.000Z"
    },
    "codex-topic-001-inline-v1": {
      id: "codex-topic-001-inline-v1",
      topicId: "topic-001",
      role: "inline",
      slotId: "inline-1",
      provider: "codex-imagegen",
      briefSnapshot: "正文配图：把客户入口的关键流程、责任人与验收点拆成一张克制的业务图卡，只服务阅读理解。",
      titleSnapshot: "老板真正该焦虑的，不是模型，而是客户入口正在被 AI 改写",
      promptSnapshot: "五个客户入口进入曝光、访问、咨询、记录、跟进、成交的业务审计流程；无文字、Logo、机器人和赛博光效。",
      status: "ready",
      attempt: 1,
      assetIds: ["asset-topic-001-inline-v1"],
      createdAt: "2026-07-12T00:00:00.000Z",
      updatedAt: "2026-07-12T00:00:00.000Z"
    }
  },
  assets: {
    "asset-topic-001-cover-v1": {
      id: "asset-topic-001-cover-v1",
      taskId: "codex-topic-001-cover-v1",
      topicId: "topic-001",
      role: "cover",
      src: "assets/generated/topic-001/cover-ai-entry-map-v1.png",
      mime: "image/png",
      width: 1923,
      height: 818,
      alt: "五个客户入口汇入收入漏斗的观澜蓝商业插画",
      storage: "project",
      createdAt: "2026-07-12T00:00:00.000Z"
    },
    "asset-topic-001-inline-v1": {
      id: "asset-topic-001-inline-v1",
      taskId: "codex-topic-001-inline-v1",
      topicId: "topic-001",
      role: "inline",
      src: "assets/generated/topic-001/inline-ai-entry-audit-v1.png",
      mime: "image/png",
      width: 1536,
      height: 1024,
      alt: "客户入口进入六步业务审计流程的观澜蓝配图",
      storage: "project",
      createdAt: "2026-07-12T00:00:00.000Z"
    }
  },
  defaultsByTopic: {
    "topic-001": {
      cover: { taskId: "codex-topic-001-cover-v1", assetId: "asset-topic-001-cover-v1" },
      inline: [{ slotId: "inline-1", taskId: "codex-topic-001-inline-v1", assetId: "asset-topic-001-inline-v1" }]
    }
  }
});
