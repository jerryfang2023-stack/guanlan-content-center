import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const prototypeRoot = path.resolve(here, "..");
const radarRoot = process.argv[2] || "/Users/jerry/claude/AI-Radar";
const observationPath = path.join(radarRoot, "01-SiteV2/site/data/v3-data-observation-desk.json");
const topicCenterPath = path.join(radarRoot, "01-SiteV2/site/data/topic-center.json");
const appPath = path.join(prototypeRoot, "app.js");
const outputPath = path.join(prototypeRoot, "data/topics-2026-07.js");
const calendarAsOf = process.env.CONTENT_FACTORY_AS_OF || "2026-07-13";

const observation = JSON.parse(fs.readFileSync(observationPath, "utf8"));
const topicCenter = JSON.parse(fs.readFileSync(topicCenterPath, "utf8"));
const appSource = fs.readFileSync(appPath, "utf8");

const normalizedTitle = (value) => String(value || "")
  .toLowerCase()
  .replace(/[\s\p{P}\p{S}]+/gu, "");

const normalizedUrl = (value) => {
  try {
    const url = new URL(String(value || ""));
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|ref$|source$)/i.test(key)) url.searchParams.delete(key);
    }
    return url.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return String(value || "").trim().toLowerCase();
  }
};

const existingTitles = new Set(
  [...appSource.matchAll(/^\s{4}title:\s*"([^"]+)"/gm)].map((match) => normalizedTitle(match[1])),
);

const topicCenterBySignalId = new Map();
for (const topic of topicCenter.topics || []) {
  for (const signal of topic.sourceInputs?.businessSignals || []) {
    if (signal?.id && !topicCenterBySignalId.has(signal.id)) topicCenterBySignalId.set(signal.id, topic);
  }
}

const frontstageIds = new Set((observation.frontstageCards || []).map((card) => card.id));
const categoryOrder = { funding: 0, case: 1, "product-service": 2, product_service: 2 };

const publicTitleOverrides = {
  "SIG-20260624-A12": "Petrobras 使用生成式 AI 发现 1.2 亿美元税务节省",
  "SIG-20260616-A16": "MiniMax M3 模型正式开源：原生多模态、百万上下文",
  "SIG-20260525-A06": "低成本 AI 可能冲击 OpenAI 与 Anthropic 的 IPO 预期",
  "SIG-20260525-A04": "多智能体 AI 销售团队案例：SQL 转化提升 4.2 倍，带来 1420 万美元管线",
};

function needsSourceTitle(card) {
  return /^(现在是|今天是|谁：|如何[A-Z])|记录企业应用场景/.test(String(card.title || ""));
}

function publicTitle(card) {
  return publicTitleOverrides[card.id]
    || (needsSourceTitle(card) && card.originalTitle ? card.originalTitle : card.displayTitle || card.title || card.originalTitle);
}

function sourceFact(card) {
  if (needsSourceTitle(card)) {
    return `原始来源记录的事件为“${publicTitle(card)}”；自动卡片的场景归类需回到原文复核。`;
  }
  return cleanSentence(card.translatedFact || card.summary || card.frontstageValueDescription, publicTitle(card));
}

function isEligibleBusinessCard(card) {
  const titleText = `${card.title || ""} ${card.originalTitle || ""}`;
  const url = String(card.sourceUrl || card.sourceLinks?.[0] || "");
  const invalidTitle = /市场规模|市场预计|年复合增长率|至\s*20\d{2}|初学者|指南|教程|概览|职位说明|招聘页面|Forward Deployed Engineer(?:ing)?|what is fde|行政令|政府官员指责|禁止外国|行为守则|法案|\b(?:market size|forecast|tutorial|overview|guide|role)\b|\bvs\.?\b/i;
  const invalidUrl = /(?:github\.com|huggingface\.co|reddit\.com|linkedin\.com|x\.com|twitter\.com|\/marketplace(?:\/|$)|\/docs\/?$|\/models?\/)/i;
  return card.evidenceGate === "core_evidence_passed"
    && /^https?:\/\//.test(url)
    && !invalidTitle.test(titleText)
    && !invalidUrl.test(url);
}

const largeVendorPattern = /\b(openai|google|microsoft|meta|amazon|aws|anthropic|nvidia|salesforce|ibm|oracle|apple|alibaba|bytedance|字节跳动|阿里巴巴|腾讯|百度)\b/i;

