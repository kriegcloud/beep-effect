"use client";

import type { UnsafeTypes } from "@beep/types";
import mitt from "mitt";

export type ModalName = "Confirm" | "Discard" | "Export" | "Import" | "Login" | "Settings" | "VersionHistory";

type EventHandlers = {
  readonly change: { readonly name: ModalName; readonly open: boolean; readonly props: Record<string, unknown> };
  readonly pop: { name?: undefined | ModalName };
  readonly popAll: undefined;
  readonly push: {
    readonly name: ModalName;
    readonly props: Record<string, unknown>;
  };
  readonly replace: {
    readonly name: ModalName;
    readonly props: Record<string, unknown>;
  };
};

export const modalEmitter = mitt<EventHandlers>();

export const popModal = (name?: undefined | ModalName) =>
  modalEmitter.emit("pop", {
    name,
  });

export const popAllModals = () => modalEmitter.emit("popAll");

export const pushModal = <T extends ModalName>(name: T, props?: UnsafeTypes.UnsafeAny) => {
  return modalEmitter.emit("push", {
    name,
    props: props ?? {},
  });
};

export const replaceWithModal = <T extends ModalName>(name: T, props?: UnsafeTypes.UnsafeAny) => {
  modalEmitter.emit("replace", {
    name,
    props: props ?? {},
  });
};
