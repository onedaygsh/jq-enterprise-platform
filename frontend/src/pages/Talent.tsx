import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Statistic, Table, Tabs, Tag, message } from "antd";
import { PlusOutlined, TeamOutlined, UserOutlined, StarOutlined, BookOutlined, IdcardOutlined } from "@ant-design/icons";
import api from "../services/api";

export default function Talent() {
  const [recruitments, setRecruitments] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [performances, setPerformances] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [compensations, setCompensations] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"recruitment" | "candidate" | "performance" | "training" | "compensation">("recruitment");
  const [form] = Form.useForm();

  const fetchAll = async () => {
    const [r, c, p, t, cp] = await Promise.all([
      api.get("/talent/recruitments"), api.get("/talent/candidates"),
      api.get("/talent/performances"), api.get("/talent/trainings"), api.get("/talent/compensations"),
    ]);
    setRecruitments(r.data); setCandidates(c.data); setPerformances(p.data); setTrainings(t.data); setCompensations(cp.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (values: any) => {
    try {
      const endpoint: Record<string, string> = { recruitment: "/talent/recruitments", candidate: "/talent/candidates", performance: "/talent/performances", training: "/talent/trainings", compensation: "/talent/compensations" };
      if (modalType === "performance") { values.cycle = "Q2"; values.period_start = "2026-04-01T00:00:00"; values.period_end = "2026-06-30T00:00:00"; values.reviewer_id = 1; }
      if (modalType === "recruitment") { values.headcount = 1; values.owner_id = 1; values.department_id = 1; }
      await api.post(endpoint[modalType], values);
      message.success("创建成功"); setModalOpen(false); form.resetFields(); fetchAll();
    } catch (e: any) { message.error(e?.response?.data?.detail || "操作失败"); }
  };

  const openRecruitments = recruitments.filter((r) => r.status === "open");

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card><Statistic title="招聘岗位" value={openRecruitments.length} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="候选人" value={candidates.length} prefix={<UserOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="绩效评估" value={performances.length} prefix={<StarOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="培训" value={trainings.length} prefix={<BookOutlined />} /></Card></Col>
      </Row>

      <Card title="人才发展中心" extra={
        <Space wrap>
          <Button onClick={() => { setModalType("recruitment"); setModalOpen(true); }} icon={<PlusOutlined />}>新增岗位</Button>
          <Button onClick={() => { setModalType("candidate"); setModalOpen(true); }} icon={<PlusOutlined />}>新增候选人</Button>
          <Button onClick={() => { setModalType("training"); setModalOpen(true); }} icon={<PlusOutlined />}>新增培训</Button>
        </Space>
      }>
        <Tabs items={[
          {
            key: "recruitments", label: "招聘",
            children: <Table rowKey="id" pagination={false} dataSource={recruitments} columns={[
              { title: "岗位", dataIndex: "position_name" }, { title: "部门ID", dataIndex: "department_id" },
              { title: "编制", dataIndex: "headcount" }, { title: "已填", dataIndex: "filled_count" },
              { title: "状态", dataIndex: "status", render: (v: string) => <Tag color={v === "open" ? "blue" : "green"}>{v}</Tag> },
            ]} />,
          },
          {
            key: "candidates", label: "候选人",
            children: <Table rowKey="id" pagination={false} dataSource={candidates} columns={[
              { title: "姓名", dataIndex: "name" }, { title: "电话", dataIndex: "phone" },
              { title: "邮箱", dataIndex: "email" }, { title: "阶段", dataIndex: "stage", render: (v: string) => <Tag>{v}</Tag> },
              { title: "评分", dataIndex: "rating" },
            ]} />,
          },
          {
            key: "performances", label: "绩效",
            children: <Table rowKey="id" pagination={false} dataSource={performances} columns={[
              { title: "用户ID", dataIndex: "user_id" }, { title: "周期", dataIndex: "cycle" },
              { title: "自评", dataIndex: "self_score" }, { title: "主管评分", dataIndex: "reviewer_score" },
              { title: "最终评分", dataIndex: "final_score" }, { title: "等级", dataIndex: "grade", render: (v: string) => <Tag>{v}</Tag> },
            ]} />,
          },
          {
            key: "trainings", label: "培训",
            children: <Table rowKey="id" pagination={false} dataSource={trainings} columns={[
              { title: "标题", dataIndex: "title" }, { title: "类别", dataIndex: "category" },
              { title: "讲师", dataIndex: "trainer" }, { title: "地点", dataIndex: "location" },
              { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
            ]} />,
          },
          {
            key: "compensations", label: "薪酬",
            children: <Table rowKey="id" pagination={false} dataSource={compensations} columns={[
              { title: "用户ID", dataIndex: "user_id" }, { title: "基本工资", dataIndex: "base_salary" },
              { title: "奖金", dataIndex: "bonus" }, { title: "补贴", dataIndex: "allowance" },
              { title: "合计", dataIndex: "total" },
            ]} />,
          },
        ]} />
      </Card>

      <Modal title={{ recruitment: "新增招聘岗位", candidate: "新增候选人", performance: "新增绩效", training: "新增培训", compensation: "新增薪酬" }[modalType]}
        open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} width={500}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {modalType === "recruitment" ? <>
            <Form.Item name="position_name" label="岗位名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="requirements" label="要求"><Input.TextArea rows={2} /></Form.Item>
          </> : modalType === "candidate" ? <>
            <Form.Item name="recruitment_id" label="岗位ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="phone" label="电话"><Input /></Form.Item>
            <Form.Item name="email" label="邮箱"><Input /></Form.Item>
          </> : modalType === "training" ? <>
            <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="category" label="类别"><Input /></Form.Item>
            <Form.Item name="trainer" label="讲师"><Input /></Form.Item>
            <Form.Item name="organizer_id" label="组织者ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="start_date" label="开始日期"><Input type="date" /></Form.Item>
            <Form.Item name="end_date" label="结束日期"><Input type="date" /></Form.Item>
          </> : modalType === "performance" ? <>
            <Form.Item name="user_id" label="用户ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="achievements" label="成果"><Input.TextArea rows={2} /></Form.Item>
            <Form.Item name="improvements" label="改进"><Input.TextArea rows={2} /></Form.Item>
          </> : <>
            <Form.Item name="user_id" label="用户ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="base_salary" label="基本工资"><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="bonus" label="奖金"><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="effective_date" label="生效日期"><Input type="date" /></Form.Item>
          </>}
        </Form>
      </Modal>
    </Space>
  );
}
