"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Modal, Form, Input, InputNumber,
  Row, Col, message,
} from "antd";
import { BankOutlined } from "@ant-design/icons";
import { TipoSelect } from "@/components/shared/TipoSelect";

interface Compania {
  id:                number;
  descripcion:       string;
  sucursalPrincipal: string | null;
  tipoEmpresa:       string | null;
  latitud?:          number | null;
  longitud?:         number | null;
  tipoCompaniaId?:   number | null;
}

interface Props {
  open:      boolean;
  editData?: Compania | null;
  onClose:   () => void;
}

export function CompaniaFormDialog({ open, editData, onClose }: Props) {
  const router = useRouter();
  const [form] = Form.useForm();
  const isEdit = !!editData;

  useEffect(() => {
    if (open && editData) {
      form.setFieldsValue({
        descripcion:       editData.descripcion,
        sucursalPrincipal: editData.sucursalPrincipal,
        tipoCompaniaId:    editData.tipoCompaniaId ?? null,
        tipoEmpresa:       editData.tipoEmpresa,
        latitud:           editData.latitud,
        longitud:          editData.longitud,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editData, form]);

  async function handleSubmit(values: Record<string, unknown>) {
    const url    = isEdit ? `/api/companias/${editData!.id}` : "/api/companias";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      message.success(isEdit ? "Compañía actualizada" : "Compañía creada correctamente");
      onClose();
      router.refresh();
    } else {
      message.error("Error al guardar la compañía");
    }
  }

  return (
    <Modal
      open={open}
      title={
        <span>
          <BankOutlined style={{ marginRight: 8, color: "#722ed1" }} />
          {isEdit ? "Editar Compañía" : "Nueva Compañía"}
        </span>
      }
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={580}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Form.Item
          name="descripcion"
          label="Razón Social / Descripción"
          rules={[
            { required: true, message: "La descripción es requerida" },
            { min: 2, message: "Mínimo 2 caracteres" },
          ]}
        >
          <Input placeholder="Ej. Andina Logística Ltda." size="large" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={14}>
            <Form.Item name="sucursalPrincipal" label="Sucursal Principal">
              <Input placeholder="Ej. Santo Domingo - Sede Principal" />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="tipoCompaniaId" label="Tipo de Empresa">
              <TipoSelect
                endpoint="/api/tipos/companias"
                placeholder="Selecciona o crea..."
                color="#722ed1"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="latitud" label="Latitud">
              <InputNumber
                placeholder="18.4861"
                style={{ width: "100%" }}
                step={0.0001}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="longitud" label="Longitud">
              <InputNumber
                placeholder="-69.9312"
                style={{ width: "100%" }}
                step={0.0001}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "6px 16px", borderRadius: 6,
                border: "1px solid #d9d9d9", background: "#fff", cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "6px 20px", borderRadius: 6, border: "none",
                background: "#722ed1", color: "#fff", fontWeight: 600, cursor: "pointer",
              }}
            >
              {isEdit ? "Actualizar" : "Guardar Compañía"}
            </button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
