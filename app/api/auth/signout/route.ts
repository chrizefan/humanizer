import { NextResponse } from "next/server";

export async function POST() {
  // This endpoint is no longer needed as sign out is handled client-side
  // Keeping it for backwards compatibility
  return NextResponse.json({ success: true, message: "Sign out handled client-side" });
}