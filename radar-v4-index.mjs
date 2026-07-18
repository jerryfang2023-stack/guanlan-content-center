import { DatabaseSync } from "node:sqlite";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const V4_DATA_PATH = "01-SiteV2/site/data/data-center-v4";
const DEFAULT_GITHUB_RAW_BASE = "https://raw.githubusercontent.com/jerryfang2023-stack/AI-Radar/main";
const CACHE_MAX_AGE_MS = 5 * 60 * 1000;
const SEARCH_LIMIT = 12;
const SEARCH_DICTIONARY = [
  "企业", "AI", "Agent", "智能体", "融资", "并购", "案例", "落地", "部署", "工作流",
  "制造", "医疗", "金融", "零售", "教育", "产品", "客户", "收入", "成本", "采购",
  "销售", "客服", "营销", "安全", "治理", "模型", "开源", "硬件", "芯片", "机器人",
];

function clean(value, limit = 4000) {
  return String(value || "").trim().slice(0, limit);
}

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJsonAtomic(filePath, value) {
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(value), "utf8");
  await rename(temporaryPath, filePath);
}

function normalizeMaterial(event) {
  const id = clean(event?.id, 160);
  const title = clean(event?.title || event?.originalTitle || event?.subject, 600);
  if (!id || !title) return null;
  const entities = Array.isArray(event.entityNames) ? event.entityNames.map((item) => clean(item, 160)).filter(Boolean) : [];
  const metrics = Array.isArray(event.metrics) ? event.metrics.map((item) => clean(item, 120)).filter(Boolean) : [];
  const tags = Array.isArray(event.displayTags)
    ? event.displayTags.map((item) => clean(
      typeof item === "object" ? item?.label || item?.name || item?.value || item?.id : item,
      120,
    )).filter(Boolean)
    : [];
  const summaryParts = [event.subject, event.action, event.object]
    .map((item) => clean(item, 800))
    .filter((item, index, values) => item && values.indexOf(item) === index && item !== title);
  return {
    id,
    title,
    originalTitle: clean(event.originalTitle, 800),
    date: clean(event.date || event.dataDate, 20),
    updatedDate: clean(event.updatedDate || event.dataDate, 20),
    type: clean(event.eventTypeLabel || event.eventType, 80),
    typeKey: clean(event.eventType, 80),
    group: clean(event.eventGroup, 120),
    status: clean(event.publicationStatus || event.status, 80),
    publisher: clean(event.publisher, 200),
    sourceUrl: clean(event.sourceUrl, 1200),
    entities,
    metrics,
    tags,
    summary: summaryParts.join("；"),
  };
}

function materialSearchText(material) {
  return [
    material.title,
    material.originalTitle,
    material.summary,
    material.type,
    material.group,
    material.publisher,
    ...material.entities,
    ...material.metrics,
    ...material.tags,
  ].filter(Boolean).join(" ");
}

