import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ descripcion: z.string().min(2).max(100), estado: z.boolean().default(true) });

export async function GET() {
  const items = (await prisma.tipoCompania.findMany()).sort((a, b) => a.descripcion.localeCompare(b.descripcion));
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const item = await prisma.tipoCompania.create({ data });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 422 });
    return NextResponse.json({ error: "Error al crear" }, { status: 500 });
  }
}
