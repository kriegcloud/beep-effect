"use client";

import { EquationElement, InlineEquationElement } from "@beep/notes/registry/ui/equation-node";
import { EquationPlugin, InlineEquationPlugin } from "@platejs/math/react";

export const MathKit = [
  InlineEquationPlugin.withComponent(InlineEquationElement),
  EquationPlugin.withComponent(EquationElement),
];
