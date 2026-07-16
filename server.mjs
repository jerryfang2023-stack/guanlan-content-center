import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-v4-pro";
const MAX_REQUEST_BYTES = 2 * 1024 * 1024;
const MAX_CLI_OUTPUT_BYTES = 2 * 1024 * 1024;

async function loadLocalEnvironment() {
  for (const filename of [".env.local", ".env"]) {
    let source;
    try {
      source = await readFile(resolve(ROOT, filename), "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    source.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1] in process.env) return;
      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value;
    });
  }
}

await loadLocalEnvironment();

const CLAUDE_CLI_PATH = process.env.CLAUDE_CLI_PATH || "claude";
const CLAUDE_AGENT_TIMEOUT_MS = Number(process.env.CLAUDE_AGENT_TIMEOUT_MS || 180000);

function allowedOrigin(origin) {
  if (!origin || origin === "null") return "null";
  try {
    const url = new URL(origin);
    if (["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) return origin;
  } catch {
    return "";
  }
  return "";
}

function corsHeaders(request) {
  const origin = allowedOrigin(request.headers.origin);
  return origin ? {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, X-Content-Factory-Client",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  } : {};
}

function sendJson(response, status, payload, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders,
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_REQUEST_BYTES) {
      const error = new Error("请求内容过大");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    const error = new Error("请求不是有效的 JSON");
    error.status = 400;
    throw error;
  }
}

function cleanText(value, limit = 12000) {
  return String(value || "").trim().slice(0, limit);
}

function runLocalCommand(command, args, { timeoutMs = CLAUDE_AGENT_TIMEOUT_MS } = {}) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      env: { ...process.env, NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });
    let stdout = "";
    let stderr = "";
    let outputBytes = 0;
    let settled = false;
    const finish = (handler, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      handler(value);
    };
    const collect = (target) => (chunk) => {
      outputBytes += chunk.length;
      if (outputBytes > MAX_CLI_OUTPUT_BYTES) {
        child.kill("SIGTERM");
        const error = new Error("Claude CLI 返回内容过大");
        error.status = 502;
        finish(rejectCommand, error);
        return;
      }
      if (target === "stdout") stdout += chunk.toString("utf8");
      else stderr += chunk.toString("utf8");
    };
    child.stdout.on("data", collect("stdout"));
    child.stderr.on("data", collect("stderr"));
    child.on("error", (error) => {
      const wrapped = new Error(error?.code === "ENOENT"
        ? "未找到 Claude CLI，请设置 CLAUDE_CLI_PATH"
        : `无法启动 Claude CLI：${cleanText(error?.message, 300)}`);
      wrapped.status = 503;
      finish(rejectCommand, wrapped);
    });
    child.on("close", (code, signal) => {
      if (settled) return;
      if (code !== 0) {
        const message = cleanText(stderr || stdout, 800);
        const error = new Error(message || `Claude CLI 异常退出（${signal || code}）`);
        error.status = 502;
        finish(rejectCommand, error);
        return;
      }
      finish(resolveCommand, { stdout, stderr });
    });
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 1500).unref();
      const error = new Error("Claude CLI 响应超时，请重试");
      error.status = 504;
      finish(rejectCommand, error);
    }, timeoutMs);
  });
}

let claudeHealthCache = { checkedAt: 0, result: null };

async function claudeCliHealth({ force = false } = {}) {
  if (!force && claudeHealthCache.result && Date.now() - claudeHealthCache.checkedAt < 30000) {
    return claudeHealthCache.result;
  }
  try {
    const { stdout } = await runLocalCommand(CLAUDE_CLI_PATH, ["auth", "status"], { timeoutMs: 8000 });
    const status = JSON.parse(stdout);
    const result = {
      available: true,
      loggedIn: Boolean(status?.loggedIn),
      authMethod: cleanText(status?.authMethod, 80),
      provider: "claude-cli",
    };
    claudeHealthCache = { checkedAt: Date.now(), result };
    return result;
  } catch (error) {
    const result = {
      available: false,
      loggedIn: false,
      provider: "claude-cli",
      error: cleanText(error?.message, 300),
    };
    claudeHealthCache = { checkedAt: Date.now(), result };
    return result;
  }
}

function normalizeAgentTopic(topic) {
  if (!topic || typeof topic !== "object") return null;
  const id = cleanText(topic.id, 160);
  const title = cleanText(topic.title, 600);
  if (!id || !title) return null;
  return {
    id,
    title,
    score: Number(topic.score || 0),
    status: cleanText(topic.status, 40),
    category: cleanText(topic.category, 160),
    valueTag: cleanText(topic.valueTag, 160),
    worth: cleanText(topic.worth, 4000),
    opinion: cleanText(topic.opinion, 4000),
    evidenceBoundary: cleanText(topic.evidenceBoundary, 2500),
    source: cleanText(topic.source, 300),
    sourceUrl: cleanText(topic.sourceUrl, 1000),
    sourceDate: cleanText(topic.sourceDate, 100),
  };
}

