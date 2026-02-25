import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { HashSet, String as Str } from "effect";
import { Resend } from "resend";
import { db } from "../db";
import * as schema from "../db/schema";

const resendApiKey = process.env.RESEND_API_KEY ?? "";
const hasResolvedResendApiKey = resendApiKey.length > 0 && !resendApiKey.startsWith("op://");
const resend = hasResolvedResendApiKey ? new Resend(resendApiKey) : undefined;
const normalizeEmail = (value: string) => Str.toLowerCase(Str.trim(value));
const configuredEmailFrom = process.env.EMAIL_FROM ? Str.trim(process.env.EMAIL_FROM) : undefined;
const emailFrom =
  configuredEmailFrom && configuredEmailFrom.length > 0 ? configuredEmailFrom : "Effect v4 KG <onboarding@resend.dev>";
const allowedEmailsRaw = process.env.ALLOWED_EMAILS ?? process.env.APP_ADMINS_EMAILS ?? "";

const allowedEmails = HashSet.fromIterable(
  Str.split(/[\n,;]/)(allowedEmailsRaw)
    .map(normalizeEmail)
    .filter(Boolean)
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (HashSet.size(allowedEmails) === 0) {
          throw new Error("Email allowlist not configured");
        }
        if (resend === undefined) {
          throw new Error("RESEND_API_KEY is not configured");
        }
        if (!HashSet.has(allowedEmails, normalizeEmail(email))) {
          throw new Error("Email not authorized");
        }
        const result = await resend.emails.send({
          from: emailFrom,
          to: email,
          subject: "Sign in to Effect v4 Knowledge Graph",
          html: `<a href="${url}">Click here to sign in</a>`,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }
      },
      expiresIn: 300,
    }),
    nextCookies(),
  ],
});
