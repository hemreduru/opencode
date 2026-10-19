# Fork notes (hemreduru/opencode)

This fork ships the upstream desktop app (based on the upstream release tag in `stable`) with the
[`opencode-claude-tools`](https://github.com/hemreduru/opencode-claude-tools) plugin bundled. Changes are limited to
`packages/desktop/**` and `.github/workflows/**` so that merging upstream stays trivial.

## What the fork changes

- **Bundled plugin.** `scripts/bundle-plugin.ts` (run by `prebuild`) bundles the plugin into
  `resources/plugins/opencode-claude-tools.js`; electron-builder ships it outside the asar (`extraResources`). At startup
  `src/main/fork-env.ts` adds it to `OPENCODE_CONFIG_CONTENT`, so it loads for every project. Existing
  `OPENCODE_CONFIG_CONTENT` plugins are kept and `opencode.json` plugins still merge on top.
  The bundle shims `Bun.which` because the server runs on Node inside Electron (`scripts/bun-shim.js`).
- **Default flags** for the server: `OPENCODE_ENABLE_EXA=1` (web search) and `OPENCODE_EXPERIMENTAL_LSP_TOOL=1`
  (`lsp` tool). Already-set environment variables win. The `question` tool needs nothing extra: the desktop app runs with
  `OPENCODE_CLIENT=desktop`, which enables it.
- **Unsigned builds.** `OPENCODE_UNSIGNED=1` disables Windows signing (`electron-builder.config.ts`, `scripts/utils.ts`).
  `OPENCODE_SKIP_CLI=1` skips downloading the v2 CLI binary, which is only used with `OPENCODE_SIDECAR_V2=1`.
- **Dev channel.** The fork builds the `dev` channel (app id `ai.opencode.desktop.dev`) because it has the auto-updater
  disabled; `beta`/`prod` would update the app from upstream releases and drop the plugin.
- **Workflows.** `desktop-release.yml` builds and publishes installers; `upstream-sync.yml` opens upstream merge PRs.

## Required secrets and settings

| Name                                         | Where                        | Purpose                                                                                                                   |
| -------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `PLUGIN_REPO_SSH_KEY`                        | repo secret                  | Read-only deploy key of `hemreduru/opencode-claude-tools` (private), used by `actions/checkout` in `desktop-release.yml`. |
| Allow GitHub Actions to create pull requests | Settings > Actions > General | Needed for `upstream-sync.yml` (uses `GITHUB_TOKEN`).                                                                     |

`GITHUB_TOKEN` cannot push commits that change `.github/workflows`. If an upstream merge touches workflows,
`upstream-sync.yml` opens an issue with the commands to push the branch manually.

## Cutting a release

1. Merge to `stable`.
2. Tag and push: `git tag desktop-v1.19.3-1 && git push origin desktop-v1.19.3-1`
   (or run `desktop-release` from the Actions tab and enter a tag).
3. The workflow uploads the NSIS `.exe`, `opencode-desktop-linux-x86_64.AppImage` and
   `opencode-desktop-linux-amd64.deb` to the GitHub Release for that tag. Builds are unsigned, so Windows SmartScreen shows a warning.

## Building locally

```bash
bun install
(cd ../../../opencode-claude-tools && bun install)   # or set OPENCODE_CLAUDE_TOOLS_DIR to the plugin checkout
cd packages/desktop
OPENCODE_SKIP_CLI=1 bun run build
OPENCODE_UNSIGNED=1 bun x electron-builder --linux AppImage deb --config electron-builder.config.ts
```

## Upstream sync

`upstream-sync.yml` runs weekly. It merges (never rebases) the newest upstream stable release into `sync/upstream-<tag>`
and opens a PR to `stable`; conflicts become an issue listing the files. A `v2.*` or later major is not merged: an issue
is opened because the plugin must be ported to the V2 plugin API first. Merge the PR with a merge commit.
