import { AccountSettingsTabSearchParamValue } from "@beep/iam-domain";
import { urlSearchParamSSR } from "@beep/runtime-client";
import { Atom, useAtom } from "@effect-atom/atom-react";
import * as Data from "effect/Data";
import * as O from "effect/Option";

export type Action = Data.TaggedEnum<{
  OpenTab: {
    readonly tab: O.Option<AccountSettingsTabSearchParamValue.Type>;
  };
  Close: {
    readonly tab: O.Option<AccountSettingsTabSearchParamValue.Type>;
  };
}>;

const Action = Data.taggedEnum<Action>();

const remoteSettingsDialogAtom = urlSearchParamSSR("settingsTab", {
  schema: AccountSettingsTabSearchParamValue,
});

export const settingsDialogAtom = Object.assign(
  Atom.writable(
    (get: Atom.Context) => get(remoteSettingsDialogAtom),
    (ctx, action: Action) =>
      Action.$match(action, {
        OpenTab: ({ tab }) => ctx.set(remoteSettingsDialogAtom, tab),
        Close: () => ctx.set(remoteSettingsDialogAtom, O.none<AccountSettingsTabSearchParamValue.Type>()),
      })
  ),
  { remoteAtom: remoteSettingsDialogAtom }
);

export const useSettingsDialog = () => {
  const [currentTab, setCurrentTab] = useAtom(settingsDialogAtom);

  const handleClose = () => setCurrentTab(Action.Close({ tab: O.none<AccountSettingsTabSearchParamValue.Type>() }));

  const handleTab = (tab: AccountSettingsTabSearchParamValue.Type) =>
    setCurrentTab(Action.OpenTab({ tab: O.some(tab) }));

  return {
    currentTab,
    handleTab,
    handleClose,
  };
};
