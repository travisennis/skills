#!/usr/bin/env node

import { existsSync, mkdirSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { parseArgs } from "node:util";
import puppeteer from "puppeteer-core";

const DEFAULT_TIMEOUT = 45000;
const DEFAULT_PROFILE_DIR = join(homedir(), ".cache", "fetching-x-content");

const USAGE = `Usage: x-fetch.js <x-or-twitter-url> [options]

Fetch individual X/Twitter posts and articles through a browser profile.

Options:
  -o, --output <json|markdown>  Output format (default: json)
      --headed                  Show Chrome while fetching
      --login                   Open the persistent profile for manual X login
      --timeout <ms>            Page/extraction timeout (default: 45000)
      --profile-dir <path>      Override profile directory
  -h, --help                    Show this help

Examples:
  x-fetch.js https://x.com/user/status/1234567890
  x-fetch.js https://twitter.com/user/status/1234567890 --output markdown
  x-fetch.js --login --headed
`;

function die(message, code = 1) {
	console.error(`Error: ${message}`);
	process.exit(code);
}

function parseCli() {
	const { values, positionals } = parseArgs({
		args: process.argv.slice(2),
		allowPositionals: true,
		options: {
			output: { type: "string", short: "o", default: "json" },
			headed: { type: "boolean", default: false },
			login: { type: "boolean", default: false },
			timeout: { type: "string", default: String(DEFAULT_TIMEOUT) },
			"profile-dir": { type: "string", default: DEFAULT_PROFILE_DIR },
			help: { type: "boolean", short: "h", default: false },
		},
	});

	if (values.help) {
		console.log(USAGE);
		process.exit(0);
	}

	if (!["json", "markdown"].includes(values.output)) {
		die("--output must be either json or markdown");
	}

	const timeout = Number.parseInt(values.timeout, 10);
	if (!Number.isFinite(timeout) || timeout < 1000) {
		die("--timeout must be an integer greater than or equal to 1000");
	}

	return {
		url: positionals[0],
		output: values.output,
		headed: values.headed,
		login: values.login,
		timeout,
		profileDir: values["profile-dir"],
	};
}

function chromeExecutablePath() {
	if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

	const candidates = [];
	if (platform() === "darwin") {
		candidates.push(
			"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
			"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
			"/Applications/Chromium.app/Contents/MacOS/Chromium",
		);
	} else if (platform() === "linux") {
		candidates.push(
			"/usr/bin/google-chrome",
			"/usr/bin/google-chrome-stable",
			"/usr/bin/chromium",
			"/usr/bin/chromium-browser",
		);
	} else if (platform() === "win32") {
		const roots = [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA].filter(Boolean);
		for (const root of roots) {
			candidates.push(join(root, "Google", "Chrome", "Application", "chrome.exe"));
		}
	}

	return candidates.find((candidate) => existsSync(candidate));
}

function normalizeAndClassifyUrl(rawUrl) {
	if (!rawUrl) die(`missing URL\n\n${USAGE}`);

	let parsed;
	try {
		parsed = new URL(rawUrl);
	} catch {
		die(`invalid URL: ${rawUrl}`);
	}

	const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
	if (!["x.com", "twitter.com", "mobile.twitter.com"].includes(hostname)) {
		die("URL must be from x.com or twitter.com");
	}

	parsed.hostname = "x.com";
	const pathname = parsed.pathname;
	const statusMatch = pathname.match(/^\/([^/]+)\/status(?:es)?\/(\d+)/);
	const articleMatch = pathname.match(/^\/i\/article\/(\d+)/) || pathname.match(/^\/([^/]+)\/articles\/(\d+)/);

	if (statusMatch) {
		return { url: parsed.toString(), type: "post", statusId: statusMatch[2] };
	}
	if (articleMatch) {
		return { url: parsed.toString(), type: "article", statusId: null };
	}

	die("unsupported X URL; expected a post/status URL or X article URL");
}

async function launchBrowser({ headed, login, profileDir, timeout }) {
	const executablePath = chromeExecutablePath();
	if (!executablePath) {
		die("Chrome executable not found. Set CHROME_PATH to your Chrome or Chromium binary.");
	}

	mkdirSync(profileDir, { recursive: true });

	return puppeteer.launch({
		executablePath,
		userDataDir: profileDir,
		headless: login || headed ? false : "new",
		defaultViewport: { width: 1280, height: 1100 },
		timeout,
		args: [
			"--no-first-run",
			"--no-default-browser-check",
			"--disable-dev-shm-usage",
		],
	});
}

async function runLogin(browser) {
	const page = await browser.newPage();
	await page.goto("https://x.com/home", { waitUntil: "domcontentloaded", timeout: DEFAULT_TIMEOUT }).catch(() => {});
	console.error("Sign in to X in the opened browser window.");
	console.error("When the account is signed in and the page has loaded, return here and press Enter.");

	const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
	await rl.question("");
	rl.close();
}

async function gotoAndSettle(page, url, timeout) {
	await page.goto(url, { waitUntil: "domcontentloaded", timeout });
	await page.waitForSelector("main, article, [data-testid='tweetText']", { timeout: Math.min(timeout, 20000) }).catch(() => {});
	await new Promise((resolve) => setTimeout(resolve, 2500));
}

async function extract(page, target) {
	return page.evaluate(({ inputUrl, expectedType, statusId }) => {
		const unique = (items) => [...new Set(items.filter(Boolean))];
		const normalize = (value) => (value || "").replace(/\u00a0/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
		const visibleText = (el) => normalize(el?.innerText || el?.textContent || "");
		const absoluteUrl = (href) => {
			try {
				return new URL(href, location.href).toString();
			} catch {
				return null;
			}
		};
		const parseAuthor = (container) => {
			const userBlock = container?.querySelector("[data-testid='User-Name']");
			const text = visibleText(userBlock);
			const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
			const handle = lines.find((line) => /^@[\w_]+$/.test(line)) || lines.find((line) => line.startsWith("@")) || null;
			const name = lines.find((line) => line !== handle && !/^\d+[smhd]$/.test(line)) || null;
			const href = userBlock?.querySelector("a[href^='/']")?.getAttribute("href");
			return {
				name,
				handle,
				url: href ? absoluteUrl(href) : (handle ? `https://x.com/${handle.replace(/^@/, "")}` : null),
			};
		};
		const detectWarnings = () => {
			const pageText = visibleText(document.body).toLowerCase();
			const warnings = [];
			const checks = [
				["login-required", ["sign in to x", "log in to x", "don't miss what's happening"]],
				["unavailable", ["this post is unavailable", "this post was deleted", "this account doesn't exist", "account suspended", "this page doesn't exist", "this page doesn’t exist"]],
				["rate-limited", ["rate limit exceeded", "something went wrong. try reloading"]],
				["private", ["these posts are protected", "only approved followers can see"]],
			];
			for (const [warning, phrases] of checks) {
				if (phrases.some((phrase) => pageText.includes(phrase))) warnings.push(warning);
			}
			return warnings;
		};
		const getMetric = (container, terms) => {
			const labels = [...container.querySelectorAll("[aria-label]")].map((el) => el.getAttribute("aria-label") || "");
			const label = labels.find((candidate) => terms.some((term) => candidate.toLowerCase().includes(term)));
			if (!label) return null;
			const escapedTerms = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
			const match = label.match(new RegExp(`([\\d,.]+[KMB]?)\\s+(${escapedTerms.join("|")})\\b`, "i"));
			return match ? match[1] : label;
		};
		const getMedia = (container) => {
			const images = [...container.querySelectorAll("img")].map((img) => {
				const src = img.currentSrc || img.src;
				if (!src || (!src.includes("twimg.com/media") && !src.includes("pbs.twimg.com/media"))) return null;
				return { type: "image", url: src, alt: img.alt || null };
			});
			const videos = [...container.querySelectorAll("video")].map((video) => ({
				type: "video",
				url: video.currentSrc || video.src || video.poster || null,
				alt: video.getAttribute("aria-label") || null,
			}));
			return [...images, ...videos].filter((item) => item?.url);
		};
		const getLinks = (container) => unique([...container.querySelectorAll("a[href]")].map((link) => {
			const href = absoluteUrl(link.getAttribute("href"));
			if (!href) return null;
			if (href.includes("/photo/") || href.includes("/analytics") || href.includes("/likes") || href.includes("/retweets")) return null;
			return href;
		}));
		const markdownFor = (data) => {
			const lines = [];
			if (data.title) lines.push(`# ${data.title}`, "");
			if (data.author?.name || data.author?.handle) lines.push(`Author: ${[data.author.name, data.author.handle].filter(Boolean).join(" ")}`);
			if (data.publishedAt) lines.push(`Published: ${data.publishedAt}`);
			lines.push(`URL: ${data.finalUrl || data.url}`, "");
			if (data.text) lines.push(data.text, "");
			if (data.quotedPost?.text) lines.push("## Quoted Post", "", data.quotedPost.text, "");
			if (data.links.length) lines.push("## Links", "", ...data.links.map((link) => `- ${link}`), "");
			if (data.media.length) lines.push("## Media", "", ...data.media.map((item) => `- ${item.type}: ${item.url}${item.alt ? ` (${item.alt})` : ""}`), "");
			if (data.warnings.length) lines.push("## Warnings", "", ...data.warnings.map((warning) => `- ${warning}`));
			return lines.join("\n").trim();
		};
		const base = {
			type: expectedType,
			url: inputUrl,
			finalUrl: location.href,
			fetchedAt: new Date().toISOString(),
			author: { name: null, handle: null, url: null },
			publishedAt: null,
			title: null,
			text: "",
			markdown: "",
			media: [],
			links: [],
			metrics: { replies: null, reposts: null, likes: null, views: null },
			quotedPost: null,
			warnings: detectWarnings(),
		};

		if (expectedType === "article") {
			const main = document.querySelector("main") || document.body;
			const article = document.querySelector("article") || main;
			const title = visibleText(article.querySelector("h1")) || document.title.replace(/\s*\/\s*X$/, "");
			const time = article.querySelector("time")?.getAttribute("datetime") || null;
			const author = parseAuthor(article);
			const blocks = [...article.querySelectorAll("h1, h2, p, [data-testid='tweetText'], div[dir='auto']")]
				.map(visibleText)
				.filter((text) => text && text !== title && !/^@[\w_]+$/.test(text));
			const text = normalize(unique(blocks).join("\n\n")) || visibleText(article);
			const data = {
				...base,
				title,
				author,
				publishedAt: time,
				text,
				media: getMedia(article),
				links: getLinks(article),
			};
			data.markdown = markdownFor(data);
			return data;
		}

		const articles = [...document.querySelectorAll("article")];
		const post = articles.find((article) => {
			if (!statusId) return false;
			return [...article.querySelectorAll("a[href*='/status/']")].some((link) => link.href.includes(`/status/${statusId}`));
		}) || articles[0] || document.querySelector("main") || document.body;

		const textNodes = [...post.querySelectorAll("[data-testid='tweetText']")];
		const text = normalize((textNodes[0] ? visibleText(textNodes[0]) : visibleText(post)).replace(/\n*Show more$/, ""));
		const time = post.querySelector("time")?.getAttribute("datetime") || null;
		const quotedText = textNodes[1] ? visibleText(textNodes[1]) : null;
		const quotedLink = [...post.querySelectorAll("a[href*='/status/']")]
			.map((link) => absoluteUrl(link.getAttribute("href")))
			.find((href) => href && statusId && !href.includes(`/status/${statusId}`)) || null;
		const data = {
			...base,
			author: parseAuthor(post),
			publishedAt: time,
			text,
			media: getMedia(post),
			links: getLinks(post),
			metrics: {
				replies: getMetric(post, ["reply", "replies"]),
				reposts: getMetric(post, ["repost", "reposts", "retweet", "retweets"]),
				likes: getMetric(post, ["like", "likes"]),
				views: getMetric(post, ["view", "views"]),
			},
			quotedPost: quotedText || quotedLink ? { author: null, text: quotedText, url: quotedLink } : null,
		};
		if (!data.text) data.warnings.push("empty-extraction");
		data.markdown = markdownFor(data);
		return data;
	}, { inputUrl: target.url, expectedType: target.type, statusId: target.statusId });
}

async function main() {
	const options = parseCli();
	const target = options.login ? null : normalizeAndClassifyUrl(options.url);
	const browser = await launchBrowser(options);

	try {
		if (options.login) {
			await runLogin(browser);
			return;
		}

		const page = await browser.newPage();
		page.setDefaultTimeout(options.timeout);
		await gotoAndSettle(page, target.url, options.timeout);
		const data = await extract(page, target);

		if (options.output === "json") {
			console.log(JSON.stringify(data, null, 2));
		} else {
			console.log(data.markdown);
		}

		if (data.warnings.length > 0) {
			process.exitCode = 2;
		}
	} finally {
		await browser.close();
	}
}

main().catch((error) => {
	die(error.message || String(error));
});
