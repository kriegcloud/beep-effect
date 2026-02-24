import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { db } from "../db";
import * as schema from "../db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

const allowedEmails = new Set(
  (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [
    nextCookies(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (!allowedEmails.has(email.toLowerCase().trim())) {
          throw new Error("Email not authorized");
        }
        await resend.emails.send({
          from: "Effect v4 KG <noreply@beep.dev>",
          to: email,
          subject: "Sign in to Effect v4 Knowledge Graph",
          html: `<a href="${url}">Click here to sign in</a>`,
        });
      },
      expiresIn: 300,
    }),
  ],
});
