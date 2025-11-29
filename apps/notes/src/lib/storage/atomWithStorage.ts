import type { WritableAtom } from "jotai/vanilla";
import { atomWithStorage as _atomWithStorage } from "jotai/vanilla/utils";
import type { SyncStorage } from "jotai/vanilla/utils/atomWithStorage";
import type { RESET } from "jotai/vanilla/utils/constants";

type SetStateActionWithReset<Value> = ((prev: Value) => Value | typeof RESET) | Value | typeof RESET;

export function atomWithStorage<Value>(
  key: string,
  initialValue: Value,
  storage?: undefined | SyncStorage<Value>,
  options?:
    | undefined
    | {
        getOnInit?: undefined | boolean;
      }
): WritableAtom<Value, [SetStateActionWithReset<Value>], void> {
  // Build options conditionally to satisfy exactOptionalPropertyTypes
  const opts: { getOnInit?: boolean } = {};
  if (options?.getOnInit !== undefined) {
    opts.getOnInit = options.getOnInit;
  }
  return _atomWithStorage(key, initialValue, storage, Object.keys(opts).length > 0 ? opts : undefined) as any;
}
