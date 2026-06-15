import {
  ThreadStoreDrizzleLayer,
  ThreadStoreInMemoryLayer,
  ThreadStoreLive,
} from "@beep/workspace-server/aggregates/Thread";
import { expect } from "tstyche";

expect(ThreadStoreInMemoryLayer).type.not.toBe<never>();
expect(ThreadStoreDrizzleLayer).type.not.toBe<never>();
expect(ThreadStoreLive).type.not.toBe<never>();
