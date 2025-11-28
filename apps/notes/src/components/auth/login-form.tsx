"use client";

import { Icons } from "@beep/notes/components/ui/icons";
import { authRoutes, routes } from "@beep/notes/lib/navigation/routes";
import { encodeURL } from "@beep/notes/lib/url/encodeURL";
import { cn } from "@beep/notes/lib/utils";
import { Button } from "@beep/notes/registry/ui/button";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";

export function LoginForm() {
  let [callbackUrl] = useQueryState("callbackUrl");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!callbackUrl && !authRoutes.includes(pathname as any)) {
    callbackUrl = encodeURL(pathname, searchParams.toString());
  }

  return (
    <div className={cn("mx-auto grid space-y-6 py-4")}>
      <div className="flex flex-col gap-2 text-center">
        <Icons.logo className="mx-auto mb-3 size-8 text-foreground" />
        <div className="text-xl font-semibold">Welcome back</div>
        <p className="text-muted-foreground">Sign in or create an account</p>
      </div>

      <a
        className="mx-auto"
        href={routes.loginProvider({
          provider: "github",
          search: callbackUrl
            ? {
                callbackUrl,
              }
            : undefined,
        })}
        target="_self"
      >
        <Button className="h-9 px-4" icon={<Icons.github className="size-6" />}>
          Continue with GitHub
        </Button>
      </a>

      {/* <div className="mx-auto max-w-xs space-y-2 text-center">
        <div className="text-balance text-sm text-muted-foreground">
          By continuing, you agree to our{' '}
          <Link className="font-semibold hover:underline" href={routes.terms()}>
            Terms of Service
          </Link>{' '}
          and acknowledge you've read our{' '}
          <Link
            className="font-semibold hover:underline"
            href={routes.privacy()}
          >
            Privacy Policy
          </Link>
          .
        </div>
      </div> */}
    </div>
  );
}