function normalizeAgentStyle(style) {
  if (!style || typeof style !== "object") return {};
  return {
    id: cleanText(style.id, 160),
    name: cleanText(style.name, 200),
    perspective: cleanText(style.perspective, 3000),
    traits: cleanText(style.traits, 3000),
    voice: cleanText(style.voice, 3500),
    structure: cleanText(style.structure, 4500),
    titlePatterns: cleanText(style.titlePatterns, 3500),
    techniques: cleanText(style.techniques, 3500),
    antiAiRules: cleanText(style.antiAiRules, 4500),
    guardrails: cleanText(style.guardrails, 3500),
    prompt: cleanText(style.prompt, 6000),
  };
}

function normalizeAgentInput(input) {
  const candidates = (Array.isArray(input?.candidates) ? input.candidates : [])
    .map(normalizeAgentTopic)
    .filter(Boolean)
    .slice(0, 30);
  const selectedTopic = normalizeAgentTopic(input?.selectedTopic)
    || candidates.find((topic) => topic.id === cleanText(input?.selectedTopicId, 160))
    || candidates[0]
    || null;
  const messages = (Array.isArray(input?.messages) ? input.messages : [])
    .filter((message) => ["user", "assistant"].includes(message?.role))
    .map((message) => ({
      role: message.role,
      text: cleanText(message.text, 1500),
    }))
    .filter((message) => message.text)
    .slice(-6);
  return {
    prompt: cleanText(input?.prompt, 3000),
    topicDate: cleanText(input?.topicDate, 40),
    candidates,
    selectedTopic,
    style: normalizeAgentStyle(input?.style),
    messages,
  };
}

const CLAUDE_CHAT_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string", minLength: 1, maxLength: 1200 },
    selectedTopicId: { type: "string", maxLength: 160 },
    action: { type: "string", enum: ["none", "generate_draft"] },
  },
  required: ["reply", "action"],
  additionalProperties: false,
};

const CLAUDE_DRAFT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 8, maxLength: 100 },
    outline: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: { type: "string", minLength: 4, maxLength: 180 },
    },
    bodyMarkdown: { type: "string", minLength: 600, maxLength: 30000 },
    reply: { type: "string", minLength: 1, maxLength: 300 },
  },
  required: ["title", "outline", "bodyMarkdown", "reply"],
  additionalProperties: false,
};

const CLAUDE_STYLE_SCHEMA = {
  type: "object",
  properties: {
    style: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 2, maxLength: 40 },
        description: { type: "string", minLength: 10, maxLength: 800 },
        perspective: { type: "string", minLength: 10, maxLength: 1200 },
        traits: { type: "string", minLength: 10, maxLength: 1200 },
        voice: { type: "string", minLength: 10, maxLength: 1600 },
        method: { type: "string", minLength: 40, maxLength: 3000 },
        structure: { type: "string", minLength: 20, maxLength: 2600 },
        titlePatterns: { type: "string", minLength: 20, maxLength: 1800 },
        techniques: { type: "string", minLength: 20, maxLength: 1800 },
        signatureMoves: { type: "string", minLength: 20, maxLength: 1800 },
        antiAiRules: { type: "string", minLength: 20, maxLength: 2200 },
        revisionPass: { type: "string", minLength: 20, maxLength: 2200 },
        prompt: { type: "string", minLength: 80, maxLength: 5000 },
        outputRules: { type: "string", minLength: 20, maxLength: 1800 },
        guardrails: { type: "string", minLength: 20, maxLength: 1800 },
      },
      required: [
        "name", "description", "perspective", "traits", "voice", "method",
        "structure", "titlePatterns", "techniques", "signatureMoves",
        "antiAiRules", "revisionPass", "prompt", "outputRules", "guardrails",
      ],
      additionalProperties: false,
    },
    reply: { type: "string", minLength: 1, maxLength: 300 },
  },
  required: ["style", "reply"],
  additionalProperties: false,
};

function claudeCliArgs({ schema, systemPrompt, prompt }) {
  return [
    "--print",
    "--output-format", "json",
    "--json-schema", JSON.stringify(schema),
    "--system-prompt", systemPrompt,
    prompt,
  ];
}

