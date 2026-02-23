import { promises as fs } from "node:fs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Refer to the Tailwind cli documentation and generate the tailwind.css file based on the configuration of your app.
    const tailwindCss = await fs.readFile(`${process.cwd()}/public/css/tailwind.css`, "utf8");

    return new NextResponse(tailwindCss, {
      headers: {
        "Content-Type": "text/css",
      },
    });
  } catch (error) {
    console.error("Failed to read CSS file:", error);

    return NextResponse.json({ message: "Failed to read CSS file" }, { status: 500 });
  }
}
