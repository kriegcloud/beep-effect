import { runArchitectureLabProof } from "@beep/architecture-lab-proof";
import { expect } from "tstyche";

expect(runArchitectureLabProof).type.not.toBe<never>();
