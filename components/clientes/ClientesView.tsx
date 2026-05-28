"use client";

import { useState } from "react";
import { Card, Button, Typography, Space } from "antd";
import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import { ClientesList } from "./ClientesList";
import { ClienteFormDialog } from "./ClienteFormDialog";

const { Title, Text } = Typography;

interface Cliente {
  id: number;
  nombre: string;
  fechaCreacion: Date;
  _count: { companias: number };
}

export function ClientesView({ clientes }: { clientes: Cliente[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Cliente | null>(null);

  function handleEdit(c: Cliente) {
    setEditData(c);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditData(null);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Clientes</Title>
          <Text type="secondary">{clientes.length} cliente(s) registrado(s)</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => { setEditData(null); setModalOpen(true); }}
        >
          Nuevo Cliente
        </Button>
      </div>

      <Card
        style={{ borderRadius: 12, border: "1px solid #f0f0f0" }}
        title={
          <Space>
            <TeamOutlined style={{ color: "#1677ff" }} />
            <span>Listado de Clientes</span>
          </Space>
        }
      >
        <ClientesList clientes={clientes} onEdit={handleEdit} />
      </Card>

      <ClienteFormDialog open={modalOpen} editData={editData} onClose={handleClose} />
    </div>
  );
}
