import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
process.env.AI_RADAR_V4_EVENTS_PATH = resolve(here, "fixtures", "radar-v4-events.json");
const { createRadarV4Index } = await import("../radar-v4-index.mjs");
const root = await mkdtemp(resolve(tmpdir(), "content-factory-radar-v4-"));
const radar = createRadarV4Index({ root });
const status = await radar.warm();
if (status.state !== "ready" || status.indexed !== 2) throw new Error("V4 fixture index failed");
const result = await radar.search("企业 AI 融资", { limit: 1 });
if (result.items[0]?.id !== "EV-test-funding") throw new Error("V4 FTS search ranking failed");
const material = await radar.getMaterial("EV-test-funding");
if (material?.sourceUrl !== "https://example.com/funding") throw new Error("V4 material lookup failed");
console.log(JSON.stringify({ ok: true, indexed: status.indexed, firstResult: result.items[0]?.id }));
