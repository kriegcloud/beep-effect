"use client";

import { type ShowFlashMessage, useFlashMessageContext } from "../context/FlashMessageContext";

export default function useFlashMessage(): ShowFlashMessage {
  return useFlashMessageContext();
}
