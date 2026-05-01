import {
  LoggingConfig,
  type ObservabilityCoreConfig,
  PrettyLoggerConfig,
  renderLogBanner,
  statusClass,
  summarizeCause,
  summarizeExit,
} from "@beep/observability";
import { layerWebSdk, WebObservabilityConfig } from "@beep/observability/web";
import { Cause, Exit } from "effect";

const coreConfig = {
  serviceName: "beep-web",
  serviceVersion: "0.0.0",
  environment: "test",
  minLogLevel: "Info",
} satisfies ObservabilityCoreConfig;

const loggingConfig = new LoggingConfig({
  format: "pretty",
  minLogLevel: "Info",
});

const webConfig = new WebObservabilityConfig({
  serviceName: "beep-web",
  serviceVersion: "0.0.0",
  environment: "test",
  minLogLevel: "Info",
  resourceAttributes: {},
});

void coreConfig;
void loggingConfig;
void layerWebSdk(webConfig);
void new PrettyLoggerConfig({ theme: "ocean", bannerMode: "all" });
void renderLogBanner("Browser Safe", {
  kind: "startup",
  pretty: new PrettyLoggerConfig({ theme: "ocean", bannerMode: "all" }),
});
void statusClass(200);
void summarizeCause(Cause.fail(new Error("fixture")));
void summarizeExit(Exit.succeed("ok"));
