import { prisma } from "@/lib/prisma";
import { CatalogosView } from "@/components/catalogos/CatalogosView";

export const dynamic = "force-dynamic";

export default async function CatalogosPage() {
  const [tiposIngreso, tiposDescuento, tiposCompania] = await Promise.all([
    prisma.tipoIngreso.findMany({ orderBy: { descripcion: "asc" } }),
    prisma.tipoDescuento.findMany({ orderBy: { descripcion: "asc" } }),
    prisma.tipoCompania.findMany({ orderBy: { descripcion: "asc" } }),
  ]);

  return (
    <CatalogosView
      tiposIngreso={tiposIngreso}
      tiposDescuento={tiposDescuento}
      tiposCompania={tiposCompania}
    />
  );
}