function searchTerms(query) {
  const source = clean(query, 1200);
  const dictionaryTerms = SEARCH_DICTIONARY.filter((term) => source.toLowerCase().includes(term.toLowerCase()));
  const latinTerms = source.match(/[A-Za-z][A-Za-z0-9._-]{2,}/g) || [];
  const chunks = source
    .replace(/请|帮我|从观澜|从观察台|观察台|素材|最近|今天|这周|本周|寻找|找出|找|看看|关于|有哪些|有什么|一个|一些|直接|先|再|写成|写一篇|写文章|选题|内容|里面|中的|可以|需要|希望|想要|用于|根据/g, " ")
    .split(/[\s,，。；;：:、！？!?（）()【】\[\]“”"'\/]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3 && item.length <= 24);
  return [...new Set([...dictionaryTerms, ...latinTerms, ...chunks])].slice(0, 10);
}

function ftsQueryFor(query) {
  return searchTerms(query)
    .filter((term) => [...term].length >= 3)
    .map((term) => `"${term.replaceAll('"', '""')}"`)
    .join(" OR ");
}

export function createRadarV4Index({ root }) {
  const cacheDir = resolve(root, ".cache", "radar-v4");
  const cacheEventsPath = resolve(cacheDir, "events.json");
  const cacheManifestPath = resolve(cacheDir, "manifest.json");
  const cacheStatePath = resolve(cacheDir, "source-state.json");
  const databasePath = resolve(cacheDir, "materials.sqlite");
  const githubRawBase = clean(process.env.AI_RADAR_GITHUB_RAW_BASE || DEFAULT_GITHUB_RAW_BASE, 1000).replace(/\/$/, "");
  const configuredRoot = clean(process.env.AI_RADAR_ROOT, 1200);
  const configuredEventsPath = clean(process.env.AI_RADAR_V4_EVENTS_PATH, 1200);
  const localRootCandidates = [
    configuredRoot,
    "/Users/jerry/claude/AI-Radar",
    resolve(root, "..", "AI-Radar"),
  ].filter(Boolean);
  let database = null;
  let readyPromise = null;
  let status = {
    state: "idle",
    source: "",
    version: "",
    generatedAt: "",
    indexed: 0,
    total: 0,
    lastSyncedAt: "",
    error: "",
  };

  function openDatabase() {
    if (database) return database;
    database = new DatabaseSync(databasePath);
    database.exec("PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;");
    return database;
  }

  function rebuildIndex(events) {
    const materials = events.map(normalizeMaterial).filter(Boolean);
    const db = openDatabase();
    db.exec(`
      DROP TABLE IF EXISTS materials;
      DROP TABLE IF EXISTS materials_fts;
      CREATE TABLE materials (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        original_title TEXT,
        event_date TEXT,
        updated_date TEXT,
        type TEXT,
        type_key TEXT,
        event_group TEXT,
        publication_status TEXT,
        publisher TEXT,
        source_url TEXT,
        entities_json TEXT,
        metrics_json TEXT,
        tags_json TEXT,
        summary TEXT,
        search_text TEXT NOT NULL
      );
      CREATE VIRTUAL TABLE materials_fts USING fts5(id UNINDEXED, search_text, tokenize='trigram');
    `);
    const insertMaterial = db.prepare(`
      INSERT INTO materials (
        id, title, original_title, event_date, updated_date, type, type_key, event_group,
        publication_status, publisher, source_url, entities_json, metrics_json, tags_json,
        summary, search_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertFts = db.prepare("INSERT INTO materials_fts (id, search_text) VALUES (?, ?)");
    db.exec("BEGIN");
    try {
      materials.forEach((material) => {
        const searchText = materialSearchText(material);
        insertMaterial.run(
          material.id, material.title, material.originalTitle, material.date, material.updatedDate,
          material.type, material.typeKey, material.group, material.status, material.publisher,
          material.sourceUrl, JSON.stringify(material.entities), JSON.stringify(material.metrics),
          JSON.stringify(material.tags), material.summary, searchText,
        );
        insertFts.run(material.id, searchText);
      });
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    return materials.length;
  }

  async function localSource() {
    if (configuredEventsPath && await fileExists(configuredEventsPath)) {
      return { eventsPath: configuredEventsPath, manifestPath: "", source: "local" };
    }
    for (const candidate of localRootCandidates) {
      const eventsPath = resolve(candidate, V4_DATA_PATH, "indexes", "events.json");
      if (!await fileExists(eventsPath)) continue;
      return {
        eventsPath,
        manifestPath: resolve(candidate, V4_DATA_PATH, "manifest.json"),
        source: "local",
      };
    }
    return null;
  }

  async function fetchJson(url, { etag = "" } = {}) {
    const headers = { Accept: "application/json" };
    if (etag) headers["If-None-Match"] = etag;
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const response = await fetch(url, { headers });
    if (response.status === 304) return { unchanged: true, etag };
    if (!response.ok) throw new Error(`GitHub 数据读取失败（${response.status}）`);
    return { value: await response.json(), etag: response.headers.get("etag") || "" };
  }

  async function githubSource({ force = false } = {}) {
    await mkdir(cacheDir, { recursive: true });
    let sourceState = {};
    try { sourceState = await readJson(cacheStatePath); } catch { sourceState = {}; }
    const cached = await fileExists(cacheEventsPath);
    const cacheAge = Date.now() - Number(sourceState.checkedAt || 0);
    if (!force && cached && cacheAge < CACHE_MAX_AGE_MS) {
      return {
        events: await readJson(cacheEventsPath),
        manifest: await readJson(cacheManifestPath).catch(() => ({})),
        source: "github-cache",
      };
    }
    try {
      const manifestResult = await fetchJson(`${githubRawBase}/${V4_DATA_PATH}/manifest.json`, { etag: sourceState.manifestEtag });
      const eventResult = await fetchJson(`${githubRawBase}/${V4_DATA_PATH}/indexes/events.json`, { etag: sourceState.eventsEtag });
      const manifest = manifestResult.unchanged
        ? await readJson(cacheManifestPath)
        : manifestResult.value;
      const eventsPayload = eventResult.unchanged
        ? await readJson(cacheEventsPath)
        : eventResult.value;
      if (!manifestResult.unchanged) await writeJsonAtomic(cacheManifestPath, manifest);
      if (!eventResult.unchanged) await writeJsonAtomic(cacheEventsPath, eventsPayload);
      await writeJsonAtomic(cacheStatePath, {
        checkedAt: Date.now(),
        manifestEtag: manifestResult.etag || sourceState.manifestEtag || "",
        eventsEtag: eventResult.etag || sourceState.eventsEtag || "",
      });
      return { events: eventsPayload, manifest, source: eventResult.unchanged ? "github-cache" : "github" };
    } catch (error) {
      if (!cached) throw error;
      return {
        events: await readJson(cacheEventsPath),
        manifest: await readJson(cacheManifestPath).catch(() => ({})),
        source: "github-cache",
        warning: clean(error?.message, 300),
      };
    }
  }

  async function synchronize({ force = false } = {}) {
    status = { ...status, state: "loading", error: "" };
    await mkdir(cacheDir, { recursive: true });
    try {
      const local = await localSource();
      let payload;
      if (local) {
        payload = {
          events: await readJson(local.eventsPath),
          manifest: local.manifestPath && await fileExists(local.manifestPath) ? await readJson(local.manifestPath) : {},
          source: local.source,
        };
      } else {
        payload = await githubSource({ force });
      }
      const events = Array.isArray(payload.events) ? payload.events : payload.events?.events;
      if (!Array.isArray(events)) throw new Error("观察台 V4 事件索引格式无效");
      const indexed = rebuildIndex(events);
      status = {
        state: "ready",
        source: payload.source,
        version: clean(payload.manifest?.productVersion || payload.events?.meta?.productVersion || "SITE-V4", 120),
        generatedAt: clean(payload.manifest?.generatedAt || payload.events?.meta?.generatedAt, 80),
        indexed,
        total: Number(payload.manifest?.counts?.events || events.length),
        lastSyncedAt: new Date().toISOString(),
        error: payload.warning || "",
      };
      return status;
    } catch (error) {
      status = { ...status, state: "error", error: clean(error?.message, 400) || "观察台 V4 索引失败" };
      throw error;
    }
  }

  async function ensureReady({ force = false } = {}) {
    if (!force && status.state === "ready" && database) return status;
    if (!force && readyPromise) return readyPromise;
    readyPromise = synchronize({ force }).finally(() => { readyPromise = null; });
    return readyPromise;
  }

  function rowToMaterial(row) {
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      originalTitle: row.original_title,
      date: row.event_date,
      updatedDate: row.updated_date,
      type: row.type,
      typeKey: row.type_key,
      group: row.event_group,
      status: row.publication_status,
      publisher: row.publisher,
      sourceUrl: row.source_url,
      entities: JSON.parse(row.entities_json || "[]"),
      metrics: JSON.parse(row.metrics_json || "[]"),
      tags: JSON.parse(row.tags_json || "[]"),
      summary: row.summary,
    };
  }

  async function search(query, { limit = SEARCH_LIMIT } = {}) {
    await ensureReady();
    const db = openDatabase();
    const safeLimit = Math.max(1, Math.min(Number(limit || SEARCH_LIMIT), 30));
    const ftsQuery = ftsQueryFor(query);
    let rows = [];
    if (ftsQuery) {
      try {
        rows = db.prepare(`
          SELECT m.*, bm25(materials_fts) AS search_rank
          FROM materials_fts
          JOIN materials m ON m.id = materials_fts.id
          WHERE materials_fts MATCH ?
          ORDER BY search_rank ASC, m.event_date DESC
          LIMIT 240
        `).all(ftsQuery);
      } catch {
        rows = [];
      }
    }
    if (!rows.length) {
      rows = db.prepare("SELECT * FROM materials ORDER BY event_date DESC").all();
    }
    const terms = searchTerms(query);
    const commonTerms = new Set(["AI", "企业", "案例", "产品", "Agent", "智能体"]);
    const ranked = rows.map((row) => {
      const material = rowToMaterial(row);
      const title = material.title.toLowerCase();
      const summary = material.summary.toLowerCase();
      const type = `${material.type} ${material.group}`.toLowerCase();
      const supporting = `${material.publisher} ${material.entities.join(" ")} ${material.tags.join(" ")}`.toLowerCase();
      const relevance = terms.reduce((score, term) => {
        const normalized = term.toLowerCase();
        const weight = commonTerms.has(term) ? 1 : 4;
        return score
          + (title.includes(normalized) ? weight * 4 : 0)
          + (type.includes(normalized) ? weight * 5 : 0)
          + (summary.includes(normalized) ? weight * 2 : 0)
          + (supporting.includes(normalized) ? weight : 0);
      }, 0);
      return { material, relevance };
    }).filter((item) => !terms.length || item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance || b.material.date.localeCompare(a.material.date))
      .slice(0, safeLimit)
      .map((item) => item.material);
    const items = ranked.length
      ? ranked
      : rows.slice(0, safeLimit).map(rowToMaterial).filter(Boolean);
    return { status, items, query: clean(query, 1200) };
  }

  async function getMaterial(id) {
    await ensureReady();
    return rowToMaterial(openDatabase().prepare("SELECT * FROM materials WHERE id = ?").get(clean(id, 160)));
  }

  return {
    warm: () => ensureReady().catch(() => status),
    sync: () => ensureReady({ force: true }),
    search,
    getMaterial,
    getStatus: () => ({ ...status }),
  };
}
