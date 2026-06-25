import { prisma } from "@/lib/prisma";
import { CatalogosView } from "@/components/catalogos/CatalogosView";

export const dynamic = "force-dynamic";

export default async function CatalogosPage() {
  const [tiposIngreso, tiposDescuento, tiposCompania] = await Promise.all([
    prisma.tipoIngreso.findMany().then(r => r.sort((a, b) => a.descripcion.localeCompare(b.descripcion))),
    prisma.tipoDescuento.findMany().then(r => r.sort((a, b) => a.descripcion.localeCompare(b.descripcion))),
    prisma.tipoCompania.findMany().then(r => r.sort((a, b) => a.descripcion.localeCompare(b.descripcion))),
  ]);

  return (
    <CatalogosView
      tiposIngreso={tiposIngreso}
      tiposDescuento={tiposDescuento}
      tiposCompania={tiposCompania}
    />
  );
}
