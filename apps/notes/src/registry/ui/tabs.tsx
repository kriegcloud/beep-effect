"use client";

import { cn } from "@beep/notes/lib/utils";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

export const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva("inline-flex h-10 w-full items-center border-b border-border bg-background px-2 text-sm");

export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return <TabsPrimitive.List className={cn(tabsListVariants(), className)} {...props} />;
}

const tabsTriggerVariants = cva(
  cn(
    "relative inline-flex h-[28px] items-center justify-center rounded-sm px-2 whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50",
    "text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-accent-foreground",
    'data-[state=active]:text-foreground data-[state=active]:before:absolute data-[state=active]:before:bottom-[-6px] data-[state=active]:before:left-2 data-[state=active]:before:h-[2px] data-[state=active]:before:w-[calc(100%-16px)] data-[state=active]:before:bg-primary data-[state=active]:before:content-[""]'
  )
);

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & VariantProps<typeof tabsTriggerVariants>) {
  return <TabsPrimitive.Trigger className={cn(tabsTriggerVariants(), className)} {...props} />;
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-2 ring-offset-background focus-visible:outline-hidden", className)}
      {...props}
    />
  );
}
