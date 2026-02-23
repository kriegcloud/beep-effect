import type { ScriptProps } from "./types";

export function loadScript({ async, appendTo, defer, id, nonce, src }: ScriptProps) {
  const script = document.createElement("script");
  if (async !== undefined) {
    script.async = async;
  }
  if (defer !== undefined) {
    script.defer = defer;
  }
  if (id) {
    script.id = id;
  }
  if (nonce) {
    script.setAttribute("nonce", nonce);
  }
  script.src = src;

  const appendTarget = appendTo === "head" ? document.head : document.body;

  appendTarget.appendChild(script);
}
