import type { WritableAtom } from "jotai/vanilla";
import { atomWithStorage as _atomWithStorage } from "jotai/vanilla/utils";
import type { SyncStorage } from "jotai/vanilla/utils/atomWithStorage";
import type { RESET } from "jotai/vanilla/utils/constants";

type SetStateActionWithReset<Value> = ((prev: Value) => Value | typeof RESET) | Value | typeof RESET;

export function atomWithStorage<Value>(
  key: string,
  initialValue: Value,
  storage?: SyncStorage<Value>,
  options?: {
    getOnInit?: boolean;
  }
): WritableAtom<Value, [SetStateActionWithReset<Value>], void> {
  return _atomWithStorage(key, initialValue, storage, options);
}
