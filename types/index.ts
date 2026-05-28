export type TipoConcepto = "ingreso" | "descuento";
export type EstadoConcepto = "activo" | "inactivo";

export interface Cliente {
  id: number;
  nombre: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  _count?: { companias: number };
}

export interface Compania {
  id: number;
  clienteId: number;
  descripcion: string;
  sucursalPrincipal: string | null;
  latitud: number | null;
  longitud: number | null;
  tipoEmpresa: string | null;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  cliente?: Pick<Cliente, "id" | "nombre">;
  _count?: { conceptos: number };
}

export interface ConceptoNomina {
  id: number;
  companiaId: number;
  descripcion: string;
  tipo: boolean;   // true = Ingreso
  estado: boolean; // true = Activo
  observaciones: string | null;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  compania?: Pick<Compania, "id" | "descripcion">;
}
