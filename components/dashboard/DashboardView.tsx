"use client";

import { useRouter } from "next/navigation";
import {
  Row, Col, Card, Statistic, Table, Tag, Button,
  Typography, Space, Avatar,
} from "antd";
import {
  BankOutlined,
  RiseOutlined,
  FallOutlined,
  ArrowRightOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

interface Stats {
  totalCompanias: number;
  totalIngresos:  number;
  totalDescuentos: number;
}

interface Compania {
  id:                number;
  descripcion:       string;
  sucursalPrincipal: string | null;
  tipoEmpresa:       string | null;
  fechaCreacion:     string;
  _count:            { conceptos: number };
}

interface Props {
  stats:            Stats;
  ultimasCompanias: Compania[];
}

const STAT_CARDS = (s: Stats) => [
  {
    title:  "Compañías",
    value:  s.totalCompanias,
    icon:   <BankOutlined />,
    color:  "#722ed1",
    bg:     "#f9f0ff",
    suffix: "registradas",
    href:   "/companias",
  },
  {
    title:  "Ingresos en Catálogo",
    value:  s.totalIngresos,
    icon:   <RiseOutlined />,
    color:  "#52c41a",
    bg:     "#f6ffed",
    suffix: "conceptos activos",
    href:   "/conceptos",
  },
  {
    title:  "Descuentos en Catálogo",
    value:  s.totalDescuentos,
    icon:   <FallOutlined />,
    color:  "#fa8c16",
    bg:     "#fff7e6",
    suffix: "conceptos activos",
    href:   "/conceptos",
  },
];

const columns: ColumnsType<Compania> = [
  {
    title:     "Compañía",
    dataIndex: "descripcion",
    key:       "descripcion",
    render: (text: string, record: Compania) => (
      <Space>
        <Avatar
          size={36}
          style={{
            background: "linear-gradient(135deg, #722ed1, #531dab)",
            fontSize:   12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {text.slice(0, 2).toUpperCase()}
        </Avatar>
        <div>
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.sucursalPrincipal ?? "Sin sucursal"}
          </Text>
        </div>
      </Space>
    ),
  },
  {
    title:     "Tipo",
    dataIndex: "tipoEmpresa",
    key:       "tipoEmpresa",
    render: (tipo: string | null) =>
      tipo ? <Tag color="purple">{tipo}</Tag> : <Text type="secondary">—</Text>,
  },
  {
    title:  "Conceptos",
    key:    "conceptos",
    align:  "center" as const,
    render: (_: unknown, r: Compania) => (
      <Tag color="geekblue" style={{ fontWeight: 600 }}>
        {r._count.conceptos}
      </Tag>
    ),
  },
  {
    title:     "Alta",
    dataIndex: "fechaCreacion",
    key:       "fechaCreacion",
    render: (d: string) =>
      new Date(d).toLocaleDateString("es-DO", {
        day: "2-digit", month: "short", year: "numeric",
      }),
  },
];

export function DashboardView({ stats, ultimasCompanias }: Props) {
  const router = useRouter();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Resumen General</Title>
        <Text type="secondary">
          Vista consolidada de compañías y catálogos de ingresos/descuentos
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {STAT_CARDS(stats).map((card) => (
          <Col xs={24} sm={12} xl={8} key={card.title}>
            <Card
              className="stat-card"
              onClick={() => router.push(card.href)}
              style={{ cursor: "pointer", borderRadius: 12, border: "1px solid #f0f0f0" }}
              styles={{ body: { padding: "20px 24px" } }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>{card.title}</Text>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 32, fontWeight: 700, color: "#262626", lineHeight: 1 }}>
                      {card.value}
                    </span>
                    <Text type="secondary" style={{ fontSize: 12 }}>{card.suffix}</Text>
                  </div>
                </div>
                <div style={{
                  width:  44, height: 44, borderRadius: 10,
                  background: card.bg, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 20, color: card.color,
                }}>
                  {card.icon}
                </div>
              </div>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 4 }}>
                <ArrowRightOutlined style={{ fontSize: 11, color: card.color }} />
                <Text style={{ fontSize: 12, color: card.color }}>Ver detalle</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={
          <Space>
            <BankOutlined style={{ color: "#722ed1" }} />
            <span>Últimas Compañías Registradas</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              style={{ background: "#722ed1", borderColor: "#722ed1" }}
              onClick={() => router.push("/companias")}
            >
              Nueva Compañía
            </Button>
            <Button size="small" onClick={() => router.push("/companias")}>
              Ver todas
            </Button>
          </Space>
        }
        style={{ borderRadius: 12, border: "1px solid #f0f0f0" }}
        styles={{ header: { borderBottom: "1px solid #f5f5f5" } }}
      >
        <Table
          dataSource={ultimasCompanias}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
          onRow={(record) => ({
            onClick: () => router.push(`/companias/${record.id}`),
            style:   { cursor: "pointer" },
          })}
          locale={{ emptyText: "Sin compañías registradas aún" }}
        />
      </Card>
    </div>
  );
}
