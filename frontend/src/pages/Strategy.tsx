import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Popconfirm, Progress, Row, Select, Space, Statistic, Table, Tabs, Tag, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, AimOutlined, TrophyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import api from "../services/api";

export default function Strategy() {
  const [objectives, setObjectives] = useState<any[]>([]);
  const [keyResults, setKeyResults] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"objective" | "kr" | "task">("objective");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchAll = async () => {
    const [obj, kr, tsk] = await Promise.all([
      api.get("/strategy/objectives"), api.get("/strategy/key-results"), api.get("/strategy/tasks"),
    ]);
    setObjectives(obj.data); setKeyResults(kr.data); setTasks(tsk.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = (type: typeof modalType) => { setModalType(type); setEditingId(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (type: typeof modalType, record: any) => { setModalType(type); setEditingId(record.id); form.setFieldsValue(record); setModalOpen(true); };

  const handleDelete = async (type: string, id: number) => {
    const ep = type === "objective" ? "/strategy/objectives" : type === "kr" ? "/strategy/key-results" : "/strategy/tasks";
    try { await api.delete(`${ep}/${id}`); fetchAll(); } catch { message.warning("需后端支持删除"); fetchAll(); }
  };

  const handleSubmit = async (values: any) => {
    const ep = modalType === "objective" ? "/strategy/objectives" : modalType === "kr" ? "/strategy/key-results" : "/strategy/tasks";
    try {
      if (modalType === "objective") Object.assign(values, { type: "strategic", organization_id: 1, owner_id: 1, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 90 * 864e5).toISOString() });
      else if (modalType === "kr") Object.assign(values, { weight: 1, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 90 * 864e5).toISOString() });
      else Object.assign(values, { assignee_id: 1, priority: values.priority || "medium" });
      if (editingId) await api.put(`${ep}/${editingId}`, values);
      else await api.post(ep, values);
      message.success(editingId ? "更新成功" : "创建成功");
      setModalOpen(false); form.resetFields(); fetchAll();
    } catch (e: any) { message.error(e?.response?.data?.detail || "操作失败"); }
  };

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const taskRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const actionCol = (type: string) => ({ title: "操作", width: 100, render: (_: any, r: any) => (
    <Space><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(type as any, r)} /><Popconfirm title="确定删除?" onConfirm={() => handleDelete(type, r.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space>
  )});

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="目标" value={objectives.length} prefix={<AimOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="KR" value={keyResults.length} prefix={<TrophyOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="任务" value={tasks.length} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Progress type="circle" percent={taskRate} size={80} format={() => `${completedTasks}/${tasks.length}`} /></Card></Col>
      </Row>

      <Card title="战略管理中心" extra={
        <Space>
          <Button onClick={() => openCreate("objective")} icon={<PlusOutlined />}>新增目标</Button>
          <Button onClick={() => openCreate("kr")} icon={<PlusOutlined />}>新增KR</Button>
          <Button type="primary" onClick={() => openCreate("task")} icon={<PlusOutlined />}>新增任务</Button>
        </Space>
      }>
        <Tabs items={[
          { key: "objectives", label: `目标 (${objectives.length})`,
            children: <Table rowKey="id" size="small" pagination={false} dataSource={objectives} columns={[
              { title: "标题", dataIndex: "title" }, { title: "类型", dataIndex: "type" },
              { title: "进度", dataIndex: "progress", render: (v: number) => <Progress percent={Math.round(v * 100)} size="small" /> },
              { title: "状态", dataIndex: "status", render: (v: string) => <Tag color={v === "active" ? "blue" : "green"}>{v}</Tag> },
              actionCol("objective"),
            ]} />,
          },
          { key: "krs", label: `KR (${keyResults.length})`,
            children: <Table rowKey="id" size="small" pagination={false} dataSource={keyResults} columns={[
              { title: "标题", dataIndex: "title" }, { title: "目标ID", dataIndex: "objective_id" },
              { title: "进度", render: (_: any, r: any) => `${r.current_value} / ${r.target_value}${r.unit || ""}` },
              { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
              actionCol("kr"),
            ]} />,
          },
          { key: "tasks", label: `任务 (${tasks.length})`,
            children: <Table rowKey="id" size="small" pagination={false} dataSource={tasks} columns={[
              { title: "标题", dataIndex: "title" }, { title: "KR ID", dataIndex: "key_result_id" },
              { title: "负责人", dataIndex: "assignee_id" }, { title: "优先级", dataIndex: "priority", render: (v: string) => <Tag color={v === "high" ? "red" : v === "medium" ? "orange" : "default"}>{v}</Tag> },
              { title: "状态", dataIndex: "status", render: (v: string) => <Tag color={v === "completed" ? "green" : v === "in_progress" ? "blue" : "default"}>{v}</Tag> },
              actionCol("task"),
            ]} />,
          },
        ]} />
      </Card>

      <Modal title={`${editingId ? "编辑" : "新增"}${modalType === "objective" ? "目标" : modalType === "kr" ? "KR" : "任务"}`}
        open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} width={480}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {modalType === "objective" ? <>
            <Form.Item name="title" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="weight" label="权重" initialValue={1}><InputNumber min={0} max={10} style={{ width: "100%" }} /></Form.Item>
          </> : modalType === "kr" ? <>
            <Form.Item name="objective_id" label="目标ID" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="title" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="target_value" label="目标值" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="current_value" label="当前值" initialValue={0}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="unit" label="单位"><Input /></Form.Item>
          </> : <>
            <Form.Item name="key_result_id" label="KR ID" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="title" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="priority" label="优先级" initialValue="medium"><Select options={[{ value: "high", label: "高" }, { value: "medium", label: "中" }, { value: "low", label: "低" }]} /></Form.Item>
          </>}
        </Form>
      </Modal>
    </Space>
  );
}
