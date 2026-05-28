import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  descripcion: z.string().min(2).max(400),
  tipo: z.boolean(),
  estado: z.boolean(),
  observaciones: z.string().max(4000).optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const concepto = await prisma.conceptoNomina.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(concepto);
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.conceptoNomina.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