function companyKey(card) {
  const largeMatch = `${card.largeVendorKey || ""} ${card.subject || ""} ${card.sourceName || ""} ${card.title || ""}`.match(largeVendorPattern);
  return normalizedTitle(card.largeVendorKey || largeMatch?.[1] || card.subject || card.sourceName || card.source || card.id);
}

function isLargeVendorCard(card) {
  return Boolean(card.largeVendor || card.largeVendorKey || largeVendorPattern.test(`${card.subject || ""} ${card.sourceName || ""} ${card.title || ""}`));
}

function qualityScore(card) {
  const frontstage = frontstageIds.has(card.id) ? 10000 : 0;
  const editorialTopic = topicCenterBySignalId.has(card.id) ? 5000 : 0;
  const evidence = Number(card.frontstageEvidenceScore || 0) * 10;
  const editorial = Number(card.frontstageEditorialScore || card.frontstageRankScore || 0);
  const importance = Number(card.importanceScore || 0) * 20;
  const recency = Number(String(card.date || "").replaceAll("-", "")) / 100000000;
  return frontstage + editorialTopic + evidence + editorial + importance + recency;
}

const seenTitles = new Set();
const seenUrls = new Set();
const candidates = [...(observation.cards || [])]
  .filter((card) => ["funding", "case", "product-service", "product_service"].includes(card.category) && isEligibleBusinessCard(card))
  .sort((a, b) => qualityScore(b) - qualityScore(a) || (categoryOrder[a.category] ?? 9) - (categoryOrder[b.category] ?? 9))
  .filter((card) => {
    const titleKey = normalizedTitle(publicTitle(card));
    const urlKey = normalizedUrl(card.sourceUrl || card.sourceLinks?.[0]);
    if (!titleKey || existingTitles.has(titleKey) || seenTitles.has(titleKey) || (urlKey && seenUrls.has(urlKey))) return false;
    seenTitles.add(titleKey);
    if (urlKey) seenUrls.add(urlKey);
    return true;
  });

const requiredCounts = { funding: 50, case: 123, product: 124 };
const selectedLargeVendorCounts = {};

function spreadCards(cards) {
  const groups = {
    large: cards.filter(isLargeVendorCard).sort((a, b) => qualityScore(b) - qualityScore(a)),
    other: cards.filter((card) => !isLargeVendorCard(card)).sort((a, b) => qualityScore(b) - qualityScore(a)),
  };
  const targets = { large: groups.large.length, other: groups.other.length };
  const used = { large: 0, other: 0 };
  const ordered = [];
  while (ordered.length < cards.length) {
    const slot = ordered.length;
    const kind = Object.keys(groups)
      .filter((key) => groups[key].length)
      .sort((a, b) => (((slot + 1) * targets[b] / cards.length) - used[b]) - (((slot + 1) * targets[a] / cards.length) - used[a]))[0];
    const pool = groups[kind];
    let pickIndex = 0;
    if (kind === "large") {
      const recent = new Set(ordered.slice(-5).map(companyKey));
      const diverseIndex = pool.findIndex((card) => !recent.has(companyKey(card)));
      if (diverseIndex >= 0) pickIndex = diverseIndex;
    }
    ordered.push(pool.splice(pickIndex, 1)[0]);
    used[kind] += 1;
  }
  return ordered;
}

function selectCategoryCards(cards, required) {
  const nonLarge = cards.filter((card) => !isLargeVendorCard(card));
  const large = cards.filter(isLargeVendorCard);
  const requiredLarge = Math.max(0, required - nonLarge.length);
  const selected = nonLarge.slice(0, required - requiredLarge);
  for (const card of large) {
    if (selected.length >= required) break;
    const key = companyKey(card);
    if ((selectedLargeVendorCounts[key] || 0) >= 18) continue;
    selected.push(card);
    selectedLargeVendorCounts[key] = (selectedLargeVendorCounts[key] || 0) + 1;
  }
  if (selected.length < required) {
    for (const card of large) {
      if (selected.length >= required) break;
      if (selected.includes(card)) continue;
      const key = companyKey(card);
      if ((selectedLargeVendorCounts[key] || 0) >= 30) continue;
      selected.push(card);
      selectedLargeVendorCounts[key] = (selectedLargeVendorCounts[key] || 0) + 1;
    }
  }
  return spreadCards(selected);
}

