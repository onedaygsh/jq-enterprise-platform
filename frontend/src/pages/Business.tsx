import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Statistic, Table, Tabs, Tag, message } from "antd";
import { PlusOutlined, ThunderboltOutlined } from "@ant-design/icons";
import api from "../services/api";

export default function Business() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"" | "order" | "customer" | "lead" | "opp" | "report">("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, o, l, op] = await Promise.all([
        api.get("/business/customers"),
        api.get("/business/orders"),
        api.get("/business/leads"),
        api.get("/business/opportunities"),
      ]);
      setCustomers(c.data);
      setOrders(o.data);
      setLeads(l.data);
      setOpportunities(op.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const createWorkOrder = async (order: any) => {
    await api.post(`/manufacturing/work-orders/from-order/${order.id}`);
    message.success("已生成工单");
    fetchAll();
  };

  const openModal = (type: string, order?: any) => {
    setModalType(type as any);
    setSelectedOrder(order || null);
    setModalOpen(true);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      if (modalType === "order") {
        await api.post("/business/orders", { ...values, owner_id: 1, final_amount: values.final_amount || values.total_amount || 0 });
        message.success("订单创建成功");
      } else if (modalType === "report" && selectedOrder) {
        await api.post("/manufacturing/production-reports", {
          work_order_id: values.work_order_id || selectedOrder.work_orders?.[0]?.id,
          reported_quantity: values.reported_quantity,
          scrap_quantity: values.scrap_quantity || 0,
          operator_id: values.operator_id || 1,
          report_time: new Date().toISOString(),
        });
        message.success("报工成功");
      } else if (modalType === "customer") {
        await api.post("/business/customers", { ...values, owner_id: 1 });
        message.success("客户创建成功");
      } else if (modalType === "lead") {
        await api.post("/business/leads", values);
        message.success("线索创建成功");
      } else if (modalType === "opp") {
        await api.post("/business/opportunities", values);
        message.success("商机创建成功");
      }
      setModalOpen(false);
      setSelectedOrder(null);
      form.resetFields();
      fetchAll();
    } catch (e: any) {
      message.error(e?.response?.data?.detail || "操作失败");
    }
  };

  const orderStats = { total: orders.length, active: orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length, amount: orders.reduce((s, o) => s + (o.final_amount || 0), 0) };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card><Statistic title="客户数" value={customers.length} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="订单数" value={orderStats.total} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="进行中订单" value={orderStats.active} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="成交总额" value={orderStats.amount.toFixed(0)} prefix="¥" /></Card></Col>
      </Row>

      <Card title="经营管理中心" extra={
        <Space>
          <Button onClick={() => openModal("customer")} icon={<PlusOutlined />}>新增客户</Button>
          <Button onClick={() => openModal("lead")} icon={<PlusOutlined />}>新增线索</Button>
          <Button onClick={() => openModal("opp")} icon={<PlusOutlined />}>新增商机</Button>
          <Button type="primary" onClick={() => openModal("order")} icon={<PlusOutlined />}>新增订单</Button>
        </Space>
      }>
        <Tabs
          items={[
            {
              key: "orders", label: "订单列表",
              children: <Table rowKey="id" loading={loading} pagination={false} dataSource={orders} columns={[
                { title: "订单号", dataIndex: "order_no" },
                { title: "客户ID", dataIndex: "customer_id" },
                { title: "总金额", dataIndex: "total_amount" },
                { title: "成交金额", dataIndex: "final_amount" },
                { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
                { title: "操作", render: (_: any, row: any) => (
                  <Space>
                    <Button size="small" icon={<ThunderboltOutlined />} onClick={() => createWorkOrder(row)}>一键生成工单</Button>
                    <Button size="small" onClick={() => openModal("report", row)}>一键报工</Button>
                  </Space>
                )},
              ]} />,
            },
            {
              key: "customers", label: "客户列表",
              children: <Table rowKey="id" loading={loading} pagination={false} dataSource={customers} columns={[
                { title: "名称", dataIndex: "name" }, { title: "编码", dataIndex: "code" },
                { title: "等级", dataIndex: "level" }, { title: "联系人", dataIndex: "contact_person" },
              ]} />,
            },
            {
              key: "leads", label: "线索",
              children: <Table rowKey="id" loading={loading} pagination={false} dataSource={leads} columns={[
                { title: "名称", dataIndex: "name" }, { title: "来源", dataIndex: "source" },
                { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
              ]} />,
            },
            {
              key: "opps", label: "商机",
              children: <Table rowKey="id" loading={loading} pagination={false} dataSource={opportunities} columns={[
                { title: "名称", dataIndex: "name" }, { title: "客户ID", dataIndex: "customer_id" },
                { title: "金额", dataIndex: "amount" }, { title: "阶段", dataIndex: "stage" },
                { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
              ]} />,
            },
          ]}
        />
      </Card>

      <Modal title={modalType === "report" ? `订单 ${selectedOrder?.order_no} 报工` : modalType === "order" ? "新增订单" : modalType === "customer" ? "新增客户" : modalType === "lead" ? "新增线索" : "新增商机"}
        open={modalOpen} onCancel={() => { setModalOpen(false); setSelectedOrder(null); }} onOk={() => form.submit()} width={500}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {modalType === "report" ? <>
            <Form.Item name="work_order_id" label="工单ID"><Input type="number" defaultValue={selectedOrder?.work_orders?.[0]?.id} /></Form.Item>
            <Form.Item name="reported_quantity" label="报工数量" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="scrap_quantity" label="报废数量"><Input type="number" /></Form.Item>
            <Form.Item name="operator_id" label="操作员ID" rules={[{ required: true }]}><Input type="number" defaultValue={1} /></Form.Item>
          </> : modalType === "order" ? <>
            <Form.Item name="customer_id" label="客户ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="total_amount" label="总金额" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="discount_amount" label="折扣金额"><Input type="number" /></Form.Item>
            <Form.Item name="description" label="备注"><Input /></Form.Item>
          </> : modalType === "customer" ? <>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="contact_person" label="联系人"><Input /></Form.Item>
            <Form.Item name="contact_phone" label="电话"><Input /></Form.Item>
          </> : modalType === "lead" ? <>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="source" label="来源"><Input /></Form.Item>
            <Form.Item name="contact_phone" label="电话"><Input /></Form.Item>
          </> : <>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="customer_id" label="客户ID"><Input type="number" /></Form.Item>
            <Form.Item name="amount" label="金额"><Input type="number" /></Form.Item>
            <Form.Item name="stage" label="阶段" initialValue="discovery"><Input /></Form.Item>
          </>}
        </Form>
      </Modal>
    </Space>
  );
}
