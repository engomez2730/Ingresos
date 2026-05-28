import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  clienteId: z.number().int().positive(),
  descripcion: z.string().min(2).max(300),
  sucursalPrincipal: z.string().max(300).optional().nullable(),
  latitud: z.number().min(-90).max(90).optional().nullable(),
  longitud: z.number().min(-180).max(180).optional().nullable(),
  tipoEmpresa: z.string().max(100).optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const compania = await prisma.compania.findUnique({
    where: { id: Number(id) },
    include: {
      cliente: { select: { id: true, nombre: true } },
      conceptos: { orderBy: [{ tipo: "desc" }, { descripcion: "asc" }] },
    },
  });
  if (!compania) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(compania);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const compania = await prisma.compania.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(compania);
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.compania.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
