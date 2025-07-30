"use client";
import { api } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { Row, Col, Form, InputNumber, DatePicker, Select } from "antd";

interface FormDateValueProps {
  readOnly?: boolean;
}

type Assignor = {
  id: string;
  name: string;
};

export default function FormPayable({ readOnly = false }: FormDateValueProps) {
  const { data, isLoading } = useQuery<Assignor[]>({
    queryKey: ["/integrations/assignor"],
    queryFn: async () => {
      const response = await api.get("/integrations/assignor");
      return response.data;
    },
    initialData: []
  });

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={12}>
        <Form.Item
          name="emissionDate"
          label="Data"
          rules={[{ required: true, message: "Data é obrigatória" }]}
        >
          <DatePicker
            format="DD/MM/YYYY"
            style={{ width: "100%" }}
            disabled={readOnly}
            placeholder="Selecione uma data"
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={24} md={12}>
        <Form.Item
          name="value"
          label="Valor"
          rules={[{ required: true, message: "Valor é obrigatório" }]}
        >
          <InputNumber<number>
            style={{ width: "100%" }}
            disabled={readOnly}
            precision={2}
            formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            parser={(value) => Number(value?.replace(/[R$\s.]/g, "").replace(",", ".")) || 0}
            min={0}
            placeholder="Digite o valor"
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={24} md={24} lg={8} xl={8}>
        <Form.Item name="assignor" label="Cedente" rules={[{ required: true }]}>
          <Select
            options={data}
            loading={isLoading}
            fieldNames={{ label: "name", value: "id" }}
            placeholder="Selecione..."
            className="readOnlyDisabled"
            disabled={!!readOnly}
            showSearch
          />
        </Form.Item>
      </Col>
    </Row>
  );
}
