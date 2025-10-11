import { m } from "motion/react";
import { Timer } from "@/features/visual-effect/components/Timer";
import { theme } from "@/features/visual-effect/theme";
import type { VisualEffect } from "@/features/visual-effect/VisualEffect";
import { useVisualEffectState } from "@/features/visual-effect/VisualEffect";

interface EffectLabelProps {
  effect: VisualEffect<unknown, unknown>;
}

export function EffectLabel({ effect }: EffectLabelProps) {
  const state = useVisualEffectState(effect);

  return (
    <m.div
      style={{
        marginTop: theme.spacing.sm,
        fontSize: "0.75rem",
        textAlign: "center",
        fontWeight: 500,
        color: theme.colors.textMuted,
      }}
      animate={{
        color: state.type === "idle" ? theme.colors.textMuted : theme.colors.textSecondary,
      }}
      transition={{ duration: 0.3 }}
    >
      <Timer effect={effect} />
    </m.div>
  );
}
