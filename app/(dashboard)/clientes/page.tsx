import { prisma } from "@/lib/prisma";
import { ClientesView } from "@/components/clientes/ClientesView";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = (await prisma.cliente.findMany({
    include: { _count: { select: { companias: true } } },
  })).sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <ClientesView
      clientes={clientes.map((c) => ({
        ...c,
        fechaCreacion: c.fechaCreacion,
        fechaActualizacion: c.fechaActualizacion,
      }))}
    />
  );
}