function parseClaudeResult(stdout) {
  let result;
  try {
    result = JSON.parse(stdout);
  } catch {
    const error = new Error("Claude CLI 返回格式无法解析");
    error.status = 502;
    throw error;
  }
  if (result?.is_error || result?.subtype !== "success") {
    const error = new Error(cleanText(result?.result, 800) || "Claude CLI 调用失败");
    error.status = 502;
    throw error;
  }
  if (!result?.structured_output || typeof result.structured_output !== "object") {
    const error = new Error("Claude CLI 没有返回有效结构");
    error.status = 502;
    throw error;
  }
  return {
    output: result.structured_output,
    model: cleanText(Object.keys(result.modelUsage || {})[0], 120) || "Claude CLI",
    usage: result.usage || null,
    costUsd: Number(result.total_cost_usd || 0),
  };
}

let claudeAgentBusy = false;

async function withClaudeAgent(task) {
  if (claudeAgentBusy) {
    const error = new Error("写作服务正在处理上一项请求");
    error.status = 429;
    throw error;
  }
  const health = await claudeCliHealth();
  if (!health.available || !health.loggedIn) {
    const error = new Error(health.error || "Claude CLI 尚未登录");
    error.status = 503;
    throw error;
  }
  claudeAgentBusy = true;
  try {
    return await task();
  } finally {
    claudeAgentBusy = false;
  }
}

async function chatWithClaudeAgent(input) {
  const context = normalizeAgentInput(input);
  if (!context.prompt) {
    const error = new Error("请先输入写作指令");
    error.status = 400;
    throw error;
  }
  if (!context.candidates.length) {
    const error = new Error("今日没有可用选题");
    error.status = 400;
    throw error;
  }
  const systemPrompt = [
    "你是观澜 AI 内容中心的写作搭档“澜”。",
    "你不承担预设写作任务，只处理用户本次明确提出的要求；不要自动创建写作计划、任务清单或排期。",
    "candidates 是内容中心在 topicDate 下真实保存的每日选题，回答时必须以这些数据为准。",
    "只依据输入中的每日选题、当前写作风格和对话，不补充外部事实，不声称已经发布内容。",
    "回复使用简洁中文，先给判断，再给下一步；控制在 2–4 句。",
    "只有用户明确要求切换或选择选题时才改变 selectedTopicId；否则返回当前 selectedTopic.id 或空字符串。",
    "当用户要求选出、推荐或切换选题时，selectedTopicId 必须与回复中推荐的选题完全一致，禁止推荐 A 却返回 B。",
    "只有用户明确要求写成完整文章或生成草稿时，action 才返回 generate_draft；其余情况返回 none。",
  ].join("\n");
  const prompt = `用户本次指令与内容中心上下文如下：\n\n${JSON.stringify(context, null, 2)}`;
  return withClaudeAgent(async () => {
    const { stdout } = await runLocalCommand(CLAUDE_CLI_PATH, claudeCliArgs({
      schema: CLAUDE_CHAT_SCHEMA,
      systemPrompt,
      prompt,
    }));
    const result = parseClaudeResult(stdout);
    const allowedIds = new Set(context.candidates.map((topic) => topic.id));
    const selectedTopicId = allowedIds.has(result.output.selectedTopicId)
      ? result.output.selectedTopicId
      : context.selectedTopic?.id || context.candidates[0].id;
    return {
      reply: cleanText(result.output.reply, 1200),
      selectedTopicId,
      action: result.output.action === "generate_draft" ? "generate_draft" : "none",
      provider: "claude-cli",
      model: result.model,
      usage: result.usage,
      costUsd: result.costUsd,
    };
  });
}

