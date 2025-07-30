import { tokenName } from "@/contexts/AuthContext";
import axios, { InternalAxiosRequestConfig } from "axios";
import { parseCookies } from "nookies";

const api = axios.create({
  baseURL: "http://localhost:3000"
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { [tokenName]: token } = parseCookies();

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
