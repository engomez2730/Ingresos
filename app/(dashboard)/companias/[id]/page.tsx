import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CompaniaDetalleView } from "@/components/companias/CompaniaDetalleView";

export const dynamic = "force-dynamic";

export default async function CompaniaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const compania = await prisma.compania.findUnique({
    where: { id: Number(id) },
    include: {
      cliente:   { select: { id: true, nombre: true } },
      ingresos:  { orderBy: { descripcion: "asc" } },
      descuentos:{ orderBy: { descripcion: "asc" } },
    },
  });

  if (!compania) notFound();

  return (
    <CompaniaDetalleView
      compania={{
        ...compania,
        latitud:  compania.latitud  ? Number(compania.latitud)  : null,
        longitud: compania.longitud ? Number(compania.longitud) : null,
        fechaCreacion: compania.fechaCreacion.toISOString(),
      }}
    />
  );
}
