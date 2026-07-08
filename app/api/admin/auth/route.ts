import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    // Consulta TODOS los usuarios y prueba la contraseña con cada hash
    const { data: users, error } = await getSupabaseAdmin()
      .from("admin_users")
      .select("id, name, role, password_hash");

    if (error || !users?.length) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    for (const u of users) {
      const valid = await bcrypt.compare(password, u.password_hash);
      if (valid) {
        return NextResponse.json({
          ok: true,
          user: { id: u.id, name: u.name, role: u.role },
        });
      }
    }

    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
