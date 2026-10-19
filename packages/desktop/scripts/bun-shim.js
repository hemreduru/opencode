import { existsSync as __existsSync, statSync as __statSync } from "node:fs"
import { delimiter as __delimiter, join as __join } from "node:path"
globalThis.Bun ??= {
  which(name, options) {
    const exts = process.platform === "win32" ? ["", ...(process.env.PATHEXT ?? ".EXE;.CMD").split(";")] : [""]
    for (const dir of (options?.PATH ?? process.env.PATH ?? "").split(__delimiter)) {
      for (const ext of exts) {
        const file = __join(dir, name + ext)
        if (__existsSync(file) && __statSync(file).isFile()) return file
      }
    }
    return null
  },
}
