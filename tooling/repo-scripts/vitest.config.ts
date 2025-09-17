import { mergeConfig, type UserConfigExport } from "vitest/config";
import shared from "../../vitest.shared";

const config: UserConfigExport = {};

export default mergeConfig(shared, config);
