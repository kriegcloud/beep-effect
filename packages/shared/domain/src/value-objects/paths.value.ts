import { PathBuilder } from "@beep/shared-domain/factories";

const Root = PathBuilder.make("/");
const auth = Root.create("auth");

export const paths = PathBuilder.collection({
  root: Root.string(),
  comingSoon: Root("coming-soon"),
  maintenance: Root("maintenance"),
  pricing: Root("pricing"),
  payment: Root("payment"),
  about: Root("about-us"),
  contact: Root("contact-us"),
  faqs: Root("faqs"),
  terms: Root("terms"),
  privacy: Root("privacy-policy"),
  auth: {
    signIn: auth("sign-in"),
    signUp: auth("sign-up"),
    forgotPassword: auth("forgot-password"),
  },
} as const);
