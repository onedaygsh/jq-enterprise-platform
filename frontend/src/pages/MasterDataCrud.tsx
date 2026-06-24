import { useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tabs, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "../services/api";

type EntityKey = "factories" | "workshops" | "lines" | "materials" | "boms" | "equipment";

const titles: Record<EntityKey, string> = {
  factories: "工厂",
  workshops: "车间",
  lines: "产线",
  materials: "物料",
  boms: "BOM",
  equipment: "设备台账",
};

export default function MasterDataCrud() {
  const [activeKey, setActiveKey] = useState<EntityKey>("factories");
  const [data, setData] = useState<Record<EntityKey, any[]>>({
    factories: [], workshops: [], lines: [], materials: [], boms: [], equipment: [],
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchAll = async () => {
    const [f, w, l, m, b, e] = await Promise.all([
      api.get("/master-data/factories"),
      api.get("/master-data/workshops"),
      api.get("/master-data/lines"),
      api.get("/master-data/materials"),
      api.get("/master-data/boms"),
      api.get("/master-data/equipment"),
    ]);
    setData({ factories: f.data, workshops: w.data, lines: l.data, materials: m.data, boms: b.data, equipment: e.data });
  };

  useEffect(() => { fetchAll(); }, []);

  const endpointMap: Record<EntityKey, string> = {
    factories: "/master-data/factories",
    workshops: "/master-data/workshops",
    lines: "/master-data/lines",
    materials: "/master-data/materials",
    boms: "/master-data/boms",
    equipment: "/master-data/equipment",
  };

  const columns = useMemo(() => {
    const base = {
      factories: [
        { title: "名称", dataIndex: "name" },
        { title: "编码", dataIndex: "code" },
        { title: "地点", dataIndex: "location" },
        { title: "状态", dataIndex: "is_active", render: (v: boolean) => (v ? "启用" : "停用") },
      ],
      workshops: [
        { title: "名称", dataIndex: "name" },
        { title: "编码", dataIndex: "code" },
        { title: "工厂ID", dataIndex: "factory_id" },
        { title: "状态", dataIndex: "is_active", render: (v: boolean) => (v ? "启用" : "停用") },
      ],
      lines: [
        { title: "名称", dataIndex: "name" },
        { title: "编码", dataIndex: "code" },
        { title: "车间ID", dataIndex: "workshop_id" },
        { title: "节拍", dataIndex: "takt_time" },
        { title: "状态", dataIndex: "status" },
      ],
      materials: [
        { title: "名称", dataIndex: "name" },
        { title: "编码", dataIndex: "code" },
        { title: "类别", dataIndex: "category" },
        { title: "单位", dataIndex: "unit" },
        { title: "安全库存", dataIndex: "safe_stock" },
      ],
      boms: [
        { title: "产品ID", dataIndex: "product_id" },
        { title: "物料ID", dataIndex: "material_id" },
        { title: "版本", dataIndex: "version" },
        { title: "数量", dataIndex: "quantity" },
        { title: "损耗率", dataIndex: "loss_rate" },
        { title: "状态", dataIndex: "status" },
      ],
      equipment: [
        { title: "名称", dataIndex: "name" },
        { title: "编码", dataIndex: "code" },
        { title: "车间ID", dataIndex: "workshop_id" },
        { title: "产线ID", dataIndex: "line_id" },
        { title: "状态", dataIndex: "status" },
        { title: "OEE", dataIndex: "oee" },
      ],
    };
    return base[activeKey];
  }, [activeKey]);

  const formFields: Record<EntityKey, React.ReactNode> = {
    factories: <><Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="location" label="地点"><Input /></Form.Item></>,
    workshops: <><Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="factory_id" label="工厂ID" rules={[{ required: true }]}><Input type="number" /></Form.Item></>,
    lines: <><Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="workshop_id" label="车间ID" rules={[{ required: true }]}><Input type="number" /></Form.Item><Form.Item name="takt_time" label="节拍"><Input /></Form.Item></>,
    materials: <><Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="category" label="类别"><Input /></Form.Item><Form.Item name="unit" label="单位" initialValue="pcs"><Input /></Form.Item><Form.Item name="safe_stock" label="安全库存"><Input type="number" /></Form.Item></>,
    boms: <><Form.Item name="product_id" label="产品ID"><Input type="number" /></Form.Item><Form.Item name="material_id" label="物料ID"><Input type="number" /></Form.Item><Form.Item name="version" label="版本" initialValue="V1.0"><Input /></Form.Item><Form.Item name="quantity" label="数量"><Input type="number" /></Form.Item><Form.Item name="loss_rate" label="损耗率"><Input type="number" /></Form.Item></>,
    equipment: <><Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="workshop_id" label="车间ID"><Input type="number" /></Form.Item><Form.Item name="line_id" label="产线ID"><Input type="number" /></Form.Item><Form.Item name="oee" label="OEE"><Input type="number" /></Form.Item></>,
  };

  const handleSave = async (values: any) => {
    await api.post(endpointMap[activeKey], values);
    message.success("保存成功");
    setModalOpen(false);
    form.resetFields();
    fetchAll();
  };

  return (
    <Card
      title="主数据维护"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新增</Button>}
    >
      <Tabs
        activeKey={activeKey}
        onChange={(k) => setActiveKey(k as EntityKey)}
        items={(Object.keys(titles) as EntityKey[]).map((key) => ({
          key,
          label: titles[key],
          children: <Table rowKey="id" pagination={false} columns={columns} dataSource={data[key]} />,
        }))}
      />

      <Modal title={`新增${titles[activeKey]}`} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          {formFields[activeKey]}
        </Form>
      </Modal>
    </Card>
  );
}
