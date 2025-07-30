import { ReactNode } from "react";
import { BackgroundArea, LoginBox } from "./styles";
import { Alert, Card, Typography } from "antd";

type BoxLoginProps = {
  description: ReactNode;
  children: ReactNode;
};

export default function BoxLogin({ children }: BoxLoginProps) {
  return (
    <BackgroundArea>
      <LoginBox>
        <Card>
          <div className="my-4">
            <div className="text-center">
              <Typography.Title level={3}>Sistema de Recebíveis</Typography.Title>
            </div>
            <Alert
              message="Informações de Login"
              description={
                <>
                  U: aprovame
                  <br />
                  S: aprovame
                </>
              }
              type="info"
              className="mb-4 mx-5"
              showIcon
            />
            {children}
          </div>
        </Card>
      </LoginBox>
    </BackgroundArea>
  );
}
