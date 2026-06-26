import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CompaniaDetalleView } from "@/components/companias/CompaniaDetalleView";

export const dynamic = "force-dynamic";

export default async function CompaniaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const compania = await prisma.compania.findUnique({
    where: { id: Number(id) },
    include: {
      ingresos: {
        include: { ingreso: { include: { tipoIngreso: true } } },
        orderBy: { ingreso: { descripcion: "asc" } },
      },
      descuentos: {
        include: { descuento: { include: { tipoDescuento: true } } },
        orderBy: { descuento: { descripcion: "asc" } },
      },
    },
  });

  if (!compania) notFound();

  return (
    <CompaniaDetalleView
      compania={{
        id:               compania.id,
        descripcion:      compania.descripcion,
        sucursalPrincipal: compania.sucursalPrincipal,
        tipoEmpresa:      compania.tipoEmpresa,
        fechaCreacion:    compania.fechaCreacion.toISOString(),
        ingresos: compania.ingresos.map((ci) => ({
          pivotId:       ci.id,
          ingresoId:     ci.ingreso.id,
          descripcion:   ci.ingreso.descripcion,
          tipo:          ci.ingreso.tipoIngreso?.descripcion ?? null,
          observaciones: ci.ingreso.observaciones,
          estado:        ci.ingreso.estado,
          activo:        ci.activo,
        })),
        descuentos: compania.descuentos.map((cd) => ({
          pivotId:       cd.id,
          descuentoId:   cd.descuento.id,
          descripcion:   cd.descuento.descripcion,
          tipo:          cd.descuento.tipoDescuento?.descripcion ?? null,
          observaciones: cd.descuento.observaciones,
          estado:        cd.descuento.estado,
          activo:        cd.activo,
        })),
      }}
    />
  );
}
