import { Card, Col, Row, List, Statistic, Typography, Space } from "antd";
import {
  UserOutlined, TeamOutlined, SafetyCertificateOutlined,
  MenuOutlined, SettingOutlined, AuditOutlined,
} from "@ant-design/icons";

export default function System() {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3}>系统管理</Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card><Statistic title="用户" value="--" prefix={<UserOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="角色" value="--" prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="权限策略" value="--" prefix={<SafetyCertificateOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="菜单项" value="14" prefix={<MenuOutlined />} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="用户管理">
            <List size="small" dataSource={[
              "用户注册与激活", "用户信息维护", "角色分配", "部门归属", "状态管理（启用/停用）"
            ]} renderItem={(item) => <List.Item>{item}</List.Item>} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="角色权限">
            <List size="small" dataSource={[
              "角色定义与维护", "菜单权限配置", "数据权限控制", "操作权限细粒度", "权限模板"
            ]} renderItem={(item) => <List.Item>{item}</List.Item>} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="系统配置">
            <List size="small" dataSource={[
              "菜单管理", "字典管理", "参数配置", "操作日志", "登录日志"
            ]} renderItem={(item) => <List.Item>{item}</List.Item>} />
          </Card>
        </Col>
      </Row>

      <Card title="组织架构">
        <List size="small" dataSource={[
          "鲸祺集团（集团级）→ 制造事业部 / 供应链事业部（事业部级）",
          "一厂（东莞）/ 二厂（惠州）（工厂级）",
          "注塑车间 / 装配车间 / 包装车间（车间级）",
          "A线 / B线 / C线 / D线（产线级）",
        ]} renderItem={(item) => <List.Item>{item}</List.Item>} />
      </Card>

      <Card title="安全策略">
        <List size="small" dataSource={[
          "认证方式：JWT Token 认证，支持过期刷新",
          "权限模型：RBAC（基于角色的访问控制）",
          "数据隔离：按组织层级数据过滤",
          "接口安全：CORS 白名单、请求频率限制",
        ]} renderItem={(item) => <List.Item>{item}</List.Item>} />
      </Card>
    </Space>
  );
}
