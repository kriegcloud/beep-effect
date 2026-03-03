/**
 * Runtime layer wiring for agent-eval.
 *
 * @since 0.0.0
 * @module
 */

import { NodeFileSystem, NodePath } from "@effect/platform-node";
import { Layer } from "effect";

/**
 * Platform layer used at CLI boundary only.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const AgentEvalPlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
