"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, Button, Tag, Space, Popconfirm,
  Avatar, Typography, message, Tooltip,
} from "antd";
import {
  EditOutlined, DeleteOutlined,
  EyeOutlined, EnvironmentOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

interface Compania {
  id:                number;
  descripcion:       string;
  sucursalPrincipal: string | null;
  tipoEmpresa:       string | null;
  fechaCreacion:     string;
  _count:            { conceptos: number };
}

interface Props {
  companias: Compania[];
  onEdit: (c: Compania) => void;
}

const TIPO_COLORS: Record<string, string> = {
  "S.A.": "blue", "S.A.S.": "geekblue", "LTDA": "purple",
  "E.U.": "cyan", "S.C.A.": "magenta",
};

export function CompaniasList({ companias, onEdit }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setLoadingId(id);
    const res = await fetch(`/api/companias/${id}`, { method: "DELETE" });
    if (res.ok) {
      message.success("Compañía eliminada");
      router.refresh();
    } else {
      message.error("No se pudo eliminar");
    }
    setLoadingId(null);
  }

  const columns: ColumnsType<Compania> = [
    {
      title: "Compañía",
      key: "descripcion",
      sorter: (a, b) => a.descripcion.localeCompare(b.descripcion),
      render: (_: unknown, r: Compania) => (
        <Space>
          <Avatar
            size={38}
            style={{
              background: "linear-gradient(135deg, #722ed1, #531dab)",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {r.descripcion.slice(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: 13 }}>{r.descripcion}</Text>
            {r.sucursalPrincipal && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  <EnvironmentOutlined style={{ marginRight: 3 }} />
                  {r.sucursalPrincipal}
                </Text>
              </>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "tipoEmpresa",
      key: "tipoEmpresa",
      align: "center",
      render: (tipo: string | null) =>
        tipo
          ? <Tag color={TIPO_COLORS[tipo] ?? "default"}>{tipo}</Tag>
          : <Text type="secondary">—</Text>,
    },
    {
      title: "Conceptos",
      key: "conceptos",
      align: "center",
      sorter: (a, b) => a._count.conceptos - b._count.conceptos,
      render: (_: unknown, r: Compania) => (
        <Tag color="geekblue" style={{ fontWeight: 600 }}>{r._count.conceptos}</Tag>
      ),
    },
    {
      title: "Alta",
      dataIndex: "fechaCreacion",
      key: "fechaCreacion",
      sorter: (a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime(),
      render: (d: string) =>
        new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }),
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "center",
      width: 150,
      render: (_: unknown, record: Compania) => (
        <Space>
          <Tooltip title="Ver conceptos">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/companias/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar compañía?"
            description="Se eliminarán todos sus conceptos de nómina."
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true, loading: loadingId === record.id }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Eliminar">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={loadingId === record.id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={companias}
      columns={columns}
      rowKey="id"
      size="middle"
      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} compañías` }}
      locale={{ emptyText: "No hay compañías registradas" }}
    />
  );
}
