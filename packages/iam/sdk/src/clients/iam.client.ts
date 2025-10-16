// import {
//   OAuthContractSet,
//   OAuthImplementations,
// } from "./oauth";
// import {
//   OrganizationContractSet,
//   OrganizationImplementations,
// } from "./organization";
// import {
//   RecoverContractSet,
//   RecoverImplementations,
// } from "./recover";
// import {
//   SignInContractSet,
//   SignInImplementations,
// } from "./sign-in";
// import {
//   SignOutContractSet,
//   SignOutImplementations,
// } from "./sign-out";
// import {
//   SignUpContractSet,
//   SignUpImplementations,
// } from "./sign-up";
// import {
//   TwoFactorContractSet,
//   TwoFactorImplementations,
// } from "./two-factor";
// import {
//   VerifyContractSet,
//   VerifyImplementations,
// } from "./verify";
//
// export const iamContracts = {
//   signIn: SignInContractSet,
//   signUp: SignUpContractSet,
//   recover: RecoverContractSet,
//   verify: VerifyContractSet,
//   twoFactor: TwoFactorContractSet,
//   organization: OrganizationContractSet,
//   oauth2: OAuthContractSet,
//   signOut: SignOutContractSet,
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
