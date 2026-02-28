import { Data } from "effect";

export type JobState = Data.TaggedEnum<{
  readonly Queued: {};
  readonly Running: { readonly workerId: string };
  readonly Failed: { readonly reason: string };
}>;

export const JobState = Data.taggedEnum<JobState>();

export const render = JobState.$match({
  Queued: () => "queued",
  Running: ({ workerId }) => `running:${workerId}`,
  Failed: ({ reason }) => `failed:${reason}`,
});
