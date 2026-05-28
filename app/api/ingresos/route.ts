import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  companiaId:   z.number().int().positive(),
  descripcion:  z.string().min(2).max(400),
  estado:       z.boolean().default(true),
  observaciones:z.string().max(4000).optional().nullable(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companiaId = searchParams.get("companiaId");
  const ingresos = await prisma.ingreso.findMany({
    where: companiaId ? { companiaId: Number(companiaId) } : undefined,
    orderBy: { descripcion: "asc" },
  });
  return NextResponse.json(ingresos);
}

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const ingreso = await prisma.ingreso.create({ data });
    return NextResponse.json(ingreso, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al crear ingreso" }, { status: 500 });
  }
}
