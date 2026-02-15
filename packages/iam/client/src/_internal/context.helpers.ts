import type * as W from "@beep/wrap";

export type IamClientContext<G> = G extends W.WrapperGroup.WrapperGroup<infer R> ? {
 readonly [K in R["_tag"]]: (
   payload: W.Wrapper.Payload<Extract<R, { readonly _tag: K }>>
  ) => W.Wrapper.ResultFrom<Extract<R, { readonly _tag: K }>, never>
} : never