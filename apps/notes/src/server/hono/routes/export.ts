import { readFile } from "node:fs/promises";
import { env } from "@beep/notes/env";
import { SESSION_COOKIE_NAME } from "@beep/notes/server/auth/session-cookie";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import puppeteer, { type Browser } from "puppeteer";
import { z } from "zod";

import { protectedMiddlewares } from "../middlewares/auth-middleware";

export const exportRoutes = new Hono()
  .post(
    "/pdf",
    ...protectedMiddlewares({
      ratelimitKey: "export/pdf",
    }),
    zValidator(
      "json",
      z.object({
        disableMedia: z.boolean().optional(),
        documentId: z.string(),
        format: z.string(),
        scale: z.number(),
      })
    ),
    async (c) => {
      try {
        const { disableMedia, documentId, format, scale } = await c.req.json();

        const session = c.get("session");

        if (!session) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        let browser: Browser;

        try {
          browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-gpu", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            headless: true,
          });
        } catch (error) {
          console.error("Browser launch error:", error);

          return c.json({ error: "Failed to initialize PDF service" }, 503);
        }

        const page = await browser.newPage();

        const sessionToken = getCookie(c, SESSION_COOKIE_NAME)!;

        // Configure session cookie
        await page.setCookie({
          domain: new URL(env.NEXT_PUBLIC_SITE_URL!).hostname,
          httpOnly: true,
          name: "session",
          path: "/",
          sameSite: "Lax",
          secure: process.env.NODE_ENV === "production",
          value: sessionToken,
        });

        try {
          await page.waitForFunction("document.fonts.ready");

          await page.goto(`${env.NEXT_PUBLIC_SITE_URL}/print/${documentId}?disableMedia=${disableMedia}`, {
            timeout: 60_000,
            waitUntil: "networkidle0",
          });
        } catch (error) {
          console.error("Browser page goto error:", error);
          await browser.close();

          return c.json({ message: "Failed to load the page for PDF generation" }, 408);
        }

        try {
          const pdf = await page.pdf({
            displayHeaderFooter: true,
            footerTemplate: `
          <div style="width: 100%; font-size: 10px; padding: 5px 5px 0; color: #666; text-align: center;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `,
            format: format as any,
            margin: {
              bottom: "30px",
              left: "20px",
              right: "20px",
              top: "20px",
            },
            printBackground: true,
            scale: scale,
          });

          await browser.close();

          return c.newResponse(new Uint8Array(pdf).buffer, {
            headers: {
              "Content-Disposition": "attachment; filename=plate.pdf",
              "Content-Type": "application/pdf",
            },
          });
        } catch (error) {
          console.error("Browser pdf error:", error);
          await browser.close();

          return c.json({ message: "Failed to generate PDF" }, 500);
        }
      } catch (error) {
        console.error("Unexpected error:", error);

        return c.json({ message: "Failed to generate PDF" }, 500);
      }
    }
  )
  .get(
    "html",
    ...protectedMiddlewares({
      ratelimitKey: "export/pdf",
    }),
    async (c) => {
      try {
        const tailwindCss = await readFile(`${process.cwd()}/public/css/tailwind.css`, "utf8");

        return c.text(tailwindCss);
      } catch (error) {
        console.error("Failed to read CSS file:", error);

        return c.json({ message: "Failed to read CSS file" }, 500);
      }
    }
  );
