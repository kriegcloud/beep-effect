"use client";
import { _userAbout } from "@beep/mock/_user";
import { AccountSocials } from "../account-socials";
// ----------------------------------------------------------------------

export function AccountSocialsView() {
  return <AccountSocials socialLinks={_userAbout.socialLinks} />;
}
