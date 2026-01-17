import { Wrap } from "@beep/wrap";
import { GetSession } from "./get-session";
import { SignOut } from "./sign-out";
export const Group = Wrap.WrapperGroup.make(SignOut.Wrapper, GetSession.Wrapper);

export const Handlers = Group.of({
  SignOut: SignOut.Handler,
  GetSession: GetSession.Handler,
});

export const layer = Group.toLayer(Handlers);
