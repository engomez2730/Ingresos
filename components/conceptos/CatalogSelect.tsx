"use client";

import { useEffect, useState } from "react";
import { Button, Checkbox, Input, Space, Tag, Typography, Spin, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface CatalogItem {
  id:          number;
  descripcion: string;
  tipoIngreso?: { descripcion: string } | null;
  tipoDescuento?: { descripcion: string } | null;
  _count:      { companias: number };
}

interface Props {
  variant:    "ingreso" | "descuento";
  companiaId: number;
  color:      string;
  onDone:     () => void;
}

export function CatalogSelect({ variant, companiaId, color, onDone }: Props) {
  const [items,     setItems]     = useState<CatalogItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState<Set<number>>(new Set());

  const endpoint    = variant === "ingreso" ? "ingresos"  : "descuentos";
  const tipoField   = variant === "ingreso" ? "tipoIngreso" : "tipoDescuento";

  useEffect(() => {
    fetch(`/api/${endpoint}`)
      .then((r) => r.json())
      .then((data: CatalogItem[]) => {
        setItems(data);
        setLoading(false);
      });
  }, [endpoint]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = items.filter((item) =>
    item.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAssign() {
    if (selected.size === 0) { message.warning("Selecciona al menos un concepto."); return; }
    setSaving(true);
    try {
      const results = await Promise.all(
        [...selected].map((itemId) =>
          fetch(`/api/companias/${companiaId}/${endpoint}`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              variant === "ingreso"
                ? { ingresoId: itemId }
                : { descuentoId: itemId }
            ),
          })
        )
      );
      const ok = results.filter((r) => r.ok).length;
      message.success(`${ok} concepto(s) asignado(s)`);
      onDone();
    } catch {
      message.error("Error al asignar. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ textAlign: "center", padding: 32 }}><Spin /></div>;

  return (
    <div>
      <Input
        prefix={<SearchOutlined />}
        placeholder="Buscar en catálogo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <div style={{ maxHeight: "45vh", overflowY: "auto", border: "1px solid #f0f0f0", borderRadius: 8 }}>
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "#8c8c8c" }}>
            Sin resultados en el catálogo
          </div>
        )}
        {filtered.map((item) => {
          const tipo = (item[tipoField] as { descripcion: string } | null | undefined)?.descripcion;
          return (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px", cursor: "pointer",
                background: selected.has(item.id) ? (variant === "ingreso" ? "#f6ffed" : "#fff7e6") : "#fff",
                borderBottom: "1px solid #f5f5f5",
                transition: "background 0.15s",
              }}
            >
              <Checkbox checked={selected.has(item.id)} onChange={() => toggle(item.id)} />
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 13 }}>{item.descripcion}</Text>
                {tipo && <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>{tipo}</Tag>}
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {item._count.companias} compañía(s)
              </Text>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {selected.size > 0 ? `${selected.size} seleccionado(s)` : "Selecciona conceptos del catálogo"}
        </Text>
        <Space>
          <Button onClick={onDone}>Cancelar</Button>
          <Button
            loading={saving}
            disabled={selected.size === 0}
            onClick={handleAssign}
            style={{ background: color, borderColor: color, color: "#fff" }}
          >
            Asignar {selected.size > 0 ? selected.size : ""} concepto(s)
          </Button>
        </Space>
      </div>
    </div>
  );
}
