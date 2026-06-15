import { initialScanState, scanChunk } from "@beep/agents-server/AssistantTurn";
import { expect } from "tstyche";
import type { ScanState } from "@beep/agents-server/AssistantTurn";

expect(initialScanState).type.toBe<ScanState>();
expect(scanChunk(initialScanState, "")).type.toBe<[ScanState, Array<string>]>();
