"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Layout, Menu, Avatar,
  Typography, ConfigProvider,
} from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const SIDEBAR_COLOR = "rgb(63, 156, 84)";
const SIDEBAR_DARK  = "rgb(45, 120, 63)";   // hover / selected

const NAV_ITEMS = [
  { key: "/",          icon: <DashboardOutlined />, label: "Dashboard"  },
  { key: "/clientes",  icon: <TeamOutlined />,      label: "Clientes"   },
  { key: "/companias", icon: <BankOutlined />,      label: "Compañías"  },
  { key: "/conceptos", icon: <FileTextOutlined />,  label: "Conceptos"  },
  { key: "/catalogos", icon: <AppstoreOutlined />,  label: "Catálogos"  },
];

const PAGE_TITLES: Record<string, string> = {
  "/":          "Dashboard",
  "/clientes":  "Clientes",
  "/companias": "Compañías",
  "/conceptos": "Conceptos de Nómina",
  "/catalogos": "Catálogos",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  const activeKey = NAV_ITEMS.find(
    (i) => i.key !== "/" && pathname.startsWith(i.key)
  )?.key ?? "/";

  const pageTitle = PAGE_TITLES[activeKey] ?? "SPN";

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: SIDEBAR_COLOR,
          borderRadius: 8,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
        components: {
          Menu: {
            darkItemBg:        SIDEBAR_COLOR,
            darkSubMenuItemBg: SIDEBAR_DARK,
            darkItemSelectedBg: SIDEBAR_DARK,
            darkItemHoverBg:   "rgba(0,0,0,0.12)",
          },
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>

        {/* ── SIDEBAR ── */}
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={240}
          style={{
            background: SIDEBAR_COLOR,
            position: "fixed",
            insetInlineStart: 0,
            top: 0,
            bottom: 0,
            scrollbarWidth: "thin",
            zIndex: 100,
            boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          }}
        >
          {/* ── Brand ── */}
          <div
            style={{
              height: collapsed ? 72 : 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: collapsed ? "8px 0" : "12px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.18)",
              transition: "height 0.2s, padding 0.2s",
              overflow: "hidden",
            }}
          >
            {collapsed ? (
              /* Collapsed: ícono cuadrado con fondo blanco semitransparente */
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.95)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <Image
                  src="/logo.png"
                  alt="SPN Software"
                  width={38}
                  height={38}
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            ) : (
              /* Expanded: logo completo sobre fondo blanco redondeado */
              <div
                style={{
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: 12,
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Image
                  src="/logo.png"
                  alt="SPN Software"
                  width={160}
                  height={72}
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            )}
          </div>

          {/* ── Navigation ── */}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[activeKey]}
            items={NAV_ITEMS}
            onClick={({ key }) => router.push(key)}
            style={{
              marginTop: 8,
              border: "none",
              background: "transparent",
            }}
          />

          {/* ── User (footer) ── */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "12px 16px",
              borderTop: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "4px 6px",
            }}>
              <Avatar
                size={30}
                style={{
                  background: "rgba(255,255,255,0.28)",
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                }}
              >
                AD
              </Avatar>
              {!collapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}>
                    Administrador
                  </div>
                  <div style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 11,
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    admin@spn.com
                  </div>
                </div>
              )}
            </div>
          </div>
        </Sider>

        {/* ── MAIN AREA ── */}
        <Layout style={{ marginInlineStart: collapsed ? 80 : 240, transition: "margin 0.2s" }}>

          {/* ── Header ── */}
          <Header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 99,
              padding: "0 24px",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              height: 64,
            }}
          >
            {/* Izquierda: toggle + título */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: 18,
                  cursor: "pointer",
                  color: "#595959",
                  padding: "6px 8px",
                  borderRadius: 6,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#f5f5f5";
                  (e.currentTarget as HTMLDivElement).style.color = SIDEBAR_COLOR;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  (e.currentTarget as HTMLDivElement).style.color = "#595959";
                }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
              <Text strong style={{ fontSize: 16, color: "#262626" }}>
                {pageTitle}
              </Text>
            </div>

            {/* Derecha: avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 1, height: 28, background: "#e8e8e8" }} />
              <Avatar
                size={36}
                style={{
                  background: SIDEBAR_COLOR,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                AD
              </Avatar>
            </div>
          </Header>

          {/* ── Contenido ── */}
          <Content className="page-content">{children}</Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
