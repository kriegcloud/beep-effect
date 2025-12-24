import type { JSX } from "react";

export type ShowModalFn = (title: string, showModal: (onClose: () => void) => JSX.Element) => void;

export type UseModalReturn = [JSX.Element | null, ShowModalFn];
