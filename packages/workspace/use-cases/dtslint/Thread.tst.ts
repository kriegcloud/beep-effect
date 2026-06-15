import { Thread } from "@beep/workspace-use-cases/public";
import { expect } from "tstyche";

expect(Thread.ThreadTimeline).type.not.toBe<never>();
expect(Thread.TimelineTurn).type.not.toBe<never>();
expect<"ThreadStore">().type.not.toBeAssignableTo<keyof typeof Thread>();
expect<"ThreadStoreNotFound">().type.not.toBeAssignableTo<keyof typeof Thread>();
