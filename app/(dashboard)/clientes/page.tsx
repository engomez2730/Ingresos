import { redirect } from "next/navigation";

/** Módulo Clientes eliminado — redirige al dashboard. */
export default function ClientesRedirect() {
  redirect("/");
}
