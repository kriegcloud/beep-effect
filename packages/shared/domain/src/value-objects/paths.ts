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
const dashboardBilling = dashboard.child("billing");
const dashboardBillingSubscribe = dashboardBilling.child("subscribe");
const dashboardBillingPortal = dashboardBilling.child("portal");
const dashboardBillingSuccess = dashboardBilling.child("success");
const dashboardBillingCancel = dashboardBilling.child("cancel");
const dashboardBillingHistory = dashboardBilling.child("history");
const dashboardSecurity = dashboard.child("security");
const dashboardSecuritySessions = dashboardSecurity.child("sessions");
const dashboardSecurityDevices = dashboardSecurity.child("devices");
const dashboardSecurityPasskeys = dashboardSecurity.child("passkeys");
const dashboardSecurityTwoFactor = dashboardSecurity.child("two-factor");
const dashboardSecurityRecovery = dashboardSecurity.child("recovery-codes");
const dashboardSecurityJwt = dashboardSecurity.child("jwt");
const dashboardApiKeys = dashboard.child("api-keys");
const dashboardApiKeysCreate = dashboardApiKeys.child("new");
const dashboardApiKey = (keyId: string) => dashboardApiKeys.child(keyId);
const dashboardAdmin = dashboard.child("admin");
const dashboardAdminUsers = dashboardAdmin.child("users");
const dashboardAdminUser = (id: SharedEntityIds.UserId.Type) => dashboardAdminUsers.child(id);
const dashboardAdminSso = dashboardAdmin.child("sso");
const dashboardAdminSsoProvider = (providerId: string) => dashboardAdminSso.child(providerId);
const dashboardAdminOidc = dashboardAdmin.child("oidc");
const dashboardAdminOidcClient = (clientId: string) => dashboardAdminOidc.child(clientId);
const dashboardAdminPermissions = dashboardAdmin.child("permissions");
const dashboardAdminOauthClients = dashboardAdmin.child("oauth-clients");
const dashboardAdminOauthClient = (clientId: string) => dashboardAdminOauthClients.child(clientId);
const user = dashboard.child("user");
const userDialog = (settingsTab: string) =>
  PathBuilder.dynamicQueries(user.root)({
    settingsTab,
  });
const userAccount = user.child("account");
const fileManager = dashboard.child("file-manager");
const organization = (id: SharedEntityIds.OrganizationId.Type) => PathBuilder.createRoot("/organizations").child(id);
const oauth2 = PathBuilder.createRoot("/oauth2");
const oauth2Authorize = oauth2.child("authorize");
const oauth2Consent = oauth2.child("consent");
const oauth2Register = oauth2.child("register");
const oauth2Userinfo = oauth2.child("userinfo");
const oauth2Clients = oauth2.child("clients");
const oauth2Client = (clientId: string) => oauth2Clients.child(clientId);
const apiRoot = PathBuilder.createRoot("/api");
const apiAuth = apiRoot.child("auth");
const apiAuthDevice = apiAuth.child("device");
const apiOauth2 = apiRoot.child("oauth2");
const apiOauth2Authorize = apiOauth2.child("authorize");
const apiOauth2Token = apiOauth2.child("token");
const apiOauth2Userinfo = apiOauth2.child("userinfo");
const apiOauth2Register = apiOauth2.child("register");
const apiOauth2Client = apiOauth2.child("client");
const apiOauth2ClientId = (clientId: string) => apiOauth2Client.child(clientId);

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
    security: {
      root: dashboardSecurity.root,
      sessions: dashboardSecuritySessions.root,
      devices: dashboardSecurityDevices.root,
      passkeys: dashboardSecurityPasskeys.root,
      twoFactor: dashboardSecurityTwoFactor.root,
      recoveryCodes: dashboardSecurityRecovery.root,
      jwt: dashboardSecurityJwt.root,
    },
    billing: {
      root: dashboardBilling.root,
      subscribe: dashboardBillingSubscribe.root,
      portal: dashboardBillingPortal.root,
      success: dashboardBillingSuccess.root,
      cancel: dashboardBillingCancel.root,
      history: dashboardBillingHistory.root,
    },
    apiKeys: {
      root: dashboardApiKeys.root,
      create: dashboardApiKeysCreate.root,
      detail: F.flow(
        dashboardApiKey,
        (apiKey) =>
          ({
            root: apiKey.root,
            edit: apiKey("edit"),
            rotate: apiKey("rotate"),
          }) as const
      ),
    },
    admin: {
      root: dashboardAdmin.root,
      permissions: dashboardAdminPermissions.root,
      users: {
        root: dashboardAdminUsers.root,
        create: dashboardAdminUsers("create"),
        detail: F.flow(
          dashboardAdminUser,
          (adminUser) =>
            ({
              root: adminUser.root,
              edit: adminUser("edit"),
              sessions: adminUser("sessions"),
              impersonate: adminUser("impersonate"),
              revokeSession: adminUser("revoke-session"),
              revokeSessions: adminUser("revoke-sessions"),
              ban: adminUser("ban"),
              unban: adminUser("unban"),
              permissions: adminUser("permissions"),
            }) as const
        ),
      },
      sso: {
        root: dashboardAdminSso.root,
        create: dashboardAdminSso("new"),
        provider: F.flow(
          dashboardAdminSsoProvider,
          (provider) =>
            ({
              root: provider.root,
              settings: provider("settings"),
              delete: provider("delete"),
            }) as const
        ),
      },
      oidc: {
        root: dashboardAdminOidc.root,
        register: dashboardAdminOidc("register"),
        client: F.flow(
          dashboardAdminOidcClient,
          (client) =>
            ({
              root: client.root,
              edit: client("edit"),
              secrets: client("secrets"),
            }) as const
        ),
      },
      oauthClients: {
        root: dashboardAdminOauthClients.root,
        client: F.flow(
          dashboardAdminOauthClient,
          (client) =>
            ({
              root: client.root,
              revoke: client("revoke"),
            }) as const
        ),
      },
    },
  },
  oauth2: {
    root: oauth2.root,
    authorize: oauth2Authorize.root,
    consent: oauth2Consent.root,
    register: oauth2Register.root,
    userinfo: oauth2Userinfo.root,
    clients: {
      root: oauth2Clients.root,
      client: F.flow(
        oauth2Client,
        (client) =>
          ({
            root: client.root,
            edit: client("edit"),
            secrets: client("secrets"),
          }) as const
      ),
    },
  },
  api: {
    root: apiRoot.root,
    auth: {
      root: apiAuth.root,
      device: {
        root: apiAuthDevice.root,
      },
    },
    oauth2: {
      root: apiOauth2.root,
      authorize: apiOauth2Authorize.root,
      token: apiOauth2Token.root,
      userinfo: apiOauth2Userinfo.root,
      register: apiOauth2Register.root,
      client: F.flow(
        apiOauth2ClientId,
        (client) =>
          ({
            root: client.root,
          }) as const
      ),
    },
  },
} as const);
