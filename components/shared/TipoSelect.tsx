"use client";

import { useState, useEffect, useRef } from "react";
import { Select, Input, Button, Divider, Space, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface TipoItem { id: number; descripcion: string; estado: boolean }

interface Props {
  endpoint: string;          // ej. "/api/tipos/ingresos"
  value?: number | null;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  color?: string;            // color del botón "Agregar"
  allowClear?: boolean;
}

export function TipoSelect({
  endpoint, value, onChange, placeholder = "Selecciona un tipo...",
  color = "#1677ff", allowClear = true,
}: Props) {
  const [items,   setItems]   = useState<TipoItem[]>([]);
  const [newDesc, setNewDesc] = useState("");
  const [saving,  setSaving]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar tipos al montar
  useEffect(() => {
    fetch(endpoint)
      .then((r) => r.json())
      .then((data: TipoItem[]) => setItems(data.filter((i) => i.estado)))
      .catch(() => {});
  }, [endpoint]);

  async function handleAdd() {
    const desc = newDesc.trim();
    if (desc.length < 2) { message.warning("Mínimo 2 caracteres"); return; }
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion: desc, estado: true }),
      });
      if (!res.ok) throw new Error();
      const created: TipoItem = await res.json();
      setItems((prev) => [...prev, created].sort((a, b) => a.descripcion.localeCompare(b.descripcion)));
      onChange?.(created.id);
      setNewDesc("");
      message.success(`Tipo "${desc}" creado`);
    } catch {
      message.error("No se pudo crear el tipo");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select
      value={value ?? undefined}
      onChange={(v) => onChange?.(v ?? null)}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch
      optionFilterProp="label"
      options={items.map((i) => ({ value: i.id, label: i.descripcion }))}
      style={{ width: "100%" }}
      dropdownRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: "8px 0" }} />
          <Space style={{ padding: "4px 8px 8px" }}>
            <Input
              ref={inputRef}
              placeholder="Nuevo tipo..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
              style={{ width: 180 }}
              size="small"
            />
            <Button
              type="text"
              icon={<PlusOutlined />}
              loading={saving}
              onClick={handleAdd}
              style={{ color, fontWeight: 600 }}
              size="small"
            >
              Agregar
            </Button>
          </Space>
        </>
      )}
    />
  );
}
