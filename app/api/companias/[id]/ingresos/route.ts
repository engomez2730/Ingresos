import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.union([
  // Asignar desde catálogo por ID
  z.object({ ingresoId: z.number().int().positive() }),
  // Crear nuevo en catálogo y asignar
  z.object({
    descripcion:   z.string().min(2).max(400),
    tipoIngresoId: z.number().int().positive().optional().nullable(),
    observaciones: z.string().max(4000).optional().nullable(),
  }),
]);

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const rows = await prisma.companiaIngreso.findMany({
    where: { companiaId: Number(id) },
    include: { ingreso: { include: { tipoIngreso: true } } },
    orderBy: { ingreso: { descripcion: "asc" } },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const companiaId = Number(id);

  try {
    const body = schema.parse(await req.json());

    let ingresoId: number;

    if ("ingresoId" in body) {
      // Asignación directa desde catálogo
      ingresoId = body.ingresoId;
    } else {
      // Upsert catálogo por descripcion + tipo
      const ingreso = await prisma.ingreso.upsert({
        where: {
          descripcion_tipoIngresoId: {
            descripcion:   body.descripcion,
            tipoIngresoId: body.tipoIngresoId ?? null,
          },
        },
        create: {
          descripcion:   body.descripcion,
          tipoIngresoId: body.tipoIngresoId ?? null,
          observaciones: body.observaciones ?? null,
        },
        update: {},
      });
      ingresoId = ingreso.id;
    }

    const asignacion = await prisma.companiaIngreso.upsert({
      where:   { companiaId_ingresoId: { companiaId, ingresoId } },
      create:  { companiaId, ingresoId, activo: true },
      update:  { activo: true },
      include: { ingreso: { include: { tipoIngreso: true } } },
    });

    return NextResponse.json(asignacion, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al asignar ingreso" }, { status: 500 });
  }
}
