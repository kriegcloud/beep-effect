"use client";

import { EquationElement, InlineEquationElement } from "@beep/ui/components/equation-node";
import { EquationPlugin, InlineEquationPlugin } from "@platejs/math/react";

export const MathKit = [
  InlineEquationPlugin.withComponent(InlineEquationElement),
  EquationPlugin.withComponent(EquationElement),
];
