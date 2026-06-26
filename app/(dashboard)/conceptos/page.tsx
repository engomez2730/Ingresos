import { prisma } from "@/lib/prisma";
import { ConceptosView } from "@/components/conceptos/ConceptosView";

export const dynamic = "force-dynamic";

export default async function ConceptosPage() {
  const [ingresos, descuentos] = await Promise.all([
    prisma.ingreso.findMany({
      include: {
        tipoIngreso: { select: { id: true, descripcion: true } },
        _count: { select: { companias: true } },
      },
    }).then((r) => r.sort((a, b) => a.descripcion.localeCompare(b.descripcion))),

    prisma.descuento.findMany({
      include: {
        tipoDescuento: { select: { id: true, descripcion: true } },
        _count: { select: { companias: true } },
      },
    }).then((r) => r.sort((a, b) => a.descripcion.localeCompare(b.descripcion))),
  ]);

  return <ConceptosView ingresos={ingresos} descuentos={descuentos} />;
}
