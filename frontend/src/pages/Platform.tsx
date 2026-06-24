import { Card, Col, Row, Statistic, Table, Typography, List, Tag, Space } from "antd";
import api from "../services/api";
import { useEffect, useState } from "react";
import {
  SafetyOutlined, ApiOutlined, DatabaseOutlined, MessageOutlined,
  FileTextOutlined, MenuOutlined, TeamOutlined,
} from "@ant-design/icons";

export default function Platform() {
  const [blueprint, setBlueprint] = useState<any>(null);

  useEffect(() => {
    api.get("/group/blueprint").then((r) => setBlueprint(r.data));
  }, []);

  const domains = blueprint?.domains || [];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3}>平台底座</Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card><Statistic title="业务域" value={domains.length} prefix={<MenuOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="API 接口" value="~60" prefix={<ApiOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="数据模型" value="30+" prefix={<DatabaseOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="安全策略" value="JWT+RBAC" prefix={<SafetyOutlined />} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="平台能力清单">
            <List size="small" dataSource={[
              "认证与授权：JWT Token、角色权限（RBAC）、用户管理",
              "主数据引擎：统一编码、版本管理、归属关联",
              "事件总线：订单→工单→报工→交付实时联动",
              "接口网关：RESTful API、统一错误处理、速率限制",
              "消息通知：邮件、站内信、企业微信通知",
              "日志审计：操作日志、接口调用记录、异常追踪",
            ]} renderItem={(item) => <List.Item>{item}</List.Item>} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="技术栈">
            <List size="small" dataSource={[
              "后端：FastAPI + SQLAlchemy + PostgreSQL",
              "前端：React 18 + Vite + Ant Design 5",
              "基础设施：Docker、Nginx、Redis",
              "集成：天工 OS、简道云、企业微信",
              "监控：应用日志、接口性能、异常报警",
            ]} renderItem={(item) => <List.Item>{item}</List.Item>} />
          </Card>
        </Col>
      </Row>

      <Card title="已接入模块">
        <Row gutter={[16, 16]}>
          {domains.map((d: any) => (
            <Col xs={24} sm={12} lg={6} key={d.name}>
              <Card size="small" title={d.name}>
                <List size="small" dataSource={d.items.slice(0, 4)} renderItem={(item: string) => <List.Item>{item}</List.Item>} />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="建设阶段">
        <Table rowKey="phase" pagination={false} dataSource={blueprint?.phases || []} columns={[
          { title: "阶段", dataIndex: "phase" },
          { title: "重点", dataIndex: "focus" },
        ]} />
      </Card>
    </Space>
  );
}
