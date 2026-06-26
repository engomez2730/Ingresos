"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Modal, Input, Button, Space, message,
  Divider, Tooltip, Tabs,
} from "antd";
import {
  PlusOutlined, DeleteOutlined, RiseOutlined, FallOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { TipoSelect } from "@/components/shared/TipoSelect";
import { CatalogSelect } from "@/components/conceptos/CatalogSelect";

interface Row { descripcion: string; observaciones: string; tipoId: number | null }
const emptyRow = (): Row => ({ descripcion: "", observaciones: "", tipoId: null });

interface Props {
  variant:    "ingreso" | "descuento";
  companiaId: number;
}

export function ConceptoFormDialog({ variant, companiaId }: Props) {
  const router  = useRouter();
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows,    setRows]    = useState<Row[]>([emptyRow()]);
  const [tab,     setTab]     = useState<"nuevo" | "catalogo">("nuevo");

  const isIngreso = variant === "ingreso";
  const endpoint  = isIngreso ? "ingresos"          : "descuentos";
  const tipoEndpt = isIngreso ? "/api/tipos/ingresos" : "/api/tipos/descuentos";
  const label     = isIngreso ? "Ingreso"            : "Descuento";
  const color     = isIngreso ? "#52c41a"            : "#fa8c16";
  const Icon      = isIngreso ? RiseOutlined          : FallOutlined;

  function updateRow(i: number, field: keyof Row, value: string | number | null) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }
  function addRow()           { setRows((p) => [...p, emptyRow()]); }
  function removeRow(i: number) { if (rows.length > 1) setRows((p) => p.filter((_, idx) => idx !== i)); }

  function handleClose() {
    setOpen(false);
    setRows([emptyRow()]);
    setTab("nuevo");
  }

  async function handleSubmitNuevo() {
    const validas = rows.filter((r) => r.descripcion.trim().length >= 2);
    if (!validas.length) { message.warning("Ingresa al menos una descripción válida."); return; }

    setLoading(true);
    try {
      const results = await Promise.all(
        validas.map((row) =>
          fetch(`/api/companias/${companiaId}/${endpoint}`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              descripcion:   row.descripcion.trim(),
              observaciones: row.observaciones.trim() || null,
              ...(isIngreso ? { tipoIngresoId: row.tipoId } : { tipoDescuentoId: row.tipoId }),
            }),
          })
        )
      );

      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) message.warning(`${failed} concepto(s) ya estaban asignados o fallaron.`);
      const ok = results.length - failed;
      if (ok > 0) message.success(`${ok} ${label.toLowerCase()}(s) guardado(s) y asignado(s)`);

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
        width={720}
        footer={null}
        destroyOnHidden
      >
        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k as "nuevo" | "catalogo")}
          items={[
            {
              key:   "nuevo",
              label: <Space><PlusOutlined />Crear nuevo</Space>,
              children: (
                <>
                  {/* Cabecera columnas */}
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

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "45vh", overflowY: "auto" }}>
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

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                    <span style={{ color: "#8c8c8c", fontSize: 12 }}>
                      {validCount > 0
                        ? `${validCount} listo(s) para guardar`
                        : "Mínimo 2 caracteres por descripción"}
                    </span>
                    <Space>
                      <Button onClick={handleClose}>Cancelar</Button>
                      <Button
                        loading={loading}
                        disabled={validCount === 0}
                        onClick={handleSubmitNuevo}
                        style={{ background: color, borderColor: color, color: "#fff" }}
                      >
                        Guardar {validCount > 0 ? validCount : ""} {label.toLowerCase()}(s)
                      </Button>
                    </Space>
                  </div>
                </>
              ),
            },
            {
              key:   "catalogo",
              label: <Space><DatabaseOutlined />Asignar del catálogo</Space>,
              children: (
                <CatalogSelect
                  variant={variant}
                  companiaId={companiaId}
                  color={color}
                  onDone={() => { handleClose(); router.refresh(); }}
                />
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
}
