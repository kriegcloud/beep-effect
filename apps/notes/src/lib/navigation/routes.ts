import { defineRoute, useParseParams } from "./@";

export type RouteSchemas = {
  document: {
    params: {
      documentId: string;
    };
  };
  home: {
    search?: {
      showId?: string;
    };
  };
  loginProvider: {
    params: {
      provider: "github";
    };
    search?: {
      callbackUrl?: string;
    };
  };
  preview: {
    params: {
      documentId: string;
    };
  };
  user: {
    params: {
      userId: string;
    };
  };
};

export const routes = {
  document: defineRoute<RouteSchemas["document"]>("/[documentId]"),
  faq: defineRoute("/faq"),
  home: defineRoute<RouteSchemas["home"]>("/"),
  login: defineRoute("/login"),
  loginProvider: defineRoute<RouteSchemas["loginProvider"]>("/api/auth/[provider]/login"),
  loginProviderCallback: defineRoute<RouteSchemas["loginProvider"]>("/api/auth/[provider]/callback"),
  preview: defineRoute<RouteSchemas["preview"]>("/preview/[documentId]"),
  privacy: defineRoute("/privacy"),
  root: defineRoute("/"),
  settings: defineRoute("/settings"),
  signup: defineRoute("/signup"),
  terms: defineRoute("/terms"),
  user: defineRoute<RouteSchemas["user"]>("/user/[userId]"),
};

export const useDocumentId = () => {
  return useParseParams("document").documentId;
};

/**
 * An array of routes that are used for authentication. These routes will
 * redirect logged in users to /settings
 */
export const authRoutes = [routes.login(), routes.signup()];

export const DEFAULT_LOGIN_REDIRECT = routes.home();
