"use client";
import { useState } from "react";
import { Row, Col, Form, Input, Button } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";

import { useMessage } from "@/contexts/MessageConext";
import { signInTypes } from "@/contexts/AuthContext.types";
import { useAuth } from "@/hooks";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const message = useMessage();

  const [form] = Form.useForm();

  // const autoFocus = createRef<HTMLInputElement>();

  // useEffect(() => {
  //   autoFocus.current!.focus();
  // }, []);

  const onFinish = async (values: signInTypes) => {
    await signIn(values, setLoading).catch((error) => {
      message.error(error.response.data.message);
    });
  };

  return (
    <Row justify="center">
      <Col xs={24} sm={24} md={20} lg={20}>
        <Form layout="vertical" name="login-form" form={form} onFinish={onFinish}>
          <Form.Item
            name="login"
            label="Usuário"
            rules={[
              {
                required: true,
                message: "Informe o seu login."
              }
            ]}
          >
            <Input prefix={<MailOutlined className="text-primary" />} />
          </Form.Item>
          <Form.Item
            name="password"
            label={
              <div
                className={"d-flex justify-content-between w-100 align-items-center"}
                style={{ justifyContent: "space-between" }}
              >
                <span>Senha</span>
              </div>
            }
            rules={[
              {
                required: true,
                message: "Informe sua senha."
              }
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-primary" />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
}
