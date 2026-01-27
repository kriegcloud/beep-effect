/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as Either from "effect/Either";
import * as Struct from "effect/Struct";
import { INITIAL_SETTINGS, type Settings } from "./settings";
// Export a function so this is not tree-shaken,
// but evaluate it immediately so it executes before
// lexical computes CAN_USE_BEFORE_INPUT
export default (() => {
  // override default options with query parameters if any
  const urlSearchParams = new URLSearchParams(window.location.search);

  for (const param of Struct.keys(INITIAL_SETTINGS)) {
    if (urlSearchParams.has(param)) {
      Either.try(() => JSON.parse(urlSearchParams.get(param) ?? "true")).pipe(
        Either.match({
          onLeft: () => console.warn(`Unable to parse query parameter "${param}"`),
          onRight: (value) => {
            INITIAL_SETTINGS[param as keyof Settings] = Boolean(value);
          },
        })
      );
    }
  }

  if (INITIAL_SETTINGS.disableBeforeInput) {
    delete (window.InputEvent.prototype as { getTargetRanges?: unknown }).getTargetRanges;
  }

  window.EXCALIDRAW_ASSET_PATH = process.env.EXCALIDRAW_ASSET_PATH;

  return INITIAL_SETTINGS;
})();
