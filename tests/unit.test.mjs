import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { validateDemoForm, runChecks } = require("../app.js");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

// ---- behaviour ----
test("form: empty submission reports every field", () => {
  assert.deepEqual(Object.keys(validateDemoForm({})).sort(), ["email", "name", "topic"]);
});
test("form: rejects malformed emails", () => {
  for (const e of ["a", "a@b", "a@b.c", "a b@c.com", "@c.com"])
    assert.ok(validateDemoForm({ name: "x", email: e, topic: "y" }).email, e);
});
test("form: accepts a valid submission", () => {
  assert.deepEqual(validateDemoForm({ name: "Asha", email: "asha@corp.in", topic: "Azure basics" }), {});
});
test("form: whitespace-only values count as empty", () => {
  assert.ok(validateDemoForm({ name: "   ", email: "a@b.com", topic: "x" }).name);
});
test("form: topic over 500 chars is rejected", () => {
  assert.ok(validateDemoForm({ name: "a", email: "a@b.com", topic: "x".repeat(501) }).topic);
});
test("lab: misconfigured template fails exactly the public-access check", () => {
  const r = runChecks({ storageAccount: true, publicAccess: true });
  assert.deepEqual(r.map(c => c.pass), [true, false]);
});
test("lab: missing resource fails the existence check", () => {
  assert.equal(runChecks({ publicAccess: false })[0].pass, false);
});

// ---- static SEO / accessibility checks ----
test("seo: title and description lengths are in range", () => {
  const title = html.match(/<title>(.*?)<\/title>/s)[1];
  const desc = html.match(/<meta name="description" content="(.*?)"/s)[1];
  assert.ok(title.length >= 20 && title.length <= 65, `title ${title.length}`);
  assert.ok(desc.length >= 70 && desc.length <= 165, `description ${desc.length}`);
});
test("seo: exactly one h1 and no h3 without an h2 parent", () => {
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  assert.equal((html.match(/<h3[\s>]/g) || []).length, 0);
});
test("seo: JSON-LD parses and matches the visible FAQ", () => {
  const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  const data = JSON.parse(raw);
  const visible = [...html.matchAll(/<summary>(.*?)<\/summary>/g)].map(m => m[1]);
  assert.deepEqual(data.mainEntity.map(q => q.name), visible);
});
test("a11y: lang, viewport, skip link and main landmark exist", () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /class="skip" href="#main"/);
  assert.match(html, /<main id="main">/);
});
test("a11y: every form control has a label", () => {
  const ids = [...html.matchAll(/<(?:input|textarea)[^>]*\bid="([^"]+)"/g)].map(m => m[1]);
  assert.ok(ids.length >= 3);
  for (const id of ids) assert.match(html, new RegExp(`<label for="${id}"`), id);
});
test("a11y: no images without alt", () => {
  assert.equal((html.match(/<img(?![^>]*\balt=)/g) || []).length, 0);
});
