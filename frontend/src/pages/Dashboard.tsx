import { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Statistic, Table, Tag, Typography, List, Space, Progress, Alert, Drawer, Tree } from "antd";
import {
  AimOutlined,
  DashboardOutlined,
  DollarOutlined,
  DatabaseOutlined,
  ApartmentOutlined,
  BuildOutlined,
  ToolOutlined,
  TruckOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import api from "../services/api";

type Node = { name: string; code: string; children?: Node[] };
type Blueprint = { domains: { name: string; items: string[] }[]; phases: { phase: string; focus: string }[] };

const toTree = (node: Node): any => ({ title: `${node.name} (${node.code})`, key: node.code, children: node.children?.map(toTree) });

export default function Dashboard() {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [masterData, setMasterData] = useState<any>(null);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [mfg, setMfg] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [focusNode, setFocusNode] = useState<{ level: string; name: string; code: string } | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/group/blueprint"),
      api.get("/group/master-data"),
      api.get("/group/master-data/hierarchy"),
      api.get("/manufacturing/oee"),
      api.get("/business/orders"),
    ]).then(([bp, md, hi, oee, ord]) => {
      setBlueprint(bp.data);
      setMasterData(md.data);
      setHierarchy(hi.data);
      setMfg(oee.data);
      setOrders(ord.data || []);
    });
  }, []);

  const md = masterData?.records || {};
  const latestOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const groupTreeData = hierarchy?.group ? [toTree(hierarchy.group)] : [];

  const openFocus = (level: string, name: string, code: string) => {
    setFocusNode({ level, name, code });
    setDrawerOpen(true);
  };

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={2} style={{ marginBottom: 8 }}>鲸祺集团统一运营平台</Typography.Title>
        <Typography.Paragraph style={{ marginBottom: 0, maxWidth: 960 }}>
          这是集团级总览页，向下可穿透到工厂、车间、产线和设备。
        </Typography.Paragraph>
      </div>

      <Alert type="info" showIcon message="当前系统状态" description="主数据 CRUD、订单→工单→报工、设备采集、自动报警、OEE 汇总都已接入。" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="集团模块" value={8} prefix={<DatabaseOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="主数据对象" value={6} prefix={<ApartmentOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="制造链对象" value={4} prefix={<BuildOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="当前 OEE" value={`${mfg?.oee ?? 0}%`} prefix={<BarChartOutlined />} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="全景模块">
            <Row gutter={[16, 16]}>
              {[
                { title: "战略管理", icon: <AimOutlined />, desc: "OKR、执行跟踪、经营目标", color: "#1677ff", level: "集团" },
                { title: "经营管理", icon: <DashboardOutlined />, desc: "订单、客户、回款、交付", color: "#13c2c2", level: "集团" },
                { title: "主数据中心", icon: <ApartmentOutlined />, desc: "组织、工厂、产线、物料、BOM、设备", color: "#722ed1", level: "集团" },
                { title: "制造执行", icon: <BuildOutlined />, desc: "工单、报工、采集、报警", color: "#fa541c", level: "工厂" },
                { title: "质量管理", icon: <SafetyCertificateOutlined />, desc: "检验、异常、追溯", color: "#faad14", level: "车间" },
                { title: "供应链", icon: <TruckOutlined />, desc: "采购、库存、批次、仓储", color: "#52c41a", level: "集团" },
                { title: "财务管理", icon: <DollarOutlined />, desc: "预算、费用、收入、成本", color: "#722ed1", level: "集团" },
                { title: "平台底座", icon: <ToolOutlined />, desc: "权限、接口、主数据、日志", color: "#08979c", level: "集团" },
              ].map((item) => (
                <Col xs={24} sm={12} key={item.title}>
                  <Card size="small" hoverable onClick={() => openFocus(item.level, item.title, item.title)} style={{ borderLeft: `4px solid ${item.color}`, cursor: "pointer" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ color: item.color, fontSize: 22 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.title}</div>
                        <div style={{ color: "#666", marginTop: 4 }}>{item.desc}</div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="建设路线">
            <List
              dataSource={blueprint?.phases || []}
              renderItem={(item: any) => (
                <List.Item>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.phase}</div>
                    <div style={{ color: "#666" }}>{item.focus}</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="四级穿透导航">
            <Tree
              defaultExpandAll
              treeData={groupTreeData}
              onSelect={(_, info) => {
                const node = info.node as any;
                const key = String(node.key);
                const level = key.startsWith("F") ? "工厂" : key.startsWith("W") ? "车间" : key.startsWith("L") ? "产线" : "集团";
                openFocus(level, String(node.title), key);
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="关键业务链">
            <List
              dataSource={[
                "订单链：销售订单 → 工单 → 报工 → 交付 → 回款",
                "物料链：BOM → 采购 → 入库 → 发料 → 消耗 → 库存",
                "质量链：来料检 → 过程检 → 成品检 → 追溯 → 处置",
                "设备链：台账 → 采集 → OEE → 报警 → 维修",
              ]}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="主数据摘要">
            <Table
              pagination={false}
              rowKey="name"
              dataSource={[
                { name: "工厂", count: md.factories?.length || 0 },
                { name: "车间", count: md.workshops?.length || 0 },
                { name: "产线", count: md.lines?.length || 0 },
                { name: "物料", count: md.materials?.length || 0 },
                { name: "BOM", count: md.boms?.length || 0 },
                { name: "设备", count: md.equipments?.length || 0 },
              ]}
              columns={[{ title: "对象", dataIndex: "name" }, { title: "数量", dataIndex: "count" }]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="制造与设备">
            <Row gutter={[16, 16]}>
              <Col span={12}><Card size="small"><Statistic title="设备采集数" value={mfg?.snapshot_count || 0} prefix={<ThunderboltOutlined />} /></Card></Col>
              <Col span={12}><Card size="small"><Statistic title="质量" value={`${mfg?.quality ?? 0}%`} prefix={<SafetyCertificateOutlined />} /></Card></Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Progress percent={mfg?.availability ?? 0} status="active" />
              <div style={{ marginTop: 8, color: "#666" }}>可用率 / Performance / Quality / OEE 汇总</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最新订单">
            <Table
              pagination={false}
              rowKey="id"
              dataSource={latestOrders}
              columns={[
                { title: "订单号", dataIndex: "order_no" },
                { title: "金额", dataIndex: "final_amount" },
                { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="产线与设备分布">
            <Table
              pagination={false}
              rowKey="code"
              dataSource={md.lines || []}
              columns={[{ title: "产线", dataIndex: "name" }, { title: "节拍", dataIndex: "takt_time" }, { title: "状态", dataIndex: "status" }]}
            />
          </Card>
        </Col>
      </Row>

      <Drawer title={focusNode ? `${focusNode.level}驾驶舱` : "穿透详情"} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}>
        {focusNode && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card>
              <Statistic title="当前层级" value={focusNode.level} />
              <div style={{ marginTop: 8, color: "#666" }}>{focusNode.name}</div>
            </Card>
            <Card title="可见指标">
              <List dataSource={["产量", "良率", "OEE", "报警数", "工单达成率", "设备停机时长"]} renderItem={(item) => <List.Item>{item}</List.Item>} />
            </Card>
            <Card title="可下钻动作">
              <List dataSource={["点击上一层查看全局", "按工厂查看车间", "按车间查看产线", "按产线查看设备与报警"]} renderItem={(item) => <List.Item>{item}</List.Item>} />
            </Card>
          </Space>
        )}
      </Drawer>
    </Space>
  );
}
