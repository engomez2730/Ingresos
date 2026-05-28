import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  descripcion:  z.string().min(2).max(400),
  estado:       z.boolean(),
  observaciones:z.string().max(4000).optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const data = schema.parse(await req.json());
    const descuento = await prisma.descuento.update({ where: { id: Number(id) }, data });
    return NextResponse.json(descuento);
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.descuento.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
