/**
 * Validates the Superposition AI plugin before release. Reusable by operators and CI
 * (`.github/workflows/sync-ai-plugin.yml` runs this before mirroring to the public repo).
 *
 * Hard errors: unparseable/missing manifest, missing name/version/description, wrong plugin name,
 * MCP URL not pointing at a known SPA endpoint, a SKILL.md missing name/description frontmatter, or
 * an obvious secret anywhere in the published tree. Version drift vs package.json is a warning —
 * the sync workflow stamps the canonical version into every manifest at release time.
 *
 * No regex (project ban): all parsing is explicit string operations + JSON.parse. Export-free so
 * ts-prune stays clean. Run: `node --experimental-strip-types scripts/validate.ts`.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs"
import { join, dirname, resolve } from "node:path"

const SELF: string = resolve(process.argv[1] ?? "")
const ROOT: string = resolve(dirname(SELF), "..")

const errors: string[] = []
const warnings: string[] = []

function readJson(relPath: string): Record<string, unknown> | null {
  const full = join(ROOT, relPath)
  if (!existsSync(full)) {
    errors.push(`Missing file: ${relPath}`)
    return null
  }
  try {
    return JSON.parse(readFileSync(full, "utf8")) as Record<string, unknown>
  } catch {
    errors.push(`Invalid JSON: ${relPath}`)
    return null
  }
}

function frontmatterHasKey(front: string, key: string): boolean {
  for (const line of front.split("\n")) {
    const trimmed = line.trimStart()
    if (trimmed.startsWith(`${key}:`)) {
      return trimmed.slice(key.length + 1).trim().length > 0
    }
  }
  return false
}

function extractFrontmatter(raw: string): string | null {
  if (!raw.startsWith("---")) return null
  const rest = raw.slice(3)
  const end = rest.indexOf("\n---")
  return end === -1 ? null : rest.slice(0, end)
}

const SECRET_MARKERS: readonly string[] = [
  "BEGIN PRIVATE KEY",
  "BEGIN RSA PRIVATE KEY",
  "sk-ant-",
  "sk_live_",
  "AKIA",
  "xoxb-",
  "ghp_"
]

function scanForSecrets(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      scanForSecrets(full)
      continue
    }
    if (full === SELF) continue // don't flag this validator's own marker list
    let content: string
    try {
      content = readFileSync(full, "utf8")
    } catch {
      continue
    }
    for (const marker of SECRET_MARKERS) {
      if (content.includes(marker)) {
        errors.push(`Possible secret ("${marker}") in ${full.slice(ROOT.length + 1)}.`)
      }
    }
  }
}

// --- canonical version ---
const pkg = readJson("package.json")
const canonicalVersion = pkg && typeof pkg.version === "string" ? pkg.version : ""
if (!canonicalVersion) errors.push("package.json is missing a string `version`.")

// --- versioned manifests ---
const versionedManifests = [
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
  "gemini-extension.json"
]
for (const rel of versionedManifests) {
  const m = readJson(rel)
  if (!m) continue
  for (const field of ["name", "version", "description"]) {
    if (typeof m[field] !== "string" || (m[field] as string).length === 0) {
      errors.push(`${rel}: missing required string field \`${field}\`.`)
    }
  }
  if (typeof m.name === "string" && m.name !== "superposition") {
    errors.push(`${rel}: \`name\` must be "superposition" (got "${m.name}").`)
  }
  if (typeof m.version === "string" && canonicalVersion && m.version !== canonicalVersion) {
    warnings.push(
      `${rel}: version ${m.version} != package.json ${canonicalVersion} (sync workflow stamps this at release).`
    )
  }
}

// --- marketplace descriptors ---
for (const rel of [".claude-plugin/marketplace.json", ".agents/plugins/marketplace.json"]) {
  const m = readJson(rel)
  if (m && m.name !== "superposition") {
    errors.push(`${rel}: marketplace \`name\` must be "superposition".`)
  }
}

// --- MCP config ---
const EXPECTED_MCP_PREFIX = "https://app.superposition.ai/mcp"
for (const rel of [".mcp.json", "mcp.json"]) {
  const m = readJson(rel)
  if (!m) continue
  const servers = m.mcpServers as Record<string, { url?: unknown }> | undefined
  const url = servers?.superposition?.url
  if (typeof url !== "string" || !url.startsWith(EXPECTED_MCP_PREFIX)) {
    errors.push(`${rel}: mcpServers.superposition.url must start with ${EXPECTED_MCP_PREFIX}.`)
  }
}

// --- skills ---
const skillsDir = join(ROOT, "skills")
if (!existsSync(skillsDir)) {
  errors.push("Missing skills/ directory.")
} else {
  for (const entry of readdirSync(skillsDir)) {
    const skillDir = join(skillsDir, entry)
    if (!statSync(skillDir).isDirectory()) continue
    const skillFile = join(skillDir, "SKILL.md")
    if (!existsSync(skillFile)) {
      errors.push(`skills/${entry}: no SKILL.md.`)
      continue
    }
    const front = extractFrontmatter(readFileSync(skillFile, "utf8"))
    if (front === null) {
      errors.push(`skills/${entry}/SKILL.md: missing YAML frontmatter.`)
      continue
    }
    if (!frontmatterHasKey(front, "name")) errors.push(`skills/${entry}/SKILL.md: frontmatter missing \`name\`.`)
    if (!frontmatterHasKey(front, "description"))
      errors.push(`skills/${entry}/SKILL.md: frontmatter missing \`description\`.`)
  }
}

// --- secret scan ---
scanForSecrets(ROOT)

// --- report ---
for (const w of warnings) console.warn(`warning  ${w}`)
for (const e of errors) console.error(`error    ${e}`)
if (errors.length > 0) {
  console.error(`\nPlugin validation FAILED with ${errors.length} error(s).`)
  process.exit(1)
}
console.log(`Plugin validation passed${warnings.length > 0 ? ` (${warnings.length} warning(s))` : ""}.`)
