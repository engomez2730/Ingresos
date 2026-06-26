"use client";

import { Table, Tag, Card, Typography, Space, Tabs } from "antd";
import { RiseOutlined, FallOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

interface Tipo { id: number; descripcion: string }

interface IngresoRow {
  id:            number;
  descripcion:   string;
  estado:        boolean;
  observaciones: string | null;
  tipoIngreso:   Tipo | null;
  _count:        { companias: number };
}

interface DescuentoRow {
  id:             number;
  descripcion:    string;
  estado:         boolean;
  observaciones:  string | null;
  tipoDescuento:  Tipo | null;
  _count:         { companias: number };
}

interface Props {
  ingresos:   IngresoRow[];
  descuentos: DescuentoRow[];
}

const baseColumns = (tipoKey: "tipoIngreso" | "tipoDescuento", tagColor: "success" | "warning") =>
  [
    {
      title:     "Descripción",
      dataIndex: "descripcion",
      key:       "descripcion",
      sorter:    (a: { descripcion: string }, b: { descripcion: string }) =>
        a.descripcion.localeCompare(b.descripcion),
      render: (t: string) => <Text strong>{t}</Text>,
    },
    {
      title: "Tipo",
      key:   "tipo",
      render: (_: unknown, r: Record<string, unknown>) => {
        const t = r[tipoKey] as Tipo | null;
        return t
          ? <Tag color={tagColor}>{t.descripcion}</Tag>
          : <Text type="secondary">—</Text>;
      },
    },
    {
      title:     "Observaciones",
      dataIndex: "observaciones",
      key:       "observaciones",
      render:    (o: string | null) =>
        o ? <Text type="secondary">{o}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title:     "Estado",
      dataIndex: "estado",
      key:       "estado",
      align:     "center" as const,
      width:     100,
      filters:   [{ text: "Activo", value: true }, { text: "Inactivo", value: false }],
      onFilter:  (v: unknown, r: Record<string, unknown>) => r.estado === v,
      render:    (e: boolean) => <Tag color={e ? "green" : "default"}>{e ? "Activo" : "Inactivo"}</Tag>,
    },
    {
      title: "Compañías",
      key:   "companias",
      align: "center" as const,
      width: 100,
      sorter: (a: { _count: { companias: number } }, b: { _count: { companias: number } }) =>
        a._count.companias - b._count.companias,
      render: (_: unknown, r: { _count: { companias: number } }) => (
        <Tag color="geekblue" style={{ fontWeight: 600 }}>
          {r._count.companias}
        </Tag>
      ),
    },
  ] as ColumnsType<IngresoRow | DescuentoRow>;

export function ConceptosView({ ingresos, descuentos }: Props) {
  const tabItems = [
    {
      key:   "ingresos",
      label: (
        <Space>
          <RiseOutlined style={{ color: "#52c41a" }} />
          Ingresos <Tag color="success">{ingresos.length}</Tag>
        </Space>
      ),
      children: (
        <Table
          dataSource={ingresos}
          columns={baseColumns("tipoIngreso", "success") as ColumnsType<IngresoRow>}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 12, showTotal: (t) => `${t} ingresos` }}
          locale={{ emptyText: "Catálogo de ingresos vacío" }}
        />
      ),
    },
    {
      key:   "descuentos",
      label: (
        <Space>
          <FallOutlined style={{ color: "#fa8c16" }} />
          Descuentos <Tag color="warning">{descuentos.length}</Tag>
        </Space>
      ),
      children: (
        <Table
          dataSource={descuentos}
          columns={baseColumns("tipoDescuento", "warning") as ColumnsType<DescuentoRow>}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 12, showTotal: (t) => `${t} descuentos` }}
          locale={{ emptyText: "Catálogo de descuentos vacío" }}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Catálogo de Conceptos</Title>
        <Space style={{ marginTop: 4 }}>
          <Tag icon={<RiseOutlined />} color="success">{ingresos.length} ingresos</Tag>
          <Tag icon={<FallOutlined />} color="warning">{descuentos.length} descuentos</Tag>
          <Text type="secondary">· Los conceptos se asignan desde el detalle de cada compañía</Text>
        </Space>
      </div>

      <Card style={{ borderRadius: 12, border: "1px solid #f0f0f0" }}>
        <Tabs items={tabItems} size="large" />
      </Card>
    </div>
  );
}