async function draftWithClaudeAgent(input) {
  const context = normalizeAgentInput(input);
  const topic = context.selectedTopic;
  if (!topic) {
    const error = new Error("请先选择一条今日选题");
    error.status = 400;
    throw error;
  }
  const systemPrompt = [
    "你是观澜 AI 的中文公众号作者。用户已经在对话中明确要求生成完整草稿。",
    "把当前选中的真实每日选题写成一篇可交给人工编辑的完整 Markdown 草稿。",
    "只使用输入提供的事实、来源和判断；未提供的数字、引语、客户案例、时间线和结论不得补写。",
    "不得把方法建议写成已经发生的行业现状或企业实践；输入没有案例时，明确停留在方法判断。",
    "标题具体克制，提纲由材料决定，正文面向对 AI 有兴趣但焦虑的企业老板、创业者和业务负责人。",
    "正文只允许一个一级标题，小标题使用二级标题。不要输出写作说明、任务清单或自我评价。",
    "保留作者判断与句式变化，避免对称分点、空泛总结和通用 AI 套话。",
  ].join("\n");
  const prompt = `当前选题、写作风格与最近对话如下：\n\n${JSON.stringify({
    topic,
    style: context.style,
    recentConversation: context.messages,
  }, null, 2)}`;
  return withClaudeAgent(async () => {
    const { stdout } = await runLocalCommand(CLAUDE_CLI_PATH, claudeCliArgs({
      schema: CLAUDE_DRAFT_SCHEMA,
      systemPrompt,
      prompt,
    }));
    const result = parseClaudeResult(stdout);
    const title = cleanText(result.output.title, 100).replace(/[。；;]+$/, "");
    const outline = (Array.isArray(result.output.outline) ? result.output.outline : [])
      .map((item) => cleanText(item, 180).replace(/^[一二三四五六七八九十\d]+[、.．\s]*/, ""))
      .filter(Boolean)
      .slice(0, 6);
    let bodyMarkdown = cleanText(result.output.bodyMarkdown, 30000);
    if (!bodyMarkdown.startsWith("# ")) bodyMarkdown = `# ${title}\n\n${bodyMarkdown}`;
    if (title.length < 8 || outline.length < 3 || bodyMarkdown.length < 600) {
      const error = new Error("Claude CLI 返回的草稿不完整，请重试");
      error.status = 502;
      throw error;
    }
    return {
      title,
      outline,
      bodyMarkdown,
      reply: cleanText(result.output.reply, 300) || "草稿已创建。",
      provider: "claude-cli",
      model: result.model,
      usage: result.usage,
      costUsd: result.costUsd,
    };
  });
}

async function learnStyleWithClaudeAgent(input) {
  const reference = cleanText(input?.reference, 30000);
  if (reference.length < 20) {
    const error = new Error("请提供更完整的参考文或写作要求");
    error.status = 400;
    throw error;
  }
  const currentStyle = normalizeAgentStyle(input?.currentStyle);
  const selectedTopic = normalizeAgentTopic(input?.selectedTopic);
  const messages = (Array.isArray(input?.messages) ? input.messages : [])
    .filter((message) => ["user", "assistant"].includes(message?.role))
    .map((message) => ({ role: message.role, text: cleanText(message.text, 1500) }))
    .filter((message) => message.text)
    .slice(-6);
  const systemPrompt = [
    "你是观澜 AI 的写作风格编辑。",
    "请把用户提供的参考文或写作要求提炼为一套可复用、可编辑的中文写作方法与 Prompt。",
    "提炼视角、语气、结构、标题方法、节奏、反模板规则和表达边界；不要复制参考文中的标志性句子。",
    "如果提供 currentStyle，则在保留有效部分的基础上根据新材料修订，而不是机械追加。",
    "输出必须能直接保存进内容中心的写作风格栏目，避免抽象形容词堆叠。",
  ].join("\n");
  const prompt = `请学习并整理以下风格材料：\n\n${JSON.stringify({
    reference,
    currentStyle,
    selectedTopic,
    recentConversation: messages,
  }, null, 2)}`;
  return withClaudeAgent(async () => {
    const { stdout } = await runLocalCommand(CLAUDE_CLI_PATH, claudeCliArgs({
      schema: CLAUDE_STYLE_SCHEMA,
      systemPrompt,
      prompt,
    }));
    const result = parseClaudeResult(stdout);
    return {
      style: result.output.style,
      reply: cleanText(result.output.reply, 300) || "写作风格已学习并保存。",
      provider: "claude-cli",
      model: result.model,
      usage: result.usage,
      costUsd: result.costUsd,
    };
  });
}

function normalizeEvidence(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 30).map((item) => ({
    role: cleanText(item?.role, 80),
    heading: cleanText(item?.heading, 300),
    text: cleanText(item?.text, 5000),
    sourceName: cleanText(item?.sourceName, 200),
    sourceUrl: cleanText(item?.sourceUrl, 1000),
  })).filter((item) => item.heading || item.text);
}

