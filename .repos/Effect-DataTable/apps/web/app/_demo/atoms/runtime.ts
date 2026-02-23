"use client"

import { Atom } from "@effect-atom/atom"
import { DemoLive } from "../layers/DemoLive"

// Create a runtime atom with all demo services
export const demoRuntime = Atom.runtime(DemoLive)
