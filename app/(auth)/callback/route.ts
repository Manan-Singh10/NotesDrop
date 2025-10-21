import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    // no code, just redirect to login or home
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();

  // Exchange the code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    // redirect back with error info
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  // Redirect user after successful login
  return NextResponse.redirect(`${origin}/`);
}
