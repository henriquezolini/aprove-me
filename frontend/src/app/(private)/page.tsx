"use client";
import { api } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { Button, Flex, Space, Table, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

type Assignor = {
  id: string;
  name: string;
};

export default function Home() {
  const router = useRouter();
  const { data, isLoading, refetch } = useQuery<Assignor[]>({
    queryKey: ["/integrations/assignor"],
    queryFn: async () => {
      const response = await api.get("/integrations/assignor");
      return response.data;
    },
    initialData: []
  });

  return (
    <div>
      <Flex justify="space-between">
        <Typography.Title level={3}>Cedentes</Typography.Title>
        <Space>
          <Button onClick={() => refetch} icon={<ReloadOutlined />} title="Atualizar" />
          <Button type="default" onClick={() => router.push("/assignor/create")}>
            Cadastrar Cedente
          </Button>
          <Button type="primary" onClick={() => router.push("/payable/create")}>
            Cadastrar Recebível
          </Button>
        </Space>
      </Flex>
      <Table
        dataSource={data}
        columns={[
          {
            title: "Name",
            dataIndex: "name",
            key: "name"
          },
          {
            title: "document",
            dataIndex: "document",
            key: "document"
          },
          {
            title: "email",
            dataIndex: "email",
            key: "email"
          },
          {
            title: "phone",
            dataIndex: "phone",
            key: "phone"
          },
          {
            title: "Ações",
            dataIndex: "actions",
            key: "actions",
            width: 250,
            render: (_, record) => {
              return (
                <Space>
                  <Button type="dashed" onClick={() => router.push(`/assignor/${record.id}`)}>
                    Detalhes
                  </Button>
                  <Button onClick={() => router.push(`/payable/assignor/${record.id}`)}>
                    Ver Recebíveis
                  </Button>
                </Space>
              );
            }
          }
        ]}
        loading={isLoading}
        rowKey="id"
      />
    </div>
  );
}
