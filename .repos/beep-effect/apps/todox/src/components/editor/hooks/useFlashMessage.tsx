"use client";

import { type ShowFlashMessage, useFlashMessageContextSafe } from "../context/FlashMessageContext";

export default function useFlashMessage(): ShowFlashMessage {
  return useFlashMessageContextSafe();
}