const queues = {
  funding: selectCategoryCards(candidates.filter((card) => card.category === "funding"), requiredCounts.funding),
  case: selectCategoryCards(candidates.filter((card) => card.category === "case"), requiredCounts.case),
  product: selectCategoryCards(candidates.filter((card) => ["product-service", "product_service"].includes(card.category)), requiredCounts.product),
};

for (const [category, required] of Object.entries(requiredCounts)) {
  if (queues[category].length !== required) {
    throw new Error(`Insufficient unique ${category} cards: expected ${required}, received ${queues[category].length}`);
  }
}

const totalSlots = Object.values(requiredCounts).reduce((sum, count) => sum + count, 0);
const usedCounts = { funding: 0, case: 0, product: 0 };
const balancedCategories = [];
for (let slot = 0; slot < totalSlots; slot += 1) {
  const category = Object.keys(requiredCounts)
    .filter((key) => usedCounts[key] < requiredCounts[key])
    .sort((a, b) => {
      const deficitA = ((slot + 1) * requiredCounts[a] / totalSlots) - usedCounts[a];
      const deficitB = ((slot + 1) * requiredCounts[b] / totalSlots) - usedCounts[b];
      return deficitB - deficitA;
    })[0];
  balancedCategories.push(category);
  usedCounts[category] += 1;
}

const schedule = [
  { date: "2026-07-01", capacity: 7 },
  ...Array.from({ length: 29 }, (_, index) => ({
    date: `2026-07-${String(index + 3).padStart(2, "0")}`,
    capacity: 10,
  })),
];

function firstDisplayLabel(card, prefixes) {
  return (card.displayTags || []).find((tag) => prefixes.some((prefix) => String(tag.id || "").startsWith(prefix)))?.label || "";
}

function editorialCategory(card) {
  if (card.category === "funding") return "AI 投资与采购";
  if (card.category === "case") return "企业场景落地";
  return "AI 产品与服务";
}

function valueTag(card) {
  if (card.category === "funding") return "资本信号";
  if (card.category === "case") return "落地证据";
  return "能力边界";
}

function sourceLabel(card) {
  const type = card.categoryLabel || (card.category === "funding" ? "融资" : card.category === "case" ? "案例" : "产品 / 服务");
  return `观澜数据观察台 · ${type} · ${card.sourceName || card.source || "原始来源"}`;
}

function cleanSentence(value, fallback = "") {
  const text = String(value || fallback).replace(/\s+/g, " ").trim();
  return text.length > 260 ? `${text.slice(0, 258)}……` : text;
}

function genericOpinion(card, category) {
  if (card.category === "funding") return "融资金额只是表层，更值得老板判断的是：资本正在押注哪类企业问题，以及这类能力离真实预算还有多远。";
  if (card.category === "case") return `案例的价值不在“用了 AI”，而在${category}是否形成了可核对的流程、责任人和业务结果。`;
  return "产品发布不是采购理由；只有进入具体业务动作、明确验收标准，能力变化才会变成经营结果。";
}

function writingAngles(card, enriched, category) {
  const fact = sourceFact(card);
  return {
    business: cleanSentence(enriched?.bossPain, `从老板的预算和结果切入：这条信号会先改变${category}的收入、成本、效率还是风险。`),
    process: cleanSentence(enriched?.actionHint, `把“${fact}”拆成输入、动作、输出和验收点，找出最小可验证环节。`),
    organization: card.category === "funding"
      ? "判断融资背后的购买者、交付团队和商业化路径，而不是只追逐融资数字。"
      : "明确业务负责人、使用团队与技术团队的分工，避免把落地责任只交给 IT。",
    asset: "把来源证据、流程定义、验收指标和复盘结果沉淀为可复用的企业 AI 资产。",
  };
}

function outlineFor(card, enriched, category) {
  if (Array.isArray(enriched?.writingStructure) && enriched.writingStructure.length) {
    return enriched.writingStructure.map((line, index) => `${index + 1}. ${line}`).join("\n");
  }
  return [
    `一、先给判断：这条${card.categoryLabel || "AI"}信号为什么与老板有关`,
    `二、还原事实：${sourceFact(card)}`,
    `三、业务拆解：${category}会先影响哪一个经营动作`,
    "四、验收边界：哪些结果已有证据，哪些仍需验证",
    "五、行动落点：给出一个本周可执行的小切口",
  ].join("\n");
}

