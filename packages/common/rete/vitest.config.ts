import { mergeConfig, type ViteUserConfig } from "vitest/config";
import shared from "../../../vitest.shared.js";

const config: ViteUserConfig = {
  test: {
    testTimeout: 1_000_000,
  }
};

export default mergeConfig(shared, config);
