import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Statistic, Table, Tabs, Tag, message } from "antd";
import { PlusOutlined, ShopOutlined, InboxOutlined, ShoppingCartOutlined, EnvironmentOutlined } from "@ant-design/icons";
import api from "../services/api";

export default function SupplyChain() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"supplier" | "po" | "warehouse" | "inventory">("supplier");
  const [form] = Form.useForm();

  const fetchAll = async () => {
    const [s, p, w, i] = await Promise.all([
      api.get("/supply-chain/suppliers"),
      api.get("/supply-chain/purchase-orders"),
      api.get("/supply-chain/warehouses"),
      api.get("/supply-chain/inventory"),
    ]);
    setSuppliers(s.data); setPos(p.data); setWarehouses(w.data); setInventory(i.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (values: any) => {
    try {
      const endpoint: Record<string, string> = { supplier: "/supply-chain/suppliers", po: "/supply-chain/purchase-orders", warehouse: "/supply-chain/warehouses", inventory: "/supply-chain/inventory" };
      if (modalType === "po") values.total_amount = (values.quantity || 0) * (values.unit_price || 0);
      await api.post(endpoint[modalType], values);
      message.success("创建成功"); setModalOpen(false); form.resetFields(); fetchAll();
    } catch (e: any) { message.error(e?.response?.data?.detail || "操作失败"); }
  };

  const lowStock = inventory.filter((i: any) => i.quantity <= (i.safety_stock || 0));

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card><Statistic title="供应商" value={suppliers.length} prefix={<ShopOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="采购订单" value={pos.length} prefix={<ShoppingCartOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="仓库" value={warehouses.length} prefix={<EnvironmentOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="库存预警" value={lowStock.length} prefix={<InboxOutlined />} valueStyle={{ color: lowStock.length ? "#cf1322" : undefined }} /></Card></Col>
      </Row>

      <Card title="供应链管理中心" extra={
        <Space>
          <Button onClick={() => { setModalType("supplier"); setModalOpen(true); }} icon={<PlusOutlined />}>新增供应商</Button>
          <Button onClick={() => { setModalType("po"); setModalOpen(true); }} icon={<PlusOutlined />}>新增采购单</Button>
          <Button onClick={() => { setModalType("inventory"); setModalOpen(true); }} icon={<PlusOutlined />}>新增库存</Button>
        </Space>
      }>
        <Tabs items={[
          {
            key: "suppliers", label: "供应商",
            children: <Table rowKey="id" pagination={false} dataSource={suppliers} columns={[
              { title: "名称", dataIndex: "name" }, { title: "编码", dataIndex: "code" },
              { title: "类别", dataIndex: "category" }, { title: "联系人", dataIndex: "contact_person" },
              { title: "评级", dataIndex: "rating", render: (v: number) => <Tag color={v >= 4 ? "green" : v >= 2 ? "orange" : "red"}>{v}</Tag> },
            ]} />,
          },
          {
            key: "pos", label: "采购订单",
            children: <Table rowKey="id" pagination={false} dataSource={pos} columns={[
              { title: "PO号", dataIndex: "po_no" }, { title: "供应商ID", dataIndex: "supplier_id" },
              { title: "数量", dataIndex: "quantity" }, { title: "单价", dataIndex: "unit_price" },
              { title: "总金额", dataIndex: "total_amount" },
              { title: "状态", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
            ]} />,
          },
          {
            key: "warehouses", label: "仓库",
            children: <Table rowKey="id" pagination={false} dataSource={warehouses} columns={[
              { title: "名称", dataIndex: "name" }, { title: "编码", dataIndex: "code" }, { title: "位置", dataIndex: "location" },
            ]} />,
          },
          {
            key: "inventory", label: "库存",
            children: <Table rowKey="id" pagination={false} dataSource={inventory} columns={[
              { title: "产品ID", dataIndex: "product_id" }, { title: "仓库ID", dataIndex: "warehouse_id" },
              { title: "当前库存", dataIndex: "quantity" }, { title: "安全库存", dataIndex: "safety_stock" },
              { title: "最大库存", dataIndex: "max_stock" },
              { title: "状态", render: (_: any, r: any) => r.quantity <= (r.safety_stock || 0) ? <Tag color="red">低库存</Tag> : <Tag color="green">正常</Tag> },
            ]} />,
          },
        ]} />
      </Card>

      <Modal title={{ supplier: "新增供应商", po: "新增采购订单", warehouse: "新增仓库", inventory: "新增库存记录" }[modalType]}
        open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} width={500}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {modalType === "supplier" ? <>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="category" label="类别"><Input /></Form.Item>
            <Form.Item name="contact_person" label="联系人"><Input /></Form.Item>
            <Form.Item name="contact_phone" label="电话"><Input /></Form.Item>
          </> : modalType === "po" ? <>
            <Form.Item name="supplier_id" label="供应商ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="product_id" label="产品ID"><Input type="number" /></Form.Item>
            <Form.Item name="quantity" label="数量" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="unit_price" label="单价" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
            <Form.Item name="requester_id" label="申请人ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          </> : modalType === "inventory" ? <>
            <Form.Item name="product_id" label="产品ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="warehouse_id" label="仓库ID" rules={[{ required: true }]}><Input type="number" /></Form.Item>
            <Form.Item name="quantity" label="当前数量" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
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
