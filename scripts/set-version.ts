/**
 * Sets the plugin version across the canonical package.json AND all four platform manifests in one
 * shot, so cutting a release is a single command + commit instead of hand-editing five files.
 *
 * Usage (from packages/ai-plugin/):
 *   pnpm version:set 1.1.0     # set an explicit version everywhere
 *   pnpm version:set           # re-stamp the manifests from package.json's current version
 *
 * Then review the diff, commit, and merge to develop — CI publishes on the version change. The sync
 * workflow ALSO stamps the manifests at release time as a safety net, so a forgotten run here can't
 * ship a mismatched manifest; this script just keeps the committed source consistent and reviewable.
 *
 * Minimal-diff by design: it rewrites only the top-level `"version"` line in each file, leaving all
 * other formatting untouched. No regex (project ban) — explicit string operations only. Export-free
 * so ts-prune stays clean.
 */

import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname, resolve } from "node:path"

const SELF: string = resolve(process.argv[1] ?? "")
const ROOT: string = resolve(dirname(SELF), "..")

const MANIFESTS: readonly string[] = [
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
  "gemini-extension.json"
]

function isValidVersion(value: string): boolean {
  if (value.length === 0) return false
  // Split off an optional prerelease suffix (e.g. 1.2.0-beta.1), validate the X.Y.Z core is numeric.
  const dash = value.indexOf("-")
  const core = dash === -1 ? value : value.slice(0, dash)
  if (dash !== -1 && value.slice(dash + 1).length === 0) return false
  const parts = core.split(".")
  if (parts.length !== 3) return false
  for (const part of parts) {
    if (part.length === 0) return false
    for (const ch of part) {
      if (ch < "0" || ch > "9") return false
    }
  }
  return true
}

function getPackageVersion(): string {
  const obj = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { version?: unknown }
  return typeof obj.version === "string" ? obj.version : ""
}

/**
 * Rewrites only the **top-level** `"version"` line (JSON object depth 1), preserving indentation +
 * trailing comma. Brace-depth tracking — not a bare prefix match — so a nested `version` key (e.g.
 * inside an `interface` block) can never be stamped by mistake. No regex (project ban).
 */
function setVersionInFile(relPath: string, version: string): boolean {
  const path = join(ROOT, relPath)
  const lines = readFileSync(path, "utf8").split("\n")
  let depth = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trimStart()
    // Depth entering this line: a top-level key sits at depth 1 (inside the root `{`).
    const atTopLevel = depth === 1
    for (const ch of line) {
      if (ch === "{" || ch === "[") depth++
      else if (ch === "}" || ch === "]") depth--
    }
    if (atTopLevel && trimmed.startsWith('"version":')) {
      const indent = line.slice(0, line.length - trimmed.length)
      const hasTrailingComma = line.trimEnd().endsWith(",")
      lines[i] = `${indent}"version": "${version}"${hasTrailingComma ? "," : ""}`
      writeFileSync(path, lines.join("\n"), "utf8")
      return true
    }
  }
  return false
}

const requested = process.argv[2]
const version = requested ?? getPackageVersion()

if (!isValidVersion(version)) {
  console.error(`Invalid version: "${version}". Expected MAJOR.MINOR.PATCH (e.g. 1.1.0).`)
  process.exit(1)
}

const targets = ["package.json", ...MANIFESTS]
for (const rel of targets) {
  if (!setVersionInFile(rel, version)) {
    console.error(`  ${rel}: no top-level "version" field found — aborting.`)
    process.exit(1)
  }
  console.log(`  ${rel} → ${version}`)
}
console.log(`\nSet version ${version} across ${targets.length} files. Review the diff, commit, then merge to publish.`)
