import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Progress, Row, Select, Space, Statistic, Table, Tabs, Tag, message } from "antd";
import { PlusOutlined, AimOutlined, TrophyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import api from "../services/api";

export default function Strategy() {
  const [objectives, setObjectives] = useState<any[]>([]);
  const [keyResults, setKeyResults] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"objective" | "kr" | "task">("objective");
  const [form] = Form.useForm();

  const fetchAll = async () => {
    const [obj, kr, tsk] = await Promise.all([
      api.get("/strategy/objectives"),
      api.get("/strategy/key-results"),
      api.get("/strategy/tasks"),
    ]);
    setObjectives(obj.data);
    setKeyResults(kr.data);
    setTasks(tsk.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (modalType === "objective") await api.post("/strategy/objectives", { ...values, type: "strategic", organization_id: 1, owner_id: 1, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 90 * 864e5).toISOString() });
      else if (modalType === "kr") await api.post("/strategy/key-results", { ...values, weight: 1, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 90 * 864e5).toISOString() });
      else if (modalType === "task") await api.post("/strategy/tasks", { ...values, assignee_id: 1, priority: "medium" });
      message.success("创建成功");
      setModalOpen(false); form.resetFields(); fetchAll();
    } catch (e: any) { message.error(e?.response?.data?.detail || "操作失败"); }
  };

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const taskRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card><Statistic title="目标数" value={objectives.length} prefix={<AimOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="关键结果" value={keyResults.length} prefix={<TrophyOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="执行任务" value={tasks.length} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Progress type="circle" percent={taskRate} size={80} format={() => `${completedTasks}/${tasks.length}`} /></Card></Col>
      </Row>

      <Card title="战略管理中心" extra={
        <Space>
          <Button onClick={() => { setModalType("objective"); setModalOpen(true); }} icon={<PlusOutlined />}>新增目标</Button>
          <Button onClick={() => { setModalType("kr"); setModalOpen(true); }} icon={<PlusOutlined />}>新增KR</Button>
          <Button type="primary" onClick={() => { setModalType("task"); setModalOpen(true); }} icon={<PlusOutlined />}>新增任务</Button>
        </Space>
      }>
        <Tabs items={[
          {
            key: "objectives", label: "战略目标",
            children: <Table rowKey="id" pagination={false} dataSource={objectives} columns={[
              { title: "标题", dataIndex: "title" }, { title: "类型", dataIndex: "type" },
              { title: "进度", dataIndex: "progress", render: (v: number) => <Progress percent={Math.round(v * 100)} size="small" /> },
              { title: "状态", dataIndex: "status", render: (v: string) => <Tag color={v === "active" ? "blue" : "green"}>{v}</Tag> },
            ]} />,
          },
          {
            key: "krs", label: "关键结果",
            children: <Table rowKey="id" pagination={false} dataSource={keyResults} columns={[
              { title: "标题", dataIndex: "title" }, { title: "目标ID", dataIndex: "objective_id" },
              { title: "当前/目标", render: (_: any, r: any) => `${r.current_value} / ${r.target_value}${r.unit || ""}` },
              { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
            ]} />,
          },
          {
            key: "tasks", label: "执行任务",
            children: <Table rowKey="id" pagination={false} dataSource={tasks} columns={[
              { title: "标题", dataIndex: "title" }, { title: "KR ID", dataIndex: "key_result_id" },
              { title: "负责人ID", dataIndex: "assignee_id" }, { title: "优先级", dataIndex: "priority" },
              { title: "状态", dataIndex: "status", render: (v: string) => <Tag color={v === "completed" ? "green" : v === "in_progress" ? "blue" : "default"}>{v}</Tag> },
            ]} />,
          },
        ]} />
      </Card>

      <Modal title={modalType === "objective" ? "新增战略目标" : modalType === "kr" ? "新增关键结果" : "新增执行任务"}
        open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} width={500}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {modalType === "objective" ? <>
            <Form.Item name="title" label="目标名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="weight" label="权重" initialValue={1}><InputNumber min={0} max={10} style={{ width: "100%" }} /></Form.Item>
          </> : modalType === "kr" ? <>
            <Form.Item name="objective_id" label="目标ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="title" label="KR 名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="target_value" label="目标值" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="current_value" label="当前值" initialValue={0}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="unit" label="单位"><Input placeholder="如：万元、%、件" /></Form.Item>
          </> : <>
            <Form.Item name="key_result_id" label="KR ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="title" label="任务名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="priority" label="优先级" initialValue="medium">
              <Select options={[{ value: "high", label: "高" }, { value: "medium", label: "中" }, { value: "low", label: "低" }]} />
            </Form.Item>
          </>}
        </Form>
      </Modal>
    </Space>
  );
}
