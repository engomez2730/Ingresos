"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Modal, Input, Button, Space, message,
  Divider, Tooltip, Select,
} from "antd";
import { PlusOutlined, DeleteOutlined, RiseOutlined, FallOutlined } from "@ant-design/icons";
import { TipoSelect } from "@/components/shared/TipoSelect";

interface CompaniaOption { id: number; descripcion: string; cliente: { nombre: string } }
interface Row { descripcion: string; observaciones: string; tipoId: number | null }
const emptyRow = (): Row => ({ descripcion: "", observaciones: "", tipoId: null });

interface Props {
  variant: "ingreso" | "descuento";
  /** Si se omite, el modal mostrará un selector de compañía */
  companiaId?: number;
  /** Necesario solo cuando companiaId es undefined */
  companias?: CompaniaOption[];
}

export function ConceptoFormDialog({ variant, companiaId, companias = [] }: Props) {
  const router   = useRouter();
  const [open,         setOpen]         = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [rows,         setRows]         = useState<Row[]>([emptyRow()]);
  const [selectedCia,  setSelectedCia]  = useState<number | null>(companiaId ?? null);

  const isIngreso  = variant === "ingreso";
  const endpoint   = isIngreso ? "ingresos"  : "descuentos";
  const tipoEndpt  = isIngreso ? "/api/tipos/ingresos" : "/api/tipos/descuentos";
  const label      = isIngreso ? "Ingreso"   : "Descuento";
  const color      = isIngreso ? "#52c41a"   : "#fa8c16";
  const Icon       = isIngreso ? RiseOutlined : FallOutlined;
  const globalMode = companiaId === undefined; // sin compañía fija → modo global

  function updateRow(i: number, field: keyof Row, value: string | number | null) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }
  function addRow()          { setRows((p) => [...p, emptyRow()]); }
  function removeRow(i: number) { if (rows.length > 1) setRows((p) => p.filter((_, idx) => idx !== i)); }

  function handleClose() {
    setOpen(false);
    setRows([emptyRow()]);
    if (globalMode) setSelectedCia(null);
  }

  async function handleSubmit() {
    const ciaId = companiaId ?? selectedCia;
    if (!ciaId) { message.warning("Selecciona una compañía."); return; }

    const validas = rows.filter((r) => r.descripcion.trim().length >= 2);
    if (!validas.length) { message.warning("Ingresa al menos una descripción."); return; }

    setLoading(true);
    try {
      await Promise.all(
        validas.map((row) =>
          fetch(`/api/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companiaId:    ciaId,
              descripcion:   row.descripcion.trim(),
              estado:        true,
              observaciones: row.observaciones.trim() || null,
              ...(isIngreso
                ? { tipoIngresoId:  row.tipoId }
                : { tipoDescuentoId: row.tipoId }),
            }),
          })
        )
      );
      message.success(`${validas.length} ${label.toLowerCase()}(s) guardado(s)`);
      handleClose();
      router.refresh();
    } catch {
      message.error("Error al guardar. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  const validCount = rows.filter((r) => r.descripcion.trim().length >= 2).length;

  return (
    <>
      <Button
        icon={<Icon />}
        onClick={() => setOpen(true)}
        style={{ background: color, borderColor: color, color: "#fff", fontWeight: 600 }}
      >
        Agregar {label}s
      </Button>

      <Modal
        open={open}
        title={<Space><Icon style={{ color }} /><span>Agregar {label}s</span></Space>}
        onCancel={handleClose}
        width={700}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#8c8c8c", fontSize: 12 }}>
              {validCount > 0 ? `${validCount} listo(s) para guardar` : "Mínimo 2 caracteres por descripción"}
            </span>
            <Space>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button loading={loading} disabled={validCount === 0 || (globalMode && !selectedCia)}
                onClick={handleSubmit}
                style={{ background: color, borderColor: color, color: "#fff" }}>
                Guardar {validCount > 0 ? validCount : ""} {label.toLowerCase()}(s)
              </Button>
            </Space>
          </div>
        }
      >
        {/* ── Selector de compañía (solo en modo global) ── */}
        {globalMode && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
              Compañía *
            </div>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Selecciona la compañía..."
              value={selectedCia ?? undefined}
              onChange={(v) => setSelectedCia(v)}
              style={{ width: "100%" }}
              options={companias.map((c) => ({
                value: c.id,
                label: `${c.descripcion} — ${c.cliente.nombre}`,
              }))}
            />
            <Divider style={{ margin: "16px 0 12px" }} />
          </div>
        )}

        {/* ── Cabecera columnas ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 180px 1fr 32px", gap: 8,
          color: "#8c8c8c", fontSize: 11, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.5px", paddingBottom: 8,
        }}>
          <span>Descripción *</span>
          <span>Tipo</span>
          <span>Observación</span>
          <span />
        </div>

        {/* ── Filas ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "48vh", overflowY: "auto" }}>
          {rows.map((row, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 180px 1fr 32px",
              gap: 8, alignItems: "center", padding: "8px 12px", borderRadius: 8,
              background: isIngreso ? "#f6ffed" : "#fff7e6",
              border: `1px solid ${isIngreso ? "#b7eb8f" : "#ffd591"}`,
            }}>
              <Input
                value={row.descripcion}
                onChange={(e) => updateRow(i, "descripcion", e.target.value)}
                placeholder={isIngreso ? "Ej. Salario Básico" : "Ej. Seg. Social"}
                size="small"
              />
              <TipoSelect
                endpoint={tipoEndpt}
                value={row.tipoId}
                onChange={(v) => updateRow(i, "tipoId", v)}
                placeholder="Tipo..."
                color={color}
                allowClear
              />
              <Input
                value={row.observaciones}
                onChange={(e) => updateRow(i, "observaciones", e.target.value)}
                placeholder="Opcional"
                size="small"
              />
              <Tooltip title="Eliminar fila">
                <Button type="text" size="small" danger icon={<DeleteOutlined />}
                  disabled={rows.length === 1} onClick={() => removeRow(i)} />
              </Tooltip>
            </div>
          ))}
        </div>

        <Divider dashed style={{ margin: "12px 0" }} />
        <Button type="dashed" icon={<PlusOutlined />} onClick={addRow}
          style={{ width: "100%", borderColor: color, color }}>
          Agregar otra fila
        </Button>
      </Modal>
    </>
  );
}
