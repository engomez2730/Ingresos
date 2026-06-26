import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; descuentoId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { id, descuentoId } = await params;
  await prisma.companiaDescuento.deleteMany({
    where: { companiaId: Number(id), descuentoId: Number(descuentoId) },
  });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: Params) {
  const { id, descuentoId } = await params;
  const { activo } = await req.json();
  const row = await prisma.companiaDescuento.updateMany({
    where: { companiaId: Number(id), descuentoId: Number(descuentoId) },
    data:  { activo: Boolean(activo) },
  });
  return NextResponse.json(row);
}
