"use client";

import { ColumnElement, ColumnGroupElement } from "@beep/ui/components/column-node";
import { ColumnItemPlugin, ColumnPlugin } from "@platejs/layout/react";

export const ColumnKit = [
  ColumnPlugin.withComponent(ColumnGroupElement),
  ColumnItemPlugin.withComponent(ColumnElement),
];
