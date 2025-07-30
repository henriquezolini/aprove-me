import React, { createContext, useContext, ReactNode } from "react";
import { message } from "antd";

type MessageApiType = ReturnType<typeof message.useMessage>[0];

const MessageContext = createContext<MessageApiType | null>(null);

type MessageProviderProps = {
  children: ReactNode;
};

export const MessageProvider = ({ children }: MessageProviderProps) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <MessageContext.Provider value={messageApi}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};
