import { CalendarRepos } from "@beep/calendar-server";
import { CommsRepos } from "@beep/comms-server";
import { CustomizationRepos } from "@beep/customization-server";
import { IamRepos } from "@beep/iam-server";
import { KnowledgeRepos } from "@beep/knowledge-server/db";
import { SharedRepos } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as Persistence from "./Persistence.layer";

type SliceRepos =
  | IamRepos.Repos
  | SharedRepos.Repos
  | CustomizationRepos.Repos
  | CommsRepos.Repos
  | CalendarRepos.Repos
  | KnowledgeRepos.Repos;

const sliceReposLayer: Layer.Layer<SliceRepos, never, Persistence.Services> = Layer.mergeAll(
  IamRepos.layer,
  SharedRepos.layer,
  CustomizationRepos.layer,
  CommsRepos.layer,
  CalendarRepos.layer,
  KnowledgeRepos.layer
);

export type Services = SliceRepos | Persistence.Services;

/**
 * Complete data access layer providing all slice repositories with their
 * underlying persistence infrastructure (database clients, S3, etc.).
 *
 * This layer composes slice-specific repository layers with the shared
 * persistence layer, providing a single dependency for programs that
 * need full data access capabilities.
 *
 * @example
 * ```typescript
 * import * as DataAccess from "@beep/runtime-server/DataAccess.layer";
 * import { IamRepos } from "@beep/iam-server";
 * import * as Effect from "effect/Effect";
 * import * as Layer from "effect/Layer";
 *
 * // Define a program that uses repositories
 * const program = Effect.gen(function* () {
 *   const userRepo = yield* IamRepos.UserRepo;
 *   const users = yield* userRepo.findAll();
 *   return users;
 * });
 *
 * // Provide the DataAccess layer to run the program
 * const runnable = program.pipe(Effect.provide(DataAccess.layer));
 *
 * // Or compose with other layers
 * const AppLayer = Layer.mergeAll(
 *   DataAccess.layer,
 *   TelemetryLayer,
 *   ConfigLayer
 * );
 * ```
 */
export const layer: Layer.Layer<Services, never, never> = sliceReposLayer.pipe(Layer.provideMerge(Persistence.layer));
