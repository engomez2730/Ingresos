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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clienteId = searchParams.get("clienteId");

  const companias = await prisma.compania.findMany({
    where: clienteId ? { clienteId: Number(clienteId) } : undefined,
    orderBy: { descripcion: "asc" },
    include: {
      cliente: { select: { id: true, nombre: true } },
      _count: { select: { conceptos: true } },
    },
  });
  return NextResponse.json(companias);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const compania = await prisma.compania.create({ data });
    return NextResponse.json(compania, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al crear compañía" }, { status: 500 });
  }
}
