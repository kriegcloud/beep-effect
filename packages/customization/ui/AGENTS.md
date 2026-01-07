# @beep/customization-ui — Agent Guide

## Purpose & Fit
- Provides React UI components for the customization slice, enabling user preference management in the frontend.
- Contains components for hotkey configuration, theme selection, and other personalization features.
- Integrates with `@beep/customization-client` contracts via TanStack Query hooks.
- Currently a minimal scaffold awaiting component implementations as the customization feature matures.

## Surface Map
- **beep** — Placeholder export indicating package initialization (awaiting component implementations).

## Usage Snapshots
- Next.js app imports components from this package for settings pages.
- Components use TanStack Query hooks wrapping customization contracts for data fetching.
- Theme and preference components integrate with client-side ManagedRuntime for Effect-based state.
- Storybook stories showcase component variants and interactions.

## Authoring Guardrails
- Always import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`) when using Effect utilities in components.
- Use `"use client"` directive for components requiring client-side interactivity.
- Follow MUI and Tailwind patterns from `@beep/ui-core` for consistent styling.
- Compose hooks from `@beep/runtime-client` for Effect integration in React components.
- Keep components focused on presentation — business logic should live in contracts or domain layer.
- Use React 19 patterns and avoid deprecated lifecycle methods.

## Quick Recipes
- **Create a hotkey settings component**
  ```tsx
  "use client";
  import { useQuery } from "@tanstack/react-query";
  import { Box, Typography } from "@mui/material";
  // import { hotkeyContract } from "@beep/customization-client";

  export function HotkeySettings({ userId }: { userId: string }) {
    // const { data: hotkeys, isLoading } = useQuery({
    //   queryKey: ["hotkeys", userId],
    //   queryFn: () => hotkeyContract.get({ userId }),
    // });

    return (
      <Box>
        <Typography variant="h6">Keyboard Shortcuts</Typography>
        {/* Hotkey configuration UI */}
      </Box>
    );
  }
  ```

## Verifications
- `bun run check --filter @beep/customization-ui`
- `bun run lint --filter @beep/customization-ui`
- `bun run test --filter @beep/customization-ui`

## Contributor Checklist
- [ ] Add `"use client"` directive for interactive components.
- [ ] Follow MUI/Tailwind styling patterns from `@beep/ui-core`.
- [ ] Integrate with TanStack Query for data fetching via customization contracts.
- [ ] Add TypeScript doc comments for exported components.
- [ ] Create Storybook stories for visual component testing.
- [ ] Re-run verification commands above before handing work off.
