import * as Either from "effect/Either";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import { INITIAL_SETTINGS, type Settings } from "./settings";

// Schema for parsing JSON values from query parameters
// Accepts any valid JSON and decodes it to unknown
const JsonValueSchema = S.parseJson(S.Unknown);
const decodeJsonValue = S.decodeUnknownEither(JsonValueSchema);
// Export a function so this is not tree-shaken,
// but evaluate it immediately so it executes before
// lexical computes CAN_USE_BEFORE_INPUT
export default (() => {
  // override default options with query parameters if any
  const urlSearchParams = new URLSearchParams(window.location.search);

  for (const param of Struct.keys(INITIAL_SETTINGS)) {
    if (urlSearchParams.has(param)) {
      decodeJsonValue(urlSearchParams.get(param) ?? "true").pipe(
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
