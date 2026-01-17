import { ReCaptcha } from "@beep/shared-client";
import { Wrap } from "@beep/wrap";
import * as Layer from "effect/Layer";
import { Email } from "./email";
import { Username } from "./username";
export const Group = Wrap.WrapperGroup.make(Email.Wrapper, Username.Wrapper);

export const Handlers = Group.of({
  Email: Email.Handler,
  Username: Username.Handler,
});

export const layer = Group.toLayer(Handlers).pipe(Layer.provideMerge(ReCaptcha.ReCaptchaLive));
