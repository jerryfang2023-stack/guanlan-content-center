const pageTitles = {
  topics: "今日选题",
  library: "选题库",
  styles: "写作风格",
  editor: "公众号写作",
  layout: "公众号排版",
  pending: "待发布",
  review: "发布复盘",
};

const pageKickers = {
  topics: "TODAY TOPICS",
  library: "TOPIC LIBRARY",
  styles: "WRITING STYLE LAB",
  editor: "WECHAT WRITING",
  layout: "GZH DESIGN",
  pending: "READY TO PUBLISH",
  review: "PUBLISH REVIEW",
};

const statusLabels = {
  candidate: "待判断",
  queued: "写作中",
  library: "已入库",
  skipped: "不采用",
};

function normalizeDate(value) {
  const match = String(value || "").trim().match(/^(\d{4})[.-](\d{2})[.-](\d{2})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : String(value || "");
}

function formatDate(value) {
  return normalizeDate(value).replaceAll("-", ".");
}

const TOPIC_TIME_ZONE = "America/Los_Angeles";

function topicLocalDate(now = new Date()) {
  const values = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: TOPIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isCurrentOrPastTopicDate(date, today = topicLocalDate()) {
  const normalizedDate = normalizeDate(date);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate) && normalizedDate <= normalizeDate(today);
}

const dataBatchDate = "2026-07-13";
const calendarAsOf = "2026-07-13";
let selectedDate = dataBatchDate;
let selectedTopicId = "topic-001";
let selectedLibraryTopicId = "";
let queuedTopicId = "topic-001";
let selectedLibraryDate = "all";
let selectedLibraryStatus = "all";

const topics = [
  {
    id: "topic-001",
    score: 96,
    title: "Cloudflare 推出全新AI流量管理选项：区分搜索、智能体与训练爬虫，保护广告页面",
    source: "商业信号 + 社群情报",
    category: "客户入口",
    valueTag: "收入漏损",
    platform: "公众号主稿",
    style: "观澜判断感",
    length: "中篇 / 1800-2400 字",
    status: "queued",
    worth: "Cloudflare 在 2026-07-02 的商业信号里同时出现 AI 流量管理和 Monetization Gateway，说明网站、内容和搜索入口正在从“人访问”变成“人和智能体一起访问”。这正中老板的焦虑：客户还在不在原来的入口里。",
    opinion: "企业 AI 化的第一张表不是工具清单，而是客户入口表；入口漏掉，AI 就和收入无关。",
    writingAngles: {
      business: "从老板最敏感的收入入口切入：搜索、官网、内容、客服、私信，哪里已经被 AI 流量改变。",
      process: "把入口拆成曝光、访问、咨询、记录、跟进、成交，找 AI 能补上的断点。",
      organization: "讨论谁负责新入口：市场、销售、客服、运营还是一个新的 AI 增长岗。",
      asset: "把入口数据、问答、客户问题和跟进 SOP 沉淀为企业自己的获客资产。",
    },
    outline: "一、开头：老板以为 AI 是内部提效，其实客户入口先变了\n二、中段：用 Cloudflare AI 流量管理和变现网关说明入口变化\n三、转向：社群里内容电商和 AI 获客案例说明入口变化已经影响生意\n四、判断：先盘点入口漏损，再决定买什么 AI\n五、结尾：给老板一张“AI 入口体检表”",
    articleTitleDraft: "老板真正该焦虑的，不是模型，而是客户入口正在被 AI 改写",
    imagePrompt: "封面：观澜蓝业务入口地图，搜索、官网、内容、客服、私信五个入口汇入一张收入漏斗表。",
    layout: "公众号主稿：判断句开头；正文 5 节；每节一个入口断点；结尾放 5 项入口检查清单。",
  },
  {
    id: "topic-002",
    score: 94,
    title: "Smartsheet 使用 Claude Platform API 改造企业工作流",
    source: "商业信号 + 社群情报",
    category: "岗位 Agent",
    valueTag: "落地路径",
    platform: "公众号主稿",
    style: "观澜判断感",
    length: "中篇 / 1800-2400 字",
    status: "candidate",
    worth: "AWS GenAIIC Partner Agent Factory、Smartsheet 使用 Claude Platform API 改造工作流，以及社群里“培养 agent builder 团队”的讨论，共同指向一个老板能听懂的判断：AI 不应先变成大项目，而应先进入一个岗位动作。",
    opinion: "老板最怕 AI 项目太大、太贵、太慢；先让一个岗位动作可交付、可验收，才是企业 AI 化的第一步。",
    writingAngles: {
      business: "从老板的试错成本切入：先证明一个岗位能省时、增收或降错，再谈全面 AI 化。",
      process: "拆一个岗位动作的输入、步骤、输出、验收标准，而不是讲平台功能。",
      organization: "把 agent builder 小队定义成老板身边的新执行力，不是技术部门的孤立实验。",
      asset: "跑通的岗位动作会沉淀成 SOP、知识库和模板，能复制到更多岗位。",
    },
    outline: "一、开头：老板买 AI 最容易变成大平台焦虑\n二、中段：用 AWS Agent Factory 和 Smartsheet 说明企业在把 AI 放进具体工作流\n三、社群侧：老板需要亲自培养 agent builder 小队\n四、方法：选择一个岗位动作，定义验收标准\n五、结尾：给 5 个适合先做的岗位动作",
    articleTitleDraft: "企业 AI 化第一步，不是平台，是一个能验收的小岗位动作",
    imagePrompt: "封面：一个岗位工作台从“人工处理”切换为“Agent 协助”，旁边有验收标准清单。",
    layout: "公众号主稿：问题式开头；中段拆 3 个真实信号；结尾给岗位动作选择表。",
  },
  {
    id: "topic-003",
    score: 92,
    title: "Glean 年经常性收入超过 3 亿美元，企业上下文推动 AI 采用",
    source: "商业信号",
    category: "组织知识",
    valueTag: "资产沉淀",
    platform: "公众号主稿",
    style: "观澜判断感",
    length: "中篇 / 1800-2400 字",
    status: "candidate",
    worth: "Glean 年经常性收入超过 3 亿美元、Zillow 向 7000 名员工部署 Glean 并节省时间、Engram 携 9800 万美元启动，三条商业信号都在说同一件事：企业 AI 的核心不是单点工具，而是组织上下文。",
    opinion: "企业真正缺的不是更多 AI 工具，而是能让 AI 调用的组织知识、流程记忆和决策上下文。",
    writingAngles: {
      business: "从老板的管理焦虑切入：公司越大，信息越散，AI 如果没有上下文就只能做玩具。",
      process: "拆企业知识如何从文档、会议、CRM、工单、项目记录进入一个可调用系统。",
      organization: "讨论 AI 化不是个人变强，而是组织协作和知识流动方式变化。",
      asset: "把知识库、权限、角色、流程、历史判断沉淀成企业自己的上下文资产。",
    },
    outline: "一、开头：老板问 AI 能不能省时间，真正答案是能不能懂公司\n二、中段：Glean 与 Zillow 说明企业上下文的采用价值\n三、延展：Engram 说明资本也在押注“懂组织”的 AI\n四、判断：没有上下文，AI 只是通用工具；有上下文，才是组织资产\n五、结尾：老板今天该盘点哪些上下文",
    articleTitleDraft: "企业 AI 真正该建设的，不是工具清单，是组织上下文",
    imagePrompt: "封面：企业知识、会议、CRM、项目记录汇入一个观澜蓝色上下文引擎。",
    layout: "公众号主稿：用三条商业信号串联；每节一句老板判断；结尾给组织上下文字段清单。",
  },
  {
    id: "topic-004",
    score: 89,
    title: "Houston Methodist 全企业部署 Midstream Health 智能体财务行动平台",
    source: "商业信号",
    category: "风控财务",
    valueTag: "结果可验收",
    platform: "公众号主稿",
    style: "商业内参",
    length: "中篇 / 1800-2400 字",
    status: "library",
    worth: "Houston Methodist 全企业部署 Midstream Health 智能体财务行动平台，以及 Inscribe 使用 Amazon Bedrock 在数秒内拦截文档欺诈，都是老板更容易理解的 AI 价值：不是演示能力，而是减少损失。",
    opinion: "企业 AI 最容易被老板买单的场景，往往不是创意生成，而是财务、合规、欺诈、异常和流程责任。",
    writingAngles: {
      business: "从老板最怕的损失切入：坏账、欺诈、错付、漏审、合规处罚。",
      process: "把 AI 放在审核、识别、拦截、提示、复核这些责任明确的流程节点。",
      organization: "强调 AI 不是替责任人背锅，而是让责任人更早看到异常。",
      asset: "每一次拦截、复核和纠错都会沉淀成风险规则与流程资产。",
    },
    outline: "一、开头：老板不缺 AI 演示，缺能减少损失的结果\n二、中段：Houston Methodist 与 Inscribe 的信号说明 AI 正进入财务和风控动作\n三、判断：可验收的异常拦截，比万能助手更容易落地\n四、方法：列出财务与风控的 5 个适合 AI 试点动作\n五、结尾：AI 化先从损失最大的流程开始",
    articleTitleDraft: "老板要的不是炫酷 Agent，是能拦住损失的流程结果",
    imagePrompt: "封面：财务流程看板中，AI 标记异常单据和欺诈风险，整体克制、专业。",
    layout: "商业内参：案例开头；中段拆业务动作；结尾给财务风控试点清单。",
  },
  {
    id: "topic-005",
    score: 87,
    title: "AppliedAI 与麦肯锡合作，用 AI 改造受监管企业流程",
    source: "商业信号 + 社群情报",
    category: "AI 服务",
    valueTag: "商业化",
    platform: "站内短评",
    style: "商业内参",
    length: "短篇 / 800-1200 字",
    status: "candidate",
    worth: "AppliedAI 与麦肯锡合作改造受监管企业流程，社群里也出现 AI 定制、企业培训、工具产品化等高分案例。它适合写给既焦虑又想行动的老板：AI 服务不是卖课，也不是卖工具，而是卖一套可复用动作。",
    opinion: "老板不会为“懂 AI”长期付费，但会为诊断流程、配置工具、交付结果、复用模板付费。",
    writingAngles: {
      business: "从老板愿意为什么付钱切入：不是技术名词，而是一个业务动作被稳定交付。",
      process: "拆 AI 服务产品化的四步：诊断、配置、交付、复盘。",
      organization: "解释服务商如何成为老板 AI 化路上的外部执行伙伴，而不是工具销售。",
      asset: "每次交付都应沉淀模板、提示词、知识库、SOP 和案例资产。",
    },
    outline: "一、开头：企业 AI 服务最怕只会卖概念\n二、中段：AppliedAI + McKinsey 说明大企业买的是流程改造\n三、社群侧：AI 定制和培训案例说明小老板也为结果付费\n四、判断：AI 服务要产品化，而不是人力外包化\n五、结尾：一套可卖的 AI 化交付包长什么样",
    articleTitleDraft: "企业 AI 服务真正能卖的，不是工具，是一套可复用动作",
    imagePrompt: "封面：咨询诊断表、工具配置台、交付清单、复盘数据四个模块组成 AI 服务产品化流程。",
    layout: "站内短评：三段式判断；每段一个商业动作；结尾给服务包结构。",
  },
  {
    id: "topic-006",
    score: 84,
    title: "GPT-5.6来了，但是……",
    source: "一线观点 + 商业信号",
    category: "AI 成本",
    valueTag: "经营账",
    platform: "选题库",
    style: "观澜判断感",
    length: "中篇 / 1800-2400 字",
    status: "library",
    worth: "一线观点里出现 GPT-5.6 和“疯狂的推理”讨论，商业信号里又有 Together 融资、Meta 转售闲置 AI 算力等信息。这适合沉淀为后续文章：当 AI 真进入业务，推理成本会从技术问题变成经营问题。",
    opinion: "老板不能只问 AI 能不能做，还要问每一次调用、每一次自动化、每一个 Agent 的毛利是否成立。",
    writingAngles: {
      business: "从成本焦虑切入：AI 不是免费员工，推理成本会进入毛利结构。",
      process: "拆一次 AI 服务交付里的模型调用、人工复核、数据准备和失败重试成本。",
      organization: "讨论财务、产品、技术如何共同定义 AI 项目的成本口径。",
      asset: "沉淀一张 AI 毛利表，把调用成本和业务收益绑定起来。",
    },
    outline: "一、开头：老板以为 AI 是降本，结果账没算清\n二、中段：一线观点里的推理成本焦虑\n三、商业侧：Together、Meta 算力信号说明基础设施正在商业化\n四、方法：用毛利表看一个 Agent 是否值得跑\n五、结尾：AI 化要从成本黑箱走向经营台账",
    articleTitleDraft: "AI 不是免费员工，老板要开始看推理成本和毛利表",
    imagePrompt: "封面：AI 调用成本、人工复核、收入贡献三列组成一张经营毛利表。",
    layout: "公众号主稿：经营账视角；中段放表格；结尾给 AI 毛利核算字段。",
  },
  {
    id: "topic-007",
    score: 83,
    title: "Together 获得 $800M C 轮 融资",
    source: "商业信号",
    category: "AI 基础设施",
    valueTag: "成本供给",
    platform: "选题库",
    style: "观澜判断感",
    length: "中篇 / 1800-2400 字",
    status: "candidate",
    worth: "Together 的大额融资和 Meta 转售闲置 AI 算力可以放在一起看：老板未来买到的 AI 能力，不只是软件订阅，也会受到推理供给、算力价格和模型服务稳定性的影响。",
    opinion: "企业 AI 化会从“买工具”进入“买稳定算力和推理能力”的阶段，成本和可用性都会变成经营变量。",
    writingAngles: {
      business: "从老板的成本确定性切入：AI 预算不只是软件费，还包括推理、并发和稳定性。",
      process: "拆一个 AI 应用从请求、推理、排队、失败重试到人工兜底的成本链路。",
      organization: "讨论技术、财务和业务如何共同决定 AI 项目是否值得规模化。",
      asset: "沉淀 AI 成本口径和供应商评估表，避免只看功能演示。",
    },
    outline: "一、开头：AI 越进入业务，越不能只看工具订阅价\n二、中段：Together 融资和算力供给说明基础设施竞争加速\n三、转向：老板要看的不是模型名，而是稳定成本\n四、方法：用成本口径评估一个 AI 应用\n五、结尾：AI 化预算要从工具费走向经营账",
    articleTitleDraft: "老板以后买 AI，买的不只是工具，还有稳定推理能力",
    imagePrompt: "封面：算力、模型调用、业务请求和成本台账四个模块连接成 AI 基础设施经营图。",
    layout: "选题库长文：基础设施信号开头；中段拆成本链；结尾给成本评估表。",
  },
  {
    id: "topic-008",
    score: 82,
    title: "Zillow 向 7000 名员工部署 Glean，每人每周节省 1.5 小时以上",
    source: "商业信号",
    category: "组织知识",
    valueTag: "规模采用",
    platform: "公众号主稿",
    style: "案例拆解",
    length: "中篇 / 1800-2400 字",
    status: "candidate",
    worth: "Zillow 的员工规模和节省时间数字适合写给老板看：AI 的价值不在一个人多快，而在一个组织的重复检索、问答和协作成本能不能被系统性降低。",
    opinion: "企业 AI 不是让一个员工炫技，而是让 7000 个人每周少浪费一点组织时间。",
    writingAngles: {
      business: "从组织时间成本切入，把每人每周 1.5 小时换算成老板能理解的经营账。",
      process: "拆知识检索、内部问答、跨部门协作、资料复用这些高频流程。",
      organization: "讨论 AI 采用为什么需要统一上下文，而不是员工各自买工具。",
      asset: "把组织知识整理成可检索、可调用、可治理的上下文资产。",
    },
    outline: "一、开头：7000 人每周省 1.5 小时意味着什么\n二、中段：Zillow 部署 Glean 的组织价值\n三、判断：企业 AI 的 ROI 来自规模化小节省\n四、方法：老板如何找公司里的知识浪费点\n五、结尾：先做一张组织时间损耗表",
    articleTitleDraft: "企业 AI 的 ROI，可能藏在每个人每周少浪费的 1.5 小时里",
    imagePrompt: "封面：7000 名员工的知识检索时间汇总成一张组织时间节省仪表盘。",
    layout: "案例拆解：用数字开头；中段算账；结尾给组织时间损耗表。",
  },
  {
    id: "topic-009",
    score: 80,
    title: "Inscribe 使用 Amazon Bedrock 在数秒内拦截文档欺诈",
    source: "商业信号",
    category: "风控财务",
    valueTag: "异常拦截",
    platform: "选题库",
    style: "商业内参",
    length: "短篇 / 800-1200 字",
    status: "library",
    worth: "这条适合沉淀为风控类案例。老板对 AI 的信任，往往来自它能不能在关键节点拦住错单、假资料、欺诈和流程风险。",
    opinion: "AI 最容易被企业接受的入口之一，是让原本靠人工经验判断的风险变得更早、更快、更可追踪。",
    writingAngles: {
      business: "从损失减少切入，而不是从模型能力切入。",
      process: "拆文档上传、识别、风险提示、人工复核、留痕归档五个动作。",
      organization: "说明 AI 是提前预警，不是替风险责任人负责。",
      asset: "把拦截记录沉淀成风险规则和复核样本。",
    },
    outline: "一、开头：老板为什么更相信能拦损失的 AI\n二、中段：Inscribe 的文档欺诈场景\n三、判断：风控类 AI 的价值在可追踪拦截\n四、结尾：哪些文件和流程适合先做 AI 复核",
    articleTitleDraft: "企业 AI 最容易落地的地方，可能是先帮老板拦住损失",
    imagePrompt: "封面：AI 在文档审核流程中标记欺诈风险，旁边显示复核和留痕节点。",
    layout: "短评：场景案例 + 判断 + 试点清单。",
  },
  {
    id: "topic-010",
    score: 78,
    title: "Engram 携 9800 万美元启动，打造真正了解组织的 AI",
    source: "商业信号",
    category: "组织知识",
    valueTag: "长期趋势",
    platform: "选题库",
    style: "观澜判断感",
    length: "中篇 / 1800-2400 字",
    status: "library",
    worth: "Engram 的原始标题本身很适合做长期选题：真正了解组织的 AI，是老板理解企业 AI 化的一条主线。",
    opinion: "下一阶段企业 AI 的竞争点，不是通用回答更聪明，而是谁更懂组织内部的历史、角色、流程和约束。",
    writingAngles: {
      business: "从老板的组织记忆焦虑切入：为什么公司越复杂，AI 越需要懂上下文。",
      process: "拆组织知识从散落文档到可调用上下文的建设路径。",
      organization: "讨论权限、角色、流程和责任如何进入 AI 系统。",
      asset: "把组织知识变成长期资产，而不是员工离职就消失的经验。",
    },
    outline: "一、开头：真正了解组织的 AI 为什么值钱\n二、中段：Engram 的融资和定位\n三、判断：企业 AI 的核心是组织上下文\n四、方法：老板先盘点哪些组织知识\n五、结尾：组织记忆是企业 AI 化的地基",
    articleTitleDraft: "真正了解组织的 AI，才是企业 AI 化的下一站",
    imagePrompt: "封面：组织知识图谱连接岗位、流程、文档、会议和客户记录。",
    layout: "趋势稿：融资信号开头；中段拆组织上下文；结尾给建设清单。",
  },
  {
    id: "topic-011",
    score: 77,
    title: "从视频号到小红书：跑出百万+利润后，我重新理解了内容电商",
    source: "社群情报",
    category: "内容电商",
    valueTag: "获客转化",
    platform: "选题库",
    style: "案例拆解",
    length: "中篇 / 1800-2400 字",
    status: "candidate",
    worth: "这条社群情报能提供真实老板关心的增长和交付语境：内容不是为了热闹，而是为了订单、承接和复购。",
    opinion: "AI 内容增长如果只解决发得多，不解决承接和交付，老板很难看到真正的经营结果。",
    writingAngles: {
      business: "从内容带来的真实订单切入，而不是从流量和笔记数量切入。",
      process: "拆内容获客、线索承接、交付标准化、复购四个环节。",
      organization: "说明老板需要把内容团队、销售和交付接成一条线。",
      asset: "把爆文、话术、客户问题、交付 SOP 沉淀成可复用内容资产。",
    },
    outline: "一、开头：内容电商不是内容部门的事，而是收入链路的事\n二、案例：从视频号到小红书的社群复盘信号\n三、方法：AI 先重做内容生产，再接住线索和交付\n四、判断：内容工厂要和后端交付连起来\n五、结尾：老板该看哪 4 个指标",
    articleTitleDraft: "AI 内容电商真正该重做的，不是笔记数量，是获客到交付",
    imagePrompt: "封面：小红书内容入口、线索表、交付 SOP 和复购节点串成一条经营链路。",
    layout: "案例拆解：用一个社群案例开头；中段拆链路；结尾给指标表。",
  },
  {
    id: "topic-012",
    score: 75,
    title: "现在老板最重要的事：解放自己，培养agent builder团队",
    source: "社群情报",
    category: "老板能力",
    valueTag: "组织升级",
    platform: "选题库",
    style: "方法论",
    length: "中篇 / 1800-2400 字",
    status: "candidate",
    worth: "这条社群情报直接命中内容工厂的目标读者：老板怎么从亲自救火，转向培养能搭 Agent、懂业务、能交付的小队。",
    opinion: "企业 AI 化不是老板找一个会用工具的人，而是老板自己先学会定义任务，再培养能交付的 agent builder 小队。",
    writingAngles: {
      business: "从老板被事务困住的焦虑切入。",
      process: "拆老板如何把自己的高频决策和重复动作交给 Agent 小队。",
      organization: "讨论类师徒制、任务拆解、验收标准和内部训练机制。",
      asset: "把老板经验沉淀成可复制的任务模板和训练材料。",
    },
    outline: "一、开头：老板为什么总被事务困住\n二、中段：agent builder 团队不是技术团队，而是业务执行力\n三、方法：老板如何带出第一个 agent builder\n四、判断：企业 AI 化先从老板自己解放开始\n五、结尾：给老板一份 30 天训练表",
    articleTitleDraft: "老板想做好企业 AI 化，先培养自己的 agent builder 小队",
    imagePrompt: "封面：老板从日常事务中抽身，带着小型 agent builder 团队拆解任务、沉淀 SOP 和验收标准。",
    layout: "方法论：老板处境开头；中段拆训练路径；结尾给 30 天动作表。",
  },
];

topics.forEach((topic) => { topic.date = "2026-07-02"; });

const historicalTopics = [
  {
    id: "topic-20260701-001",
    date: "2026.07.01",
    score: 91,
    title: "老板最容易误判的 AI 项目，不是模型能力，而是业务入口没有定义清楚",
    source: "社群情报 + 一线观点",
    category: "项目起点",
    valueTag: "需求诊断",
    platform: "公众号主稿",
    style: "观澜判断感",
    length: "中篇 / 1800-2400 字",
    status: "candidate",
    worth: "这类材料能解释老板为什么越急着上 AI，越容易把问题推给工具。它适合做成一篇企业 AI 化的第一步判断：先定义业务入口，再决定工具。",
    opinion: "企业 AI 化不是从采购开始，而是从老板能说清楚一个业务入口和一个可验收动作开始。",
    writingAngles: {
      business: "从老板最焦虑的“到底该从哪里开始”切入。",
      process: "拆需求从业务入口、当前动作、输出结果、验收标准到工具选择的顺序。",
      organization: "说明老板、业务负责人和技术同事各自该负责什么判断。",
      asset: "把一次诊断沉淀成企业 AI 项目的入口清单和判断模板。",
    },
    outline: "一、开头：老板越急，越容易把 AI 项目做成工具采购\n二、中段：为什么业务入口比模型能力更重要\n三、方法：用一张入口表判断第一个 AI 项目\n四、结尾：先问清楚一个入口和一个动作",
    articleTitleDraft: "企业 AI 化第一步，不是买工具，是定义一个业务入口",
    imagePrompt: "封面：业务入口、动作、验收标准三列组成一张 AI 项目起点表。",
    layout: "公众号主稿：判断句开头；三段拆误区；结尾给入口表。",
  },
  {
    id: "topic-20260701-002",
    date: "2026.07.01",
    score: 88,
    title: "AI 客服真正有价值的地方，是把客户问题变成可复用的经营资产",
    source: "商业信号 + 社群情报",
    category: "客户服务",
    valueTag: "问题资产",
    platform: "公众号主稿",
    style: "案例拆解",
    length: "中篇 / 1800-2400 字",
    status: "library",
    worth: "客服场景能直接连到老板关心的客户问题、成交阻力和复购机会。它适合沉淀为客户入口系列选题。",
    opinion: "AI 客服不是为了少雇人，而是为了把客户每天问的问题沉淀成产品、销售和交付都能使用的资产。",
    writingAngles: {
      business: "从客户问题如何影响成交和复购切入。",
      process: "拆咨询、分流、回答、记录、跟进、复盘六个动作。",
      organization: "讨论客服、销售、产品和交付如何共用一套问题资产。",
      asset: "把高频问题、异议、成交话术和售后反馈沉淀为知识库。",
    },
    outline: "一、开头：客服不是成本中心，而是客户问题入口\n二、中段：AI 如何让问题被记录、分类和复用\n三、判断：真正的价值是问题资产\n四、结尾：给老板一张客户问题资产表",
    articleTitleDraft: "AI 客服最值得做的，不是自动回复，是客户问题资产化",
    imagePrompt: "封面：客户问题从对话窗口流入知识库、产品反馈和销售话术库。",
    layout: "案例拆解：场景开头；中段拆流程；结尾给资产表。",
  },
  {
    id: "topic-20260701-003",
    date: "2026.07.01",
    score: 84,
    title: "AI 培训服务开始从卖课转向陪跑交付",
    source: "社群情报",
    category: "AI 服务",
    valueTag: "交付升级",
    platform: "选题库",
    style: "商业内参",
    length: "短篇 / 800-1200 字",
    status: "candidate",
    worth: "这条适合提醒老板辨别 AI 服务的有效性：听懂概念不等于企业发生改变，陪跑交付才更接近结果。",
    opinion: "企业愿意长期付费的不是 AI 知识，而是业务动作被带着跑通。",
    writingAngles: {
      business: "从老板为结果付费而不是为课程付费切入。",
      process: "拆诊断、训练、工具配置、任务陪跑、复盘五个动作。",
      organization: "说明外部顾问如何成为企业内部 AI 化的临时加速器。",
      asset: "把陪跑中的案例、模板和 SOP 留在企业内部。",
    },
    outline: "一、开头：为什么老板听完课仍然不会用 AI\n二、中段：AI 服务从课程走向陪跑\n三、判断：交付动作比知识点更值钱\n四、结尾：老板如何判断一个 AI 服务是否靠谱",
    articleTitleDraft: "AI 培训真正该卖的，不是课，是陪老板跑通一个动作",
    imagePrompt: "封面：课程笔记转化为业务任务看板和交付清单。",
    layout: "短评：三段式判断；结尾给服务判断标准。",
  },
  {
    id: "topic-20260630-001",
    date: "2026.06.30",
    score: 90,
    title: "小公司更适合先做岗位级 Agent，而不是一上来做企业级平台",
    source: "一线观点 + 社群情报",
    category: "岗位 Agent",
    valueTag: "低成本试点",
    platform: "公众号主稿",
    style: "方法论",
    length: "中篇 / 1800-2400 字",
    status: "candidate",
    worth: "它直接回应老板的预算焦虑和落地焦虑：小公司不需要先证明一套大系统，只需要证明一个岗位动作值得复制。",
    opinion: "小公司做 AI 化，先赢一个岗位动作，比先买一套平台更容易得到结果。",
    writingAngles: {
      business: "从预算有限和试错成本切入。",
      process: "拆一个岗位动作从输入到输出的可交付链路。",
      organization: "讨论老板如何选第一个适合训练 Agent 的人和岗位。",
      asset: "把岗位动作沉淀成可复制的模板，再扩到第二个岗位。",
    },
    outline: "一、开头：小公司为什么不适合先上大平台\n二、中段：岗位级 Agent 的低成本试点逻辑\n三、方法：如何选第一个岗位动作\n四、结尾：先做小动作，再复制成系统",
    articleTitleDraft: "小公司做 AI，不要先做平台，先做一个岗位动作",
    imagePrompt: "封面：一个岗位任务从人工清单变成 Agent 协作台。",
    layout: "方法论：问题开头；中段给选择标准；结尾给试点清单。",
  },
  {
    id: "topic-20260630-002",
    date: "2026.06.30",
    score: 86,
    title: "老板需要的不是 AI 工具榜单，而是一张流程改造优先级表",
    source: "商业信号",
    category: "流程改造",
    valueTag: "优先级",
    platform: "公众号主稿",
    style: "观澜判断感",
    length: "中篇 / 1800-2400 字",
    status: "library",
    worth: "工具榜单无法帮老板决定先改哪里，流程优先级表更能连接成本、收入、风险和交付结果。",
    opinion: "企业 AI 化的核心问题不是工具太少，而是流程优先级没有被算清楚。",
    writingAngles: {
      business: "从老板每天被工具推荐淹没的焦虑切入。",
      process: "按收入影响、人工耗时、错误成本、数据完整度给流程排序。",
      organization: "说明业务负责人比工具专家更该参与优先级判断。",
      asset: "把优先级表变成每月复盘和下一轮改造的台账。",
    },
    outline: "一、开头：工具榜单解决不了企业 AI 化\n二、中段：为什么流程优先级才是老板决策工具\n三、方法：四个维度给流程排序\n四、结尾：先做最值得改的一条流程",
    articleTitleDraft: "老板别再看 AI 工具榜单，先做流程优先级表",
    imagePrompt: "封面：工具榜单被折叠到一旁，中心是一张流程改造优先级表。",
    layout: "公众号主稿：判断开头；中段表格；结尾给排序字段。",
  },
  {
    id: "topic-20260630-003",
    date: "2026.06.30",
    score: 81,
    title: "把老板经验做成提示词，不如先做成可检查的任务模板",
    source: "社群情报",
    category: "老板能力",
    valueTag: "经验沉淀",
    platform: "选题库",
    style: "方法论",
    length: "短篇 / 800-1200 字",
    status: "candidate",
    worth: "这条选题能解释老板经验如何进入企业 AI 化：不是把经验写成一句提示词，而是拆成任务、标准和检查点。",
    opinion: "老板经验要变成企业资产，关键不是提示词，而是任务模板和验收标准。",
    writingAngles: {
      business: "从老板离不开亲自判断的痛点切入。",
      process: "拆经验从判断原则、任务步骤、案例样本到检查标准。",
      organization: "让团队用同一套模板理解老板的判断方式。",
      asset: "把经验沉淀为任务模板、案例库和质检清单。",
    },
    outline: "一、开头：老板经验为什么很难交给 AI\n二、中段：提示词不等于可执行任务\n三、方法：把经验拆成模板和验收标准\n四、结尾：先写一张任务模板",
    articleTitleDraft: "老板经验不要只写成提示词，要先做成任务模板",
    imagePrompt: "封面：老板手写经验被拆成任务模板、案例和检查点。",
    layout: "短评：观点开头；中段拆模板；结尾给一页任务表。",
  },
];

topics.push(...historicalTopics);

const topicCatalogs = Array.isArray(window.CONTENT_FACTORY_TOPIC_CATALOGS) ? window.CONTENT_FACTORY_TOPIC_CATALOGS : [];
const julyTopicCatalog = topicCatalogs.find((catalog) => catalog.month === "2026-07") || null;
if (julyTopicCatalog?.topics?.length) topics.push(...julyTopicCatalog.topics);
topics.forEach((topic) => { topic.date = normalizeDate(topic.scheduledDate || topic.date || dataBatchDate); });

const CATALOG_VERSION = julyTopicCatalog?.catalogVersion || "built-in-r1";
const CATALOG_TOPIC_IDS = new Set(topics.map((topic) => topic.id));
const BASE_TOPIC_STATUS_BY_ID = new Map(topics.map((topic) => [topic.id, topic.status]));

const imageManifest = window.CONTENT_FACTORY_IMAGE_MANIFEST || { tasks: {}, assets: {}, defaultsByTopic: {} };
const manifestImageTasks = { ...(imageManifest.tasks || {}) };
const manifestImageAssets = { ...(imageManifest.assets || {}) };

const importedTopics = [
  {
    score: 83,
    title: "从视频号到小红书：跑出百万+利润后，我重新理解了内容电商",
    source: "社群情报",
    category: "内容电商",
    valueTag: "获客转化",
    platform: "选题库",
    style: "案例拆解",
    length: "中篇 / 1800-2400 字",
    status: "candidate",
    worth: "2026-07-02 社群情报中有“从视频号到小红书：跑出百万+利润后，我重新理解了内容电商”，并带有知识库 + Agent 工作流、前端获客 + 后端交付拆分等方法标签，适合后续展开案例。",
    opinion: "AI 内容增长如果只解决发得多，不解决承接和交付，老板很难看到真正的经营结果。",
    writingAngles: {
      business: "从内容带来的真实订单切入，而不是从流量和笔记数量切入。",
      process: "拆内容获客、线索承接、交付标准化、复购四个环节。",
      organization: "说明老板需要把内容团队、销售和交付接成一条线。",
      asset: "把爆文、话术、客户问题、交付 SOP 沉淀成可复用内容资产。",
    },
    outline: "一、开头：内容电商不是内容部门的事，而是收入链路的事\n二、案例：从视频号到小红书的社群复盘信号\n三、方法：AI 先重做内容生产，再接住线索和交付\n四、判断：内容工厂要和后端交付连起来\n五、结尾：老板该看哪 4 个指标",
    articleTitleDraft: "AI 内容电商真正该重做的，不是笔记数量，是获客到交付",
    imagePrompt: "封面：小红书内容入口、线索表、交付 SOP 和复购节点串成一条经营链路。",
    layout: "案例拆解：用一个社群案例开头；中段拆链路；结尾给指标表。",
  },
  {
    score: 81,
    title: "AI破局俱乐部的价格，已经正式涨到2399元。",
    source: "一线观点 + 社群情报",
    category: "定价交付",
    valueTag: "经营提醒",
    platform: "选题库",
    style: "方法论",
    length: "短篇 / 800-1200 字",
    status: "candidate",
    worth: "一线观点里有推理成本讨论，社群情报里有 AI 社群服务涨价到 2399 元的材料。这个组合适合提醒老板：AI 工具成本、服务交付和价格体系会一起变化。",
    opinion: "AI 不会天然让交付变便宜；只有流程、模板、复用率和成本账算清楚，价格才有底气。",
    writingAngles: {
      business: "从老板最关心的定价和毛利切入。",
      process: "拆 AI 交付中的成本、复用、服务边界和人工兜底。",
      organization: "讨论服务团队如何从人力交付变成产品化交付。",
      asset: "把交付动作产品化，才能让涨价有依据。",
    },
    outline: "一、开头：AI 越普及，交付未必越便宜\n二、中段：推理成本和服务涨价同时出现\n三、判断：便宜工具只是起点，稳定交付才决定价格\n四、结尾：给老板一张 AI 交付成本表",
    articleTitleDraft: "AI 工具便宜了，但企业交付为什么反而可能涨价",
    imagePrompt: "封面：工具成本、人工兜底、复用模板、服务价格四个模块形成一张交付定价表。",
    layout: "短评：四段结构；用经营账而非技术趋势表达。",
  },
];

const WRITING_STEPS = ["brief", "title", "outline", "body", "images"];
const WRITING_STEP_LABELS = {
  brief: "Brief",
  title: "标题",
  outline: "提纲",
  body: "正文",
  images: "图片资产",
};
const BUILT_IN_WRITING_STYLES = [
  {
    id: "style-wavesight-judgment",
    name: "观澜判断感",
    status: "published",
    isBuiltIn: true,
    description: "写给对 AI 有兴趣也有焦虑的老板：从外部信号转向经营判断和下一个可验证动作。",
    method: "1. 先找到老板真正在意的收入、成本、效率或风险。\n2. 用一条可核对的外部信号打开问题，不做新闻搬运。\n3. 在前三句给出一个有取舍的判断，说清什么比什么更重要。\n4. 把判断放回真实业务流程，拆输入、动作、责任人、输出和验收。\n5. 结尾只给一个今天能开始的小动作，不用宏大口号收尾。",
    prompt: "你是观澜 AI 的企业 AI 化顾问。面向对 AI 有兴趣、又担心投入无效的企业老板写作。先用真实信号引出经营问题，前三句给出明确判断，再拆解业务流程和验收方式，最后给一个可执行小动作。保持克制、具体、不过度承诺。",
    outputRules: "中文；短段落；不堆术语；不写“AI 将颠覆一切”；区分事实、判断与建议；结尾必须可行动。",
    guardrails: "不把推测写成事实；不编造数据、客户效果或引语；不输出工具清单式文章；不用空泛焦虑制造转化。",
    referenceText: "",
    testTopic: "企业引入 AI Agent 时，为什么应该先改一个岗位动作",
    testBrief: "读者是中小企业老板；他担心成本、实施周期和员工不会用。",
    testOutput: "",
    previousOutput: "",
    dimensions: { judgment: 88, evidence: 76, narrative: 42, action: 92 },
    scores: { fit: 96, natural: 84, specific: 90, reusable: 92 },
    source: { name: "观澜 AI 自有方法", url: "", stars: "NATIVE", license: "自有", note: "结合观澜面向企业老板的顾问定位与 AI-Radar 选题流程。" },
  },
  {
    id: "style-research-brief",
    name: "商业内参",
    status: "published",
    isBuiltIn: true,
    description: "适合重大商业信号、产业趋势和企业决策，先建证据结构，再给经营判断。",
    method: "1. 将选题拆成事实、上下文、判断和待验证四层。\n2. 先列提纲和证据缺口，每一节只回答一个经营问题。\n3. 开头用反常识判断，中段用数据、案例和流程交叉验证。\n4. 区分“已经发生”与“可能意味”，不让观点冒充事实。\n5. 结尾输出决策问题或核对清单，不输出宽泛趋势总结。",
    prompt: "以商业内参方式写作。先分离事实、上下文、判断和待验证项，再围绕一个经营问题建立提纲。开头给出反常识判断，中段用证据支撑并标出边界，结尾留下管理者需要核对的问题。",
    outputRules: "先判断后论证；每节一个经营问题；引用可回溯；不用流行词代替证据。",
    guardrails: "证据不足时明确标记；不编造行业增长率、客户数或高管引语。",
    referenceText: "",
    testTopic: "企业知识库为什么又成为 AI 热点",
    testBrief: "面向正在评估知识库与企业搜索投资的管理者。",
    testOutput: "",
    previousOutput: "",
    dimensions: { judgment: 78, evidence: 94, narrative: 30, action: 70 },
    scores: { fit: 90, natural: 78, specific: 92, reusable: 88 },
    source: { name: "ComposioHQ / content-research-writer", url: "https://github.com/ComposioHQ/awesome-claude-skills/blob/master/content-research-writer/SKILL.md", stars: "67.6k", license: "方法参考，请核对许可", note: "内化协作提纲、研究与引用、开头迭代和分节反馈；不直接复制原 Prompt。" },
  },
  {
    id: "style-case-coauthor",
    name: "案例拆解",
    status: "published",
    isBuiltIn: true,
    description: "适合用一个真实案例说清业务动作、责任分工与可复用步骤。",
    method: "1. 先收集案例的目标、受众、背景、限制和验收标准。\n2. 建立“原问题 → 关键动作 → 输出结果 → 复制条件”结构。\n3. 把案例中的偶然条件和可复用方法分开。\n4. 用一个未接触背景的读者视角测试：能否看懂、信任、执行。\n5. 结尾用复制条件收口，不把单一案例扩大成行业定律。",
    prompt: "用真实案例拆解一个企业 AI 化问题。先交代原问题和限制，再还原关键动作、责任分工和验收结果，最后区分偶然因素与可复用条件。让不熟悉背景的老板也能看懂。",
    outputRules: "案例必须有前置条件；动作要具体；结果要说明验收口径；结尾给复制条件。",
    guardrails: "不用单个案例证明普遍结论；不删除失败、人工兜底和实施成本。",
    referenceText: "",
    testTopic: "一家中小企业如何用 AI 改造客户跟进",
    testBrief: "用一个岗位动作案例拆解，不做企业数字化大叙事。",
    testOutput: "",
    previousOutput: "",
    dimensions: { judgment: 70, evidence: 82, narrative: 84, action: 86 },
    scores: { fit: 88, natural: 84, specific: 94, reusable: 86 },
    source: { name: "Anthropic / doc-coauthoring", url: "https://github.com/anthropics/skills/blob/main/skills/doc-coauthoring/SKILL.md", stars: "160.7k", license: "方法参考，请核对许可", note: "内化上下文收集、结构迭代与读者测试；不直接复制原 Prompt。" },
  },
  {
    id: "style-natural-editor",
    name: "自然表达",
    status: "published",
    isBuiltIn: true,
    description: "用于二次编辑：保留判断和事实，降低 AI 腔、套话、排比和过度对称。",
    method: "1. 先标记空话、泛化主语、过度总结和机械排比。\n2. 保留原文事实、判断和特定词，不为了“人味”改变意思。\n3. 交替使用短句和完整句，让节奏由信息重量决定。\n4. 把抽象名词改回具体人、动作、表格、流程和结果。\n5. 最后检查是否有一个真实的说话者，而不是一个“标准 AI 作者”。",
    prompt: "作为一名严格的中文编辑重写草稿。保留事实、核心判断和特定细节，删除空洞开场、过度排比、对称小标题和“值得注意的是”一类填充语。用具体动作替换抽象名词，让每一段只承担一个信息任务。",
    outputRules: "不改变原意；不编造细节；避免高频转折词和套话；允许句式不完全对称。",
    guardrails: "自然不等于随意；不故意加口语、网络梗或虚构经历；不删除证据边界。",
    referenceText: "",
    testTopic: "老板真正该盘点的不是 AI 工具，而是客户入口",
    testBrief: "将一段机械的 AI 稿改成观澜顾问能够真实说出的文字。",
    testOutput: "",
    previousOutput: "",
    dimensions: { judgment: 72, evidence: 70, narrative: 56, action: 66 },
    scores: { fit: 84, natural: 96, specific: 86, reusable: 90 },
    source: { name: "blader / humanizer", url: "https://github.com/blader/humanizer/blob/main/SKILL.md", stars: "29.0k", license: "MIT", note: "内化样本声音分析、AI 写作模式审计和保留原意的重写循环。" },
  },
  {
    id: "style-brand-voice",
    name: "品牌声音",
    status: "published",
    isBuiltIn: true,
    description: "从已发布文章提炼稳定的词汇、节奏、写法和品牌边界。",
    method: "1. 选取 3-5 篇代表文章，标记常用词、禁用词、句长和段落节奏。\n2. 定义品牌与读者的关系：同行、实践者或媒体。\n3. 将声音拆成方法拆解、经验分享、场景叙述和技巧提炼。\n4. 为不同内容任务保留同一声音，但允许结构变化。\n5. 用新选题试写，检查读者是否能在隐去署名时仍识别品牌。",
    prompt: "按已定义的品牌声音写作。以同行交流的口吻，从真实业务切入，讲清做法、经验和可复用技巧；不端着讲道理，也不把文章写成说教。词汇和节奏从参考文案的统计特征中提炼。",
    outputRules: "风格稳定但不套模板；优先使用品牌词库；保留不同选题的结构自由。",
    guardrails: "不从单篇文章得出整个品牌规则；不将写作风格等同于高频口号。",
    referenceText: "",
    testTopic: "AI 不应只是企业采购清单上的一个工具",
    testBrief: "检查观澜声音在新选题上是否仍然稳定。",
    testOutput: "",
    previousOutput: "",
    dimensions: { judgment: 82, evidence: 72, narrative: 50, action: 80 },
    scores: { fit: 92, natural: 88, specific: 82, reusable: 94 },
    source: { name: "alirezarezvani / content-creator", url: "https://github.com/alirezarezvani/claude-skills/wiki/Skills-Overview", stars: "22.5k", license: "MIT", note: "内化品牌声音分析、内容框架与渠道适配；不直接复制原 Prompt。" },
  },
  {
    id: "style-method-playbook",
    name: "方法论",
    status: "published",
    isBuiltIn: true,
    description: "把模糊的 AI 化问题拆成可执行步骤、表格和验收条件。",
    method: "1. 先定义读者要完成的业务任务。\n2. 给出选择标准，再给步骤，避免无条件的清单。\n3. 每一步包含输入、动作、产物和停止条件。\n4. 用一个小案例证明方法如何工作。\n5. 结尾给可直接使用的表格或清单。",
    prompt: "将选题写成可执行方法论。先给选择标准，再拆步骤；每步说明输入、动作、产物和停止条件。用一个具体业务场景说明，结尾交付一个可直接使用的表格或清单。",
    outputRules: "先标准后步骤；步骤必须可验收；不用无条件的十点清单。",
    guardrails: "不把个人经验伪装成通用定律；方法必须标出适用条件。",
    referenceText: "",
    testTopic: "如何选择企业第一个 AI Agent 试点",
    testBrief: "读者需要一个可在会议上直接使用的选择方法。",
    testOutput: "",
    previousOutput: "",
    dimensions: { judgment: 72, evidence: 70, narrative: 30, action: 96 },
    scores: { fit: 86, natural: 78, specific: 92, reusable: 96 },
    source: { name: "观澜 AI 自有方法", url: "", stars: "NATIVE", license: "自有", note: "从观澜顾问交付的诊断、步骤、表格与验收逻辑提炼。" },
  },
  {
    id: "style-short-comment",
    name: "短评",
    status: "published",
    isBuiltIn: true,
    description: "用一条信号、一个判断、一个动作完成高密度短文。",
    method: "1. 只选一条信号。\n2. 只给一个核心判断。\n3. 用一个真实业务场景解释。\n4. 结尾给一个今天可以检查的动作。",
    prompt: "写一篇高密度商业短评。用一条信号开场，立即给出一个与老板有关的判断，用一个业务场景说清，最后只留一个可执行检查动作。",
    outputRules: "800-1200 字；不做全面综述；不超过 4 个小节。",
    guardrails: "短不等于武断；保留必要的事实边界。",
    referenceText: "",
    testTopic: "企业 AI 化最容易漏掉的是验收标准",
    testBrief: "写成一篇可在观澜站内发布的短评。",
    testOutput: "",
    previousOutput: "",
    dimensions: { judgment: 90, evidence: 60, narrative: 28, action: 86 },
    scores: { fit: 88, natural: 84, specific: 82, reusable: 88 },
    source: { name: "观澜 AI 自有方法", url: "", stars: "NATIVE", license: "自有", note: "用于观澜站内短评和公众号短稿的高密度表达。" },
  },
].map((profile) => ({
  ...profile,
  publishedName: profile.name,
  updatedAt: "2026-07-13T00:00:00.000Z",
}));
const BUILT_IN_WRITING_STYLE_BY_ID = Object.fromEntries(BUILT_IN_WRITING_STYLES.map((profile) => [profile.id, profile]));
let writingStylesById = Object.fromEntries(BUILT_IN_WRITING_STYLES.map((profile) => [profile.id, JSON.parse(JSON.stringify(profile))]));
let selectedWritingStyleId = "style-wavesight-judgment";
let defaultWritingStyleId = "style-wavesight-judgment";
let deletedWritingStyleIds = new Set();
let activeWritingStyleTab = "method";
let writingStyleDirty = false;
const WORKSPACE_STORAGE_KEY = "content-factory-lite-v0.1-workspace-v3";
const LEGACY_WORKSPACE_STORAGE_KEY = "content-factory-lite-v0.1-workspace-v2";
let draftsByTopicId = {};
let handoffSnapshotsById = {};
let pendingPublicationDraftsById = {};
let imageTasksById = { ...manifestImageTasks };
let imageAssetsById = { ...manifestImageAssets };
const imageObjectUrlsByAssetId = {};
let activeWritingStep = "brief";
let activeLayoutSnapshotId = "";
let selectedPendingPublicationId = "";
let isHydratingDraft = false;
let hydratedWriterDraftId = "";
let draftAutosaveTimer = null;
let workspaceSaveError = "";
const REVIEW_DECISION_LABELS = {
  continue: "继续写",
  rewrite: "改写再发",
  series: "系列化",
  pause: "暂不继续",
};
const DEFAULT_PUBLICATION_ENTRIES = [
  {
    id: "publication-seed-001",
    title: "企业 AI 真正该买的，不是工具",
    platform: "公众号",
    publishedAt: "2026-07-09",
    reads: 2840,
    saves: 216,
    comments: 34,
    leads: 7,
    recap: "读者更关心怎么把 AI 项目拆成可交付动作，而不是工具列表。",
    decision: "series",
    updatedAt: "2026-07-10T00:00:00.000Z",
  },
  {
    id: "publication-seed-002",
    title: "老板最容易漏掉的是跟进入口",
    platform: "观澜站内",
    publishedAt: "2026-07-07",
    reads: 1120,
    saves: 64,
    comments: 12,
    leads: 2,
    recap: "入口盘点比工具清单更能帮助老板找到第一个 AI 试点。",
    decision: "continue",
    updatedAt: "2026-07-08T00:00:00.000Z",
  },
];
let publicationEntries = DEFAULT_PUBLICATION_ENTRIES.map((entry) => ({ ...entry }));
let selectedPublicationId = publicationEntries[0]?.id || "";

function readWorkspace() {
  try {
    const current = JSON.parse(window.localStorage.getItem(WORKSPACE_STORAGE_KEY) || "null");
    if (current) return current;
    return JSON.parse(window.localStorage.getItem(LEGACY_WORKSPACE_STORAGE_KEY) || "null");
  } catch (error) {
    return null;
  }
}

function persistWorkspace() {
  try {
    const topicOverrides = {};
    topics.forEach((topic) => {
      if (!CATALOG_TOPIC_IDS.has(topic.id)) return;
      const override = {};
      if (topic.status !== BASE_TOPIC_STATUS_BY_ID.get(topic.id)) override.status = topic.status;
      if (topic.libraryArchivedAt) override.libraryArchivedAt = topic.libraryArchivedAt;
      if (Object.keys(override).length) topicOverrides[topic.id] = override;
    });
    const customTopics = topics.filter((topic) => !CATALOG_TOPIC_IDS.has(topic.id));
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({
      version: 3,
      catalogVersion: CATALOG_VERSION,
      topicOverrides,
      customTopics,
      drafts: draftsByTopicId,
      handoffSnapshots: handoffSnapshotsById,
      pendingPublications: pendingPublicationDraftsById,
      imageTasks: imageTasksById,
      imageAssets: imageAssetsById,
      writingStyles: writingStylesById,
      deletedWritingStyleIds: [...deletedWritingStyleIds],
      publications: publicationEntries,
      ui: {
        selectedDate,
        selectedTopicId,
        selectedLibraryTopicId,
        selectedLibraryDate,
        selectedLibraryStatus,
        activeDraftId: queuedTopicId,
        activeWritingStep,
        activeLayoutSnapshotId,
        selectedPendingPublicationId,
        selectedWritingStyleId,
        defaultWritingStyleId,
        selectedPublicationId,
      },
    }));
    workspaceSaveError = "";
    return true;
  } catch (error) {
    workspaceSaveError = "本地保存失败，修改仍保留";
    return false;
  }
}