function writingMaterial(input) {
  const style = input?.style || {};
  const topic = input?.topic || {};
  const draft = input?.draft || {};
  return {
    selectedTitle: cleanText(draft.selectedTitle || topic.articleTitleDraft || topic.title, 500),
    articleType: cleanText(style.name || draft.style, 120),
    targetLength: cleanText(draft.length, 80) || "中篇 / 1800-2400 字",
    writingPreparation: {
      sourceInventory: cleanText(draft.painScene, 10000),
      writingFocus: cleanText(draft.coreJudgment, 5000),
      evidenceBoundary: cleanText(draft.notWrite, 5000),
    },
    bodyMarkdown: cleanText(draft.bodyMarkdown, 30000),
    currentOutline: cleanText(draft.outline, 12000),
    originalMaterial: {
      title: cleanText(topic.title, 800),
      source: cleanText(topic.source, 400),
      category: cleanText(topic.category, 200),
      valueTag: cleanText(topic.valueTag, 200),
      worth: cleanText(topic.worth, 10000),
      opinion: cleanText(topic.opinion, 10000),
      evidenceBoundary: cleanText(topic.evidenceBoundary, 5000),
      sourceUrl: cleanText(topic?.provenance?.sourceUrl, 1000),
      sourceName: cleanText(topic?.provenance?.sourceName, 300),
      sourceDate: cleanText(topic?.provenance?.sourceObservedDate || topic.sourceDate, 100),
      evidenceItems: normalizeEvidence(topic.evidenceItems),
    },
    styleReference: {
      perspective: cleanText(style.perspective, 5000),
      traits: cleanText(style.traits, 5000),
      voice: cleanText(style.voice, 5000),
      structure: cleanText(style.structure, 7000),
      titlePatterns: cleanText(style.titlePatterns, 7000),
      techniques: cleanText(style.techniques, 5000),
      signatureMoves: cleanText(style.signatureMoves, 5000),
      antiAiRules: cleanText(style.antiAiRules, 7000),
      outputRules: cleanText(style.outputRules, 5000),
      guardrails: cleanText(style.guardrails, 5000),
      prompt: cleanText(style.prompt, 10000),
    },
  };
}

function buildWritingMessages(input) {
  const style = input?.style || {};
  const topic = input?.topic || {};
  const draft = input?.draft || {};
  const targetLength = cleanText(draft.length, 80) || "中篇 / 1800-2400 字";
  const system = [
    "你是观澜 AI 的中文公众号作者。你要交付一篇可直接进入人工编辑的 Markdown 正文，不是写作建议、提纲说明或任务清单。",
    cleanText(style.prompt, 10000),
    `作者声音：${cleanText(style.voice, 5000)}`,
    `行文技巧：${cleanText(style.techniques, 5000)}`,
    `标志性表达动作：${cleanText(style.signatureMoves, 5000)}`,
    `反模板与去 AI 味规则：${cleanText(style.antiAiRules, 7000)}`,
    `事实边界：${cleanText(style.guardrails, 5000)}`,
    [
      "硬性要求：",
      "1. 只使用输入里给出的事实、数字、引语和来源；材料没有提供的细节明确留白，不得补写。",
      "2. 标题之后直接进入文章。不要解释你采用了什么方法，不输出“写作思路”“以下是正文”等元话语。",
      "3. 当前提纲是本篇材料生成的结构依据，按它展开；不要擅自套用固定五段式、启示清单、老板视角、行动建议或教育性收尾。",
      "4. 保留作者个性和判断。句长有变化，段落不必对称；减少“不是……而是……”“值得注意的是”“综上所述”等模型惯用句。",
      "5. 每个事实都要服务于当前段落，不为凑字数重复摘要。推断必须让读者看出它是作者判断。",
      "6. 使用 Markdown：全文只出现一个一级标题；正文小标题用二级标题；不要使用表格，除非原材料本身必须用表格表达。",
      `7. 目标篇幅：${targetLength}。宁可写短且真实，也不要用空话补足字数。`,
      "8. 只返回完整 Markdown 正文。",
    ].join("\n"),
  ].filter(Boolean).join("\n\n");

  const material = writingMaterial(input);

  return [
    { role: "system", content: system },
    { role: "user", content: `请根据下面这份本篇材料写出完整正文。\n\n${JSON.stringify(material, null, 2)}` },
  ];
}

function buildTitleMessages(input) {
  const material = writingMaterial(input);
  const system = [
    "你是中文公众号的资深标题编辑。请基于本篇原始材料和指定写作方法生成标题候选，而不是套用通用爆款公式。",
    material.styleReference.prompt,
    `标题方法：${material.styleReference.titlePatterns}`,
    `作者声音：${material.styleReference.voice}`,
    `反模板规则：${material.styleReference.antiAiRules}`,
    [
      "硬性要求：",
      "1. 只使用材料中真实存在的对象、数字、结果与冲突，不编造数字、趋势或紧迫感。",
      "2. 生成 6 个明显不同的候选，角度从主张、冲突、结果、机制、关键细节、读者代价中按材料适配选取；不必机械覆盖全部角度。",
      "3. 每个标题必须承诺文章真实会写到的内容，避免“一文看懂、深度解析、重磅、颠覆、三点启示”等空标签。",
      "4. 标题尽量控制在 14–32 个汉字；具体英文产品名和真实数字可以保留。",
      "5. reason 只说明这个标题的传播抓手，不写评分，不虚构点击率。",
      "6. 只返回 JSON：{\"candidates\":[{\"title\":\"...\",\"angle\":\"...\",\"reason\":\"...\"}]}。",
    ].join("\n"),
  ].filter(Boolean).join("\n\n");
  return [
    { role: "system", content: system },
    { role: "user", content: `请为下面这篇文章生成标题候选。\n\n${JSON.stringify(material, null, 2)}` },
  ];
}

