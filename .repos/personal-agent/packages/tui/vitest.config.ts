import { mergeConfig, type UserConfigExport } from "vitest/config"
import shared from "../../vitest.shared.js"

const config: UserConfigExport = {
  test: {
    include: ["test/**/*.test.{ts,tsx}"]
  }
}

export default mergeConfig(shared, config)
