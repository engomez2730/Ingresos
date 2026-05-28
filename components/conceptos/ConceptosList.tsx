"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Tag, Switch, Popconfirm, Tooltip, Typography, message, Space } from "antd";
import { DeleteOutlined, RiseOutlined, FallOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

export interface ConceptoRow {
  id: number;
  descripcion: string;
  estado: boolean;
  observaciones: string | null;
}

interface Props {
  items:   ConceptoRow[];
  variant: "ingreso" | "descuento";
}

export function ConceptosList({ items, variant }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const endpoint = variant === "ingreso" ? "ingresos" : "descuentos";
  const color    = variant === "ingreso" ? "#52c41a" : "#fa8c16";
  const tagColor = variant === "ingreso" ? "success"  : "warning";

  async function toggleEstado(row: ConceptoRow) {
    setLoadingId(row.id);
    await fetch(`/api/${endpoint}/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion: row.descripcion, estado: !row.estado, observaciones: row.observaciones }),
    });
    router.refresh();
    setLoadingId(null);
  }

  async function handleDelete(id: number) {
    setLoadingId(id);
    const res = await fetch(`/api/${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) { message.success("Eliminado correctamente"); router.refresh(); }
    else         { message.error("No se pudo eliminar"); }
    setLoadingId(null);
  }

  const columns: ColumnsType<ConceptoRow> = [
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      sorter: (a, b) => a.descripcion.localeCompare(b.descripcion),
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
      title: "Observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      render: (obs: string | null) =>
        obs ? <Text type="secondary" style={{ fontSize: 12 }}>{obs}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      width: 110,
      filters: [
        { text: "Activo",   value: true  },
        { text: "Inactivo", value: false },
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado: boolean) => (
        <Tag color={estado ? tagColor : "default"}>{estado ? "Activo" : "Inactivo"}</Tag>
      ),
    },
    {
      title: "Activo",
      key: "toggle",
      align: "center",
      width: 80,
      render: (_: unknown, record: ConceptoRow) => (
        <Switch
          size="small"
          checked={record.estado}
          loading={loadingId === record.id}
          onChange={() => toggleEstado(record)}
          style={{ background: record.estado ? color : undefined }}
        />
      ),
    },
    {
      title: "",
      key: "acciones",
      align: "center",
      width: 60,
      render: (_: unknown, record: ConceptoRow) => (
        <Popconfirm
          title="¿Eliminar este registro?"
          okText="Sí, eliminar"
          cancelText="Cancelar"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(record.id)}
        >
          <Tooltip title="Eliminar">
            <DeleteOutlined
              style={{ color: "#ff4d4f", cursor: "pointer", fontSize: 15 }}
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      dataSource={items}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={{ pageSize: 8, showTotal: (t) => `${t} registros`, size: "small" }}
      locale={{ emptyText: `Sin ${variant === "ingreso" ? "ingresos" : "descuentos"} registrados` }}
      rowClassName={(r) => (!r.estado ? "opacity-50" : "")}
    />
  );
}
