import { type NextRequest, NextResponse } from "next/server";

/**
 * Validates an editor state for read-only mode.
 * This endpoint is called when the editor is in read-only mode
 * and changes are made (e.g., through comments).
 *
 * The original validation server uses a headless Lexical editor to:
 * 1. Parse the editor state
 * 2. Sanitize nodes (unwrap MarkNodes)
 * 3. Compare with the expected state
 *
 * In this simplified implementation, we validate the JSON structure
 * and always accept valid editor states. For production use with
 * full validation, consider running a headless editor.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // Validate that the body is valid JSON
    const parsedState = JSON.parse(body);

    // Basic validation that it looks like an editor state
    if (!parsedState.root || typeof parsedState.root !== "object") {
      return new NextResponse(null, { status: 403 });
    }

    // Validate root has expected structure
    if (typeof parsedState.root.type !== "string") {
      return new NextResponse(null, { status: 403 });
    }

    // State appears valid
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Failed to validate editor state:", error);
    return new NextResponse(null, { status: 403 });
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
