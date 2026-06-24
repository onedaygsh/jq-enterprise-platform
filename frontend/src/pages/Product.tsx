import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Statistic, Table, Tabs, Tag, message } from "antd";
import { PlusOutlined, ExperimentOutlined, ProjectOutlined, CheckSquareOutlined, BugOutlined } from "@ant-design/icons";
import api from "../services/api";

export default function Product() {
  const [productLines, setProductLines] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [qualityChecks, setQualityChecks] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"productLine" | "product" | "requirement" | "project" | "task" | "qc">("productLine");
  const [form] = Form.useForm();

  const fetchAll = async () => {
    const [pl, p, r, pr, t, qc] = await Promise.all([
      api.get("/product/lines"), api.get("/product/products"),
      api.get("/product/requirements"), api.get("/product/projects"),
      api.get("/product/tasks"), api.get("/product/quality-checks"),
    ]);
    setProductLines(pl.data); setProducts(p.data); setRequirements(r.data);
    setProjects(pr.data); setTasks(t.data); setQualityChecks(qc.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (values: any) => {
    try {
      const endpoint: Record<string, string> = { productLine: "/product/lines", product: "/product/products", requirement: "/product/requirements", project: "/product/projects", task: "/product/tasks", qc: "/product/quality-checks" };
      await api.post(endpoint[modalType], values);
      message.success("创建成功"); setModalOpen(false); form.resetFields(); fetchAll();
    } catch (e: any) { message.error(e?.response?.data?.detail || "操作失败"); }
  };

  const forms: Record<string, React.ReactNode> = {
    productLine: <><Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item></>,
    product: <><Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="product_line_id" label="产品线ID"><Input type="number" /></Form.Item><Form.Item name="unit_price" label="单价"><InputNumber style={{ width: "100%" }} /></Form.Item><Form.Item name="lifecycle_stage" label="生命周期" initialValue="concept"><Select options={[{ value: "concept", label: "概念" }, { value: "development", label: "研发" }, { value: "launch", label: "上市" }, { value: "mature", label: "成熟" }, { value: "decline", label: "衰退" }]} /></Form.Item></>,
    requirement: <><Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="product_id" label="产品ID"><Input type="number" /></Form.Item><Form.Item name="priority" label="优先级" initialValue="medium"><Select options={[{ value: "high", label: "高" }, { value: "medium", label: "中" }, { value: "low", label: "低" }]} /></Form.Item><Form.Item name="submitter_id" label="提交人ID" rules={[{ required: true }]}><Input type="number" /></Form.Item></>,
    project: <><Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="manager_id" label="经理ID"><Input type="number" /></Form.Item><Form.Item name="start_date" label="开始日期"><Input type="date" /></Form.Item><Form.Item name="end_date" label="结束日期"><Input type="date" /></Form.Item></>,
    task: <><Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="project_id" label="项目ID"><Input type="number" /></Form.Item><Form.Item name="assignee_id" label="负责人ID"><Input type="number" /></Form.Item></>,
    qc: <><Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="project_id" label="项目ID"><Input type="number" /></Form.Item><Form.Item name="type" label="类型"><Input /></Form.Item><Form.Item name="result" label="结果" initialValue="pass"><Select options={[{ value: "pass", label: "通过" }, { value: "fail", label: "不通过" }, { value: "pending", label: "待定" }]} /></Form.Item></>,
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={4}><Card><Statistic title="产品线" value={productLines.length} prefix={<ExperimentOutlined />} /></Card></Col>
        <Col xs={12} sm={4}><Card><Statistic title="产品" value={products.length} /></Card></Col>
        <Col xs={12} sm={4}><Card><Statistic title="需求" value={requirements.length} /></Card></Col>
        <Col xs={12} sm={4}><Card><Statistic title="项目" value={projects.length} prefix={<ProjectOutlined />} /></Card></Col>
        <Col xs={12} sm={4}><Card><Statistic title="任务" value={tasks.length} prefix={<CheckSquareOutlined />} /></Card></Col>
        <Col xs={12} sm={4}><Card><Statistic title="质量检查" value={qualityChecks.length} prefix={<BugOutlined />} /></Card></Col>
      </Row>

      <Card title="产品研发中心" extra={
        <Space wrap>
          <Button onClick={() => { setModalType("productLine"); setModalOpen(true); }} icon={<PlusOutlined />}>新增产品线</Button>
          <Button onClick={() => { setModalType("product"); setModalOpen(true); }} icon={<PlusOutlined />}>新增产品</Button>
          <Button onClick={() => { setModalType("requirement"); setModalOpen(true); }} icon={<PlusOutlined />}>新增需求</Button>
          <Button onClick={() => { setModalType("project"); setModalOpen(true); }} icon={<PlusOutlined />}>新增项目</Button>
          <Button onClick={() => { setModalType("task"); setModalOpen(true); }} icon={<PlusOutlined />}>新增任务</Button>
        </Space>
      }>
        <Tabs items={[
          { key: "productLines", label: "产品线", children: <Table rowKey="id" pagination={false} dataSource={productLines} columns={[{ title: "名称", dataIndex: "name" }, { title: "编码", dataIndex: "code" }, { title: "描述", dataIndex: "description" }]} /> },
          { key: "products", label: "产品", children: <Table rowKey="id" pagination={false} dataSource={products} columns={[{ title: "名称", dataIndex: "name" }, { title: "编码", dataIndex: "code" }, { title: "产品线ID", dataIndex: "product_line_id" }, { title: "单价", dataIndex: "unit_price" }, { title: "生命周期", dataIndex: "lifecycle_stage", render: (v: string) => <Tag>{v}</Tag> }]} /> },
          { key: "requirements", label: "需求", children: <Table rowKey="id" pagination={false} dataSource={requirements} columns={[{ title: "标题", dataIndex: "title" }, { title: "产品ID", dataIndex: "product_id" }, { title: "优先级", dataIndex: "priority" }, { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> }]} /> },
          { key: "projects", label: "项目", children: <Table rowKey="id" pagination={false} dataSource={projects} columns={[{ title: "名称", dataIndex: "name" }, { title: "经理ID", dataIndex: "manager_id" }, { title: "进度", dataIndex: "progress", render: (v: number) => `${Math.round((v || 0) * 100)}%` }, { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> }]} /> },
          { key: "tasks", label: "任务", children: <Table rowKey="id" pagination={false} dataSource={tasks} columns={[{ title: "标题", dataIndex: "title" }, { title: "项目ID", dataIndex: "project_id" }, { title: "负责人ID", dataIndex: "assignee_id" }, { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> }]} /> },
          { key: "qualityChecks", label: "质量检查", children: <Table rowKey="id" pagination={false} dataSource={qualityChecks} columns={[{ title: "标题", dataIndex: "title" }, { title: "项目ID", dataIndex: "project_id" }, { title: "类型", dataIndex: "type" }, { title: "结果", dataIndex: "result", render: (v: string) => <Tag color={v === "pass" ? "green" : v === "fail" ? "red" : "orange"}>{v}</Tag> }]} /> },
        ]} />
      </Card>

      <Modal title={{ productLine: "新增产品线", product: "新增产品", requirement: "新增需求", project: "新增项目", task: "新增任务", qc: "新增质量检查" }[modalType]}
        open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} width={500}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>{forms[modalType]}</Form>
      </Modal>
    </Space>
  );
}
