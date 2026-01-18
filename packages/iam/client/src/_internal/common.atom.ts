import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $IamClientId.create("_common/common.atom");

export class AtomSetMode extends BS.StringLiteralKit("value", "promise", "promiseExit").annotations(
  $I.annotations("AtomSetMode", {
    description: "A value for the `mode` property of the `useAtomSet` options parameter.",
  })
) {}

export declare namespace AtomSetMode {
  export type Type = typeof AtomSetMode.Type;
  export type Enum = typeof AtomSetMode.Enum;
}

export const modePromise = {
  mode: AtomSetMode.Enum.promise,
};

export const modePromiseExit = {
  mode: AtomSetMode.Enum.promiseExit,
};
