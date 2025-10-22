"use client";
import { AccountSocials } from "../account-socials";

// ----------------------------------------------------------------------
export const _userAbout = {
  socialLinks: {
    facebook: `https://www.facebook.com/frankie`,
    instagram: `https://www.instagram.com/frankie`,
    linkedin: `https://www.linkedin.com/in/frankie`,
    x: `https://www.x.com/frankie`,
  },
};
export function AccountSocialsView() {
  return <AccountSocials socialLinks={_userAbout.socialLinks} />;
}
