import { $ConstantsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as Data from "effect/Data";

const $I = $ConstantsId.create("cookies");

export class CookieCategory extends BS.StringLiteralKit(
  "necessary",
  "functional",
  "analytics",
  "marketing"
).annotations(
  $I.annotations("CookieCategory", {
    description: "Category of cookies",
  })
) {}

export declare namespace CookieCategory {
  export type Type = typeof CookieCategory.Type;
  export type Encoded = typeof CookieCategory.Encoded;
}

export const TRACKING_CATEGORY = {
  FUNCTIONAL: "functional",
  NECESSARY: "necessary",
  TARGETING: "targeting",
  PERFORMANCE: "performance",
  DELETE_IF_SEEN: "delete-if-seen",
} as const;

export class TrackingCategory extends BS.MappedLiteralKitFromEnum(TRACKING_CATEGORY).annotations(
  $I.annotations("TrackingCategory", {
    description: "Category of cookies",
  })
) {}

export declare namespace TrackingCategory {
  export type Type = typeof TrackingCategory.Type;
  export type Encoded = typeof TrackingCategory.Encoded;
}

export class CookieCategoryConfig extends BS.TaggedConfigKit(
  [
    CookieCategory.Enum.necessary,
    {
      name: "Strictly Necessary",
      description:
        "These cookies are essential for the website to function properly and cannot be switched off. They are usually only set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.",
      required: true,
      trackingCategory: TrackingCategory.DecodedEnum.NECESSARY,
    },
  ],
  [
    CookieCategory.Enum.functional,
    {
      name: "Functional",
      description:
        "These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages. If you do not allow these cookies, some or all of these services may not function properly.",
      trackingCategory: TrackingCategory.DecodedEnum.FUNCTIONAL,
    },
  ],
  [
    CookieCategory.Enum.analytics,
    {
      name: "Analytics & Performance",
      description:
        "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous. If you do not allow these cookies we will not know when you have visited our site.",
      trackingCategory: TrackingCategory.DecodedEnum.PERFORMANCE,
    },
  ],
  [
    CookieCategory.Enum.marketing,
    {
      name: "Marketing & Targeting",
      description:
        "These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites. They do not store directly personal information but are based on uniquely identifying your browser and internet device. If you do not allow these cookies, you will experience less targeted advertising.",
      trackingCategory: TrackingCategory.DecodedEnum.TARGETING,
    },
  ]
).annotations(
  $I.annotations("CookieCategoryConfig", {
    description: "Configuration for cookie categories",
  })
) {}

export declare namespace CookieCategoryConfig {
  export type Type = typeof CookieCategoryConfig.Type;
  export type Encoded = typeof CookieCategoryConfig.Encoded;
}

export class CookieConsentKey extends Data.Class {
  static readonly schema: BS.LiteralWithDefault.Schema<"cookieConsent"> = BS.LiteralWithDefault(
    "cookieConsent"
  ).annotations(
    $I.annotations("CookieConsentKey", {
      description: "Key for cookie consent",
    })
  );
  static readonly default = "cookieConsent";

  constructor() {
    super();
  }
}

export class CookiePreferenceKey extends Data.Class {
  static readonly schema: BS.LiteralWithDefault.Schema<"cookiePreferences"> = BS.LiteralWithDefault(
    "cookiePreferences"
  ).annotations(
    $I.annotations("CookiePreferenceKey", {
      description: "Key for cookie preferences",
    })
  );
  static readonly default = "cookiePreferences";

  constructor() {
    super();
  }
}
