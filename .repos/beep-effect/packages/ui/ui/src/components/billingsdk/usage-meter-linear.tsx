"use client";

import { UsageMeter, type UsageMeterProps } from "@beep/ui/components/billingsdk/usage-meter";

export type UsageMeterLinearProps = Omit<UsageMeterProps, "variant">;

export function UsageMeterLinear(props: UsageMeterLinearProps) {
  return <UsageMeter {...props} variant="linear" />;
}
