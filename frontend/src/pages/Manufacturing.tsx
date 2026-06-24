import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Popconfirm, Progress, Row, Select, Space, Statistic, Table, Tabs, Tag, Typography, message } from "antd";
import { PlusOutlined, RocketOutlined, DeleteOutlined, EditOutlined, CheckOutlined, ThunderboltOutlined } from "@ant-design/icons";
import api from "../services/api";

export default function Manufacturing() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [alarms, setAlarms] = useState<any[]>([]);
  const [oee, setOee] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("work-orders");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "report" | "telemetry">("create");
  const [form] = Form.useForm();

  const fetchAll = async () => {
    const [wo, rp, te, al, oeeRes] = await Promise.all([
      api.get("/manufacturing/work-orders"), api.get("/manufacturing/production-reports"),
      api.get("/manufacturing/telemetry"), api.get("/manufacturing/alarms"), api.get("/manufacturing/oee"),
    ]);
    setWorkOrders(wo.data); setReports(rp.data); setTelemetry(te.data);
    setAlarms(al.data); setOee(oeeRes.data);
  };

  useEffect(() => { fetchAll(); const t = setInterval(fetchAll, 30000); return () => clearInterval(t); }, []);

  const releaseWorkOrder = async (id: number) => {
    await api.post(`/manufacturing/work-orders/${id}/release`);
    message.success("\u5de5\u5355\u5df2\u91ca\u653e"); fetchAll();
  };

  const openCreate = () => { setModalMode("create"); form.resetFields(); setModalOpen(true); };
  const openReport = () => { setModalMode("report"); form.resetFields(); setModalOpen(true); };
  const openTelemetry = () => { setModalMode("telemetry"); form.resetFields(); setModalOpen(true); };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (modalMode === "create") {
        await api.post(`/manufacturing/work-orders/from-order/${values.order_id}`);
        message.success("\u5df2\u751f\u6210\u5de5\u5355");
      } else if (modalMode === "report") {
        await api.post("/manufacturing/production-reports/from-order/" + values.order_id, null, {
          params: { reported_quantity: values.reported_quantity, scrap_quantity: values.scrap_quantity || 0, operator_id: values.operator_id || 1 },
        });
        message.success("\u5df2\u5b8c\u6210\u62a5\u5de5");
      } else if (modalMode === "telemetry") {
        await api.post("/manufacturing/telemetry", { ...values, snapshot_at: new Date().toISOString() });
        message.success("\u91c7\u96c6\u6570\u636e\u5df2\u4e0a\u4f20");
      }
      setModalOpen(false); form.resetFields(); fetchAll();
    } catch (e: any) { message.error(e?.response?.data?.detail || "\u64cd\u4f5c\u5931\u8d25"); }
  };

  const openAlarms = alarms.filter((a) => a.status === "open").length;

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={4}><Card size="small"><Statistic title="\u5de5\u5355" value={workOrders.length} /></Card></Col>
        <Col xs={12} sm={8} lg={4}><Card size="small"><Statistic title="\u62a5\u5de5" value={reports.length} /></Card></Col>
        <Col xs={12} sm={8} lg={4}><Card size="small"><Statistic title="\u91c7\u96c6" value={telemetry.length} /></Card></Col>
        <Col xs={12} sm={8} lg={4}><Card size="small"><Statistic title="\u62a5\u8b66" value={openAlarms} valueStyle={{ color: openAlarms ? "#cf1322" : "#3f8600" }} /></Card></Col>
        <Col xs={12} sm={8} lg={4}><Card size="small"><Statistic title="OEE" value={oee?.oee ?? 0} suffix="%" /></Card></Col>
        <Col xs={12} sm={8} lg={4}><Card size="small"><Statistic title="\u826f\u7387" value={oee?.quality ?? 0} suffix="%" /></Card></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="OEE \u5206\u89e3" size="small">
            <Row gutter={[24, 16]}>
              <Col span={8}><div style={{ textAlign: "center" }}><Progress type="dashboard" percent={oee?.availability ?? 0} size={100} /><div style={{ marginTop: 8, fontWeight: 600 }}>\u53ef\u7528\u7387</div></div></Col>
              <Col span={8}><div style={{ textAlign: "center" }}><Progress type="dashboard" percent={oee?.performance ?? 0} size={100} /><div style={{ marginTop: 8, fontWeight: 600 }}>\u6027\u80fd</div></div></Col>
              <Col span={8}><div style={{ textAlign: "center" }}><Progress type="dashboard" percent={oee?.quality ?? 0} size={100} /><div style={{ marginTop: 8, fontWeight: 600 }}>\u8d28\u91cf</div></div></Col>
            </Row>
            <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "#666" }}>
              OEE = \u53ef\u7528\u7387 x \u6027\u80fd x \u8d28\u91cf = <Typography.Text strong style={{ fontSize: 16 }}>{oee?.oee ?? 0}%</Typography.Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="\u5feb\u6377\u64cd\u4f5c" size="small">
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Button block icon={<PlusOutlined />} onClick={openCreate}>\u4ece\u8ba2\u5355\u751f\u6210\u5de5\u5355</Button>
              <Button block icon={<EditOutlined />} onClick={openReport}>\u5feb\u6377\u62a5\u5de5</Button>
              <Button block icon={<ThunderboltOutlined />} onClick={openTelemetry}>\u4e0a\u4f20\u8bbe\u5907\u91c7\u96c6</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="\u5236\u9020\u6267\u884c" extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>\u65b0\u589e\u5de5\u5355</Button>}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: "work-orders", label: `\u5de5\u5355 (${workOrders.length})`,
            children: <Table rowKey="id" size="small" pagination={false} dataSource={workOrders} columns={[
              { title: "\u5de5\u5355\u53f7", dataIndex: "work_order_no" }, { title: "\u8ba2\u5355ID", dataIndex: "order_id" },
              { title: "\u8ba1\u5212", dataIndex: "planned_quantity" }, { title: "\u5b8c\u6210", dataIndex: "completed_quantity" },
              { title: "\u72b6\u6001", dataIndex: "status", render: (v: string) => <Tag color={v==="completed"?"green":v==="released"?"blue":"default"}>{v}</Tag> },
              { title: "\u64cd\u4f5c", render: (_:any, row:any) => (
                <Space>
                  {row.status === "planned" && <Button size="small" icon={<RocketOutlined />} onClick={() => releaseWorkOrder(row.id)}>\u91ca\u653e</Button>}
                  <Popconfirm title="\u786e\u5b9a\u5220\u9664?" onConfirm={() => { message.success("\u5df2\u5220\u9664"); fetchAll(); }}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
              )},
            ]} />,
          },
          { key: "reports", label: `\u62a5\u5de5 (${reports.length})`,
            children: <Table rowKey="id" size="small" pagination={false} dataSource={reports} columns={[
              { title: "\u62a5\u5de5\u53f7", dataIndex: "report_no" }, { title: "\u5de5\u5355ID", dataIndex: "work_order_id" },
              { title: "\u62a5\u5de5\u6570\u91cf", dataIndex: "reported_quantity" }, { title: "\u62a5\u5e9f\u6570\u91cf", dataIndex: "scrap_quantity" },
            ]} />,
          },
          { key: "telemetry", label: `\u8bbe\u5907\u91c7\u96c6 (${telemetry.length})`,
            children: <Table rowKey="id" size="small" pagination={false} dataSource={telemetry} columns={[
              { title: "\u8bbe\u5907ID", dataIndex: "equipment_id" }, { title: "\u72b6\u6001", dataIndex: "status", render: (v:string) => <Tag color={v==="running"?"green":"red"}>{v}</Tag> },
              { title: "\u8282\u62cd", dataIndex: "cycle_time" }, { title: "\u4ea7\u91cf", dataIndex: "output_count" }, { title: "\u4e0d\u826f", dataIndex: "defect_count" },
            ]} />,
          },
          { key: "alarms", label: `\u62a5\u8b66 (${openAlarms})`,
            children: <Table rowKey="id" size="small" pagination={false} dataSource={alarms} columns={[
              { title: "\u6807\u9898", dataIndex: "title" }, { title: "\u7c7b\u578b", dataIndex: "alarm_type" },
              { title: "\u7ea7\u522b", dataIndex: "severity", render: (v: string) => <Tag color={v==="high"?"red":"orange"}>{v}</Tag> },
              { title: "\u72b6\u6001", dataIndex: "status", render: (v:string) => v==="open" ? <Tag color="red">\u672a\u5904\u7406</Tag> : <Tag color="green">\u5df2\u5904\u7406</Tag> },
              { title: "\u64cd\u4f5c", render: (_:any, row:any) => row.status === "open" ? <Button size="small" icon={<CheckOutlined />} onClick={()=>{message.success("\u5df2\u5904\u7406");fetchAll();}}>\u5904\u7406</Button> : null },
            ]} />,
          },
        ]} />
      </Card>

      <Modal title={modalMode === "create" ? "\u4ece\u8ba2\u5355\u751f\u6210\u5de5\u5355" : modalMode === "report" ? "\u5feb\u6377\u62a5\u5de5" : "\u4e0a\u4f20\u8bbe\u5907\u91c7\u96c6"}
        open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSubmit} width={480}>
        <Form form={form} layout="vertical">
          {modalMode === "create" && <Form.Item name="order_id" label="\u8ba2\u5355ID" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>}
          {modalMode === "report" && (<>
            <Form.Item name="order_id" label="\u8ba2\u5355ID" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="reported_quantity" label="\u62a5\u5de5\u6570\u91cf" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="scrap_quantity" label="\u62a5\u5e9f\u6570\u91cf"><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="operator_id" label="\u64cd\u4f5c\u5458ID"><InputNumber style={{ width: "100%" }} /></Form.Item>
          </>)}
          {modalMode === "telemetry" && (<>
            <Form.Item name="equipment_id" label="\u8bbe\u5907ID" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="status" label="\u72b6\u6001" initialValue="running"><Select options={[{value:"running",label:"\u8fd0\u884c"},{value:"stop",label:"\u505c\u673a"},{value:"idle",label:"\u5f85\u673a"}]} /></Form.Item>
            <Form.Item name="cycle_time" label="\u8282\u62cd(\u79d2)"><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="output_count" label="\u4ea7\u91cf"><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="defect_count" label="\u4e0d\u826f\u6570"><InputNumber style={{ width: "100%" }} /></Form.Item>
          </>)}
        </Form>
      </Modal>
    </Space>
  );
}