const restoredWorkspace = readWorkspace();
if (restoredWorkspace?.version === 3) {
  Object.entries(restoredWorkspace.topicOverrides || {}).forEach(([id, override]) => {
    const topic = topics.find((item) => item.id === id);
    if (topic && override?.status) topic.status = override.status;
    if (topic && override?.libraryArchivedAt) topic.libraryArchivedAt = override.libraryArchivedAt;
  });
  if (Array.isArray(restoredWorkspace.customTopics)) {
    restoredWorkspace.customTopics.forEach((topic) => {
      if (!topic?.id || topics.some((item) => item.id === topic.id)) return;
      topics.push({ ...topic, date: normalizeDate(topic.scheduledDate || topic.date || dataBatchDate) });
    });
  }
  if (restoredWorkspace.drafts && typeof restoredWorkspace.drafts === "object") draftsByTopicId = restoredWorkspace.drafts;
  if (restoredWorkspace.handoffSnapshots && typeof restoredWorkspace.handoffSnapshots === "object") handoffSnapshotsById = restoredWorkspace.handoffSnapshots;
  if (restoredWorkspace.pendingPublications && typeof restoredWorkspace.pendingPublications === "object") pendingPublicationDraftsById = restoredWorkspace.pendingPublications;
  if (restoredWorkspace.imageTasks && typeof restoredWorkspace.imageTasks === "object") {
    imageTasksById = { ...restoredWorkspace.imageTasks, ...manifestImageTasks };
  }
  if (restoredWorkspace.imageAssets && typeof restoredWorkspace.imageAssets === "object") {
    imageAssetsById = { ...restoredWorkspace.imageAssets, ...manifestImageAssets };
  }
  if (restoredWorkspace.writingStyles && typeof restoredWorkspace.writingStyles === "object") {
    writingStylesById = { ...writingStylesById, ...restoredWorkspace.writingStyles };
  }
  if (Array.isArray(restoredWorkspace.deletedWritingStyleIds)) {
    deletedWritingStyleIds = new Set(restoredWorkspace.deletedWritingStyleIds);
    deletedWritingStyleIds.forEach((id) => { delete writingStylesById[id]; });
  }
  if (Array.isArray(restoredWorkspace.publications)) {
    publicationEntries = restoredWorkspace.publications.filter((entry) => entry?.id && entry?.title);
  }
  const ui = restoredWorkspace.ui || {};
  if (ui.selectedDate) selectedDate = normalizeDate(ui.selectedDate);
  if (ui.selectedTopicId) selectedTopicId = ui.selectedTopicId;
  if (ui.selectedLibraryTopicId) selectedLibraryTopicId = ui.selectedLibraryTopicId;
  if (ui.selectedLibraryDate) selectedLibraryDate = ui.selectedLibraryDate;
  if (["all", "library", "queued", "skipped"].includes(ui.selectedLibraryStatus)) selectedLibraryStatus = ui.selectedLibraryStatus;
  if (ui.activeDraftId) queuedTopicId = ui.activeDraftId;
  if (WRITING_STEPS.includes(ui.activeWritingStep)) activeWritingStep = ui.activeWritingStep;
  if (ui.activeLayoutSnapshotId) activeLayoutSnapshotId = ui.activeLayoutSnapshotId;
  if (ui.selectedPendingPublicationId) selectedPendingPublicationId = ui.selectedPendingPublicationId;
  if (ui.selectedWritingStyleId && writingStylesById[ui.selectedWritingStyleId]) selectedWritingStyleId = ui.selectedWritingStyleId;
  if (ui.defaultWritingStyleId && writingStylesById[ui.defaultWritingStyleId]) defaultWritingStyleId = ui.defaultWritingStyleId;
  if (ui.selectedPublicationId) selectedPublicationId = ui.selectedPublicationId;
} else if (restoredWorkspace?.version === 2) {
  if (Array.isArray(restoredWorkspace.topics) && restoredWorkspace.topics.length) {
    restoredWorkspace.topics.forEach((restoredTopic) => {
      const baseTopic = topics.find((topic) => topic.id === restoredTopic.id);
      if (baseTopic) {
        if (restoredTopic.status) baseTopic.status = restoredTopic.status;
      } else if (restoredTopic?.id) {
        topics.push({ ...restoredTopic, date: normalizeDate(restoredTopic.scheduledDate || restoredTopic.date || dataBatchDate) });
      }
    });
  }
  if (restoredWorkspace.drafts && typeof restoredWorkspace.drafts === "object") {
    draftsByTopicId = restoredWorkspace.drafts;
  }
  if (restoredWorkspace.handoffSnapshots && typeof restoredWorkspace.handoffSnapshots === "object") {
    handoffSnapshotsById = restoredWorkspace.handoffSnapshots;
  }
  if (restoredWorkspace.selectedDate) selectedDate = normalizeDate(restoredWorkspace.selectedDate);
  if (restoredWorkspace.selectedTopicId) selectedTopicId = restoredWorkspace.selectedTopicId;
  if (restoredWorkspace.selectedLibraryTopicId) selectedLibraryTopicId = restoredWorkspace.selectedLibraryTopicId;
  if (restoredWorkspace.activeDraftId) queuedTopicId = restoredWorkspace.activeDraftId;
  if (WRITING_STEPS.includes(restoredWorkspace.activeWritingStep)) activeWritingStep = restoredWorkspace.activeWritingStep;
  if (restoredWorkspace.activeLayoutSnapshotId) activeLayoutSnapshotId = restoredWorkspace.activeLayoutSnapshotId;
}

