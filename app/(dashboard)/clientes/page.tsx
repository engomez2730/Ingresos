import { prisma } from "@/lib/prisma";
import { ClientesView } from "@/components/clientes/ClientesView";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { companias: true } } },
  });

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
