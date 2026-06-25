import { prisma } from "@/lib/prisma";
import { CompaniasView } from "@/components/companias/CompaniasView";

export const dynamic = "force-dynamic";

export default async function CompaniasPage() {
  const [companias, clientes] = await Promise.all([
    prisma.compania.findMany({
      include: {
        cliente: { select: { id: true, nombre: true } },
        _count: { select: { ingresos: true, descuentos: true } },
      },
    }).then(r => r.sort((a, b) => a.descripcion.localeCompare(b.descripcion))),
    prisma.cliente.findMany().then(r => r.sort((a, b) => a.nombre.localeCompare(b.nombre))),
  ]);

  return (
    <CompaniasView
      clientes={clientes}
      companias={companias.map((c) => ({
        ...c,
        latitud: c.latitud ? Number(c.latitud) : null,
        longitud: c.longitud ? Number(c.longitud) : null,
        fechaCreacion: c.fechaCreacion.toISOString(),
        fechaActualizacion: c.fechaActualizacion.toISOString(),
        _count: { conceptos: c._count.ingresos + c._count.descuentos },
      }))}
    />
  );
}
