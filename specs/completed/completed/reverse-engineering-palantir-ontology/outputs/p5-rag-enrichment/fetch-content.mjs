#!/usr/bin/env node

/**
 * P5 Content Fetcher — Fetches page content for all eligible entries.
 * - Uses Playwright for Medium/blog domains (they block standard HTTP)
 * - Uses native fetch for everything else
 * - Saves text content to cache/ directory
 * - Produces fetch-log.json with status per entry
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import * as O from "effect/Option";
import * as Str from "effect/String";


const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, "cache");
const MASTER_PATH = join(__dirname, "..", "p2-web-research", "master.json");
const LOG_PATH = join(__dirname, "fetch-log.json");

// Domains that need Playwright (Medium blocks HTTP)
const PLAYWRIGHT_DOMAINS = [
  "blog.palantir.com",
  "medium.com",
  ".medium.com", // subdomains like dorians.medium.com
];

const needsPlaywright = (url) => {
  try {
    const hostname = new URL(url).hostname;
    return PLAYWRIGHT_DOMAINS.some((d) => hostname === d || hostname.endsWith(d));
  } catch {
    return false;
  }
};

const urlToHash = (url) => createHash("md5").update(url).digest("hex");

const cachePath = (url) => join(CACHE_DIR, `${urlToHash(url)}.txt`);

const isCached = (url) => existsSync(cachePath(url));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Rate limiting
const DELAY_HTTP = 200; // ms between HTTP requests
const DELAY_PLAYWRIGHT = 1000; // ms between Playwright navigations
const FETCH_TIMEOUT = 15000; // 15s timeout
const MAX_CONTENT_LENGTH = 50000; // 50KB max per page

async function fetchWithHTTP(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const html = await res.text();
    // Basic HTML to text extraction
    const text = htmlToText(html);
    return { ok: true, content: Str.slice(0, MAX_CONTENT_LENGTH)(text) };
  } catch (e) {
    clearTimeout(timeout);
    return { ok: false, error: e.message };
  }
}

function htmlToText(html) {
  // Remove script, style, nav, footer, header tags and their content
  let text = Str.replace(/<header[\s\S]*?<\/header>/gi, "")(Str.replace(/<footer[\s\S]*?<\/footer>/gi, "")(Str.replace(/<nav[\s\S]*?<\/nav>/gi, "")(Str.replace(/<style[\s\S]*?<\/style>/gi, "")(Str.replace(/<script[\s\S]*?<\/script>/gi, "")(html)))));

  // Try to extract main/article content first
  const mainMatch = O.getOrNull(O.fromNullishOr(Str.match(/<(?:main|article)[\s\S]*?>([\s\S]*?)<\/(?:main|article)>/i)(text)));
  if (mainMatch) {
    text = mainMatch[1];
  }

  // Replace common block elements with newlines
  text = Str.trim(Str.replace(/\n\s*\n/g, "\n\n")(Str.replace(/[ \t]+/g, " ")(Str.replace(/&#x2F;/g, "/")(Str.replace(/&#x27;/g, "'")(Str.replace(/&nbsp;/g, " ")(Str.replace(/&#39;/g, "'")(Str.replace(/&quot;/g, '"')(Str.replace(/&gt;/g, ">")(Str.replace(/&lt;/g, "<")(Str.replace(/&amp;/g, "&")(Str.replace(/<[^>]+>/g, " ")(Str.replace(/<(?:p|div|h[1-6]|li|tr|blockquote)[^>]*>/gi, "\n")(Str.replace(/<\/(?:p|div|h[1-6]|li|tr|blockquote)>/gi, "\n")(Str.replace(/<br\s*\/?>/gi, "\n")(text)))))))))))))));

  return text;
}

async function fetchWithPlaywright(browser, url) {
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    // Try to get article content specifically for Medium
    const text = await page.evaluate(() => {
      // Medium article body
      const article =
        document.querySelector("article") || document.querySelector('[role="main"]') || document.querySelector("main");
      if (article) {
        return article.innerText;
      }
      // Fallback: get body text minus nav/header/footer
      const body = document.body.cloneNode(true);
      body.querySelectorAll("nav, header, footer, script, style, [role=navigation]").forEach((el) => el.remove());
      return body.innerText;
    });

    await context.close();
    return { ok: true, content: Str.slice(0, MAX_CONTENT_LENGTH)((text || "")) };
  } catch (e) {
    await context.close();
    return { ok: false, error: e.message };
  }
}

async function main() {
  const master = JSON.parse(readFileSync(MASTER_PATH, "utf-8"));
  const eligible = master.filter((e) => e.quality >= 2);

  console.log(`Total eligible entries: ${eligible.length}`);

  // Split into HTTP and Playwright groups
  const httpEntries = eligible.filter((e) => !needsPlaywright(e.url));
  const pwEntries = eligible.filter((e) => needsPlaywright(e.url));

  console.log(`HTTP fetchable: ${httpEntries.length}`);
  console.log(`Playwright needed: ${pwEntries.length}`);

  // Check cache
  const httpUncached = httpEntries.filter((e) => !isCached(e.url));
  const pwUncached = pwEntries.filter((e) => !isCached(e.url));
  console.log(`HTTP uncached: ${httpUncached.length}`);
  console.log(`Playwright uncached: ${pwUncached.length}`);

  const log = [];

  // Phase 1: HTTP fetches
  console.log("\n--- Phase 1: HTTP fetching ---");
  let httpOk = 0;
  let httpFail = 0;
  for (let i = 0; i < httpUncached.length; i++) {
    const entry = httpUncached[i];
    process.stdout.write(`  [${i + 1}/${httpUncached.length}] ${Str.slice(0, 80)(entry.url)}...`);
    const result = await fetchWithHTTP(entry.url);
    if (result.ok) {
      writeFileSync(cachePath(entry.url), result.content, "utf-8");
      httpOk++;
      console.log(` OK (${result.content.length} chars)`);
    } else {
      httpFail++;
      console.log(` FAIL: ${result.error}`);
    }
    log.push({
      url: entry.url,
      method: "http",
      status: result.ok ? "ok" : "error",
      error: result.error || null,
      contentLength: result.ok ? result.content.length : 0,
    });
    await sleep(DELAY_HTTP);
  }
  console.log(`HTTP: ${httpOk} ok, ${httpFail} failed`);

  // Phase 2: Playwright fetches
  if (pwUncached.length > 0) {
    console.log("\n--- Phase 2: Playwright fetching ---");
    const browser = await chromium.launch({ headless: true });
    let pwOk = 0;
    let pwFail = 0;
    for (let i = 0; i < pwUncached.length; i++) {
      const entry = pwUncached[i];
      process.stdout.write(`  [${i + 1}/${pwUncached.length}] ${Str.slice(0, 80)(entry.url)}...`);
      const result = await fetchWithPlaywright(browser, entry.url);
      if (result.ok && result.content.length > 100) {
        writeFileSync(cachePath(entry.url), result.content, "utf-8");
        pwOk++;
        console.log(` OK (${result.content.length} chars)`);
      } else {
        pwFail++;
        const err = result.error || "content too short";
        console.log(` FAIL: ${err}`);
        log.push({
          url: entry.url,
          method: "playwright",
          status: "error",
          error: err,
          contentLength: 0,
        });
        continue;
      }
      log.push({
        url: entry.url,
        method: "playwright",
        status: "ok",
        error: null,
        contentLength: result.content.length,
      });
      await sleep(DELAY_PLAYWRIGHT);
    }
    await browser.close();
    console.log(`Playwright: ${pwOk} ok, ${pwFail} failed`);
  }

  // Add previously cached entries to log
  const alreadyCached = eligible.filter((e) => isCached(e.url) && !log.find((l) => l.url === e.url));
  alreadyCached.forEach((e) => {
    const content = readFileSync(cachePath(e.url), "utf-8");
    log.push({
      url: e.url,
      method: "cached",
      status: "ok",
      error: null,
      contentLength: content.length,
    });
  });

  // Summary
  const okCount = log.filter((l) => l.status === "ok").length;
  const failCount = log.filter((l) => l.status === "error").length;
  console.log(`\n=== Summary ===`);
  console.log(`Total processed: ${log.length}`);
  console.log(`Success: ${okCount}`);
  console.log(`Failed: ${failCount}`);

  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
  console.log(`Log written to ${LOG_PATH}`);
}

main().catch(console.error);
