import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Avatar, Dropdown, theme } from "antd";
import {
  DashboardOutlined, AimOutlined, ShopOutlined, AppstoreOutlined,
  DollarOutlined, TeamOutlined, TruckOutlined, DeploymentUnitOutlined,
  SettingOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined,
  ClusterOutlined, ApartmentOutlined, BuildOutlined, SafetyCertificateOutlined,
  ToolOutlined, DatabaseOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../stores/authStore";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { type: "group" as const, label: "集团总览" },
  { key: "/dashboard", icon: <DashboardOutlined />, label: "集团驾驶舱" },
  { key: "/group-blueprint", icon: <ClusterOutlined />, label: "平台蓝图" },

  { type: "group" as const, label: "主数据中心" },
  { key: "/master-data", icon: <ApartmentOutlined />, label: "主数据总览" },
  { key: "/master-data-crud", icon: <BuildOutlined />, label: "主数据维护" },

  { type: "group" as const, label: "核心业务" },
  { key: "/manufacturing", icon: <DeploymentUnitOutlined />, label: "制造执行" },
  { key: "/business", icon: <ShopOutlined />, label: "经营管理" },
  { key: "/supply-chain", icon: <TruckOutlined />, label: "供应链" },
  { key: "/product", icon: <AppstoreOutlined />, label: "产品研发" },
  { key: "/strategy", icon: <AimOutlined />, label: "战略管理" },

  { type: "group" as const, label: "支撑体系" },
  { key: "/finance", icon: <DollarOutlined />, label: "财务管理" },
  { key: "/talent", icon: <TeamOutlined />, label: "人才发展" },
  { key: "/platform", icon: <ToolOutlined />, label: "平台底座" },
  { key: "/system", icon: <SettingOutlined />, label: "系统管理" },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { token: themeToken } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={240} theme="dark" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: collapsed ? 15 : 17, fontWeight: 700, letterSpacing: 1 }}>
          {collapsed ? "鲸祺" : "🐳 鲸祺集团平台"}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: themeToken.colorBgContainer, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Dropdown menu={{ items: [{ key: "logout", icon: <LogoutOutlined />, label: "退出登录", onClick: () => { logout(); navigate("/login"); } }] }}>
              <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar size="small">{user?.full_name?.[0] || "J"}</Avatar>
                <span style={{ fontSize: 14 }}>{user?.full_name || "集团用户"}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 16, padding: 24, background: themeToken.colorBgContainer, borderRadius: 8, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
