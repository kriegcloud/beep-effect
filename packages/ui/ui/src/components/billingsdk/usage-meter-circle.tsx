"use client";

import { UsageMeter, type UsageMeterProps } from "@beep/ui/components/billingsdk/usage-meter";

export type UsageMeterCircleProps = Omit<UsageMeterProps, "variant">;

export function UsageMeterCircle(props: UsageMeterCircleProps) {
  return <UsageMeter {...props} variant="circle" />;
}
