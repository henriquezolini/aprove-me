"use client";
import { Row, Col, Form, Input } from "antd";

interface FormAssignorProps {
  readOnly?: boolean;
}

function formatPhone(value: string) {
  return value.replace(/\D/g, "").replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) => {
    let result = "";
    if (a) result += `(${a}`;
    if (a && a.length === 2) result += `) `;
    if (b) result += b;
    if (b && b.length === 4) result += `-`;
    if (c) result += c;
    return result;
  });
}

function formatCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2}).*/, (_, a, b, c, d) => {
      let result = "";
      if (a) result += a;
      if (b) result += `.${b}`;
      if (c) result += `.${c}`;
      if (d) result += `-${d}`;
      return result;
    });
}

export default function FormAssignor({ readOnly = false }: FormAssignorProps) {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={24} lg={12} xl={12}>
        <Form.Item
          name="name"
          label="Nome"
          rules={[{ required: true, message: "Nome é obrigatório" }]}
        >
          <Input readOnly={readOnly} autoFocus />
        </Form.Item>
      </Col>

      <Col xs={24} sm={24} md={24} lg={12} xl={12}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email é obrigatório" },
            { type: "email", message: "Email inválido" }
          ]}
        >
          <Input readOnly={readOnly} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={24} md={24} lg={12} xl={12}>
        <Form.Item
          name="phone"
          label="Telefone"
          normalize={(value) => formatPhone(value)}
          rules={[{ required: true, message: "Telefone é obrigatório" }]}
        >
          <Input readOnly={readOnly} maxLength={14} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={24} md={24} lg={12} xl={12}>
        <Form.Item
          name="document"
          label="Documento (CPF)"
          normalize={(value) => formatCPF(value)}
          rules={[{ required: true, message: "CPF é obrigatório" }]}
        >
          <Input readOnly={readOnly} maxLength={14} />
        </Form.Item>
      </Col>
    </Row>
  );
}
