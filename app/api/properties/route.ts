import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const revalidate = 60;

const CARD_FIELDS =
  "slug,titulo,descripcion,precio,ubicacion,zona,tipo,m2_construidos,m2_parcela,habitaciones,banos,galeria_urls";

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("properties")
      .select(CARD_FIELDS)
      .eq("activa", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { properties: data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
