import { PathBuilder } from "@beep/shared-domain/factories";
import * as F from "effect/Function";
import type { IamEntityIds, SharedEntityIds } from "../entity-ids";

// Base builders

const auth = PathBuilder.createRoot("/auth");
const signIn = auth.child("sign-in");
const signUp = auth.child("sign-up");
const updatePassword = auth.child("update-password");
const requestResetPassword = auth.child("request-reset-password");
const resetPassword = auth.child("reset-password");
const verifyEmail = auth.child("verify-email");
const verifyPhone = auth.child("verify-phone");
const verifyPhoneResend = verifyPhone.child("resend");
const acceptInvitation = auth.child("accept-invitation");
const passkey = auth.child("passkey");
const passkeyManage = passkey.child("manage");
const passkeyRegister = passkey.child("register");
const anonymous = auth.child("anonymous");
const anonymousUpgrade = anonymous.child("upgrade");
const signOut = auth.child("sign-out");
const oneTimeToken = auth.child("one-time-token");
const oneTimeTokenGenerate = oneTimeToken.child("generate");
const oneTimeTokenVerify = oneTimeToken.child("verify");
const siweRoot = auth.child("siwe");
const siweConnect = siweRoot.child("connect");
const siweVerify = siweRoot.child("verify");
const oauth = auth.child("oauth");
const oauthCallback = oauth.child("callback");
const oauthSuccess = oauth.child("success");
const oauthError = oauth.child("error");
const oauthComplete = oauth.child("complete");
const oauthLink = oauth.child("link");
const oauthProvider = (providerId: string) => oauth.child(providerId);
const authCallback = auth.child("callback");
const authStatus = auth.child("status");
const authSuccess = auth.child("success");
const authFailure = auth.child("failure");
const twoFactor = auth.child("two-factor");
const twoFactorChallenge = twoFactor.child("challenge");
const twoFactorOtp = twoFactor.child("otp");
const twoFactorTotp = twoFactor.child("totp");
const twoFactorRecovery = twoFactor.child("recovery");
const twoFactorBackupCodes = twoFactor.child("backup-codes");
const twoFactorDevices = twoFactor.child("devices");
const device = auth.child("device");
const deviceStart = device.child("start");
const devicePoll = device.child("poll");
const deviceVerify = device.child("verify");
const deviceStatus = device.child("status");
const account = (id: IamEntityIds.AccountId.Type) => PathBuilder.createRoot("/account").child(id);
const dashboard = PathBuilder.createRoot("/dashboard");

const user = dashboard.child("user");
const userDialog = (settingsTab: string) =>
  PathBuilder.dynamicQueries(user.root)({
    settingsTab,
  });
const userAccount = user.child("account");
const fileManager = dashboard.child("file-manager");
const organization = (id: SharedEntityIds.OrganizationId.Type) => PathBuilder.createRoot("/organizations").child(id);

type AuthSignInMethod = "anonymous" | "email" | "oauth" | "oneTap" | "otp" | "passkey" | "totp" | "username";

