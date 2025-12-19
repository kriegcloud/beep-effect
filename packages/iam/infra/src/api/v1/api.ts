import type { IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-infra";
import * as Layer from "effect/Layer";
import { Admin } from "./admin";
import { Core } from "./core";
import { Organization } from "./organization";
import { SignIn } from "./sign-in";
import { SignUp } from "./sign-up";

export type Service = SignIn.Service | SignUp.Service | Core.Service | Admin.Service | Organization.Service;

export type Api = Layer.Layer<Service, IamAuthError, Auth.Service>;

export const layer: Api = Layer.mergeAll(SignIn.Routes, SignUp.Routes, Core.Routes, Admin.Routes, Organization.Routes);
