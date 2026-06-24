import { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Statistic, Table, Tag, Typography, List, Space, Progress, Drawer, Tree, Badge, Empty, Button } from "antd";
import { AimOutlined, DashboardOutlined, DollarOutlined, DatabaseOutlined, ApartmentOutlined, BuildOutlined, ToolOutlined, TruckOutlined, SafetyCertificateOutlined, BarChartOutlined } from "@ant-design/icons";
import api from "../services/api";

type TreeNode = { name: string; code: string; children?: TreeNode[] };

const toTree = (node: TreeNode): any => ({ title: <span><Badge status="processing" /> {node.name} <Tag style={{ marginLeft: 8 }}>{node.code}</Tag></span>, key: node.code, children: node.children?.map(toTree) });

export default function Dashboard() {
  const [blueprint, setBlueprint] = useState<any>(null);
  const [masterData, setMasterData] = useState<any>(null);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [mfg, setMfg] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [focusNode, setFocusNode] = useState<{level:string;name:string;code:string}|null>(null);
  const [activeFilter, setActiveFilter] = useState<{level:string;name:string;code:string}|null>(null);

  useEffect(() => { Promise.all([api.get("/group/blueprint"),api.get("/group/master-data"),api.get("/group/master-data/hierarchy"),api.get("/manufacturing/oee"),api.get("/business/orders")]).then(([bp,md,hi,oee,ord]) => { setBlueprint(bp.data); setMasterData(md.data); setHierarchy(hi.data); setMfg(oee.data); setOrders(ord.data||[]); }); }, []);

  const md = masterData?.records || {};
  const treeData = hierarchy?.group ? [toTree(hierarchy.group)] : [];

  const filteredLines = useMemo(() => {
    const lines = md.lines || [];
    if (!activeFilter) return lines;
    if (activeFilter.level === '\u5de5\u5382') return lines.filter((l:any) => (md.workshops||[]).some((w:any) => w.name===l.workshop && w.factory===activeFilter.name));
    if (activeFilter.level === '\u8f66\u95f4') return lines.filter((l:any) => l.workshop===activeFilter.name);
    if (activeFilter.level === '\u4ea7\u7ebf') return lines.filter((l:any) => l.name===activeFilter.name);
    return lines;
  }, [activeFilter, md]);

  const open = (l:string,n:string,c:string) => { setFocusNode({level:l,name:n,code:c}); setDrawerOpen(true); };

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <div>
        <Typography.Title level={3}>
          \u9cb8\u797a\u96c6\u56e2\u9a7e\u9a76\u8231
          {activeFilter && <Tag color="blue" closable onClose={()=>setActiveFilter(null)} style={{marginLeft:12}}>{activeFilter.level}:{activeFilter.name}</Tag>}
        </Typography.Title>
      </div>
      <Row gutter={[16,16]}>
        <Col xs={6}><Card><Statistic title="\u6a21\u5757" value={8} prefix={<DatabaseOutlined />} /></Card></Col>
        <Col xs={6}><Card><Statistic title="\u4e3b\u6570\u636e" value={6} prefix={<ApartmentOutlined />} /></Card></Col>
        <Col xs={6}><Card><Statistic title="\u8ba2\u5355" value={orders.filter((o:any)=>!["completed","cancelled"].includes(o.status)).length} prefix={<DashboardOutlined />} /></Card></Col>
        <Col xs={6}><Card><Statistic title="OEE" value={`${mfg?.oee??0}%`} prefix={<BarChartOutlined />} /></Card></Col>
      </Row>
      <Row gutter={[16,16]}>
        <Col xs={24} lg={5}>
          <Card title="\u56db\u7ea7\u7a7f\u900f" size="small">
            <Tree defaultExpandAll treeData={treeData} onSelect={(_,info)=>{const k=String((info.node as any).key);const l=k.startsWith('F')?'\u5de5\u5382':k.startsWith('W')?'\u8f66\u95f4':k.startsWith('L')?'\u4ea7\u7ebf':'\u96c6\u56e2';open(l,String((info.node as any).title),k);}} />
          </Card>
        </Col>
        <Col xs={24} lg={19}>
          <Row gutter={[16,16]}>
            {[{t:"\u6218\u7565\u7ba1\u7406",i:<AimOutlined/>,c:"#1677ff"},{t:"\u7ecf\u8425\u7ba1\u7406",i:<DashboardOutlined/>,c:"#13c2c2"},{t:"\u4e3b\u6570\u636e\u4e2d\u5fc3",i:<ApartmentOutlined/>,c:"#722ed1"},{t:"\u5236\u9020\u6267\u884c",i:<BuildOutlined/>,c:"#fa541c"},{t:"\u8d28\u91cf\u7ba1\u7406",i:<SafetyCertificateOutlined/>,c:"#faad14"},{t:"\u4f9b\u5e94\u94fe",i:<TruckOutlined/>,c:"#52c41a"},{t:"\u8d22\u52a1\u7ba1\u7406",i:<DollarOutlined/>,c:"#722ed1"},{t:"\u5e73\u53f0\u5e95\u5ea7",i:<ToolOutlined/>,c:"#08979c"}].map(m=>(
              <Col xs={12} lg={6} key={m.t}><Card size="small" hoverable style={{borderLeft:`3px solid ${m.c}`,cursor:"pointer"}}><div style={{display:"flex",gap:8,alignItems:"center"}}><div style={{color:m.c,fontSize:18}}>{m.i}</div><div style={{fontWeight:600,fontSize:13}}>{m.t}</div></div></Card></Col>))}
          </Row>
        </Col>
      </Row>
      <Row gutter={[16,16]}>
        <Col xs={24} lg={12}>
          <Card title={activeFilter?`${activeFilter.name} - \u4ea7\u7ebf`:"\u5168\u96c6\u56e2 - \u4ea7\u7ebf"} size="small">
            <Table rowKey="code" pagination={false} size="small" dataSource={filteredLines} columns={[{title:"\u4ea7\u7ebf",dataIndex:"name"},{title:"\u8282\u62cd",dataIndex:"takt_time"},{title:"\u72b6\u6001",dataIndex:"status",render:(v:string)=><Tag color={v==="\u8fd0\u884c"?"green":"orange"}>{v}</Tag>}]} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="\u8bbe\u5907" size="small">
            <Table rowKey="code" pagination={false} size="small" dataSource={(md.equipments||[]).filter((e:any)=>!activeFilter||activeFilter.level!=="\u4ea7\u7ebf"||e.line===activeFilter.name)} columns={[{title:"\u540d\u79f0",dataIndex:"name"},{title:"OEE",dataIndex:"oee",render:(v:number)=><Progress percent={Math.round(v)} size="small"/>}]} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16,16]}>
        <Col span={6}><Progress type="circle" percent={mfg?.availability??0} size={80} format={p=>`${p}%`}/><div style={{textAlign:"center",marginTop:8}}>\u53ef\u7528\u7387</div></Col>
        <Col span={6}><Progress type="circle" percent={mfg?.performance??0} size={80} format={p=>`${p}%`}/><div style={{textAlign:"center",marginTop:8}}>\u6027\u80fd</div></Col>
        <Col span={6}><Progress type="circle" percent={mfg?.quality??0} size={80} format={p=>`${p}%`}/><div style={{textAlign:"center",marginTop:8}}>\u8d28\u91cf</div></Col>
        <Col span={6}><Progress type="circle" percent={mfg?.oee??0} size={80} format={p=>`${p}%`}/><div style={{textAlign:"center",marginTop:8}}>OEE</div></Col>
      </Row>
      <Drawer title={focusNode?`${focusNode.name}`:"\u8be6\u60c5"} open={drawerOpen} onClose={()=>setDrawerOpen(false)} width={360}
        footer={<Button type="primary" onClick={()=>{setActiveFilter(focusNode);setDrawerOpen(false);}}>\u6309\u6b64\u5c42\u7ea7\u8fc7\u6ee4</Button>}>
        {focusNode && <Space direction="vertical" size={16} style={{width:"100%"}}>
          <Card size="small"><Statistic title="\u5c42\u7ea7" value={focusNode.level}/><Tag>{focusNode.code}</Tag></Card>
          <Card size="small" title="\u6307\u6807"><List size="small" dataSource={["\u4ea7\u91cf","\u826f\u7387","OEE","\u62a5\u8b66\u6570"]} renderItem={i=><List.Item>{i}</List.Item>}/></Card>
        </Space>}
      </Drawer>
    </Space>
  );
}
