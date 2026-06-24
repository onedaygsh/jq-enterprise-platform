import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
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
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(180deg, #102a43 0%, #16324f 45%, #eef3f7 45%, #eef3f7 100%)" }}>
      <Card style={{ width: 440, boxShadow: "0 18px 50px rgba(0,0,0,0.18)" }}>
        <Typography.Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>鲸祺集团统一运营平台</Typography.Title>
        <Typography.Paragraph style={{ color: "#666" }}>登录后进入集团驾驶舱。</Typography.Paragraph>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>进入平台</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