function imagePromptFor(card, category) {
  const subject = card.subject || publicTitle(card);
  return `封面图：观澜蓝与暖白的克制商业插画，以“${subject}”为事实锚点，用抽象流程、业务节点和验收卡表达${category}；左侧预留标题安全区；无文字、无 Logo、无机器人脸、无赛博光效。`;
}

function buildTopic(card, scheduledDate, index) {
  const enriched = topicCenterBySignalId.get(card.id);
  const category = editorialCategory(card);
  const sourceDate = card.date || observation.meta?.activeDate || "";
  const fact = sourceFact(card);
  const worth = cleanSentence(
    enriched?.relevance,
    `${fact} 这条信号可用于判断${category}是否已经进入真实预算、客户流程或交付环节。`,
  );
  const title = publicTitle(card);
  const score = Math.max(78, Math.min(97,
    78 + Number(card.importanceScore || 0) * 2
      + (frontstageIds.has(card.id) ? 4 : 0)
      + Math.min(5, Math.round(Number(card.frontstageEvidenceScore || 0) / 20)),
  ));
  return {
    id: `guanlan-202607-${String(index + 1).padStart(3, "0")}-${card.id}`,
    date: scheduledDate,
    scheduledDate,
    sourceDate,
    scheduleState: scheduledDate < calendarAsOf ? "backfill" : scheduledDate === calendarAsOf ? "current" : "planned",
    score,
    title,
    source: sourceLabel(card),
    category,
    valueTag: valueTag(card),
    platform: "公众号候选",
    style: "观澜判断感",
    length: "中篇 / 1800-2400 字",
    status: "candidate",
    worth,
    opinion: cleanSentence(enriched?.newFrame || enriched?.core || enriched?.moneyLine, genericOpinion(card, category)),
    writingAngles: writingAngles(card, enriched, category),
    outline: outlineFor(card, enriched, category),
    articleTitleDraft: enriched?.spreadTitle || title,
    imagePrompt: imagePromptFor(card, category),
    layout: "公众号主稿：判断句开头；事实、业务拆解、证据边界、行动清单四段式；图片只服务理解。",
    evidenceBoundary: [
      cleanSentence(enriched?.evidenceBoundary),
      `本题按 7 月内容日历排期；事实来自观澜数据观察台，真实信号日期为 ${sourceDate}，不是 ${scheduledDate} 当日新增观察。`,
    ].filter(Boolean).join(" "),
    provenance: {
      dataset: "v3-data-observation-desk.json",
      signalId: card.id,
      sourceObservedDate: sourceDate,
      sourceUrl: card.sourceUrl || card.sourceLinks?.[0] || "",
      sourceName: card.sourceName || card.source || "",
      sourceLevel: card.sourceLevel || "",
      evidenceGate: card.evidenceGate || "",
      originalTitle: card.originalTitle || "",
      companyKey: companyKey(card),
      largeVendor: isLargeVendorCard(card),
    },
  };
}

const scheduledCards = [];
let cursor = 0;
for (const day of schedule) {
  const dayCompanyKeys = new Set();
  let largeVendorCount = 0;
  for (let slot = 0; slot < day.capacity; slot += 1) {
    const category = balancedCategories[cursor];
    const queue = queues[category];
    let cardIndex = queue.findIndex((card) => {
      const key = companyKey(card);
      return !dayCompanyKeys.has(key) && (!isLargeVendorCard(card) || largeVendorCount < 3);
    });
    if (cardIndex < 0) cardIndex = queue.findIndex((card) => !isLargeVendorCard(card) || largeVendorCount < 3);
    if (cardIndex < 0) cardIndex = 0;
    const [card] = queue.splice(cardIndex, 1);
    const key = companyKey(card);
    dayCompanyKeys.add(key);
    if (isLargeVendorCard(card)) largeVendorCount += 1;
    scheduledCards.push({ card, date: day.date, index: cursor });
    cursor += 1;
  }
}

function entriesForDate(date) {
  return scheduledCards.filter((entry) => entry.date === date);
}

function canSwapIntoDay(entry, dayEntries, outgoingEntry) {
  const remainingKeys = new Set(dayEntries.filter((item) => item !== outgoingEntry).map((item) => companyKey(item.card)));
  return !remainingKeys.has(companyKey(entry.card));
}

