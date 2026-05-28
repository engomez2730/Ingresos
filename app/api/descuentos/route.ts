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
  const descuentos = await prisma.descuento.findMany({
    where: companiaId ? { companiaId: Number(companiaId) } : undefined,
    orderBy: { descripcion: "asc" },
  });
  return NextResponse.json(descuentos);
}

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const descuento = await prisma.descuento.create({ data });
    return NextResponse.json(descuento, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al crear descuento" }, { status: 500 });
  }
}