normalizeWritingStyleSelections();
topics.forEach((topic) => {
  topic.date = normalizeDate(topic.scheduledDate || topic.date || dataBatchDate);
  if (["library", "queued"].includes(topic.status) && !topic.libraryArchivedAt) {
    topic.libraryArchivedAt = `${topic.date}T12:00:00.000Z`;
  }
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function currentWritingStyle() {
  return writingStylesById[selectedWritingStyleId] || writingStylesById[defaultWritingStyleId] || Object.values(writingStylesById)[0];
}

function writingStyleByName(name) {
  return Object.values(writingStylesById).find((profile) => profile.name === name || profile.publishedName === name || profile.aliases?.includes(name)) || null;
}

function writingStyleFallbackId(excludedId = "") {
  const profiles = Object.values(writingStylesById).filter((profile) => profile.id !== excludedId);
  return profiles.find((profile) => profile.status === "published")?.id || profiles[0]?.id || "";
}

function normalizeWritingStyleSelections() {
  if (!writingStylesById[defaultWritingStyleId] || writingStylesById[defaultWritingStyleId].status !== "published") {
    defaultWritingStyleId = writingStyleFallbackId();
  }
  if (!writingStylesById[selectedWritingStyleId]) selectedWritingStyleId = defaultWritingStyleId || writingStyleFallbackId();
}

function publishedWritingStyles() {
  return Object.values(writingStylesById)
    .filter((profile) => profile.status === "published")
    .sort((a, b) => {
      if (a.id === defaultWritingStyleId) return -1;
      if (b.id === defaultWritingStyleId) return 1;
      return String(a.publishedName || a.name).localeCompare(String(b.publishedName || b.name), "zh-CN");
    });
}

function renderPublishedWritingStyles(preferredStyle = "") {
  const select = document.querySelector("#styleSelect");
  if (!select) return;
  const previous = preferredStyle || select.value;
  const previousProfile = writingStylesById[previous] || writingStyleByName(previous);
  const profiles = publishedWritingStyles();
  select.innerHTML = profiles.map((profile) => {
    const name = profile.publishedName || profile.name;
    return `<option value="${escapeHtml(profile.id)}">${escapeHtml(name)}${profile.id === defaultWritingStyleId ? " · 默认" : ""}</option>`;
  }).join("");
  if (profiles.some((profile) => profile.id === previousProfile?.id)) select.value = previousProfile.id;
  else if (writingStylesById[defaultWritingStyleId]) select.value = defaultWritingStyleId;
}

function setWritingStyleTab(tab) {
  if (!["method", "reference", "prompt", "test"].includes(tab)) return;
  activeWritingStyleTab = tab;
  document.querySelectorAll("[data-style-tab]").forEach((button) => {
    if (button.dataset.styleTab === tab) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-style-panel]").forEach((panel) => {
    const active = panel.dataset.stylePanel === tab;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
}

function renderWritingStyleList() {
  const container = document.querySelector("#writingStyleList");
  if (!container) return;
  const query = String(document.querySelector("#writingStyleSearch")?.value || "").trim().toLowerCase();
  const profiles = Object.values(writingStylesById).filter((profile) => {
    const haystack = `${profile.name} ${profile.description} ${profile.method} ${profile.source?.name || ""}`.toLowerCase();
    return !query || haystack.includes(query);
  });
  container.innerHTML = profiles.map((profile) => `
    <div class="style-profile-row">
      <button class="style-profile-item${profile.id === selectedWritingStyleId ? " is-selected" : ""}" type="button" role="option" aria-selected="${profile.id === selectedWritingStyleId}" data-writing-style-id="${escapeHtml(profile.id)}">
        <strong>${escapeHtml(profile.name)}</strong>
        <span>${escapeHtml(profile.source?.name || "自定义方法")}</span>
        <em>${profile.status === "published" ? "已发布" : "草稿"}</em>
      </button>
      <button class="style-profile-delete" type="button" data-delete-writing-style-id="${escapeHtml(profile.id)}" title="删除${escapeHtml(profile.name)}" aria-label="删除${escapeHtml(profile.name)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>
      </button>
    </div>
  `).join("") || '<div class="topic-empty">没有匹配风格</div>';
}

function deleteWritingStyle(styleId) {
  const profile = writingStylesById[styleId];
  if (!profile) return;
  if (Object.keys(writingStylesById).length <= 1) {
    showToast("至少保留一套写作风格");
    return;
  }
  if (profile.status === "published" && publishedWritingStyles().length <= 1) {
    showToast("公众号写作至少需要一套已发布风格");
    return;
  }
  const referencedDrafts = Object.values(draftsByTopicId).filter((draft) => draft.styleId === styleId);
  const referenceNote = referencedDrafts.length ? `\n\n有 ${referencedDrafts.length} 篇草稿正在引用，删除后将切换到默认风格。` : "";
  if (!window.confirm(`确定删除“${profile.name}”？${referenceNote}`)) return;

  const nextDefaultId = styleId === defaultWritingStyleId ? writingStyleFallbackId(styleId) : defaultWritingStyleId;
  const fallbackProfile = writingStylesById[nextDefaultId] || Object.values(writingStylesById).find((item) => item.id !== styleId);
  referencedDrafts.forEach((draft) => {
    draft.styleId = fallbackProfile.id;
    draft.style = fallbackProfile.publishedName || fallbackProfile.name;
    draft.confirmedSteps = (draft.confirmedSteps || []).filter((step) => step === "brief");
    draft.dirty = true;
    draft.updatedAt = new Date().toISOString();
  });

  delete writingStylesById[styleId];
  deletedWritingStyleIds.add(styleId);
  defaultWritingStyleId = nextDefaultId;
  if (selectedWritingStyleId === styleId) selectedWritingStyleId = defaultWritingStyleId || writingStyleFallbackId();
  writingStyleDirty = false;
  normalizeWritingStyleSelections();
  renderPublishedWritingStyles(defaultWritingStyleId);
  renderWritingStyleLab();
  persistWorkspace();
  showToast(`已删除“${profile.name}”${referencedDrafts.length ? `，${referencedDrafts.length} 篇草稿已切换风格` : ""}`);
}

function setStyleControlValue(selector, value) {
  const control = document.querySelector(selector);
  if (control) control.value = value ?? "";
}

function updateWritingStyleRangeOutputs() {
  ["Judgment", "Evidence", "Narrative", "Action"].forEach((key) => {
    const input = document.querySelector(`#style${key}Score`);
    const output = document.querySelector(`#style${key}Value`);
    if (input && output) output.value = input.value;
  });
}

function updateWritingStylePublishNote(profile = currentWritingStyle()) {
  const note = document.querySelector("#writingStylePublishNote");
  if (!note || !profile) return;
  if (profile.status !== "published") {
    note.textContent = "还是草稿，发布后才会出现在公众号写作中。";
    return;
  }
  note.textContent = profile.hasUnpublishedChanges
    ? "已有修改，发布后公众号写作才会使用新版本。"
    : profile.id === defaultWritingStyleId
      ? "当前版本已发布，并作为公众号默认风格使用。"
      : "当前版本已发布，可在公众号写作中选择。";
}

function renderWritingStyleLab() {
  const profile = currentWritingStyle();
  if (!profile) return;
  renderWritingStyleList();
  setStyleControlValue("#writingStyleName", profile.name);
  setStyleControlValue("#writingStyleDescription", profile.description);
  setStyleControlValue("#writingStyleMethod", profile.method);
  setStyleControlValue("#writingStyleGuardrails", profile.guardrails);
  setStyleControlValue("#writingStyleReference", profile.referenceText);
  setStyleControlValue("#writingStylePrompt", profile.prompt);
  setStyleControlValue("#writingStyleOutputRules", profile.outputRules);
  setStyleControlValue("#writingStyleTestTopic", profile.testTopic);
  setStyleControlValue("#writingStyleTestBrief", profile.testBrief);
  setStyleControlValue("#writingStyleTestOutput", profile.testOutput);
  const dimensions = profile.dimensions || {};
  setStyleControlValue("#styleJudgmentScore", dimensions.judgment ?? 70);
  setStyleControlValue("#styleEvidenceScore", dimensions.evidence ?? 70);
  setStyleControlValue("#styleNarrativeScore", dimensions.narrative ?? 50);
  setStyleControlValue("#styleActionScore", dimensions.action ?? 70);
  updateWritingStyleRangeOutputs();
  updateWritingStylePublishNote(profile);
  const resetButton = document.querySelector("#resetWritingStyleButton");
  resetButton.disabled = !profile.isBuiltIn;
  const comparison = document.querySelector("#writingStyleComparison");
  comparison.hidden = true;
  setWritingStyleTab(activeWritingStyleTab);
}

function captureWritingStyleLab() {
  const profile = currentWritingStyle();
  if (!profile) return null;
  const value = (selector, fallback = "") => document.querySelector(selector)?.value ?? fallback;
  profile.name = value("#writingStyleName", profile.name).trim() || profile.name;
  profile.description = value("#writingStyleDescription", profile.description).trim();
  profile.method = value("#writingStyleMethod", profile.method).trim();
  profile.guardrails = value("#writingStyleGuardrails", profile.guardrails).trim();
  profile.referenceText = value("#writingStyleReference", profile.referenceText);
  profile.prompt = value("#writingStylePrompt", profile.prompt).trim();
  profile.outputRules = value("#writingStyleOutputRules", profile.outputRules).trim();
  profile.testTopic = value("#writingStyleTestTopic", profile.testTopic).trim();
  profile.testBrief = value("#writingStyleTestBrief", profile.testBrief).trim();
  profile.testOutput = value("#writingStyleTestOutput", profile.testOutput);
  profile.dimensions = {
    judgment: Number(value("#styleJudgmentScore", 70)),
    evidence: Number(value("#styleEvidenceScore", 70)),
    narrative: Number(value("#styleNarrativeScore", 50)),
    action: Number(value("#styleActionScore", 70)),
  };
  return profile;
}

function markWritingStyleDirty() {
  const profile = captureWritingStyleLab();
  if (!profile) return;
  writingStyleDirty = true;
  profile.hasUnpublishedChanges = true;
  updateWritingStyleRangeOutputs();
  updateWritingStylePublishNote(profile);
}

function saveWritingStyle({ notify = true } = {}) {
  const profile = captureWritingStyleLab();
  if (!profile) return false;
  profile.updatedAt = new Date().toISOString();
  writingStyleDirty = false;
  const saved = persistWorkspace();
  renderWritingStyleList();
  updateWritingStylePublishNote(profile);
  if (notify) showToast(saved ? "写作风格草稿已保存" : "写作风格保存失败");
  return saved;
}

function referenceMetrics(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const sentences = clean.split(/[.!?。！？；;]/).map((item) => item.trim()).filter(Boolean);
  const paragraphs = String(text || "").split(/\n+/).map((item) => item.trim()).filter(Boolean);
  const averageLength = sentences.length ? Math.round(sentences.reduce((sum, item) => sum + item.length, 0) / sentences.length) : 0;
  const questionRate = sentences.length ? Math.round((((clean.match(/[？?]/g) || []).length) / sentences.length) * 100) : 0;
  const judgmentWords = (clean.match(/真正|不是|而是|关键|必须|先|只有|意味着/g) || []).length;
  const actionWords = (clean.match(/盘点|检查|拆解|建立|记录|验收|执行|停止/g) || []).length;
  return { characters: clean.length, sentences: sentences.length, paragraphs: paragraphs.length, averageLength, questionRate, judgmentWords, actionWords };
}

function analyzeReferenceCopy() {
  const profile = captureWritingStyleLab();
  const text = profile?.referenceText.trim() || "";
  if (!profile || text.length < 80) {
    showToast("请先粘贴至少 80 字参考文案");
    return;
  }
  const metrics = referenceMetrics(text);
  const rhythm = metrics.averageLength <= 18 ? "以短句推进，每句交代一个动作或细节" : metrics.averageLength >= 34 ? "以完整长句讲清来龙去脉，再用短句收口" : "中等句长为主，场景描述与方法说明交替";
  const opening = metrics.questionRate >= 12 ? "常用问题打开场景，随后立即回应" : metrics.judgmentWords >= 3 ? "以对比或反常识现象打开，再转入做法" : "先交代具体事实，再转向经验";
  const landing = metrics.actionWords >= 3 ? "结尾倾向清单、检查或一个可直接上手的技巧" : "结尾倾向停在经验回顾，可补一个具体技巧";
  const extracted = [
    `1. 节奏：${rhythm}。`,
    `2. 开头：${opening}。`,
    `3. 结构：样本约 ${metrics.paragraphs} 个段落、${metrics.sentences} 个句子；应保留“场景 → 做法 → 经验”的信息层次。`,
    `4. 方法：强调性词组出现 ${metrics.judgmentWords} 次；把它们改写成清晰的做法与取舍。`,
    `5. 技巧：${landing}。`,
  ].join("\n");
  profile.method = extracted;
  profile.dimensions.judgment = Math.min(100, 62 + metrics.judgmentWords * 5);
  profile.dimensions.narrative = Math.min(100, 35 + Math.max(0, metrics.paragraphs - 3) * 4);
  profile.dimensions.action = Math.min(100, 58 + metrics.actionWords * 6);
  setStyleControlValue("#writingStyleMethod", extracted);
  setStyleControlValue("#styleJudgmentScore", profile.dimensions.judgment);
  setStyleControlValue("#styleNarrativeScore", profile.dimensions.narrative);
  setStyleControlValue("#styleActionScore", profile.dimensions.action);
  updateWritingStyleRangeOutputs();
  const report = document.querySelector("#styleExtractionReport");
  report.innerHTML = `<strong>已提炼为可编辑方法</strong><p>${metrics.characters} 字 · ${metrics.paragraphs} 段 · 平均句长 ${metrics.averageLength} 字。结果已写入“方法定义”，请人工修改后再发布。</p>`;
  markWritingStyleDirty();
  showToast("参考文案已提炼");
}

function rebuildPromptFromMethod() {
  const profile = captureWritingStyleLab();
  if (!profile) return;
  profile.prompt = `你正在使用“${profile.name}”写作。\n\n写作方法：\n${profile.method}\n\n表达边界：\n${profile.guardrails}\n\n输出时优先服务读者的业务理解与下一步行动，不复制参考文案的句子。`;
  setStyleControlValue("#writingStylePrompt", profile.prompt);
  markWritingStyleDirty();
  showToast("Prompt 已根据方法重建");
}

function writingStyleSample(profile) {
  const topic = profile.testTopic || "企业 AI 化的第一步";
  const brief = profile.testBrief || "面向对 AI 感到焦虑的企业老板。";
  const dimensions = profile.dimensions || {};
  const opening = Number(dimensions.judgment || 0) >= 80
    ? `老板真正要解决的，不是“${topic}”这个技术问题，而是它能不能进入一个可验收的业务动作。`
    : `最近，“${topic}”又成为企业讨论的高频词。但老板需要先回到真实场景。`;
  const evidence = Number(dimensions.evidence || 0) >= 82
    ? "先把事实、对业务的解读和仍待验证的推测分开。没有基线数据和责任人，任何“降本增效”都只是演示稿。"
    : "不用先追问模型排名。先写下这个场景的输入、动作、输出和责任人，问题就会清楚很多。";
  const narrative = Number(dimensions.narrative || 0) >= 70
    ? "假设销售团队每天都要从聊天记录里整理客户需求。AI 能不能把关键信息写入 CRM，并由销售确认，这是动作；“部署一个销售 Agent”，还不是。"
    : "例如客户跟进：输入是聊天记录，动作是提取需求并回写 CRM，输出是待确认跟进任务，责任人仍是销售。";
  const action = Number(dimensions.action || 0) >= 80
    ? "今天就选一个高频、低风险的动作，写出原始耗时、错误率、人工兜底和停止条件。连续记录两周，再决定要不要扩大。"
    : "下一步，不妨先把一个真实流程画出来，看看 AI 应该出现在哪个节点。";
  return `# ${topic}\n\n${opening}\n\n${brief}\n\n${evidence}\n\n${narrative}\n\n${action}`;
}

function evaluateWritingStyleSample(profile) {
  const output = String(profile.testOutput || "");
  const length = output.replace(/\s/g, "").length;
  const concreteWords = (output.match(/收入|成本|风险|流程|责任人|输入|输出|验收|CRM|两周/g) || []).length;
  const aiPhrases = (output.match(/值得注意|随着|赋能|颠覆|不仅仅|总而言之/g) || []).length;
  profile.scores = {
    fit: Math.max(60, Math.min(98, 76 + Number(profile.dimensions?.judgment || 0) / 8 + Number(profile.dimensions?.action || 0) / 12)),
    natural: Math.max(55, Math.min(98, 92 - aiPhrases * 8)),
    specific: Math.max(58, Math.min(98, 68 + concreteWords * 3)),
    reusable: Math.max(60, Math.min(98, 70 + (profile.method.length > 120 ? 14 : 4) + (profile.guardrails.length > 40 ? 8 : 2))),
  };
  Object.keys(profile.scores).forEach((key) => { profile.scores[key] = Math.round(profile.scores[key]); });
  if (length < 180) profile.scores.specific = Math.max(55, profile.scores.specific - 8);
}

function runWritingStyleTest() {
  const profile = captureWritingStyleLab();
  if (!profile || profile.testTopic.length < 6) {
    showToast("请先输入测试选题");
    return;
  }
  profile.previousOutput = profile.testOutput || profile.previousOutput || "";
  profile.testOutput = writingStyleSample(profile);
  setStyleControlValue("#writingStyleTestOutput", profile.testOutput);
  evaluateWritingStyleSample(profile);
  markWritingStyleDirty();
  showToast("样稿已生成，可继续手动修改");
}

function compareWritingStyleVersions() {
  const profile = captureWritingStyleLab();
  if (!profile?.previousOutput) {
    showToast("运行至少两次样稿后才能对比");
    return;
  }
  const previous = referenceMetrics(profile.previousOutput);
  const current = referenceMetrics(profile.testOutput);
  const comparison = document.querySelector("#writingStyleComparison");
  comparison.hidden = false;
  comparison.innerHTML = `<strong>与上一版比较</strong><p>字数 ${previous.characters} → ${current.characters}；平均句长 ${previous.averageLength} → ${current.averageLength}；判断词 ${previous.judgmentWords} → ${current.judgmentWords}；行动词 ${previous.actionWords} → ${current.actionWords}。请优先判断哪一版更准确，而不是哪一版更像模板。</p>`;
}

function publishWritingStyle() {
  const profile = captureWritingStyleLab();
  if (!profile || profile.name.length < 2 || profile.method.length < 60 || profile.prompt.length < 60) {
    showToast("请先补齐风格名、写作方法和 Prompt");
    return;
  }
  if (!profile.isBuiltIn && profile.testOutput.replace(/\s/g, "").length < 100) {
    showToast("请先运行并检查一次样稿");
    setWritingStyleTab("test");
    return;
  }
  const previousPublishedName = profile.publishedName;
  if (previousPublishedName && previousPublishedName !== profile.name) {
    profile.aliases = uniqueList([...(profile.aliases || []), previousPublishedName]);
  }
  profile.status = "published";
  profile.publishedName = profile.name;
  profile.hasUnpublishedChanges = false;
  profile.publishedAt = new Date().toISOString();
  defaultWritingStyleId = profile.id;
  saveWritingStyle({ notify: false });
  renderPublishedWritingStyles(profile.id);
  renderWritingStyleLab();
  showToast(`“${profile.name}”已发布，并设为公众号默认风格`);
}

function createWritingStyle(sourceProfile = null) {
  const now = Date.now();
  const source = sourceProfile || currentWritingStyle();
  const id = `style-custom-${now}`;
  const profile = source ? JSON.parse(JSON.stringify(source)) : JSON.parse(JSON.stringify(BUILT_IN_WRITING_STYLES[0]));
  profile.id = id;
  profile.name = sourceProfile ? `${source.name} 副本` : `新写作风格`;
  profile.publishedName = "";
  profile.status = "draft";
  profile.isBuiltIn = false;
  profile.hasUnpublishedChanges = true;
  profile.updatedAt = new Date().toISOString();
  profile.source = { name: sourceProfile ? `基于 ${source.source?.name || source.name}` : "自定义方法", url: source.source?.url || "", stars: "CUSTOM", license: "请核对原参考", note: "从内置方法复制后独立调试，发布前请确认参考边界。" };
  writingStylesById[id] = profile;
  selectedWritingStyleId = id;
  writingStyleDirty = true;
  renderWritingStyleLab();
  setWritingStyleTab("method");
  document.querySelector("#writingStyleName")?.focus();
}

function resetBuiltInWritingStyle() {
  const profile = currentWritingStyle();
  const original = BUILT_IN_WRITING_STYLE_BY_ID[profile?.id];
  if (!profile || !original) return;
  writingStylesById[profile.id] = JSON.parse(JSON.stringify(original));
  writingStylesById[profile.id].publishedName = original.name;
  writingStylesById[profile.id].hasUnpublishedChanges = false;
  writingStyleDirty = true;
  renderWritingStyleLab();
  saveWritingStyle({ notify: false });
  renderPublishedWritingStyles(original.name);
  showToast("已还原内置方法");
}

function exportWritingStyleSkill() {
  const profile = captureWritingStyleLab();
  if (!profile) return;
  const skillName = profile.name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-|-$/g, "") || "wechat-writing-style";
  const content = `---\nname: ${skillName}\ndescription: 在需要使用“${profile.name}”风格起草、改写或评估公众号文章时使用。\n---\n\n# ${profile.name}\n\n## 适用场景\n\n${profile.description}\n\n## 写作流程\n\n${profile.method}\n\n## Prompt\n\n${profile.prompt}\n\n## 输出规则\n\n${profile.outputRules}\n\n## 表达边界\n\n${profile.guardrails}\n`;
  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${skillName}-SKILL.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Skill.md 已导出");
}

function rankOfTopic(topicId) {
  const sorted = dailyTopics();
  return sorted.findIndex((topic) => topic.id === topicId) + 1;
}

function topicDate(topic) {
  return normalizeDate(topic.scheduledDate || topic.date || dataBatchDate);
}

function availableDates(today = topicLocalDate()) {
  return [...new Set(topics.map(topicDate))]
    .filter((date) => isCurrentOrPastTopicDate(date, today))
    .sort((a, b) => b.localeCompare(a));
}

function sortedTopics(topicList) {
  return [...topicList].sort((a, b) => b.score - a.score);
}

function dailyTopics() {
  return sortedTopics(topics.filter((topic) => topicDate(topic) === selectedDate));
}

function ensureTopicSelection() {
  const availableTopics = dailyTopics();
  if (!availableTopics.some((topic) => topic.id === selectedTopicId)) {
    selectedTopicId = availableTopics[0]?.id || "";
  }
}

function currentTopic() {
  ensureTopicSelection();
  return topics.find((topic) => topic.id === selectedTopicId) || dailyTopics()[0] || topics[0];
}

function isTopicArchived(topic) {
  return Boolean(topic?.libraryArchivedAt || topic?.status === "library");
}

function allLibraryTopics() {
  return topics
    .filter(isTopicArchived)
    .sort((a, b) => String(b.libraryArchivedAt || topicDate(b)).localeCompare(String(a.libraryArchivedAt || topicDate(a))) || b.score - a.score);
}

function libraryTopics() {
  return allLibraryTopics().filter((topic) => (
    (selectedLibraryDate === "all" || topicDate(topic) === selectedLibraryDate)
    && (selectedLibraryStatus === "all" || topic.status === selectedLibraryStatus)
  ));
}

function ensureLibrarySelection() {
  const storedTopics = libraryTopics();
  if (!storedTopics.some((topic) => topic.id === selectedLibraryTopicId)) {
    selectedLibraryTopicId = storedTopics[0]?.id || "";
  }
}

function currentLibraryTopic() {
  ensureLibrarySelection();
  return topics.find((topic) => topic.id === selectedLibraryTopicId && isTopicArchived(topic)) || null;
}

function queuedTopic() {
  const queued = queuedTopics();
  const selected = queued.find((topic) => topic.id === queuedTopicId) || queued[0] || null;
  if (selected && selected.id !== queuedTopicId) queuedTopicId = selected.id;
  return selected;
}

function queuedTopics() {
  return sortedTopics(topics.filter((topic) => topic.status === "queued"));
}

function createImagePlan(coverPrompt = "", inlinePrompt = "") {
  return {
    cover: { prompt: coverPrompt, taskIds: [], selectedAssetId: null, adoptionSnapshot: null },
    inline: [{ id: "inline-1", prompt: inlinePrompt, taskIds: [], selectedAssetId: null, adoptionSnapshot: null }],
  };
}

function imageSlotPlan(draft, role) {
  if (!draft?.imagePlan) return null;
  return role === "cover" ? draft.imagePlan.cover : draft.imagePlan.inline?.[0];
}

function ensureImagePlan(draft, topic) {
  if (!draft) return null;
  const inlinePrompt = draft.inlineImageBrief || `正文配图：把${topic?.category || "业务"}的关键流程、责任人与验收点拆成一张克制的业务图卡，只服务阅读理解。`;
  if (!draft.imagePlan || !draft.imagePlan.cover || !Array.isArray(draft.imagePlan.inline)) {
    draft.imagePlan = createImagePlan(draft.imageBrief || topic?.imagePrompt || "", inlinePrompt);
  }
  if (!draft.imagePlan.inline[0]) draft.imagePlan.inline[0] = createImagePlan("", inlinePrompt).inline[0];
  draft.imagePlan.cover.prompt = draft.imageBrief ?? draft.imagePlan.cover.prompt ?? "";
  draft.imagePlan.inline[0].prompt = draft.inlineImageBrief ?? draft.imagePlan.inline[0].prompt ?? "";
  if (!Array.isArray(draft.imagePlan.cover.taskIds)) draft.imagePlan.cover.taskIds = [];
  if (!Array.isArray(draft.imagePlan.inline[0].taskIds)) draft.imagePlan.inline[0].taskIds = [];

  const defaults = imageManifest.defaultsByTopic?.[draft.topicId];
  if (defaults?.cover?.taskId && !draft.imagePlan.cover.taskIds.includes(defaults.cover.taskId)) {
    draft.imagePlan.cover.taskIds.unshift(defaults.cover.taskId);
  }
  if (defaults?.cover?.assetId && !draft.imagePlan.cover.selectedAssetId) {
    draft.imagePlan.cover.selectedAssetId = defaults.cover.assetId;
  }
  const inlineDefault = defaults?.inline?.[0];
  if (inlineDefault?.taskId && !draft.imagePlan.inline[0].taskIds.includes(inlineDefault.taskId)) {
    draft.imagePlan.inline[0].taskIds.unshift(inlineDefault.taskId);
  }
  if (inlineDefault?.assetId && !draft.imagePlan.inline[0].selectedAssetId) {
    draft.imagePlan.inline[0].selectedAssetId = inlineDefault.assetId;
  }
  return draft.imagePlan;
}

function latestImageTask(draft, role) {
  const slot = imageSlotPlan(draft, role);
  return (slot?.taskIds || []).map((id) => imageTasksById[id]).find(Boolean) || null;
}

function latestReadyImageAsset(draft, role) {
  const slot = imageSlotPlan(draft, role);
  for (const taskId of slot?.taskIds || []) {
    const task = imageTasksById[taskId];
    if (task?.status !== "ready") continue;
    const asset = (task.assetIds || []).map((id) => imageAssetsById[id]).find(Boolean);
    if (asset) return asset;
  }
  return null;
}

function selectedImageAsset(draft, role) {
  const assetId = imageSlotPlan(draft, role)?.selectedAssetId;
  return assetId ? imageAssetsById[assetId] || null : null;
}

function isSelectedImageCurrent(draft, role) {
  const slot = imageSlotPlan(draft, role);
  const asset = selectedImageAsset(draft, role);
  if (!slot || !asset) return false;
  const adoption = slot.adoptionSnapshot;
  if (adoption?.assetId === asset.id) {
    return adoption.briefSnapshot === String(slot.prompt || "")
      && adoption.titleSnapshot === String(draft?.selectedTitle || "");
  }
  const task = imageTasksById[asset.taskId];
  return (!task?.briefSnapshot || task.briefSnapshot === String(slot.prompt || ""))
    && (!task?.titleSnapshot || task.titleSnapshot === String(draft?.selectedTitle || ""));
}

function currentSelectedImageAsset(draft, role) {
  return isSelectedImageCurrent(draft, role) ? selectedImageAsset(draft, role) : null;
}

function imageBundleForDraft(draft) {
  ensureImagePlan(draft, topics.find((topic) => topic.id === draft?.topicId));
  const cover = currentSelectedImageAsset(draft, "cover");
  const inline = currentSelectedImageAsset(draft, "inline");
  return {
    coverAssetId: cover?.id || null,
    inlineAssetIds: inline?.id ? [inline.id] : [],
    assets: [cover, inline].filter(Boolean).map((asset) => ({ ...asset })),
    imageBriefSnapshot: {
      cover: draft?.imageBrief || "",
      inline: [draft?.inlineImageBrief || ""],
    },
  };
}

function createDraftFromTopic(topic) {
  const initialStyle = writingStyleByName(topic.style) || writingStylesById[defaultWritingStyleId];
  const draft = {
    topicId: topic.id,
    status: "drafting",
    currentStep: "brief",
    styleId: initialStyle?.id || defaultWritingStyleId,
    style: initialStyle?.publishedName || initialStyle?.name || topic.style || "观澜判断感",
    length: topic.length || "中篇 / 1800-2400 字",
    painScene: `老板对${topic.category}有具体焦虑：${topic.writingAngles.business}`,
    coreJudgment: topic.opinion,
    articleGoal: `让读者看完后能够判断${topic.category}会先影响收入、成本、效率还是风险，并知道下一个小切口如何验证。`,
    notWrite: "不做新闻搬运，不堆工具名，不写泛泛的“AI 改变一切”，不夸大未经来源支持的结果。",
    titleSeed: 0,
    titleCandidates: [],
    selectedTitle: topic.articleTitleDraft || topic.title,
    outline: topic.outline || "",
    bodyMarkdown: "",
    imageBrief: topic.imagePrompt || "",
    inlineImageBrief: `正文配图：把${topic.category}的关键流程、责任人与验收点拆成一张克制的业务图卡，只服务阅读理解。`,
    confirmedSteps: [],
    revision: 0,
    dirty: false,
    updatedAt: new Date().toISOString(),
    handedOffRevision: null,
  };
  draft.imagePlan = createImagePlan(draft.imageBrief, draft.inlineImageBrief);
  ensureImagePlan(draft, topic);
  draft.titleCandidates = buildTitleCandidates(topic, draft);
  draft.bodyMarkdown = buildBodyDraft(topic, draft);
  return draft;
}

function ensureDraft(topic) {
  if (!topic) return null;
  if (!draftsByTopicId[topic.id]) draftsByTopicId[topic.id] = createDraftFromTopic(topic);
  const draft = draftsByTopicId[topic.id];
  if (!Array.isArray(draft.confirmedSteps)) draft.confirmedSteps = [];
  if (!draft.styleId || !writingStylesById[draft.styleId]) {
    draft.styleId = writingStyleByName(draft.style)?.id || writingStyleByName(topic.style)?.id || defaultWritingStyleId;
  }
  const style = writingStylesById[draft.styleId];
  draft.style = style?.publishedName || style?.name || draft.style || "观澜判断感";
  ensureImagePlan(draft, topic);
  return draft;
}

function currentDraft() {
  return ensureDraft(queuedTopic());
}

function activeLayoutSnapshot() {
  return handoffSnapshotsById[activeLayoutSnapshotId] || null;
}

function sortedHandoffSnapshots() {
  return Object.values(handoffSnapshotsById).sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

function layoutSnapshotTitle(snapshot) {
  const isPlaceholder = (value) => /^(?:粘贴文章|导入文章|未命名文章)$/i.test(normalizeGzhHeadingText(value));
  const currentTitle = normalizeGzhHeadingText(snapshot?.title || "");
  if (currentTitle && !isPlaceholder(currentTitle)) return currentTitle;
  const markdown = String(snapshot?.layout?.markdown || snapshot?.markdown || "");
  const headings = [...markdown.matchAll(/^#\s+(.+)$/gm)].map((match) => normalizeGzhHeadingText(match[1]));
  const inferredTitle = headings.find((title) => title && !isPlaceholder(title));
  return inferredTitle || "未命名文章";
}

function ensureLegacyHandoffSnapshots() {
  Object.values(handoffSnapshotsById).forEach((snapshot) => {
    const resolvedTitle = layoutSnapshotTitle(snapshot);
    if (resolvedTitle !== "未命名文章" && resolvedTitle !== snapshot.title) snapshot.title = resolvedTitle;
    if (snapshot.imageBundle) return;
    snapshot.imageBundle = {
      coverAssetId: null,
      inlineAssetIds: [],
      assets: [],
      imageBriefSnapshot: {
        cover: snapshot.imageBrief || "",
        inline: [snapshot.inlineImageBrief || ""],
      },
    };
  });
  Object.values(draftsByTopicId).forEach((draft) => {
    if (draft.status !== "ready_for_layout" || sortedHandoffSnapshots().some((snapshot) => snapshot.topicId === draft.topicId && snapshot.revision === draft.handedOffRevision)) return;
    const id = `${draft.topicId}-v${draft.handedOffRevision ?? draft.revision}-legacy`;
    handoffSnapshotsById[id] = {
      id,
      topicId: draft.topicId,
      revision: draft.handedOffRevision ?? draft.revision,
      title: draft.selectedTitle,
      markdown: draft.bodyMarkdown,
      imageBrief: draft.imageBrief,
      inlineImageBrief: draft.inlineImageBrief,
      imageBundle: imageBundleForDraft(draft),
      createdAt: draft.updatedAt || new Date().toISOString(),
      layout: draft.layout || null,
    };
  });
}

function createHandoffSnapshot(draft) {
  const createdAt = new Date().toISOString();
  const id = `${draft.topicId}-v${draft.revision}-${Date.now()}`;
  const writingStyle = writingStylesById[draft.styleId] || writingStyleByName(draft.style);
  const snapshot = {
    id,
    topicId: draft.topicId,
    revision: draft.revision,
    title: draft.selectedTitle,
    markdown: draft.bodyMarkdown,
    imageBrief: draft.imageBrief,
    inlineImageBrief: draft.inlineImageBrief,
    writingStyleSnapshot: writingStyle ? {
      id: writingStyle.id,
      name: writingStyle.publishedName || writingStyle.name,
      method: writingStyle.method,
      prompt: writingStyle.prompt,
      outputRules: writingStyle.outputRules,
      guardrails: writingStyle.guardrails,
      publishedAt: writingStyle.publishedAt || writingStyle.updatedAt,
    } : null,
    imageBundle: imageBundleForDraft(draft),
    createdAt,
    layout: null,
  };
  handoffSnapshotsById[id] = snapshot;
  return snapshot;
}

function statusClass(status) {
  if (status === "queued") return "queued";
  if (status === "library") return "library";
  if (status === "skipped") return "skipped";
  return "";
}

function topicMatchesQuery(topic, query) {
  if (!query) return true;
  const haystack = [
    topic.title,
    topic.source,
    topic.category,
    topic.valueTag,
    statusLabels[topic.status],
  ].join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function updateMetrics() {
  const scopedTopics = dailyTopics();
  document.querySelector("#metricCandidate").textContent = scopedTopics.filter((topic) => topic.status === "candidate").length;
  document.querySelector("#metricQueued").textContent = scopedTopics.filter((topic) => topic.status === "queued").length;
  document.querySelector("#metricLibrary").textContent = scopedTopics.filter(isTopicArchived).length;
}

function renderTopics() {
  const query = document.querySelector("#topicSearch").value.trim();
  const list = document.querySelector("#topicList");
  const visibleTopics = dailyTopics().filter((topic) => topicMatchesQuery(topic, query));

  if (visibleTopics.length === 0) {
    selectedTopicId = "";
    list.innerHTML = '<div class="topic-empty">当前日期没有匹配的选题</div>';
    renderDetail(null);
    return;
  }

  if (!visibleTopics.some((topic) => topic.id === selectedTopicId)) selectedTopicId = visibleTopics[0].id;

  list.innerHTML = visibleTopics.map((topic) => {
    const selectedClass = topic.id === selectedTopicId ? " is-selected" : "";
    const pillClass = statusClass(topic.status);
    const sourceDate = topic.provenance?.sourceObservedDate || topic.sourceDate;
    const sourceMeta = sourceDate ? ` / 信号：${formatDate(sourceDate)}` : "";
    return `
      <button class="topic-row${selectedClass}" type="button" data-topic-id="${escapeHtml(topic.id)}">
        <div class="topic-score">${topic.score}</div>
        <div>
          <h3>${escapeHtml(topic.title)}</h3>
          <p>来源：${escapeHtml(topic.source)} / 方向：${escapeHtml(topic.category)} / 价值：${escapeHtml(topic.valueTag)}${escapeHtml(sourceMeta)}</p>
        </div>
        <span class="status-pill ${pillClass}">${escapeHtml(statusLabels[topic.status])}</span>
      </button>
    `;
  }).join("");
  renderDetail(visibleTopics.find((topic) => topic.id === selectedTopicId));
}

function renderLibrary() {
  const searchInput = document.querySelector("#librarySearch");
  const list = document.querySelector("#libraryList");
  if (!searchInput || !list) return;

  renderLibraryDateFilter();
  document.querySelector("#libraryStatusFilter").value = selectedLibraryStatus;
  const allStoredTopics = allLibraryTopics();
  const storedTopics = libraryTopics();
  const query = searchInput.value.trim();
  const visibleTopics = storedTopics.filter((topic) => topicMatchesQuery(topic, query));

  document.querySelector("#libraryCount").textContent = allStoredTopics.length;
  document.querySelector("#libraryHighCount").textContent = allStoredTopics.filter((topic) => topic.score >= 80).length;
  document.querySelector("#libraryQueuedCount").textContent = allStoredTopics.filter((topic) => topic.status === "queued").length;

  if (visibleTopics.length > 0 && !visibleTopics.some((topic) => topic.id === selectedLibraryTopicId)) {
    selectedLibraryTopicId = visibleTopics[0].id;
  } else {
    ensureLibrarySelection();
  }

  if (visibleTopics.length === 0) {
    list.innerHTML = '<div class="topic-empty">暂无匹配的入库选题</div>';
    renderLibraryDetail(null);
    return;
  }

  list.innerHTML = visibleTopics.map((topic) => {
    const selectedClass = topic.id === selectedLibraryTopicId ? " is-selected" : "";
    return `
      <button class="topic-row${selectedClass}" type="button" data-library-topic-id="${escapeHtml(topic.id)}">
        <div class="topic-score">${topic.score}</div>
        <div>
          <h3>${escapeHtml(topic.title)}</h3>
          <p>入库：${escapeHtml(formatDate(String(topic.libraryArchivedAt || topicDate(topic)).slice(0, 10)))} / 排期：${escapeHtml(formatDate(topicDate(topic)))} / ${escapeHtml(topic.category)} · ${escapeHtml(topic.source)}</p>
        </div>
        <span class="status-pill ${statusClass(topic.status)}">${escapeHtml(statusLabels[topic.status] || "已留档")}</span>
      </button>
    `;
  }).join("");

  renderLibraryDetail(currentLibraryTopic());
}

function renderDetail(topic = currentTopic()) {
  const actionButtons = document.querySelectorAll("[data-topic-action]");
  if (!topic) {
    document.querySelector("#detailRank").textContent = "TOP 00";
    document.querySelector("#detailStatus").textContent = "暂无选题";
    document.querySelector("#detailTitle").textContent = "没有匹配的选题";
    document.querySelector("#detailWorth").textContent = "调整搜索条件或切换日期后继续。";
    document.querySelector("#detailOpinion").textContent = "右侧动作已暂停，避免误操作被搜索隐藏的选题。";
    document.querySelector("#detailSourceDate").textContent = "";
    document.querySelector("#detailSourceLink").hidden = true;
    document.querySelector("#detailAngle").innerHTML = "";
    actionButtons.forEach((button) => { button.disabled = true; });
    return;
  }
  actionButtons.forEach((button) => { button.disabled = false; });
  const rank = rankOfTopic(topic.id);
  const angles = topic.writingAngles;
  document.querySelector("#detailRank").textContent = `TOP ${String(rank).padStart(2, "0")}`;
  document.querySelector("#detailStatus").textContent = statusLabels[topic.status];
  document.querySelector("#detailTitle").textContent = topic.title;
  document.querySelector("#detailWorth").textContent = topic.worth;
  document.querySelector("#detailOpinion").textContent = topic.opinion;
  const sourceDate = topic.provenance?.sourceObservedDate || topic.sourceDate;
  const sourceLink = document.querySelector("#detailSourceLink");
  document.querySelector("#detailSourceDate").textContent = sourceDate
    ? `排期 ${formatDate(topicDate(topic))} · 观澜信号 ${formatDate(sourceDate)} · ${topic.provenance?.signalId || "可回查来源"}`
    : `本地选题素材 · 排期 ${formatDate(topicDate(topic))}`;
  if (topic.provenance?.sourceUrl) {
    sourceLink.href = topic.provenance.sourceUrl;
    sourceLink.hidden = false;
  } else {
    sourceLink.removeAttribute("href");
    sourceLink.hidden = true;
  }
  document.querySelector("#detailAngle").innerHTML = `
    <div><strong>经营视角</strong><span>${escapeHtml(angles.business)}</span></div>
    <div><strong>流程视角</strong><span>${escapeHtml(angles.process)}</span></div>
    <div><strong>组织视角</strong><span>${escapeHtml(angles.organization)}</span></div>
    <div><strong>资产视角</strong><span>${escapeHtml(angles.asset)}</span></div>
  `;
}

function renderLibraryDetail(topic) {
  const actionButtons = document.querySelectorAll("[data-library-action]");
  if (!topic) {
    document.querySelector("#libraryDetailRank").textContent = "库内 00";
    document.querySelector("#libraryDetailStatus").textContent = "暂无选题";
    document.querySelector("#libraryDetailTitle").textContent = "暂无入库选题";
    document.querySelector("#libraryDetailArchiveMeta").textContent = selectedLibraryDate === "all" ? "选题库暂无留档" : "当前排期日期暂无留档";
    document.querySelector("#libraryDetailWorth").textContent = "从今日选题放入公众号写作或存入选题库后，选题都会在这里留档。";
    document.querySelector("#libraryDetailOpinion").textContent = "选题库用于查看写作中、暂缓和已放弃的选题，不与写作台混在一起。";
    document.querySelector("#libraryDetailAngle").innerHTML = "";
    actionButtons.forEach((button) => { button.disabled = true; });
    return;
  }

  const storedTopics = libraryTopics();
  const rank = storedTopics.findIndex((item) => item.id === topic.id) + 1;
  const angles = topic.writingAngles;
  document.querySelector("#libraryDetailRank").textContent = `库内 ${String(rank).padStart(2, "0")}`;
  document.querySelector("#libraryDetailStatus").textContent = statusLabels[topic.status];
  document.querySelector("#libraryDetailTitle").textContent = topic.title;
  document.querySelector("#libraryDetailArchiveMeta").textContent = `入库 ${formatDate(String(topic.libraryArchivedAt || topicDate(topic)).slice(0, 10))} · 原排期 ${formatDate(topicDate(topic))} · ${topic.source}`;
  document.querySelector("#libraryDetailWorth").textContent = topic.worth;
  document.querySelector("#libraryDetailOpinion").textContent = topic.opinion;
  document.querySelector("#libraryDetailAngle").innerHTML = `
    <div><strong>经营视角</strong><span>${escapeHtml(angles.business)}</span></div>
    <div><strong>流程视角</strong><span>${escapeHtml(angles.process)}</span></div>
    <div><strong>组织视角</strong><span>${escapeHtml(angles.organization)}</span></div>
    <div><strong>资产视角</strong><span>${escapeHtml(angles.asset)}</span></div>
  `;
  actionButtons.forEach((button) => { button.disabled = false; });
  const queueButton = document.querySelector('[data-library-action="queue"]');
  if (queueButton) queueButton.textContent = topic.status === "queued" ? "打开写作稿" : "放入公众号写作";
}

function uniqueList(items) {
  return [...new Set(items.filter(Boolean))];
}

function titleCandidateSets(topic, draft) {
  const category = topic.category || "业务入口";
  const valueTag = topic.valueTag || "经营结果";
  const judgment = draft?.coreJudgment || topic.opinion;
  return [
    [
      `老板该先看的不是 AI 工具，而是${category}`,
      `企业 AI 化的关键，可能藏在${valueTag}里`,
      `${topic.title}，真正提醒老板的是什么`,
      `别急着买 AI，先盘点你的${category}`,
    ],
    [
      `${category}正在变化，老板该先补哪张表`,
      `企业 AI 化别先追热点，先看${valueTag}`,
      `这条 AI 信号背后，老板真正要管的是${category}`,
      `你的${category}，可能已经被 AI 改写了`,
    ],
    [
      `老板最容易漏看的，不是模型，而是${category}`,
      `从${valueTag}开始，重做企业 AI 化的第一步`,
      `企业买 AI 前，先问清楚${category}有没有变`,
      `AI 不是新工具清单，而是一张${category}检查表`,
    ],
    [
      judgment.length <= 32 ? judgment : `${judgment.slice(0, 30)}……`,
      `这不只是 AI 新闻，而是老板的${valueTag}问题`,
      `从一条信号看懂${category}：老板今天先做什么`,
      `${category}的真正分水岭，是能不能被验收`,
    ],
  ];
}

function buildTitleCandidates(topic, draft = currentDraft()) {
  if (!topic || !draft) return [];
  const sets = titleCandidateSets(topic, draft);
  const generated = sets[(draft.titleSeed || 0) % sets.length];
  return uniqueList([draft.selectedTitle || topic.articleTitleDraft, ...generated]).slice(0, 5);
}

function renderTitleCandidates(topic, draft = currentDraft()) {
  const container = document.querySelector("#titleOptions");
  if (!container || !topic || !draft) return;
  const candidates = draft.titleCandidates?.length ? draft.titleCandidates : buildTitleCandidates(topic, draft);
  draft.titleCandidates = candidates;
  const selectedIndex = candidates.indexOf(draft.selectedTitle);
  container.innerHTML = candidates.map((title, index) => {
    const selected = title === draft.selectedTitle;
    const tabbable = selected || (selectedIndex === -1 && index === 0);
    return `
      <button class="title-option${selected ? " is-selected" : ""}" type="button" role="radio" data-title-index="${index}" aria-checked="${selected}" tabindex="${tabbable ? 0 : -1}">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(title)}</strong>
      </button>
    `;
  }).join("");
}

function buildOpeningDraft(topic, draft = currentDraft()) {
  const judgment = draft?.coreJudgment || topic.opinion;
  const style = draft?.style || "观澜判断感";
  const profile = writingStylesById[draft?.styleId] || writingStyleByName(style);
  if (style === "案例拆解") return `这不是一条普通的 AI 案例。它暴露了一个老板必须正面回答的问题：${judgment}`;
  if (style === "商业内参") return `先给判断：${judgment}这条信号的价值，不在技术热度，而在它已经开始改变企业的业务动作。`;
  if (style === "方法论") return `大多数老板容易从工具开始谈 AI。但更有用的起点是：${judgment}`;
  if (style === "短评") return `${judgment}这件事对老板的提醒，比一个新模型、新工具更直接。`;
  if (profile?.id === "style-natural-editor") return `${judgment}把这句话放回真实业务里，问题其实很具体：哪个人的哪个动作变了？`;
  if (profile?.id === "style-brand-voice") return `观澜先给一个判断：${judgment}老板需要的不是更多 AI 名词，而是看清这个变化会落到哪个经营动作上。`;
  if (profile && Number(profile.dimensions?.judgment || 0) >= 80) return `先给判断：${judgment}接下来要看的不是模型参数，而是它是否改变了一个可验收的业务动作。`;
  return `老板真正该焦虑的，不是模型又升级了。这条信号真正提醒的是：${judgment}`;
}

function buildOutlineDraft(topic, draft = currentDraft()) {
  const goal = draft?.articleGoal || `让老板看懂${topic.category}的业务影响`;
  const profile = writingStylesById[draft?.styleId] || writingStyleByName(draft?.style);
  const dimensions = profile?.dimensions || {};
  const signalSection = Number(dimensions.evidence || 0) >= 82
    ? `二、证据边界：分开“${topic.title}”中的事实、解读与待验证推测`
    : `二、表层变化：交代“${topic.title}”所代表的真实信号，不做新闻搬运`;
  const middleSection = Number(dimensions.narrative || 0) >= 70
    ? `三、案例拆解：还原${topic.category}里的原问题、关键动作、责任人与复制条件`
    : `三、业务拆解：把${topic.category}拆成输入、动作、责任人和验收结果`;
  const landingSection = Number(dimensions.action || 0) >= 85
    ? `五、技巧提炼：${goal}，并给出一个今天可以启动的检查动作`
    : `五、收束建议：${goal}`;
  return [
    `一、开头：先给出核心判断，说清它为什么和老板有关`,
    signalSection,
    middleSection,
    `四、经营判断：回到${topic.valueTag}，说明先影响收入、成本、效率还是风险`,
    landingSection,
  ].join("\n");
}

function bodyTargetRange(length = "") {
  if (String(length).startsWith("短篇")) return { min: 800, max: 1200, label: "800-1200" };
  if (String(length).startsWith("长篇")) return { min: 3000, max: Number.POSITIVE_INFINITY, label: "3000+" };
  return { min: 1800, max: 2400, label: "1800-2400" };
}

function bodyTargetLength(length = "") {
  return bodyTargetRange(length).min;
}

function bodyLengthWithinTarget(draft) {
  const count = String(draft?.bodyMarkdown || "").replace(/\s/g, "").length;
  const range = bodyTargetRange(draft?.length);
  return count >= range.min && count <= range.max;
}

function buildBodyDraft(topic, draft = currentDraft()) {
  if (!topic || !draft) return "";
  const targetHint = draft.length.startsWith("短篇") ? "文章要短，但判断不能轻。" : draft.length.startsWith("长篇") ? "长文要用更多事实、案例和流程细节支撑判断。" : "中篇应该让判断、业务拆解和行动建议保持均衡。";
  const outlineHeadings = String(draft.outline || "").split("\n").map((line) => line.replace(/^[一二三四五六七八九十\d]+[、.\s]*/, "").trim()).filter(Boolean);
  const heading = (index, fallback) => `## ${(outlineHeadings[index] || fallback).replace(/^[^:：]*[:：]\s*/, "")}`;
  const base = [
    buildOpeningDraft(topic, draft),
    "",
    heading(1, "这条信号真正改变了什么"),
    "",
    `今天发生的事是：${topic.title}。`,
    "",
    topic.worth,
    "",
    heading(2, "把问题放回业务流程"),
    "",
    `这和老板有什么关系？${draft.painScene}`,
    "",
    `${draft.coreJudgment}`,
    "",
    `具体到${topic.category}这条线，不要先问工具多强，而要先把流程拆成输入、动作、输出、责任人和验收标准。${topic.writingAngles.process}`,
    "",
    heading(3, "老板要看的经营结果"),
    "",
    `组织上也要同时回答：${topic.writingAngles.organization}`,
    "",
    `最后要沉淀什么？${topic.writingAngles.asset}`,
    "",
    heading(4, "今天可以开始的一个动作"),
    "",
    `${targetHint}${draft.articleGoal}`,
    "",
    `老板今天可以先做一件小事：选一个真实流程，写下它的输入、责任人、输出和验收标准。如果这四件事还说不清，就先不要采购更大的 AI 系统。`,
  ].join("\n");
  const expansions = [
    `## 先核对事实，再放大判断\n\n这类信号最容易被写成趋势新闻，但老板需要的不是热度，而是证据。先把“${topic.title}”中可以核对的事实、仍待验证的推测和对企业的解读分开。只有这三层被分清，${draft.coreJudgment}才不会变成一句空洞口号。`,
    `## 用经营账判断优先级\n\n第一步不是估算 AI 能省多少人，而是确认${topic.valueTag}会落到哪张经营报表上。它如果影响收入，就看转化率、客单价和流失；如果影响成本，就看重复工时、返工和服务交付；如果影响风险，就看责任归属、审批和追溯。没有基线数字，就不要轻易承诺效果。`,
    `## 把流程拆到可以验收\n\n${topic.writingAngles.process}真正可执行的拆法，是把一个场景写成五列：输入材料是什么，AI 要完成什么动作，输出交给谁，哪个角色承担最终责任，用什么标准验收。五列中任何一列空白，都意味着项目还不适合扩大。`,
    `## 组织不能只分为“技术”和“业务”\n\n${topic.writingAngles.organization}业务负责人应定义结果和验收线，一线人员提供真实输入和异常样本，技术人员负责稳定性、权限和日志，管理者则决定什么时候停止、回滚或扩大。这些责任没有写进流程，AI 项目就会变成没有业务主人的测试。`,
    `## 先做一个两周可验证的小切口\n\n选一个频率足够高、风险可控、输入相对稳定的场景，保留人工兜底，连续记录两周。验证时不只看速度，还要看正确率、返工率、异常占比和一线接受度。如果节省的时间被额外检查和修改吃掉，这个切口就需要重新设计。`,
    `## 采购之前先问清边界\n\n工具演示的是最顺利路径，企业使用遇到的却是权限、脏数据、例外和交接。因此采购清单上至少要有：数据如何保存，模型如何更新，权限如何分层，失败如何回滚，日志如何导出，以及供应商变更时能否迁移。这些问题比模型榜单更接近真实成本。`,
    `## 把失败条件也写进方案\n\n可用的方案不只说成功会怎样，也要明确什么情况下不再继续。例如错误率连续超过红线、人工审核时间高于原流程、关键数据无法追溯，或者一线因责任不清而拒绝使用。预先设置停止条件，不是悲观，而是让企业可以用小成本获得真经验。`,
    `## 用三十天把实验变成能力\n\n第一周画清流程和基线，第二周用小样本运行并记录异常，第三周调整提示、知识和人工审核节点，第四周再决定是否扩大。每周都要留下版本、样本、指标和复盘结论。${topic.writingAngles.asset}只有这些东西能被下一个团队复用，一次试验才会真正变成企业资产。`,
  ];
  const target = bodyTargetLength(draft.length);
  let body = base;
  expansions.forEach((section) => {
    if (body.replace(/\s/g, "").length < target + 80) body += `\n\n${section}`;
  });
  let checklistIndex = 1;
  while (body.replace(/\s/g, "").length < target + 80) {
    body += `\n\n## 补充核对 ${checklistIndex}\n\n再回到一个真实业务样本，核对输入是否完整、输出是否可验收、异常是否有人处理、结果是否留下日志。只有当这四个问题都能回答，${topic.category}才能从演示走向稳定交付。`;
    checklistIndex += 1;
  }
  return body;
}

function buildImageBriefs(topic, draft = currentDraft()) {
  return {
    cover: `标题安全区：左侧为“${draft.selectedTitle}”预留足够留白，图中不生成文字。\n视觉主体：用一张清晰的${topic.category}业务场景，表达${topic.valueTag}与企业 AI 化的关系。\n风格：暖白背景、深墨蓝图形、金色细线，克制商业感。\n不要：机器人脸、赛博光效、蓝紫渐变、夸张数据。`,
    inline: `单张正文配图：把${topic.category}拆成输入、动作、输出、责任人和验收标准的业务流程，并用五个无文字检查节点表达${topic.valueTag}。\n用途：服务理解和阅读节奏，不做装饰，不生成文字。`,
  };
}

function buildCodexImagePrompt(role, topic, draft, brief) {
  const shared = "视觉约束：观澜品牌的克制商业编辑插画；深墨蓝、观澜蓝、暖白、石灰与少量哑金；无文字、无 Logo、无水印、无机器人脸、无霓虹、无赛博光效。";
  const composition = role === "cover"
    ? "构图：公众号横版封面，约 2.35:1，左侧保留标题安全区，主体信息集中在右侧并允许安全裁切。"
    : "构图：正文横版配图，约 3:2，用清晰的业务节点与关系帮助理解，不做装饰图。";
  return `${brief}\n文章：${draft.selectedTitle || topic.title}\n${composition}\n${shared}`;
}

function imageTaskState(draft, role) {
  const task = latestImageTask(draft, role);
  const selectedAsset = selectedImageAsset(draft, role);
  const readyAsset = latestReadyImageAsset(draft, role);
  const stale = Boolean(selectedAsset && !isSelectedImageCurrent(draft, role));
  if (task?.status === "awaiting_codex") return { key: "waiting", label: "等待 Codex", task, selectedAsset, readyAsset };
  if (stale) return { key: "stale", label: "内容已变化", task, selectedAsset, readyAsset };
  if (task?.status === "failed") return { key: "failed", label: "生成失败", task, selectedAsset, readyAsset };
  if (selectedAsset) return { key: "adopted", label: "已采用", task, selectedAsset, readyAsset };
  if (readyAsset) return { key: "ready", label: "已完成", task, selectedAsset, readyAsset };
  return { key: "empty", label: "未创建", task, selectedAsset, readyAsset };
}

const IMAGE_DB_NAME = "content-factory-lite-images";
const IMAGE_DB_STORE = "assets";

function openImageDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = window.indexedDB.open(IMAGE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(IMAGE_DB_STORE)) database.createObjectStore(IMAGE_DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Image database unavailable"));
  });
}

async function putImageBlob(assetId, blob) {
  const database = await openImageDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(IMAGE_DB_STORE, "readwrite");
    transaction.objectStore(IMAGE_DB_STORE).put(blob, assetId);
    transaction.oncomplete = () => { database.close(); resolve(true); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

async function getImageBlob(assetId) {
  const database = await openImageDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(IMAGE_DB_STORE, "readonly");
    const request = transaction.objectStore(IMAGE_DB_STORE).get(assetId);
    request.onsuccess = () => { database.close(); resolve(request.result || null); };
    request.onerror = () => { database.close(); reject(request.error); };
  });
}

async function resolveImageAssetSrc(asset) {
  if (!asset) return "";
  if (asset.src) return asset.src;
  if (imageObjectUrlsByAssetId[asset.id]) return imageObjectUrlsByAssetId[asset.id];
  if (asset.storage !== "indexeddb") return "";
  try {
    const blob = await getImageBlob(asset.id);
    if (!blob) return "";
    imageObjectUrlsByAssetId[asset.id] = URL.createObjectURL(blob);
    return imageObjectUrlsByAssetId[asset.id];
  } catch (error) {
    return "";
  }
}

async function paintImagePreview(role, asset) {
  const preview = document.querySelector(`#${role}ImagePreview`);
  const placeholder = document.querySelector(`#${role}ImagePlaceholder`);
  if (!preview || !placeholder) return;
  const src = await resolveImageAssetSrc(asset);
  const currentDraftId = currentDraft()?.topicId;
  if (currentDraftId !== asset?.topicId && asset) return;
  if (!src) {
    preview.hidden = true;
    preview.removeAttribute("src");
    placeholder.hidden = false;
    return;
  }
  preview.src = src;
  preview.alt = asset.alt || (role === "cover" ? "公众号封面图" : "公众号正文配图");
  preview.hidden = false;
  placeholder.hidden = true;
}

function renderImageStudio(draft = currentDraft()) {
  const topic = queuedTopic();
  const exportButton = document.querySelector("#exportImageTasksButton");
  const pendingTaskCount = draft
    ? ["cover", "inline"].flatMap((role) => imageSlotPlan(draft, role)?.taskIds || []).filter((id) => imageTasksById[id]?.status === "awaiting_codex").length
    : 0;
  if (exportButton) exportButton.hidden = pendingTaskCount === 0;
  ["cover", "inline"].forEach((role) => {
    const status = document.querySelector(`#${role}ImageStatus`);
    const meta = document.querySelector(`#${role}ImageTaskMeta`);
    const adopt = document.querySelector(`[data-image-action="adopt"][data-image-role="${role}"]`);
    const open = document.querySelector(`[data-image-action="open"][data-image-role="${role}"]`);
    const create = document.querySelector(`[data-image-action="create-task"][data-image-role="${role}"]`);
    const importButton = document.querySelector(`[data-image-action="import"][data-image-role="${role}"]`);
    const fileInput = document.querySelector(`#${role}ImageFile`);
    if (!status || !meta || !adopt || !open || !create || !importButton || !fileInput) return;
    status.className = "image-task-status";
    if (!draft || !topic) {
      status.textContent = "未创建";
      meta.textContent = "请先放入一条公众号稿件。";
      [adopt, open, create, importButton, fileInput].forEach((button) => { button.disabled = true; });
      adopt.hidden = true;
      open.hidden = true;
      paintImagePreview(role, null);
      return;
    }
    ensureImagePlan(draft, topic);
    const state = imageTaskState(draft, role);
    status.textContent = state.label;
    if (["ready", "adopted"].includes(state.key)) status.classList.add(`is-${state.key}`);
    if (["waiting", "stale"].includes(state.key)) status.classList.add(`is-${state.key}`);
    const asset = state.selectedAsset || state.readyAsset;
    const attempt = state.task?.attempt ? ` · 第 ${state.task.attempt} 次` : "";
    meta.textContent = state.key === "waiting"
      ? `任务 ${state.task.id}${attempt}，等待 Codex 执行；旧资产会继续保留。`
      : state.key === "stale"
        ? "Prompt 已变化，旧图仍保留；请重新生成或明确继续采用。"
        : asset ? `${asset.width || "?"} × ${asset.height || "?"} · ${asset.storage === "project" ? "项目资产" : "本地导入"}${attempt}` : "Prompt 准备好后创建 Codex 任务。";
    adopt.disabled = !state.readyAsset;
    open.disabled = !asset;
    adopt.hidden = !state.readyAsset;
    open.hidden = !asset;
    create.disabled = false;
    importButton.disabled = false;
    fileInput.disabled = false;
    create.textContent = state.task ? (role === "cover" ? "重新生成封面" : "重新生成配图") : (role === "cover" ? "生成封面图" : "生成正文配图");
    paintImagePreview(role, asset);
  });
}

function createCodexImageTask(role) {
  const topic = queuedTopic();
  const draft = captureDraftFromEditor();
  if (!topic || !draft) return;
  ensureImagePlan(draft, topic);
  const slot = imageSlotPlan(draft, role);
  const brief = String(slot?.prompt || "").trim();
  if (brief.length < 30) {
    showToast(`请先补全${role === "cover" ? "封面图" : "正文配图"} Prompt`);
    return;
  }
  const createdAt = new Date().toISOString();
  const id = `codex-${draft.topicId}-${role}-${Date.now()}`;
  (slot.taskIds || []).forEach((taskId) => {
    const previousTask = imageTasksById[taskId];
    if (previousTask?.status !== "awaiting_codex") return;
    previousTask.status = "superseded";
    previousTask.updatedAt = createdAt;
  });
  const task = {
    id,
    topicId: draft.topicId,
    role,
    slotId: role === "cover" ? "cover" : "inline-1",
    provider: "codex-imagegen",
    briefSnapshot: brief,
    titleSnapshot: draft.selectedTitle,
    promptSnapshot: buildCodexImagePrompt(role, topic, draft, brief),
    status: "awaiting_codex",
    attempt: (slot.taskIds || []).length + 1,
    assetIds: [],
    error: null,
    createdAt,
    updatedAt: createdAt,
  };
  imageTasksById[id] = task;
  slot.taskIds.unshift(id);
  draft.dirty = true;
  invalidateDraftHandoff(draft);
  persistWorkspace();
  renderImageStudio(draft);
  updateWriterChrome();
  showToast("Codex 图片任务已创建，可导出执行");
}

function adoptReadyImage(role) {
  const draft = captureDraftFromEditor();
  if (!draft) return;
  const asset = latestReadyImageAsset(draft, role);
  if (!asset) {
    showToast("暂无可采用的已完成图片");
    return;
  }
  const slot = imageSlotPlan(draft, role);
  slot.selectedAssetId = asset.id;
  slot.adoptionSnapshot = {
    assetId: asset.id,
    briefSnapshot: String(slot.prompt || ""),
    titleSnapshot: String(draft.selectedTitle || ""),
    acceptedAt: new Date().toISOString(),
  };
  draft.dirty = true;
  invalidateDraftHandoff(draft);
  persistWorkspace();
  renderImageStudio(draft);
  updateWriterChrome();
  showToast(role === "cover" ? "已采用封面图" : "已采用正文配图");
}

async function openImageAsset(role) {
  const draft = currentDraft();
  const asset = selectedImageAsset(draft, role) || latestReadyImageAsset(draft, role);
  const src = await resolveImageAssetSrc(asset);
  if (!src) {
    showToast("原图暂不可用");
    return;
  }
  window.open(src, "_blank", "noopener,noreferrer");
}

function exportPendingImageTasks() {
  const draft = captureDraftFromEditor();
  const topic = queuedTopic();
  if (!draft || !topic) return;
  const tasks = ["cover", "inline"]
    .flatMap((role) => imageSlotPlan(draft, role)?.taskIds || [])
    .map((id) => imageTasksById[id])
    .filter((task) => task?.status === "awaiting_codex");
  if (!tasks.length) {
    showToast("当前稿件没有待执行的 Codex 图片任务");
    return;
  }
  const payload = {
    schemaVersion: 1,
    provider: "codex-imagegen",
    topic: { id: topic.id, title: draft.selectedTitle || topic.title },
    outputDirectory: `assets/generated/${topic.id}`,
    tasks,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `codex-image-tasks-${topic.id}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`已导出 ${tasks.length} 个 Codex 图片任务`);
}

async function importImageFile(role, file) {
  const topic = queuedTopic();
  const draft = captureDraftFromEditor();
  if (!topic || !draft || !file) return;
  ensureImagePlan(draft, topic);
  const slot = imageSlotPlan(draft, role);
  const createdAt = new Date().toISOString();
  const awaitingTask = (slot.taskIds || [])
    .map((id) => imageTasksById[id])
    .find((task) => task?.status === "awaiting_codex");
  const taskId = awaitingTask?.id || `import-${draft.topicId}-${role}-${Date.now()}`;
  const assetId = `asset-${taskId}`;
  try {
    await putImageBlob(assetId, file);
  } catch (error) {
    showToast("图片无法写入本地资产库，请检查浏览器存储权限");
    return;
  }
  const dimensions = await new Promise((resolve) => {
    const probe = new Image();
    const objectUrl = URL.createObjectURL(file);
    probe.onload = () => { resolve({ width: probe.naturalWidth, height: probe.naturalHeight }); URL.revokeObjectURL(objectUrl); };
    probe.onerror = () => { resolve({ width: 0, height: 0 }); URL.revokeObjectURL(objectUrl); };
    probe.src = objectUrl;
  });
  if (awaitingTask) {
    awaitingTask.status = "ready";
    awaitingTask.assetIds = [assetId];
    awaitingTask.completedVia = "local-import";
    awaitingTask.updatedAt = createdAt;
    (slot.taskIds || []).forEach((id) => {
      const task = imageTasksById[id];
      if (id !== taskId && task?.status === "awaiting_codex") {
        task.status = "superseded";
        task.updatedAt = createdAt;
      }
    });
  } else {
    imageTasksById[taskId] = {
      id: taskId,
      topicId: draft.topicId,
      role,
      slotId: role === "cover" ? "cover" : "inline-1",
      provider: "local-import",
      briefSnapshot: slot.prompt,
      titleSnapshot: draft.selectedTitle,
      promptSnapshot: slot.prompt,
      status: "ready",
      attempt: (slot.taskIds || []).length + 1,
      assetIds: [assetId],
      createdAt,
      updatedAt: createdAt,
    };
  }
  imageAssetsById[assetId] = {
    id: assetId,
    taskId,
    topicId: draft.topicId,
    role,
    src: "",
    mime: file.type || "image/png",
    width: dimensions.width,
    height: dimensions.height,
    alt: role === "cover" ? `${draft.selectedTitle}封面图` : `${draft.selectedTitle}正文配图`,
    storage: "indexeddb",
    originalName: file.name,
    createdAt,
  };
  if (!slot.taskIds.includes(taskId)) slot.taskIds.unshift(taskId);
  slot.selectedAssetId = assetId;
  slot.adoptionSnapshot = {
    assetId,
    briefSnapshot: String(slot.prompt || ""),
    titleSnapshot: String(draft.selectedTitle || ""),
    acceptedAt: createdAt,
  };
  draft.dirty = true;
  invalidateDraftHandoff(draft);
  persistWorkspace();
  renderImageStudio(draft);
  updateWriterChrome();
  showToast(role === "cover" ? "封面图已导入并采用" : "正文配图已导入并采用");
}

const DEFAULT_GZH_THEME = "观澜判断感 / 观澜蓝内参风";
const INLINE_IMAGE_MARKER = "[[INLINE_IMAGE_1]]";
const DEFAULT_GZH_LAYOUT_OPTIONS = Object.freeze({
  sectionNumbers: true,
  outline: true,
  quoteCard: true,
  keywordEmphasis: true,
  richLists: true,
});

function normalizeGzhLayoutOptions(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(Object.keys(DEFAULT_GZH_LAYOUT_OPTIONS).map((key) => [key, source[key] !== false]));
}

function currentGzhLayoutOptions() {
  const options = {};
  document.querySelectorAll("[data-gzh-feature]").forEach((input) => {
    options[input.dataset.gzhFeature] = input.checked;
  });
  return normalizeGzhLayoutOptions(options);
}

function applyGzhLayoutOptions(value) {
  const options = normalizeGzhLayoutOptions(value);
  document.querySelectorAll("[data-gzh-feature]").forEach((input) => {
    input.checked = options[input.dataset.gzhFeature];
  });
}

function gzhThemePalette(theme) {
  const palettes = {
    "观澜判断感 / 观澜蓝内参风": { ink: "#0B1F33", text: "#445569", accent: "#0D355C", highlight: "#C99D4E", soft: "#EAF2F8", line: "#D9E1E8", underline: "#8AB8D8", fontSize: 15, contentMargin: "0 10px" },
    "石墨极简风": { ink: "#27272A", text: "#52525B", accent: "#52525B", highlight: "#F97316", soft: "#FAFAFA", line: "#E4E4E7", underline: "#52525B", fontSize: 15, contentMargin: "0 10px" },
    "橄榄手记": { ink: "#23251D", text: "#4D4F46", accent: "#1E1F23", highlight: "#ED7B2F", soft: "#EEEFE9", line: "#BFC1B7", underline: "#ED7B2F", fontSize: 14, contentMargin: "0 8px" },
    "红白色系": { ink: "#1C1917", text: "#374151", accent: "#DC2626", highlight: "#991B1B", soft: "#FEF2F2", line: "#E5E7EB", underline: "#FECACA", fontSize: 15, contentMargin: "0 10px" },
    "摸鱼绿": { ink: "#111827", text: "#374151", accent: "#059669", highlight: "#10B981", soft: "#ECFDF5", line: "#D1D5DB", underline: "#A7F3D0", fontSize: 14, contentMargin: "0 20px" },
    "留白禅意风": { ink: "#2B2B2B", text: "#525252", accent: "#4A5D52", highlight: "#3D5046", soft: "#EEF3F0", line: "#E8E8E8", underline: "#B5C8BC", fontSize: 15, contentMargin: "0 16px" },
    "摸鱼票据风": { ink: "#1A1A1A", text: "#555555", accent: "#059669", highlight: "#1A1A1A", soft: "#F0FDF4", line: "#A7F3D0", underline: "#A7F3D0", fontSize: 14, contentMargin: "0 20px" },
  };
  return palettes[theme] || palettes[DEFAULT_GZH_THEME];
}

function normalizeGzhHeadingText(value) {
  return String(value || "")
    .trim()
    .replace(/^(?:\*\*|__)(.+?)(?:\*\*|__)$/, "$1")
    .replace(/^#{1,6}\s+/, "")
    .replace(/^(?:第[零〇一二三四五六七八九十百两\d]+[章节部分篇]|[（(][零〇一二三四五六七八九十百两\d]{1,3}[）)]|(?:(?:方向|观点|路径|阶段|要点|问题|判断|步骤|方法|场景)[零〇一二三四五六七八九十百两\d]+|第[零〇一二三四五六七八九十百两\d]+|[零〇一二三四五六七八九十百两]+)[、，,.．:：｜|/／-]|PART\s+\d+[:：.]?)\s*/i, "")
    .replace(/[：:；;。]+$/, "")
    .trim();
}

function explicitGzhHeading(line) {
  const markdown = line.match(/^#{2,6}\s+(.+)/);
  if (markdown) return normalizeGzhHeadingText(markdown[1]);
  const bold = line.match(/^(?:\*\*|__)(.+?)(?:\*\*|__)$/);
  if (bold && bold[1].trim().length <= 42) return normalizeGzhHeadingText(bold[1]);
  const bracketed = line.match(/^【(.{2,42})】$/);
  if (bracketed) return normalizeGzhHeadingText(bracketed[1]);
  const labeled = line.match(/^(?:小标题|要点|结论|判断|方法|案例|风险|机会|背景|现状|原因|影响|建议|下一步)\s*[:：]\s*(.{2,42})$/);
  if (labeled) return normalizeGzhHeadingText(labeled[1]);
  const numbered = line.match(/^(?:第[零〇一二三四五六七八九十百两\d]+[章节部分篇]|[（(][零〇一二三四五六七八九十百两\d]{1,3}[）)]|PART\s+\d+[:：.]?)\s*(.+)$/i);
  return numbered ? normalizeGzhHeadingText(numbered[1]) : "";
}

function nearestNonEmptyGzhLineIndex(lines, lineIndex, direction) {
  for (let index = lineIndex + direction; index >= 0 && index < lines.length; index += direction) {
    if (String(lines[index] || "").trim()) return index;
  }
  return -1;
}

function nearestNonEmptyGzhLine(lines, lineIndex, direction) {
  const index = nearestNonEmptyGzhLineIndex(lines, lineIndex, direction);
  return index >= 0 ? String(lines[index] || "").trim() : "";
}

function chineseGzhSequenceMarker(line) {
  const match = String(line || "").trim().match(/^((?:方向|观点|路径|阶段|要点|问题|判断|步骤|方法|场景)[零〇一二三四五六七八九十百两\d]+|第[零〇一二三四五六七八九十百两\d]+|[零〇一二三四五六七八九十百两]+)\s*[、，,.．:：｜|/／-]?$/);
  return match ? match[1] : "";
}

function chineseNumberedGzhHeading(line, lines, lineIndex) {
  const pattern = /^((?:方向|观点|路径|阶段|要点|问题|判断|步骤|方法|场景)[零〇一二三四五六七八九十百两\d]+|第[零〇一二三四五六七八九十百两\d]+|[零〇一二三四五六七八九十百两]+)(?:\s*[、，,.．:：｜|/／-]\s*|\s{1,3})(.{2,42})$/;
  const match = String(line || "").trim().match(pattern);
  if (!match || /[。！？!?；;]$/.test(match[2].trim())) return "";
  const previous = nearestNonEmptyGzhLine(lines, lineIndex, -1);
  const next = nearestNonEmptyGzhLine(lines, lineIndex, 1);
  const semanticSequence = /^(?:方向|观点|路径|阶段|要点|问题|判断|步骤|方法|场景)/.test(match[1]);
  if (!semanticSequence && (pattern.test(previous) || pattern.test(next))) return "";
  return normalizeGzhHeadingText(match[2]);
}

function pairedChineseGzhHeading(lines, lineIndex) {
  const current = String(lines[lineIndex] || "").trim();
  if (current.length < 2 || current.length > 42 || /[。！？!?；;]$/.test(current)) return "";
  if (chineseGzhSequenceMarker(current) || /^(?:[-*+]|>|!\[|\[|https?:\/\/)/.test(current)) return "";
  const previousIndex = nearestNonEmptyGzhLineIndex(lines, lineIndex, -1);
  if (previousIndex < 0 || !chineseGzhSequenceMarker(lines[previousIndex])) return "";
  const nextIndex = nearestNonEmptyGzhLineIndex(lines, lineIndex, 1);
  if (nextIndex < 0) return "";
  const next = String(lines[nextIndex] || "").trim();
  const bodyLike = next.length >= Math.max(20, current.length + 7) || /[。！？!?；;]$/.test(next);
  return bodyLike ? normalizeGzhHeadingText(current) : "";
}

function standaloneChineseGzhMarkerHeading(lines, lineIndex) {
  const marker = chineseGzhSequenceMarker(lines[lineIndex]);
  if (!marker) return "";
  const nextIndex = nearestNonEmptyGzhLineIndex(lines, lineIndex, 1);
  if (nextIndex < 0 || pairedChineseGzhHeading(lines, nextIndex)) return "";
  const previous = nearestNonEmptyGzhLine(lines, lineIndex, -1);
  const next = String(lines[nextIndex] || "").trim();
  const previousBlank = lineIndex === 0 || !String(lines[lineIndex - 1] || "").trim();
  const previousSupportsHeading = previousBlank || !previous || /^#\s+/.test(previous) || previous.length >= 20 || /[。！？!?；;]$/.test(previous);
  const nextSupportsHeading = next.length >= 20 || /[。！？!?；;]$/.test(next);
  return previousSupportsHeading && nextSupportsHeading ? marker : "";
}

function arabicGzhHeading(line, lines, lineIndex) {
  const pattern = /^(\d{1,2})(?:\s*[.)）、．:：｜|/／-]\s*|\s{1,3})(.{2,42})$/;
  const match = String(line || "").trim().match(pattern);
  if (!match || /[。！？!?；;]$/.test(match[2].trim())) return "";
  const previous = nearestNonEmptyGzhLine(lines, lineIndex, -1);
  const next = nearestNonEmptyGzhLine(lines, lineIndex, 1);
  if (pattern.test(previous) || pattern.test(next)) return "";
  return normalizeGzhHeadingText(match[2]);
}

function looksLikeStandaloneGzhHeading(line, previousBlank, nextBlank, previousLine = "", nextLine = "") {
  const raw = String(line || "").trim();
  const plain = normalizeGzhHeadingText(line);
  if (plain.length < 2 || plain.length > 30) return false;
  if (/^(?:[-*+]|>|!\[|\[|https?:\/\/|\d{1,2}(?:\s*[.)）、．:：｜|/／-]|\s{1,3})|(?:(?:方向|观点|路径|阶段|要点|问题|判断|步骤|方法|场景)[零〇一二三四五六七八九十百两\d]+|第[零〇一二三四五六七八九十百两\d]+|[零〇一二三四五六七八九十百两]+)(?:\s*[、，,.．:：｜|/／-]|\s{1,3}))/.test(raw)) return false;
  if (/[。！？!?；;]$/.test(raw)) return false;
  if ((plain.match(/[，,]/g) || []).length > 1) return false;
  if (!/[\u3400-\u9fffA-Za-z]/.test(plain)) return false;
  if (previousBlank && nextBlank) return true;

  const previous = String(previousLine || "").trim();
  const next = String(nextLine || "").trim();
  const bodyLike = (value) => value.length >= Math.max(20, raw.length + 7) || /[。！？!?；;]$/.test(value);
  const cue = /^(?:为什么|怎么|如何|关键|真正|先|再|最后|当|从|别|不是|而是|关于|一个|一张|第一|第二|第三|结论|判断|行动|方向|观点|路径|阶段|要点|方法|问题|场景|案例|风险|机会|背景|现状|原因|变化|影响|建议|下一步)/.test(plain);
  const previousSupportsHeading = previousBlank || !previous || /^#\s+/.test(previous) || bodyLike(previous);
  const nextSupportsHeading = nextBlank || !next || bodyLike(next);
  const strongLengthContrast = (previous && previous.length >= raw.length * 1.6) || (next && next.length >= raw.length * 1.6);
  return previousSupportsHeading && nextSupportsHeading && (cue || (plain.length <= 18 && strongLengthContrast));
}

function contextualGzhHeading(lines, lineIndex) {
  const line = String(lines[lineIndex] || "").trim();
  if (!line) return "";
  const explicit = explicitGzhHeading(line);
  if (explicit) return explicit;
  const chineseNumbered = chineseNumberedGzhHeading(line, lines, lineIndex);
  if (chineseNumbered) return chineseNumbered;
  const arabic = arabicGzhHeading(line, lines, lineIndex);
  if (arabic) return arabic;
  const pairedChinese = pairedChineseGzhHeading(lines, lineIndex);
  if (pairedChinese) return pairedChinese;
  const chineseMarker = standaloneChineseGzhMarkerHeading(lines, lineIndex);
  if (chineseMarker) return chineseMarker;
  const previousBlank = lineIndex === 0 || !String(lines[lineIndex - 1] || "").trim();
  const nextBlank = lineIndex === lines.length - 1 || !String(lines[lineIndex + 1] || "").trim();
  const previousLine = nearestNonEmptyGzhLine(lines, lineIndex, -1);
  const nextLine = nearestNonEmptyGzhLine(lines, lineIndex, 1);
  return looksLikeStandaloneGzhHeading(line, previousBlank, nextBlank, previousLine, nextLine)
    ? normalizeGzhHeadingText(line)
    : "";
}

function parseMarkdownForLayout(markdown, fallbackTitle) {
  const lines = String(markdown || "").replace(/\r/g, "").split("\n");
  const blocks = [];
  let title = fallbackTitle || "未命名公众号稿件";
  let listItems = [];
  let listOrdered = false;
  let paragraphLines = [];
  let codeLines = [];
  let codeLanguage = "";
  let tableRows = [];
  let inCodeFence = false;
  const flushList = () => {
    if (listItems.length) blocks.push({ type: "list", ordered: listOrdered, items: listItems.splice(0) });
    listOrdered = false;
  };
  const flushParagraph = () => {
    if (paragraphLines.length) blocks.push({ type: "paragraph", text: paragraphLines.splice(0).join("\n") });
  };
  const flushTable = () => {
    if (!tableRows.length) return;
    const rows = tableRows.splice(0)
      .map((row) => row.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()))
      .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
    if (rows.length) blocks.push({ type: "table", rows });
  };
  const flushText = () => {
    flushParagraph();
    flushList();
    flushTable();
  };

  lines.forEach((rawLine, lineIndex) => {
    const line = rawLine.trim();
    const fence = line.match(/^```\s*([\w+-]*)/);
    if (fence) {
      if (inCodeFence) {
        blocks.push({ type: "code", language: codeLanguage, text: codeLines.join("\n") });
        codeLines = [];
        codeLanguage = "";
        inCodeFence = false;
      } else {
        flushText();
        codeLanguage = fence[1] || "code";
        inCodeFence = true;
      }
      return;
    }
    if (inCodeFence) {
      codeLines.push(rawLine);
      return;
    }
    if (!line) {
      flushText();
      return;
    }
    if (line === INLINE_IMAGE_MARKER) {
      flushText();
      blocks.push({ type: "image-placeholder", role: "inline" });
      return;
    }
    const titleMatch = line.match(/^#\s+(.+)/);
    if (titleMatch) {
      flushText();
      title = titleMatch[1].trim();
      return;
    }
    const markdownHeading = line.match(/^(#{2,6})\s+(.+)/);
    if (markdownHeading) {
      flushText();
      blocks.push({ type: "heading", level: markdownHeading[1].length, text: normalizeGzhHeadingText(markdownHeading[2]) });
      return;
    }
    if (chineseGzhSequenceMarker(line)) {
      const nextIndex = nearestNonEmptyGzhLineIndex(lines, lineIndex, 1);
      if (nextIndex >= 0 && pairedChineseGzhHeading(lines, nextIndex)) {
        flushText();
        return;
      }
    }
    const headingText = contextualGzhHeading(lines, lineIndex);
    if (headingText) {
      flushText();
      blocks.push({ type: "heading", level: 2, text: headingText });
      return;
    }
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)$/);
    if (imageMatch) {
      flushText();
      blocks.push({ type: "image", alt: imageMatch[1].trim(), src: imageMatch[2], title: imageMatch[3] || "", gif: /\.gif(?:[?#]|$)/i.test(imageMatch[2]) });
      return;
    }
    if (/^(?:---+|\*\*\*+|___+)$/.test(line)) {
      flushText();
      blocks.push({ type: "divider" });
      return;
    }
    if (/^\|.*\|$/.test(line)) {
      flushParagraph();
      flushList();
      tableRows.push(line);
      return;
    }
    flushTable();
    const quoteMatch = line.match(/^>\s*(.+)/);
    if (quoteMatch) {
      flushText();
      blocks.push({ type: "quote", text: quoteMatch[1].trim() });
      return;
    }
    const unorderedMatch = line.match(/^[-*+]\s+(.+)/);
    const orderedMatch = line.match(/^\d{1,2}[.)）、．]\s*(.+)/)
      || line.match(/^(?:第[零〇一二三四五六七八九十百两\d]+|[零〇一二三四五六七八九十百两]+)[、，]\s*(.+)/);
    const listMatch = unorderedMatch || orderedMatch;
    if (listMatch) {
      flushParagraph();
      if (listItems.length && listOrdered !== Boolean(orderedMatch)) flushList();
      listOrdered = Boolean(orderedMatch);
      listItems.push(listMatch[1].trim());
      return;
    }
    flushList();
    paragraphLines.push(line);
  });
  if (inCodeFence && codeLines.length) blocks.push({ type: "code", language: codeLanguage, text: codeLines.join("\n") });
  flushText();
  return { title, blocks };
}

function detectGzhArticleType(markdown) {
  const text = String(markdown || "");
  const scores = {
    "教程 / 操作指南": (text.match(/(?:步骤|教程|操作|命令|Prompt|```|首先|然后)/gi) || []).length,
    "盘点 / 工具清单": (text.match(/(?:盘点|清单|工具|测评|推荐|\n\s*(?:[-*]|\d+[.)]))/gi) || []).length,
    "数据复盘 / 报告": (text.match(/(?:报告|数据|增长|下降|同比|环比|\d+(?:\.\d+)?%|融资|市场)/gi) || []).length,
    "案例实战": (text.match(/(?:案例|实战|复盘|客户|项目|交付)/gi) || []).length,
    "生活 / 情感随笔": (text.match(/(?:生活|感受|成长|内心|旅行|习惯|随笔|禅)/gi) || []).length,
    "观点 / 深度分析": (text.match(/(?:判断|观点|意味着|核心|真正|关键|为什么|问题)/gi) || []).length + 1,
  };
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function recommendGzhTheme(markdown) {
  const text = String(markdown || "").replace(/[#*_>`\[\]()!-]/g, " ");
  const matches = (pattern) => (text.match(pattern) || []).length;
  if (matches(/(?:企业|AI|老板|经营|业务|客户|组织|流程)/gi) >= 2) return DEFAULT_GZH_THEME;
  if (matches(/(?:教程|测评|清单|工具|盘点|方法论|步骤)/g) >= 2) return "摸鱼绿";
  if (matches(/(?:工具对比|创意评测|星级|评分)/g) >= 1) return "摸鱼票据风";
  if (matches(/(?:风险|警惕|失败|危机|错误|红线|真相|观点|分析)/g) >= 2) return "红白色系";
  if (matches(/(?:设计|科技评论|专业观点|高端品牌|研究)/g) >= 1) return "石墨极简风";
  if (matches(/(?:内刊|手记|深度评测|案例复盘|系统性)/g) >= 1) return "橄榄手记";
  if (matches(/(?:随笔|思考|内心|宁静|留白|禅)/g) >= 1) return "留白禅意风";
  return DEFAULT_GZH_THEME;
}

function analyzeArticleForLayout(markdown, fallbackTitle) {
  const parsed = parseMarkdownForLayout(markdown, fallbackTitle);
  return {
    title: parsed.title,
    headingCount: parsed.blocks.filter((block) => block.type === "heading").length,
    paragraphCount: parsed.blocks.filter((block) => block.type === "paragraph").length,
    articleType: detectGzhArticleType(markdown),
    wordCount: String(markdown || "").replace(/\s/g, "").length,
    theme: recommendGzhTheme(markdown),
  };
}

function isSafeHttpUrl(value) {
  try {
    const url = new URL(String(value), window.location?.href || "https://example.com/");
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function gzhSectionLabel(text) {
  const value = String(text || "");
  if (/(?:结论|结语|总结|行动|下一步|建议)/.test(value)) return "ACTION";
  if (/(?:风险|警惕|边界|注意|问题)/.test(value)) return "RISK";
  if (/(?:方法|步骤|路径|流程|实操|教程)/.test(value)) return "METHOD";
  if (/(?:案例|实践|复盘)/.test(value)) return "CASE";
  if (/(?:数据|信号|发生|背景|现状|市场)/.test(value)) return "SIGNAL";
  return "JUDGMENT";
}

function pickGzhKeyword(text) {
  const source = String(text || "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/(?:\*\*|__|==|\+\+|`|\*)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (source.length < 6) return "";
  const data = source.match(/(?:\d+(?:\.\d+)?%|\d+(?:\.\d+)?(?:亿|万|千|倍|家|个|天|周|年))/);
  if (data) return data[0];
  const judgment = source.match(/(?:关键|核心|真正|重点|本质|结论|意味着|需要|必须|应该)(?:是|在于|：)?\s*([㐀-鿿A-Za-z0-9 ]{4,15})/);
  if (judgment) return judgment[0].slice(0, 15).trim();
  const quoted = source.match(/[“「『]([^”」』]{4,15})[”」』]/);
  if (quoted) return quoted[1];
  const clause = source.split(/[，。；：！？,;:!?]/).map((item) => item.trim()).find((item) => item.length >= 4 && item.length <= 15);
  if (clause) return clause;
  const first = source.split(/[，。；：！？,;:!?]/)[0].trim();
  return first.length >= 8 ? first.slice(0, 12) : "";
}

function applyGzhKeywordMarkup(text) {
  const source = String(text || "");
  if (/(?:==|\+\+)[^=+]+(?:==|\+\+)/.test(source)) return source;
  const keyword = pickGzhKeyword(source);
  if (!keyword || !source.includes(keyword)) return source;
  return source.replace(keyword, `++${keyword}++`);
}

function renderInlineMarkdown(text, palette = gzhThemePalette(DEFAULT_GZH_THEME), options = {}) {
  const source = options.autoUnderline ? applyGzhKeywordMarkup(text) : String(text || "");
  const token = /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|==([^=]+)==|\+\+([^+]+)\+\+|`([^`]+)`|\*([^*\n]+)\*/g;
  let output = "";
  let cursor = 0;
  let match;
  while ((match = token.exec(source))) {
    output += escapeHtml(source.slice(cursor, match.index));
    if (match[1] !== undefined) {
      output += isSafeHttpUrl(match[2])
        ? `<img src="${escapeHtml(match[2])}" alt="${escapeHtml(match[1])}" style="display:block;max-width:100%;height:auto;margin:18px auto;">`
        : escapeHtml(match[0]);
    } else if (match[3] !== undefined) {
      output += isSafeHttpUrl(match[4])
        ? `<a href="${escapeHtml(match[4])}" style="color:${palette.accent};text-decoration:underline;"><span leaf="">${escapeHtml(match[3])}</span></a>`
        : escapeHtml(match[0]);
    } else if (match[5] !== undefined || match[6] !== undefined) {
      output += `<strong><span leaf="">${escapeHtml(match[5] ?? match[6])}</span></strong>`;
    } else if (match[7] !== undefined || match[8] !== undefined) {
      output += `<span style="border-bottom:2px solid ${palette.underline};font-weight:600;color:${palette.accent};"><span leaf="">${escapeHtml(match[7] ?? match[8])}</span></span>`;
    } else if (match[9] !== undefined) {
      output += `<span style="background:#F1F5F9;color:${palette.accent};padding:1px 6px;border-radius:4px;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:14px;"><span leaf="">${escapeHtml(match[9])}</span></span>`;
    } else {
      output += `<em><span leaf="">${escapeHtml(match[10])}</span></em>`;
    }
    cursor = token.lastIndex;
  }
  output += escapeHtml(source.slice(cursor));
  return output.replace(/\n/g, "<br>");
}

function renderGzhBlock(block, palette, index, headingIndex, theme, context = {}) {
  const options = normalizeGzhLayoutOptions(context.options);
  if (block.type === "image-placeholder") {
    if (context.inlineImageUrl) {
      return `<section style="margin:0 10px 24px;text-align:center;"><span leaf=""><img src="${escapeHtml(context.inlineImageUrl)}" alt="${escapeHtml(context.inlineImageAlt || "正文配图")}" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:4px;"></span></section>`;
    }
    return `<section style="margin:0 10px 24px;padding:30px 20px;border:1.5px dashed ${palette.line};border-radius:10px;background:${palette.soft};text-align:center;"><p style="margin:0 0 8px;font-size:22px;line-height:1;"><span leaf="">🖼</span></p><p style="margin:0;font-size:14px;font-weight:700;color:${palette.text};"><span leaf="">待补正文配图</span></p><p style="margin:7px 0 0;font-size:12px;color:${palette.text};"><span leaf="">复制右侧配图后粘贴到此处，再删除本提示</span></p></section>`;
  }
  if (block.type === "image") {
    if (!isSafeHttpUrl(block.src)) return `<section style="margin:0 10px 24px;padding:24px 18px;border:1.5px dashed ${palette.line};background:${palette.soft};text-align:center;"><p style="margin:0;font-size:13px;color:${palette.text};"><span leaf="">待补图片：${escapeHtml(block.alt || "请替换为可访问的图片 URL")}</span></p></section>`;
    const caption = block.alt ? `<p style="font-size:12px;color:${palette.text};text-align:center;margin:8px 0 24px;"><span leaf="">${block.gif ? "GIF 动图 · " : ""}${escapeHtml(block.alt)}</span></p>` : "";
    return `<section style="margin:0 10px 8px;padding:6px;border:1px solid ${palette.line};border-radius:8px;background:#FFFFFF;"><section style="margin:0;border-radius:4px;overflow:hidden;"><span leaf=""><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span></section></section>${caption}`;
  }
  if (block.type === "code") {
    const lines = String(block.text || "").split("\n").map((line) => line.replace(/^( +)/, (spaces) => "　".repeat(Math.ceil(spaces.length / 2))));
    const code = lines.map((line) => `<p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:#E2E8F0;"><span leaf="">${escapeHtml(line || " ")}</span></p>`).join("");
    return `<section style="margin:0 10px 24px;border-radius:8px;overflow:hidden;background:#1E293B;"><section style="display:flex;align-items:center;padding:9px 14px;background:#0F172A;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF5F56;margin-right:7px;font-size:0;line-height:0;overflow:hidden;"><span leaf="">.</span></span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FFBD2E;margin-right:7px;font-size:0;line-height:0;overflow:hidden;"><span leaf="">.</span></span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27C93F;font-size:0;line-height:0;overflow:hidden;"><span leaf="">.</span></span><span style="margin-left:12px;font-size:12px;color:#64748B;font-family:Consolas,Monaco,monospace;letter-spacing:1px;"><span leaf="">${escapeHtml(block.language || "code")}</span></span></section><section style="padding:11px 14px;">${code}</section></section>`;
  }
  if (block.type === "table") {
    const [header = [], ...rows] = block.rows;
    const head = `<tr>${header.map((cell) => `<th style="padding:10px;border-bottom:2px solid ${palette.accent};text-align:left;color:${palette.ink};"><span leaf="">${renderInlineMarkdown(cell, palette)}</span></th>`).join("")}</tr>`;
    const body = rows.map((row) => `<tr>${row.map((cell) => `<td style="padding:10px;border-bottom:1px solid ${palette.line};color:${palette.text};"><span leaf="">${renderInlineMarkdown(cell, palette)}</span></td>`).join("")}</tr>`).join("");
    return `<table style="width:calc(100% - 20px);margin:0 10px 24px;border-collapse:collapse;font-size:13px;color:${palette.text};">${head}${body}</table>`;
  }
  if (block.type === "divider") {
    return `<section style="margin:34px 10px;border-top:1px solid ${palette.line};font-size:0;line-height:0;"><span leaf=""><br></span></section>`;
  }
  if (block.type === "heading") {
    if ((block.level || 2) >= 3) {
      return `<p style="margin:28px 10px 12px;padding-left:10px;border-left:3px solid ${palette.accent};font-size:16px;line-height:1.5;color:${palette.ink};font-weight:800;"><span leaf="">${renderInlineMarkdown(block.text, palette)}</span></p>`;
    }
    const sectionNumber = String(headingIndex).padStart(2, "0");
    const label = gzhSectionLabel(block.text);
    if (context.isLastMainHeading && /(?:结论|结语|总结|行动|下一步|建议)/.test(block.text)) {
      return `<section style="margin:42px 10px 22px;padding:16px 18px;background:${palette.accent};border-radius:4px;"><p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;color:${palette.highlight};font-weight:700;"><span leaf="">THE NEXT MOVE</span></p><h3 style="margin:0;font-size:20px;line-height:1.45;color:#FFFFFF;font-weight:800;"><span leaf="">${renderInlineMarkdown(block.text, palette)}</span></h3></section>`;
    }
    if (!options.sectionNumbers) {
      return `<section style="margin:42px 10px 20px;padding-top:12px;border-top:1px solid ${palette.line};"><h3 style="margin:0;font-size:20px;line-height:1.5;color:${palette.ink};font-weight:800;"><span leaf="">${renderInlineMarkdown(block.text, palette)}</span></h3></section>`;
    }
    if (theme === DEFAULT_GZH_THEME) {
      return `<section style="margin:42px 10px 22px;padding-top:14px;border-top:1px solid ${palette.line};"><p style="margin:0 0 7px;font-size:11px;letter-spacing:1.5px;color:${palette.highlight};font-weight:700;"><span leaf="">${sectionNumber} / ${label}</span></p><h3 style="margin:0;font-size:20px;line-height:1.45;color:${palette.ink};font-weight:800;"><span leaf="">${renderInlineMarkdown(block.text, palette)}</span></h3></section>`;
    }
    return `<section style="margin:42px 10px 20px;padding-top:12px;border-top:1px solid ${palette.line};"><p style="margin:0 0 6px;font-size:11px;letter-spacing:1.4px;color:${palette.highlight};font-weight:700;"><span leaf="">${sectionNumber} / ${label}</span></p><h3 style="margin:0;font-size:19px;line-height:1.5;color:${palette.ink};font-weight:800;"><span leaf="">${renderInlineMarkdown(block.text, palette)}</span></h3></section>`;
  }
  if (block.type === "list") {
    const renderItem = (item) => renderInlineMarkdown(item, palette, { autoUnderline: options.keywordEmphasis });
    if (!options.richLists) {
      const items = block.items.map((item, itemIndex) => `<p style="margin:0 0 9px;font-size:${palette.fontSize}px;line-height:1.85;color:${palette.text};"><span leaf="">${block.ordered ? `${itemIndex + 1}.` : "•"} ${renderItem(item)}</span></p>`).join("");
      return `<section style="margin:0 10px 22px;">${items}</section>`;
    }
    if (theme === DEFAULT_GZH_THEME) {
      return block.items.map((item, itemIndex) => `<section style="margin:0 10px 14px;padding:14px 16px;background:#FFFFFF;border:1px solid ${palette.line};border-radius:4px;"><p style="margin:0;font-size:${palette.fontSize}px;color:${palette.ink};line-height:1.75;"><span style="color:${palette.highlight};font-weight:800;"><span leaf="">${block.ordered ? String(itemIndex + 1).padStart(2, "0") : "•"}　</span></span><span leaf="">${renderItem(item)}</span></p></section>`).join("");
    }
    const items = block.items.map((item, itemIndex) => `<p style="margin:0 0 9px;font-size:${palette.fontSize}px;line-height:1.85;color:${palette.text};"><span leaf="">${block.ordered ? `${itemIndex + 1}.` : "•"} ${renderItem(item)}</span></p>`).join("");
    return `<section style="margin:0 10px 22px;padding:16px 18px;background:${palette.soft};border:1px solid ${palette.line};border-radius:4px;">${items}</section>`;
  }
  if (block.type === "quote") {
    if (!options.quoteCard) return `<p style="margin:0 10px 20px;font-size:${palette.fontSize}px;line-height:1.9;color:${palette.text};"><span leaf="">“${renderInlineMarkdown(block.text, palette)}”</span></p>`;
    return `<section style="margin:0 10px 24px;padding:18px 20px;border-top:1px solid ${palette.line};border-bottom:1px solid ${palette.line};"><p style="margin:0;font-size:17px;line-height:1.75;color:${palette.ink};font-weight:700;"><span leaf="">“${renderInlineMarkdown(block.text, palette)}”</span></p></section>`;
  }
  if (index === 0 && options.quoteCard) {
    return `<section style="margin:0 10px 32px;padding:22px 20px;background:${palette.soft};"><p style="margin:0 0 10px;font-size:11px;letter-spacing:1.6px;color:${palette.accent};font-weight:700;"><span leaf="">CORE JUDGMENT</span></p><p style="margin:0;font-size:18px;line-height:1.72;color:${palette.ink};font-weight:700;"><span leaf="">${renderInlineMarkdown(block.text, palette, { autoUnderline: options.keywordEmphasis })}</span></p></section>`;
  }
  return `<p style="margin:0 10px 20px;font-size:${palette.fontSize}px;line-height:1.9;text-align:justify;color:${palette.text};"><span leaf="">${renderInlineMarkdown(block.text, palette, { autoUnderline: options.keywordEmphasis })}</span></p>`;
}

function buildGzhHtml(topic, theme) {
  const snapshot = activeLayoutSnapshot();
  const draft = snapshot ? draftsByTopicId[snapshot.topicId] : currentDraft();
  const fallbackTitle = snapshot?.title || draft?.selectedTitle || topic?.articleTitleDraft || topic?.title;
  const markdown = document.querySelector("#layoutMarkdownEditor")?.value || `# ${fallbackTitle}\n\n${snapshot?.markdown || draft?.bodyMarkdown || ""}`;
  const parsed = parseMarkdownForLayout(markdown, fallbackTitle);
  const palette = gzhThemePalette(theme);
  const analysis = analyzeArticleForLayout(markdown, fallbackTitle);
  const layoutOptions = currentGzhLayoutOptions();
  const inlineAsset = layoutSnapshotImageAsset("inline", snapshot);
  const renderContext = {
    inlineImageUrl: inlineAsset && isSafeHttpUrl(inlineAsset.src) ? inlineAsset.src : "",
    inlineImageAlt: inlineAsset?.alt || "正文配图",
  };
  let headingIndex = 0;
  const mainHeadings = parsed.blocks.filter((block) => block.type === "heading" && (block.level || 2) === 2);
  const content = parsed.blocks.map((block, index) => {
    if (block.type === "heading" && (block.level || 2) === 2) headingIndex += 1;
    return renderGzhBlock(block, palette, index, headingIndex, theme, { ...renderContext, options: layoutOptions, isLastMainHeading: headingIndex === mainHeadings.length });
  }).join("\n");
  const guide = layoutOptions.outline && mainHeadings.length >= 3 ? `<section style="margin:0 10px 34px;padding:0 0 4px;border-bottom:1px solid ${palette.line};"><p style="margin:0 0 12px;font-size:12px;color:${palette.accent};font-weight:800;"><span leaf="">你会看到什么</span></p>${mainHeadings.slice(0, 3).map((heading, index) => `<p style="margin:0 0 12px;font-size:14px;color:${palette.text};"><span style="color:${palette.highlight};font-weight:800;"><span leaf="">${String(index + 1).padStart(2, "0")} </span></span><span leaf="">${escapeHtml(heading.text)}</span></p>`).join("")}</section>` : "";
  return `<section style="max-width:677px;margin:0 auto;background:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:${palette.text};line-height:1.85;letter-spacing:0.2px;overflow-x:hidden;">
  ${guide}
  ${content}
  <section style="margin:28px 10px 0;padding:18px 0;border-top:1px solid ${palette.line};">
    <p style="margin:0 0 6px;font-size:14px;color:${palette.ink};font-weight:700;"><span leaf="">我是 {{作者名}}，{{简介}}</span></p>
    <p style="margin:0;font-size:13px;line-height:1.75;color:${palette.text};"><span leaf="">如果你觉得今天这篇有收获，欢迎点赞、在看、转发，我们下篇见。</span></p>
  </section>
</section>`;
}

function parseInlineStyle(style = "") {
  return String(style || "").split(";").reduce((result, item) => {
    const [rawKey, ...rawValue] = item.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rawValue.join(":").trim();
    if (key && value) result[key] = value;
    return result;
  }, {});
}

function serializeInlineStyle(styleMap) {
  return Object.entries(styleMap)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}

function patchInlineStyle(element, patch = {}, remove = []) {
  if (!element) return;
  const styleMap = parseInlineStyle(element.getAttribute("style"));
  remove.forEach((key) => { delete styleMap[key]; });
  Object.entries(patch).forEach(([key, value]) => {
    if (value === null) delete styleMap[key];
    else styleMap[key] = value;
  });
  const nextStyle = serializeInlineStyle(styleMap);
  if (nextStyle) element.setAttribute("style", nextStyle);
  else element.removeAttribute("style");
}

function gzhDocumentFromHtml(html) {
  if (typeof DOMParser === "undefined") return null;
  return new DOMParser().parseFromString(String(html || ""), "text/html");
}

function gzhRootSection(documentNode) {
  return documentNode?.body?.querySelector("section") || null;
}

function gzhTextLeaf(element) {
  return element?.querySelector?.("span[leaf]") || element;
}

function replaceGzhTableWithStack(table, documentNode) {
  const rows = [...table.querySelectorAll("tr")]
    .map((row) => [...row.children].map((cell) => cell.textContent.trim()).filter(Boolean))
    .filter((cells) => cells.length);
  if (!rows.length) return false;
  const headers = rows[0].length > 1 ? rows[0] : [];
  const section = documentNode.createElement("section");
  section.setAttribute("style", "margin:0 10px 22px;padding:14px 16px;background:#F7FAFC;border:1px solid #D9E1E8;border-radius:4px");
  rows.slice(headers.length ? 1 : 0).forEach((cells, rowIndex) => {
    const p = documentNode.createElement("p");
    p.setAttribute("style", `margin:${rowIndex ? "8px" : "0"} 0 0;font-size:14px;line-height:1.75;color:#445569`);
    const span = documentNode.createElement("span");
    span.setAttribute("leaf", "");
    span.textContent = cells.map((cell, cellIndex) => {
      const label = headers[cellIndex] ? `${headers[cellIndex]}：` : "";
      return `${label}${cell}`;
    }).join("；");
    p.appendChild(span);
    section.appendChild(p);
  });
  table.replaceWith(section);
  return true;
}

function applyRemoveHorizontalRevision(documentNode) {
  let changed = 0;
  const root = gzhRootSection(documentNode);
  if (root) {
    patchInlineStyle(root, {
      "max-width": "677px",
      width: "100%",
      "overflow-x": "hidden",
    }, ["min-width"]);
    changed += 1;
  }
  [...documentNode.body.querySelectorAll("table")].forEach((table) => {
    if (replaceGzhTableWithStack(table, documentNode)) changed += 1;
  });
  [...documentNode.body.querySelectorAll("[style]")].forEach((element) => {
    const style = parseInlineStyle(element.getAttribute("style"));
    const remove = [];
    if (/grid|flex/i.test(style.display || "")) remove.push("display");
    if (style["grid-template-columns"]) remove.push("grid-template-columns");
    if (style["white-space"] === "nowrap") remove.push("white-space");
    if (/^\d{3,}px$/.test(style.width || "") || /^\d{3,}px$/.test(style["min-width"] || "")) remove.push("width", "min-width");
    if (remove.length) {
      patchInlineStyle(element, {}, remove);
      changed += 1;
    }
  });
  [...documentNode.body.querySelectorAll("img")].forEach((image) => {
    patchInlineStyle(image, { "max-width": "100%", height: "auto" }, ["width"]);
    changed += 1;
  });
  return changed ? "已结构化去除横向排布" : "未发现明显横向排布";
}

function applyEmphasisRevision(documentNode) {
  const leaves = [...documentNode.body.querySelectorAll("p span[leaf], li span[leaf]")]
    .filter((leaf) => leaf.textContent.trim().length >= 16 && !leaf.closest("strong"));
  const target = leaves.find((leaf) => /(?:老板|关键|真正|不是|而是|必须|应该|核心|第一|AI|企业)/.test(leaf.textContent)) || leaves[0];
  if (!target) return "没有找到适合加粗的正文";
  const source = target.textContent.trim();
  const keyword = pickGzhKeyword(source) || source.slice(0, Math.min(12, source.length));
  if (!keyword) return "没有找到适合加粗的关键词";
  const index = source.indexOf(keyword);
  if (index < 0) return "没有找到适合加粗的关键词";
  const before = source.slice(0, index);
  const after = source.slice(index + keyword.length);
  target.innerHTML = `${escapeHtml(before)}<strong style="color:#0D355C;font-weight:800;"><span leaf="">${escapeHtml(keyword)}</span></strong>${escapeHtml(after)}`;
  return `已加粗重点：${keyword}`;
}

function applyColorBlockRevision(documentNode) {
  const sections = [...documentNode.body.querySelectorAll("section")];
  const target = sections.find((section, index) => index > 0 && section.textContent.trim().length >= 24 && !/作者名/.test(section.textContent))
    || [...documentNode.body.querySelectorAll("blockquote,p")].find((element) => element.textContent.trim().length >= 24);
  if (!target) return "没有找到适合加色块的内容";
  patchInlineStyle(target, {
    margin: "0 10px 24px",
    padding: "18px 20px",
    background: "#EAF2F8",
    border: "1px solid #D9E1E8",
    "border-radius": "4px",
  }, ["border-left", "border-right"]);
  return "已增加克制色块";
}

function applyRemoveColorBlocksRevision(documentNode) {
  let changed = 0;
  [...documentNode.body.querySelectorAll("section,blockquote")].forEach((element, index) => {
    if (index === 0) return;
    const style = parseInlineStyle(element.getAttribute("style"));
    if (style.background || style["background-color"] || style["border-radius"]) {
      patchInlineStyle(element, {}, ["background", "background-color", "border-radius", "box-shadow"]);
      changed += 1;
    }
  });
  return changed ? "已弱化色块" : "未发现可弱化的色块";
}

function applyCompactRevision(documentNode) {
  let changed = 0;
  [...documentNode.body.querySelectorAll("p")].forEach((p) => {
    patchInlineStyle(p, { "line-height": "1.72" });
    changed += 1;
  });
  [...documentNode.body.querySelectorAll("section")].forEach((section, index) => {
    if (index === 0) return;
    const style = parseInlineStyle(section.getAttribute("style"));
    if (style.margin) {
      patchInlineStyle(section, { margin: style.margin.replace(/(?:32|34|42|28)px/g, "22px") });
      changed += 1;
    }
    if (style.padding) {
      patchInlineStyle(section, { padding: style.padding.replace(/(?:22|20|18)px/g, "14px") });
      changed += 1;
    }
  });
  return changed ? "已压缩段落与模块间距" : "没有需要压缩的间距";
}

function applyGzhRevisionOperation(html, operation) {
  const documentNode = gzhDocumentFromHtml(html);
  if (!documentNode) return { html, message: "当前浏览器不支持自动二次排版" };
  const operations = {
    removeHorizontal: applyRemoveHorizontalRevision,
    emphasize: applyEmphasisRevision,
    colorBlock: applyColorBlockRevision,
    removeColorBlocks: applyRemoveColorBlocksRevision,
    compact: applyCompactRevision,
  };
  const handler = operations[operation];
  if (!handler) return { html, message: "未知二次排版操作" };
  const message = handler(documentNode);
  return { html: sanitizePreviewHtml(documentNode.body.innerHTML), message };
}

function importedFileTitle(fileName) {
  return String(fileName || "导入文章")
    .replace(/\.(?:md|markdown|txt|html?|htm)$/i, "")
    .replace(/[-_]+/g, " ")
    .trim() || "导入文章";
}

function htmlInlineToMarkdown(node) {
  if (!node) return "";
  if (node.nodeType === 3) return node.textContent || "";
  if (node.nodeType !== 1) return "";
  const tag = node.tagName.toLowerCase();
  const content = [...node.childNodes].map(htmlInlineToMarkdown).join("");
  if (tag === "strong" || tag === "b") return `**${content.trim()}**`;
  if (tag === "em" || tag === "i") return `*${content.trim()}*`;
  if (tag === "code") return `\`${content.trim()}\``;
  if (tag === "br") return "\n";
  if (tag === "a") {
    const href = node.getAttribute("href");
    return isSafeHttpUrl(href) ? `[${content.trim()}](${href})` : content;
  }
  if (tag === "img") {
    const src = node.getAttribute("src");
    return isSafeHttpUrl(src) ? `![${node.getAttribute("alt") || "正文配图"}](${src})` : "";
  }
  return content;
}

function htmlArticleToMarkdown(source, fallbackTitle) {
  if (typeof DOMParser === "undefined") return { title: fallbackTitle, markdown: source };
  const documentNode = new DOMParser().parseFromString(String(source || ""), "text/html");
  documentNode.querySelectorAll("script,style,iframe,object,embed,form,nav").forEach((element) => element.remove());
  const container = documentNode.querySelector("article,main") || documentNode.body;
  const heading = container.querySelector("h1");
  const title = normalizeGzhHeadingText(heading?.textContent || documentNode.title || fallbackTitle);
  const blocks = [];
  container.querySelectorAll("h1,h2,h3,h4,h5,h6,p,blockquote,ul,ol,img").forEach((element) => {
    const tag = element.tagName.toLowerCase();
    if (element.closest("li") && tag !== "ul" && tag !== "ol") return;
    if (tag === "img" && element.closest("p,blockquote")) return;
    if (tag === "h1") return;
    if (/^h[2-6]$/.test(tag)) {
      const text = normalizeGzhHeadingText(element.textContent);
      if (text) blocks.push(`${"#".repeat(Number(tag.slice(1)))} ${text}`);
      return;
    }
    if (tag === "p") {
      const text = htmlInlineToMarkdown(element).replace(/\s*\n\s*/g, "\n").trim();
      if (text) blocks.push(text);
      return;
    }
    if (tag === "blockquote") {
      const text = htmlInlineToMarkdown(element).trim();
      if (text) blocks.push(text.split("\n").map((line) => `> ${line}`).join("\n"));
      return;
    }
    if (tag === "ul" || tag === "ol") {
      const items = [...element.children].filter((child) => child.tagName?.toLowerCase() === "li");
      const list = items.map((item, index) => `${tag === "ol" ? `${index + 1}.` : "-"} ${htmlInlineToMarkdown(item).trim()}`).filter((item) => !/[-.]\s*$/.test(item));
      if (list.length) blocks.push(list.join("\n"));
      return;
    }
    if (tag === "img") {
      const image = htmlInlineToMarkdown(element);
      if (image) blocks.push(image);
    }
  });
  return { title, markdown: `# ${title}\n\n${blocks.join("\n\n")}`.trim() };
}

function normalizeImportedArticle(source, file, explicitTitle = "") {
  const fallbackTitle = importedFileTitle(file?.name);
  const suppliedTitle = normalizeGzhHeadingText(explicitTitle);
  const raw = String(source || "").replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
  if (!raw) throw new Error("文章内容为空");
  const isHtml = /html/i.test(file?.type || "") || /\.(?:html?|htm)$/i.test(file?.name || "") || /<(?:article|main|h1|h2|p)[\s>]/i.test(raw);
  if (isHtml) {
    const normalized = htmlArticleToMarkdown(raw, fallbackTitle);
    if (!suppliedTitle) return normalized;
    return { title: suppliedTitle, markdown: normalized.markdown.replace(/^#\s+[^\n]+/, `# ${suppliedTitle}`) };
  }

  const lines = raw.split("\n");
  const firstContentIndex = lines.findIndex((line) => line.trim());
  const firstLine = lines[firstContentIndex]?.trim() || "";
  const markdownTitle = firstLine.match(/^#\s+(.+)/);
  const labeledTitle = firstLine.match(/^(?:标题|title)\s*[:：]\s*(.+)$/i);
  const firstLineCanBeTitle = firstLine.length >= 2
    && firstLine.length <= 60
    && !explicitGzhHeading(firstLine)
    && !chineseGzhSequenceMarker(firstLine)
    && !/^(?:[-*+]|>|\d{1,2}(?:\s*[.)）、．:：｜|/／-]|\s{1,3})|(?:(?:方向|观点|路径|阶段|要点|问题|判断|步骤|方法|场景)[零〇一二三四五六七八九十百两\d]+|第[零〇一二三四五六七八九十百两\d]+|[零〇一二三四五六七八九十百两]+)(?:\s*[、，,.．:：｜|/／-]|\s{1,3}))/.test(firstLine);
  const detectedTitle = markdownTitle?.[1] || labeledTitle?.[1] || (firstLineCanBeTitle ? firstLine : fallbackTitle);
  const title = suppliedTitle || normalizeGzhHeadingText(detectedTitle);
  const repeatsSuppliedTitle = suppliedTitle && normalizeGzhHeadingText(firstLine) === suppliedTitle;
  if (markdownTitle || labeledTitle || repeatsSuppliedTitle || (!suppliedTitle && firstLineCanBeTitle)) lines.splice(firstContentIndex, 1);

  let inCodeFence = false;
  const structured = lines.map((rawLine, index) => {
    const line = rawLine.trim();
    if (/^```/.test(line)) {
      inCodeFence = !inCodeFence;
      return rawLine;
    }
    if (inCodeFence) return rawLine;
    if (!line || /^#{2,6}\s+/.test(line)) return rawLine;
    if (chineseGzhSequenceMarker(line)) {
      const nextIndex = nearestNonEmptyGzhLineIndex(lines, index, 1);
      if (nextIndex >= 0 && pairedChineseGzhHeading(lines, nextIndex)) return "";
    }
    const headingText = contextualGzhHeading(lines, index);
    return headingText ? `## ${headingText}` : rawLine;
  }).join("\n").trim();
  return { title, markdown: `# ${title}\n\n${structured}`.trim() };
}

function importedLayoutTopic(snapshot) {
  return {
    id: snapshot?.topicId || "manual-layout",
    title: snapshot?.title || "导入文章",
    articleTitleDraft: snapshot?.title || "导入文章",
  };
}

async function importLayoutArticle(file, { title = "" } = {}) {
  if (!file) return;
  let normalized;
  try {
    normalized = normalizeImportedArticle(await file.text(), file, title);
  } catch (error) {
    showToast(error?.message || "文章导入失败");
    return;
  }
  const createdAt = new Date().toISOString();
  const id = `layout-import-${Date.now()}`;
  const theme = recommendGzhTheme(normalized.markdown);
  const snapshot = {
    id,
    topicId: `manual-${Date.now()}`,
    revision: 1,
    title: normalized.title,
    markdown: normalized.markdown.replace(/^#\s+[^\n]+\n*/, "").trim(),
    imageBrief: "",
    inlineImageBrief: "",
    imageBundle: { coverAssetId: null, inlineAssetIds: [], assets: [], imageBriefSnapshot: { cover: "", inline: [] } },
    createdAt,
    manualImport: true,
    sourceName: file.name,
    layout: { theme, options: normalizeGzhLayoutOptions(), markdown: normalized.markdown, html: "", validation: null, previewed: false, sourceSnapshotId: id },
  };
  const previousSnapshotId = activeLayoutSnapshotId;
  handoffSnapshotsById[id] = snapshot;
  activeLayoutSnapshotId = id;
  if (!persistWorkspace()) {
    delete handoffSnapshotsById[id];
    activeLayoutSnapshotId = previousSnapshotId;
    showToast("本地保存失败，未导入文章");
    return;
  }
  renderLayoutFromDraft({ force: true });
  const html = buildGzhHtml(importedLayoutTopic(snapshot), theme);
  const check = validateGzhHtml(html);
  const analysis = analyzeArticleForLayout(normalized.markdown, normalized.title);
  document.querySelector("#layoutHtmlEditor").value = html;
  commitSnapshotLayout(snapshot, { ...snapshot.layout, html, validation: check });
  showToast(check.valid
    ? (analysis.headingCount > 0 ? `文章已导入，识别 ${analysis.headingCount} 个小标题` : "文章已导入；未识别小标题，可在标题行前加 ##")
    : "文章已导入，请检查排版校验");
}

const GZH_ALLOWED_TAGS = new Set(["section", "p", "h1", "h2", "h3", "h4", "span", "strong", "b", "em", "i", "a", "blockquote", "ul", "ol", "li", "br", "img", "table", "tr", "th", "td", "tbody", "thead"]);
const GZH_REMOVED_TAGS = new Set(["script", "style", "iframe", "object", "embed", "form", "input", "button", "textarea", "select", "template", "svg", "math", "link", "meta"]);

function gzhAttributeAllowed(element, name) {
  if (name === "style") return true;
  if (element.tagName.toLowerCase() === "span" && name === "leaf") return true;
  if (element.tagName.toLowerCase() === "a" && ["href", "title"].includes(name)) return true;
  if (element.tagName.toLowerCase() === "img" && ["src", "alt", "title", "width", "height"].includes(name)) return true;
  return false;
}

function gzhStyleIsSafe(style) {
  return !/(?:position\s*:\s*(?:fixed|absolute|sticky)|float\s*:|display\s*:\s*grid|@(?:media|keyframes|import)|var\s*\(\s*--|expression\s*\(|url\s*\(|behavior\s*:|(?:^|;)\s*--[\w-]+\s*:)/i.test(String(style || ""));
}

function validateGzhHtmlFallback(html) {
  const normalized = String(html)
    .replace(/&#x([0-9a-f]+);?/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);?/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)));
  const errors = [];
  if (/<(?:style|script|div|iframe|object|embed|form|input|button)[\s>]/i.test(normalized)) errors.push("存在禁用标签");
  if (/\s(?:class|id)\s*=/i.test(normalized)) errors.push("存在 class 或 id 属性");
  if (/\son[a-z]+\s*=/i.test(normalized)) errors.push("存在事件属性");
  if (/\s(?:href|src)\s*=\s*["']?\s*(?:javascript|data)\s*:/i.test(normalized)) errors.push("存在危险 URL");
  if (!gzhStyleIsSafe(normalized)) errors.push("存在不安全或不兼容样式");
  if (/<\/?(?:html|head|body)[\s>]/i.test(normalized)) errors.push("产物不应包含整页标签");
  const leafCount = (normalized.match(/<span\s+leaf(?:=|\s|>)/gi) || []).length;
  if (!/^\s*<section[\s>]/i.test(normalized)) errors.push("根节点必须是 section");
  if (leafCount === 0) errors.push("缺少 leaf 文本包裹");
  const warnings = [];
  if (/[㐀-鿿][,;!?]|[㐀-鿿]["']|["'][㐀-鿿]/.test(normalized)) warnings.push("正文存在疑似半角标点或英文引号");
  return { errors: uniqueList(errors), warnings: uniqueList(warnings), errorCount: uniqueList(errors).length, warningCount: uniqueList(warnings).length, leafCount, valid: errors.length === 0 && warnings.length === 0 };
}

function validateGzhHtml(html) {
  if (typeof DOMParser === "undefined") return validateGzhHtmlFallback(html);
  const documentNode = new DOMParser().parseFromString(String(html || ""), "text/html");
  const errors = [];
  const warnings = [];
  const rootElements = [...documentNode.body.children];
  const outsideText = [...documentNode.body.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim());
  if (rootElements.length !== 1 || rootElements[0]?.tagName.toLowerCase() !== "section" || outsideText) errors.push("根节点必须是唯一 section");

  [...documentNode.body.querySelectorAll("*")].forEach((element) => {
    const tag = element.tagName.toLowerCase();
    if (!GZH_ALLOWED_TAGS.has(tag)) errors.push(`存在禁用标签 <${tag}>`);
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on")) {
        errors.push("存在事件属性");
        return;
      }
      if (!gzhAttributeAllowed(element, name)) {
        errors.push(`存在禁用属性 ${name}`);
        return;
      }
      if ((name === "href" || name === "src") && !isSafeHttpUrl(attribute.value)) errors.push("存在危险 URL");
      if (name === "style" && !gzhStyleIsSafe(attribute.value)) errors.push("存在不安全或不兼容样式");
    });
  });
  const leafCount = documentNode.body.querySelectorAll("span[leaf]").length;
  if (leafCount === 0) errors.push("缺少 leaf 文本包裹");
  const inspectText = (node, inLeaf = false, inCode = false) => {
    if (node.nodeType === 3) {
      const text = node.textContent.trim();
      if (!text || !/[\u3400-\u9fff]/.test(text)) return;
      if (!inLeaf) warnings.push(`中文文本未用 <span leaf> 包裹：${text.slice(0, 18)}`);
      if (!inCode && /[㐀-鿿][,;!?]|[㐀-鿿]["']|["'][㐀-鿿]/.test(text)) warnings.push(`疑似半角标点或英文引号：${text.slice(0, 18)}`);
      return;
    }
    if (node.nodeType !== 1) return;
    const element = node;
    const nextLeaf = inLeaf || (element.tagName.toLowerCase() === "span" && element.hasAttribute("leaf"));
    const nextCode = inCode || /monospace|courier|consolas|sf mono/i.test(element.getAttribute("style") || "");
    [...element.childNodes].forEach((child) => inspectText(child, nextLeaf, nextCode));
  };
  [...documentNode.body.childNodes].forEach((node) => inspectText(node));
  const uniqueErrors = uniqueList(errors);
  const uniqueWarnings = uniqueList(warnings);
  return { errors: uniqueErrors, warnings: uniqueWarnings, errorCount: uniqueErrors.length, warningCount: uniqueWarnings.length, leafCount, valid: uniqueErrors.length === 0 && uniqueWarnings.length === 0 };
}

function sanitizePreviewHtml(html) {
  if (typeof DOMParser === "undefined") {
    return String(html)
      .replace(/<(?:script|style|iframe|object|embed|form)[\s\S]*?<\/(?:script|style|iframe|object|embed|form)>/gi, "")
      .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/\s(?:href|src)\s*=\s*(["'])\s*(?:javascript|data)[\s\S]*?\1/gi, "");
  }
  const documentNode = new DOMParser().parseFromString(String(html || ""), "text/html");
  [...documentNode.body.querySelectorAll("*")].forEach((element) => {
    const tag = element.tagName.toLowerCase();
    if (!GZH_ALLOWED_TAGS.has(tag)) {
      if (GZH_REMOVED_TAGS.has(tag)) element.remove();
      else element.replaceWith(...element.childNodes);
      return;
    }
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const unsafeUrl = (name === "href" || name === "src") && !isSafeHttpUrl(attribute.value);
      const unsafeStyle = name === "style" && !gzhStyleIsSafe(attribute.value);
      if (name.startsWith("on") || !gzhAttributeAllowed(element, name) || unsafeUrl || unsafeStyle) element.removeAttribute(attribute.name);
    });
    if (tag === "span" && element.hasAttribute("leaf")) element.setAttribute("leaf", "");
  });
  return documentNode.body.innerHTML;
}

function stripGzhPreviewMasthead(html) {
  if (typeof DOMParser === "undefined") return String(html || "");
  const documentNode = new DOMParser().parseFromString(String(html || ""), "text/html");
  const root = documentNode.body.firstElementChild;
  const firstBlock = root?.tagName.toLowerCase() === "section" ? root.firstElementChild : null;
  const style = firstBlock?.getAttribute("style") || "";
  const isGeneratedMasthead = firstBlock?.tagName.toLowerCase() === "section"
    && Boolean(firstBlock.querySelector("h3"))
    && firstBlock.querySelectorAll("p").length >= 2
    && /border-top\s*:\s*4px\s+solid/i.test(style)
    && /border-bottom\s*:/i.test(style);
  if (isGeneratedMasthead) firstBlock.remove();
  return documentNode.body.innerHTML;
}

function buildPreviewDocument(title, html) {
  const safeHtml = stripGzhPreviewMasthead(sanitizePreviewHtml(html));
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} · 公众号预览</title><style>
    *{box-sizing:border-box}body{margin:0;background:#EEF1F4;color:#243447;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif}.toolbar{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:58px;padding:10px 18px;background:#fff;border-bottom:1px solid #D9E1E8}.toolbar-copy{min-width:0;overflow:hidden;color:#667789;font-size:13px;text-overflow:ellipsis;white-space:nowrap}.toolbar-actions,.tool-group{display:flex;align-items:center;flex-wrap:wrap;gap:7px}.toolbar button,.editor-tools button{border:1px solid #D9E1E8;border-radius:5px;background:#fff;color:#0D355C;font:600 13px/18px inherit;cursor:pointer}.toolbar button{min-height:36px;padding:8px 12px}.toolbar button:hover,.editor-tools button:hover{border-color:#8AB8D8;background:#F5F9FC}.toolbar button:focus-visible,.editor-tools button:focus-visible{outline:2px solid #2F7FB8;outline-offset:2px}.toolbar button.primary{border-color:#0D355C;background:#0D355C;color:#fff}.toolbar button[aria-pressed=true],.editor-tools button[data-applied=true]{border-color:#8AB8D8;background:#EAF2F8}.preview-workspace{min-height:calc(100vh - 58px)}.preview-workspace.has-tools{display:grid;grid-template-columns:minmax(0,1fr) 292px;align-items:start}.editor-tools{display:none}.editor-tools.is-open{display:grid;position:sticky;top:58px;max-height:calc(100vh - 58px);gap:14px;overflow:auto;padding:16px;background:#FAFBFC;border-left:1px solid #D9E1E8}.editor-context{display:grid;gap:4px;padding-bottom:12px;border-bottom:1px solid #D9E1E8}.editor-context strong{color:#0D355C;font-size:13px}.editor-context span{color:#667789;font-size:12px;line-height:1.6}.tool-row{display:grid;gap:16px}.tool-group{align-items:flex-start}.tool-label{width:100%;color:#667789;font-size:11px;font-weight:600}.editor-tools button{min-height:32px;padding:6px 9px;font-size:12px}.editor-tools button.swatch{width:28px;min-width:28px;padding:0;border-color:rgba(13,53,92,.18)}.stage{width:min(100% - 32px,700px);margin:26px auto 70px}.stage-note{margin:16px 0;color:#667789;font-size:12px}#gzhContent[contenteditable=true]{outline:2px solid #8AB8D8;outline-offset:8px;background:rgba(255,255,255,.55)}#gzhContent [data-editor-active=true]{outline:1px dashed #2F7FB8;outline-offset:4px}@media(max-width:900px){.preview-workspace.has-tools{grid-template-columns:minmax(0,1fr) 252px}.toolbar{align-items:flex-start;flex-direction:column}.toolbar-copy{width:100%}}@media(max-width:700px){.preview-workspace.has-tools{display:flex;flex-direction:column}.stage{order:1;margin-top:18px}.editor-tools.is-open{position:relative;top:auto;order:2;width:100%;max-height:none;border-top:1px solid #D9E1E8;border-left:0}.toolbar{position:relative}.toolbar-copy{white-space:normal}}
  </style></head><body><header class="toolbar"><span class="toolbar-copy" id="message" aria-live="polite">已进入编辑模式：点击段落或拖选字词后使用右侧工具。</span><div class="toolbar-actions"><button id="undoButton" type="button" title="暂无可撤销的修改">撤销</button><button id="redoButton" type="button" title="撤销后可恢复修改">恢复</button><button id="copyButton" class="primary" type="button">复制到公众号</button></div></header><div class="preview-workspace has-tools" id="previewWorkspace"><main class="stage"><section id="gzhContent" contenteditable="true" spellcheck="false">${safeHtml}</section><p class="stage-note">当前预览可直接编辑和复制，不会改动 Markdown 原稿。</p></main><aside class="editor-tools is-open" id="editorTools" aria-label="局部二次排版工具"><div class="editor-context"><strong id="selectionStatus">点击正文选择要编辑的段落</strong><span>字词操作优先作用于选区；段落与模块操作作用于当前块。</span></div><div class="tool-row"><div class="tool-group" aria-label="字词样式"><span class="tool-label">字词</span><button type="button" data-inline-op="bold"><strong>B</strong> 粗体</button><button type="button" data-inline-op="italic"><em>I</em> 斜体</button><button type="button" data-inline-op="highlight">浅色强调</button><button type="button" data-inline-op="small">小字</button><button type="button" data-inline-op="large">大字</button><button class="swatch" type="button" data-inline-color="#0D355C" style="background:#0D355C" aria-label="观澜蓝字色" title="观澜蓝"></button><button class="swatch" type="button" data-inline-color="#A5413C" style="background:#A5413C" aria-label="判断红字色" title="判断红"></button><button class="swatch" type="button" data-inline-color="#92742A" style="background:#92742A" aria-label="内参金字色" title="内参金"></button><button type="button" data-inline-op="clear">清除字样式</button></div><div class="tool-group" aria-label="段落样式"><span class="tool-label">段落</span><button type="button" data-block-op="body">正文</button><button type="button" data-block-op="heading">小标题</button><button type="button" data-block-op="quote">引用</button><button type="button" data-block-op="left">左对齐</button><button type="button" data-block-op="center">居中</button><button type="button" data-block-op="right">右对齐</button><button type="button" data-block-op="indent">首行缩进</button><button type="button" data-block-op="noIndent">取消缩进</button></div><div class="tool-group" aria-label="模块样式"><span class="tool-label">模块</span><button type="button" data-block-op="colorBlock">加色块</button><button type="button" data-block-op="removeColor">去色块</button><button type="button" data-block-op="addRule">加横线</button><button type="button" data-block-op="removeRule">清除横线</button><button type="button" data-block-op="compact">紧凑间距</button><button type="button" data-block-op="air">增加留白</button><button type="button" data-block-op="vertical">改为纵向</button></div></div></aside></div><script>
    function parseStyle(style){return String(style||'').split(';').reduce(function(result,item){var parts=item.split(':');var key=(parts.shift()||'').trim().toLowerCase();var value=parts.join(':').trim();if(key&&value)result[key]=value;return result},{})}
    function writeStyle(el,map){var out=Object.keys(map).filter(function(key){return map[key]}).map(function(key){return key+':'+map[key]}).join(';');if(out)el.setAttribute('style',out);else el.removeAttribute('style')}
    function patchStyle(el,patch,remove){var map=parseStyle(el.getAttribute('style'));(remove||[]).forEach(function(key){delete map[key]});Object.keys(patch||{}).forEach(function(key){if(patch[key]===null)delete map[key];else map[key]=patch[key]});writeStyle(el,map)}
    function setMessage(text){document.getElementById('message').textContent=text}
    var content=document.getElementById('gzhContent');var savedRange=null;var activeBlock=null;var history=[content.innerHTML];var historyIndex=0;
    function selectionInside(range){if(!range)return false;var node=range.commonAncestorContainer;return node===content||content.contains(node.nodeType===1?node:node.parentNode)}
    function closestBlock(node){var el=node&&node.nodeType===1?node:node&&node.parentElement;return el&&el.closest?el.closest('p,h1,h2,h3,h4,blockquote,li,table,section'):null}
    function clearActiveMark(){content.querySelectorAll('[data-editor-active]').forEach(function(el){el.removeAttribute('data-editor-active')})}
    function markActiveBlock(){clearActiveMark();if(activeBlock&&activeBlock!==content&&content.contains(activeBlock))activeBlock.setAttribute('data-editor-active','true')}
    function updateSelection(){var selection=window.getSelection();if(!selection||!selection.rangeCount)return;var range=selection.getRangeAt(0);if(!selectionInside(range))return;savedRange=range.cloneRange();activeBlock=closestBlock(range.startContainer);markActiveBlock();var text=selection.toString().trim();var blocks=selectedBlocks();document.getElementById('selectionStatus').textContent=text?'已选 '+text.length+' 个字，段落操作将影响 '+blocks.length+' 个块':'当前：'+blockName(activeBlock)+'（字词样式作用于当前段落）'}
    function blockName(block){if(!block)return'未选择段落';var tag=block.tagName.toLowerCase();if(tag==='table')return'表格模块';if(tag==='section')return'内容模块';if(tag.indexOf('h')===0)return'标题段';if(tag==='blockquote')return'引用段';if(tag==='li')return'列表项';return'正文段'}
    function selectedBlocks(){if(!savedRange||!selectionInside(savedRange))return activeBlock?[activeBlock]:[];var selector='p,h1,h2,h3,h4,blockquote,li,table';var blocks=[].filter.call(content.querySelectorAll(selector),function(el){try{return savedRange.intersectsNode(el)}catch(error){return false}});return blocks.length?blocks:(activeBlock?[activeBlock]:[])}
    function restoreSelection(){if(!savedRange)return false;var selection=window.getSelection();selection.removeAllRanges();selection.addRange(savedRange);return true}
    function updateHistoryButtons(){var canUndo=historyIndex>0;var canRedo=historyIndex<history.length-1;var undo=document.getElementById('undoButton');var redo=document.getElementById('redoButton');undo.dataset.available=String(canUndo);redo.dataset.available=String(canRedo);undo.title=canUndo?'撤销上一次编辑':'暂无可撤销的修改';redo.title=canRedo?'恢复刚刚撤销的修改':'撤销后可恢复修改'}
    function captureContentHtml(){clearActiveMark();var html=content.innerHTML;markActiveBlock();return html}
    function markDirty(message){var html=captureContentHtml();if(history[historyIndex]===html){updateHistoryButtons();setMessage(message);return false}history=history.slice(0,historyIndex+1);history.push(html);historyIndex+=1;updateHistoryButtons();setMessage(message+' · 当前预览已更新');return true}
    function restoreHistory(nextIndex,message){if(nextIndex<0||nextIndex>=history.length)return false;historyIndex=nextIndex;content.innerHTML=history[historyIndex];savedRange=null;activeBlock=null;document.getElementById('selectionStatus').textContent='历史已切换，请重新点击要编辑的段落';updateHistoryButtons();setMessage(message);return true}
    function wrapSelection(tag,style,clearNested){if(!savedRange||savedRange.collapsed||!selectionInside(savedRange))return false;restoreSelection();var range=window.getSelection().getRangeAt(0);var fragment=range.extractContents();if(clearNested){fragment.querySelectorAll('strong,b,em,i').forEach(function(el){el.replaceWith.apply(el,[].slice.call(el.childNodes))});fragment.querySelectorAll('[style]').forEach(function(el){patchStyle(el,{},['color','font-weight','font-size','background','background-color','font-style','text-decoration','padding','border-bottom'])})}var wrapper=document.createElement(tag);if(tag==='span')wrapper.setAttribute('leaf','');wrapper.setAttribute('style',style);wrapper.appendChild(fragment);range.insertNode(wrapper);range.selectNodeContents(wrapper);savedRange=range.cloneRange();window.getSelection().removeAllRanges();window.getSelection().addRange(range);activeBlock=closestBlock(wrapper);markActiveBlock();markDirty('已修改选中字词');return true}
    function leafTargets(block){var leaves=block&&block.querySelectorAll?[].slice.call(block.querySelectorAll('span[leaf]')):[];return leaves.length?leaves:[block]}
    function applyInlineOperation(operation,value){var styles={bold:'font-weight:600',italic:'font-style:italic',highlight:'background:#EAF2F8;padding:1px 3px;border-radius:2px',small:'font-size:14px',large:'font-size:18px',clear:'color:#26394B;font-weight:400;font-size:inherit;background:transparent;font-style:normal;text-decoration:none;padding:0;border-bottom:0'};var style=operation==='color'?'color:'+value:styles[operation];if(savedRange&&!savedRange.collapsed&&selectionInside(savedRange)){wrapSelection(operation==='bold'?'strong':'span',style,operation==='clear');return true}var blocks=selectedBlocks();if(!blocks.length){setMessage('请先在要编辑的段落内点击，或拖选字词');return false}blocks.forEach(function(block){leafTargets(block).forEach(function(el){if(operation==='clear')patchStyle(el,{},['color','font-weight','font-size','background','background-color','font-style','text-decoration','padding','border-bottom','border-radius']);else patchStyle(el,parseStyle(style),[])})});markDirty('已修改 '+blocks.length+' 个当前段落的字词样式');return true}
    function replaceTable(table){var section=document.createElement('section');section.setAttribute('style','margin:0 0 22px;padding:14px 16px;background:#F7FAFC;border:1px solid #D9E1E8;border-radius:4px');table.querySelectorAll('tr').forEach(function(row,index){var text=[].map.call(row.children,function(cell){return cell.textContent.trim()}).filter(Boolean).join('；');if(!text)return;var p=document.createElement('p');p.setAttribute('style','margin:'+(index?'8px':'0')+' 0 0;font-size:14px;line-height:1.75;color:#445569');var span=document.createElement('span');span.setAttribute('leaf','');span.textContent=text;p.appendChild(span);section.appendChild(p)});table.replaceWith(section);activeBlock=section}
    function verticalize(target){var module=target.closest&&target.closest('table,section');if(module&&module.tagName.toLowerCase()==='table'){replaceTable(module);return}module=module&&module!==content?module:target;[module].concat([].slice.call(module.querySelectorAll?module.querySelectorAll('[style]'):[])).forEach(function(el){var style=parseStyle(el.getAttribute('style'));var remove=[];if(/grid|flex/i.test(style.display||''))remove.push('display');if(style['grid-template-columns'])remove.push('grid-template-columns');if(style['white-space']==='nowrap')remove.push('white-space');if(/^\\d{3,}px$/.test(style.width||'')||/^\\d{3,}px$/.test(style['min-width']||''))remove.push('width','min-width');patchStyle(el,{'max-width':'100%'},remove)});if(module.querySelectorAll)module.querySelectorAll('img').forEach(function(img){patchStyle(img,{'max-width':'100%',height:'auto'},['width'])})}
    function setTextTier(block,patch,remove){patchStyle(block,patch,remove);leafTargets(block).forEach(function(el){patchStyle(el,{'font-size':patch['font-size'],'line-height':patch['line-height'],'font-weight':patch['font-weight'],color:patch.color},[])})}
    function removeHorizontalRules(block){var candidates=[block];var section=block.closest&&block.closest('section');var articleRoot=content.querySelector('section');if(section&&section!==articleRoot)candidates.push(section);if(block.querySelectorAll)candidates=candidates.concat([].slice.call(block.querySelectorAll('[style*="border-top"],[style*="border-bottom"]')));var changed=0;Array.from(new Set(candidates)).forEach(function(el){var style=parseStyle(el.getAttribute('style'));if(style['border-top']||style['border-bottom']){patchStyle(el,{},['border-top','border-bottom']);changed+=1}if(el!==articleRoot&&!el.textContent.trim()&&(style['font-size']==='0'||style['line-height']==='0')){el.remove();changed+=1}});return changed}
    function applyBlockOperation(operation){var blocks=selectedBlocks();if(!blocks.length){setMessage('请先在要编辑的段落内点击');return false}var ruleChanges=0;blocks.forEach(function(block){if(operation==='body')setTextTier(block,{'font-size':'16px','line-height':'1.9','font-weight':'400',color:'#26394B','text-align':'left',margin:'0 0 20px'},['padding','background','background-color','border','border-left','border-right','border-radius','box-shadow']);if(operation==='heading')setTextTier(block,{'font-size':'22px','line-height':'1.55','font-weight':'600',color:'#0D355C','text-align':'left',margin:'28px 0 14px'},['padding','background','background-color','border','border-left','border-right','border-radius','box-shadow']);if(operation==='quote')setTextTier(block,{'font-size':'18px','line-height':'1.8','font-weight':'500',color:'#0D355C',margin:'0 0 22px',padding:'16px 18px',background:'#F7FAFC',border:'1px solid #D9E1E8','border-radius':'4px'},['border-left','border-right','box-shadow']);if(operation==='left'||operation==='center'||operation==='right')patchStyle(block,{'text-align':operation},[]);if(operation==='indent')patchStyle(block,{'text-indent':'2em'},[]);if(operation==='noIndent')patchStyle(block,{'text-indent':'0'},[]);if(operation==='colorBlock')patchStyle(block,{margin:'0 0 22px',padding:'16px 18px',background:'#EAF2F8',border:'1px solid #D9E1E8','border-radius':'4px'},['border-left','border-right','box-shadow']);if(operation==='removeColor')patchStyle(block,{},['padding','background','background-color','border','border-left','border-right','border-radius','box-shadow']);if(operation==='addRule')patchStyle(block,{'padding-bottom':'12px','border-bottom':'1px solid #D9E1E8'},[]);if(operation==='removeRule')ruleChanges+=removeHorizontalRules(block);if(operation==='compact')patchStyle(block,{'line-height':'1.72',margin:'0 0 12px'},[]);if(operation==='air')patchStyle(block,{'line-height':'1.9',margin:'0 0 28px'},[]);if(operation==='vertical')verticalize(block)});markActiveBlock();markDirty(operation==='removeRule'?(ruleChanges?'已清除当前模块的横向线':'当前块未发现横向线'):'已修改 '+blocks.length+' 个段落/模块');return true}
    function flashControl(button){button.setAttribute('data-applied','true');window.setTimeout(function(){button.removeAttribute('data-applied')},350)}
    function exportHtml(){return captureContentHtml()}
    document.addEventListener('selectionchange',updateSelection);content.addEventListener('input',function(){markDirty('正文已手工修改')});content.addEventListener('keyup',updateSelection);content.addEventListener('mouseup',updateSelection);
    document.querySelectorAll('#editorTools button').forEach(function(button){button.addEventListener('mousedown',function(event){event.preventDefault()})});
    document.querySelectorAll('[data-inline-op]').forEach(function(button){button.addEventListener('click',function(){if(applyInlineOperation(button.dataset.inlineOp))flashControl(button)})});
    document.querySelectorAll('[data-inline-color]').forEach(function(button){button.addEventListener('click',function(){if(applyInlineOperation('color',button.dataset.inlineColor))flashControl(button)})});
    document.querySelectorAll('[data-block-op]').forEach(function(button){button.addEventListener('click',function(){if(applyBlockOperation(button.dataset.blockOp))flashControl(button)})});
    function runHistory(direction){var isUndo=direction<0;var changed=restoreHistory(historyIndex+direction,isUndo?'已撤销上一次修改':'已恢复刚刚撤销的修改');if(!changed)setMessage(isUndo?'当前还没有可撤销的修改，请先编辑正文。':'当前没有可恢复的修改；先执行撤销后才能恢复。');return changed}
    document.getElementById('undoButton').addEventListener('click',function(){runHistory(-1)});document.getElementById('redoButton').addEventListener('click',function(){runHistory(1)});
    document.addEventListener('keydown',function(event){if(!(event.metaKey||event.ctrlKey)||event.key.toLowerCase()!=='z')return;event.preventDefault();runHistory(event.shiftKey?1:-1)});
    document.getElementById('copyButton').addEventListener('click',async function(){var html=exportHtml();var copied=false;try{if(navigator.clipboard&&window.ClipboardItem){var htmlBlob=new Blob([html],{type:'text/html'});var textBlob=new Blob([content.innerText],{type:'text/plain'});await navigator.clipboard.write([new ClipboardItem({'text/html':htmlBlob,'text/plain':textBlob})]);copied=true}}catch(error){}if(!copied){var range=document.createRange();range.selectNodeContents(content);var selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);try{copied=document.execCommand('copy')}catch(error){}selection.removeAllRanges()}setMessage(copied?'已复制富文本，可直接粘贴到公众号编辑器。':'自动复制未完成，请手动全选预览正文后复制。')});updateHistoryButtons();
  <\/script></body></html>`;
}

function openGzhPreview(topic) {
  const htmlEditor = document.querySelector("#layoutHtmlEditor");
  const theme = document.querySelector("#gzhThemeSelect").value;
  if (!htmlEditor.value || htmlEditor.value.startsWith("等待生成")) {
    htmlEditor.value = buildGzhHtml(topic, theme);
  }
  const check = validateGzhHtml(htmlEditor.value);
  if (!check.valid) return { opened: false, check };
  const snapshot = activeLayoutSnapshot();
  const previewDocument = buildPreviewDocument(snapshot?.title || topic.articleTitleDraft, htmlEditor.value);
  const previewUrl = URL.createObjectURL(new Blob([previewDocument], { type: "text/html;charset=utf-8" }));
  try {
    const previewWindow = window.open(previewUrl, "_blank");
    if (!previewWindow) throw new Error("preview blocked");
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    return { opened: false, blocked: true, check };
  }
  window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60000);
  return { opened: true, check };
}

function captureDraftFromEditor(draft = currentDraft()) {
  if (!draft || isHydratingDraft || hydratedWriterDraftId !== draft.topicId) return draft;
  const value = (selector, fallback = "") => document.querySelector(selector)?.value ?? fallback;
  draft.styleId = value("#styleSelect", draft.styleId || defaultWritingStyleId);
  const selectedStyle = writingStylesById[draft.styleId] || writingStylesById[defaultWritingStyleId];
  draft.style = selectedStyle?.publishedName || selectedStyle?.name || draft.style;
  draft.length = value("#lengthSelect", draft.length);
  draft.painScene = value("#editorPainScene", draft.painScene);
  draft.coreJudgment = value("#editorCoreJudgment", draft.coreJudgment);
  draft.articleGoal = value("#editorArticleGoal", draft.articleGoal);
  draft.notWrite = value("#editorNotWrite", draft.notWrite);
  draft.selectedTitle = value("#selectedTitleEditor", draft.selectedTitle);
  draft.outline = value("#outlineEditor", draft.outline);
  draft.bodyMarkdown = value("#bodyEditor", draft.bodyMarkdown);
  draft.imageBrief = value("#imageEditor", draft.imageBrief);
  draft.inlineImageBrief = value("#inlineImageEditor", draft.inlineImageBrief);
  ensureImagePlan(draft, topics.find((topic) => topic.id === draft.topicId));
  draft.imagePlan.cover.prompt = draft.imageBrief;
  draft.imagePlan.inline[0].prompt = draft.inlineImageBrief;
  draft.currentStep = activeWritingStep;
  return draft;
}

function draftStepContentValidity(draft = currentDraft()) {
  if (!draft) return Object.fromEntries(WRITING_STEPS.map((step) => [step, false]));
  return {
    brief: [draft.painScene, draft.coreJudgment].every((item) => String(item || "").trim().length >= 12),
    title: String(draft.selectedTitle || "").trim().length >= 8,
    outline: String(draft.outline || "").trim().length >= 40,
    body: bodyLengthWithinTarget(draft),
    images: String(draft.imageBrief || "").trim().length >= 30 && String(draft.inlineImageBrief || "").trim().length >= 30,
  };
}

function draftStepCompletion(draft = currentDraft()) {
  const validity = draftStepContentValidity(draft);
  const confirmed = new Set(draft?.confirmedSteps || []);
  return Object.fromEntries(WRITING_STEPS.map((step) => [step, Boolean(validity[step] && confirmed.has(step))]));
}

function invalidateStepConfirmations(draft, step = activeWritingStep) {
  if (!draft || !WRITING_STEPS.includes(step)) return;
  const changedIndex = WRITING_STEPS.indexOf(step);
  draft.confirmedSteps = (draft.confirmedSteps || []).filter((item) => WRITING_STEPS.indexOf(item) < changedIndex);
}

function writerQuality(draft = currentDraft()) {
  if (!draft) return { title: false, judgment: false, boss: false, body: false, images: false, imageAssets: false, imageAssetCount: 0 };
  const body = String(draft.bodyMarkdown || "");
  const firstThree = body.split(/[。！？.!?]/).slice(0, 3).join("");
  const coreKey = String(draft.coreJudgment || "").replace(/\s/g, "").slice(0, 8);
  const imageAssetCount = ["cover", "inline"].filter((role) => Boolean(currentSelectedImageAsset(draft, role))).length;
  return {
    title: String(draft.selectedTitle || "").trim().length >= 8,
    judgment: (coreKey && firstThree.replace(/\s/g, "").includes(coreKey)) || /真正|关键|不是|而是|判断/.test(firstThree),
    boss: /老板|企业|业务|经营/.test(body),
    body: bodyLengthWithinTarget(draft),
    images: String(draft.imageBrief || "").trim().length >= 30 && String(draft.inlineImageBrief || "").trim().length >= 30,
    imageAssets: imageAssetCount === 2,
    imageAssetCount,
  };
}

function updateWriterChrome() {
  const draft = currentDraft();
  const topic = queuedTopic();
  const completion = draftStepCompletion(draft);
  const completedCount = Object.values(completion).filter(Boolean).length;
  const quality = writerQuality(draft);
  const bodyTarget = bodyTargetRange(draft?.length);
  const status = document.querySelector("#editorDraftStatus");
  document.querySelector("#qualityBodyTarget").textContent = `（${bodyTarget.label} 字）`;
  document.querySelector("#qualityTitle").checked = quality.title;
  document.querySelector("#qualityJudgment").checked = quality.judgment;
  document.querySelector("#qualityBoss").checked = quality.boss;
  document.querySelector("#qualityBody").checked = quality.body;
  document.querySelector("#qualityImages").checked = quality.images;
  document.querySelector("#qualityImageAssets").checked = quality.imageAssets;
  document.querySelector("#imageAssetReadiness").textContent = `图片资产 ${quality.imageAssetCount} / 2 已采用（非阻塞）`;
  const requiredQualityCount = [quality.title, quality.judgment, quality.boss, quality.body, quality.images].filter(Boolean).length;
  document.querySelector("#writerFinalCheckSummary").textContent = `${requiredQualityCount} / 5 必需`;
  const styleLabel = document.querySelector("#styleSelect")?.selectedOptions?.[0]?.textContent?.replace(" · 默认", "") || "默认风格";
  const lengthLabel = String(document.querySelector("#lengthSelect")?.value || "中篇").split("/")[0].trim();
  document.querySelector("#writerSettingsSummary").textContent = `${styleLabel} · ${lengthLabel}`;

  if (draft) {
    status.textContent = draft.status === "ready_for_layout" ? "待排版" : `写作中 · ${WRITING_STEP_LABELS[activeWritingStep]}`;
    status.classList.toggle("is-ready", draft.status === "ready_for_layout");
  } else {
    status.textContent = "暂无待写稿件";
    status.classList.remove("is-ready");
  }

  WRITING_STEPS.forEach((step) => {
    const button = document.querySelector(`[data-writing-step="${step}"]`);
    const label = document.querySelector(`#stepStatus${step[0].toUpperCase()}${step.slice(1)}`);
    if (button) button.dataset.complete = String(Boolean(completion[step]));
    if (label) label.textContent = completion[step] ? "已完成" : step === activeWritingStep ? "进行中" : "待完成";
  });

  const disabled = !draft || !topic;
  document.querySelectorAll("#editorPage input:not([type='checkbox']):not(.image-file-input), #editorPage textarea, #editorPage select, #editorPage [data-writing-action], #saveDraftButton, #handoffLayoutButton, #editorPage [data-title-action]").forEach((control) => {
    control.disabled = disabled;
  });
  document.querySelector("#exportImageTasksButton").disabled = disabled;
  const handoffButton = document.querySelector("#handoffLayoutButton");
  if (handoffButton) {
    handoffButton.disabled = disabled || completedCount !== WRITING_STEPS.length;
    handoffButton.textContent = draft?.status === "ready_for_layout" ? "查看排版稿" : "完成写作，进入排版";
  }
  const handoffNote = document.querySelector("#writerHandoffNote");
  if (handoffNote) handoffNote.hidden = activeWritingStep !== "images";
  renderImageStudio(draft);
}

function renderDraftSelect() {
  const select = document.querySelector("#editorDraftSelect");
  if (!select) return;
  const queued = queuedTopics();
  if (queued.length === 0) {
    queuedTopicId = "";
    select.innerHTML = '<option value="">暂无待写稿件</option>';
    select.disabled = true;
    updateWriterChrome();
    return;
  }
  if (!queued.some((topic) => topic.id === queuedTopicId)) queuedTopicId = queued[0].id;
  queued.forEach(ensureDraft);
  select.disabled = false;
  select.innerHTML = queued.map((topic) => {
    const draft = draftsByTopicId[topic.id];
    const suffix = draft?.status === "ready_for_layout" ? "待排版" : WRITING_STEP_LABELS[draft?.currentStep || "brief"];
    return `<option value="${escapeHtml(topic.id)}">${escapeHtml(topic.title)} · ${escapeHtml(suffix)}</option>`;
  }).join("");
  select.value = queuedTopicId;
}

function setWritingStep(step, { focus = false, persist = true } = {}) {
  if (!WRITING_STEPS.includes(step)) return;
  activeWritingStep = step;
  const draft = currentDraft();
  if (draft) draft.currentStep = step;
  document.querySelectorAll("[data-writing-step]").forEach((button) => {
    if (button.dataset.writingStep === step) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-writing-panel]").forEach((panel) => {
    const active = panel.dataset.writingPanel === step;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
  updateWriterChrome();
  if (persist) persistWorkspace();
  if (focus) {
    window.requestAnimationFrame(() => {
      document.querySelector(`[data-writing-panel="${step}"] textarea, [data-writing-panel="${step}"] input`)?.focus();
    });
  }
}

function hydrateWriter({ preserveStep = false } = {}) {
  const topic = queuedTopic();
  const draft = currentDraft();
  renderDraftSelect();
  isHydratingDraft = true;
  if (!topic || !draft) {
    hydratedWriterDraftId = "";
    ["#editorPainScene", "#editorCoreJudgment", "#editorArticleGoal", "#editorNotWrite", "#selectedTitleEditor", "#outlineEditor", "#bodyEditor", "#imageEditor", "#inlineImageEditor"].forEach((selector) => {
      document.querySelector(selector).value = "";
    });
    document.querySelector("#titleOptions").innerHTML = '<div class="topic-empty">暂无标题候选</div>';
    renderImageStudio(null);
    isHydratingDraft = false;
    updateWriterChrome();
    return;
  }

  document.querySelector("#editorDraftSelect").value = topic.id;
  renderPublishedWritingStyles(draft.styleId || draft.style);
  document.querySelector("#styleSelect").value = draft.styleId;
  document.querySelector("#lengthSelect").value = draft.length;
  document.querySelector("#editorPainScene").value = draft.painScene;
  document.querySelector("#editorCoreJudgment").value = draft.coreJudgment;
  document.querySelector("#editorArticleGoal").value = draft.articleGoal;
  document.querySelector("#editorNotWrite").value = draft.notWrite;
  document.querySelector("#selectedTitleEditor").value = draft.selectedTitle;
  document.querySelector("#outlineEditor").value = draft.outline;
  document.querySelector("#bodyEditor").value = draft.bodyMarkdown;
  document.querySelector("#imageEditor").value = draft.imageBrief;
  document.querySelector("#inlineImageEditor").value = draft.inlineImageBrief;
  renderTitleCandidates(topic, draft);
  renderImageStudio(draft);
  hydratedWriterDraftId = draft.topicId;
  isHydratingDraft = false;
  if (!preserveStep && WRITING_STEPS.includes(draft.currentStep)) activeWritingStep = draft.currentStep;
  setWritingStep(activeWritingStep, { persist: false });
}

function saveCurrentDraft({ notify = false, forceRevision = false } = {}) {
  window.clearTimeout(draftAutosaveTimer);
  const draft = captureDraftFromEditor();
  if (!draft) return false;
  const previousRevision = Number(draft.revision || 0);
  const previousUpdatedAt = draft.updatedAt;
  const shouldRevise = draft.dirty || (forceRevision && previousRevision === 0);
  if (shouldRevise) draft.revision = previousRevision + 1;
  draft.dirty = false;
  draft.updatedAt = new Date().toISOString();
  if (!persistWorkspace()) {
    draft.revision = previousRevision;
    draft.updatedAt = previousUpdatedAt;
    draft.dirty = true;
    updateWriterChrome();
    if (notify) showToast("本地保存失败，修改仍保留");
    return false;
  }
  renderDraftSelect();
  updateWriterChrome();
  if (notify) showToast("草稿已保存");
  return true;
}

function confirmWritingStep(step = activeWritingStep, { notify = false } = {}) {
  const draft = captureDraftFromEditor();
  const validity = draftStepContentValidity(draft);
  if (!draft || !validity[step]) {
    showToast(`请先完成${WRITING_STEP_LABELS[step]}`);
    return false;
  }
  if (!draft.confirmedSteps.includes(step)) draft.confirmedSteps.push(step);
  draft.dirty = true;
  const saved = saveCurrentDraft({ notify: false, forceRevision: true });
  if (saved && notify) showToast(`${WRITING_STEP_LABELS[step]}已确认`);
  return saved;
}

function scheduleDraftAutosave() {
  window.clearTimeout(draftAutosaveTimer);
  draftAutosaveTimer = window.setTimeout(() => saveCurrentDraft(), 650);
}

function invalidateDraftHandoff(draft) {
  if (!draft || draft.status !== "ready_for_layout") return;
  draft.status = "drafting";
  draft.handedOffRevision = null;
}

function markDraftDirty(step = activeWritingStep) {
  if (isHydratingDraft) return;
  const draft = captureDraftFromEditor();
  if (!draft) return;
  draft.dirty = true;
  invalidateStepConfirmations(draft, step);
  invalidateDraftHandoff(draft);
  if (step === "title") renderTitleCandidates(queuedTopic(), draft);
  updateWriterChrome();
  scheduleDraftAutosave();
}

function generateWritingTarget(target) {
  const topic = queuedTopic();
  const draft = captureDraftFromEditor();
  if (!topic || !draft) return;
  if (target === "brief") {
    draft.painScene = `老板对${topic.category}的焦虑不是“要不要用 AI”，而是它会先影响收入、成本、效率还是风险。${topic.writingAngles.business}`;
    draft.coreJudgment = topic.opinion;
    draft.articleGoal = `让读者能用一个可验收的小动作开始盘点${topic.category}，而不是继续收集工具清单。`;
    draft.notWrite = "不做新闻搬运，不堆工具名，不夸大结果，不写空泛的 AI 焦虑。";
  }
  if (target === "outline") draft.outline = buildOutlineDraft(topic, draft);
  if (target === "body") draft.bodyMarkdown = buildBodyDraft(topic, draft);
  if (target === "images") {
    const briefs = buildImageBriefs(topic, draft);
    draft.imageBrief = briefs.cover;
    draft.inlineImageBrief = briefs.inline;
    ensureImagePlan(draft, topic);
    draft.imagePlan.cover.prompt = briefs.cover;
    draft.imagePlan.inline[0].prompt = briefs.inline;
  }
  invalidateStepConfirmations(draft, target);
  draft.dirty = true;
  invalidateDraftHandoff(draft);
  hydrateWriter({ preserveStep: true });
  saveCurrentDraft({ forceRevision: true });
  showToast(target === "images" ? "配图 Brief 已生成" : `${WRITING_STEP_LABELS[target]} 已生成`);
}

function rewriteOpening() {
  const topic = queuedTopic();
  const draft = captureDraftFromEditor();
  if (!topic || !draft) return;
  const paragraphs = String(draft.bodyMarkdown || "").split(/\n\s*\n/).filter(Boolean);
  const opening = buildOpeningDraft(topic, draft);
  draft.bodyMarkdown = [opening, ...paragraphs.slice(1)].join("\n\n");
  invalidateStepConfirmations(draft, "body");
  draft.dirty = true;
  invalidateDraftHandoff(draft);
  hydrateWriter({ preserveStep: true });
  saveCurrentDraft({ forceRevision: true });
  showToast("开头已重写");
}

function resetLayoutState() {
  document.querySelector("#layoutHtmlEditor").value = "等待生成 HTML。产物应为纯 section 片段，不包含 html/head/body。";
}

function commitSnapshotLayout(snapshot, nextLayout, failureMessage = "本地保存失败，排版修改已回滚") {
  if (!snapshot) return false;
  const previousLayout = snapshot.layout;
  snapshot.layout = nextLayout;
  if (persistWorkspace()) return true;
  snapshot.layout = previousLayout;
  renderLayoutFromDraft({ force: true });
  showToast(failureMessage);
  return false;
}

function cloneWorkspaceValue(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function sortedPendingPublications() {
  return Object.values(pendingPublicationDraftsById)
    .filter((draft) => draft?.id && draft?.title)
    .sort((a, b) => String(b.updatedAt || b.savedAt || "").localeCompare(String(a.updatedAt || a.savedAt || "")));
}

function currentPendingPublication() {
  const drafts = sortedPendingPublications();
  if (!drafts.some((draft) => draft.id === selectedPendingPublicationId)) selectedPendingPublicationId = drafts[0]?.id || "";
  return pendingPublicationDraftsById[selectedPendingPublicationId] || null;
}

function pendingPublicationImageCount(draft) {
  const bundle = draft?.imageBundle || {};
  return new Set([
    bundle.coverAssetId,
    ...(bundle.inlineAssetIds || []),
    ...(bundle.assets || []).map((asset) => asset?.id),
  ].filter(Boolean)).size;
}

function formatPendingSavedAt(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "已存稿";
  return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}

function pendingPublicationExcerpt(markdown) {
  return String(markdown || "")
    .replace(/^---[\s\S]*?---\s*/m, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/[#>*_`+\[\]()|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
}

function renderPendingPublications() {
  const list = document.querySelector("#pendingPublishList");
  if (!list) return;
  const drafts = sortedPendingPublications();
  const selected = currentPendingPublication();
  document.querySelector("#pendingPublishCount").textContent = `${drafts.length} 篇待发布`;
  list.innerHTML = drafts.length ? drafts.map((draft) => `
    <div class="pending-publish-row${draft.id === selected?.id ? " is-selected" : ""}">
      <button class="pending-publish-select" type="button" data-pending-publication-id="${escapeHtml(draft.id)}">
        <span><strong>${escapeHtml(draft.title)}</strong><small>${escapeHtml(draft.theme || DEFAULT_GZH_THEME)} · ${escapeHtml(formatPendingSavedAt(draft.updatedAt || draft.savedAt))}</small></span>
      </button>
      <em>待发布</em>
      <button class="pending-publish-delete" type="button" data-delete-pending-publication="${escapeHtml(draft.id)}" aria-label="删除待发布稿件《${escapeHtml(draft.title)}》" title="删除稿件">删除</button>
    </div>
  `).join("") : '<p class="pending-publish-list-empty">暂无待发布稿件</p>';

  const empty = document.querySelector("#pendingPublishEmpty");
  const content = document.querySelector("#pendingPublishDetailContent");
  empty.hidden = Boolean(selected);
  content.hidden = !selected;
  if (!selected) return;

  const source = selected.manualImport
    ? `手动导入 · ${selected.sourceName || "本地文章"}`
    : `写作交接 · v${selected.revision || 1}`;
  const imageCount = pendingPublicationImageCount(selected);
  document.querySelector("#pendingPublishTitle").textContent = selected.title;
  document.querySelector("#pendingPublishMeta").textContent = `${source} · ${selected.status === "pending" ? "待发布" : "稿件"}`;
  document.querySelector("#pendingPublishTheme").textContent = selected.theme || DEFAULT_GZH_THEME;
  document.querySelector("#pendingPublishValidation").textContent = selected.validation?.valid
    ? `0 ERROR · 0 WARNING · ${selected.validation.leafCount || 0} leaf`
    : "需重新校验";
  document.querySelector("#pendingPublishImages").textContent = imageCount ? `${imageCount} 份已交接` : "未交接（非阻塞）";
  document.querySelector("#pendingPublishSavedAt").textContent = formatPendingSavedAt(selected.updatedAt || selected.savedAt);
  document.querySelector("#pendingPublishExcerpt").textContent = pendingPublicationExcerpt(selected.markdown) || "已保存排版 HTML，暂无正文摘要。";
  document.querySelector("#pendingPreviewButton").disabled = !selected.html || !selected.validation?.valid;
}

function deletePendingPublication(id) {
  const draft = pendingPublicationDraftsById[id];
  if (!draft) return false;
  if (!window.confirm(`确定从待发布中删除《${draft.title}》？\n\n公众号写作原稿和排版稿仍会保留。`)) return false;

  const previousDraft = cloneWorkspaceValue(draft);
  const previousSelectedId = selectedPendingPublicationId;
  const sourceSnapshot = handoffSnapshotsById[draft.sourceSnapshotId];
  const previousSourceLayout = cloneWorkspaceValue(sourceSnapshot?.layout);
  delete pendingPublicationDraftsById[id];
  if (sourceSnapshot?.layout?.pendingPublicationId === id) {
    sourceSnapshot.layout = { ...sourceSnapshot.layout };
    delete sourceSnapshot.layout.pendingPublicationId;
  }
  if (selectedPendingPublicationId === id) selectedPendingPublicationId = sortedPendingPublications()[0]?.id || "";

  if (!persistWorkspace()) {
    pendingPublicationDraftsById[id] = previousDraft;
    selectedPendingPublicationId = previousSelectedId;
    if (sourceSnapshot) sourceSnapshot.layout = previousSourceLayout;
    renderPendingPublications();
    showToast("本地保存失败，稿件未删除");
    return false;
  }
  renderPendingPublications();
  showToast("已从待发布中删除稿件");
  return true;
}

function saveLayoutAsPendingPublication() {
  const snapshot = activeLayoutSnapshot();
  const topic = topics.find((item) => item.id === snapshot?.topicId) || (snapshot?.manualImport ? importedLayoutTopic(snapshot) : queuedTopic());
  if (!snapshot || !topic) {
    showToast("请先导入或接收一篇待排版稿件");
    return;
  }
  const theme = document.querySelector("#gzhThemeSelect").value;
  const markdown = document.querySelector("#layoutMarkdownEditor").value;
  const htmlEditor = document.querySelector("#layoutHtmlEditor");
  if (!htmlEditor.value || htmlEditor.value.startsWith("等待生成")) htmlEditor.value = buildGzhHtml(topic, theme);
  const check = validateGzhHtml(htmlEditor.value);
  if (!check.valid) {
    showToast("请先修复排版校验问题");
    return;
  }

  const existing = sortedPendingPublications().find((draft) => draft.sourceSnapshotId === snapshot.id);
  const id = existing?.id || `pending-publication-${Date.now()}`;
  const now = new Date().toISOString();
  const previous = existing ? cloneWorkspaceValue(existing) : null;
  const previousSelectedId = selectedPendingPublicationId;
  const nextLayout = {
    ...(snapshot.layout || {}),
    theme,
    options: currentGzhLayoutOptions(),
    markdown,
    html: htmlEditor.value,
    validation: check,
    sourceSnapshotId: snapshot.id,
    pendingPublicationId: id,
  };
  if (!commitSnapshotLayout(snapshot, nextLayout, "本地保存失败，未能存入待发布")) return;
  pendingPublicationDraftsById[id] = {
    id,
    sourceSnapshotId: snapshot.id,
    topicId: snapshot.topicId,
    title: snapshot.title,
    revision: snapshot.revision,
    manualImport: Boolean(snapshot.manualImport),
    sourceName: snapshot.sourceName || "",
    theme,
    layoutOptions: currentGzhLayoutOptions(),
    markdown,
    html: htmlEditor.value,
    validation: cloneWorkspaceValue(check),
    imageBundle: cloneWorkspaceValue(snapshot.imageBundle || null),
    status: "pending",
    savedAt: existing?.savedAt || now,
    updatedAt: now,
    previewedAt: existing?.previewedAt || null,
  };
  selectedPendingPublicationId = id;
  if (!persistWorkspace()) {
    if (previous) pendingPublicationDraftsById[id] = previous;
    else delete pendingPublicationDraftsById[id];
    selectedPendingPublicationId = previousSelectedId;
    showToast("本地保存失败，未能存入待发布");
    return;
  }
  renderPendingPublications();
  setPage("pending");
  showToast(existing ? "已更新待发布稿件" : "已存入待发布");
}

function continuePendingPublicationLayout() {
  const draft = currentPendingPublication();
  if (!draft) return;
  if (!handoffSnapshotsById[draft.sourceSnapshotId]) {
    handoffSnapshotsById[draft.sourceSnapshotId] = {
      id: draft.sourceSnapshotId,
      topicId: draft.topicId,
      revision: draft.revision || 1,
      title: draft.title,
      markdown: draft.markdown.replace(/^#\s+[^\n]+\n*/, "").trim(),
      manualImport: draft.manualImport,
      sourceName: draft.sourceName,
      imageBundle: cloneWorkspaceValue(draft.imageBundle),
      createdAt: draft.savedAt,
      layout: {
        theme: draft.theme,
        options: normalizeGzhLayoutOptions(draft.layoutOptions),
        markdown: draft.markdown,
        html: draft.html,
        validation: cloneWorkspaceValue(draft.validation),
        sourceSnapshotId: draft.sourceSnapshotId,
        pendingPublicationId: draft.id,
      },
    };
  }
  activeLayoutSnapshotId = draft.sourceSnapshotId;
  persistWorkspace();
  setPage("layout");
  renderLayoutFromDraft({ force: true });
  showToast("已打开待发布稿件的排版版本");
}

function openPendingPublicationPreview() {
  const draft = currentPendingPublication();
  if (!draft) return;
  const check = validateGzhHtml(draft.html);
  if (!check.valid) {
    draft.validation = check;
    persistWorkspace();
    renderPendingPublications();
    showToast("稿件校验失效，请返回排版修复");
    return;
  }
  const previewDocument = buildPreviewDocument(draft.title, draft.html);
  const previewUrl = URL.createObjectURL(new Blob([previewDocument], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = previewUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60000);
  draft.previewedAt = new Date().toISOString();
  draft.updatedAt = draft.previewedAt;
  persistWorkspace();
  renderPendingPublications();
  showToast("预览已打开，可复制到公众号");
}

async function copyPlainText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (error) {
      // Fall through to the local selection fallback.
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }
  textarea.remove();
  return copied;
}

function layoutSnapshotImageAsset(role, snapshot = activeLayoutSnapshot()) {
  const assetId = role === "cover"
    ? snapshot?.imageBundle?.coverAssetId
    : snapshot?.imageBundle?.inlineAssetIds?.[0];
  if (!assetId) return null;
  return snapshot?.imageBundle?.assets?.find((asset) => asset.id === assetId)
    || imageAssetsById[assetId]
    || null;
}

function renderLayoutFromDraft({ force = false } = {}) {
  ensureLegacyHandoffSnapshots();
  const snapshots = sortedHandoffSnapshots();
  if (!snapshots.some((snapshot) => snapshot.id === activeLayoutSnapshotId)) activeLayoutSnapshotId = snapshots[0]?.id || "";
  const snapshot = activeLayoutSnapshot();
  const markdownEditor = document.querySelector("#layoutMarkdownEditor");
  const draftSelect = document.querySelector("#layoutDraftSelect");
  const layoutButtons = document.querySelectorAll("[data-gzh-action]");
  draftSelect.innerHTML = snapshots.length
    ? snapshots.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(layoutSnapshotTitle(item))}</option>`).join("")
    : '<option value="">暂无文章</option>';
  draftSelect.value = activeLayoutSnapshotId;
  draftSelect.disabled = snapshots.length === 0;
  layoutButtons.forEach((button) => { button.disabled = !snapshot; });
  document.querySelectorAll("[data-gzh-feature]").forEach((input) => { input.disabled = !snapshot; });
  document.querySelectorAll("[data-save-pending-publication]").forEach((button) => { button.disabled = !snapshot; });
  document.querySelector("#gzhThemeSelect").disabled = !snapshot;
  markdownEditor.disabled = !snapshot;
  document.querySelector("#layoutHtmlEditor").disabled = !snapshot;
  if (!snapshot) {
    applyGzhLayoutOptions(DEFAULT_GZH_LAYOUT_OPTIONS);
    markdownEditor.value = "请先在“公众号写作”完成稿件并提交排版。";
    markdownEditor.dataset.snapshotId = "";
    resetLayoutState("暂无待排版稿件");
    return;
  }
  if (force || markdownEditor.dataset.snapshotId !== snapshot.id) {
    const savedLayout = snapshot.layout;
    markdownEditor.value = savedLayout?.markdown || `# ${snapshot.title}\n\n${snapshot.markdown}`;
    markdownEditor.dataset.snapshotId = snapshot.id;
    markdownEditor.dataset.revision = String(snapshot.revision);
    document.querySelector("#gzhThemeSelect").value = savedLayout?.theme || recommendGzhTheme(markdownEditor.value);
    applyGzhLayoutOptions(savedLayout?.options || DEFAULT_GZH_LAYOUT_OPTIONS);
    if (savedLayout?.html) {
      document.querySelector("#layoutHtmlEditor").value = savedLayout.html;
    } else {
      resetLayoutState(`已接收写作稿 v${snapshot.revision}，等待生成 HTML`);
    }
  }
}

function handoffToLayout() {
  const draft = captureDraftFromEditor();
  if (!draft) return;
  const completion = draftStepCompletion(draft);
  const firstIncomplete = WRITING_STEPS.find((step) => !completion[step]);
  if (firstIncomplete) {
    setWritingStep(firstIncomplete, { focus: true });
    showToast(`请先完成${WRITING_STEP_LABELS[firstIncomplete]}`);
    return;
  }
  const existingSnapshot = sortedHandoffSnapshots().find((snapshot) => snapshot.topicId === draft.topicId && snapshot.revision === draft.handedOffRevision);
  if (draft.status === "ready_for_layout" && existingSnapshot) {
    activeLayoutSnapshotId = existingSnapshot.id;
    renderLayoutFromDraft({ force: true });
    setPage("layout");
    showToast("已打开该版本的排版稿");
    return;
  }
  if (!saveCurrentDraft({ forceRevision: true })) {
    showToast("保存失败，暂时无法交给排版");
    return;
  }
  draft.status = "ready_for_layout";
  draft.handedOffRevision = draft.revision;
  draft.updatedAt = new Date().toISOString();
  const previousActiveSnapshotId = activeLayoutSnapshotId;
  const snapshot = createHandoffSnapshot(draft);
  activeLayoutSnapshotId = snapshot.id;
  if (!persistWorkspace()) {
    delete handoffSnapshotsById[snapshot.id];
    draft.status = "drafting";
    draft.handedOffRevision = null;
    activeLayoutSnapshotId = previousActiveSnapshotId;
    updateWriterChrome();
    showToast("交接状态保存失败，请重试");
    return;
  }
  renderDraftSelect();
  updateWriterChrome();
  renderLayoutFromDraft({ force: true });
  setPage("layout");
  showToast("写作稿已锁定并交给公众号排版");
}

function renderDateFilter() {
  const dateFilters = document.querySelectorAll(".date-filter-select");
  if (dateFilters.length === 0) return;
  const dates = availableDates();
  if (!dates.includes(selectedDate)) selectedDate = dates[0] || dataBatchDate;
  const options = dates
    .map((date) => `<option value="${escapeHtml(date)}">${escapeHtml(formatDate(date))}</option>`)
    .join("");
  dateFilters.forEach((dateFilter) => {
    dateFilter.innerHTML = options;
    dateFilter.value = selectedDate;
  });
}

function renderLibraryDateFilter() {
  const dateFilter = document.querySelector("#libraryDateFilter");
  if (!dateFilter) return;
  const dates = [...new Set(allLibraryTopics().map(topicDate))].sort((a, b) => b.localeCompare(a));
  if (selectedLibraryDate !== "all" && !dates.includes(selectedLibraryDate)) selectedLibraryDate = "all";
  dateFilter.innerHTML = [
    '<option value="all">全部日期</option>',
    ...dates.map((date) => `<option value="${escapeHtml(date)}">${escapeHtml(formatDate(date))}</option>`),
  ].join("");
  dateFilter.value = selectedLibraryDate;
}

function renderCalendarCoverage() {
  const today = topicLocalDate();
  const visibleJulyTopics = topics.filter((topic) => (
    topicDate(topic).startsWith("2026-07-") && isCurrentOrPastTopicDate(topicDate(topic), today)
  ));
  const counts = visibleJulyTopics.reduce((result, topic) => {
    const date = topicDate(topic);
    result[date] = (result[date] || 0) + 1;
    return result;
  }, {});
  const dates = Object.keys(counts);
  const minimum = dates.length ? Math.min(...Object.values(counts)) : 0;
  const coverage = document.querySelector("#calendarCoverageText");
  if (coverage) coverage.textContent = `截至 ${formatDate(today)} · ${dates.length} 天 · 每天至少 ${minimum} 条 · 共 ${visibleJulyTopics.length} 条`;
  const activeDate = document.querySelector("#observationActiveDate");
  if (activeDate) activeDate.textContent = julyTopicCatalog?.source?.activeDate || "未读取";
}

function syncTopicUi() {
  ensureTopicSelection();
  ensureLibrarySelection();
  renderTopics();
  renderLibrary();
  renderDraftSelect();
  updateWriterChrome();
  updateMetrics();
  renderCalendarCoverage();
}

function reviewMetric(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}

function currentPublication() {
  if (!publicationEntries.some((entry) => entry.id === selectedPublicationId)) {
    selectedPublicationId = [...publicationEntries]
      .sort((a, b) => String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")))[0]?.id || "";
  }
  return publicationEntries.find((entry) => entry.id === selectedPublicationId) || null;
}

function renderReview({ message = "" } = {}) {
  const rows = document.querySelector("#publicationRows");
  if (!rows) return;
  const entries = [...publicationEntries].sort((a, b) => {
    const byDate = String(b.publishedAt || "").localeCompare(String(a.publishedAt || ""));
    return byDate || String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  });
  const selected = currentPublication();
  rows.innerHTML = entries.length ? entries.map((entry) => `
    <div class="table-row${entry.id === selected?.id ? " is-selected" : ""}" role="row" data-publication-row="${escapeHtml(entry.id)}">
      <span>${escapeHtml(entry.title)}</span>
      <span>${escapeHtml(entry.platform || "-")}</span>
      <span>${reviewMetric(entry.reads).toLocaleString("zh-CN")}</span>
      <span>${reviewMetric(entry.saves).toLocaleString("zh-CN")}</span>
      <span>${reviewMetric(entry.comments).toLocaleString("zh-CN")}</span>
      <span>${reviewMetric(entry.leads).toLocaleString("zh-CN")}</span>
      <span><button class="text-button" type="button" data-publication-id="${escapeHtml(entry.id)}">${entry.id === selected?.id ? "复盘中" : "复盘"}</button></span>
    </div>
  `).join("") : '<div class="publication-empty">还没有发布记录，点击右上角录入第一条。</div>';

  const conclusion = document.querySelector("#recapConclusion");
  const meta = document.querySelector("#reviewSelectionMeta");
  const saveButton = document.querySelector("#saveRecapButton");
  if (selected) {
    conclusion.value = selected.recap || "";
    conclusion.disabled = false;
    meta.textContent = `${selected.title} · ${selected.platform || "未标注平台"} · ${selected.publishedAt || "未标注日期"}`;
    saveButton.disabled = false;
  } else {
    conclusion.value = "";
    conclusion.disabled = true;
    meta.textContent = "请先录入一条发布记录。";
    saveButton.disabled = true;
  }
  document.querySelectorAll("[data-review-decision]").forEach((button) => {
    button.disabled = !selected;
    button.classList.toggle("is-selected", button.dataset.reviewDecision === selected?.decision);
  });
  document.querySelector("#reviewSaveState").textContent = message;
}

function openPublicationForm() {
  const form = document.querySelector("#publicationForm");
  if (!form) return;
  if (!form.hidden) {
    form.hidden = true;
    return;
  }
  form.reset();
  const suggestedTitle = sortedHandoffSnapshots()[0]?.title || queuedTopic()?.title || "";
  document.querySelector("#publicationTitle").value = suggestedTitle;
  document.querySelector("#publicationDate").value = calendarAsOf;
  form.hidden = false;
  document.querySelector("#publicationTitle").focus();
}

function savePublicationFromForm(event) {
  event.preventDefault();
  const title = document.querySelector("#publicationTitle").value.trim();
  const publishedAt = document.querySelector("#publicationDate").value;
  if (title.length < 4 || !publishedAt) {
    showToast("请补全文章标题和发布日期");
    return;
  }
  const matchingSnapshot = sortedHandoffSnapshots().find((snapshot) => snapshot.title === title);
  const now = new Date().toISOString();
  const entry = {
    id: `publication-${Date.now()}`,
    topicId: matchingSnapshot?.topicId || null,
    title,
    platform: document.querySelector("#publicationPlatform").value,
    publishedAt,
    reads: reviewMetric(document.querySelector("#publicationReads").value),
    saves: reviewMetric(document.querySelector("#publicationSaves").value),
    comments: reviewMetric(document.querySelector("#publicationComments").value),
    leads: reviewMetric(document.querySelector("#publicationLeads").value),
    recap: "",
    decision: "continue",
    createdAt: now,
    updatedAt: now,
  };
  publicationEntries.push(entry);
  selectedPublicationId = entry.id;
  document.querySelector("#publicationForm").hidden = true;
  const saved = persistWorkspace();
  renderReview({ message: saved ? "发布记录已保存" : "本地保存失败" });
  showToast(saved ? "发布数据已录入" : "发布数据未能保存");
}

function savePublicationRecap() {
  const entry = currentPublication();
  if (!entry) return;
  const recap = document.querySelector("#recapConclusion").value.trim();
  const decision = document.querySelector("[data-review-decision].is-selected")?.dataset.reviewDecision;
  if (recap.length < 12) {
    showToast("请至少写 12 个字的复盘结论");
    return;
  }
  if (!REVIEW_DECISION_LABELS[decision]) {
    showToast("请选择下一步动作");
    return;
  }
  entry.recap = recap;
  entry.decision = decision;
  entry.updatedAt = new Date().toISOString();
  const saved = persistWorkspace();
  renderReview({ message: saved ? `已保存 · ${REVIEW_DECISION_LABELS[decision]}` : "本地保存失败" });
  showToast(saved ? "复盘结论已保存" : "复盘结论未能保存");
}

function setPage(page) {
  const previousPage = document.querySelector("[data-page].is-active")?.dataset.page;
  if (previousPage === "editor" && page !== "editor") saveCurrentDraft();
  if (previousPage === "styles" && page !== "styles" && writingStyleDirty) saveWritingStyle({ notify: false });
  document.querySelectorAll("[data-page]").forEach((button) => {
    const active = button.dataset.page === page;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-page-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.pagePanel === page);
  });
  document.querySelector("#pageTitle").textContent = pageTitles[page] || "内容工厂";
  document.querySelector("#pageKicker").textContent = pageKickers[page] || "CONTENT FACTORY";
  document.querySelector(".topbar-actions").classList.toggle("is-hidden", page !== "topics");
  if (page === "styles") renderWritingStyleLab();
  if (page === "library") renderLibrary();
  if (page === "editor") hydrateWriter();
  if (page === "layout") renderLayoutFromDraft();
  if (page === "pending") renderPendingPublications();
  if (page === "review") renderReview();
  persistWorkspace();
}

function setTopicStatus(status, topic = currentTopic()) {
  if (!topic) return;
  const wasQueuedTopic = topic.id === queuedTopicId;
  topic.status = status;
  if (status === "queued") {
    if (!topic.libraryArchivedAt) topic.libraryArchivedAt = new Date().toISOString();
    queuedTopicId = topic.id;
    ensureDraft(topic);
  }
  if (status === "library") {
    if (!topic.libraryArchivedAt) topic.libraryArchivedAt = new Date().toISOString();
    selectedLibraryTopicId = topic.id;
  }
  if (status !== "queued" && wasQueuedTopic) {
    const nextQueuedTopic = topics.find((item) => item.status === "queued");
    queuedTopicId = nextQueuedTopic ? nextQueuedTopic.id : "";
  }
  ensureLibrarySelection();
  syncTopicUi();
  persistWorkspace();
}

function showToast(message) {
  let toast = document.querySelector(".app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "app-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("aria-atomic", "true");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => setPage(button.dataset.page));
});

document.querySelector("#writingStyleList")?.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-writing-style-id]");
  if (deleteButton) {
    deleteWritingStyle(deleteButton.dataset.deleteWritingStyleId);
    return;
  }
  const item = event.target.closest("[data-writing-style-id]");
  if (!item || !writingStylesById[item.dataset.writingStyleId]) return;
  if (writingStyleDirty) saveWritingStyle({ notify: false });
  selectedWritingStyleId = item.dataset.writingStyleId;
  writingStyleDirty = false;
  renderWritingStyleLab();
  persistWorkspace();
});

document.querySelector("#writingStyleSearch")?.addEventListener("input", renderWritingStyleList);

document.querySelectorAll("[data-style-tab]").forEach((button) => {
  button.addEventListener("click", () => setWritingStyleTab(button.dataset.styleTab));
});

[
  "#writingStyleName",
  "#writingStyleDescription",
  "#writingStyleMethod",
  "#writingStyleGuardrails",
  "#writingStyleReference",
  "#writingStylePrompt",
  "#writingStyleOutputRules",
  "#writingStyleTestTopic",
  "#writingStyleTestBrief",
  "#writingStyleTestOutput",
  "#styleJudgmentScore",
  "#styleEvidenceScore",
  "#styleNarrativeScore",
  "#styleActionScore",
].forEach((selector) => {
  document.querySelector(selector)?.addEventListener("input", markWritingStyleDirty);
});

document.querySelector("#newWritingStyleButton")?.addEventListener("click", () => createWritingStyle());
document.querySelector("#saveWritingStyleButton")?.addEventListener("click", () => saveWritingStyle());
document.querySelector("#publishWritingStyleButton")?.addEventListener("click", publishWritingStyle);
document.querySelector("#resetWritingStyleButton")?.addEventListener("click", resetBuiltInWritingStyle);
document.querySelector("#analyzeReferenceButton")?.addEventListener("click", analyzeReferenceCopy);
document.querySelector("#clearReferenceButton")?.addEventListener("click", () => {
  setStyleControlValue("#writingStyleReference", "");
  const report = document.querySelector("#styleExtractionReport");
  if (report) report.innerHTML = '<strong>待提炼</strong><p>将识别句长节奏、开头方式、论证结构、词汇倾向和实用技巧。</p>';
  markWritingStyleDirty();
});
document.querySelector("#buildPromptFromMethodButton")?.addEventListener("click", rebuildPromptFromMethod);
document.querySelector("#runWritingStyleTestButton")?.addEventListener("click", runWritingStyleTest);
document.querySelector("#compareWritingStyleButton")?.addEventListener("click", compareWritingStyleVersions);
document.querySelector("#exportWritingSkillButton")?.addEventListener("click", exportWritingStyleSkill);

document.querySelector("#openWritingStyleInEditorButton")?.addEventListener("click", () => {
  const profile = currentWritingStyle();
  if (!profile || profile.status !== "published") {
    showToast("请先发布这套风格");
    return;
  }
  const draft = currentDraft();
  if (draft) {
    draft.styleId = profile.id;
    draft.style = profile.publishedName || profile.name;
    draft.dirty = true;
  }
  setPage("editor");
  showToast(`公众号写作已引用“${profile.name}”`);
});

document.querySelector("#editWritingStyleButton")?.addEventListener("click", () => {
  const selectedValue = document.querySelector("#styleSelect")?.value;
  const profile = writingStylesById[selectedValue] || writingStyleByName(selectedValue);
  if (profile) selectedWritingStyleId = profile.id;
  setPage("styles");
});

document.querySelectorAll(".date-filter-select").forEach((dateFilter) => {
  dateFilter.addEventListener("change", (event) => {
    selectedDate = event.target.value;
    renderDateFilter();
    ensureTopicSelection();
    ensureLibrarySelection();
    syncTopicUi();
    persistWorkspace();
  });
});

const sidebarToggle = document.querySelector(".sidebar-toggle");

sidebarToggle.addEventListener("click", () => {
  const collapsed = document.body.classList.toggle("sidebar-collapsed");
  sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  sidebarToggle.setAttribute("aria-label", collapsed ? "展开侧边栏" : "收起侧边栏");
  sidebarToggle.textContent = collapsed ? "展开" : "收起侧栏";
});

document.querySelector("#topicList").addEventListener("click", (event) => {
  const row = event.target.closest("[data-topic-id]");
  if (!row) return;
  selectedTopicId = row.dataset.topicId;
  syncTopicUi();
  persistWorkspace();
});

document.querySelector("#topicSearch").addEventListener("input", renderTopics);

document.querySelector("#libraryList").addEventListener("click", (event) => {
  const row = event.target.closest("[data-library-topic-id]");
  if (!row) return;
  selectedLibraryTopicId = row.dataset.libraryTopicId;
  selectedTopicId = row.dataset.libraryTopicId;
  syncTopicUi();
  persistWorkspace();
});

document.querySelector("#librarySearch").addEventListener("input", renderLibrary);

document.querySelector("#libraryStatusFilter").addEventListener("change", (event) => {
  selectedLibraryStatus = event.target.value;
  ensureLibrarySelection();
  renderLibrary();
  persistWorkspace();
});

document.querySelector("#libraryDateFilter").addEventListener("change", (event) => {
  selectedLibraryDate = event.target.value;
  ensureLibrarySelection();
  renderLibrary();
  persistWorkspace();
});

document.querySelector("#editorDraftSelect").addEventListener("change", (event) => {
  saveCurrentDraft();
  queuedTopicId = event.target.value;
  const draft = currentDraft();
  activeWritingStep = WRITING_STEPS.includes(draft?.currentStep) ? draft.currentStep : "brief";
  hydrateWriter();
  persistWorkspace();
});

document.querySelectorAll("[data-writing-step]").forEach((button) => {
  button.addEventListener("click", () => {
    captureDraftFromEditor();
    setWritingStep(button.dataset.writingStep, { focus: true });
  });
});

[
  { selector: "#styleSelect", step: "body" },
  { selector: "#lengthSelect", step: "body" },
  { selector: "#editorPainScene", step: "brief" },
  { selector: "#editorCoreJudgment", step: "brief" },
  { selector: "#editorArticleGoal", step: "brief" },
  { selector: "#editorNotWrite", step: "brief" },
  { selector: "#selectedTitleEditor", step: "title" },
  { selector: "#outlineEditor", step: "outline" },
  { selector: "#bodyEditor", step: "body" },
  { selector: "#imageEditor", step: "images" },
  { selector: "#inlineImageEditor", step: "images" },
].forEach(({ selector, step }) => {
  const control = document.querySelector(selector);
  control?.addEventListener(control.matches("select") ? "change" : "input", () => markDraftDirty(step));
});

document.querySelectorAll("[data-writing-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.writingAction;
    if (action === "generate") {
      generateWritingTarget(button.dataset.writingTarget);
      return;
    }
    if (action === "save") {
      confirmWritingStep(activeWritingStep, { notify: true });
      return;
    }
    if (action === "rewrite-opening") {
      rewriteOpening();
      return;
    }
    if (action === "handoff") {
      handoffToLayout();
      return;
    }
    if (action === "next") {
      if (!confirmWritingStep(activeWritingStep)) return;
      const currentIndex = WRITING_STEPS.indexOf(activeWritingStep);
      const nextStep = WRITING_STEPS[currentIndex + 1];
      if (nextStep) setWritingStep(nextStep, { focus: true });
      else handoffToLayout();
    }
  });
});

document.querySelectorAll("[data-image-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const role = button.dataset.imageRole;
    const action = button.dataset.imageAction;
    if (action === "create-task") createCodexImageTask(role);
    if (action === "adopt") adoptReadyImage(role);
    if (action === "open") openImageAsset(role);
    if (action === "import") document.querySelector(`#${role}ImageFile`)?.click();
  });
});

document.querySelectorAll(".image-file-input").forEach((input) => {
  input.addEventListener("change", async () => {
    const role = input.id.startsWith("cover") ? "cover" : "inline";
    const [file] = input.files || [];
    if (file) await importImageFile(role, file);
    input.value = "";
  });
});

document.querySelector("#exportImageTasksButton").addEventListener("click", exportPendingImageTasks);

document.querySelector("#saveDraftButton").addEventListener("click", () => {
  saveCurrentDraft({ notify: true, forceRevision: true });
});

document.querySelector("#handoffLayoutButton").addEventListener("click", handoffToLayout);

document.querySelector("#titleOptions").addEventListener("click", (event) => {
  const option = event.target.closest("[data-title-index]");
  if (!option) return;
  const topic = queuedTopic();
  const draft = currentDraft();
  const title = draft?.titleCandidates?.[Number(option.dataset.titleIndex)];
  if (!title) return;
  draft.selectedTitle = title;
  invalidateStepConfirmations(draft, "title");
  draft.dirty = true;
  invalidateDraftHandoff(draft);
  document.querySelector("#selectedTitleEditor").value = title;
  renderTitleCandidates(topic, draft);
  updateWriterChrome();
  scheduleDraftAutosave();
  showToast("已选择标题");
});

document.querySelector("#titleOptions").addEventListener("keydown", (event) => {
  if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
  const options = [...event.currentTarget.querySelectorAll("[data-title-index]")];
  if (!options.length) return;
  const currentIndex = Math.max(0, options.indexOf(document.activeElement));
  const nextIndex = event.key === "Home"
    ? 0
    : event.key === "End"
      ? options.length - 1
      : ["ArrowDown", "ArrowRight"].includes(event.key)
        ? (currentIndex + 1) % options.length
        : (currentIndex - 1 + options.length) % options.length;
  event.preventDefault();
  options[nextIndex].click();
  event.currentTarget.querySelector(`[data-title-index="${nextIndex}"]`)?.focus();
});

document.querySelector("[data-title-action='regenerate']").addEventListener("click", () => {
  const topic = queuedTopic();
  const draft = currentDraft();
  if (!topic || !draft) return;
  draft.titleSeed = Number(draft.titleSeed || 0) + 1;
  draft.titleCandidates = buildTitleCandidates(topic, draft);
  invalidateStepConfirmations(draft, "title");
  draft.dirty = true;
  invalidateDraftHandoff(draft);
  renderTitleCandidates(topic, draft);
  updateWriterChrome();
  scheduleDraftAutosave();
  showToast("已重新生成标题候选");
});

document.querySelector("#newPublicationButton")?.addEventListener("click", openPublicationForm);
document.querySelector("#cancelPublicationButton")?.addEventListener("click", () => {
  document.querySelector("#publicationForm").hidden = true;
});
document.querySelector("#publicationForm")?.addEventListener("submit", savePublicationFromForm);
document.querySelector("#publicationRows")?.addEventListener("click", (event) => {
  const row = event.target.closest("[data-publication-row]");
  if (!row) return;
  selectedPublicationId = row.dataset.publicationRow;
  renderReview();
  persistWorkspace();
});
document.querySelector("#reviewDecisionGrid")?.addEventListener("click", (event) => {
  const decision = event.target.closest("[data-review-decision]");
  if (!decision || decision.disabled) return;
  document.querySelectorAll("[data-review-decision]").forEach((button) => {
    button.classList.toggle("is-selected", button === decision);
  });
  document.querySelector("#reviewSaveState").textContent = `待保存 · ${REVIEW_DECISION_LABELS[decision.dataset.reviewDecision]}`;
});
document.querySelector("#saveRecapButton")?.addEventListener("click", savePublicationRecap);

document.querySelector("#pendingPublishList")?.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-pending-publication]");
  if (deleteButton) {
    deletePendingPublication(deleteButton.dataset.deletePendingPublication);
    return;
  }
  const row = event.target.closest("[data-pending-publication-id]");
  if (!row) return;
  selectedPendingPublicationId = row.dataset.pendingPublicationId;
  renderPendingPublications();
  persistWorkspace();
});
document.querySelector("#pendingContinueLayoutButton")?.addEventListener("click", continuePendingPublicationLayout);
document.querySelector("#pendingPreviewButton")?.addEventListener("click", openPendingPublicationPreview);

document.querySelector("#layoutDraftSelect").addEventListener("change", (event) => {
  activeLayoutSnapshotId = event.target.value;
  renderLayoutFromDraft({ force: true });
  persistWorkspace();
});

document.querySelectorAll("[data-save-pending-publication]").forEach((button) => {
  button.addEventListener("click", saveLayoutAsPendingPublication);
});

document.querySelector("#layoutImportButton").addEventListener("click", () => {
  document.querySelector("#layoutArticleFile").click();
});

document.querySelector("#layoutPasteToggleButton").addEventListener("click", (event) => {
  const panel = document.querySelector("#layoutPasteImport");
  panel.open = true;
  event.currentTarget.setAttribute("aria-expanded", "true");
  document.querySelector("#layoutPasteTitle").focus();
});

document.querySelector("#layoutPasteImport").addEventListener("toggle", (event) => {
  document.querySelector("#layoutPasteToggleButton").setAttribute("aria-expanded", String(event.currentTarget.open));
});

document.querySelector("#layoutArticleFile").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  await importLayoutArticle(file);
});

document.querySelector("#layoutPasteEditor").addEventListener("paste", (event) => {
  const html = event.clipboardData?.getData("text/html") || "";
  if (!/<(?:article|main|h[1-6]|p|blockquote|[uo]l)[\s>]/i.test(html)) return;
  const parsed = htmlArticleToMarkdown(html, "粘贴文章");
  const markdown = parsed.markdown.trim();
  if (!markdown || markdown === "# 粘贴文章") return;
  event.preventDefault();
  const titleInput = document.querySelector("#layoutPasteTitle");
  if (!titleInput.value.trim() && parsed.title && parsed.title !== "粘贴文章") titleInput.value = parsed.title;
  const editor = event.currentTarget;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  editor.setRangeText(markdown, start, end, "end");
  editor.dispatchEvent(new Event("input", { bubbles: true }));
});

document.querySelector("#layoutPasteButton").addEventListener("click", async () => {
  const titleInput = document.querySelector("#layoutPasteTitle");
  const editor = document.querySelector("#layoutPasteEditor");
  const title = titleInput.value.trim();
  if (!title) {
    showToast("请先填写文章标题");
    titleInput.focus();
    return;
  }
  const source = editor.value.trim();
  if (!source) {
    showToast("请先粘贴一篇文章");
    editor.focus();
    return;
  }
  await importLayoutArticle(
    { name: "粘贴文章.md", type: "text/markdown", text: async () => source },
    { title },
  );
  titleInput.value = "";
  editor.value = "";
  document.querySelector("#layoutPasteImport").open = false;
  document.querySelector("#layoutPasteToggleButton").setAttribute("aria-expanded", "false");
});

document.querySelector("#gzhThemeSelect").addEventListener("change", () => {
  resetLayoutState("主题已切换，等待生成 HTML");
  const snapshot = activeLayoutSnapshot();
  if (snapshot) {
    const saved = commitSnapshotLayout(snapshot, { theme: document.querySelector("#gzhThemeSelect").value, options: currentGzhLayoutOptions(), markdown: document.querySelector("#layoutMarkdownEditor").value, html: "", validation: null, previewed: false, sourceSnapshotId: snapshot.id });
    if (!saved) return;
  }
  showToast("已切换公众号排版主题");
});

document.querySelectorAll("[data-gzh-feature]").forEach((input) => {
  input.addEventListener("change", () => {
    resetLayoutState("排版要求已更改，请重新生成排版");
    const snapshot = activeLayoutSnapshot();
    if (snapshot) {
      commitSnapshotLayout(snapshot, {
        ...(snapshot.layout || {}),
        theme: document.querySelector("#gzhThemeSelect").value,
        options: currentGzhLayoutOptions(),
        markdown: document.querySelector("#layoutMarkdownEditor").value,
        html: "",
        validation: null,
        previewed: false,
        sourceSnapshotId: snapshot.id,
      });
    }
  });
});

document.querySelector("#layoutMarkdownEditor").addEventListener("input", () => {
  resetLayoutState("Markdown 已修改，请重新生成 HTML");
  const snapshot = activeLayoutSnapshot();
  if (snapshot) {
    commitSnapshotLayout(snapshot, { ...(snapshot.layout || {}), markdown: document.querySelector("#layoutMarkdownEditor").value, html: "", validation: null, previewed: false, sourceSnapshotId: snapshot.id });
  }
});

document.querySelector("#layoutHtmlEditor").addEventListener("input", () => {
  const snapshot = activeLayoutSnapshot();
  if (snapshot) {
    commitSnapshotLayout(snapshot, { ...(snapshot.layout || {}), html: document.querySelector("#layoutHtmlEditor").value, validation: null, previewed: false, sourceSnapshotId: snapshot.id });
  }
});

document.querySelectorAll("[data-gzh-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.gzhAction;
    const snapshot = activeLayoutSnapshot();
    const topic = topics.find((item) => item.id === snapshot?.topicId) || (snapshot?.manualImport ? importedLayoutTopic(snapshot) : queuedTopic());
    if (!snapshot || !topic) {
      showToast("请先从公众号写作提交一篇稿件");
      return;
    }
    const theme = document.querySelector("#gzhThemeSelect").value;
    if (action === "html") {
      const html = buildGzhHtml(topic, theme);
      const analysis = analyzeArticleForLayout(document.querySelector("#layoutMarkdownEditor").value, snapshot.title);
      document.querySelector("#layoutHtmlEditor").value = html;
      if (!commitSnapshotLayout(snapshot, { theme, options: currentGzhLayoutOptions(), markdown: document.querySelector("#layoutMarkdownEditor").value, html, validation: null, previewed: false, sourceSnapshotId: snapshot.id })) return;
      showToast(analysis.headingCount > 0 ? `已自动排版，识别 ${analysis.headingCount} 个小标题` : "未识别小标题，可在标题行前加 ##");
      return;
    }
    if (action === "validate") {
      const htmlEditor = document.querySelector("#layoutHtmlEditor");
      if (!htmlEditor.value || htmlEditor.value.startsWith("等待生成")) {
        htmlEditor.value = buildGzhHtml(topic, theme);
      }
      const check = validateGzhHtml(htmlEditor.value);
      if (!commitSnapshotLayout(snapshot, { theme, options: currentGzhLayoutOptions(), markdown: document.querySelector("#layoutMarkdownEditor").value, html: htmlEditor.value, validation: check, previewed: false, sourceSnapshotId: snapshot.id })) return;
      if (check.valid) {
        showToast("校验通过：0 ERROR");
      } else {
        showToast(`校验未通过：${check.errorCount} ERROR`);
      }
      return;
    }
    if (action === "preview") {
      const result = openGzhPreview(topic);
      if (result.opened) {
        if (!commitSnapshotLayout(snapshot, { ...(snapshot.layout || {}), theme, markdown: document.querySelector("#layoutMarkdownEditor").value, html: document.querySelector("#layoutHtmlEditor").value, validation: result.check, previewed: true, sourceSnapshotId: snapshot.id }, "预览已打开，但排版状态保存失败")) return;
        showToast("预览已打开，可复制到公众号");
      } else if (result.blocked) {
        showToast("浏览器拦截了预览窗口");
      } else {
        showToast("HTML 校验未通过，暂不能预览");
      }
    }
  });
});

