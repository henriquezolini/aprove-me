"use client";

import React, { createContext, useEffect, ReactNode } from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import { useGlobalState } from "../hooks";
import { useRouter } from "next/navigation";
import { api } from "@/services";
import { signInTypes, AuthContextType } from "./AuthContext.types";
import { AxiosResponseHeaders } from "axios";

export const tokenName = "app.token";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const { setAuthenticated } = useGlobalState();
  const router = useRouter();

  useEffect(() => {
    checkCookie();
  }, []);

  async function signIn(
    { login, password }: signInTypes,
    loginSetLoading: React.Dispatch<React.SetStateAction<boolean>>
  ): Promise<boolean> {
    loginSetLoading(true);
    const { data }: AxiosResponseHeaders = await api.post("/auth", {
      login,
      password
    });
    console.log(data);

    if (data.access_token) {
      setCookie(undefined, tokenName, data.access_token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/"
      });
      setAuthenticated(true);
      loginSetLoading(false);
      router.push("/");
      return true;
    } else {
      loginSetLoading(false);
      return false;
    }
  }

  async function checkCookie() {
    const { [tokenName]: token } = parseCookies();
    if (token) {
      setAuthenticated(true);
    } else {
      router.push("/login");
    }
  }

  function signOut() {
    setAuthenticated(false);
    destroyCookie(undefined, tokenName);
    router.push("/login");
  }

  return <AuthContext.Provider value={{ signIn, signOut }}>{children}</AuthContext.Provider>;
}
