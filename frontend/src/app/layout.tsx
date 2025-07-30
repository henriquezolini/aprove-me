"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { MessageProvider } from "@/contexts/MessageConext";
import "@ant-design/v5-patch-for-react-19";
import "@/styles/index.scss";

const queryCliente = new QueryClient();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div id="__next">
          <QueryClientProvider client={queryCliente}>
            <MessageProvider>
              <AuthProvider>{children}</AuthProvider>
            </MessageProvider>
          </QueryClientProvider>
        </div>
      </body>
    </html>
  );
}