function buildOutlineMessages(input) {
  const material = writingMaterial(input);
  const system = [
    "你是中文公众号的结构编辑。请从本篇材料内部找出最合适的叙述顺序，生成一份真正能展开成文章的动态提纲。",
    material.styleReference.prompt,
    `可选结构动作：${material.styleReference.structure}`,
    `作者声音：${material.styleReference.voice}`,
    `事实边界：${material.styleReference.guardrails}`,
    [
      "硬性要求：",
      "1. 先判断手里的材料属于结果、过程、时间线、观点、冲突还是多个信号，再决定从哪里开始以及需要几节。",
      "2. 输出 3–6 个章节标题。章节数和顺序由材料决定，不自动补齐五段式。",
      "3. 每一节承担不同的叙述或论证任务，并对应输入中的具体事实；禁止把原始标题换一种语言重复多遍。",
      "4. 不自动加入“老板怎么看、验收边界、行动建议、本周小切口、三点启示、总结升华”。材料不支持的转折、失败、成本和反方也不要生造。",
      "5. 章节标题要能指导正文展开，可以带具体对象、数字或动作；不要使用“背景介绍、案例分析、总结”一类空标题。",
      "6. 只返回 JSON：{\"outline\":[\"章节标题\",\"章节标题\"]}。不要在字符串里添加序号。",
    ].join("\n"),
  ].filter(Boolean).join("\n\n");
  return [
    { role: "system", content: system },
    { role: "user", content: `请围绕已选标题“${material.selectedTitle}”组织本篇提纲。\n\n${JSON.stringify(material, null, 2)}` },
  ];
}

function buildImagePlanMessages(input, role = "all") {
  const material = writingMaterial(input);
  const requested = role === "cover" ? "只生成 cover" : role === "inline" ? "只生成 inline" : "同时生成 cover 和 inline";
  const system = [
    "你是观澜 AI 的信息视觉编辑。你的任务是把文章内容压缩成可由固定品牌模板渲染的视觉方案，不是写绘图提示词，也不是虚构图片场景。",
    `本次要求：${requested}。`,
    [
      "规则：",
      "1. 只使用文章标题、正文、提纲和原始材料中真实存在的概念，不增加事实或数字。",
      "2. cover 用于公众号横版封面：headline 控制在 22 个汉字以内，subline 控制在 18 个汉字以内，nodes 为 3–5 个极短关键词。",
      "3. inline 用于正文解释：headline 控制在 18 个汉字以内，nodes 为 3–5 个可形成流程或关系的短标签，每个不超过 8 个汉字，caption 是一句克制说明。",
      "4. composition 只能从 flow、network、layers、comparison、funnel 中选择最贴合文章的一种。不要为了变化随机选择。",
      "5. 不使用机器人、芯片、大脑、霓虹、宇宙等通用 AI 意象。",
      "6. 只返回 JSON。完整格式：{\"cover\":{\"composition\":\"flow\",\"headline\":\"...\",\"subline\":\"...\",\"nodes\":[\"...\"]},\"inline\":{\"composition\":\"flow\",\"headline\":\"...\",\"caption\":\"...\",\"nodes\":[\"...\"]}}。未要求的角色可以省略。",
    ].join("\n"),
  ].join("\n\n");
  return [
    { role: "system", content: system },
    { role: "user", content: `请根据下面这篇文章生成可渲染的图片方案。\n\n${JSON.stringify(material, null, 2)}` },
  ];
}

function maxTokensFor(length) {
  const value = String(length || "");
  if (value.startsWith("短篇")) return 3000;
  if (value.startsWith("长篇")) return 9000;
  return 6000;
}

