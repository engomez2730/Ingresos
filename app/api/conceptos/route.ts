import { NextResponse } from "next/server";

// Los conceptos de nómina se gestionan a través de /api/ingresos y /api/descuentos
export async function GET() {
  return NextResponse.json({ error: "Use /api/ingresos o /api/descuentos" }, { status: 410 });
}
export async function POST() {
  return NextResponse.json({ error: "Use /api/ingresos o /api/descuentos" }, { status: 410 });
}
