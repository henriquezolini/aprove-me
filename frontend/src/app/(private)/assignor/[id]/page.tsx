"use client";
import { Loading } from "@/components";
import FormAssignor from "@/components/FormAssignor";
import { api } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { Button, Flex, Form, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

type routeParams = {
  params: {
    id: string;
  };
};

type Assignor = {
  id: string;
  name: string;
};

export default function View({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [form] = Form.useForm();

  const { id } = use(params);

  const { data, isLoading } = useQuery<Assignor[]>({
    queryKey: [`/integrations/assignor/${id}`],
    queryFn: async () => {
      const response = await api.get(`/integrations/assignor/${id}`);
      return response.data;
    }
  });

  useEffect(() => {
    form.setFieldsValue(data);
  }, [data]);

  if (isLoading) {
    <Loading />;
  }

  return (
    <div>
      <Flex justify="space-between">
        <Typography.Title level={3}>Cedente ({id})</Typography.Title>
        <Space>
          <Button onClick={() => router.back()}>Voltar</Button>
        </Space>
      </Flex>
      <Form layout="vertical" form={form}>
        <FormAssignor readOnly />
      </Form>
    </div>
  );
}
