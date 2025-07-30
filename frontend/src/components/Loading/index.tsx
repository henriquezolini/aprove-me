import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import React, { CSSProperties, ReactNode } from "react";

type LoadingProps = {
  visible?: boolean;
  children?: ReactNode;
  height?: number | string;
  style?: CSSProperties;
};

export default function Loading({ visible = true, children, height = 25, style }: LoadingProps) {
  return visible ? (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: height,
        ...style
      }}
    >
      <Spin indicator={<LoadingOutlined spin />} />
    </div>
  ) : (
    <>{children}</>
  );
}
