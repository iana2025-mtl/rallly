import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authLib } from "@/lib/auth";

const handler = toNextJsHandler(authLib);

export async function GET(req: NextRequest) {
  try {
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
