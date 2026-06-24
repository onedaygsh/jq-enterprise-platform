import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { UserOutlined, LockOutlined, ThunderboltOutlined } from "@ant-design/icons";
import api from "../services/api";
import { useAuthStore } from "../stores/authStore";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", values);
      const { access_token } = res.data;
      const me = await api.get("/auth/me", { headers: { Authorization: `Bearer ${access_token}` } });
      setAuth(access_token, me.data);
      message.success("登录成功");
      navigate("/dashboard");
    } catch {
      message.error("用户名或密码错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(180deg, #0d1b2a 0%, #1b2838 40%, #415a77 40%, #778da9 100%)" }}>
      <Card style={{ width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", borderRadius: 12 }} bordered={false}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🐳</div>
          <Typography.Title level={2} style={{ margin: 0 }}>鲸祺集团统一运营平台</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>集团级数字化管理 · ERP/MES 一体化</Typography.Paragraph>
        </div>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" autoFocus />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block icon={<ThunderboltOutlined />}>
              进入平台
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: "center", color: "#999", fontSize: 12 }}>默认账户: admin / admin123</div>
      </Card>
    </div>
  );
}
