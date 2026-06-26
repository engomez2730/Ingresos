import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  descripcion:     z.string().min(2).max(400),
  tipoDescuentoId: z.number().int().positive().optional().nullable(),
  estado:          z.boolean().default(true),
  observaciones:   z.string().max(4000).optional().nullable(),
});

/** GET — catálogo global de descuentos */
export async function GET() {
  const descuentos = (
    await prisma.descuento.findMany({
      include: {
        tipoDescuento: true,
        _count: { select: { companias: true } },
      },
    })
  ).sort((a, b) => a.descripcion.localeCompare(b.descripcion));
  return NextResponse.json(descuentos);
}

/** POST — crear entrada en el catálogo (sin asignar a compañía) */
export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const descuento = await prisma.descuento.create({ data });
    return NextResponse.json(descuento, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al crear descuento en catálogo" }, { status: 500 });
  }
}