let rebalanceGuard = 0;
while (rebalanceGuard < 100) {
  rebalanceGuard += 1;
  const largeCountsByDate = Object.fromEntries(schedule.map((day) => [day.date, entriesForDate(day.date).filter((entry) => isLargeVendorCard(entry.card)).length]));
  const overDate = Object.keys(largeCountsByDate).find((date) => largeCountsByDate[date] > 3);
  if (!overDate) break;
  const underDates = Object.keys(largeCountsByDate).filter((date) => largeCountsByDate[date] < 3);
  const overEntries = entriesForDate(overDate);
  let swapped = false;
  for (const underDate of underDates) {
    const underEntries = entriesForDate(underDate);
    for (const largeEntry of overEntries.filter((entry) => isLargeVendorCard(entry.card))) {
      const nonLargeEntry = underEntries.find((entry) => !isLargeVendorCard(entry.card)
        && entry.card.category === largeEntry.card.category
        && canSwapIntoDay(largeEntry, underEntries, entry)
        && canSwapIntoDay(entry, overEntries, largeEntry));
      if (!nonLargeEntry) continue;
      [largeEntry.card, nonLargeEntry.card] = [nonLargeEntry.card, largeEntry.card];
      swapped = true;
      break;
    }
    if (swapped) break;
  }
  if (!swapped) throw new Error(`Unable to rebalance large-vendor quota for ${overDate}`);
}

let companyGuard = 0;
while (companyGuard < 200) {
  companyGuard += 1;
  let duplicateDate = "";
  let duplicateEntry = null;
  for (const day of schedule) {
    const entries = entriesForDate(day.date);
    const seen = new Set();
    duplicateEntry = entries.find((entry) => {
      const key = companyKey(entry.card);
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    }) || null;
    if (duplicateEntry) {
      duplicateDate = day.date;
      break;
    }
  }
  if (!duplicateEntry) break;
  const duplicateDayEntries = entriesForDate(duplicateDate);
  let swapped = false;
  for (const otherDay of schedule.filter((day) => day.date !== duplicateDate)) {
    const otherEntries = entriesForDate(otherDay.date);
    const exchange = otherEntries.find((entry) => entry.card.category === duplicateEntry.card.category
      && isLargeVendorCard(entry.card) === isLargeVendorCard(duplicateEntry.card)
      && canSwapIntoDay(entry, duplicateDayEntries, duplicateEntry)
      && canSwapIntoDay(duplicateEntry, otherEntries, entry));
    if (!exchange) continue;
    [duplicateEntry.card, exchange.card] = [exchange.card, duplicateEntry.card];
    swapped = true;
    break;
  }
  if (!swapped) throw new Error(`Unable to deduplicate company quota for ${duplicateDate}`);
}

const topics = scheduledCards.map((entry) => buildTopic(entry.card, entry.date, entry.index));

const dateCounts = topics.reduce((counts, topic) => {
  counts[topic.scheduledDate] = (counts[topic.scheduledDate] || 0) + 1;
  return counts;
}, {});

if (topics.length !== 297 || Object.keys(dateCounts).length !== 30 || dateCounts["2026-07-01"] !== 7) {
  throw new Error(`Unexpected calendar shape: ${topics.length} topics across ${Object.keys(dateCounts).length} dates`);
}

const catalog = {
  schemaVersion: 1,
  catalogVersion: "2026-07-r1",
  month: "2026-07",
  source: {
    kind: "guanlan-data-observation",
    datasetVersion: observation.meta?.version || "",
    generatedAt: observation.meta?.generatedAt || "",
    activeDate: observation.meta?.activeDate || "",
    sourceFile: "v3-data-observation-desk.json",
  },
  policy: {
    calendarMeaning: "editorial_schedule",
    calendarAsOf,
    sourceDateField: "sourceDate",
    note: "7 月日期为内容排期；每条事实保留观澜观察台真实信号日期。",
  },
  topics,
};

const output = `/* Generated by tools/build-july-topic-catalog.mjs. Do not hand edit. */\nwindow.CONTENT_FACTORY_TOPIC_CATALOGS = Object.freeze(${JSON.stringify([catalog], null, 2)});\n`;
fs.writeFileSync(outputPath, output);

console.log(JSON.stringify({
  outputPath,
  catalogVersion: catalog.catalogVersion,
  topicCount: topics.length,
  scheduledDates: Object.keys(dateCounts).length,
  categoryCounts: topics.reduce((counts, topic) => {
    const key = topic.valueTag;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {}),
  sourceActiveDate: catalog.source.activeDate,
}, null, 2));
