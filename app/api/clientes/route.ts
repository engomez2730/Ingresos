import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  nombre: z.string().min(2).max(200),
});

export async function GET() {
  try {
    const clientes = (await prisma.cliente.findMany({
      include: { _count: { select: { companias: true } } },
    })).sort((a, b) => a.nombre.localeCompare(b.nombre));
    return NextResponse.json(clientes);
  } catch {
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre } = schema.parse(body);
    const cliente = await prisma.cliente.create({ data: { nombre } });
    return NextResponse.json(cliente, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}
