import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.union([
  // Asignar desde catálogo por ID
  z.object({ descuentoId: z.number().int().positive() }),
  // Crear nuevo en catálogo y asignar
  z.object({
    descripcion:     z.string().min(2).max(400),
    tipoDescuentoId: z.number().int().positive().optional().nullable(),
    observaciones:   z.string().max(4000).optional().nullable(),
  }),
]);

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const rows = await prisma.companiaDescuento.findMany({
    where: { companiaId: Number(id) },
    include: { descuento: { include: { tipoDescuento: true } } },
    orderBy: { descuento: { descripcion: "asc" } },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const companiaId = Number(id);

  try {
    const body = schema.parse(await req.json());

    let descuentoId: number;

    if ("descuentoId" in body) {
      // Asignación directa desde catálogo
      descuentoId = body.descuentoId;
    } else {
      // Upsert catálogo por descripcion + tipo
      const descuento = await prisma.descuento.upsert({
        where: {
          descripcion_tipoDescuentoId: {
            descripcion:     body.descripcion,
            tipoDescuentoId: body.tipoDescuentoId ?? null,
          },
        },
        create: {
          descripcion:     body.descripcion,
          tipoDescuentoId: body.tipoDescuentoId ?? null,
          observaciones:   body.observaciones ?? null,
        },
        update: {},
      });
      descuentoId = descuento.id;
    }

    const asignacion = await prisma.companiaDescuento.upsert({
      where:   { companiaId_descuentoId: { companiaId, descuentoId } },
      create:  { companiaId, descuentoId, activo: true },
      update:  { activo: true },
      include: { descuento: { include: { tipoDescuento: true } } },
    });

    return NextResponse.json(asignacion, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al asignar descuento" }, { status: 500 });
  }
}
