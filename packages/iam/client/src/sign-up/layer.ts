import { ReCaptcha } from "@beep/shared-client";
import { Wrap } from "@beep/wrap";
import * as Layer from "effect/Layer";
import { Email } from "./email";

export const Group = Wrap.WrapperGroup.make(Email.Wrapper);

export const Handlers = Group.of({
  Email: Email.Handler,
});

export const layer = Group.toLayer(Handlers).pipe(Layer.provideMerge(ReCaptcha.ReCaptchaLive));
