// Bundle-graph fixture: an entrypoint that reaches the observability
// experimental server, which the strict host bundle must refuse.
import * as ExperimentalServer from "@beep/observability/experimental/server";

export const reachable = ExperimentalServer;
