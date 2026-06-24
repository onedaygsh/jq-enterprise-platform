import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, Tabs, Tag, message } from "antd";
import { PlusOutlined, RocketOutlined } from "@ant-design/icons";
import api from "../services/api";

export default function Manufacturing() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [alarms, setAlarms] = useState<any[]>([]);
  const [oee, setOee] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("work-orders");
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchAll = async () => {
    const [wo, rp, te, al, oeeRes] = await Promise.all([
      api.get("/manufacturing/work-orders"),
      api.get("/manufacturing/production-reports"),
      api.get("/manufacturing/telemetry"),
      api.get("/manufacturing/alarms"),
      api.get("/manufacturing/oee"),
    ]);
    setWorkOrders(wo.data);
    setReports(rp.data);
    setTelemetry(te.data);
    setAlarms(al.data);
    setOee(oeeRes.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const releaseWorkOrder = async (id: number) => {
    await api.post(`/manufacturing/work-orders/${id}/release`);
    message.success("工单已释放");
    fetchAll();
  };

  const quickGenerateWorkOrder = async () => {
    const values = await form.validateFields();
    await api.post(`/manufacturing/work-orders/from-order/${values.order_id}`);
    message.success("已生成工单");
    setModalOpen(false);
    form.resetFields();
    fetchAll();
  };

  const quickReport = async () => {
    const values = await form.validateFields();
    await api.post("/manufacturing/production-reports/from-order/" + values.order_id, null, {
      params: {
        reported_quantity: values.reported_quantity,
        scrap_quantity: values.scrap_quantity || 0,
        operator_id: values.operator_id,
      },
    });
    message.success("已完成报工");
    setModalOpen(false);
    form.resetFields();
    fetchAll();
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={4}><Card title="工单">{workOrders.length}</Card></Col>
        <Col xs={24} sm={12} lg={4}><Card title="报工">{reports.length}</Card></Col>
        <Col xs={24} sm={12} lg={4}><Card title="采集">{telemetry.length}</Card></Col>
        <Col xs={24} sm={12} lg={4}><Card title="未处理报警">{alarms.filter((item) => item.status === "open").length}</Card></Col>
        <Col xs={24} sm={12} lg={4}><Card title="OEE">{oee?.oee ?? 0}%</Card></Col>
        <Col xs={24} sm={12} lg={4}><Card title="质量">{oee?.quality ?? 0}%</Card></Col>
      </Row>

      <Card
        title="制造执行"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新增</Button>}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "work-orders",
              label: "工单",
              children: <Table
                rowKey="id"
                pagination={false}
                dataSource={workOrders}
                columns={[
                  { title: "工单号", dataIndex: "work_order_no" },
                  { title: "订单ID", dataIndex: "order_id" },
                  { title: "计划数量", dataIndex: "planned_quantity" },
                  { title: "完成数量", dataIndex: "completed_quantity" },
                  { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
                  {
                    title: "操作",
                    render: (_: any, row: any) => row.status === "planned"
                      ? <Button size="small" icon={<RocketOutlined />} onClick={() => releaseWorkOrder(row.id)}>释放</Button>
                      : null,
                  },
                ]}
              />,
            },
            {
              key: "reports",
              label: "报工",
              children: <Table rowKey="id" pagination={false} dataSource={reports} columns={[
                { title: "报工号", dataIndex: "report_no" },
                { title: "工单ID", dataIndex: "work_order_id" },
                { title: "报工数量", dataIndex: "reported_quantity" },
                { title: "报废数量", dataIndex: "scrap_quantity" },
              ]} />,
            },
            {
              key: "telemetry",
              label: "设备采集",
              children: <Table rowKey="id" pagination={false} dataSource={telemetry} columns={[
                { title: "设备ID", dataIndex: "equipment_id" },
                { title: "状态", dataIndex: "status" },
                { title: "节拍", dataIndex: "cycle_time" },
                { title: "产量", dataIndex: "output_count" },
                { title: "不良", dataIndex: "defect_count" },
              ]} />,
            },
            {
              key: "alarms",
              label: "报警",
              children: <Table rowKey="id" pagination={false} dataSource={alarms} columns={[
                { title: "标题", dataIndex: "title" },
                { title: "类型", dataIndex: "alarm_type" },
                { title: "级别", dataIndex: "severity" },
                { title: "状态", dataIndex: "status", render: (v: string) => v === "open" ? <Tag color="red">未处理</Tag> : <Tag color="green">已处理</Tag> },
              ]} />,
            },
          ]}
        />
      </Card>

      <Modal title="快捷操作" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical">
          <Form.Item name="order_id" label="订单ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          {activeTab !== "work-orders" && <Form.Item name="work_order_id" label="工单ID"><Input type="number" /></Form.Item>}
          <Form.Item name="reported_quantity" label="报工数量"><Input type="number" /></Form.Item>
          <Form.Item name="scrap_quantity" label="报废数量"><Input type="number" /></Form.Item>
          <Form.Item name="operator_id" label="操作员ID"><Input type="number" /></Form.Item>
          <Form.Item name="priority" label="优先级" initialValue="medium">
            <Select options={[{ value: "high", label: "高" }, { value: "medium", label: "中" }, { value: "low", label: "低" }]} />
          </Form.Item>
          <Space>
            <Button htmlType="button" onClick={quickGenerateWorkOrder}>一键生成工单</Button>
            <Button htmlType="button" type="primary" onClick={quickReport}>一键报工</Button>
          </Space>
        </Form>
      </Modal>
    </Space>
  );
}
