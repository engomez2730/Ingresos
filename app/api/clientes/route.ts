import { NextResponse } from "next/server";

/** Módulo Clientes eliminado. */
export async function GET() {
  return NextResponse.json({ error: "Módulo Clientes eliminado" }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: "Módulo Clientes eliminado" }, { status: 410 });
}
