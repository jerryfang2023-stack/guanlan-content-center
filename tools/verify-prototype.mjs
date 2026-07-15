import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const fail = (message) => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };

const html = read("index.html");
const app = read("app.js");
const css = read("style.css");

function functionSource(name) {
  const start = app.indexOf(`function ${name}(`);
  assert(start >= 0, `Missing function ${name}`);
  const bodyStart = app.indexOf("{", start);
  let depth = 0;
  for (let index = bodyStart; index < app.length; index += 1) {
    if (app[index] === "{") depth += 1;
    if (app[index] === "}") depth -= 1;
    if (depth === 0) return app.slice(start, index + 1);
  }
  fail(`Unclosed function ${name}`);
}

const htmlIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = [...new Set(htmlIds.filter((id, index) => htmlIds.indexOf(id) !== index))];
assert(!duplicateIds.length, `Duplicate HTML ids: ${duplicateIds.join(", ")}`);
assert(!html.includes("nav-sub-item") && !css.includes(".nav-sub-item"), "Sidebar navigation must remain a flat, single-level column list");

const selectorIds = [...app.matchAll(/document\.querySelector\(["']#([A-Za-z][\w:-]*)["']\)/g)].map((match) => match[1]);
const missingIds = [...new Set(selectorIds.filter((id) => !htmlIds.includes(id)))];
assert(!missingIds.length, `app.js references missing ids: ${missingIds.join(", ")}`);

const scriptSources = [...html.matchAll(/<script src="([^"]+)"/g)].map((match) => match[1]);
const scriptOrder = scriptSources.map((source) => source.split("?")[0]);
assert(JSON.stringify(scriptOrder) === JSON.stringify([
  "data/topics-2026-07.js",
  "assets/generated/manifest.js",
  "app.js",
]), `Unexpected script order: ${scriptOrder.join(" -> ")}`);
assert(scriptSources.some((source) => /^app\.js\?v=20260715-topic-schedule-16$/.test(source)), "Topic schedule cache-busting version is missing");
assert(!html.includes('class="layout-revision-panel"') && !html.includes('data-layout-revision='), "Legacy layout revision panel must stay removed");
assert(app.includes('data-inline-op="bold"') && app.includes('data-block-op="colorBlock"'), "Preview-local text and block editing controls are missing");
assert(app.includes('data-block-op="removeRule"') && app.includes('function removeHorizontalRules('), "Preview-local horizontal rule removal is missing");
assert(app.includes('class="preview-workspace has-tools"') && app.includes('class="editor-tools is-open"'), "Preview side editing workspace must open by default");
assert(app.includes('id="gzhContent" contenteditable="true"') && !app.includes('id="editButton"') && !app.includes('id="saveBackButton"'), "Preview must enter editing directly without edit or save-back controls");
assert(app.includes('function captureContentHtml(') && app.includes('function restoreHistory('), "Preview undo history snapshots are missing");
assert(app.includes('id="redoButton"') && app.includes('>恢复</button>'), "Redo action must be labeled as restore");
assert(app.includes('function runHistory(direction)') && app.includes("runHistory(event.shiftKey?1:-1)"), "Preview history controls and keyboard shortcuts are missing");
assert(!app.includes('id="undoButton" type="button" title="撤销上一次编辑" disabled'), "Preview undo control must remain clickable when history is empty");
assert(app.includes('function stripGzhPreviewMasthead('), "Legacy preview masthead stripping is missing");
assert(!app.includes("WAVESIGHT BRIEFING") && !app.includes("const mastheadLabel"), "Generated layout must not include an article masthead");
assert(app.includes('const TOPIC_TIME_ZONE = "America/Los_Angeles"'), "Topic date filter must use the local editorial timezone");
assert(app.includes('function availableDates(today = topicLocalDate())') && app.includes('.filter((date) => isCurrentOrPastTopicDate(date, today))'), "Future topic dates must be excluded from the date filter");

const topicDateContext = {};
vm.runInNewContext([
  functionSource("normalizeDate"),
  functionSource("topicLocalDate"),
  functionSource("isCurrentOrPastTopicDate"),
].join("\n"), topicDateContext);
assert(topicDateContext.isCurrentOrPastTopicDate("2026-07-15", "2026-07-15"), "Today's topic date should be available");
assert(!topicDateContext.isCurrentOrPastTopicDate("2026-07-16", "2026-07-15"), "Future topic date should not be available");

const catalogContext = { window: {} };
vm.runInNewContext(read("data/topics-2026-07.js"), catalogContext);
const catalog = catalogContext.window.CONTENT_FACTORY_TOPIC_CATALOGS?.[0];
assert(catalog?.catalogVersion === "2026-07-r1", "July catalog version is missing or unexpected");
assert(catalog?.source?.activeDate === "2026-06-24", "Observation source boundary changed without review");
assert(catalog?.policy?.calendarMeaning === "editorial_schedule", "Calendar must remain an editorial schedule");
assert(catalog?.topics?.length === 297, `Expected 297 generated topics, found ${catalog?.topics?.length || 0}`);

const generatedIds = new Set();
const daily = {};
for (const topic of catalog.topics) {
  assert(!generatedIds.has(topic.id), `Duplicate topic id: ${topic.id}`);
  generatedIds.add(topic.id);
  assert(/^2026-07-\d{2}$/.test(topic.scheduledDate), `Invalid scheduledDate: ${topic.id}`);
  assert(/^2026-(05|06)-\d{2}$/.test(topic.sourceDate), `Invalid sourceDate: ${topic.id}`);
  assert(/^https?:\/\//.test(topic.provenance?.sourceUrl || ""), `Missing source URL: ${topic.id}`);
  assert(topic.provenance?.signalId, `Missing signal id: ${topic.id}`);
  assert(topic.evidenceBoundary?.includes("真实信号日期"), `Missing evidence boundary: ${topic.id}`);
  assert(["business", "process", "organization", "asset"].every((key) => topic.writingAngles?.[key]), `Incomplete writing angles: ${topic.id}`);
  (daily[topic.scheduledDate] ||= []).push(topic);
}

function extractArrayLiteral(startToken, endToken) {
  const declarationAt = app.indexOf(startToken);
  assert(declarationAt >= 0, `Missing declaration: ${startToken}`);
  const arrayAt = app.indexOf("[", declarationAt);
  const endAt = app.indexOf(endToken, arrayAt);
  assert(arrayAt >= 0 && endAt >= 0, `Cannot extract array: ${startToken}`);
  return app.slice(arrayAt, endAt + 2);
}

const baseTopics = vm.runInNewContext(`(${extractArrayLiteral("const topics =", '\n];\n\ntopics.forEach((topic) => { topic.date = "2026-07-02"; });')})`, {});
const historicalTopics = vm.runInNewContext(`(${extractArrayLiteral("const historicalTopics =", "\n];\n\ntopics.push(...historicalTopics);")})`, {});
assert(app.includes('topics.forEach((topic) => { topic.date = "2026-07-02"; });'), "Built-in topics lost their July 2 date assignment");
const normalizeRuntimeDate = (value) => String(value || "").replaceAll(".", "-");
const combinedTopics = [
  ...baseTopics.map((topic) => ({ ...topic, runtimeDate: "2026-07-02" })),
  ...historicalTopics.map((topic) => ({ ...topic, runtimeDate: normalizeRuntimeDate(topic.scheduledDate || topic.date) })),
  ...catalog.topics.map((topic) => ({ ...topic, runtimeDate: normalizeRuntimeDate(topic.scheduledDate || topic.date) })),
];
const combinedIds = combinedTopics.map((topic) => topic.id);
assert(new Set(combinedIds).size === combinedIds.length, "Combined July topics contain duplicate ids");
const julyRuntimeTopics = combinedTopics.filter((topic) => topic.runtimeDate.startsWith("2026-07-"));
const combinedDaily = julyRuntimeTopics.reduce((result, topic) => {
  (result[topic.runtimeDate] ||= []).push(topic);
  return result;
}, {});
const expectedCombinedCounts = { "2026-07-01": 10, "2026-07-02": 12 };
for (let day = 3; day <= 31; day += 1) expectedCombinedCounts[`2026-07-${String(day).padStart(2, "0")}`] = 10;
for (const [date, expected] of Object.entries(expectedCombinedCounts)) {
  const actual = combinedDaily[date]?.length || 0;
  assert(actual === expected, `${date} expected ${expected} topics, found ${actual}`);
}
assert(julyRuntimeTopics.length === 312, `Expected 312 runtime July topics, found ${julyRuntimeTopics.length}`);

for (const [date, topics] of Object.entries(daily)) {
  const largeVendors = topics.filter((topic) => topic.provenance.largeVendor);
  assert(largeVendors.length <= 3, `${date} exceeds the three-large-vendor boundary`);
  const companies = topics.map((topic) => topic.provenance.companyKey).filter(Boolean);
  assert(new Set(companies).size === companies.length, `${date} repeats a company in the same day`);
  const funding = topics.filter((topic) => topic.valueTag === "资本信号").length;
  assert(funding >= 1, `${date} has no funding signal`);
}

const manifestContext = { window: {} };
vm.runInNewContext(read("assets/generated/manifest.js"), manifestContext);
const manifest = manifestContext.window.CONTENT_FACTORY_IMAGE_MANIFEST;
assert(manifest?.provider === "codex-imagegen", "Image manifest provider must be codex-imagegen");
assert(Object.keys(manifest.tasks || {}).length >= 2, "Expected cover and inline Codex tasks");

for (const task of Object.values(manifest.tasks || {})) {
  assert(task.status === "ready", `Seed image task is not ready: ${task.id}`);
  assert(task.briefSnapshot && task.titleSnapshot && task.promptSnapshot, `Incomplete task snapshots: ${task.id}`);
}

for (const asset of Object.values(manifest.assets || {})) {
  const assetPath = path.join(root, asset.src);
  assert(fs.existsSync(assetPath), `Missing generated image asset: ${asset.src}`);
  const buffer = fs.readFileSync(assetPath);
  assert(buffer.subarray(1, 4).toString() === "PNG", `Generated asset is not PNG: ${asset.src}`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  assert(width === asset.width && height === asset.height, `Manifest dimensions do not match ${asset.src}`);
}

const imageStateContext = vm.createContext({
  imageAssetsById: { sample: { id: "sample", taskId: "task-sample" } },
  imageTasksById: { "task-sample": { id: "task-sample", briefSnapshot: "brief-v1", titleSnapshot: "title-v1" } },
});
["imageSlotPlan", "selectedImageAsset", "isSelectedImageCurrent", "currentSelectedImageAsset"].forEach((name) => {
  vm.runInContext(functionSource(name), imageStateContext);
});
const imageStateDraft = {
  selectedTitle: "title-v1",
  imagePlan: {
    cover: { prompt: "brief-v1", selectedAssetId: "sample", taskIds: ["task-sample"], adoptionSnapshot: null },
    inline: [],
  },
};
assert(imageStateContext.isSelectedImageCurrent(imageStateDraft, "cover"), "Matching image task should be current");
imageStateDraft.imagePlan.cover.prompt = "brief-v2";
assert(!imageStateContext.isSelectedImageCurrent(imageStateDraft, "cover"), "Changed prompt must make the selected image stale");
imageStateDraft.imagePlan.cover.adoptionSnapshot = {
  assetId: "sample",
  briefSnapshot: "brief-v2",
  titleSnapshot: "title-v1",
};
assert(imageStateContext.isSelectedImageCurrent(imageStateDraft, "cover"), "Explicit re-adoption must accept the stale image against current content");

assert(app.includes("workspace-v3"), "Workspace v3 migration is missing");
assert(app.includes("imageBundleForDraft"), "Image bundle handoff is missing");
assert(app.includes("awaiting_codex"), "Honest Codex waiting state is missing");
assert(app.includes("adoptionSnapshot") && app.includes('status = "superseded"'), "Image adoption/supersede state is incomplete");
assert(app.includes("currentSelectedImageAsset") && app.includes("isSelectedImageCurrent"), "Stale image exclusion is incomplete");
assert(app.includes("INLINE_IMAGE_MARKER") && app.includes("layoutSnapshotImageAsset"), "Layout image handoff flow is missing");
assert(app.includes("savePublicationFromForm") && app.includes("savePublicationRecap"), "Publication review persistence is missing");
assert(app.includes('document.querySelector("#reviewDecisionGrid")?.addEventListener("click"'), "Publication decision controls are not interactive");
assert(html.includes('id="publicationForm"') && html.includes('id="saveRecapButton"'), "Publication review controls are missing");
assert(app.includes('value="${escapeHtml(profile.id)}"'), "Writing style select must use stable ids");
assert(app.includes('document.querySelector("#runWritingStyleTestButton")') && app.includes('document.querySelector("#analyzeReferenceButton")'), "Writing style lab handlers are missing");
assert(htmlIds.includes("layoutArticleFile") && htmlIds.includes("layoutPasteTitle") && htmlIds.includes("layoutPasteEditor") && htmlIds.includes("layoutPasteToggleButton"), "Manual article import controls or separate pasted title are missing");
assert(html.includes('<span>文章标题</span>\n                  <select id="layoutDraftSelect"') && app.includes("parsed.title !== \"粘贴文章\""), "Layout title selection or pasted-title extraction is missing");
assert(html.includes("⌘V / Ctrl+V") && app.includes('addEventListener("paste"'), "Copy and paste article import is missing");
assert(app.includes("importLayoutArticle"), "Manual layout import flow is missing");
assert(css.includes(".layout-paste-import label + label") && css.includes(".layout-paste-import[open] + .gzh-format-row"), "Layout paste field spacing or section separation is missing");
assert(css.includes(".layout-paste-import input") && css.includes("border-radius: var(--gl-radius-button)") && css.includes("margin-top: 10px"), "Layout paste title matching or import action spacing is missing");
assert(!html.includes("高级检查") && !htmlIds.includes("layoutDeliveryPanel"), "Removed layout delivery panel must stay absent");
assert(!html.includes("writer-inspector") && !css.includes(".writer-inspector"), "Writing page still contains the redundant permanent inspector column");
assert(htmlIds.includes("writerSettingsPanel") && htmlIds.includes("writerSettingsSummary"), "Progressively disclosed writing settings are missing");
assert(htmlIds.includes("writerFinalCheckSummary") && htmlIds.includes("writerHandoffNote"), "Final-step writing checks are missing");
assert(htmlIds.includes("saveDraftButton") && htmlIds.includes("handoffLayoutButton") && html.indexOf('class="writer-final-actions"') > html.indexOf('data-writing-panel="images"'), "Writing completion actions must appear only in the final image step");
assert(!html.includes("editorWordCount") && !html.includes("editorSaveState") && !html.includes("writer-topic-strip") && !html.includes("topicContextToggle"), "Redundant writing-page status and source context fields must be removed");
assert((html.match(/data-writing-action="save"/g) || []).length === 1, "Only the final image step should keep an explicit confirm action");
assert(app.includes('brief: [draft.painScene, draft.coreJudgment].every'), "Optional Brief boundary fields still block step completion");
assert(app.includes("adopt.hidden") && app.includes("open.hidden") && app.includes("exportButton.hidden"), "Unavailable image actions must stay hidden until relevant");
assert(html.includes('data-page="library"') && html.includes('data-page-panel="library"'), "Topic library must remain a standalone sidebar page");
assert(htmlIds.includes("libraryPage") && htmlIds.includes("libraryDateFilter") && htmlIds.includes("libraryStatusFilter"), "Standalone topic library controls are incomplete");
assert(app.includes("libraryArchivedAt") && app.includes("allLibraryTopics") && app.includes('if (!topic.libraryArchivedAt) topic.libraryArchivedAt = new Date().toISOString()'), "Topic library archive retention is incomplete");
assert(html.includes('data-library-action="remove"') && app.includes('button.dataset.libraryAction === "remove"'), "Topic library management action is missing");

const libraryContext = vm.createContext({
  dataBatchDate: "2026-07-13",
  selectedLibraryDate: "all",
  selectedLibraryStatus: "all",
  topics: [
    { id: "queued-archived", status: "queued", score: 90, date: "2026-07-02", libraryArchivedAt: "2026-07-13T10:00:00.000Z" },
    { id: "library-legacy", status: "library", score: 80, date: "2026-07-01" },
    { id: "candidate", status: "candidate", score: 70, date: "2026-07-02" },
  ],
});
["normalizeDate", "topicDate", "isTopicArchived", "allLibraryTopics", "libraryTopics"].forEach((name) => {
  vm.runInContext(functionSource(name), libraryContext);
});
assert(libraryContext.allLibraryTopics().length === 2, "Archived writing topics or legacy library topics are missing from the library");
libraryContext.selectedLibraryStatus = "queued";
assert(libraryContext.libraryTopics().map((topic) => topic.id).join() === "queued-archived", "Topic library status filtering is incorrect");
libraryContext.selectedLibraryStatus = "all";
libraryContext.selectedLibraryDate = "2026-07-01";
assert(libraryContext.libraryTopics().map((topic) => topic.id).join() === "library-legacy", "Topic library date filtering is incorrect");
assert(html.includes('aria-label="gzh-design 公众号排版引擎"') && (html.match(/data-gzh-feature=/g) || []).length === 5 && html.includes("可多选"), "gzh-design layout requirements are not exposed through multi-select controls");
assert((html.match(/data-gzh-action="preview"/g) || []).length === 1 && html.includes("预览效果"), "Layout preview must remain a single visible primary-flow action");
assert(app.includes("currentGzhLayoutOptions") && app.includes("applyGzhLayoutOptions"), "Layout requirements are not connected to generation state");
assert(html.includes('<details class="layout-html-details">') && !html.includes("查看稿件详情") && !htmlIds.includes("layoutArticleSummary"), "Redundant layout article details must stay removed");
const layoutPageMarkup = html.slice(html.indexOf('id="layoutPage"'), html.indexOf('id="pendingPage"'));
assert(!layoutPageMarkup.includes("<h2>公众号排版</h2>"), "Layout page repeats the global page title");
assert(layoutPageMarkup.indexOf('class="layout-source-actions"') < layoutPageMarkup.indexOf('class="gzh-options-title"'), "Article import actions must appear before layout requirements");
assert(layoutPageMarkup.indexOf('class="gzh-intake-row"') < layoutPageMarkup.indexOf('class="gzh-format-row"'), "Layout intake controls must appear before format controls");
assert(layoutPageMarkup.indexOf('id="layoutPasteImport"') < layoutPageMarkup.indexOf('class="gzh-format-row"'), "Paste import panel must stay near article intake controls");
assert(layoutPageMarkup.indexOf('class="layout-final-actions"') > layoutPageMarkup.indexOf('class="layout-editor-stack"'), "Layout actions must appear below the article editor");
assert(app.includes("pickGzhKeyword") && app.includes("gzhSectionLabel") && app.includes("detectGzhArticleType"), "gzh-design skill structure intelligence is missing");
assert(app.includes("THE NEXT MOVE") && app.includes("你会看到什么") && app.includes("{{作者名}}"), "gzh-design skill article skeleton is incomplete");
assert(htmlIds.includes("pendingPage") && htmlIds.includes("pendingPublishList") && htmlIds.includes("savePendingPublishButton"), "Pending publication UI is missing");
assert((html.match(/data-save-pending-publication/g) || []).length === 1 && html.includes("保存稿件"), "Persistent layout save entry is missing");
assert(html.includes('data-page="pending"') && html.includes('data-page-panel="pending"'), "Pending publication navigation is missing");
assert(app.includes("pendingPublicationDraftsById") && app.includes("pendingPublications: pendingPublicationDraftsById"), "Pending publication persistence is missing");
assert(app.includes("saveLayoutAsPendingPublication") && app.includes("renderPendingPublications") && app.includes("continuePendingPublicationLayout"), "Pending publication workflow is incomplete");
assert(app.includes("function deletePendingPublication(id)") && app.includes("data-delete-pending-publication"), "Pending publication deletion is missing");

const layoutContext = vm.createContext({
  DEFAULT_GZH_THEME: "观澜判断感 / 观澜蓝内参风",
  INLINE_IMAGE_MARKER: "[[INLINE_IMAGE_1]]",
});
[
  "normalizeGzhHeadingText",
  "explicitGzhHeading",
  "nearestNonEmptyGzhLineIndex",
  "nearestNonEmptyGzhLine",
  "chineseGzhSequenceMarker",
  "chineseNumberedGzhHeading",
  "pairedChineseGzhHeading",
  "standaloneChineseGzhMarkerHeading",
  "arabicGzhHeading",
  "looksLikeStandaloneGzhHeading",
  "contextualGzhHeading",
  "parseMarkdownForLayout",
  "detectGzhArticleType",
  "recommendGzhTheme",
  "importedFileTitle",
  "normalizeImportedArticle",
  "layoutSnapshotTitle",
].forEach((name) => vm.runInContext(functionSource(name), layoutContext));

const skillStructureSample = `# Skill 排版回归

> 关键不在工具数量，而在业务流程。

## 先看外部信号

### 可核对的数据

| 字段 | 说明 |
| --- | --- |
| 增长 | 20% |

\`\`\`bash
npx skills add gzh-design
\`\`\`

![示意图](https://example.com/example.png)

## 结论与下一步

1. 保留人工兜底
2. 记录验收结果`;
const parsedSkillStructure = layoutContext.parseMarkdownForLayout(skillStructureSample, "Skill 排版回归");
assert(parsedSkillStructure.blocks.some((block) => block.type === "heading" && block.level === 3), "Markdown subheadings are not preserved");
assert(parsedSkillStructure.blocks.some((block) => block.type === "table"), "Markdown tables are not preserved");
assert(parsedSkillStructure.blocks.some((block) => block.type === "code" && block.language === "bash"), "Fenced code blocks are not preserved");
assert(parsedSkillStructure.blocks.some((block) => block.type === "image"), "Markdown images are not preserved");
assert(parsedSkillStructure.blocks.some((block) => block.type === "list" && block.ordered), "Ordered list semantics are not preserved");
const normalizedSkillStructure = layoutContext.normalizeImportedArticle(skillStructureSample.replace(/^# /, ""), { name: "skill-structure.txt", type: "text/plain" });
assert(normalizedSkillStructure.markdown.includes("```bash\nnpx skills add gzh-design\n```"), "Plain-text normalization corrupted a fenced code block");

const importSample = `企业 AI 落地，先别急着买平台

这是一句完整的摘要。

**先看客户入口，不看工具数量**

如果上下文不完整，再强的模型也无法直接交付。

一、把流程写成五列

先列清输入、动作、输出、责任人和验收标准。

真正的判断

AI 项目是一轮可以复盘的业务实验。

1. 选一个高频场景
2. 保留人工兜底`;
const normalizedImport = layoutContext.normalizeImportedArticle(importSample, { name: "sample.txt", type: "text/plain" });
const parsedImport = layoutContext.parseMarkdownForLayout(normalizedImport.markdown, normalizedImport.title);
assert(normalizedImport.title === "企业 AI 落地，先别急着买平台", "Imported title was not detected");
assert(parsedImport.blocks.filter((block) => block.type === "heading").length === 3, "Expected bold, Chinese-numbered and standalone headings");
assert(parsedImport.blocks.filter((block) => block.type === "list").length === 1, "Numbered body list was misclassified as headings");
assert(parsedImport.blocks.some((block) => block.type === "paragraph" && block.text === "这是一句完整的摘要。"), "Short sentence was misclassified as a heading");
const explicitTitleImport = layoutContext.normalizeImportedArticle("正文第一段应该被保留。\n\n第二段继续说明业务背景。", { name: "paste.txt", type: "text/plain" }, "单独粘贴的文章标题");
assert(explicitTitleImport.title === "单独粘贴的文章标题", "Explicit pasted title was not preferred");
assert(explicitTitleImport.markdown.includes("正文第一段应该被保留。"), "Explicit title import removed the first body paragraph");
assert(layoutContext.layoutSnapshotTitle({ title: "粘贴文章", layout: { markdown: "# 真实文章标题\n\n正文" } }) === "真实文章标题", "Legacy pasted placeholder title was not replaced");
assert(layoutContext.layoutSnapshotTitle({ title: "粘贴文章", markdown: "没有标题的正文" }) === "未命名文章", "Placeholder title must not remain visible");
const densePasteSample = `企业 AI 项目复盘指南
开场先交代一段完整的业务背景，说明老板当前遇到的收入、效率与风险问题。
01｜先看客户入口
这里是第一节的长正文，用于检验没有空行时的数字小标题识别能力。
02. 再看验收标准
这里是第二节的长正文，小标题与上下文之间都没有额外空行。
为什么流程比工具重要
这是一段带句号的长正文，解释为什么要先改造业务流程。
结论：先做一个小闭环
最后用一段完整正文说明下一步行动和人工兜底边界。

行动清单

1. 选一个高频场景
2. 保留人工兜底
3. 记录验收结果`;
const normalizedDensePaste = layoutContext.normalizeImportedArticle(densePasteSample, { name: "dense.txt", type: "text/plain" });
const parsedDensePaste = layoutContext.parseMarkdownForLayout(normalizedDensePaste.markdown, normalizedDensePaste.title);
assert(parsedDensePaste.blocks.filter((block) => block.type === "heading").length === 5, "Dense pasted article headings were not recognized");
assert(parsedDensePaste.blocks.filter((block) => block.type === "list").length === 1, "Consecutive numbered checklist was misclassified as headings");
const arabicFormatSample = `数字格式测试
开场正文足够长，用来区分标题与普通文本，并覆盖公众号常见编号格式。
03）全角括号小标题
这里是全角括号编号标题之后的完整正文，用于确认识别结果。
04 | 分隔符前有空格
这里是分隔符前留空格的小标题正文，同样应该进入标题结构。

行动列表

1）保留人工兜底
2）记录验收结果
3）每周复盘一次`;
const normalizedArabicFormat = layoutContext.normalizeImportedArticle(arabicFormatSample, { name: "arabic-formats.txt", type: "text/plain" });
const parsedArabicFormat = layoutContext.parseMarkdownForLayout(normalizedArabicFormat.markdown, normalizedArabicFormat.title);
assert(parsedArabicFormat.blocks.filter((block) => block.type === "heading").length === 3, "Full-width or spaced Arabic headings were not recognized");
assert(parsedArabicFormat.blocks.filter((block) => block.type === "list").length === 1, "Full-width numbered checklist was misclassified as headings");
const chineseSequenceSample = `中文序号格式测试
开场正文足够长，用于区分中文序号标题和普通列表内容。
第一，先看客户入口
这里是第一节的完整正文，说明客户入口为什么决定项目是否成立。
第二、再看交付标准
这里是第二节的完整正文，说明交付标准必须能够被业务人员验收。
一：组织是否准备好
这里是第三节的完整正文，用于覆盖单字中文序号加冒号的格式。
二. 流程是否能闭环
这里是第四节的完整正文，用于覆盖单字中文序号加点号的格式。`;
const normalizedChineseSequence = layoutContext.normalizeImportedArticle(chineseSequenceSample, { name: "chinese-sequence.txt", type: "text/plain" });
const parsedChineseSequence = layoutContext.parseMarkdownForLayout(normalizedChineseSequence.markdown, normalizedChineseSequence.title);
assert(parsedChineseSequence.blocks.filter((block) => block.type === "heading").length === 4, "Inline 第一/第二 or 一/二 headings were not recognized");
const pairedChineseSample = `两行中文序号测试
开场正文足够长，用来确认序号独立成行时不会混入正文。
第一
客户入口先变了
这里是第一节的完整正文，标题位于序号下一行。
第二
交付标准必须明确
这里是第二节的完整正文，同样采用序号和标题分行结构。`;
const normalizedPairedChinese = layoutContext.normalizeImportedArticle(pairedChineseSample, { name: "paired-chinese.txt", type: "text/plain" });
const parsedPairedChinese = layoutContext.parseMarkdownForLayout(normalizedPairedChinese.markdown, normalizedPairedChinese.title);
assert(parsedPairedChinese.blocks.filter((block) => block.type === "heading").length === 2, "Two-line 第一/第二 heading pairs were not recognized");
assert(!parsedPairedChinese.blocks.some((block) => block.type === "paragraph" && /^(?:第一|第二)$/.test(block.text)), "Standalone sequence marker leaked into article paragraphs");
const markerOnlyChinese = layoutContext.parseMarkdownForLayout("# 主标题\n一\n这是一段足够长的正文，用于确认单字序号可以单独作为小标题。\n二\n这是第二段足够长的正文，用于确认连续章节仍能正确识别。", "主标题");
assert(markerOnlyChinese.blocks.filter((block) => block.type === "heading").length === 2, "Standalone 一/二 headings were not recognized");
const chineseChecklist = layoutContext.parseMarkdownForLayout("# 清单\n\n一、保留人工兜底\n二、记录验收结果\n三、每周复盘一次", "清单");
assert(chineseChecklist.blocks.filter((block) => block.type === "heading").length === 0, "Consecutive Chinese checklist items were misclassified as headings");
assert(chineseChecklist.blocks.filter((block) => block.type === "list").length === 1, "Consecutive Chinese checklist was not preserved as a list");
const directionSequenceSample = `方向序号格式测试
开场正文足够长，用于确认带语义前缀的序号标题可以稳定识别。
方向一，先收敛客户入口
这里是方向一的完整正文，用于验证中文逗号连接的小标题。
方向二：再明确交付标准
这里是方向二的完整正文，用于验证中文冒号连接的小标题。
方向三
这里是方向三的完整正文，用于验证仅使用方向序号作为小标题。`;
const normalizedDirectionSequence = layoutContext.normalizeImportedArticle(directionSequenceSample, { name: "direction-sequence.txt", type: "text/plain" });
const parsedDirectionSequence = layoutContext.parseMarkdownForLayout(normalizedDirectionSequence.markdown, normalizedDirectionSequence.title);
assert(parsedDirectionSequence.blocks.filter((block) => block.type === "heading").length === 3, "方向一/方向二 semantic headings were not recognized");
const pairedDirectionSample = `方向分行格式测试
开场正文足够长，用于确认方向序号和标题分行时仍能正确识别。
方向一
先验证客户入口
这里是第一部分的完整正文，方向序号与标题分别占一行。
方向二
再确认验收标准
这里是第二部分的完整正文，继续验证方向序号分行结构。`;
const normalizedPairedDirection = layoutContext.normalizeImportedArticle(pairedDirectionSample, { name: "paired-direction.txt", type: "text/plain" });
const parsedPairedDirection = layoutContext.parseMarkdownForLayout(normalizedPairedDirection.markdown, normalizedPairedDirection.title);
assert(parsedPairedDirection.blocks.filter((block) => block.type === "heading").length === 2, "Two-line 方向一/方向二 heading pairs were not recognized");
assert(!parsedPairedDirection.blocks.some((block) => block.type === "paragraph" && /^方向[一二]$/.test(block.text)), "Direction sequence marker leaked into article paragraphs");
const realFinancingArticleSample = `过去一周，AI 领域的公开融资至少有 25 笔，从 265 亿美元的超级 IPO 到 80 万美元的种子轮，金额跨度超过三个数量级。

但如果你把这 25 笔钱放在一起看，会发现它们不是均匀撒向各个方向的 —— 它们清晰地指向了三个方向，每一个都对应着资本市场对 AI 行业的不同判断。理解这三个方向，比记住哪家公司融了多少钱更重要。

方向一：芯片与算力 ——280 亿证明了一件事，AI 的底层还没到头

这个方向上的数字大到足以占据所有头条。SK Hynix 以 265 亿美元的规模完成美国 IPO，成为史上最大的外国公司美国上市交易。

方向二：企业 AI 落地基础设施 —— 资本开始为「用起来」买单

这个方向的标志性事件是 Prime Intellect 完成的 1.3 亿美元 A 轮融资，估值突破 10 亿美元。

方向三：垂直场景应用 —— 贴着具体生意走的小公司正在批量出现

这个方向上的金额小得多，但切口之精准、场景之具体，反而更能说明 AI 落地正在发生什么样的变化。`;
const normalizedRealFinancingArticle = layoutContext.normalizeImportedArticle(realFinancingArticleSample, { name: "粘贴文章.md", type: "text/markdown" });
const parsedRealFinancingArticle = layoutContext.parseMarkdownForLayout(normalizedRealFinancingArticle.markdown, normalizedRealFinancingArticle.title);
assert(parsedRealFinancingArticle.blocks.filter((block) => block.type === "heading").length === 3, "Real financing article direction headings were not recognized");
assert(parsedRealFinancingArticle.blocks.filter((block) => block.type === "heading").every((block) => /^(?:芯片与算力|企业 AI 落地基础设施|垂直场景应用)/.test(block.text)), "Real financing article heading text was normalized incorrectly");
const headingAfterTitle = layoutContext.parseMarkdownForLayout("# 主标题\n客户入口先变了\n这是一段足够长的正文，用来确认紧贴主标题的首个短标题也能被识别。", "主标题");
assert(headingAfterTitle.blocks[0]?.type === "heading" && headingAfterTitle.blocks[0]?.text === "客户入口先变了", "Unmarked heading immediately after the article title was not recognized");
const markerImport = layoutContext.parseMarkdownForLayout(`# 标题\n\n开头\n\n${layoutContext.INLINE_IMAGE_MARKER}\n\n结尾`, "标题");
assert(markerImport.blocks.some((block) => block.type === "image-placeholder"), "Inline image marker was not preserved as a layout block");
assert(layoutContext.recommendGzhTheme(normalizedImport.markdown) === "观澜判断感 / 观澜蓝内参风", "Enterprise article theme recommendation changed");
assert((css.match(/{/g) || []).length === (css.match(/}/g) || []).length, "CSS braces are unbalanced");

console.log(JSON.stringify({
  ok: true,
  htmlIds: htmlIds.length,
  julyDays: Object.keys(expectedCombinedCounts).length,
  julyTopics: Object.values(expectedCombinedCounts).reduce((sum, count) => sum + count, 0),
  generatedTopics: catalog.topics.length,
  sourceActiveDate: catalog.source.activeDate,
  imageTasks: Object.keys(manifest.tasks).length,
  imageAssets: Object.keys(manifest.assets).length,
}, null, 2));
