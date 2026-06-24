import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Space, Statistic, Table, Tabs, Tag, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined, ShoppingCartOutlined, EnvironmentOutlined, InboxOutlined } from "@ant-design/icons";
import api from "../services/api";

export default function SupplyChain() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"supplier" | "po" | "warehouse" | "inventory">("supplier");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchAll = async () => {
    const [s, p, w, i] = await Promise.all([
      api.get("/supply-chain/suppliers"), api.get("/supply-chain/purchase-orders"),
      api.get("/supply-chain/warehouses"), api.get("/supply-chain/inventory"),
    ]);
    setSuppliers(s.data); setPos(p.data); setWarehouses(w.data); setInventory(i.data);
  };
  useEffect(() => { fetchAll(); }, []);

  const endpoint: Record<string, string> = { supplier: "/supply-chain/suppliers", po: "/supply-chain/purchase-orders", warehouse: "/supply-chain/warehouses", inventory: "/supply-chain/inventory" };

  const openCreate = (t: typeof modalType) => { setModalType(t); setEditingId(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (t: typeof modalType, r: any) => { setModalType(t); setEditingId(r.id); form.setFieldsValue(r); setModalOpen(true); };

  const handleDelete = async (t: string, id: number) => {
    try { await api.delete(`${endpoint[t]}/${id}`); fetchAll(); } catch { message.warning("需后端支持"); fetchAll(); }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (modalType === "po") values.total_amount = (values.quantity || 0) * (values.unit_price || 0);
      if (editingId) await api.put(`${endpoint[modalType]}/${editingId}`, values);
      else await api.post(endpoint[modalType], values);
      message.success(editingId ? "更新成功" : "创建成功");
      setModalOpen(false); form.resetFields(); fetchAll();
    } catch (e: any) { message.error(e?.response?.data?.detail || "操作失败"); }
  };

  const actionCol = (t: string) => ({ title: "操作", width: 100, render: (_: any, r: any) => (
    <Space><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(t as any, r)} /><Popconfirm title="确定删除?" onConfirm={() => handleDelete(t, r.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space>
  )});

  const lowStock = inventory.filter((i: any) => i.quantity <= (i.safety_stock || 0));

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="供应商" value={suppliers.length} prefix={<ShopOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="采购单" value={pos.length} prefix={<ShoppingCartOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="仓库" value={warehouses.length} prefix={<EnvironmentOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="库存预警" value={lowStock.length} prefix={<InboxOutlined />} valueStyle={{ color: lowStock.length ? "#cf1322" : "#3f8600" }} /></Card></Col>
      </Row>

      <Card title="供应链管理中心" extra={
        <Space>
          <Button onClick={() => openCreate("supplier")} icon={<PlusOutlined />}>供应商</Button>
          <Button onClick={() => openCreate("po")} icon={<PlusOutlined />}>采购单</Button>
          <Button onClick={() => openCreate("inventory")} icon={<PlusOutlined />}>库存</Button>
        </Space>
      }>
        <Tabs items={[
          { key: "suppliers", label: `供应商 (${suppliers.length})`,
            children: <Table rowKey="id" size="small" pagination={false} dataSource={suppliers} columns={[
              { title: "名称", dataIndex: "name" }, { title: "编码", dataIndex: "code" },
              { title: "类别", dataIndex: "category" }, { title: "联系人", dataIndex: "contact_person" },
              { title: "评级", dataIndex: "rating", render: (v: number) => <Tag color={v >= 4 ? "green" : v >= 2 ? "orange" : "red"}>{v}</Tag> },
              actionCol("supplier"),
            ]} />,
          },
          { key: "pos", label: `采购单 (${pos.length})`,
            children: <Table rowKey="id" size="small" pagination={false} dataSource={pos} columns={[
              { title: "PO号", dataIndex: "po_no" }, { title: "供应商", dataIndex: "supplier_id" },
              { title: "数量", dataIndex: "quantity" }, { title: "单价", dataIndex: "unit_price" },
              { title: "总金额", dataIndex: "total_amount" },
              { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
              actionCol("po"),
            ]} />,
          },
          { key: "warehouses", label: `仓库 (${warehouses.length})`,
            children: <Table rowKey="id" size="small" pagination={false} dataSource={warehouses} columns={[
              { title: "名称", dataIndex: "name" }, { title: "编码", dataIndex: "code" }, { title: "位置", dataIndex: "location" },
              actionCol("warehouse"),
            ]} />,
          },
          { key: "inventory", label: `库存 (${inventory.length})`,
            children: <Table rowKey="id" size="small" pagination={false} dataSource={inventory} columns={[
              { title: "产品ID", dataIndex: "product_id" }, { title: "仓库ID", dataIndex: "warehouse_id" },
              { title: "当前", dataIndex: "quantity" }, { title: "安全库存", dataIndex: "safety_stock" },
              { title: "状态", render: (_: any, r: any) => r.quantity <= (r.safety_stock || 0) ? <Tag color="red">低库存</Tag> : <Tag color="green">正常</Tag> },
              actionCol("inventory"),
            ]} />,
          },
        ]} />
      </Card>

      <Modal title={`${editingId ? "编辑" : "新增"}${({supplier:"供应商",po:"采购单",warehouse:"仓库",inventory:"库存"})[modalType]}`}
        open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} width={480}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {modalType === "supplier" ? <>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="category" label="类别"><Input /></Form.Item>
            <Form.Item name="contact_person" label="联系人"><Input /></Form.Item>
            <Form.Item name="contact_phone" label="电话"><Input /></Form.Item>
          </> : modalType === "po" ? <>
            <Form.Item name="supplier_id" label="供应商ID" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="product_id" label="产品ID"><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="quantity" label="数量" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="unit_price" label="单价"><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="requester_id" label="申请人ID"><InputNumber style={{ width: "100%" }} /></Form.Item>
          </> : modalType === "inventory" ? <>
            <Form.Item name="product_id" label="产品ID" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="warehouse_id" label="仓库ID" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="quantity" label="数量"><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="safety_stock" label="安全库存"><InputNumber style={{ width: "100%" }} /></Form.Item>
          </> : <>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="code" label="编码"><Input /></Form.Item>
            <Form.Item name="location" label="位置"><Input /></Form.Item>
          </>}
        </Form>
      </Modal>
    </Space>
  );
}
