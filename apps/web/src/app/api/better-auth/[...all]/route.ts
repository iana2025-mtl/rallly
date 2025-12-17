import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuthLib } from "@/lib/auth";

// Lazy initialization: Better Auth handler is only created when first request arrives
let _handler: ReturnType<typeof toNextJsHandler> | null = null;

function getHandler() {
  if (!_handler) {
    const authLib = getAuthLib();
    _handler = toNextJsHandler(authLib);
  }
  return _handler;
}

export async function GET(req: NextRequest) {
  try {
    const handler = getHandler();
    return await handler.GET(req);
  } catch (error) {
    console.error("Better-auth GET error:", error);
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      if ("cause" in error) {
        console.error("Error cause:", error.cause);
      }
    }
    // Re-throw to let better-auth handle it
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const handler = getHandler();
    return await handler.POST(req);
  } catch (error) {
    console.error("Better-auth POST error:", error);
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      if ("cause" in error) {
        console.error("Error cause:", error.cause);
      }
    }
    // Re-throw to let better-auth handle it
    throw error;
  }
}
