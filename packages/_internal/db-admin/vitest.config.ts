import { mergeConfig, type ViteUserConfig } from "vitest/config";
import shared from "../../../vitest.shared";

const config: ViteUserConfig = {};

export default mergeConfig(shared, config);
