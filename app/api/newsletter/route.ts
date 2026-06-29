import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.replace(/[<>&"']/g, "").slice(0, 200).trim() : "";
    const locale = typeof body.locale === "string" ? body.locale.replace(/[<>&"']/g, "").slice(0, 5).trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from("newsletter_subscribers")
      .insert({ email, locale });

    // Si ya existe (unique constraint), no es un error real para el usuario
    if (error && error.code !== "23505") {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[newsletter]", e instanceof Error ? e.message : "Unknown error");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
