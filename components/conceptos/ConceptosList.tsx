"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Tag, Switch, Popconfirm, Tooltip, Typography, message, Space } from "antd";
import { DeleteOutlined, RiseOutlined, FallOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

export interface ConceptoRow {
  id:            number;
  pivotId:       number;
  descripcion:   string;
  tipo:          string | null;
  estado:        boolean;
  activo:        boolean;
  observaciones: string | null;
}

interface Props {
  items:      ConceptoRow[];
  variant:    "ingreso" | "descuento";
  companiaId: number;
}

export function ConceptosList({ items, variant, companiaId }: Props) {
  const router     = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const endpoint = variant === "ingreso" ? "ingresos" : "descuentos";
  const color    = variant === "ingreso" ? "#52c41a"  : "#fa8c16";
  const tagColor = variant === "ingreso" ? "success"  : "warning";

  async function toggleActivo(row: ConceptoRow) {
    setLoadingId(row.pivotId);
    await fetch(`/api/companias/${companiaId}/${endpoint}/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !row.activo }),
    });
    router.refresh();
    setLoadingId(null);
  }

  async function handleDelete(row: ConceptoRow) {
    setLoadingId(row.pivotId);
    const res = await fetch(`/api/companias/${companiaId}/${endpoint}/${row.id}`, {
      method: "DELETE",
    });
    if (res.ok) { message.success("Desasignado correctamente"); router.refresh(); }
    else         { message.error("No se pudo desasignar"); }
    setLoadingId(null);
  }

  const columns: ColumnsType<ConceptoRow> = [
    {
      title:     "Descripción",
      dataIndex: "descripcion",
      key:       "descripcion",
      sorter:    (a, b) => a.descripcion.localeCompare(b.descripcion),
      render: (text: string) => (
        <Space>
          {variant === "ingreso"
            ? <RiseOutlined style={{ color }} />
            : <FallOutlined  style={{ color }} />}
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
        </Space>
      ),
    },
    {
      title:     "Tipo",
      dataIndex: "tipo",
      key:       "tipo",
      render:    (tipo: string | null) =>
        tipo ? <Tag color="blue" style={{ fontSize: 11 }}>{tipo}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title:     "Observaciones",
      dataIndex: "observaciones",
      key:       "observaciones",
      render:    (obs: string | null) =>
        obs ? <Text type="secondary" style={{ fontSize: 12 }}>{obs}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title:  "Estado",
      key:    "estado",
      align:  "center",
      width:  100,
      render: (_: unknown, r: ConceptoRow) => (
        <Tag color={r.activo ? tagColor : "default"}>{r.activo ? "Activo" : "Inactivo"}</Tag>
      ),
    },
    {
      title:  "Activo",
      key:    "toggle",
      align:  "center",
      width:  80,
      render: (_: unknown, record: ConceptoRow) => (
        <Switch
          size="small"
          checked={record.activo}
          loading={loadingId === record.pivotId}
          onChange={() => toggleActivo(record)}
          style={{ background: record.activo ? color : undefined }}
        />
      ),
    },
    {
      title:  "",
      key:    "acciones",
      align:  "center",
      width:  60,
      render: (_: unknown, record: ConceptoRow) => (
        <Popconfirm
          title="¿Desasignar este concepto de la compañía?"
          description="El concepto permanecerá en el catálogo global."
          okText="Sí, desasignar"
          cancelText="Cancelar"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(record)}
        >
          <Tooltip title="Desasignar">
            <DeleteOutlined style={{ color: "#ff4d4f", cursor: "pointer", fontSize: 15 }} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      dataSource={items}
      columns={columns}
      rowKey="pivotId"
      size="small"
      pagination={{ pageSize: 8, showTotal: (t) => `${t} registros`, size: "small" }}
      locale={{ emptyText: `Sin ${variant === "ingreso" ? "ingresos" : "descuentos"} asignados` }}
      rowClassName={(r) => (!r.activo ? "opacity-50" : "")}
    />
  );
}
