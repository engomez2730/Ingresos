import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ descripcion: z.string().min(2).max(200), estado: z.boolean() });
type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const data = schema.parse(await req.json());
    const item = await prisma.tipoIngreso.update({ where: { id: Number(id) }, data });
    return NextResponse.json(item);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.tipoIngreso.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
