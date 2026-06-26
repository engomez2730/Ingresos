import { prisma } from "@/lib/prisma";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalCompanias, totalIngresos, totalDescuentos, ultimasCompanias] =
    await Promise.all([
      prisma.compania.count(),
      prisma.ingreso.count({ where: { estado: true } }),
      prisma.descuento.count({ where: { estado: true } }),
      prisma.compania.findMany({
        include: {
          _count: { select: { ingresos: true, descuentos: true } },
        },
      }),
    ]);

  const ordenadas = ultimasCompanias
    .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime())
    .slice(0, 6);

  return (
    <DashboardView
      stats={{ totalCompanias, totalIngresos, totalDescuentos }}
      ultimasCompanias={ordenadas.map((c) => ({
        ...c,
        latitud:            c.latitud  ? Number(c.latitud)  : null,
        longitud:           c.longitud ? Number(c.longitud) : null,
        fechaCreacion:      c.fechaCreacion.toISOString(),
        fechaActualizacion: c.fechaActualizacion.toISOString(),
        _count: { conceptos: c._count.ingresos + c._count.descuentos },
      }))}
    />
  );
}
