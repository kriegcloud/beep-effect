/**
 * @module @beep/ai-sdk/codex/thread
 * @since 0.0.0
 */
import { $AiSdkId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { ThreadItem } from "./items.ts";
import { Usage } from "./shared.ts";

const $I = $AiSdkId.create("codex/thread");

/**
 * Completed turn.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Turn extends S.Class<Turn>($I`Turn`)(
  {
    items: S.Array(ThreadItem),
    finalResponse: S.String,
    usage: S.OptionFromNullOr(Usage),
  },
  $I.annote("Turn", {
    description: "Completed turn.",
  })
) {}

/**
 * Alias for {@link Turn | `Turn`} to describe the result of `run()`.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const RunResult = Turn;

/**
 * Type of {@link RunResult | `RunResult`}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type RunResult = S.Schema.Type<typeof RunResult>;

/**
 * Text User Input to send to the agent.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TextUserInput extends S.Class<TextUserInput>($I`TextUserInput`)(
  {
    type: S.tag("text"),
    text: S.String,
  },
  $I.annote("TextUserInput", {
    description: "Text User Input to send to the agent.",
  })
) {}

/**
 * local_image input to send to the agent.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class LocalImageUserInput extends S.Class<LocalImageUserInput>($I`LocalImageUserInput`)(
  {
    type: S.tag("local_image"),
    path: S.String,
  },
  $I.annote("LocalImageUserInput", {
    description: "local_image input to send to the agent.",
  })
) {}

/**
 * An input to send to the agent.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const UserInput = S.Union([TextUserInput, LocalImageUserInput]).pipe(
  S.toTaggedUnion("type"),
  $I.annoteSchema("UserInput", {
    description: "An input to send to the agent.",
  })
);

/**
 * Type of {@link UserInput | `UserInput`}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type UserInput = typeof UserInput.Type;

/**
 * Input accepted by the Codex thread runtime.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const Input = S.Union([S.String, S.Array(UserInput)]).pipe(
  $I.annoteSchema("Input", {
    description: "An input to send to the agent.",
  })
);

/**
 * Type of {@link Input | `Input`}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type Input = typeof Input.Type;
