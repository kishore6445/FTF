import { NextResponse } from "next/server"

export async function GET() {
  // Only return the URL, not any keys
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  })
}

