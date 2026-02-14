"use client";

import { useOthers, useUpdateMyPresence } from "@liveblocks/react/suspense";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import { useCallback, useMemo } from "react";
import type { AiActivityPresence, SerializedRange } from "../../../context/LiveblocksProvider";

/**
 * User info for conflict display.
 */
interface ConflictingUser {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

/**
 * Collaborative AI state returned by the hook.
 */
interface CollaborativeAiState {
  /** Whether there's a conflict with another user's AI operation */
  readonly hasConflict: boolean;
  /** Users whose AI operations overlap with current selection */
  readonly conflictingUsers: readonly ConflictingUser[];
  /** Whether it's safe to proceed with AI operation */
  readonly canProceed: boolean;
  /** All users currently using AI features */
  readonly usersUsingAi: readonly ConflictingUser[];
  /** Broadcast AI activity to other users */
  readonly broadcastAiActivity: (
    isGenerating: boolean,
    promptLabel: O.Option<string>,
    selectionRange: O.Option<SerializedRange>
  ) => void;
  /** Clear AI activity presence */
  readonly clearAiActivity: () => void;
}

/**
 * Check if two ranges overlap.
 * Returns true if any part of the ranges intersect.
 */
function rangesOverlap(a: SerializedRange, b: SerializedRange): boolean {
  // Basic offset-based overlap check
  // Two ranges overlap if neither ends before the other starts
  return !(a.end <= b.start || b.end <= a.start);
}

/**
 * Hook for managing collaborative AI operations in Liveblocks.
 *
 * Provides conflict detection when multiple users use AI on overlapping
 * text selections, and broadcasts AI activity to other collaborators.
 *
 * @param mySelectionRange - Current user's selection range (null if no selection)
 * @returns Collaborative AI state and actions
 *
 * @example
 * ```tsx
 * const { hasConflict, conflictingUsers, broadcastAiActivity } = useCollaborativeAi(selectionRange);
 *
 * // Start AI operation
 * broadcastAiActivity(true, "Improve Writing", selectionRange);
 *
 * // On complete
 * broadcastAiActivity(false, null, null);
 * ```
 */
export function useCollaborativeAi(mySelectionRange: SerializedRange | null): CollaborativeAiState {
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();

  // Find users whose AI operations overlap with my selection
  const conflictingUsers = useMemo<readonly ConflictingUser[]>(() => {
    if (!mySelectionRange) return [];

    return pipe(
      others,
      A.filter((other) => {
        const otherAi = other.presence?.aiActivity;
        if (!otherAi?.isGenerating || !otherAi.selectionRange) return false;

        // Check if their AI operation range overlaps with my selection
        return rangesOverlap(mySelectionRange, otherAi.selectionRange);
      }),
      A.map((other) => ({
        id: other.id,
        name: other.info?.name ?? "Unknown user",
        color: other.info?.color ?? "#888888",
      }))
    );
  }, [mySelectionRange, others]);

  // Find all users currently using AI (regardless of overlap)
  const usersUsingAi = useMemo<readonly ConflictingUser[]>(() => {
    return pipe(
      others,
      A.filter((other) => other.presence?.aiActivity?.isGenerating === true),
      A.map((other) => ({
        id: other.id,
        name: other.info?.name ?? "Unknown user",
        color: other.info?.color ?? "#888888",
      }))
    );
  }, [others]);

  // Broadcast AI activity to other users
  const broadcastAiActivity = useCallback(
    (isGenerating: boolean, promptLabel: O.Option<string>, selectionRange: O.Option<SerializedRange>) => {
      const aiActivity: AiActivityPresence | null = isGenerating
        ? { isGenerating, promptLabel: O.getOrNull(promptLabel), selectionRange: O.getOrNull(selectionRange) }
        : null;

      updateMyPresence({ aiActivity });
    },
    [updateMyPresence]
  );

  // Convenience method to clear AI activity
  const clearAiActivity = useCallback(() => {
    updateMyPresence({ aiActivity: null });
  }, [updateMyPresence]);

  return {
    hasConflict: A.isNonEmptyReadonlyArray(conflictingUsers),
    conflictingUsers,
    canProceed: A.isEmptyReadonlyArray(conflictingUsers),
    usersUsingAi,
    broadcastAiActivity,
    clearAiActivity,
  };
}

/**
 * No-op version of useCollaborativeAi for non-collaborative mode.
 * Returns safe defaults that allow all operations.
 */
export function useCollaborativeAiStub(): CollaborativeAiState {
  const noopBroadcast = useCallback(() => {
    // No-op in non-collaborative mode
  }, []);

  return {
    hasConflict: false,
    conflictingUsers: [],
    canProceed: true,
    usersUsingAi: [],
    broadcastAiActivity: noopBroadcast,
    clearAiActivity: noopBroadcast,
  };
}

export type { CollaborativeAiState, ConflictingUser, SerializedRange };
