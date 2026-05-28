import { prisma } from "@/lib/prisma";
import { ConceptosView } from "@/components/conceptos/ConceptosView";

export const dynamic = "force-dynamic";

export default async function ConceptosPage() {
  const [ingresos, descuentos, companias] = await Promise.all([
    prisma.ingreso.findMany({
      orderBy: [{ compania: { descripcion: "asc" } }, { descripcion: "asc" }],
      include: {
        tipoIngreso: { select: { id: true, descripcion: true } },
        compania: { select: { id: true, descripcion: true, cliente: { select: { nombre: true } } } },
      },
    }),
    prisma.descuento.findMany({
      orderBy: [{ compania: { descripcion: "asc" } }, { descripcion: "asc" }],
      include: {
        tipoDescuento: { select: { id: true, descripcion: true } },
        compania: { select: { id: true, descripcion: true, cliente: { select: { nombre: true } } } },
      },
    }),
    prisma.compania.findMany({
      orderBy: { descripcion: "asc" },
      select: { id: true, descripcion: true, cliente: { select: { nombre: true } } },
    }),
  ]);

  return <ConceptosView ingresos={ingresos} descuentos={descuentos} companias={companias} />;
}
