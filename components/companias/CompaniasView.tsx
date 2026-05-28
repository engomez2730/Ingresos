"use client";

import { useState } from "react";
import { Card, Button, Typography, Space } from "antd";
import { PlusOutlined, BankOutlined } from "@ant-design/icons";
import { CompaniasList } from "./CompaniasList";
import { CompaniaFormDialog } from "./CompaniaFormDialog";

const { Title, Text } = Typography;

interface Cliente { id: number; nombre: string }

interface Compania {
  id: number;
  descripcion: string;
  sucursalPrincipal: string | null;
  tipoEmpresa: string | null;
  latitud: number | null;
  longitud: number | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  cliente: { id: number; nombre: string };
  _count: { conceptos: number };
}

interface Props {
  clientes: Cliente[];
  companias: Compania[];
}

export function CompaniasView({ clientes, companias }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Compania | null>(null);

  function handleEdit(c: Compania) {
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
          <Title level={4} style={{ margin: 0 }}>Compañías</Title>
          <Text type="secondary">{companias.length} compañía(s) registrada(s)</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ background: "#722ed1", borderColor: "#722ed1" }}
          onClick={() => { setEditData(null); setModalOpen(true); }}
        >
          Nueva Compañía
        </Button>
      </div>

      <Card
        style={{ borderRadius: 12, border: "1px solid #f0f0f0" }}
        title={
          <Space>
            <BankOutlined style={{ color: "#722ed1" }} />
            <span>Listado de Compañías</span>
          </Space>
        }
      >
        <CompaniasList companias={companias} onEdit={handleEdit} />
      </Card>

      <CompaniaFormDialog
        open={modalOpen}
        clientes={clientes}
        editData={editData}
        onClose={handleClose}
      />
    </div>
  );
}
