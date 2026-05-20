import { CanvasProjectServerLayer } from "@beep/canvas-server/aggregates/CanvasProject";
import { expect } from "tstyche";

expect(CanvasProjectServerLayer).type.not.toBe<never>();
