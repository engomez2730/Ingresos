export type TipoConcepto  = "ingreso" | "descuento";
export type EstadoConcepto = "activo"  | "inactivo";

export interface Compania {
  id:                 number;
  descripcion:        string;
  sucursalPrincipal:  string | null;
  latitud:            number | null;
  longitud:           number | null;
  tipoEmpresa:        string | null;
  tipoCompaniaId?:    number | null;
  fechaCreacion:      string;
  fechaActualizacion: string;
  _count?:            { conceptos: number };
}

export interface Ingreso {
  id:                 number;
  descripcion:        string;
  tipoIngresoId?:     number | null;
  tipoIngreso?:       { id: number; descripcion: string } | null;
  estado:             boolean;
  observaciones?:     string | null;
  fechaCreacion:      string;
  fechaActualizacion: string;
  _count?:            { companias: number };
}

export interface Descuento {
  id:                 number;
  descripcion:        string;
  tipoDescuentoId?:   number | null;
  tipoDescuento?:     { id: number; descripcion: string } | null;
  estado:             boolean;
  observaciones?:     string | null;
  fechaCreacion:      string;
  fechaActualizacion: string;
  _count?:            { companias: number };
}

export interface CompaniaIngreso {
  id:              number;
  companiaId:      number;
  ingresoId:       number;
  fechaAsignacion: string;
  activo:          boolean;
  ingreso:         Ingreso;
}

export interface CompaniaDescuento {
  id:              number;
  companiaId:      number;
  descuentoId:     number;
  fechaAsignacion: string;
  activo:          boolean;
  descuento:       Descuento;
}

export interface AnalyticsItem {
  id:             number;
  descripcion:    string;
  tipo:           string | null;
  totalCompanias: number;
}

export interface AnalyticsResponse {
  ingresos:   AnalyticsItem[];
  descuentos: AnalyticsItem[];
}
