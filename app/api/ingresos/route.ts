import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  descripcion:   z.string().min(2).max(400),
  tipoIngresoId: z.number().int().positive().optional().nullable(),
  estado:        z.boolean().default(true),
  observaciones: z.string().max(4000).optional().nullable(),
});

/** GET — catálogo global de ingresos */
export async function GET() {
  const ingresos = (
    await prisma.ingreso.findMany({
      include: {
        tipoIngreso: true,
        _count: { select: { companias: true } },
      },
    })
  ).sort((a, b) => a.descripcion.localeCompare(b.descripcion));
  return NextResponse.json(ingresos);
}

/** POST — crear entrada en el catálogo (sin asignar a compañía) */
export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const ingreso = await prisma.ingreso.create({ data });
    return NextResponse.json(ingreso, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al crear ingreso en catálogo" }, { status: 500 });
  }
}