document.querySelectorAll("[data-topic-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.topicAction;
    if (action === "queue") {
      setTopicStatus("queued");
      setPage("editor");
      showToast("已放入公众号写作");
      return;
    }
    if (action === "library") {
      setTopicStatus("library");
      setPage("library");
      showToast("已存入选题库");
      return;
    }
    if (action === "skip") {
      setTopicStatus("skipped");
      showToast("已标记为不采用");
    }
  });
});

document.querySelectorAll("[data-library-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const topic = currentLibraryTopic();
    if (!topic) return;
    selectedTopicId = topic.id;
    if (button.dataset.libraryAction === "queue") {
      setTopicStatus("queued", topic);
      setPage("editor");
      showToast("已打开写作稿，选题仍保留在库内");
      return;
    }
    if (button.dataset.libraryAction === "remove") {
      topic.libraryArchivedAt = "";
      if (topic.status === "library") topic.status = "candidate";
      selectedLibraryTopicId = "";
      ensureLibrarySelection();
      syncTopicUi();
      persistWorkspace();
      showToast("已移出选题库");
    }
  });
});

document.querySelector("#importTopicsButton").addEventListener("click", () => {
  const newTopics = importedTopics
    .filter((topic) => !topics.some((item) => item.title === topic.title))
    .map((topic, index) => ({ ...topic, date: selectedDate, id: `topic-import-${Date.now()}-${index}` }));
  topics.push(...newTopics);
  if (newTopics.length > 0) selectedTopicId = newTopics[0].id;
  renderDateFilter();
  syncTopicUi();
  persistWorkspace();
  showToast(newTopics.length > 0 ? `已导入 ${newTopics.length} 条 ${selectedDate} 材料` : `${selectedDate} 材料已导入`);
});

