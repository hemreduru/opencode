#!/usr/bin/env bun
import { $ } from "bun"

import { downloadCliToResources, resolveChannel } from "./utils"

const channel = resolveChannel()
await $`bun ./scripts/copy-icons.ts ${channel}`
await $`bun ./scripts/copy-metainfo.ts ${channel}`
await $`bun ./scripts/bundle-plugin.ts`

await $`cd ../opencode && bun script/build-node.ts`
// The fork uses the in-process v1 server; the v2 CLI is only needed with OPENCODE_SIDECAR_V2=1.
if (channel === "dev" && Bun.env.OPENCODE_SKIP_CLI !== "1") await downloadCliToResources()
