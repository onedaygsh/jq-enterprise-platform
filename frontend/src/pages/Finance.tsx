import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Statistic, Table, Tabs, Tag, message } from "antd";
import { PlusOutlined, DollarOutlined, RiseOutlined, FileTextOutlined, FallOutlined } from "@ant-design/icons";
import api from "../services/api";

export default function Finance() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [revenues, setRevenues] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [costReductions, setCostReductions] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"budget" | "expense" | "revenue" | "invoice" | "cost">("budget");
  const [form] = Form.useForm();

  const fetchAll = async () => {
    const [b, e, r, i, c] = await Promise.all([
      api.get("/finance/budgets"), api.get("/finance/expenses"),
      api.get("/finance/revenues"), api.get("/finance/invoices"), api.get("/finance/cost-reductions"),
    ]);
    setBudgets(b.data); setExpenses(e.data); setRevenues(r.data); setInvoices(i.data); setCostReductions(c.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (values: any) => {
    try {
      const endpoint: Record<string, string> = { budget: "/finance/budgets", expense: "/finance/expenses", revenue: "/finance/revenues", invoice: "/finance/invoices", cost: "/finance/cost-reductions" };
      if (modalType === "invoice") values.total_amount = (values.amount || 0) + (values.tax_amount || 0);
      await api.post(endpoint[modalType], values);
      message.success("创建成功"); setModalOpen(false); form.resetFields(); fetchAll();
    } catch (e: any) { message.error(e?.response?.data?.detail || "操作失败"); }
  };

  const totalRevenue = revenues.reduce((s: number, r: any) => s + (r.amount || 0), 0);
  const totalExpense = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card><Statistic title="预算项" value={budgets.length} prefix={<DollarOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="收入总额" value={totalRevenue.toFixed(0)} prefix="¥" valueStyle={{ color: "#3f8600" }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="费用总额" value={totalExpense.toFixed(0)} prefix="¥" valueStyle={{ color: "#cf1322" }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="发票" value={invoices.length} prefix={<FileTextOutlined />} /></Card></Col>
      </Row>

      <Card title="财务管理中心" extra={
        <Space wrap>
          <Button onClick={() => { setModalType("expense"); setModalOpen(true); }} icon={<PlusOutlined />}>新增费用</Button>
          <Button onClick={() => { setModalType("revenue"); setModalOpen(true); }} icon={<PlusOutlined />}>新增收入</Button>
          <Button onClick={() => { setModalType("invoice"); setModalOpen(true); }} icon={<PlusOutlined />}>新增发票</Button>
          <Button onClick={() => { setModalType("cost"); setModalOpen(true); }} icon={<PlusOutlined />}>降本目标</Button>
        </Space>
      }>
        <Tabs items={[
          { key: "budgets", label: "预算", children: <Table rowKey="id" pagination={false} dataSource={budgets} columns={[{ title: "标题", dataIndex: "title" }, { title: "年度", dataIndex: "fiscal_year" }, { title: "金额", dataIndex: "amount" }, { title: "已用", dataIndex: "used_amount" }, { title: "类型", dataIndex: "type" }]} /> },
          { key: "expenses", label: "费用", children: <Table rowKey="id" pagination={false} dataSource={expenses} columns={[{ title: "标题", dataIndex: "title" }, { title: "类别", dataIndex: "category" }, { title: "金额", dataIndex: "amount" }, { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> }]} /> },
          { key: "revenues", label: "收入", children: <Table rowKey="id" pagination={false} dataSource={revenues} columns={[{ title: "标题", dataIndex: "title" }, { title: "来源", dataIndex: "source" }, { title: "金额", dataIndex: "amount" }, { title: "日期", dataIndex: "revenue_date" }]} /> },
          { key: "invoices", label: "发票", children: <Table rowKey="id" pagination={false} dataSource={invoices} columns={[{ title: "发票号", dataIndex: "invoice_no" }, { title: "类型", dataIndex: "type" }, { title: "金额", dataIndex: "amount" }, { title: "税额", dataIndex: "tax_amount" }, { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> }]} /> },
          { key: "cost", label: "降本", children: <Table rowKey="id" pagination={false} dataSource={costReductions} columns={[{ title: "标题", dataIndex: "title" }, { title: "类别", dataIndex: "category" }, { title: "目标金额", dataIndex: "target_amount" }, { title: "已达成", dataIndex: "achieved_amount" }, { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> }]} /> },
        ]} />
      </Card>

      <Modal title={{ budget: "新增预算", expense: "新增费用", revenue: "新增收入", invoice: "新增发票", cost: "新增降本目标" }[modalType]}
        open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} width={500}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {modalType === "expense" ? <>
            <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="category" label="类别"><Input /></Form.Item>
            <Form.Item name="amount" label="金额" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="submitter_id" label="提交人ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="expense_date" label="日期" rules={[{ required: true }]}><Input type="date" /></Form.Item>
          </> : modalType === "revenue" ? <>
            <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="amount" label="金额" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="source" label="来源"><Input /></Form.Item>
            <Form.Item name="organization_id" label="组织ID"><Input type="number" /></Form.Item>
            <Form.Item name="recorded_by_id" label="记录人ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="revenue_date" label="日期" rules={[{ required: true }]}><Input type="date" /></Form.Item>
          </> : modalType === "invoice" ? <>
            <Form.Item name="invoice_no" label="发票号" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="type" label="类型" initialValue="sales"><Select options={[{ value: "sales", label: "销售" }, { value: "purchase", label: "采购" }]} /></Form.Item>
            <Form.Item name="amount" label="金额" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="tax_amount" label="税额"><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="issued_by_id" label="开票人ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="issued_at" label="开票日期"><Input type="date" /></Form.Item>
          </> : modalType === "cost" ? <>
            <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="category" label="类别"><Input /></Form.Item>
            <Form.Item name="target_amount" label="目标金额" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="organization_id" label="组织ID"><Input type="number" /></Form.Item>
            <Form.Item name="owner_id" label="负责人ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          </> : <>
            <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="amount" label="金额"><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="fiscal_year" label="财年"><Input type="number" /></Form.Item>
            <Form.Item name="type" label="类型"><Input /></Form.Item>
          </>}
        </Form>
      </Modal>
    </Space>
  );
}
