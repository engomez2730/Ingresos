import { prisma } from "@/lib/prisma";
import { CompaniasView } from "@/components/companias/CompaniasView";

export const dynamic = "force-dynamic";

export default async function CompaniasPage() {
  const companias = await prisma.compania.findMany({
    include: {
      _count: { select: { ingresos: true, descuentos: true } },
    },
  }).then((r) => r.sort((a, b) => a.descripcion.localeCompare(b.descripcion)));

  return (
    <CompaniasView
      companias={companias.map((c) => ({
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
