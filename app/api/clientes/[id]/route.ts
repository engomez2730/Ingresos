import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ nombre: z.string().min(2).max(200) });

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id: Number(id) },
    include: { companias: { orderBy: { descripcion: "asc" } } },
  });
  if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { nombre } = schema.parse(body);
    const cliente = await prisma.cliente.update({
      where: { id: Number(id) },
      data: { nombre },
    });
    return NextResponse.json(cliente);
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.cliente.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
