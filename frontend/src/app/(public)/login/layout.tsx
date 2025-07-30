"use client";
import { ReactNode } from "react";
import { BoxLogin } from "@/components";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return <BoxLogin description="Seja bem vindo!">{children}</BoxLogin>;
}