type AuthSignUpMethod = "email" | "username";
// todo it would be sic to add metadata annotations to individual parts.
export const paths = PathBuilder.collection({
  // static
  root: "/",
  comingSoon: "/coming-soon",
  maintenance: "/maintenance",
  pricing: "/pricing",
  payment: "/payment",
  about: "/about-us",
  contact: "/contact-us",
  faqs: "/faqs",
  terms: "/terms",
  privacy: "/privacy-policy",
  // auth
  auth: {
    signIn: signIn.root,
    signUp: signUp.root,
    signOut: signOut.root,
    updatePassword: updatePassword.root,
    requestResetPassword: requestResetPassword.root,
    resetPassword: resetPassword.root,
    status: authStatus.root,
    success: authSuccess.root,
    failure: authFailure.root,
    callback: authCallback.root,
    verification: {
      email: F.pipe(
        verifyEmail,
        (ve) =>
          ({
            root: ve.root,
            verify: (token: string) =>
              PathBuilder.dynamicQueries(ve.root)({
                token,
              }),
            callback: (token: string, callbackURL: string) =>
              PathBuilder.dynamicQueries(ve.root)({
                token,
                callbackURL,
              }),
            error: (errorCode: string) =>
              PathBuilder.dynamicQueries(ve.root)({
                error: errorCode,
              }),
            status: (status: string) =>
              PathBuilder.dynamicQueries(ve.root)({
                status,
              }),
          }) as const
      ),
      phone: F.pipe(
        verifyPhone,
        (vp) =>
          ({
            root: vp.root,
            verify: (code: string) =>
              PathBuilder.dynamicQueries(vp.root)({
                code,
              }),
            withStatus: (status: string) =>
              PathBuilder.dynamicQueries(vp.root)({
                status,
              }),
            error: (errorCode: string) =>
              PathBuilder.dynamicQueries(vp.root)({
                error: errorCode,
              }),
            resend: verifyPhoneResend.root,
          }) as const
      ),
    },
    twoFactor: F.pipe(
      twoFactor,
      (tf) =>
        ({
          root: tf.root,
          challenge: F.pipe(
            twoFactorChallenge,
            (challenge) =>
              ({
                root: challenge.root,
                withToken: (token: string) =>
                  PathBuilder.dynamicQueries(challenge.root)({
                    token,
                  }),
                trustedDevice: (token: string) =>
                  PathBuilder.dynamicQueries(challenge.root)({
                    token,
                    trustDevice: "true",
                  }),
              }) as const
          ),
          otp: F.pipe(
            twoFactorOtp,
            (otp) =>
              ({
                root: otp.root,
                withStatus: (status: string) =>
                  PathBuilder.dynamicQueries(otp.root)({
                    status,
                  }),
                error: (errorCode: string) =>
                  PathBuilder.dynamicQueries(otp.root)({
                    error: errorCode,
                  }),
              }) as const
          ),
          totp: F.pipe(
            twoFactorTotp,
            (totpValue) =>
              ({
                root: totpValue.root,
                withState: (state: string) =>
                  PathBuilder.dynamicQueries(totpValue.root)({
                    state,
                  }),
                error: (errorCode: string) =>
                  PathBuilder.dynamicQueries(totpValue.root)({
                    error: errorCode,
                  }),
              }) as const
          ),
          recovery: F.pipe(
            twoFactorRecovery,
            (recovery) =>
              ({
                root: recovery.root,
                verify: recovery("verify"),
                withToken: (token: string) =>
                  PathBuilder.dynamicQueries(recovery.root)({
                    token,
                  }),
              }) as const
          ),
          backupCodes: {
            root: twoFactorBackupCodes.root,
          },
          devices: {
            root: twoFactorDevices.root,
          },
        }) as const
    ),
    acceptInvitation: acceptInvitation.root,
    device: {
      root: device.root,
      start: deviceStart.root,
      poll: devicePoll.root,
      status: deviceStatus.root,
      verify: deviceVerify.root,
      approve: device("approve"),
      denied: device("denied"),
      success: device("success"),
      withUserCode: (userCode: string) =>
        PathBuilder.dynamicQueries(device.root)({
          userCode,
        }),
    },
    passkey: passkey.root,
    anonymous: anonymous.root,
    oauth: oauth.root,
    oneTimeToken: oneTimeToken.root,
    siwe: siweRoot.root,
    routes: {
      signIn: F.pipe(
        signIn,
        (si) =>
          ({
            root: si.root,
            withCallback: (callbackURL: string) =>
              PathBuilder.dynamicQueries(si.root)({
                callbackURL,
              }),
            withMethod: (method: AuthSignInMethod) =>
              PathBuilder.dynamicQueries(si.root)({
                method,
              }),
            withCallbackAndMethod: (callbackURL: string, method: AuthSignInMethod) =>
              PathBuilder.dynamicQueries(si.root)({
                callbackURL,
                method,
              }),
            withError: (errorCode: string) =>
              PathBuilder.dynamicQueries(si.root)({
                error: errorCode,
              }),
            withState: (state: string) =>
              PathBuilder.dynamicQueries(si.root)({
                state,
              }),
          }) as const
      ),
      signUp: F.pipe(
        signUp,
        (su) =>
          ({
            root: su.root,
            withCallback: (callbackURL: string) =>
              PathBuilder.dynamicQueries(su.root)({
                callbackURL,
              }),
            withMethod: (method: AuthSignUpMethod) =>
              PathBuilder.dynamicQueries(su.root)({
                method,
              }),
            withPlan: (plan: string) =>
              PathBuilder.dynamicQueries(su.root)({
                plan,
              }),
            withSource: (source: string) =>
              PathBuilder.dynamicQueries(su.root)({
                source,
              }),
          }) as const
      ),
      requestResetPassword: F.pipe(
        requestResetPassword,
        (rrp) =>
          ({
            root: rrp.root,
            withStatus: (status: string) =>
              PathBuilder.dynamicQueries(rrp.root)({
                status,
              }),
            withEmail: (email: string) =>
              PathBuilder.dynamicQueries(rrp.root)({
                email,
              }),
          }) as const
      ),
      resetPassword: F.pipe(
        resetPassword,
        (rp) =>
          ({
            root: rp.root,
            withToken: (token: string) =>
              PathBuilder.dynamicQueries(rp.root)({
                token,
              }),
            withTokenAndStatus: (token: string, status: string) =>
              PathBuilder.dynamicQueries(rp.root)({
                token,
                status,
              }),
            withTokenAndError: (token: string, error: string) =>
              PathBuilder.dynamicQueries(rp.root)({
                token,
                error,
              }),
            withTokenAndCallback: (token: string, callbackURL: string) =>
              PathBuilder.dynamicQueries(rp.root)({
                token,
                callbackURL,
              }),
          }) as const
      ),
      acceptInvitation: F.pipe(
        acceptInvitation,
        (ai) =>
          ({
            root: ai.root,
            token: PathBuilder.dynamicPath(ai.root),
            withStatus: (status: string) =>
              PathBuilder.dynamicQueries(ai.root)({
                status,
              }),
          }) as const
      ),
      oauth: {
        root: oauth.root,
        callback: oauthCallback.root,
        success: oauthSuccess.root,
        error: oauthError.root,
        complete: oauthComplete.root,
        link: oauthLink.root,
        withState: (state: string) =>
          PathBuilder.dynamicQueries(oauth.root)({
            state,
          }),
        provider: F.flow(
          oauthProvider,
          (provider) =>
            ({
              root: provider.root,
              callback: provider("callback"),
              link: provider("link"),
              complete: provider("complete"),
              error: provider("error"),
            }) as const
        ),
      },
      passkey: F.pipe(
        passkey,
        (pk) =>
          ({
            root: pk.root,
            manage: passkeyManage.root,
            register: passkeyRegister.root,
            withState: (state: string) =>
              PathBuilder.dynamicQueries(pk.root)({
                state,
              }),
            withError: (errorCode: string) =>
              PathBuilder.dynamicQueries(pk.root)({
                error: errorCode,
              }),
          }) as const
      ),
      anonymous: F.pipe(
        anonymous,
        (anon) =>
          ({
            root: anon.root,
            upgrade: anonymousUpgrade.root,
            withCallback: (callbackURL: string) =>
              PathBuilder.dynamicQueries(anon.root)({
                callbackURL,
              }),
          }) as const
      ),
      oneTimeToken: F.pipe(
        oneTimeToken,
        (ott) =>
          ({
            root: ott.root,
            generate: oneTimeTokenGenerate.root,
            verify: oneTimeTokenVerify.root,
            withToken: (token: string) =>
              PathBuilder.dynamicQueries(oneTimeTokenVerify.root)({
                token,
              }),
            withStatus: (status: string) =>
              PathBuilder.dynamicQueries(ott.root)({
                status,
              }),
          }) as const
      ),
      siwe: F.pipe(
        siweRoot,
        (siwe) =>
          ({
            root: siwe.root,
            connect: siweConnect.root,
            verify: siweVerify.root,
            withRedirect: (redirect: string) =>
              PathBuilder.dynamicQueries(siwe.root)({
                redirect,
              }),
          }) as const
      ),
    },
  },
  settings: {
    root: "/settings",
  },
  admin: {
    root: "/admin",
  },
  organizations: {
    root: "/organizations",
    ...F.flow(organization, (o) => ({
      root: o.root,
      edit: o("edit"),
      members: o("members"),
      settings: o("settings"),
      billing: o("billing"),
      invitations: o("invitations"),
      security: o("security"),
    })),
  },
  account: F.flow(account, (a) => ({
    root: a.root,
    edit: a("edit"),
    security: a("security"),
    preferences: a("preferences"),
    notifications: a("notifications"),
    sessions: a("sessions"),
    devices: a("devices"),
    apiKeys: a("api-keys"),
    passkeys: a("passkeys"),
    twoFactor: a("two-factor"),
    recoveryCodes: a("recovery-codes"),
    jwt: a("jwt"),
  })),
  fileManager: {
    root: fileManager.root,
  },
  // dashboard
  dashboard: {
    root: dashboard.root,
    user: {
      root: user.root,
      accountSettings: userDialog,
      account: {
        root: userAccount.root,
        billing: userAccount("billing"),
        notifications: userAccount("notifications"),
        socials: userAccount("socials"),
        security: userAccount("security"),
      },
      edit: (id: SharedEntityIds.UserId.Type) => user.child(id)("edit"),
    },
  },
} as const);
