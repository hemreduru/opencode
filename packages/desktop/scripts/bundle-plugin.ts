#!/usr/bin/env bun
import { existsSync } from "node:fs"
import { resolve } from "node:path"

// Bundles the opencode-claude-tools plugin into a single file the packaged server can import.
// The server runs on Node (Electron utility process), so Bun-only APIs the plugin uses are shimmed.
const dir = resolve(Bun.env.OPENCODE_CLAUDE_TOOLS_DIR ?? "../../../opencode-claude-tools")
if (!existsSync(`${dir}/src/index.ts`))
  throw new Error(`Plugin source not found in ${dir} (set OPENCODE_CLAUDE_TOOLS_DIR)`)

const result = await Bun.build({
  entrypoints: [`${dir}/src/index.ts`],
  outdir: "resources/plugins",
  naming: "opencode-claude-tools.js",
  target: "node",
  format: "esm",
  banner: await Bun.file("scripts/bun-shim.js").text(),
})
if (!result.success) throw new Error(result.logs.join("\n"))

console.log(`Bundled ${dir} to resources/plugins/opencode-claude-tools.js`)