async function callDeepSeek({ messages, maxTokens, json = false }) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    const error = new Error("本地写作服务尚未配置 DEEPSEEK_API_KEY");
    error.status = 503;
    throw error;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 150000);
  let apiResponse;
  try {
    apiResponse = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
        messages,
        thinking: { type: "disabled" },
        max_tokens: maxTokens,
        response_format: { type: json ? "json_object" : "text" },
        stream: false,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error("DeepSeek 生成超时，请稍后重试");
      timeoutError.status = 504;
      throw timeoutError;
    }
    const networkError = new Error("无法连接 DeepSeek API，请检查网络后重试");
    networkError.status = 502;
    throw networkError;
  } finally {
    clearTimeout(timeout);
  }

  let result;
  try {
    result = await apiResponse.json();
  } catch {
    result = null;
  }
  if (!apiResponse.ok) {
    const providerMessage = cleanText(result?.error?.message, 500);
    const error = new Error(providerMessage ? `DeepSeek：${providerMessage}` : `DeepSeek 请求失败（${apiResponse.status}）`);
    error.status = apiResponse.status >= 500 ? 502 : 400;
    throw error;
  }
  const content = cleanText(result?.choices?.[0]?.message?.content, 100000);
  if (!content) {
    const error = new Error("DeepSeek 没有返回内容，请重试");
    error.status = 502;
    throw error;
  }
  return {
    content,
    model: cleanText(result.model, 120) || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
    usage: result.usage || null,
  };
}

function parseJsonContent(content) {
  const normalized = String(content || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(normalized);
  } catch {
    const error = new Error("DeepSeek 返回的结构无法解析，请重试");
    error.status = 502;
    throw error;
  }
}

async function generateTitles(input) {
  const response = await callDeepSeek({ messages: buildTitleMessages(input), maxTokens: 1600, json: true });
  const parsed = parseJsonContent(response.content);
  const candidates = (Array.isArray(parsed?.candidates) ? parsed.candidates : [])
    .map((item) => ({
      title: cleanText(item?.title, 80).replace(/[。；;]+$/, ""),
      angle: cleanText(item?.angle, 30) || "候选",
      reason: cleanText(item?.reason, 160) || "与本篇材料和写作方法对齐",
    }))
    .filter((item) => item.title.length >= 8)
    .filter((item, index, items) => items.findIndex((candidate) => candidate.title === item.title) === index)
    .slice(0, 6);
  if (candidates.length < 3) {
    const error = new Error("DeepSeek 返回的有效标题不足，请重试");
    error.status = 502;
    throw error;
  }
  return { candidates, model: response.model, usage: response.usage };
}

const OUTLINE_NUMERALS = ["一", "二", "三", "四", "五", "六"];

async function generateOutline(input) {
  if (!cleanText(input?.draft?.selectedTitle)) {
    const error = new Error("请先选择或填写标题，再生成提纲");
    error.status = 400;
    throw error;
  }
  const response = await callDeepSeek({ messages: buildOutlineMessages(input), maxTokens: 2200, json: true });
  const parsed = parseJsonContent(response.content);
  const sections = (Array.isArray(parsed?.outline) ? parsed.outline : [])
    .map((item) => cleanText(typeof item === "string" ? item : item?.title, 180).replace(/^[一二三四五六七八九十\d]+[、.．\s]*/, ""))
    .filter((item) => item.length >= 4)
    .filter((item, index, items) => items.findIndex((candidate) => candidate === item) === index)
    .slice(0, 6);
  if (sections.length < 3) {
    const error = new Error("DeepSeek 返回的有效章节不足，请重试");
    error.status = 502;
    throw error;
  }
  return {
    outline: sections.map((section, index) => `${OUTLINE_NUMERALS[index]}、${section}`).join("\n"),
    model: response.model,
    usage: response.usage,
  };
}

const IMAGE_COMPOSITIONS = new Set(["flow", "network", "layers", "comparison", "funnel"]);

function normalizeVisualPlan(plan, role, fallbackTitle) {
  if (!plan || typeof plan !== "object") return null;
  const nodes = (Array.isArray(plan.nodes) ? plan.nodes : [])
    .map((item) => cleanText(item, 16))
    .filter(Boolean)
    .slice(0, 5);
  if (nodes.length < 3) return null;
  return {
    role,
    composition: IMAGE_COMPOSITIONS.has(plan.composition) ? plan.composition : "flow",
    headline: cleanText(plan.headline || fallbackTitle, role === "cover" ? 44 : 36),
    subline: role === "cover" ? cleanText(plan.subline, 36) : "",
    caption: role === "inline" ? cleanText(plan.caption, 120) : "",
    nodes,
  };
}

