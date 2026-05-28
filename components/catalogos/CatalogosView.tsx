"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Row, Col, Card, Table, Button, Input, Tag,
  Popconfirm, Space, Typography, message, Modal, Form, Switch,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  RiseOutlined, FallOutlined, BankOutlined, AppstoreOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

interface TipoItem { id: number; descripcion: string; estado: boolean }

interface CatalogoCardProps {
  titulo:    string;
  icono:     React.ReactNode;
  color:     string;
  items:     TipoItem[];
  endpoint:  string;
}

function CatalogoCard({ titulo, icono, color, items, endpoint }: CatalogoCardProps) {
  const router = useRouter();
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState<TipoItem | null>(null);
  const [loadingId,  setLoadingId]  = useState<number | null>(null);
  const [form] = Form.useForm();

  function openAdd()  { setEditItem(null); form.resetFields(); form.setFieldValue("estado", true); setModalOpen(true); }
  function openEdit(item: TipoItem) { setEditItem(item); form.setFieldsValue(item); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditItem(null); form.resetFields(); }

  async function handleSave(values: { descripcion: string; estado: boolean }) {
    const url    = editItem ? `${endpoint}/${editItem.id}` : endpoint;
    const method = editItem ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      message.success(editItem ? "Actualizado" : "Creado correctamente");
      closeModal();
      router.refresh();
    } else {
      message.error("Error al guardar");
    }
  }

  async function handleDelete(id: number) {
    setLoadingId(id);
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) { message.success("Eliminado"); router.refresh(); }
    else         { message.error("No se pudo eliminar (puede estar en uso)"); }
    setLoadingId(null);
  }

  const columns: ColumnsType<TipoItem> = [
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      sorter: (a, b) => a.descripcion.localeCompare(b.descripcion),
      render: (t: string) => <Text strong>{t}</Text>,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      width: 100,
      render: (e: boolean) => <Tag color={e ? "green" : "default"}>{e ? "Activo" : "Inactivo"}</Tag>,
    },
    {
      title: "",
      key: "acciones",
      align: "center",
      width: 90,
      render: (_: unknown, record: TipoItem) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="¿Eliminar este tipo?"
            description="Solo puedes eliminar tipos que no estén en uso."
            okText="Sí" cancelText="No" okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}
              loading={loadingId === record.id} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title={<Space>{icono}<span style={{ color, fontWeight: 600 }}>{titulo}</span><Tag>{items.length}</Tag></Space>}
        extra={
          <Button type="primary" size="small" icon={<PlusOutlined />}
            style={{ background: color, borderColor: color }}
            onClick={openAdd}>
            Nuevo
          </Button>
        }
        style={{ borderRadius: 12, border: "1px solid #f0f0f0", height: "100%" }}
        styles={{ header: { borderBottom: "1px solid #f0f0f0" } }}
      >
        <Table
          dataSource={items} columns={columns} rowKey="id" size="small"
          pagination={{ pageSize: 8, size: "small" }}
          locale={{ emptyText: "Sin tipos registrados" }}
        />
      </Card>

      <Modal
        open={modalOpen}
        title={
          <Space>{icono}
            <span>{editItem ? `Editar: ${editItem.descripcion}` : `Nuevo ${titulo.replace("Tipos de ", "")}`}</span>
          </Space>
        }
        onCancel={closeModal}
        footer={null}
        destroyOnClose
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="descripcion" label="Descripción"
            rules={[{ required: true, message: "Requerido" }, { min: 2, message: "Mínimo 2 caracteres" }]}>
            <Input placeholder="Ej. Salarial" size="large" />
          </Form.Item>
          <Form.Item name="estado" label="Estado" valuePropName="checked">
            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo"
              style={{ background: color }} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={closeModal}>Cancelar</Button>
              <Button type="primary" htmlType="submit"
                style={{ background: color, borderColor: color }}>
                {editItem ? "Actualizar" : "Guardar"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

interface Props {
  tiposIngreso:   TipoItem[];
  tiposDescuento: TipoItem[];
  tiposCompania:  TipoItem[];
}

export function CatalogosView({ tiposIngreso, tiposDescuento, tiposCompania }: Props) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <AppstoreOutlined style={{ marginRight: 8, color: "#1677ff" }} />
          Catálogos
        </Title>
        <Text type="secondary">
          Administra los tipos dinámicos utilizados en toda la plataforma
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <CatalogoCard
            titulo="Tipos de Ingreso"
            icono={<RiseOutlined style={{ color: "#52c41a" }} />}
            color="#52c41a"
            items={tiposIngreso}
            endpoint="/api/tipos/ingresos"
          />
        </Col>
        <Col xs={24} lg={8}>
          <CatalogoCard
            titulo="Tipos de Descuento"
            icono={<FallOutlined style={{ color: "#fa8c16" }} />}
            color="#fa8c16"
            items={tiposDescuento}
            endpoint="/api/tipos/descuentos"
          />
        </Col>
        <Col xs={24} lg={8}>
          <CatalogoCard
            titulo="Tipos de Compañía"
            icono={<BankOutlined style={{ color: "#722ed1" }} />}
            color="#722ed1"
            items={tiposCompania}
            endpoint="/api/tipos/companias"
          />
        </Col>
      </Row>
    </div>
  );
}
