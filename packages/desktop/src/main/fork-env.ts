import { Option, Schema } from "effect"

const decodeJson = Schema.decodeUnknownOption(Schema.UnknownFromJsonString)
const isRecord = Schema.is(Schema.Record(Schema.String, Schema.Unknown))

/**
 * Fork defaults for the server environment: web search and the LSP tool on, and the bundled
 * plugin appended to the inline config so user config can still add more plugins.
 * Variables that are already set win; unparsable inline config is left untouched.
 */
export function forkEnv(env: Record<string, string | undefined>, plugin?: string) {
  const next: Record<string, string> = {
    OPENCODE_ENABLE_EXA: env.OPENCODE_ENABLE_EXA ?? "1",
    OPENCODE_EXPERIMENTAL_LSP_TOOL: env.OPENCODE_EXPERIMENTAL_LSP_TOOL ?? "1",
  }
  if (!plugin) return next

  const inline = env.OPENCODE_CONFIG_CONTENT
  const config =
    inline === undefined ? Option.some<Record<string, unknown>>({}) : Option.filter(decodeJson(inline), isRecord)
  if (Option.isNone(config)) return { ...next, OPENCODE_CONFIG_CONTENT: inline! }

  const plugins = Array.isArray(config.value.plugin) ? config.value.plugin : []
  return {
    ...next,
    OPENCODE_CONFIG_CONTENT: JSON.stringify({
      ...config.value,
      plugin: plugins.includes(plugin) ? plugins : [...plugins, plugin],
    }),
  }
}
