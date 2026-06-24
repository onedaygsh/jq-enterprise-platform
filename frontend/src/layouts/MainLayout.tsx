import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Avatar, Dropdown, theme } from "antd";
import {
  DashboardOutlined,
  AimOutlined,
  ShopOutlined,
  AppstoreOutlined,
  DollarOutlined,
  TeamOutlined,
  TruckOutlined,
  DeploymentUnitOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  ClusterOutlined,
  ApartmentOutlined,
  BuildOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../stores/authStore";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "集团驾驶舱" },
  { key: "/group-blueprint", icon: <ClusterOutlined />, label: "平台蓝图" },
  { key: "/master-data", icon: <ApartmentOutlined />, label: "主数据中心" },
  { key: "/master-data-crud", icon: <BuildOutlined />, label: "主数据维护" },
  { key: "/manufacturing", icon: <DeploymentUnitOutlined />, label: "制造执行" },
  { key: "/strategy", icon: <AimOutlined />, label: "战略管理" },
  { key: "/business", icon: <ShopOutlined />, label: "经营管理" },
  { key: "/product", icon: <AppstoreOutlined />, label: "产品研发" },
  { key: "/supply-chain", icon: <TruckOutlined />, label: "供应链" },
  { key: "/finance", icon: <DollarOutlined />, label: "财务管理" },
  { key: "/talent", icon: <TeamOutlined />, label: "人才管理" },
  { key: "/platform", icon: <DeploymentUnitOutlined />, label: "平台底座" },
  { key: "/system", icon: <SettingOutlined />, label: "系统管理" },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { token: themeToken } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={260} theme="dark">
        <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: collapsed ? 14 : 18, fontWeight: 700 }}>
          {collapsed ? "鲸祺" : "鲸祺集团平台"}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header
          style={{
            background: themeToken.colorBgContainer,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: "#666" }}>鲸祺集团统一运营平台</span>
            <Dropdown menu={{ items: [{ key: "logout", icon: <LogoutOutlined />, label: "退出登录", onClick: handleLogout }] }}>
              <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar>{user?.full_name?.[0] || "J"}</Avatar>
                <span>{user?.full_name || "集团用户"}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: themeToken.colorBgContainer, borderRadius: 8, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
