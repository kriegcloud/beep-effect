import { type NextRequest, NextResponse } from "next/server";

/**
 * Sets the editor state for read-only validation.
 * This endpoint is called when switching to read-only mode to establish
 * the baseline state for subsequent validation requests.
 *
 * Note: In serverless environments, state is not persisted between requests.
 * For full functionality, consider using a database or KV store.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // Validate that the body is valid JSON
    const parsedState = JSON.parse(body);

    // Basic validation that it looks like an editor state
    if (!parsedState.root || typeof parsedState.root !== "object") {
      return NextResponse.json({ error: "Invalid editor state: missing root" }, { status: 400 });
    }

    // In the original server, this would store the state for validation.
    // In a serverless environment, we just acknowledge receipt.
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Failed to set editor state:", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
