"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal, Form, Input, Button, message } from "antd";
import { UserAddOutlined } from "@ant-design/icons";

interface Cliente {
  id: number;
  nombre: string;
}

interface Props {
  open: boolean;
  editData?: Cliente | null;
  onClose: () => void;
}

export function ClienteFormDialog({ open, editData, onClose }: Props) {
  const router = useRouter();
  const [form] = Form.useForm();
  const isEdit = !!editData;

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ nombre: editData?.nombre ?? "" });
    } else {
      form.resetFields();
    }
  }, [open, editData, form]);

  async function handleSubmit(values: { nombre: string }) {
    const url = isEdit ? `/api/clientes/${editData!.id}` : "/api/clientes";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      message.success(isEdit ? "Cliente actualizado" : "Cliente creado correctamente");
      onClose();
      router.refresh();
    } else {
      message.error("Error al guardar. Verifica los datos.");
    }
  }

  return (
    <Modal
      open={open}
      title={
        <span>
          <UserAddOutlined style={{ marginRight: 8, color: "#1677ff" }} />
          {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
        </span>
      }
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={420}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Form.Item
          name="nombre"
          label="Nombre del Cliente"
          rules={[
            { required: true, message: "El nombre es requerido" },
            { min: 2, message: "MÃ­nimo 2 caracteres" },
            { max: 200, message: "MÃ¡ximo 200 caracteres" },
          ]}
        >
          <Input placeholder="Ej. Grupo Empresarial Andina" size="large" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancelar
          </Button>
          <Button type="primary" htmlType="submit">
            {isEdit ? "Actualizar" : "Guardar Cliente"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
