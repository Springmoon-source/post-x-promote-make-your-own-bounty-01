// post-x-promote-make-your-own-bounty-01 entry (Node 22, standard library only).
//
// The entry itself is a post on X: one post of the entrant's own quoting or
// linking make.fun's make-your-own-bounty post, with a photo of its own and
// the entrant's play code in its text. This program does the only thing the
// repository's code has to do: it carries POST.json, which names that post,
// from the repository root to /output/POST.json, where the gate reads it.
// The house reads the post and its counts from X itself; nothing this
// program writes about the post is scored.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The post's address must be an X post URL of the shape the gate reads:
// https://x.com/<handle>/status/<id> (twitter.com reads the same way).
const POST_URL_RE = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/;

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

const postPath = join(BOT_DIR, 'POST.json');

let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(postPath, 'utf8'));
} catch (err) {
  fail(`POST.json could not be read or parsed from ${BOT_DIR}: ${(err as Error).message}`);
}

if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
  fail('POST.json must be a JSON object with a url field');
}

const url = (parsed as { url?: unknown }).url;
// The gate reads past a query or fragment after the address, so strip one
// before checking the shape; the file itself is copied unchanged.
const bareUrl = typeof url === 'string' ? url.split(/[?#]/, 1)[0] : '';
if (typeof url !== 'string' || !POST_URL_RE.test(bareUrl)) {
  fail('POST.json url must be an X post address: https://x.com/<handle>/status/<id>');
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(postPath, join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  fail(`POST.json could not be copied to ${OUTPUT_DIR}: ${(err as Error).message}`);
}
