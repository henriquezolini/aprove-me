"use client";
import React from "react";
import { Button, Flex, Layout, theme, Typography } from "antd";
import { useAuth } from "@/hooks";

const { Header, Content } = Layout;

export default function PrivateLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    token: { colorPrimary }
  } = theme.useToken();

  const { signOut } = useAuth();

  return (
    <Layout>
      <Header style={{ background: colorPrimary, padding: 15 }}>
        <Flex justify="space-between">
          <Typography.Title level={3} style={{ color: "white" }}>
            Sistema de Recebíveis
          </Typography.Title>
          <Button type="default" onClick={signOut}>
            Logout
          </Button>
        </Flex>
      </Header>
      <Content style={{ padding: 30 }}>{children}</Content>
    </Layout>
  );
}
