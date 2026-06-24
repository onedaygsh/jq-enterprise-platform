import { useEffect, useState, useMemo } from "react";
import { Row, Col, Card, Statistic, Table, Tag, Typography, Space, Progress, Badge, List, Divider, Spin } from "antd";
import {
  DollarOutlined, ShoppingCartOutlined, BarChartOutlined, AlertOutlined,
  ApartmentOutlined, ThunderboltOutlined, RiseOutlined, FallOutlined,
  EnvironmentOutlined, ClockCircleOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import api from "../services/api";

const COLORS = ["#1677ff", "#13c2c2", "#52c41a", "#faad14", "#fa541c", "#722ed1"];

const statusColors: Record<string, string> = { pending: "default", in_production: "processing", completed: "green", cancelled: "red", draft: "default" };

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [masterData, setMasterData] = useState<any>(null);
  const [oee, setOee] = useState<any>(null);
  const [alarms, setAlarms] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/business/orders"), api.get("/group/blueprint"),
      api.get("/group/master-data"), api.get("/manufacturing/oee"),
      api.get("/manufacturing/alarms"),
    ]).then(([ord, bp, md, o, al]) => {
      setOrders(ord.data || []); setBlueprint(bp.data); setMasterData(md.data);
      setOee(o.data); setAlarms(al.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const md = masterData?.records || {};

  const stats = useMemo(() => ({
    revenue: orders.reduce((s: number, o: any) => s + (o.final_amount || 0), 0),
    orderCount: orders.length,
    activeOrders: orders.filter((o: any) => !["completed", "cancelled"].includes(o.status)).length,
    completedOrders: orders.filter((o: any) => o.status === "completed").length,
    openAlarms: alarms.filter((a: any) => a.status === "open").length,
    factories: (md.factories || []).length,
    lines: (md.lines || []).length,
    equipments: (md.equipments || []).length,
  }), [orders, alarms, md]);

  const orderTrend = useMemo(() => {
    const m = new Map<string, number>();
    orders.forEach((o: any) => {
      const d = o.created_at ? new Date(o.created_at).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) : "N/A";
      m.set(d, (m.get(d) || 0) + 1);
    });
    return Array.from(m.entries()).slice(-7).map(([k, v]) => ({ name: k, value: v }));
  }, [orders]);

  const statusDist = useMemo(() => {
    const m = new Map<string, number>();
    orders.forEach((o: any) => m.set(o.status || "unknown", (m.get(o.status) || 0) + 1));
    return Array.from(m.entries()).map(([k, v]) => ({ name: k, value: v }));
  }, [orders]);

  const factoryOEE = useMemo(() => [
    { name: "\u4e00\u5382", value: 78.5 },
    { name: "\u4e8c\u5382", value: 65.2 },
  ], []);

  if (loading) return <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" tip="\u52a0\u8f7d\u96c6\u56e2\u6570\u636e\u4e2d..." /></div>;

  return (
    <div style={{ margin: -24 }}>
      {/* ---- Top KPI Bar ---- */}
      <div style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #1a3a4a 100%)", padding: "24px 32px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <Typography.Title level={2} style={{ color: "#fff", margin: 0, fontWeight: 700 }}>\u9cb8\u797a\u96c6\u56e2\u7edf\u4e00\u8fd0\u8425\u5e73\u53f0</Typography.Title>
            <Typography.Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>ERP / MES / WMS / QMS / EAM \u4e00\u4f53\u5316\u00a0\u00a0|\u00a0\u00a0\u5b9e\u65f6\u66f4\u65b0</Typography.Text>
          </div>
          <Space>
            <Tag color="green" style={{ fontSize: 13, padding: "4px 12px" }}>\u25cf \u7cfb\u7edf\u6b63\u5e38</Tag>
            <Tag style={{ fontSize: 13, padding: "4px 12px", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff" }}>
              <ClockCircleOutlined /> {new Date().toLocaleTimeString("zh-CN")}
            </Tag>
          </Space>
        </div>
        <Row gutter={[24, 16]}>
          {[
            { title: "\u8425\u4e1a\u6536\u5165", value: stats.revenue.toFixed(0), prefix: "\u00a5", icon: <DollarOutlined />, color: "#52c41a", trend: "+12%" },
            { title: "\u8ba2\u5355\u603b\u6570", value: stats.orderCount, icon: <ShoppingCartOutlined />, color: "#1677ff", suffix: `\u8fdb\u884c\u4e2d ${stats.activeOrders}` },
            { title: "\u96c6\u56e2 OEE", value: `${oee?.oee ?? 0}%`, icon: <BarChartOutlined />, color: "#faad14", suffix: `\u826f\u7387 ${oee?.quality ?? 0}%` },
            { title: "\u5f85\u5904\u7406\u62a5\u8b66", value: stats.openAlarms, icon: <AlertOutlined />, color: stats.openAlarms ? "#fa541c" : "#52c41a" },
          ].map((item) => (
            <Col xs={12} sm={6} key={item.title}>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "16px 20px", backdropFilter: "blur(10px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: item.color, fontSize: 18 }}>{item.icon}</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{item.title}</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                  {item.value}
                  {item.prefix && <span style={{ fontSize: 18, fontWeight: 400, marginRight: 2 }}>{item.prefix}</span>}
                </div>
                {(item.suffix || item.trend) && (
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                    {item.trend && <span style={{ color: item.trend.startsWith("+") ? "#52c41a" : "#fa541c" }}>{item.trend} </span>}
                    {item.suffix}
                  </div>
                )}
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* ---- Content ---- */}
      <div style={{ padding: "20px 32px", background: "#f5f6f8", minHeight: "calc(100vh - 280px)" }}>
        <Row gutter={[20, 20]}>
          {/* ---- Factory Cards ---- */}
          <Col xs={24}>
            <Row gutter={[20, 20]}>
              {(md.factories || []).map((f: any, i: number) => (
                <Col xs={24} sm={12} lg={6} key={f.code}>
                  <Card hoverable size="small" style={{ borderTop: `3px solid ${COLORS[i % COLORS.length]}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{f.name}</div>
                        <div style={{ color: "#999", fontSize: 12 }}>{f.code} \u00b7 {f.location}</div>
                      </div>
                      <Tag color={f.status === "\u542f\u7528" ? "green" : "default"}>{f.status}</Tag>
                    </div>
                    <Divider style={{ margin: "12px 0" }} />
                    <Row gutter={8}>
                      <Col span={8}><Statistic title="OEE" value={f.code === "F001" ? "78.5%" : "65.2%"} valueStyle={{ fontSize: 16 }} /></Col>
                      <Col span={8}><Statistic title="\u4ea7\u7ebf" value={(md.lines || []).filter((l: any) => l.workshop && (md.workshops || []).find((w: any) => w.name === l.workshop && w.factory === f.name)).length} valueStyle={{ fontSize: 16 }} /></Col>
                      <Col span={8}><Statistic title="\u8bbe\u5907" value={(md.equipments || []).filter((e: any) => {
                        const l = (md.lines || []).find((ll: any) => ll.name === e.line);
                        return l && (md.workshops || []).find((w: any) => w.name === l.workshop && w.factory === f.name);
                      }).length} valueStyle={{ fontSize: 16 }} /></Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>

          {/* ---- Charts Row ---- */}
          <Col xs={24} lg={16}>
            <Card title={"\u8ba2\u5355\u8d8b\u52bf\uff08\u8fd1 7 \u65e5\uff09"} size="small">
              {orderTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={orderTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" name="\u8ba2\u5355\u6570" fill="#1677ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>\u6682\u65e0\u8ba2\u5355\u6570\u636e</div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title={"\u8ba2\u5355\u72b6\u6001\u5206\u5e03"} size="small">
              {statusDist.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>\u6682\u65e0\u6570\u636e</div>
              )}
            </Card>
          </Col>

          {/* ---- OEE Comparison ---- */}
          <Col xs={24} lg={12}>
            <Card title={"\u5de5\u5382 OEE \u5bf9\u6bd4"} size="small">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={factoryOEE} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} unit="%" fontSize={12} />
                  <YAxis type="category" dataKey="name" fontSize={13} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Bar dataKey="value" name="OEE" radius={[0, 4, 4, 0]}>
                    {factoryOEE.map((_, i) => <Cell key={i} fill={_.value >= 75 ? "#52c41a" : _.value >= 60 ? "#faad14" : "#fa541c"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* ---- Alarm Feed ---- */}
          <Col xs={24} lg={12}>
            <Card title={"\u5b9e\u65f6\u62a5\u8b66"} size="small" extra={<Badge count={stats.openAlarms} overflowCount={99} />}>
              {alarms.length === 0 ? (
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>\u6682\u65e0\u62a5\u8b66</div>
              ) : (
                <List size="small" style={{ maxHeight: 260, overflow: "auto" }}
                  dataSource={alarms.slice(0, 6)}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<AlertOutlined style={{ color: item.severity === "high" ? "#fa541c" : "#faad14", fontSize: 16 }} />}
                        title={<span>{item.title} <Tag color={item.status === "open" ? "red" : "green"} style={{ marginLeft: 8 }}>{item.status === "open" ? "\u672a\u5904\u7406" : "\u5df2\u5904\u7406"}</Tag></span>}
                        description={<span style={{ fontSize: 12 }}>{item.alarm_type} \u00b7 {item.content}</span>}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          {/* ---- Recent Orders ---- */}
          <Col xs={24} lg={14}>
            <Card title={"\u6700\u65b0\u8ba2\u5355"} size="small">
              <Table rowKey="id" pagination={false} size="small" dataSource={orders.slice(0, 8)}
                columns={[
                  { title: "\u8ba2\u5355\u53f7", dataIndex: "order_no", render: (v: string) => <Typography.Text code>{v}</Typography.Text> },
                  { title: "\u5ba2\u6237ID", dataIndex: "customer_id" },
                  { title: "\u91d1\u989d", dataIndex: "final_amount", render: (v: number) => <Typography.Text strong>\u00a5{v?.toLocaleString()}</Typography.Text> },
                  { title: "\u72b6\u6001", dataIndex: "status", render: (v: string) => <Tag color={statusColors[v]}>{v}</Tag> },
                  { title: "\u65f6\u95f4", dataIndex: "created_at", render: (v: string) => v ? new Date(v).toLocaleDateString("zh-CN") : "-" },
                ]}
              />
            </Card>
          </Col>

          {/* ---- Platform Overview ---- */}
          <Col xs={24} lg={10}>
            <Card title={"\u5e73\u53f0\u5168\u666f"} size="small">
              <Row gutter={[12, 12]}>
                {(blueprint?.domains || []).slice(0, 6).map((d: any, i: number) => (
                  <Col span={12} key={d.name}>
                    <div style={{ background: "#fafafa", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: COLORS[i % COLORS.length] }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: "#999" }}>{d.items.slice(0, 3).join(" / ")}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          {/* ---- Module Map ---- */}
          <Col xs={24}>
            <Card title={"\u4e1a\u52a1\u6a21\u5757\u77e9\u9635"} size="small">
              <Row gutter={[16, 16]}>
                {[
                  { t: "\u6218\u7565\u7ba1\u7406", d: "OKR \u00b7 \u76ee\u6807 \u00b7 KR \u00b7 \u6267\u884c\u4efb\u52a1", c: "#1677ff", n: 3 },
                  { t: "\u7ecf\u8425\u7ba1\u7406", d: "\u8ba2\u5355 \u00b7 \u5ba2\u6237 \u00b7 \u7ebf\u7d22 \u00b7 \u5546\u673a", c: "#13c2c2", n: stats.orderCount },
                  { t: "\u4e3b\u6570\u636e\u4e2d\u5fc3", d: "\u5de5\u5382 \u00b7 \u8f66\u95f4 \u00b7 \u4ea7\u7ebf \u00b7 \u7269\u6599 \u00b7 BOM", c: "#722ed1", n: stats.factories },
                  { t: "\u5236\u9020\u6267\u884c", d: "\u5de5\u5355 \u00b7 \u62a5\u5de5 \u00b7 \u91c7\u96c6 \u00b7 OEE \u00b7 \u62a5\u8b66", c: "#fa541c", n: oee?.snapshot_count || 0 },
                  { t: "\u4f9b\u5e94\u94fe", d: "\u4f9b\u5e94\u5546 \u00b7 \u91c7\u8d2d\u8ba2\u5355 \u00b7 \u4ed3\u5e93 \u00b7 \u5e93\u5b58", c: "#52c41a", n: "-" },
                  { t: "\u4ea7\u54c1\u7814\u53d1", d: "\u4ea7\u54c1\u7ebf \u00b7 \u4ea7\u54c1 \u00b7 \u9700\u6c42 \u00b7 \u9879\u76ee", c: "#faad14", n: "-" },
                  { t: "\u8d22\u52a1\u7ba1\u7406", d: "\u9884\u7b97 \u00b7 \u8d39\u7528 \u00b7 \u6536\u5165 \u00b7 \u53d1\u7968", c: "#eb2f96", n: stats.revenue > 0 ? "\u00a5" + stats.revenue.toFixed(0) : "-" },
                  { t: "\u4eba\u624d\u53d1\u5c55", d: "\u62db\u8058 \u00b7 \u7ee9\u6548 \u00b7 \u57f9\u8bad \u00b7 \u85aa\u916c", c: "#2f54eb", n: "-" },
                ].map((m) => (
                  <Col xs={12} sm={6} key={m.t}>
                    <Card size="small" hoverable style={{ borderLeft: `3px solid ${m.c}` }}>
                      <div style={{ fontWeight: 600, color: m.c, marginBottom: 4 }}>{m.t}</div>
                      <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>{m.d}</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{m.n}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
