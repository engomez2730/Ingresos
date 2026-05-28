import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  companiaId: z.number().int().positive(),
  descripcion: z.string().min(2).max(400),
  tipo: z.boolean(),
  estado: z.boolean().default(true),
  observaciones: z.string().max(4000).optional().nullable(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companiaId = searchParams.get("companiaId");

  const conceptos = await prisma.conceptoNomina.findMany({
    where: companiaId ? { companiaId: Number(companiaId) } : undefined,
    orderBy: [{ tipo: "desc" }, { descripcion: "asc" }],
  });
  return NextResponse.json(conceptos);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const concepto = await prisma.conceptoNomina.create({ data });
    return NextResponse.json(concepto, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al crear concepto" }, { status: 500 });
  }
}
