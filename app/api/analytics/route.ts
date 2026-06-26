import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/analytics
 * Devuelve el ranking de uso de ingresos y descuentos:
 * cuántas compañías tienen asignado cada concepto del catálogo.
 */
export async function GET() {
  const [ingresos, descuentos] = await Promise.all([
    prisma.ingreso.findMany({
      include: {
        tipoIngreso: { select: { descripcion: true } },
        _count: { select: { companias: true } },
      },
      orderBy: { companias: { _count: "desc" } },
    }),
    prisma.descuento.findMany({
      include: {
        tipoDescuento: { select: { descripcion: true } },
        _count: { select: { companias: true } },
      },
      orderBy: { companias: { _count: "desc" } },
    }),
  ]);

  return NextResponse.json({
    ingresos: ingresos.map((i) => ({
      id:             i.id,
      descripcion:    i.descripcion,
      tipo:           i.tipoIngreso?.descripcion ?? null,
      totalCompanias: i._count.companias,
    })),
    descuentos: descuentos.map((d) => ({
      id:             d.id,
      descripcion:    d.descripcion,
      tipo:           d.tipoDescuento?.descripcion ?? null,
      totalCompanias: d._count.companias,
    })),
  });
}
