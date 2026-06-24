import { Card, Col, List, Row, Steps, Typography } from "antd";
import api from "../services/api";
import { useEffect, useState } from "react";

export default function GroupBlueprint() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/group/blueprint").then((res) => setData(res.data));
  }, []);

  return (
    <div>
      <Typography.Title level={2}>平台蓝图</Typography.Title>
      <Typography.Paragraph style={{ maxWidth: 1000 }}>
        这里展示鲸祺集团平台的分层结构、建设原则和实施阶段，方便和全景页互相切换。
      </Typography.Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="建设原则">
            <List dataSource={data?.principles || []} renderItem={(item: string) => <List.Item>{item}</List.Item>} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="实施阶段">
            <Steps
              direction="vertical"
              current={0}
              items={(data?.phases || []).map((item: any) => ({ title: item.phase, description: item.focus }))}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {(data?.domains || []).map((domain: any) => (
          <Col xs={24} sm={12} lg={6} key={domain.name}>
            <Card title={domain.name} size="small">
              <List size="small" dataSource={domain.items} renderItem={(item: string) => <List.Item>{item}</List.Item>} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
