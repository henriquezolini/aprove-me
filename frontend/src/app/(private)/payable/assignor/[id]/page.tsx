"use client";
import { Loading } from "@/components";
import FormAssignor from "@/components/FormAssignor";
import { api } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { Button, Flex, Form, Space, Table, Typography } from "antd";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

type Assignor = {
  id: string;
  name: string;
};

export default function View({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [form] = Form.useForm();

  const { id } = use(params);

  const { data, isLoading, refetch } = useQuery<Assignor[]>({
    queryKey: [`/integrations/payable/assignor/${id}`],
    queryFn: async () => {
      const response = await api.get(`/integrations/payable/assignor/${id}`);
      return response.data;
    },
    initialData: []
  });

  return (
    <div>
      <Flex justify="space-between">
        <Typography.Title level={3}>Recebíveis ({id})</Typography.Title>
        <Space>
          <Button onClick={() => router.back()}>Voltar</Button>
        </Space>
      </Flex>
      <Table
        dataSource={data}
        columns={[
          {
            title: "Valor",
            dataIndex: "value",
            key: "value",
            render: (value: number) => {
              return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
            }
          },
          {
            title: "Data",
            dataIndex: "emissionDate",
            key: "emissionDate",
            render: (value: string | Date) => {
              if (!value) return "";
              const date = typeof value === "string" ? new Date(value) : value;
              return date.toLocaleDateString("pt-BR");
            }
          }
        ]}
        loading={isLoading}
        rowKey="id"
      />
    </div>
  );
}
