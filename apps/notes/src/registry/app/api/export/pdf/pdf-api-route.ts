import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import puppeteer, { type Browser } from "puppeteer";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const schema = z.object({
      disableMedia: z.boolean().optional(),
      documentId: z.string(),
      format: z.string(),
      scale: z.number(),
    });

    const result = schema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const { disableMedia, documentId, format, scale } = result.data;

    // Get session cookie

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json({ message: "No session cookie found" }, { status: 401 });
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

      return NextResponse.json({ error: "Failed to initialize PDF service" }, { status: 503 });
    }

    const page = await browser.newPage();

    // Configure session cookie
    await page.setCookie({
      domain: new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname,
      httpOnly: true,
      name: sessionCookie.name,
      path: "/",
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      value: sessionCookie.value,
    });

    try {
      await page.waitForFunction("document.fonts.ready");

      await page.goto(`${process.env.NEXT_PUBLIC_SITE_URL}/print/${documentId}?disableMedia=${disableMedia}`, {
        timeout: 60_000,
        waitUntil: "networkidle0",
      });
    } catch (error) {
      console.error("Browser page goto error:", error);
      await browser.close();

      return NextResponse.json({ message: "Failed to load the page for PDF generation" }, { status: 408 });
    }

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

    return new NextResponse(new Uint8Array(pdf).buffer, {
      headers: {
        "Content-Disposition": "attachment; filename=plate.pdf",
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);

    return NextResponse.json({ message: "Failed to generate PDF" }, { status: 500 });
  }
}
