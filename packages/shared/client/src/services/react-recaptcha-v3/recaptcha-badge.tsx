import { cn } from "@beep/ui-core/utils";

export interface RecaptchaBadgeProps {
  readonly className?: string | undefined;
}

export function RecaptchaBadge({ className }: RecaptchaBadgeProps) {
  return (
    <>
      <style>{`
                .grecaptcha-badge { visibility: hidden; }
            `}</style>

      <p className={cn("text-muted-foreground text-xs", className)}>
        {"This site is protected by reCAPTCHA."} {"By continuing, you agree to the"} Google{" "}
        <a
          className="text-foreground hover:underline"
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noreferrer"
        >
          {"Privacy Policy"}
        </a>{" "}
        &{" "}
        <a
          className="text-foreground hover:underline"
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noreferrer"
        >
          {"Terms of Service"}
        </a>
        .
      </p>
    </>
  );
}
