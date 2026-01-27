/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as P from "effect/Predicate";

export default function joinClasses(...args: Array<string | boolean | null | undefined>): string {
  return pipe(A.filter(args, P.isString), A.join(" "));
}
