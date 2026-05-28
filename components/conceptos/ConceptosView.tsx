"use client";

import { useRouter } from "next/navigation";
import { Table, Tag, Card, Typography, Space, Tabs, Button } from "antd";
import { RiseOutlined, FallOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ConceptoFormDialog } from "./ConceptoFormDialog";

const { Title, Text } = Typography;

interface Tipo    { id: number; descripcion: string }
interface Compania { id: number; descripcion: string; cliente: { nombre: string } }

interface Ingreso {
  id: number; descripcion: string; estado: boolean; observaciones: string | null;
  tipoIngreso:  Tipo | null;
  compania: Compania;
}

interface Descuento {
  id: number; descripcion: string; estado: boolean; observaciones: string | null;
  tipoDescuento: Tipo | null;
  compania: Compania;
}

interface Props {
  ingresos:   Ingreso[];
  descuentos: Descuento[];
  companias:  Compania[];
}

function makeColumns<T extends { estado: boolean; compania: Compania; observaciones: string | null }>(
  router: ReturnType<typeof useRouter>,
  tipoKey: "tipoIngreso" | "tipoDescuento",
  tagColor: "success" | "warning",
): ColumnsType<T> {
  return [
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      sorter: (a: Record<string, unknown>, b: Record<string, unknown>) =>
        String(a.descripcion).localeCompare(String(b.descripcion)),
      render: (t: string) => <Text strong>{t}</Text>,
    },
    {
      title: "Tipo",
      key: "tipo",
      sorter: (a: Record<string, unknown>, b: Record<string, unknown>) => {
        const ta = (a[tipoKey] as Tipo | null)?.descripcion ?? "";
        const tb = (b[tipoKey] as Tipo | null)?.descripcion ?? "";
        return ta.localeCompare(tb);
      },
      render: (_: unknown, r: Record<string, unknown>) => {
        const t = r[tipoKey] as Tipo | null;
        return t
          ? <Tag color={tagColor}>{t.descripcion}</Tag>
          : <Text type="secondary">—</Text>;
      },
    },
    {
      title: "Observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      render: (o: string | null) =>
        o ? <Text type="secondary">{o}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      width: 100,
      filters: [{ text: "Activo", value: true }, { text: "Inactivo", value: false }],
      onFilter: (v: unknown, r: Record<string, unknown>) => r.estado === v,
      render: (e: boolean) => <Tag color={e ? "green" : "default"}>{e ? "Activo" : "Inactivo"}</Tag>,
    },
    {
      title: "Compañía",
      key: "compania",
      sorter: (a: Record<string, unknown>, b: Record<string, unknown>) =>
        (a.compania as Compania).descripcion.localeCompare((b.compania as Compania).descripcion),
      render: (_: unknown, r: Record<string, unknown>) => <Text>{(r.compania as Compania).descripcion}</Text>,
    },
    {
      title: "Cliente",
      key: "cliente",
      render: (_: unknown, r: Record<string, unknown>) =>
        <Text type="secondary">{(r.compania as Compania).cliente.nombre}</Text>,
    },
    {
      title: "",
      key: "ver",
      align: "center",
      width: 70,
      render: (_: unknown, r: Record<string, unknown>) => (
        <Button type="link" size="small" icon={<EyeOutlined />}
          onClick={() => router.push(`/companias/${(r.compania as Compania).id}`)}>
          Ver
        </Button>
      ),
    },
  ];
}

export function ConceptosView({ ingresos, descuentos, companias }: Props) {
  const router = useRouter();

  const colIng = makeColumns(router, "tipoIngreso",  "success");
  const colDes = makeColumns(router, "tipoDescuento", "warning");

  const tabItems = [
    {
      key: "ingresos",
      label: (
        <Space>
          <RiseOutlined style={{ color: "#52c41a" }} />
          Ingresos <Tag color="success">{ingresos.length}</Tag>
        </Space>
      ),
      children: (
        <Table
          dataSource={ingresos} columns={colIng as ColumnsType<Ingreso>}
          rowKey="id" size="middle"
          pagination={{ pageSize: 12, showTotal: (t) => `${t} ingresos` }}
          locale={{ emptyText: "Sin ingresos registrados" }}
        />
      ),
    },
    {
      key: "descuentos",
      label: (
        <Space>
          <FallOutlined style={{ color: "#fa8c16" }} />
          Descuentos <Tag color="warning">{descuentos.length}</Tag>
        </Space>
      ),
      children: (
        <Table
          dataSource={descuentos} columns={colDes as ColumnsType<Descuento>}
          rowKey="id" size="middle"
          pagination={{ pageSize: 12, showTotal: (t) => `${t} descuentos` }}
          locale={{ emptyText: "Sin descuentos registrados" }}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Cabecera con botones globales */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Conceptos de Nómina</Title>
          <Space style={{ marginTop: 4 }}>
            <Tag icon={<RiseOutlined />} color="success">{ingresos.length} ingresos</Tag>
            <Tag icon={<FallOutlined />} color="warning">{descuentos.length} descuentos</Tag>
            <Text type="secondary">· {ingresos.length + descuentos.length} total</Text>
          </Space>
        </div>
        {/* Botones globales: muestran selector de compañía */}
        <Space>
          <ConceptoFormDialog variant="ingreso"   companias={companias} />
          <ConceptoFormDialog variant="descuento" companias={companias} />
        </Space>
      </div>

      <Card style={{ borderRadius: 12, border: "1px solid #f0f0f0" }}>
        <Tabs items={tabItems} size="large" />
      </Card>
    </div>
  );
}
