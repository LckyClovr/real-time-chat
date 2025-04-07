import { ChatContextProvider } from "../_components/ChatContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ChatContextProvider>{children}</ChatContextProvider>;
}
