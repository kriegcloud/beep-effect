// import {
//   OAuthContractKit,
//   OAuthImplementations,
// } from "./oauth";
// import {
//   OrganizationContractKit,
//   OrganizationImplementations,
// } from "./organization";
// import {
//   RecoverContractKit,
//   RecoverImplementations,
// } from "./recover";
// import {
//   SignInContractKit,
//   SignInImplementations,
// } from "./sign-in";
// import {
//   SignOutContractKit,
//   SignOutImplementations,
// } from "./sign-out";
// import {
//   SignUpContractKit,
//   SignUpImplementations,
// } from "./sign-up";
// import {
//   TwoFactorContractKit,
//   TwoFactorImplementations,
// } from "./two-factor";
// import {
//   VerifyContractKit,
//   VerifyImplementations,
// } from "./verify";
//
// export const iamContracts = {
//   signIn: SignInContractKit,
//   signUp: SignUpContractKit,
//   recover: RecoverContractKit,
//   verify: VerifyContractKit,
//   twoFactor: TwoFactorContractKit,
//   organization: OrganizationContractKit,
//   oauth2: OAuthContractKit,
//   signOut: SignOutContractKit,
// } as const;
//
// export const iamImplementations = {
//   signIn: SignInImplementations,
//   signUp: SignUpImplementations,
//   recover: RecoverImplementations,
//   verify: VerifyImplementations,
//   twoFactor: TwoFactorImplementations,
//   organization: OrganizationImplementations,
//   oauth2: OAuthImplementations,
//   signOut: SignOutImplementations,
// } as const;
//
// export const iam = {
//   signIn: {
//     email: SignInImplementations.SignInEmailContract,
//     social: SignInImplementations.SignInSocialContract,
//     username: SignInImplementations.SignInUsernameContract,
//     phoneNumber: SignInImplementations.SignInPhoneNumberContract,
//     passkey: SignInImplementations.SignInPasskeyContract,
//     oneTap: SignInImplementations.SignInOneTapContract,
//   },
//   recover: {
//     resetPassword: RecoverImplementations.ResetPasswordContract,
//     requestPasswordReset: RecoverImplementations.RequestResetPasswordContract,
//   },
//   signUp: {
//     email: SignUpImplementations.SignUpEmailContract,
//   },
//   verify: {
//     phone: VerifyImplementations.SendVerifyPhoneContract,
//     email: {
//       sendVerificationEmail: VerifyImplementations.SendEmailVerificationContract,
//       verifyEmail: VerifyImplementations.VerifyEmailContract,
//     },
//   },
//   twoFactor: {
//     sendOtp: TwoFactorImplementations.SendOtpContract,
//     verifyOtp: TwoFactorImplementations.VerifyOtpContract,
//     verifyTotp: TwoFactorImplementations.VerifyTotpContract,
//   },
//   organization: {
//     acceptInvitation: OrganizationImplementations.AcceptInvitationContract,
//   },
//   oauth2: {
//     register: OAuthImplementations.OAuthRegisterContract,
//   },
//   signOut: SignOutImplementations.SignOutContract,
// } as const;
