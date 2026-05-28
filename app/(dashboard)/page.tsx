import { prisma } from "@/lib/prisma";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalClientes, totalCompanias, totalIngresos, totalDescuentos, ultimasCompanias] =
    await Promise.all([
      prisma.cliente.count(),
      prisma.compania.count(),
      prisma.ingreso.count({ where: { estado: true } }),
      prisma.descuento.count({ where: { estado: true } }),
      prisma.compania.findMany({
        take: 6,
        orderBy: { fechaCreacion: "desc" },
        include: {
          cliente: { select: { nombre: true } },
          _count: { select: { ingresos: true, descuentos: true } },
        },
      }),
    ]);

  return (
    <DashboardView
      stats={{ totalClientes, totalCompanias, totalIngresos, totalDescuentos }}
      ultimasCompanias={ultimasCompanias.map((c) => ({
        ...c,
        latitud:  c.latitud  ? Number(c.latitud)  : null,
        longitud: c.longitud ? Number(c.longitud) : null,
        fechaCreacion:      c.fechaCreacion.toISOString(),
        fechaActualizacion: c.fechaActualizacion.toISOString(),
        _count: { conceptos: c._count.ingresos + c._count.descuentos },
      }))}
    />
  );
}
