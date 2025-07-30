"use client";
import FormAssignor from "@/components/FormAssignor";
import { useMessage } from "@/contexts/MessageConext";
import { api } from "@/services";
import { useMutation } from "@tanstack/react-query";
import { Button, Flex, Form, Space, Typography } from "antd";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export default function Create() {
  const message = useMessage();
  const router = useRouter();
  const [form] = Form.useForm();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data) => {
      return api.post("/integrations/assignor", data).then((res) => res.data);
    },
    onSuccess: () => {
      message.success("Cedente cadastrado com sucesso!");
      form.resetFields();
    },
    onError: (error: AxiosError<any>) => {
      message.error(error?.response?.data?.message);
    }
  });

  return (
    <div>
      <Flex justify="space-between">
        <Typography.Title level={3}>Cadastrar Cedente</Typography.Title>
        <Space>
          <Button onClick={() => router.back()}>Voltar</Button>
        </Space>
      </Flex>
      <Form layout="vertical" form={form} onFinish={(data) => mutate(data)}>
        <FormAssignor />
        <Button type="primary" onClick={() => form.submit()} loading={isPending}>
          Salvar
        </Button>
      </Form>
    </div>
  );
}
