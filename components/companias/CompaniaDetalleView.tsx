"use client";

import { useRouter } from "next/navigation";
import { Row, Col, Card, Statistic, Breadcrumb, Tag, Typography, Space, Divider } from "antd";
import { BankOutlined, EnvironmentOutlined, RiseOutlined, FallOutlined, HomeOutlined } from "@ant-design/icons";
import { ConceptosList } from "@/components/conceptos/ConceptosList";
import { ConceptoFormDialog } from "@/components/conceptos/ConceptoFormDialog";

const { Title, Text } = Typography;

export interface ConceptoDetalle {
  pivotId:       number;
  ingresoId?:    number;
  descuentoId?:  number;
  descripcion:   string;
  tipo:          string | null;
  observaciones: string | null;
  estado:        boolean;
  activo:        boolean;
}

interface Props {
  compania: {
    id:                number;
    descripcion:       string;
    sucursalPrincipal: string | null;
    tipoEmpresa:       string | null;
    fechaCreacion:     string;
    ingresos:          ConceptoDetalle[];
    descuentos:        ConceptoDetalle[];
  };
}

export function CompaniaDetalleView({ compania }: Props) {
  const router = useRouter();
  const activos =
    compania.ingresos.filter((i) => i.activo).length +
    compania.descuentos.filter((d) => d.activo).length;

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <HomeOutlined />, onClick: () => router.push("/"),          style: { cursor: "pointer" } },
          { title: "Compañías",     onClick: () => router.push("/companias"),  style: { cursor: "pointer" } },
          { title: compania.descripcion },
        ]}
      />

      <Card style={{ borderRadius: 12, marginBottom: 20, border: "1px solid #f0f0f0" }} styles={{ body: { padding: "20px 24px" } }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: "linear-gradient(135deg, #722ed1, #531dab)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 18, fontWeight: 800, flexShrink: 0,
            }}>
              {compania.descripcion.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>{compania.descripcion}</Title>
              <Space size={12} wrap>
                {compania.tipoEmpresa && <Tag color="purple">{compania.tipoEmpresa}</Tag>}
                {compania.sucursalPrincipal && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <EnvironmentOutlined style={{ marginRight: 4 }} />{compania.sucursalPrincipal}
                  </Text>
                )}
              </Space>
            </div>
          </div>
          <Space>
            <ConceptoFormDialog companiaId={compania.id} variant="ingreso"   />
            <ConceptoFormDialog companiaId={compania.id} variant="descuento" />
          </Space>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        <Row gutter={32}>
          <Col>
            <Statistic title="Ingresos" value={compania.ingresos.length}
              prefix={<RiseOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: 22 }} />
          </Col>
          <Col>
            <Statistic title="Descuentos" value={compania.descuentos.length}
              prefix={<FallOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16", fontSize: 22 }} />
          </Col>
          <Col>
            <Statistic title="Total" value={compania.ingresos.length + compania.descuentos.length}
              prefix={<BankOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff", fontSize: 22 }} />
          </Col>
          <Col>
            <Statistic title="Activos" value={activos} valueStyle={{ fontSize: 22 }} />
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={24} xl={12}>
          <Card
            title={<Space><RiseOutlined style={{ color: "#52c41a" }} /><span style={{ color: "#52c41a", fontWeight: 600 }}>Ingresos ({compania.ingresos.length})</span></Space>}
            style={{ borderRadius: 12, border: "1px solid #b7eb8f" }}
            styles={{ header: { background: "#f6ffed", borderBottom: "1px solid #b7eb8f" } }}
          >
            <ConceptosList
              items={compania.ingresos.map((i) => ({
                id:            i.ingresoId!,
                pivotId:       i.pivotId,
                descripcion:   i.descripcion,
                tipo:          i.tipo,
                estado:        i.estado,
                activo:        i.activo,
                observaciones: i.observaciones,
              }))}
              variant="ingreso"
              companiaId={compania.id}
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card
            title={<Space><FallOutlined style={{ color: "#fa8c16" }} /><span style={{ color: "#fa8c16", fontWeight: 600 }}>Descuentos ({compania.descuentos.length})</span></Space>}
            style={{ borderRadius: 12, border: "1px solid #ffd591" }}
            styles={{ header: { background: "#fff7e6", borderBottom: "1px solid #ffd591" } }}
          >
            <ConceptosList
              items={compania.descuentos.map((d) => ({
                id:            d.descuentoId!,
                pivotId:       d.pivotId,
                descripcion:   d.descripcion,
                tipo:          d.tipo,
                estado:        d.estado,
                activo:        d.activo,
                observaciones: d.observaciones,
              }))}
              variant="descuento"
              companiaId={compania.id}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
