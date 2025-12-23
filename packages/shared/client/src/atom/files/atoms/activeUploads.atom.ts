import type { ActiveUpload } from "@beep/shared-client/atom/files/types";
import { Atom } from "@effect-atom/atom-react";
import * as A from "effect/Array";

export const activeUploadsAtom = Atom.make<ReadonlyArray<ActiveUpload>>(A.empty());
