import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; ingresoId: string }> };

/** DELETE — desasignar ingreso de la compañía (elimina la fila pivot) */
export async function DELETE(_req: Request, { params }: Params) {
  const { id, ingresoId } = await params;
  await prisma.companiaIngreso.deleteMany({
    where: { companiaId: Number(id), ingresoId: Number(ingresoId) },
  });
  return NextResponse.json({ ok: true });
}

/** PATCH — cambiar estado activo/inactivo de la asignación */
export async function PATCH(req: Request, { params }: Params) {
  const { id, ingresoId } = await params;
  const { activo } = await req.json();
  const row = await prisma.companiaIngreso.updateMany({
    where:  { companiaId: Number(id), ingresoId: Number(ingresoId) },
    data:   { activo: Boolean(activo) },
  });
  return NextResponse.json(row);
}
