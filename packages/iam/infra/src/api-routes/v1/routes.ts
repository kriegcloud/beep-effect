import { SignIn } from "./sign-in";
import { SignUp } from "./sign-up";
import * as Layer from "effect/Layer";

export const layer = Layer.mergeAll(
  SignIn.Routes,
  SignUp.Routes,
)
