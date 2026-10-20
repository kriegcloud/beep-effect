import { setupEffect } from "@xstate/effect";
import * as Effect from "effect/Effect";
import type { EffectActionArgs } from "@xstate/effect";

const logApproval = ({ params }: EffectActionArgs): Effect.Effect<void> => Effect.logInfo("release approved", params);

export const auditedReleaseMachine = setupEffect({
  actions: { logApproval },
}).createMachine({
  id: "auditedRelease",
  initial: "awaitingApproval",
  states: {
    awaitingApproval: {
      on: {
        APPROVE: (args, enq) => {
          enq(args.actions.logApproval, { ...args, params: { reviewer: "release-owner" } });
          return { target: "approved" };
        },
      },
    },
    approved: { type: "final" },
  },
});
