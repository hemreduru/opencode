import { describe, expect, test } from "bun:test"
import { forkEnv } from "./fork-env"

const plugin = "file:///opt/OpenCode/resources/plugins/opencode-claude-tools.js"

describe("fork env defaults", () => {
  test("enables web search and the LSP tool", () => {
    const env = forkEnv({})
    expect(env.OPENCODE_ENABLE_EXA).toBe("1")
    expect(env.OPENCODE_EXPERIMENTAL_LSP_TOOL).toBe("1")
  })

  test("respects variables that are already set", () => {
    const env = forkEnv({ OPENCODE_ENABLE_EXA: "0", OPENCODE_EXPERIMENTAL_LSP_TOOL: "false" })
    expect(env.OPENCODE_ENABLE_EXA).toBe("0")
    expect(env.OPENCODE_EXPERIMENTAL_LSP_TOOL).toBe("false")
  })

  test("loads the bundled plugin through the inline config", () => {
    const env = forkEnv({}, plugin)
    expect(JSON.parse(env.OPENCODE_CONFIG_CONTENT)).toEqual({ plugin: [plugin] })
  })

  test("keeps other inline config and plugins", () => {
    const env = forkEnv({ OPENCODE_CONFIG_CONTENT: JSON.stringify({ model: "a/b", plugin: ["other"] }) }, plugin)
    expect(JSON.parse(env.OPENCODE_CONFIG_CONTENT)).toEqual({ model: "a/b", plugin: ["other", plugin] })
  })

  test("does not duplicate the plugin", () => {
    const content = JSON.stringify({ plugin: [plugin] })
    expect(JSON.parse(forkEnv({ OPENCODE_CONFIG_CONTENT: content }, plugin).OPENCODE_CONFIG_CONTENT)).toEqual({
      plugin: [plugin],
    })
  })

  test("leaves inline config it cannot parse untouched", () => {
    const env = forkEnv({ OPENCODE_CONFIG_CONTENT: "{ // jsonc\n}" }, plugin)
    expect(env.OPENCODE_CONFIG_CONTENT).toBe("{ // jsonc\n}")
  })

  test("sets no config when the plugin is not bundled", () => {
    expect(forkEnv({}).OPENCODE_CONFIG_CONTENT).toBeUndefined()
  })
})