async function generateImagePlan(input) {
  const role = ["cover", "inline"].includes(input?.role) ? input.role : "all";
  const response = await callDeepSeek({ messages: buildImagePlanMessages(input, role), maxTokens: 1800, json: true });
  const parsed = parseJsonContent(response.content);
  const fallbackTitle = cleanText(input?.draft?.selectedTitle || input?.topic?.title, 44);
  const result = { model: response.model, usage: response.usage };
  if (role !== "inline") result.cover = normalizeVisualPlan(parsed?.cover, "cover", fallbackTitle);
  if (role !== "cover") result.inline = normalizeVisualPlan(parsed?.inline, "inline", fallbackTitle);
  if ((role === "cover" && !result.cover) || (role === "inline" && !result.inline) || (role === "all" && (!result.cover || !result.inline))) {
    const error = new Error("返回的图片方案不完整，请重试");
    error.status = 502;
    throw error;
  }
  return result;
}

async function generateBody(input) {
  if (!cleanText(input?.draft?.outline) || !cleanText(input?.draft?.selectedTitle)) {
    const error = new Error("请先确认标题和提纲，再生成正文");
    error.status = 400;
    throw error;
  }

  const result = await callDeepSeek({ messages: buildWritingMessages(input), maxTokens: maxTokensFor(input?.draft?.length) });
  return {
    bodyMarkdown: result.content,
    model: result.model,
    usage: result.usage,
  };
}

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

async function serveStatic(request, response, pathname) {
  const relativePath = pathname === "/" ? "index.html" : decodeURIComponent(pathname).replace(/^\/+/, "");
  if (!relativePath || relativePath.startsWith(".") || relativePath.includes(`${sep}..${sep}`) || /^\.env/.test(relativePath)) {
    response.writeHead(404).end("Not found");
    return;
  }
  const filePath = resolve(ROOT, relativePath);
  if (!filePath.startsWith(ROOT)) {
    response.writeHead(404).end("Not found");
    return;
  }
  try {
    const content = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    response.end(content);
  } catch (error) {
    response.writeHead(error?.code === "ENOENT" ? 404 : 500).end(error?.code === "ENOENT" ? "Not found" : "Server error");
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);
  const cors = corsHeaders(request);
  if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
    if (!Object.keys(cors).length) return sendJson(response, 403, { error: "不允许的页面来源" });
    response.writeHead(204, cors).end();
    return;
  }
  if (url.pathname === "/api/health" && request.method === "GET") {
    const claude = await claudeCliHealth();
    sendJson(response, 200, {
      ok: true,
      configured: Boolean(process.env.DEEPSEEK_API_KEY),
      model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
      claude,
    }, cors);
    return;
  }
  if (url.pathname === "/api/agent/health" && request.method === "GET") {
    const claude = await claudeCliHealth({ force: url.searchParams.get("refresh") === "1" });
    sendJson(response, claude.available && claude.loggedIn ? 200 : 503, claude, cors);
    return;
  }
  if (["/api/agent/chat", "/api/agent/draft", "/api/agent/style"].includes(url.pathname) && request.method === "POST") {
    if (!Object.keys(cors).length) return sendJson(response, 403, { error: "不允许的页面来源" });
    try {
      const input = await readJson(request);
      const result = url.pathname === "/api/agent/chat"
        ? await chatWithClaudeAgent(input)
        : url.pathname === "/api/agent/draft"
          ? await draftWithClaudeAgent(input)
          : await learnStyleWithClaudeAgent(input);
      sendJson(response, 200, result, cors);
    } catch (error) {
      sendJson(response, Number(error?.status || 500), {
        error: cleanText(error?.message, 800) || "Claude Agent 调用失败",
      }, cors);
    }
    return;
  }
  if (["/api/generate-titles", "/api/generate-outline", "/api/generate-body", "/api/generate-image-plan"].includes(url.pathname) && request.method === "POST") {
    if (!Object.keys(cors).length) return sendJson(response, 403, { error: "不允许的页面来源" });
    try {
      const input = await readJson(request);
      const result = url.pathname === "/api/generate-titles"
        ? await generateTitles(input)
        : url.pathname === "/api/generate-outline"
          ? await generateOutline(input)
          : url.pathname === "/api/generate-image-plan"
            ? await generateImagePlan(input)
          : await generateBody(input);
      sendJson(response, 200, result, cors);
    } catch (error) {
      sendJson(response, Number(error?.status || 500), { error: cleanText(error?.message, 800) || "DeepSeek 生成失败" }, cors);
    }
    return;
  }
  if (!["GET", "HEAD"].includes(request.method || "")) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }
  await serveStatic(request, response, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`Content Factory: http://${HOST}:${PORT}`);
  console.log(`DeepSeek: ${process.env.DEEPSEEK_API_KEY ? "configured" : "missing DEEPSEEK_API_KEY"} · ${process.env.DEEPSEEK_MODEL || DEFAULT_MODEL}`);
  console.log(`Claude Agent: ${CLAUDE_CLI_PATH}`);
});
