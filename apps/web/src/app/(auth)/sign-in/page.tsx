"use client";

import { Button } from "@beep/ui/components/ui/button";
import { signIn } from "@beep/web/lib/auth/client";
import { EnvelopeSimple, SpinnerGap } from "@phosphor-icons/react";
import { String as Str } from "effect";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

type Status = "idle" | "loading" | "sent" | "error";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const callbackURLRaw = searchParams.get("callbackURL");
  const callbackURL =
    callbackURLRaw &&
    Str.startsWith("/")(callbackURLRaw) &&
    !Str.startsWith("//")(callbackURLRaw) &&
    !Str.startsWith("/sign-in")(callbackURLRaw)
      ? callbackURLRaw
      : "/";

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!Str.trim(email)) return;

      setStatus("loading");
      setErrorMessage("");

      const { error } = await signIn.magicLink({
        email: Str.trim(email),
        callbackURL,
      });

      if (error) {
        setStatus("error");
        setErrorMessage(
          error.message === "Email not authorized"
            ? "This email is not authorized. Contact an admin for access."
            : "Something went wrong. Please try again."
        );
      } else {
        setStatus("sent");
      }
    },
    [callbackURL, email]
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">Enter your email to receive a magic link</p>
        </div>

        {status === "sent" ? (
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-center space-y-2">
            <EnvelopeSimple className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Check your email</p>
            <p className="text-xs text-muted-foreground">
              We sent a sign-in link to <strong>{email}</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setEmail("");
              }}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}

            <Button type="submit" className="w-full" disabled={status === "loading" || !Str.trim(email)}>
              {status === "loading" ? (
                <>
                  <SpinnerGap className="animate-spin" />
                  Sending link...
                </>
              ) : (
                <>
                  <EnvelopeSimple />
                  Send magic link
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
