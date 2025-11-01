import { useIsHydrated } from "@beep/ui/hooks";
import { cn } from "@beep/ui-core/utils";
import { useContext } from "react";
import type { AuthLocalization } from "../../lib/auth-localization";
import { AuthUIContext } from "../../lib/auth-ui-provider";

export interface RecaptchaBadgeProps {
  className?: string;
  localization?: Partial<AuthLocalization>;
}

export function RecaptchaBadge({ className, localization: propLocalization }: RecaptchaBadgeProps) {
  const isHydrated = useIsHydrated();
  const { captcha, localization: contextLocalization } = useContext(AuthUIContext);
  const localization = { ...contextLocalization, ...propLocalization };

  if (!captcha) return null;

  if (!captcha.hideBadge) {
    return isHydrated ? (
      <style>{`
                .grecaptcha-badge { visibility: visible !important; }
            `}</style>
    ) : null;
  }

  return (
    <>
      <style>{`
                .grecaptcha-badge { visibility: hidden; }
            `}</style>

      <p className={cn("text-muted-foreground text-xs", className)}>
        {localization.PROTECTED_BY_RECAPTCHA} {localization.BY_CONTINUING_YOU_AGREE} Google{" "}
        <a
          className="text-foreground hover:underline"
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noreferrer"
        >
          {localization.PRIVACY_POLICY}
        </a>{" "}
        &{" "}
        <a
          className="text-foreground hover:underline"
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noreferrer"
        >
          {localization.TERMS_OF_SERVICE}
        </a>
        .
      </p>
    </>
  );
}