document.querySelector("#newTopicButton").addEventListener("click", () => {
  const title = window.prompt("输入人工选题标题");
  if (!title || !title.trim()) return;
  const topic = {
    id: `topic-manual-${Date.now()}`,
    date: selectedDate,
    score: 70,
    title: title.trim(),
    source: "人工输入",
    category: "人工新增",
    valueTag: "待补充",
    platform: "公众号",
    style: "观澜判断感",
    length: "中篇 / 1800-2400 字",
    status: "candidate",
    worth: "这是人工新增选题，需要在进入写作前补充判断依据。",
    opinion: "先把选题变成一个明确判断，再放入公众号写作。",
    writingAngles: {
      business: "这个选题可以从它对业务结果的影响切入。",
      process: "也可以从一个具体流程卡点切入。",
      organization: "还可以从团队分工、责任和协作方式切入。",
      asset: "最后可以判断它是否能沉淀为方法、模板或长期内容资产。",
    },
    outline: "一、开头：提出问题\n二、中段：拆解判断\n三、案例：补充一个可验证场景\n四、结尾：给出行动建议",
    articleTitleDraft: title.trim(),
    imagePrompt: "封面：观澜蓝标题 + 暖白背景 + 简洁业务桌面元素。",
    layout: "公众号：四段式结构；每段一个判断；结尾给行动建议。",
  };
  topics.unshift(topic);
  selectedTopicId = topic.id;
  syncTopicUi();
  persistWorkspace();
  showToast("已新建人工选题");
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest(".segmented");
    group.querySelectorAll("button").forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
  });
});

window.addEventListener("pagehide", () => {
  const draft = currentDraft();
  if (draft?.dirty && hydratedWriterDraftId === draft.topicId) saveCurrentDraft();
  if (writingStyleDirty) saveWritingStyle({ notify: false });
});

renderPublishedWritingStyles();
renderDateFilter();
syncTopicUi();
setPage(document.querySelector("[data-page].is-active")?.dataset.page || "topics");
if (restoredWorkspace?.version === 2) persistWorkspace();
