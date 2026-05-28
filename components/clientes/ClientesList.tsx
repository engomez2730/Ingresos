"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, Button, Tag, Space, Popconfirm,
  Avatar, Typography, message, Tooltip,
} from "antd";
import {
  EditOutlined, DeleteOutlined,
  BankOutlined, EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

interface Cliente {
  id: number;
  nombre: string;
  fechaCreacion: Date;
  _count: { companias: number };
}

interface Props {
  clientes: Cliente[];
  onEdit: (c: Cliente) => void;
}

export function ClientesList({ clientes, onEdit }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setLoadingId(id);
    const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    if (res.ok) {
      message.success("Cliente eliminado correctamente");
      router.refresh();
    } else {
      message.error("No se pudo eliminar el cliente");
    }
    setLoadingId(null);
  }

  const columns: ColumnsType<Cliente> = [
    {
      title: "Cliente",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      render: (nombre: string) => (
        <Space>
          <Avatar
            style={{
              background: "linear-gradient(135deg, #1677ff, #0958d9)",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {nombre.slice(0, 2).toUpperCase()}
          </Avatar>
          <Text strong>{nombre}</Text>
        </Space>
      ),
    },
    {
      title: "Compañías",
      key: "companias",
      align: "center",
      sorter: (a, b) => a._count.companias - b._count.companias,
      render: (_: unknown, r: Cliente) => (
        <Tag
          icon={<BankOutlined />}
          color={r._count.companias > 0 ? "blue" : "default"}
          style={{ fontWeight: 600 }}
        >
          {r._count.companias}
        </Tag>
      ),
    },
    {
      title: "Fecha de Alta",
      dataIndex: "fechaCreacion",
      key: "fechaCreacion",
      sorter: (a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime(),
      render: (d: Date) =>
        new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }),
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "center",
      width: 160,
      render: (_: unknown, record: Cliente) => (
        <Space>
          <Tooltip title="Ver compañías">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/companias?clienteId=${record.id}`)}
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
            title="¿Eliminar cliente?"
            description="Se eliminarán también todas sus compañías y conceptos."
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
      dataSource={clientes}
      columns={columns}
      rowKey="id"
      size="middle"
      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} clientes` }}
      locale={{ emptyText: "No hay clientes registrados" }}
    />
  );
}
