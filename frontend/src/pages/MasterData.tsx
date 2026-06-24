import { useEffect, useState } from "react";
import { Card, Col, Descriptions, List, Row, Space, Table, Tabs, Typography } from "antd";
import api from "../services/api";

export default function MasterData() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/group/master-data").then((res) => setData(res.data));
  }, []);

  const sections = data?.sections || [];
  const records = data?.records || {};

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={2}>主数据中心</Typography.Title>
        <Typography.Paragraph style={{ maxWidth: 1000, marginBottom: 0 }}>
          统一组织、工厂、车间、产线、物料、BOM、设备台账，作为鲸祺集团全系统的编码底座。
        </Typography.Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        {sections.map((section: any) => (
          <Col xs={24} sm={12} lg={8} key={section.name}>
            <Card title={section.name}>
              <List size="small" dataSource={section.items} renderItem={(item: string) => <List.Item>{item}</List.Item>} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Tabs
          items={[
            {
              key: "organizations",
              label: "组织架构",
              children: <Table rowKey="id" pagination={false} dataSource={records.organizations || []} columns={[
                { title: "名称", dataIndex: "name" },
                { title: "编码", dataIndex: "code" },
                { title: "上级", dataIndex: "parent" },
                { title: "层级", dataIndex: "level" },
                { title: "状态", dataIndex: "status" },
              ]} />,
            },
            {
              key: "factories",
              label: "工厂",
              children: <Table rowKey="id" pagination={false} dataSource={records.factories || []} columns={[
                { title: "名称", dataIndex: "name" },
                { title: "编码", dataIndex: "code" },
                { title: "地点", dataIndex: "location" },
                { title: "状态", dataIndex: "status" },
              ]} />,
            },
            {
              key: "workshops",
              label: "车间",
              children: <Table rowKey="id" pagination={false} dataSource={records.workshops || []} columns={[
                { title: "名称", dataIndex: "name" },
                { title: "编码", dataIndex: "code" },
                { title: "所属工厂", dataIndex: "factory" },
                { title: "状态", dataIndex: "status" },
              ]} />,
            },
            {
              key: "lines",
              label: "产线",
              children: <Table rowKey="id" pagination={false} dataSource={records.lines || []} columns={[
                { title: "名称", dataIndex: "name" },
                { title: "编码", dataIndex: "code" },
                { title: "所属车间", dataIndex: "workshop" },
                { title: "节拍", dataIndex: "takt_time" },
                { title: "状态", dataIndex: "status" },
              ]} />,
            },
            {
              key: "materials",
              label: "物料",
              children: <Table rowKey="id" pagination={false} dataSource={records.materials || []} columns={[
                { title: "名称", dataIndex: "name" },
                { title: "编码", dataIndex: "code" },
                { title: "单位", dataIndex: "unit" },
                { title: "类别", dataIndex: "category" },
                { title: "安全库存", dataIndex: "safe_stock" },
              ]} />,
            },
            {
              key: "boms",
              label: "BOM",
              children: <Table rowKey="id" pagination={false} dataSource={records.boms || []} columns={[
                { title: "产品", dataIndex: "product" },
                { title: "版本", dataIndex: "version" },
                { title: "物料数", dataIndex: "materialCount" },
                { title: "状态", dataIndex: "status" },
              ]} />,
            },
            {
              key: "equipments",
              label: "设备台账",
              children: <Table rowKey="id" pagination={false} dataSource={records.equipments || []} columns={[
                { title: "设备名称", dataIndex: "name" },
                { title: "编码", dataIndex: "code" },
                { title: "产线", dataIndex: "line" },
                { title: "状态", dataIndex: "status" },
                { title: "OEE", dataIndex: "oee" },
              ]} />,
            },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="主数据治理重点">
            <List
              dataSource={[
                "统一编码：组织、物料、设备必须一物一码",
                "统一版本：BOM、工艺、设备参数必须可追溯",
                "统一归属：工厂、车间、产线、设备关系固定",
                "统一权限：主数据新增、变更、审核分权控制",
              ]}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="主数据应用路径">
            <List
              dataSource={[
                "订单下达前先校验组织与物料主数据",
                "工单生成时自动带出 BOM 与工艺路线",
                "报工与入库按产线与设备回写",
                "设备点检与保养绑定设备台账",
              ]}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
      </Row>

      <Card title="主数据治理规则">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="组织">集团、事业部、工厂、部门分层统一</Descriptions.Item>
          <Descriptions.Item label="物料">一物一码，编码规则统一，禁止多口径并存</Descriptions.Item>
          <Descriptions.Item label="BOM">版本化管理，生效/失效可追溯</Descriptions.Item>
          <Descriptions.Item label="设备">设备台账、状态、保养、备件一体管理</Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
}
